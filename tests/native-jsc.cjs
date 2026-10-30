'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');

// Tag every node: user JSON cannot collide with a private bytes/undefined marker.
// This makes a detached, pre-execution snapshot, including a view's own bounds.
function encodeBoundary(value) {
  if (value === undefined) return ['undefined'];
  if (ArrayBuffer.isView(value) && Object.prototype.toString.call(value) === '[object Uint8Array]') return ['bytes', Array.from(value)];
  if (Array.isArray(value)) return ['array', value.map(encodeBoundary)];
  if (value !== null && typeof value === 'object') return ['object', Object.entries(value).map(([key,item]) => [key,encodeBoundary(item)])];
  if (value === null || ['string','number','boolean'].includes(typeof value)) return ['value', value];
  throw new Error('Unsupported fixture boundary type: ' + typeof value);
}
function replayFixtures(fixtures) {
  assert.ok(fixtures.length, 'No owned-script fixtures captured');
  const input = fixtures.map(fixture => ({...fixture, source:fs.readFileSync(path.join(root, fixture.path),'utf8')}));
  const result = spawnSync('/usr/bin/swift', [path.join(__dirname,'helpers/jsc-runner.swift')], {
    input:JSON.stringify(input), encoding:'utf8', timeout:60000, maxBuffer:128 * 1024 * 1024,
    env:{...process.env, CLANG_MODULE_CACHE_PATH:path.join(os.tmpdir(),'surge-jsc-clang-cache'), SWIFT_MODULECACHE_PATH:path.join(os.tmpdir(),'surge-jsc-swift-cache')}
  });
  assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
  const outputs = JSON.parse(result.stdout);
  assert.equal(outputs.length, fixtures.length, 'JSC lost fixture outputs');
  fixtures.forEach((fixture,index) => assert.deepEqual(outputs[index], fixture.expected, `JSC output mismatch: ${fixture.path} fixture ${index}`));
  return {count:fixtures.length, scripts:[...new Set(fixtures.map(f => f.path))].sort()};
}
function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(),'surge-jsc-fixtures-'));
  try {
    const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.test.js')).sort().map(file => path.join(__dirname,file));
    const capture = spawnSync(process.execPath, ['--test', ...files], {
      cwd:root, encoding:'utf8', timeout:60000, maxBuffer:16 * 1024 * 1024,
      env:{...process.env,SURGE_JSC_CAPTURE_DIR:directory}
    });
    assert.equal(capture.status, 0, capture.error?.message || capture.stdout + capture.stderr);
    const fixtures = fs.readdirSync(directory).sort().flatMap(file => fs.readFileSync(path.join(directory,file),'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)));
    const result = replayFixtures(fixtures);
    // Discovery from actual module files prevents an accidentally untested owned script.
    const {parseModule} = require('./helpers');
    const required = (parseModule('MoyuAds').Script || []).map(entry => new URL(entry.options['script-path']).pathname.split('/main/')[1]);
    for (const script of required) assert.ok(result.scripts.includes(script), `No behavioral fixture captured for ${script}`);
    console.log(`PASS native JavaScriptCore: ${result.count} captured behavioral calls across ${result.scripts.length} owned scripts`);
    result.scripts.forEach(script => console.log(`  ${script}: ${fixtures.filter(f => f.path === script).length} calls`));
  } finally { fs.rmSync(directory,{recursive:true,force:true}); }
}
module.exports = {encodeBoundary,replayFixtures};
if (require.main === module) main();
