// Offline checks only. All networking, notifications and persistence are mocked.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const scripts = path.resolve(__dirname, '../js');
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions++; }
async function run(name, {url = 'https://example.invalid/', body = '{}', headers = {}, argument,
  status = 200, store = {}, httpBody = '{}', httpError = null} = {}) {
  const done = [], notifications = [], network = [];
  const context = {
    $request: {url, headers, body}, $response: {status, body},
    $environment: {'surge-version': '6.11.0', system: 'iOS'},
    $persistentStore: {read: key => store[key] ?? null, write: (value, key) => (store[key] = value, true)},
    $notification: {post: (...args) => notifications.push(args)},
    $httpClient: Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [method,
      (options, callback) => {network.push(options); callback(httpError, {status:200, headers:{}}, httpBody);} ])),
    $done: result => done.push(result), console: {log(){}},
    setTimeout, clearTimeout, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer
  };
  if (argument !== undefined) context.$argument = argument;
  vm.createContext(context);
  const scriptFile = name === 'JD_Price'
    ? path.resolve(__dirname, '../../kelee-JDPrice/js/JD_Price.js')
    : path.join(scripts, name + '.js');
  vm.runInContext(fs.readFileSync(scriptFile, 'utf8'), context, {timeout: 1500});
  for (let i = 0; i < 15; i++) await Promise.resolve();
  check(done.length === 1, `${name}: expected one $done, got ${done.length}`);
  return {result: done[0], notifications, store, network, context};
}
(async () => {
  const ops = ['integration.activityBanner', 'memberInfo.getMemberQa', 'newHomePage.initData', 'newHomePageBussData', 'paySuccBuss.bussEntryShow'];
  for (const op of ops) {
    const r = await run('12306_remove_ads', {headers: {'oPeRaTiOn-TyPe': 'com.cars.otsmobile.' + op}});
    check(r.result.abort === true, '12306 matched operation must abort');
  }
  for (const headers of [{}, {'Operation-Type':'com.cars.ticket.buy'}]) {
    const r = await run('12306_remove_ads', {headers}); check(!r.result.abort, '12306 normal operation passes');
  }
  for (const value of ['1000002', 'prefix1000019suffix']) {
    const r = await run('Umetrip_remove_ads', {headers: {rPiD: value}});
    check(r.result.response?.status === 404, 'Umetrip ad must return404');
  }
  check(!(await run('Umetrip_remove_ads')).result.response, 'Umetrip missing header passes');

  const jd = await run('JD_remove_ads', {url:'https://api.m.jd.com/client.action?functionId=deliverLayer',
    body:JSON.stringify({bannerInfo:{ad:1}, floors:[{mId:'banner'},{mId:'jdDeliveryBanner'},{mId:'tracking'}]})});
  const jo = JSON.parse(jd.result.body);
  check(!jo.bannerInfo && jo.floors.length === 1 && jo.floors[0].mId === 'tracking', 'JD preserves tracking');
  const red = await run('RedPaper_remove_ads', {url:'https://edith.xiaohongshu.com/api/sns/v6/homefeed?',
    body:JSON.stringify({data:[{id:'normal'},{id:'ad',ads_info:{}},{model_type:'live_v2'}]})});
  check(JSON.parse(red.result.body).data.length === 1, 'RedPaper normal card survives');
  const tao = await run('Taobao_remove_ads', {url:'https://guide-acs.m.taobao.com/gw/mtop.taobao.cloudvideo.video.query',
    body:JSON.stringify({data:{duration:'30', resources:[1],caches:[1]}})});
  check(JSON.parse(tao.result.body).data.duration === '0', 'Taobao splash disabled');
  const cx = await run('CaixinMedia_remove_ads', {url:'https://entities.caixin.com/api/dataplus/columns',
    body:JSON.stringify({data:[{title:'news',buttonText:'buy',buyUrl:'ad'}]})});
  check(JSON.parse(cx.result.body).data[0].title === 'news' && !JSON.parse(cx.result.body).data[0].buyUrl, 'Caixin preserves news');
  for (const name of ['JD_remove_ads','RedPaper_remove_ads','CaixinMedia_remove_ads','NetEaseGodlike_remove_ads']) {
    for (const body of ['', '<html>upstream error</html>']) {
      const r = await run(name, {body}); check(!r.result.body, name + ' malformed response passes');
    }
  }
  const ne = await run('NetEaseGodlike_remove_ads', {url:'https://app-conf.ds.163.com/v1/app/base/conf/static/start-config?v=1&os=ios',
    body:JSON.stringify({result:{updateConfig:[{module:'APP设置',itemList:[]},{module:'推广'}]}})});
  check(JSON.parse(ne.result.body).result.updateConfig.length === 1, 'NetEase accepts reordered parameters');

  const markup = '<div class="keep">Keep</div><div class="index_gif-container"><div>Ad</div></div>' +
    '<script id="__NEXT_DATA__" type="application/json">' + JSON.stringify({props:{pageProps:{serverData:[
      {key:'queryStationPackageInfo',value:'package'},{key:'fastBindCMobilePreCheck'},{key:'promotion'}]}}}) + '</script>';
  const pdd = await run('PinDuoDuo_remove_ads', {body:markup});
  check(pdd.result.body.includes('Keep') && !pdd.result.body.includes('index_gif-container') && !pdd.result.body.includes('promotion'), 'PDD preserves pickup data');
  const self = {webpackChunk_N_E:[]};
  vm.runInNewContext(fs.readFileSync(path.join(scripts,'../resources/PDD-9410.js'),'utf8'),{self},{timeout:1000});
  const modules = self.webpackChunk_N_E[0][1];
  check(Object.keys(modules).sort().join(',') === '27519,43435,53203,70242,75637,82115', 'PDD preserves original module IDs');
  for (const [id,key] of [[27519,'A'],[53203,'r']]) {
    const exports = {};
    const require = {d: (target, definitions) => Object.entries(definitions).forEach(([key,get]) => Object.defineProperty(target,key,{get}))};
    modules[id]({},exports,require);
    check(exports[key]() === null, 'PDD ad component renders nothing without missing-module errors');
  }
  const baidu = await run('BaiduSearchHomePage_remove_ads');
  check(baidu.result.body.includes('<html'), 'Baidu homepage returns HTML');
  const proto = await run('tieba-proto', {status:503, body:new Uint8Array()});
  check(!proto.result.body, 'Tieba non200 passes');
  const malformedProto = await run('tieba-proto', {url:'https://tiebac.baidu.com/c/f/frs/page?cmd=1&format=protobuf', body:new Uint8Array([255])});
  check(!malformedProto.result.body, 'Tieba invalid protobuf passes');
  const keep = {id:'text'}, video = {id:'video',videoInfo:{}}, live = {id:'live',alaInfo:{}};
  check(proto.context.removeThread([keep,video,live],false).length === 2, 'Tieba false keeps video');
  check(proto.context.removeThread([keep,video,live],true).length === 1, 'Tieba true drops video');

  const capture = await run('JD_Price', {url:'https://apapia-sqk-weblogic.manmanbuy.com/baoliao/center/menu', body:'dummy=TEST_ONLY'});
  check(capture.store.manmanbuy_val === 'dummy=TEST_ONLY', 'JD price captures request');
  check(!JSON.stringify(capture.notifications).includes('TEST_ONLY'), 'JD price notification does not echo token');
  check(capture.network.length === 0, 'JD capture does not call network');
  await run('JD_Price', {url:'https://in.m.jd.com/product/graphext/123.html',body:'<body>item</body>',httpBody:'{"ok":0,"msg":"test"}'});

  const html = data => '<script>var cgiData = ' + JSON.stringify(data) + ';</script>';
  const gray = await run('Weixin_external_links_unlock', {body:html({type:'gray',url:'https://example.com/?a=1&amp;b=2'})});
  check(gray.notifications[0][2] === 'https://example.com/?a=1&b=2', 'Weixin HTML entity decode');
  const redirect = await run('Weixin_external_links_unlock', {argument:'forceRedirect=true', body:html({type:'newgray',url:'https://example.com/你好'})});
  check(redirect.result.status === 302 && redirect.result.headers.Location.endsWith('/你好'), 'Weixin forceRedirect true works');
  for (const body of ['', '<html>new template</html>', html({type:'gray'}), '<script>var cgiData = invalid;</script>']) {
    await run('Weixin_external_links_unlock', {body});
  }
  const blocked = html({type:'block',btns:[{url:'https://weixin110.qq.com/newreadtemplate?a=1'}]});
  check((await run('Weixin_external_links_unlock',{body:blocked})).network.length === 0, 'Weixin missing exportkey passes');
  const withKey = html({type:'block',btns:[{url:'https://weixin110.qq.com/newreadtemplate?exportkey=test'}]});
  const decoded = await run('Weixin_external_links_unlock', {body:withKey, argument:'useCache=true',
    httpBody:JSON.stringify({btns:[{url:'https://x.invalid/?url='+encodeURIComponent(Buffer.from('https://example.com/').toString('base64'))}]})});
  check(decoded.result.status === 302 && decoded.result.headers.Location.startsWith('https://web.archive.org/'), 'Weixin blocked link cache result');
  await run('Weixin_external_links_unlock', {body:withKey,httpError:'offline'});
  console.log(JSON.stringify({assertions, result:'PASS', live_network_calls:0}));
})().catch(error => {console.error(error);process.exitCode=1;});
