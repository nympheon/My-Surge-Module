'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');

// Split delimiters only outside quotes; retain regex backslashes and quoted jq verbatim.
function splitQuoted(text, delimiter = ' ') {
  const fields = [];
  let quote = '', token = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ((c === '"' || c === "'") && text[i - 1] !== '\\') {
      if (!quote) quote = c;
      else if (quote === c) quote = '';
      token += c;
    } else if (!quote && (delimiter === ' ' ? /\s/.test(c) : c === delimiter)) {
      if (token.trim()) fields.push(token.trim());
      token = '';
    } else token += c;
  }
  if (quote) throw new Error('Unterminated quote: ' + text);
  if (token.trim()) fields.push(token.trim());
  return fields;
}
function parseModule(name) {
  const filename = name.endsWith('.sgmodule') ? name : `${name}/${name}.sgmodule`;
  const sections = {};
  let section, ids = [];
  fs.readFileSync(path.resolve(root, filename), 'utf8').split(/\r?\n/).forEach((line, index) => {
    if (/^\[.+\]$/.test(line)) { section = line.slice(1, -1); sections[section] ||= []; ids = []; }
    else if (line.startsWith('#')) { ids.push(...(line.match(/S\d{4}/g) || [])); }
    else if (line.trim() && section) {
      const entry = { line: index + 1, text: line, ids, tokens: splitQuoted(line) };
      if (section === 'Script') {
        const equals = line.indexOf('=');
        entry.name = line.slice(0, equals).trim();
        entry.options = Object.fromEntries(splitQuoted(line.slice(equals + 1), ',').map(part => {
          const position = part.indexOf('=');
          return [part.slice(0, position).trim(), part.slice(position + 1).trim().replace(/^([\"'])(.*)\1$/, '$2')];
        }));
      }
      (sections[section] ||= []).push(entry); ids = [];
    }
  });
  return sections;
}
function sourceActiveLines(name) {
  return fs.readFileSync(path.join(root, 'references/moyu-independent', name + '.conf'), 'utf8')
    .split(/\r?\n/).flatMap((text, index) => /^\^|^host(?:-suffix)?,|^ip(?:-cidr)?,/i.test(text.trim())
      ? [{ id: 'S' + String(index + 1).padStart(4, '0'), text: text.trim(), pattern: text.split(' url ')[0] }] : []);
}
function runJq(expression, body) {
  const result = spawnSync('jq', ['-c', expression], { input: typeof body === 'string' ? body : JSON.stringify(body), encoding: 'utf8', timeout: 5000 });
  if (result.status !== 0) throw new Error(result.stderr || 'jq failed');
  return result.stdout.trim();
}
// Only Surge globals are simulated; the owned script itself executes unchanged in an isolated VM.
function runScript(relativePath, globals = {}) {
  const capture = process.env.SURGE_JSC_CAPTURE_DIR;
  const encode = capture ? require('../native-jsc.cjs').encodeBoundary : null;
  const before = capture ? encode(globals) : null;
  const calls = [];
  const context = { ...globals, $done: value => calls.push(value) };
  vm.createContext(context);
  // Surge provides a realm-local Uint8Array. Recreate only the binary body, including
  // the supplied view's bounds, while retaining the established globals signature.
  const inputBody = globals.$response?.body;
  if (ArrayBuffer.isView(inputBody) && Object.prototype.toString.call(inputBody) === '[object Uint8Array]') {
    context.$response = { ...globals.$response, body: vm.runInContext(
      `new Uint8Array(${JSON.stringify(Array.from(inputBody))})`, context, { timeout: 1000 }) };
  }
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), context, { timeout: 1000 });
  if (calls.length !== 1) throw new Error(`Expected one $done, got ${calls.length}`);
  const result = JSON.parse(JSON.stringify(calls[0]));
  if (ArrayBuffer.isView(calls[0]?.body) && Object.prototype.toString.call(calls[0].body) === '[object Uint8Array]') {
    result.body = Uint8Array.from(calls[0].body);
  }
  if (capture) fs.appendFileSync(path.join(capture, process.pid + '.jsonl'), JSON.stringify({path:relativePath,globals:before,expected:encode(calls[0])}) + '\n');
  return result;
}
// Isolated full config, never a current-profile API. %APPEND% is resolved as module installation does.
function validateSurge(names) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'surge-independent-'));
  try {
    const merged = {};
    for (const name of names) {
      for (const [section, entries] of Object.entries(parseModule(name))) {
        (merged[section] ||= []).push(...entries.map(entry => entry.text));
      }
    }
    const mitm = (merged.MITM || []).flatMap(line => line.replace(/^hostname\s*=\s*/, '').replace(/%APPEND%,?\s*/g, '').split(/,\s*/));
    delete merged.MITM;
    (merged.Rule ||= []).push('FINAL,DIRECT');
    const content = '[General]\nloglevel = notify\n\n' + Object.entries(merged).map(([section, lines]) => `[${section}]\n${lines.join('\n')}\n`).join('\n') +
      '\n[MITM]\nhostname = ' + [...new Set(mitm)].join(', ') + '\n';
    const filename = path.join(directory, 'validation.conf');
    fs.writeFileSync(filename, content);
    const result = spawnSync('/Applications/Surge.app/Contents/Applications/surge-cli', ['--check', filename], { encoding: 'utf8', timeout: 15000 });
    if (result.status !== 0) throw new Error(result.stdout + result.stderr);
    return result.stdout + result.stderr;
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}
module.exports = { root, splitQuoted, parseModule, sourceActiveLines, runJq, runScript, validateSurge };
