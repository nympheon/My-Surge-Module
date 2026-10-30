'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { root, runScript, sourceActiveLines, parseSource: parseModule, runJq, validateSurge } = require('./helpers');
const { decode, original } = require('./helpers/tieba-oracle');
const script = 'MoyuAds/js/tieba-proto.js';
// Hand-built wire fixtures: no production/schema generator builds expectations.
const join = (...parts) => Uint8Array.from(parts.flatMap(p => Array.from(p)));
function v(n) { const out=[]; do {out.push(n % 128 + (n >= 128 ? 128 : 0)); n=Math.floor(n/128);} while(n); return out; }
const scalar = (id,n) => join(v(id*8),v(n));
const msg = (id,...parts) => {const b=join(...parts); return join(v(id*8+2),v(b.length),b);};
const str = (id,s) => msg(id,Buffer.from(s));
const data = (...parts) => msg(2,...parts);
const huge = join(v(99*8),[255,255,255,255,255,255,255,255,255,1]);
const fixed = join(v(100*8+1),[1,2,3,4,5,6,7,8],v(101*8+5),[9,10,11,12]);
const unknown = join(huge,fixed,msg(102,[255,0,128]));
const goods = msg(30,scalar(1,7));
const liveAd = msg(38,msg(1,scalar(1,0)));
const app = msg(1,unknown,goods,liveAd);
const appClean = msg(1,unknown,liveAd);
const video = msg(79,str(1,'keep video'));
const url = (endpoint,cmd='1') => `https://tiebac.baidu.com/c/f/${endpoint}?cmd=${cmd}`;
function run(body,endpoint,cmd='1',extra={}) {
  return runScript(script, {$request:{url:url(endpoint,cmd)},$response:{status:200,body},BigInt:undefined,TextDecoder:undefined,...extra});
}
function check(name, endpoint, cmd, input, expected, type, argument='') {
  test(name,()=>{
    const result = run(input,endpoint,cmd,{$argument:argument});
    assert.ok(result.body instanceof Uint8Array, 'modified response must keep binary transport');
    assert.deepEqual(result.body, expected);
    assert.deepEqual(decode(type,result.body),original(input,url(endpoint,cmd),type,argument));
  });
}
const liveFeed=msg(2,msg(2,msg(5,str(1,'is_live_card'),str(2,'1'))));
const normalFeed=msg(2,unknown,msg(2,msg(5,str(1,'is_live_card'),str(2,'0'))));
check('frs page removes all selected ads, retaining video, normal cards and exact unknown bytes','frs/page','1',
  join(unknown,data(msg(2,msg(33,app,msg(5,goods,liveAd))),msg(7,unknown,video),msg(7,msg(113,scalar(1,0))),msg(7,unknown),msg(23,scalar(13,1)),msg(116,str(1,'live')),msg(126,liveFeed,normalFeed),unknown)),
  join(unknown,data(msg(2,msg(33,appClean,msg(5,goods,liveAd))),msg(7,unknown,video),msg(7,unknown),msg(126,normalFeed),unknown)), 'FrsPageResIdl');
check('threadlist removes App goods only, preserving App liveAd and pbBannerAd','frs/threadlist','1',
  data(msg(3,app,msg(5,goods,liveAd)),unknown),data(msg(3,appClean,msg(5,goods,liveAd)),unknown),'ThreadListResIdl');
check('generalTabList removes goods from every app while preserving raw siblings','frs/generalTabList','1',
  data(msg(10,goods,liveAd,unknown),msg(10,unknown),unknown),data(msg(10,liveAd,unknown),msg(10,unknown),unknown),'GeneralTabListResIdl');
