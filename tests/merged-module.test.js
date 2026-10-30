'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {root, parseModule, validateSurge} = require('./helpers');
const manifest = require('../references/moyu-independent/manifest.json');
const names = manifest.modules.map(m => m.name);
const base = '74662af52b4a2c581aef34e17cbbb7fe030b06ff';
const prefix = 'https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/';
const original = file => execFileSync('git', ['show', `${base}:${file}`], {cwd:root});
// Independent baseline reader: no actual-module parser is used for expectations.
function oldSections(name) {
  const sections = {}; let section;
  for (const line of original(`${name}/${name}.sgmodule`).toString().split(/\r?\n/)) {
    if (/^\[.+\]$/.test(line)) {section=line.slice(1,-1); sections[section]=[];}
    else if (section && line.trim() && !line.startsWith('#')) sections[section].push(line);
  }
  return sections;
}
test('one installable MoyuAds artifact replaces all eight separate entries', () => {
  assert.ok(fs.existsSync(path.join(root,'MoyuAds/MoyuAds.sgmodule')), 'merged module missing');
  for (const name of names) assert.ok(!fs.existsSync(path.join(root,name)), `old entry still published: ${name}`);
  const content=fs.readFileSync(path.join(root,'MoyuAds/MoyuAds.sgmodule'),'utf8');
  const headings=content.match(/^\[.+\]$/gm);
  assert.equal(new Set(headings).size, headings.length, 'duplicate native section');
});
test('merged runtime preserves baseline predicates, jq bytes, stages and within-section ordering', () => {
  const actual=parseModule('MoyuAds');
  for (const section of ['Rule','URL Rewrite','Map Local','Body Rewrite','Script']) {
    const expected=names.flatMap(name => (oldSections(name)[section]||[]).map(text => ({
      source:name, text:text.replace(/\/main\/[^/]+\/js\//g,'/main/MoyuAds/js/')
    })));
    assert.deepEqual(actual[section].map(e => ({source:e.source,text:e.text})), expected, section);
  }
});
test('merged MITM is exactly the previous host union with one append assignment', () => {
  const hosts=line => line.replace(/^hostname\s*=\s*%APPEND%\s*/, '').split(/,\s*/);
  const expected=[...new Set(names.flatMap(name => oldSections(name).MITM.flatMap(hosts)))];
  const entries=parseModule('MoyuAds').MITM;
  assert.equal(entries.length,1);
  assert.match(entries[0].text,/^hostname = %APPEND% /);
  assert.deepEqual(hosts(entries[0].text),expected);
  assert.ok(!expected.includes('*'));
});
test('five owned scripts retain original bytes and all seven original declarations', () => {
  const module=parseModule('MoyuAds');
  assert.equal(module.Script.length,7);
  for (const entry of module.Script) assert.ok(entry.options['script-path'].startsWith(prefix+'MoyuAds/js/'));
  const paths=[...new Set(module.Script.map(e => e.options['script-path'].slice(prefix.length)))].sort();
  assert.deepEqual(paths,fs.readdirSync(path.join(root,'MoyuAds/js')).map(f => 'MoyuAds/js/'+f).sort());
  const map={'amdc.js':['AmapAds','CainiaoAds','GoofishAds'],'applet.js':['Applet'],'bus.js':['Applet'],'chelaile.js':['CheLaiLeAds'],'tieba-proto.js':['TieBaAds']};
  assert.equal(paths.length,5);
  for (const [file,owners] of Object.entries(map)) for (const owner of owners) {
    assert.deepEqual(fs.readFileSync(path.join(root,'MoyuAds/js',file)),original(`${owner}/js/${file}`),`${owner}/${file}`);
  }
});
test('existing StartUpAds and kelee runtime files retain their published bytes', () => {
  const folders=['StartUpAds','kelee','kelee-HTTPDNS','kelee-JDPrice'];
  const files=execFileSync('git',['ls-tree','-rz','--name-only',base,'--',...folders],{cwd:root}).toString().split('\0').filter(Boolean);
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(root,file)),original(file),file);
});
test('actual merged artifact parses alone and with StartUpAds in native Surge', () => {
  assert.match(validateSurge(['MoyuAds']),/OK|valid/i);
  assert.match(validateSurge(['StartUpAds','MoyuAds']),/OK|valid/i);
});
