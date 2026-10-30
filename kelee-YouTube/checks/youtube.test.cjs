'use strict';
// Synthetic fixtures only: no HTTP client or Worker is contacted.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseModule, root } = require('../../tests/helpers');
const { encodeBoundary, replayFixtures } = require('../../tests/native-jsc.cjs');
const fixtures = [];
const vint = value => {
  let n = BigInt(value); const result = [];
  do { const b = Number(n & 127n); n >>= 7n; result.push(b | (n ? 128 : 0)); } while (n);
  return result;
};
const field = (no, bytes) => [...vint(BigInt(no) * 8n + 2n), ...vint(bytes.length), ...bytes];
const str = (no, text) => field(no, [...Buffer.from(text)]);
function fields(bytes) {
  const result = []; let pos = 0;
  const read = () => { let n = 0n, shift = 0n, b; do { b = bytes[pos++]; assert.notEqual(b, undefined); n |= BigInt(b & 127) << shift; shift += 7n; } while (b & 128); return n; };
  while (pos < bytes.length) {
    const start = pos, tag = read(), wire = Number(tag & 7n), no = Number(tag >> 3n);
    let data;
    if (wire === 2) { const length = Number(read()); data = bytes.slice(pos, pos + length); pos += length; }
    else if (wire === 0) { const begin = pos; read(); data = bytes.slice(begin, pos); }
    else throw new Error('Unsupported fixture wire ' + wire);
    result.push({ no, wire, data: Array.from(data), raw: Array.from(bytes.slice(start, pos)) });
  }
  return result;
}
function run(direction, { url = 'https://youtubei.googleapis.com/youtubei/v1/player', body = [],
  status = 200, headers = { 'User-Agent': 'YouTube/fixture' }, argument = '{"captionLang":"off"}', store = {} } = {}) {
  const relative = `kelee-YouTube/js/YouTube_remove_ads_${direction}.js`;
  const filename = path.join(root, relative);
  assert.ok(fs.existsSync(filename), 'owned YouTube script is present: ' + direction);
  const done = [];
  const globals = { $request: { url, headers }, $argument: argument };
  if (direction === 'response') globals.$response = { status };
  const target = direction === 'request' ? globals.$request : globals.$response;
  if (body !== undefined) target.body = Uint8Array.from(body);
  const before = encodeBoundary(globals);
  const setup = `var fixtureStore = ${JSON.stringify(store)};
    var $persistentStore = {read:function(k){return fixtureStore[k] || null;},write:function(v,k){fixtureStore[k]=v;return true;}};
    var console = {log:function(){}}; var $notification = {post:function(){}};`;
  const source = setup + '\n' + fs.readFileSync(filename, 'utf8');
  const context = { ...globals, $done: value => done.push(value) };
  vm.createContext(context);
  context.fixtureBytes = body;
  if (body !== undefined) vm.runInContext(`${direction === 'request' ? '$request' : '$response'}.body = new Uint8Array(fixtureBytes);`, context);
  vm.runInContext(source, context, { timeout: 1500 });
  assert.equal(done.length, 1, 'exactly one completion');
  fixtures.push({ path: relative, globals: before, expected: encodeBoundary(done[0]), setup });
  return { result: done[0], store: context.fixtureStore };
}