const postsInput=data(msg(12,app,msg(5,goods,liveAd,unknown)),msg(55,scalar(1,123)),msg(6,msg(54,scalar(1,7)),msg(67,str(1,'ad')),unknown),msg(6,unknown),unknown);
const postsClean=data(msg(12,appClean,msg(5,unknown)),msg(6,unknown),msg(6,unknown),unknown);
check('old post page removes goods, designated liveAd, live recommendation, outerItem and novel card','pb/page','302001',postsInput,postsClean,'PbPageResIdl');
check('list post page removes novel only and retains outerItem','pb/page','309751',
  data(msg(6,msg(54,scalar(1,7)),msg(67,str(1,'ad')),unknown),unknown),data(msg(6,msg(54,scalar(1,7)),unknown),unknown),'PbListResIdl');
const personalized=data(msg(9,app,msg(5,goods,liveAd)),msg(2,video,unknown),msg(2,msg(113,scalar(1,0))),msg(2,unknown),msg(17,str(1,'live')),unknown);
check('personalized defaults to retaining ordinary video threads','excellent/personalized','1',personalized,
  data(msg(9,appClean,msg(5,goods,liveAd)),msg(2,video,unknown),msg(2,unknown),unknown),'PersonalizedResIdl');
check('personalized retains original explicit video filter argument','excellent/personalized','1',personalized,
  data(msg(9,appClean,msg(5,goods,liveAd)),msg(2,unknown),unknown),'PersonalizedResIdl','per_filter_video_thread=1');
for (const split of [false,true]) {
  const wrap = (a,b) => split ? join(data(a),unknown,data(b)) : data(a,unknown,b);
  for (const last of [0,1]) {
    check(`activity merged singular messages last scalar ${last}, split data ${split}`,'frs/page','1',
      wrap(msg(23,scalar(13,1),unknown),join(msg(23,scalar(13,0),scalar(13,last)),msg(116))),
      last ? wrap([],[]) : wrap(msg(23,scalar(13,1),unknown),msg(23,scalar(13,0),scalar(13,last))), 'FrsPageResIdl');
  }
}
for (const last of [0,1]) {
  check(`old post merged recomAlaInfo uses last liveId ${last} across data envelopes`,'pb/page','302001',
    join(data(msg(55,scalar(1,7),unknown)),data(msg(55,scalar(1,0),scalar(1,last)),msg(6,msg(67)))),
    last ? join(data(),data(msg(6))) : join(data(msg(55,scalar(1,7),unknown)),data(msg(55,scalar(1,0),scalar(1,last)),msg(6))), 'PbPageResIdl');
}
check('feed KV last key/value and merged feed messages determine live cards','frs/page','1',
 data(msg(126,
   msg(2,msg(2,msg(5,str(1,'is_live_card'),str(2,'1'),str(2,'0')))),
   msg(2,msg(2,msg(5,str(1,'is_live_card'),str(1,'other'),str(2,'1')))),
   msg(2,msg(2,unknown),msg(2,msg(5,str(1,'other'),str(1,'is_live_card'),str(2,'0'),str(2,'1')))),
   liveFeed)),
 data(msg(126,
   msg(2,msg(2,msg(5,str(1,'is_live_card'),str(2,'1'),str(2,'0')))),
   msg(2,msg(2,msg(5,str(1,'is_live_card'),str(1,'other'),str(2,'1')))))), 'FrsPageResIdl');
check('repeated banner/forum/pageData and firstFloor preserve separate envelopes','frs/page','1',
 join(data(msg(2,msg(33,app)),msg(126,liveFeed)),data(msg(2,msg(33,app)),msg(126,normalFeed))),
 join(data(msg(2,msg(33,appClean)),msg(126)),data(msg(2,msg(33,appClean)),msg(126,normalFeed))), 'FrsPageResIdl');
check('list firstFloor merges but removes every duplicate novel field','pb/page','309751',
 join(data(msg(6,msg(54,scalar(1,9)),msg(67),unknown)),data(msg(6,msg(67),unknown))),
 join(data(msg(6,msg(54,scalar(1,9)),unknown)),data(msg(6,unknown))), 'PbListResIdl');
