'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {root,parseSource: parseModule,sourceActiveLines,runJq,runScript,validateSurge}=require('./helpers');
const names=['AmapAds','Applet','CainiaoAds','CheLaiLeAds'];
function entry(name,id){return Object.values(parseModule(name)).flat().find(e=>e.ids.includes(id));}
function jq(name,id,body){return runJq(entry(name,id).tokens.slice(2).join(' ').slice(1,-1),body);}
// Frozen upstream is an isolated, bounded oracle: no host callbacks, timers, process or network.
function original(file,url,body){
  const source=fs.readFileSync(path.join(root,'references/moyu-independent/scripts',file),'utf8');
  const result=vm.runInNewContext('(function(){var calls=[];var console={log:function(){}};var $request='+JSON.stringify({url})+';var $response='+JSON.stringify({body:typeof body==='string'?body:JSON.stringify(body)})+';function $done(v){calls.push(v);}\n'+source+'\nreturn calls;})()',Object.create(null),{timeout:1000});
  assert.equal(result.length,1);
  const value=JSON.parse(JSON.stringify(result[0]));
  return typeof value==='string'?value:value.body;
}
const amap=[
 ['S0030','message/notice/list',{data:{noticeList:[1],keep:2}},{data:{noticeList:[],keep:2}}],
 ['S0034','shield/frogserver/aocs/updatable',{data:{gd_notch_logo_v2:1,home_business_position_config:2,his_input_tip:3,operation_layer:4,aiNative:5,ai_test:6,test_ai:7,keep:8}},{data:{gd_notch_logo_v2:{status:1,version:'',value:''},home_business_position_config:{status:1,version:'',value:''},his_input_tip:{status:1,version:'',value:''},operation_layer:{status:1,version:'',value:''},aiNative:{status:1,version:'',value:''},ai_test:{status:1,version:'',value:''},test_ai:{status:1,version:'',value:''},keep:8}}],
 ['S0036','shield/search/nearbyrec_smart',{data:{coupon:1,scene:2,activity:3,commodity_rec:4,operation_activity:5,modules:['coupon','scene','activity','commodity_rec','operation_activity','keep'],keep:9}},{data:{modules:['keep'],keep:9}}],
 ['S0038','promotion-web/resource',{data:{icon:[1],banner:[1],tips:[1],popup:[1],bubble:[1],other:[1],keep:2}},{data:{icon:[],banner:[],tips:[],popup:[],bubble:[],other:[],keep:2}}],
 ['S0042','faas/amap-navigation/main-page',{data:{cardList:{a:{dataType:'LoginCard'},b:{dataType:'AdCard'},c:{dataType:'FrequentLocation'}},mapBizList:[1],business_position:[2],pull3:{msgs:[3],keep:4}}},{data:{cardList:[{dataType:'LoginCard'},{dataType:'FrequentLocation'}],mapBizList:[],business_position:[],pull3:{msgs:[],keep:4}}}],
 ['S0046','valueadded/alimama/splash_screen',{data:{ad:[{set:{setting:{display_time:5,keep:1}},creative:[{start_time:1,end_time:2,keep:3},{start_time:4}]}]}},{data:{ad:[{set:{setting:{display_time:0,keep:1}},creative:[{start_time:2240150400,end_time:2240150400,keep:3},{start_time:4}]}]}}],
 ['S0048','msgbox/pull',{msgs:[1],pull3:{msgs:[2],keep:3}},{msgs:[],pull3:{msgs:[],keep:3}}],
 ['S0050','shield/dsp/profile/index/nodefaas',{data:{tipData:{x:1},cardList:[{dataType:'MyOrderCard'},{dataType:'GdRecommendCard'},{dataType:'Ad'}],keep:1}},{data:{cardList:[{dataType:'MyOrderCard'},{dataType:'GdRecommendCard'}],keep:1}}],
 ['S0052','shield/search/new_hotword',{data:{header_hotword:['word'],keep:1}},{data:{header_hotword:[],keep:1}}]
];
const cn=[
 ['S0022','mtop.cainiao.app.e2e.engine.page.fetch',{data:{data:{banner:1,activity:2,asset:3,vip:4,wallet:5,keep:6}}},{data:{data:{keep:6}}}],
 ['S0024','mtop.cainiao.nbpresentation.homepage.merge.get.cn',{data:{'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@0':{data:{result:{dataList:[{type:'big_banner_area_v870'},{type:'todo_list_v860'},{type:'parcel'}]}}},'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@3':{data:{result:{dataList:[{type:'todo_list_v860'},{type:'parcel'}]}}},'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@4':{data:{result:{dataList:[{type:'todo_list_v860'}]}}},keep:1}},{data:{'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@0':{data:{result:{dataList:[{type:'parcel'}]}}},'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@3':{data:{result:{dataList:[{type:'parcel'}]}}},'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@4':{data:{result:{dataList:[{type:'todo_list_v860'}]}}},keep:1}}],
 ['S0026','mtop.cainiao.nbpresentation.protocol.homepage.get.cn',{data:{result:{dataList:[{type:'big_banner_area_v870'},{type:'todo_list_v860'},{type:'parcel'}],keep:1}}},{data:{result:{dataList:[{type:'parcel'}],keep:1}}}],
 ['S0028','mtop.cainiao.adkeyword',{data:{result:{adHotKeywords:['ad'],keep:2}}},{data:{result:{adHotKeywords:[],keep:2}}}]
];
for(const [name,cases,file] of [['AmapAds',amap,'amap.js'],['CainiaoAds',cn,'cainiao_json.js']]){
 for(const [id,url,body,want] of cases){
  test(`${name} ${id}: full healthy purification matches frozen oracle and literal result`,()=>{
   const input={...body,keep:'untouched'},expected={...want,keep:'untouched'};
   assert.deepEqual(JSON.parse(original(file,'https://m5.amap.com/ws/'+url,input)),expected);
   assert.deepEqual(JSON.parse(jq(name,id,input)),expected);
   assert.deepEqual(JSON.parse(jq(name,id,{...input,code:1,errcode:0,errmsg:'ok'})),{...expected,code:1,errcode:0,errmsg:'ok'});
   const raw=JSON.stringify(input).replace('"keep":"untouched"','"keep":9007199254740993123456789,"decimal":0.1234567890123456789012345');
   const output=jq(name,id,raw);
   assert.match(output,/"keep":9007199254740993123456789/);
   assert.match(output,/"decimal":0\.1234567890123456789012345/);
  });
  test(`${name} ${id}: error envelopes and unknown roots survive target-shaped data`,()=>{
   for(const marker of name==='CainiaoAds'?[{ret:['FAIL_SYS_SESSION_EXPIRED::expired']},{ret:['SUCCESS::ok','FAIL_BIZ_INVALID::invalid']}]:[{error:'invalid'},{errorMessage:'invalid'},{status:'0',infocode:'10001'}]){
    const input={...body,...marker};assert.deepEqual(JSON.parse(jq(name,id,input)),input);
   }
   for(const input of [null,[],{}, {data:null},{data:'unknown'}])assert.deepEqual(JSON.parse(jq(name,id,input)),input);
   assert.throws(()=>jq(name,id,'{broken'),/parse error/);
  });
 }
}
test('conditional fields, absent children, and future collection discriminators fail open',()=>{
 for(const [name,id,body] of [
  ['AmapAds','S0046',{data:{ad:[{creative:[]}]}}],['AmapAds','S0042',{data:{cardList:[{newType:'future'}]}}],['AmapAds','S0050',{data:{cardList:[null],tipData:1}}],['AmapAds','S0036',{data:{modules:[{future:1}],coupon:2}}],['CainiaoAds','S0026',{data:{result:{dataList:[null]}}}]
 ])assert.deepEqual(JSON.parse(jq(name,id,body)),body);
 assert.deepEqual(JSON.parse(jq('CainiaoAds','S0024',{data:{keep:7}})),{data:{keep:7}});
 const failed={ret:['FAIL_BIZ_INVALID::invalid'],data:{result:{dataList:[{type:'todo_list_v860'}]}}};
 const merge={data:{'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@1':failed}};
 assert.deepEqual(JSON.parse(jq('CainiaoAds','S0024',merge)),merge);
 assert.deepEqual(JSON.parse(jq('AmapAds','S0038',{data:{icon:false,banner:0,tips:'',popup:null}})),{data:{icon:false,banner:0,tips:'',popup:null}});
});
function script(file,url,body){const value=runScript(file,{$request:{url},$response:{body}});return value.body===undefined?body:value.body;}
test('Applet generic edits exact JSON fields without suffix-key or escaped-text corruption',()=>{
 const raw='{"excitationAd":"9","Ad":"2","ad":true,"AdId":"abc","adid":"abc","fr_videp_if":"1","slot":"adunit-123","myAd":true,"prefixAdId":"keep","text":"escaped \\\"ad\\\":true and adunit123", "id":9007199254740993123456789,"decimal":0.1234567890123456789012345}';
 const out=script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',raw);
 assert.equal(out,'{"excitationAd":"0","Ad":"0","ad":false,"AdId":"","adid":"","fr_videp_if":"0","slot":"","myAd":true,"prefixAdId":"keep","text":"escaped \\\"ad\\\":true and adunit123", "id":9007199254740993123456789,"decimal":0.1234567890123456789012345}');
 for(const body of ['{bad','null','[]','{"error":"bad","ad":true}','{"ad":1,"Ad":"hello","AdId":null,"adunitKey":"keep"}'])assert.equal(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',body),body);
});
test('Applet embedded ad-unit attribute retains valid HTML and unrelated prose',()=>{
 const body=JSON.stringify({html:'<ad unit-id="adunit-ab12"></ad><p>adunit advice</p>',text:'adunit-advice is prose'});
 assert.deepEqual(JSON.parse(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',body)),{html:'<ad unit-id=""></ad><p>adunit advice</p>',text:'adunit-advice is prose'});
});
test('Applet upstream malformed escapes and suffix replacements have concrete regression evidence',()=>{
 const generic='{"excitationAd":"1","ad":true,"AdId":"x","adid":"y","fr_videp_if":"1","slot":"adunit123","keep":7}';
 const genericWant='{"excitationAd":"0","ad":false,"AdId":"","adid":"","fr_videp_if":"0","slot":"","keep":7}';
 assert.equal(original('applet.js','',generic),genericWant);
 assert.equal(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',generic),genericWant);
 const bus='{"Ad":1,"Ad_ab":1,"keep":7}',busWant='{"Ad":0,"Ad_ab":0,"keep":7}';
 assert.equal(original('zhangshanggongjiao.js','',bus),busWant);
 assert.equal(script('MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do',bus),busWant);
 assert.equal(original('applet.js','', '{"Ad":"2","prefixAdId":"keep","slot":"adunit123","adunitKey":"x"}'),'{"Ad":"2","prefixAdId":"","slot":"","":"x"}');
 assert.equal(original('zhangshanggongjiao.js','', '{"Ad":10,"myAd":1,"Ad_ab":1}'),'{"Ad":00,"myAd":0,"Ad_ab":0}');
});
test('Applet bus edits only exact numeric one properties and retains raw large numbers',()=>{
 const body='{"Ad":1,"Ad_ab":1,"myAd":1,"Ad":10,"id":9007199254740993123456789,"text":"Ad\\\":1"}';
 assert.equal(script('MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do',body),'{"Ad":0,"Ad_ab":0,"myAd":1,"Ad":10,"id":9007199254740993123456789,"text":"Ad\\\":1"}');
 for(const body of ['{bad','{"error":"invalid","Ad":1}','{"Ad":2}'])assert.equal(script('MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do',body),body);
});
test('CheLaiLe preserves wrapper siblings, raw unsafe numeric tokens, escaped strings and selected item data',()=>{
 const raw='prefix\n**YGKJ{"jsonr":{"data":{"cityList":[{"title":"首页","picUrl":"ad","keep":9007199254740993123456789,"clickIconUrl":"ad"},{"title":"商城","id":2},{"title":"我的","other":"escaped \\\" text","picUrl":"ad"},{"title":"路线规划","clickIconUrl":"ad"}],"decimal":0.1234567890123456789012345}},"keep":1}YGKJ**\nsuffix';
 const want='prefix\n**YGKJ{"jsonr":{"data":{"cityList":[{"title":"首页","keep":9007199254740993123456789},{"title":"我的","other":"escaped \\\" text"},{"title":"路线规划"}],"decimal":0.1234567890123456789012345}},"keep":1}YGKJ**\nsuffix';
 assert.equal(script('MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/goocity/city!',raw),want);
 const healthy='**YGKJ{"jsonr":{"data":{"cityList":[{"title":"首页","picUrl":"a"},{"title":"商城"},{"title":"我的","clickIconUrl":"b"},{"title":"路线规划"}]}}}YGKJ**';
 assert.equal(script('MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/goocity/city!',healthy),original('chelaile.js','https://web.chelaile.net.cn/goocity/city!',healthy));
 for(const body of ['unwrapped','**YGKJ{brokenYGKJ**','**YGKJ{}YGKJ**','**YGKJ{"jsonr":{"data":{"cityList":[null]}}}YGKJ**','**YGKJ{"error":"invalid","jsonr":{"data":{"cityList":[{"title":"商城"}]}}}YGKJ**'])assert.equal(script('MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/goocity/city!',body),body);
 assert.equal(script('MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/unknown',healthy),healthy);
});
for(const name of names)test(`${name}: every source action retains its predicate, owned resources and native syntax`,()=>{
 const sections=parseModule(name),entries=Object.values(sections).flat();
 assert.equal(sourceActiveLines(name).length,{AmapAds:19,Applet:5,CainiaoAds:13,CheLaiLeAds:8}[name]);
 for(const source of sourceActiveLines(name)){
  const matches=entries.filter(e=>e.ids.includes(source.id));assert.equal(matches.length,1,source.id);
  const e=matches[0];if(source.text.startsWith('^'))assert.equal(e.options?.pattern||e.tokens[e.tokens[0].startsWith('http-response')?1:0],source.pattern);
  if(source.text.includes('reject-200'))assert.match(e.text,/data-type=text data=""$/);
  if(source.text.includes('reject-dict')){assert.match(e.text,/data-type=text data="\{\}"/);assert.match(e.text,/header="Content-Type:application\/json"/);}
  if(source.text.endsWith('url reject'))assert.match(e.text,/ reject$/);
 }
 for(const e of sections.Script||[]){
  const prefix='https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/js/';assert.ok(e.options['script-path'].startsWith(prefix));
  assert.ok(fs.existsSync(path.join(root,e.options['script-path'].slice('https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/'.length))));
  assert.equal(e.options.timeout,'5');if(e.options.type==='http-response'){assert.equal(e.options['requires-body'],'true');assert.equal(e.options['max-size'],'1048576');}
 }
 assert.ok(sections.MITM[0].text.startsWith('hostname = %APPEND% '));assert.ok(!sections.MITM[0].text.split(/[, ]+/).includes('*'));
 assert.match(validateSurge(['MoyuAds']),/OK/);
});
for(const name of ['AmapAds','CainiaoAds'])test(`${name}: AMDC source declaration uses shared request-phase body-free script`,()=>{
 const e=entry(name,name==='AmapAds'?'S0028':'S0020');assert.equal(e.options.type,'http-request');assert.equal(e.options['requires-body'],undefined);
 for(const ua of ['AMap','Cainiao','%E9%97%B2%E9%B1%BC','%E9%A3%9E%E7%8C%AA%E6%97%85%E8%A1%8C','%E5%96%B5%E8%A1%97','%E5%A4%A9%E7%8C%AB','Alibaba','MovieApp','Hema4iPhone','Moon','DMPortal'])assert.deepEqual(runScript('MoyuAds/js/amdc.js',{$request:{headers:{'UsER-aGENT':ua}}}),{response:{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'},body:'ddgksf2013'}});
 for(const headers of [{},{'User-Agent':'amap'},{'User-Agent':1},undefined])assert.deepEqual(runScript('MoyuAds/js/amdc.js',{$request:{headers}}),{});
});
test('merged JSON and native rules coexist in the actual module',()=>assert.match(validateSurge(['MoyuAds']),/OK/));
test('owned Applet and CheLaiLe scripts execute in native JavaScriptCore',()=>{
 const os=require('node:os'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'json-jsc-'));
 try{for(const [file,url,body] of [['MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts','{"ad":true}'],['MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do','{"Ad":1}'],['MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/goocity/city!','**YGKJ{"jsonr":{"data":{"cityList":[{"title":"首页","picUrl":"a"}]}}}YGKJ**']]){
  const want=script(file,url,body),filename=path.join(dir,'test.js');fs.writeFileSync(filename,'var $request='+JSON.stringify({url})+';var $response='+JSON.stringify({body})+';var count=0;function $done(v){count++;if(v.body!=='+JSON.stringify(want)+')throw new Error("wrong body");}\n'+fs.readFileSync(path.join(root,file),'utf8')+'\nif(count!==1)throw new Error("done count");print("PASS");');
  const result=spawnSync('/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc',[filename],{encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/PASS/);
 }}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
// Narrowing exact target fields to arrays would lose legitimate upstream object-form purification.
test('Amap truthy dictionaries and falsy optional card fields preserve full source behavior',()=>{
 for(const [id,url,body] of [
  ['S0030','message/notice/list',{data:{noticeList:{a:1},keep:8}}],
  ['S0042','faas/amap-navigation/main-page',{data:{cardList:false,mapBizList:{a:1},business_position:{b:2},pull3:{msgs:{a:3}}}}],
  ['S0050','profile/index/node',{data:{cardList:0,tipData:{a:1}}}],
  ['S0036','search/nearbyrec_smart',{data:{modules:false,coupon:1}}],
  ['S0042','faas/amap-navigation/main-page',{data:{cardList:{'20':{dataType:'LoginCard',id:20},'3':{dataType:'FrequentLocation',id:3},z:{dataType:'LoginCard',id:'z'},a:{dataType:'LoginCard',id:'a'}},mapBizList:{a:1}}}],
  ['S0050','profile/index/node',{data:{cardList:{x:{dataType:'GdRecommendCard'},y:{dataType:'MyOrderCard'},z:{dataType:'Other'}},tipData:1}}],
  ['S0038','promotion-web/resource',{data:{icon:{a:1},tips:'hello',popup:true}}]
 ]) assert.deepEqual(JSON.parse(jq('AmapAds',id,body)),JSON.parse(original('amap.js','https://m5.amap.com/ws/'+url,body)));
});
test('Applet healthy array posts, escaped exact keys, and successful errmsg retain purification',()=>{
 const raw='[{"\\u0041d":"4","ad":true,"errmsg":"ok","errcode":0},{"AdId":"a\\\"b","myAd":true}]';
 assert.equal(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',raw),'[{"\\u0041d":"0","ad":false,"errmsg":"ok","errcode":0},{"AdId":"","myAd":true}]');
 assert.equal(script('MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do','{"errmsg":"ok","errcode":0,"Ad":1}'),'{"errmsg":"ok","errcode":0,"Ad":0}');
});
test('CheLaiLe unknown items and explicit inner errors preserve the complete wrapper',()=>{
 for(const inner of [
  {jsonr:{error:{message:'invalid'},data:{cityList:[{title:'商城'}]}}},
  {jsonr:{data:{cityList:[{title:'首页',picUrl:'a'},{futureTitle:'future'}]}}},
  {jsonr:{data:{cityList:'future'}}}
 ]){
  const body='before**YGKJ'+JSON.stringify(inner)+'YGKJ**after';
  assert.equal(script('MoyuAds/js/chelaile.js','https://web.chelaile.net.cn/goocity/city!',body),body);
 }
});
test('Amap and Cainiao unexpected nested scalars never turn a supported response into an exception',()=>{
 for(const [name,id,body] of [
  ['AmapAds','S0046',{data:{ad:[{set:'future',creative:[{}]}]}}],
  ['CainiaoAds','S0024',{data:{'mtop.cainiao.nbpresentation.protocol.homepage.get.cn@0':{data:'future'}}}],
  ['CainiaoAds','S0026',{data:{result:{dataList:[{type:'parcel'},'future']}}}],
  ['AmapAds','S0042',{data:{cardList:{a:'future'},mapBizList:[1]}}]
 ])assert.deepEqual(JSON.parse(jq(name,id,body)),body);
});
test('Applet bus healthy array payloads retain exact toggle purification',()=>{
 const body='[{"Ad":1,"Ad_ab":1,"id":9007199254740993123456789}]';
 assert.equal(script('MoyuAds/js/bus.js','https://wx.mygolbs.com/WxBusServer/ApiData.do',body),'[{"Ad":0,"Ad_ab":0,"id":9007199254740993123456789}]');
});
// Exact HTML attribute context must protect article prose and unrelated attribute values.
for (const [label, content] of [
 ['prefixed attributes', '<div data-unit-id="adunit-ab12">keep</div>'],
 ['plain prose', 'Documentation: unit-id="adunit-ab12" is an example.'],
 ['unclosed raw text', '<script>const example = `<ad unit-id="adunit-ab12"></ad>`;'],
 ['HTML comments', '<!-- <ad unit-id="adunit-ab12"></ad> -->'],
 ['raw text elements', "<script>var example='<ad unit-id=\"adunit-ab12\"></ad>';</script>"],
 ['quoted attribute prose', '<ad title=\'Documentation: unit-id="adunit-ab12" is an example.\' data-unit-id="adunit-cd34">keep</ad>']
]) {
 test(`Applet HTML context preserves ${label} and raw numeric tokens`, () => {
  const body='{"content":'+JSON.stringify(content)+',"id":9007199254740993123456789,"decimal":0.1234567890123456789012345}';
  assert.equal(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',body),body);
 });
}
test('Applet HTML context changes only a real exact attribute among quoted examples',()=>{
 const content='<ad title=\'Example: <ad unit-id="adunit-ab12">\'\n data-unit-id="adunit-cd34" unit-id = \'adunit-ef56\'></ad>';
 const want='<ad title=\'Example: <ad unit-id="adunit-ab12">\'\n data-unit-id="adunit-cd34" unit-id = \'\'></ad>';
 const suffix=',"id":9007199254740993123456789,"decimal":0.1234567890123456789012345}';
 const body='{"content":'+JSON.stringify(content)+suffix;
 assert.equal(script('MoyuAds/js/applet.js','https://www.bbkj.work/wp-json/api/v1/posts',body),'{"content":'+JSON.stringify(want)+suffix);
});
