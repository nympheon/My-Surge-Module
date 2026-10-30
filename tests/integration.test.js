'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {root, parseModule, sourceActiveLines, validateSurge, runScript} = require('./helpers');
const manifest = require('../references/moyu-independent/manifest.json');
const names = ['StartUpAds', ...manifest.modules.map(m => m.name)];
const base = '63268de8cb9b433b04878999dacf1e2965a12d2b';
const entries = (name, section) => parseModule(name)[section] || [];
const ownedPath = entry => new URL(entry.options['script-path']).pathname.split('/main/')[1];
for (const name of names) test(`${name}: standalone native Surge validation`, () => {
  assert.match(validateSurge([name]), /OK|configuration.*valid/i);
});
test('all nine modules coexist in a native Surge full configuration', () => {
  assert.match(validateSurge(names), /OK|configuration.*valid/i);
});
test('96 selected source actions are accounted once; frozen SHA-256 identities hold', () => {
  let total = 0;
  for (const module of manifest.modules) {
    const raw = fs.readFileSync(path.join(root, 'references/moyu-independent', module.name + '.conf'));
    assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), module.sha256, module.name);
    const source = sourceActiveLines(module.name);
    assert.equal(source.length, module.active_lines);
    total += source.length;
    assert.deepEqual(Object.values(parseModule(module.name)).flat().flatMap(e => e.ids).sort(), source.map(e => e.id).sort(), module.name);
  }
  assert.equal(total, 96);
  for (const script of manifest.scripts) {
    const raw = fs.readFileSync(path.join(root, 'references/moyu-independent/scripts', script.name));
    assert.equal(raw.length, script.bytes, script.name);
    assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), script.sha256, script.name);
  }
});
test('original-author MIT notice retains its verified upstream blob identity', () => {
  const raw = fs.readFileSync(path.join(root,'references/moyu-independent/scripts/tieba-proto.LICENSE.md'));
  const hash = crypto.createHash('sha1').update(Buffer.from(`blob ${raw.length}\0`)).update(raw).digest('hex');
  assert.equal(hash, 'd448042e50096ce6482b86199249f543951e051b');
});
test('20 actual StartUpAds blobs remain byte-identical to the published base', () => {
  const listing = spawnSync('git', ['ls-tree', '-rz', '--name-only', base, '--', 'StartUpAds'], {cwd:root});
  assert.equal(listing.status, 0, listing.stderr.toString());
  const files = listing.stdout.toString().split('\0').filter(Boolean);
  assert.equal(files.length, 20);
  const current = spawnSync('git', ['ls-files', '-z', '--', 'StartUpAds'], {cwd:root});
  assert.equal(current.status, 0);
  assert.deepEqual(current.stdout.toString().split('\0').filter(Boolean), files);
  for (const file of files) {
    const original = spawnSync('git', ['show', `${base}:${file}`], {cwd:root});
    assert.equal(original.status, 0, original.stderr.toString());
    assert.deepEqual(fs.readFileSync(path.join(root, file)), original.stdout, file);
  }
});
test('every runtime resource is module-owned and no owned JS is orphaned', () => {
  for (const name of names) {
    const paths = entries(name, 'Script').map(entry => {
      assert.ok(entry.options['script-path'].startsWith(`https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/${name}/js/`));
      const relative = ownedPath(entry);
      assert.equal(path.normalize(relative), relative);
      assert.ok(fs.statSync(path.join(root, relative)).isFile());
      return relative;
    });
    const directory = path.join(root, name, 'js');
    const files = fs.existsSync(directory) ? fs.readdirSync(directory).map(file => `${name}/js/${file}`) : [];
    assert.deepEqual([...new Set(paths)].sort(), files.sort(), name);
    for (const mitm of entries(name, 'MITM')) {
      assert.match(mitm.text, /^hostname\s*=\s*%APPEND%/);
      assert.ok(!mitm.text.replace(/^hostname\s*=\s*%APPEND%\s*/, '').split(/,\s*/).includes('*'));
    }
  }
});
for (const ua of ['AMap','Cainiao','%E9%97%B2%E9%B1%BC','%E9%A3%9E%E7%8C%AA%E6%97%85%E8%A1%8C','%E5%96%B5%E8%A1%97','%E5%A4%A9%E7%8C%AB','Alibaba','MovieApp','Hema4iPhone','Moon','DMPortal','amap','Other',undefined,7]) {
  test(`AMDC first matching module produces equivalent output: UA ${ua}`, () => {
    const url = 'http://amdc.m.taobao.com/amdc/mobileDispatch';
    const expected = typeof ua === 'string' && !['amap','Other'].includes(ua)
      ? {response:{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'},body:'ddgksf2013'}} : {};
    for (const name of ['StartUpAds','AmapAds','CainiaoAds','GoofishAds']) {
      const matches = entries(name, 'Script').filter(e => new RegExp(e.options.pattern).test(url));
      assert.equal(matches.length, 1, name);
      assert.deepEqual(runScript(ownedPath(matches[0]), {$request:{url, headers:{'uSeR-aGeNt':ua}}}), expected);
    }
  });
}
for (const [name, urls] of [
  ['TieBaAds', ['https://tiebac.baidu.com/c/f/ad/getFeedAd']],
  ['CainiaoAds', ['https://cn-acs.m.cainiao.com/gw/mtop.cainiao.guoguo.nbnetflow.ads.show.cn/1.0', 'https://cn-acs.m.cainiao.com/gw/mtop.cainiao.guoguo.nbnetflow.ads.mshow.cn/1.0']],
  ['GoofishAds', ['https://acs.m.goofish.com/gw/mtop.taobao.idlehome.splash.ads/1.0']]
]) for (const url of urls) test(`duplicate empty-200 response agrees: ${url}`, () => {
  for (const module of ['StartUpAds', name]) {
    const matches = entries(module, 'Map Local').filter(e => new RegExp(e.tokens[0]).test(url));
    assert.ok(matches.length > 0, module);
    for (const entry of matches) assert.deepEqual(entry.tokens.slice(1), ['data-type=text','data=""']);
  }
});
test('legacy public-account replacement is idempotent in both module orders', () => {
  for (const order of [['StartUpAds','Applet'], ['Applet','StartUpAds']]) {
    let body = '{"advertisement":{"id":1},"message":"keep"}';
    for (const name of order) {
      const matching = entries(name,'Body Rewrite').filter(e => e.tokens[0] === 'http-response' && new RegExp(e.tokens[1]).test('https://mp.weixin.qq.com/mp/getappmsgad?x=1'));
      assert.equal(matching.length, 1);
      body = body.replace(new RegExp(matching[0].tokens[2], 'g'), matching[0].tokens[3]);
      assert.equal(body, '{"ddgksf2013":{"id":1},"message":"keep"}');
    }
  }
});
test('overlapping Goofish domain rejection keeps the same policy', () => {
  for (const name of ['StartUpAds','GoofishAds']) {
    const matching = entries(name,'Rule').filter(e => /^DOMAIN-SUFFIX,iyes\.youku\.com,/.test(e.text));
    assert.equal(matching.length, 1);
    assert.equal(matching[0].text, 'DOMAIN-SUFFIX,iyes.youku.com,REJECT');
  }
});
// A lossy JSON bridge would turn bounded bytes into an object and drop undefined.
test('JSC bridge snapshots undefined and byte-view bounds before later mutation', () => {
  const {encodeBoundary} = require('./native-jsc.cjs');
  const bytes = new Uint8Array([99,18,3,162,7,0,88]);
  const encoded = encodeBoundary({$response:{body:bytes.subarray(1,6)}, TextDecoder:undefined});
  bytes[1] = 0;
  assert.deepEqual(encoded, ['object', [
    ['$response',['object',[['body',['bytes',[18,3,162,7,0]]]]]], ['TextDecoder',['undefined']]
  ]]);
});
test('native JSC bridge executes owned binary script and rejects mismatched output', () => {
  const {encodeBoundary,replayFixtures} = require('./native-jsc.cjs');
  const fixture = {path:'TieBaAds/js/tieba-proto.js', globals:encodeBoundary({
    $request:{url:'https://tiebac.baidu.com/c/f/frs/page?cmd=1'},
    $response:{status:200,body:new Uint8Array([18,3,162,7,0])}, BigInt:undefined,TextDecoder:undefined
  }), expected:encodeBoundary({body:new Uint8Array([18,0])})};
  assert.equal(replayFixtures([fixture]).count, 1);
  assert.throws(() => replayFixtures([{...fixture,expected:encodeBoundary({})}]), /JSC output mismatch/);
});