for (const [name,input] of [
 ['unknown envelope',unknown],['missing data',new Uint8Array()],['retained only',data(msg(7,video,unknown),msg(23,scalar(13,0)))],
 ['truncated tag',join(data(msg(116)),[128])],['truncated length',join([18,128])],['truncated payload',join([18,10,1])],
 ['zero tag',join(data(msg(116)),[0])],['invalid wire 6',join(data(msg(116)),[14])],['unsupported group',join(data(msg(116)),[27,28])],
 ['overflow varint',join(data(msg(116)),v(99*8),[255,255,255,255,255,255,255,255,255,2])],
 ['unterminated varint',join(data(msg(116)),v(99*8),Array(10).fill(128))],
 ['bad known message wire',data(scalar(116,0))],['bad nested scalar wire',data(msg(23,msg(13)))],
 ['nested malformed removed field',data(msg(116,[128]))],['over cap',new Uint8Array(1048577)],
 ['nonbinary body','not bytes']]) {
 test(`passthrough ${name}`,()=>assert.deepEqual(run(input,'frs/page'),{}));
}
for(const status of [204,400,500,'200',undefined]) {
 test(`passthrough status ${status}`,()=>assert.deepEqual(run(data(msg(116)),'frs/page','1',{$response:{status,body:data(msg(116))}}),{}));
}
for(const command of ['999','3020010','x302001','1&other=302001','309751&cmd=302001']) {
 test(`unsupported/ambiguous pb command ${command}`,()=>assert.deepEqual(run(postsInput,'pb/page',command),{}));
}
for(const endpoint of ['ad/getFeedAd','b/ad/adBid','frs/pageExtra']) {
 test(`unselected endpoint ${endpoint}`,()=>assert.deepEqual(run(postsInput,endpoint),{}));
}
test('native binary helper preserves view offsets and does not JSON stringify bytes',()=>{
 const payload=data(msg(116)); const backing=join([222],payload,[223]);
 const result=run(backing.subarray(1,backing.length-1),'frs/page'); assert.deepEqual(result.body,data());
});
test('statusCode and original cleartext host path work',()=>{
 const body=data(msg(116));
 const result=run(body,'frs/page','1',{$request:{url:'http://c.tieba.baidu.com/c/f/frs/page?cmd=1'},$response:{statusCode:200,body}});
 assert.deepEqual(result.body,data());
});
test('shared source scanner accounts for the uppercase IP selector and all eight source lines',()=>{
 assert.deepEqual(sourceActiveLines('TieBaAds').map(x=>x.id),['S0019','S0022','S0024','S0026','S0028','S0030','S0032','S0034']);
});
test('module keeps all eight predicates, native response semantics, ownership and scoped MITM',()=>{
 const module=parseModule('TieBaAds'); const entries=Object.values(module).flat();
 for(const source of sourceActiveLines('TieBaAds')) {
   const entry=entries.filter(e=>e.ids.includes(source.id)); assert.equal(entry.length,1,source.id);
   if(source.id==='S0019') assert.equal(entry[0].text,'IP-CIDR,180.76.76.200/32,REJECT');
   else assert.equal(source.pattern,entry[0].options?.pattern || entry[0].tokens[source.id==='S0032'?0:1]);
 }
 assert.deepEqual(module['Map Local'][0].tokens.slice(1),['data-type=text','data=""']);
 const opts=module.Script[0].options;
 assert.equal(opts['binary-body-mode'],'true'); assert.equal(opts['requires-body'],'true');assert.equal(opts['max-size'],'1048576');assert.equal(opts.timeout,'5');
 assert.equal(opts['script-path'],'https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/js/tieba-proto.js');
 assert.ok(module.MITM[0].text.endsWith(', tieba.baidu.com, tiebac.baidu.com'));
 assert.match(validateSurge(['MoyuAds']),/OK|success/i);
});
const jsonFixtures = {
 S0022:{data:{discover_list:[1,2],keep:9},keep:8},
 S0024:{game_center:{},tools:[],vip_banner:{},task_list:[1],keep:8},
 S0026:{duxiaoman:1,namoaixud:2,namoaixud_entry:3,recom_naws_list:4,duxiaoman_entry:5,vip_banner:6,zone_info:[{type:'common_func',keep:1},{type:'auxiliary_func'},{type:'other'}],keep:8},
 S0028:{hot_search:[1,2],keep:8}, S0030:{data:{ad:1},keep:8}
};
for(const [id,fixture] of Object.entries(jsonFixtures)) {
 test(`native jq ${id} retains full original purification and numeric tokens`,()=>{
   const entry=parseModule('TieBaAds')['Body Rewrite'].find(e=>e.ids.includes(id));
   const jq=entry.tokens.slice(2).join(' ').slice(1,-1);
   const source=sourceActiveLines('TieBaAds').find(e=>e.id===id).text.split("jsonjq-response-body '")[1].slice(0,-1);
   const raw=JSON.stringify(fixture).replace('"keep":8','"keep":9007199254740993123456789');
   assert.equal(runJq(jq,raw),runJq(source,raw));
   assert.match(runJq(jq,raw),/9007199254740993123456789/);
   for(const error of [{error_code:1,...fixture},{error_code:'1',...fixture}]) assert.deepEqual(JSON.parse(runJq(jq,error)),error);
   for(const value of [null,[],{future:1}]) assert.deepEqual(JSON.parse(runJq(jq,value)),value);
   assert.throws(()=>runJq(jq,'{"broken":'));
 });
}
test('profile unknown zone records pass through without partial deletion',()=>{
 const jq=parseModule('TieBaAds')['Body Rewrite'].find(e=>e.ids.includes('S0026')).tokens.slice(2).join(' ').slice(1,-1);
 const body={vip_banner:1,zone_info:[{future:1},{type:'common_func'}]};
 assert.deepEqual(JSON.parse(runJq(jq,body)),body);
});
test('native JavaScriptCore executes the same bytes without BigInt or TextDecoder',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'tieba-jsc-'));
 try{
   const input=Array.from(postsInput),expected=Array.from(postsClean);
   const content=`var BigInt=undefined, TextDecoder=undefined; var calls=0,result; var $request={url:${JSON.stringify(url('pb/page','302001'))}}; var $response={status:200,body:new Uint8Array(${JSON.stringify(input)})}; var $done=function(v){calls++;result=v;};\n` +
     fs.readFileSync(path.join(root,script),'utf8')+`\nif(calls!==1 || !(result.body instanceof Uint8Array) || JSON.stringify(Array.from(result.body))!==${JSON.stringify(JSON.stringify(expected))}) throw new Error('binary mismatch'); print('PASS');`;
   const file=path.join(directory,'test.js');fs.writeFileSync(file,content);
   const result=spawnSync('/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc',[file],{encoding:'utf8',timeout:5000});
   assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/PASS/);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