test('YouTube module uses owned binary scripts and stays separate from kelee', () => {
  assert.ok(fs.existsSync(path.join(root, 'kelee-YouTube/kelee-YouTube.sgmodule')), 'independent module is present');
  const module = parseModule('kelee-YouTube');
  assert.equal(module.Script.length, 3);
  for (const entry of module.Script) {
    assert.equal(entry.options['binary-body-mode'], 'true');
    assert.equal(entry.options['requires-body'], 'true');
    assert.ok(entry.options['script-path'].startsWith('https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee-YouTube/js/'));
    const argument = entry.options.argument.replaceAll('{{{CaptionLang}}}', 'zh-Hans')
      .replace(/\{\{\{(?:BlockUpload|BlockShorts|BlockImmersive)\}\}\}/g, 'false');
    assert.deepEqual(JSON.parse(argument), { captionLang: 'zh-Hans', blockUpload: false, blockImmersive: false, blockShorts: false });
  }
  assert.ok(!parseModule('kelee').Script.some(entry => /youtube/i.test(entry.name)));
});
test('YouTube player drops ad messages and retains unrelated opaque data', () => {
  const opaque = field(500, [0, 255, 128, 34]);
  const integer = [...vint(501n * 8n), ...vint(9007199254740993123n)];
  const input = [...field(2, []), ...field(7, []), ...field(68, []), ...opaque, ...integer];
  const output = fields(run('response', { body: input }).result.body);
  assert.ok(!output.some(x => x.no === 7 || x.no === 68));
  assert.deepEqual(output.find(x => x.no === 500).raw, opaque);
  assert.deepEqual(output.find(x => x.no === 501).raw, integer);
});
test('YouTube guide reads Surge JSON string arguments and preserves ordinary entries', () => {
  const item = name => field(1, field(318370163, str(1, name)));
  const input = field(4, field(117866661, [...item('FEuploads'), ...item('FEshorts'), ...item('FEhome')]));
  const result = run('response', { url: 'https://youtubei.googleapis.com/youtubei/v1/guide', body: input,
    argument: '{"blockUpload":true,"blockShorts":false,"blockImmersive":false,"captionLang":"off"}' }).result;
  const values = fields(fields(fields(result.body)[0].data)[0].data).map(x =>
    Buffer.from(fields(fields(x.data)[0].data)[0].data).toString());
  assert.deepEqual(values, ['FEshorts', 'FEhome']);
});
test('YouTube matched initplayback retains the approved Worker redirect and parameters', () => {
  const url = 'https://rr1---fixture.googlevideo.com/initplayback?source=youtube&ack=1';
  const store = { YouTubeConfig: JSON.stringify({ youtube: { clientKey: 'fixture-client', encryptKey: 'AQID' } }) };
  const result = run('request', { url, body: field(3, field(5, [1, 2, 3])), store,
    argument: '{"captionLang":"zh-Hans"}' }).result;
  const redirect = new URL(result.url);
  assert.equal(redirect.origin, 'https://init-stream.maasea.workers.dev');
  assert.equal(redirect.searchParams.get('ck'), 'fixture-client');
  assert.equal(redirect.searchParams.get('target'), url);
  assert.equal(redirect.searchParams.get('captionLang'), 'zh-Hans');
});
test('YouTube mismatched keys return source fallback and clear stale config', () => {
  const url = 'https://rr1---fixture.googlevideo.com/initplayback?x=1&ack=1';
  const r = run('request', { url, body: field(3, field(5, [9])), store: {
    YouTubeConfig: JSON.stringify({ youtube: { clientKey: 'fixture', encryptKey: 'AQID' } }) } });
  assert.equal(r.result.response.status, 200);
  assert.equal(r.result.response.body.length, 0);
  assert.equal(JSON.parse(r.store.YouTubeConfig).youtube, undefined);
});
test('YouTube log_event drops only compression and unavailable hot hash headers', () => {
  const headers = { 'User-Agent': 'YouTube/fixture', 'Content-Encoding': 'gzip',
    'X-YouTube-Hot-Hash-Data': 'fixture-hash', 'X-Keep': 'normal' };
  const r = run('request', { url: 'https://youtubei.googleapis.com/youtubei/v1/log_event', headers }).result;
  assert.deepEqual(JSON.parse(JSON.stringify(r.headers)), { 'User-Agent': 'YouTube/fixture', 'X-Keep': 'normal' });
});
test('YouTube malformed bodies and state complete without modifying the request or response', () => {
  for (const body of [[255], [26, 100, 1]]) {
    assert.deepEqual(Object.keys(run('response', { body }).result), []);
    assert.deepEqual(Object.keys(run('request', {
      url: 'https://rr1---fixture.googlevideo.com/initplayback?x=1&ack=1', body,
      store: { YouTubeConfig: JSON.stringify({ youtube: { clientKey: 'fixture', encryptKey: 'AQID' } }) }
    }).result), []);
  }
  assert.deepEqual(Object.keys(run('request', { headers: {} }).result), []);
  assert.deepEqual(Object.keys(run('request', { store: { YouTubeConfig: 'invalid' } }).result), []);
  assert.deepEqual(Object.keys(run('response', { status: 503, body: [...field(2, []), ...field(7, [])] }).result), []);
});
test('YouTube behavior also executes in native JavaScriptCore without Node APIs', () => {
  assert.ok(fixtures.length >= 10);
  const result = replayFixtures(fixtures);
  assert.equal(result.scripts.length, 2);
});