check('noncanonical retained tags, lengths and varints survive neighboring removal','frs/generalTabList','1',
  data(msg(10,[138,0,129,0,65],goods,huge,[160,6,129,0])),
  data(msg(10,[138,0,129,0,65],huge,[160,6,129,0])), 'GeneralTabListResIdl');
check('shrinking ancestor length across 128-byte boundary preserves the payload','frs/generalTabList','1',
  data(msg(10,msg(9,new Uint8Array(120)),goods)),
  data(msg(10,msg(9,new Uint8Array(120)))), 'GeneralTabListResIdl');
test('exact 1 MiB supported frame is edited without altering opaque data',()=>{
 const opaque=msg(99,new Uint8Array(1048564));
 const input=data(opaque,msg(116)); assert.equal(input.length,1048576);
 assert.deepEqual(run(input,'frs/page').body,data(opaque));
});
test('field budget exhaustion passes the entire input through after an earlier removable field',()=>{
 const input=data(msg(116),Uint8Array.from(Array(100001).fill([8,0]).flat()));
 assert.deepEqual(run(input,'frs/page'),{});
});
for(const bytes of [[9,1],[13,1],[255,255,255,255,16],[18,255,255,255,255,15]]) {
 test(`malformed field ${bytes.join(',')} preserves a preceding ad too`,()=>assert.deepEqual(run(join(data(msg(116)),bytes),'frs/page'),{}));
}
test('large liveId is compared by raw bits without numeric rounding',()=>{
 const input=data(msg(55,join([8],[128,128,128,128,128,128,128,128,128,1])),unknown);
 assert.deepEqual(run(input,'pb/page','302001').body,data(unknown));
});
test('personalized object argument preserves the original explicit video filter',()=>{
 const input=data(msg(2,video),msg(2,unknown));
 assert.deepEqual(run(input,'excellent/personalized','1',{$argument:{per_filter_video_thread:1}}).body,data(msg(2,unknown)));
});
test('merged binary and text rules coexist in the actual module',()=>{
 assert.match(validateSurge(['MoyuAds']),/OK|success/i);
});
check('later empty activityhead merges without resetting earlier isAd=true','frs/page','1',
 join(data(msg(23,scalar(13,1),unknown)),data(msg(23))),join(data(),data()),'FrsPageResIdl');
check('empty activityhead with absent isAd remains present','frs/page','1',
 data(msg(23),msg(116)),data(msg(23)),'FrsPageResIdl');
check('later empty recomAlaInfo does not reset a prior nonzero liveId','pb/page','302001',
 join(data(msg(55,scalar(1,7),unknown)),data(msg(55))),join(data(),data()),'PbPageResIdl');
check('FeedKV explicit empty final string overrides an earlier live discriminator','frs/page','1',
 data(msg(126,
  msg(2,msg(2,msg(5,str(1,'is_live_card'),str(2,'1'),str(2,'')))),
  msg(2,msg(2,msg(5,str(1,'is_live_card'),str(1,''),str(2,'1')))),liveFeed)),
 data(msg(126,
  msg(2,msg(2,msg(5,str(1,'is_live_card'),str(2,'1'),str(2,'')))),
  msg(2,msg(2,msg(5,str(1,'is_live_card'),str(1,''),str(2,'1')))))), 'FrsPageResIdl');
check('empty alaInfo and liveAnswer still count as present ads','excellent/personalized','1',
 data(msg(2,msg(113)),msg(2,video),msg(17)),data(msg(2,video)), 'PersonalizedResIdl');

// I1: source-declared strings must be valid UTF-8 before any ad edit occurs.
// These expect whole-body passthrough, including ads encountered before bad text.
test('UTF-8 review counterexample passes through the invalid retained video string',()=>{
 const input=Uint8Array.from([18,11,58,6,250,4,3,10,1,255,162,7,0]);
 assert.throws(()=>decode('FrsPageResIdl',input),/Decoder error/);
 assert.deepEqual(run(input,'frs/page'),{});
});
for(const [name,invalid] of [
 ['illegal FF',[255]],['isolated continuation',[128]],['overlong two-byte C0',[192,128]],
 ['overlong two-byte C1',[193,191]],['truncated two-byte',[194]],['bad two-byte continuation',[194,65]],
 ['overlong three-byte',[224,159,191]],['truncated three-byte',[224,160]],['surrogate',[237,160,128]],
 ['bad third byte',[225,128,65]],['overlong four-byte',[240,143,191,191]],['truncated four-byte',[240,144,128]],
 ['above U+10FFFF',[244,144,128,128]],['illegal F5',[245,128,128,128]],
 ['obsolete five-byte',[248,136,128,128,128]],['obsolete six-byte',[252,132,128,128,128,128]]]) {
 test(`UTF-8 rejects ${name} after an otherwise removable target`,()=>{
   const input=data(msg(116),msg(7,msg(79,msg(1,invalid))));
   assert.throws(()=>decode('FrsPageResIdl',input),/Decoder error/);
   assert.deepEqual(run(input,'frs/page'),{});
 });
}
const badFeed=(key,value)=>data(msg(116),msg(126,msg(2,msg(2,msg(5,key,value)))));
for(const [name,endpoint,cmd,type,input] of [
 ['liveFuseForum','frs/page','1','FrsPageResIdl',data(msg(116,msg(1,[255])))],
 ['novel card','pb/page','302001','PbPageResIdl',data(msg(6,msg(67,msg(1,[255]))))],
 ['liveAnswer','excellent/personalized','1','PersonalizedResIdl',data(msg(17,msg(1,[255])))],
 ['feed key','frs/page','1','FrsPageResIdl',badFeed(msg(1,[255]),str(2,'1'))],
 ['feed value','frs/page','1','FrsPageResIdl',badFeed(str(1,'is_live_card'),msg(2,[255]))]
]) {
 test(`UTF-8 validates known ${name} strings even in removable messages`,()=>{
   assert.throws(()=>decode(type,input),/Decoder error/);
   assert.deepEqual(run(input,endpoint,cmd),{});
 });
}
const utf8Boundaries=Uint8Array.from([0,127,194,128,223,191,224,160,128,237,159,191,238,128,128,239,191,191,240,144,128,128,244,143,191,191]);
check('UTF-8 valid multibyte text and scalar boundaries remain byte-exact','frs/page','1',
 data(msg(116,str(1,'直播😀')),msg(7,msg(79,msg(1,utf8Boundaries))),msg(7,msg(79,str(1,'中文 café 😀')))),
 data(msg(7,msg(79,msg(1,utf8Boundaries))),msg(7,msg(79,str(1,'中文 café 😀')))), 'FrsPageResIdl');
check('UTF-8 invalid bytes in unknown length fields stay opaque while known targets are removed','frs/page','1',
 data(msg(99,[255,192,128,237,160,128]),msg(7,msg(79,msg(99,[255]),str(1,'有效'))),msg(116)),
 data(msg(99,[255,192,128,237,160,128]),msg(7,msg(79,msg(99,[255]),str(1,'有效')))), 'FrsPageResIdl');
test('UTF-8 checks run in native JavaScriptCore without TextDecoder',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'tieba-utf8-jsc-'));
 try {
  const fixtures=[
   {input:data(msg(116),msg(7,msg(79,msg(1,[255])))),want:null},
   {input:data(msg(116,str(1,'😀')),msg(7,msg(79,str(1,'中文 café 😀')))),want:data(msg(7,msg(79,str(1,'中文 café 😀'))))},
   {input:data(msg(116),msg(99,[255])),want:data(msg(99,[255]))}
  ];
  const source=fs.readFileSync(path.join(root,script),'utf8');
  let content='var BigInt=undefined, TextDecoder=undefined;\n';
  for(const fixture of fixtures) {
   content+=`var calls=0,result; var $request={url:${JSON.stringify(url('frs/page'))}}; var $response={status:200,body:new Uint8Array(${JSON.stringify(Array.from(fixture.input))})}; var $done=function(value){calls++;result=value;};\n`;
   content+=source+'\n';
   content+=`if(calls!==1) throw new Error('done count');\n`;
   content+=fixture.want===null ? `if(JSON.stringify(result)!=='{}') throw new Error('invalid UTF-8 changed');\n` :
    `if(!(result.body instanceof Uint8Array) || JSON.stringify(Array.from(result.body))!==${JSON.stringify(JSON.stringify(Array.from(fixture.want)))}) throw new Error('valid bytes changed');\n`;
  }
  content+="print('PASS');";
  const file=path.join(directory,'utf8.js');fs.writeFileSync(file,content);
  const result=spawnSync('/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc',[file],{encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/PASS/);
 } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
