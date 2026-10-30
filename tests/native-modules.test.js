'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { root, parseModule, sourceActiveLines, runJq, runScript, validateSurge } = require('./helpers');
const names = ['BiliBiliComicsAds', 'GoofishAds', 'MoJiWeatherAds'];
// A wrong endpoint, wrong filter branch, dropped setter or lost sibling must break these fixtures.
// The frozen upstream jq is an independent behavioral oracle; literal checks expose its key intent.
const cases = {
  BiliBiliComicsAds: {
    S0023: { list: [1], ad_list: [2], show: [3], verifying_list: [4], ad_loc: true },
    S0026: [1, 2],
    S0029: { flash: {id: 7}, operate: {id: 8}, shop_entry: true, game_entry: true },
    S0032: { home_type: [{name:'初夏纯爱！'}, {name:'妖气村'}, {name:'追更'}], home_feed: [{name:'商城'}, {name:'漫画'}] },
    S0035: { feeds: [{type:42}, {type:1}], banner: {image:'ad', jump_url:'ad', text:'ad', remain_sign_days:8} },
    S0038: { name:'ad', img:'ad', url:'ad', gif:'ad', cycle_num:9, bubble_txt:'ad', id:7 },
    S0041: { bubbles:[1], rule:{ad:1} },
    S0044: { type:9, title:'ad', sub_title:'ad', content:'ad', jump_url:'ad' },
    S0047: { operate:{id:9} },
    S0050: { id:9, title:'ad', image_url:'ad', column:{ad:1} },
    S0053: { id:9, title:'ad', jump_url:'ad', image_url:'ad' },
    S0056: { confs:[{title:'我的已购'}, {title:'福利'}, {title:'会员'}], show_welfare:true, show_all_welfare:true },
    S0059: { show_entry:true, entry:{image:'ad', url:'ad', entry_id:'9'}, show_popup:true, popup:{image:'ad',url:'ad', activity_id:'9',entry_id:'9'} },
    S0062: {keywords:['推荐']}, S0065:{list:[1]}, S0068:{banners:[1]},
    S0071:{labels:[1]}, S0074:{comics:[1]}, S0077:{has_red_dot:true}, S0080:[1]
  },
  GoofishAds: {
    S0027:{strategies:[{id:1}]},
    S0031:{circleList:[{bizCode:'saveMoney'}, {bizCode:'follow'}]},
    S0033:{homeTopList:[{id:1},{id:2}], sections:[{data:{bizType:'item', id:1}},{data:{bizType:'ad'}}]},
    S0035:{singleShadeWords:[{word:'推荐'}]}, S0037:{cardList:[{id:1}]},
    S0039:{resultList:[{id:1}]},
    S0041:{ability:[1], container:{sections:[{sectionBizCode:'headInfo'},{sectionBizCode:'userInfo'},{sectionBizCode:'tradeInfo'},{sectionBizCode:'ad'}]}},
    S0043:{sections:[1]}, S0045:{sections:[{data:{bizType:'item'}},{data:{bizType:'ad'}}]},
    S0047:{resultList:[{data:{item:{main:{clickParam:{args:{biz_type:'item'}}}}}}, {data:{item:{main:{clickParam:{args:{biz_type:'ad'}}}}}}]},
    S0049:{cardList:[{cardData:{bizType:'mamaAD'}},{cardData:{bizType:'normal'}}]}
  },
  MoJiWeatherAds: {S0021:{entrance_region_res_list:[{region_name:'工具区'},{region_name:'我页面灯泡'},{region_name:'banner区'},{region_name:'天气设置'}]}}
};
function entryFor(name, id) {
  return Object.values(parseModule(name)).flat().find(entry => entry.ids.includes(id));
}
function expressionFor(entry) { return entry.tokens.slice(2).join(' ').slice(1, -1); }
for (const name of names) {
  test(`${name}: every active source predicate has an owned native action`, () => {
    const entries = Object.values(parseModule(name)).flat();
    const active = sourceActiveLines(name);
    assert.equal(active.length, {BiliBiliComicsAds:20, GoofishAds:15, MoJiWeatherAds:8}[name]);
    for (const source of active) {
      const mapped = entries.filter(entry => entry.ids.includes(source.id));
      assert.equal(mapped.length, 1, source.id);
      const entry = mapped[0];
      if (source.text.startsWith('^')) {
        const pattern = entry.options?.pattern || entry.tokens[entry.tokens[0] === 'http-response-jq' ? 1 : 0];
        assert.equal(pattern, source.pattern, source.id + ' predicate drift');
        if (source.text.includes('jsonjq-response-body')) assert.equal(entry.tokens[0], 'http-response-jq');
        if (source.text.includes('reject-200')) {
          assert.match(entry.text, /data-type=text data=""$/);
          assert.ok(new RegExp(pattern).test(name === 'GoofishAds' ? (source.id === 'S0025' ? 'https://acs.m.goofish.com/gw/mtop.splash.ads' : 'http://g-acs.m.goofish.com/gw/mtop.idle.ad.expose') : ({S0023:'https://a.api.moji.com/flycard/flyCard',S0025:'https://a.api.moji.com/shortvideo',S0027:'https://a.api.moji.com/json/advertising_goods',S0029:'https://a.api.moji.com/forum',S0031:'https://a.api.moji.com/user/dynamic_v1/json/someone_interest',S0033:'https://tnc-test.zijieapi.com/get_domains'}[source.id])));
        }
      } else {
        assert.equal(entry.text, name === 'GoofishAds' ? 'DOMAIN-SUFFIX,iyes.youku.com,REJECT' : 'DOMAIN-SUFFIX,adlaunch.moji.com,REJECT');
      }
    }
  });
  for (const [id, data] of Object.entries(cases[name])) {
    test(`${name} ${id}: native jq preserves full upstream purification and non-target data`, () => {
      const entry = entryFor(name, id);
      assert.ok(entry, 'native rewrite missing');
      const expression = expressionFor(entry);
      const body = name === 'MoJiWeatherAds' ? {...data, keep:'untouched'} : {code:0,data,keep:'untouched'};
      const upstream = sourceActiveLines(name).find(source => source.id === id).text.split('jsonjq-response-body ')[1].slice(1,-1);
      const actual = JSON.parse(runJq(expression, body));
      assert.deepEqual(actual, JSON.parse(runJq(upstream, body)));
      assert.equal(actual.keep, 'untouched');
      if (id === 'S0032' && name === 'BiliBiliComicsAds') assert.deepEqual(actual.data.home_type, [{name:'追更'}]);
      if (id === 'S0056' && name === 'BiliBiliComicsAds') assert.deepEqual(actual.data.confs, [{title:'我的已购'}]);
      if (id === 'S0033' && name === 'GoofishAds') assert.deepEqual(actual.data.homeTopList, [{id:1}]);
      if (name === 'MoJiWeatherAds') assert.deepEqual(actual.entrance_region_res_list, [{region_name:'天气设置'}]);
      const raw = JSON.stringify(body).replace('"keep":"untouched"', '"keep":9007199254740993123456789');
      assert.match(runJq(expression, raw), /"keep":9007199254740993123456789/);
      for (const unknown of [null, [], {}, {code:500,message:'error'}, {data:null}, {data:{}}, {data:[]}, {data:'error'}, {data:{error:'upstream failure'}}]) {
        assert.deepEqual(JSON.parse(runJq(expression, unknown)), unknown, 'unknown/error shape must survive');
      }
      assert.throws(() => runJq(expression, '{broken'), /parse error/);
    });
  }
}
test('Goofish AMDC answers matching case-insensitive headers at request phase', () => {
  const entry = entryFor('GoofishAds', 'S0051');
  assert.equal(entry.options.type, 'http-request');
  assert.equal(entry.options['requires-body'], undefined);
  assert.equal(entry.options.timeout, '5');
  assert.equal(entry.options['script-path'], 'https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/GoofishAds/js/amdc.js');
  const script = 'GoofishAds/js/amdc.js';
  for (const ua of ['AMap','Cainiao','%E9%97%B2%E9%B1%BC','%E9%A3%9E%E7%8C%AA%E6%97%85%E8%A1%8C','%E5%96%B5%E8%A1%97','%E5%A4%A9%E7%8C%AB','Alibaba','MovieApp','Hema4iPhone','Moon','DMPortal']) {
    assert.deepEqual(runScript(script, {$request:{headers:{'uSeR-AgEnT':ua}}}), {response:{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'},body:'ddgksf2013'}});
  }
  for (const headers of [undefined, {}, {'User-Agent':'Safari'}, {'User-Agent':null}, {'User-Agent':123}, {'User-Agent':'amap'}]) {
    assert.deepEqual(runScript(script, {$request:{headers}}), {});
  }
});
test('owned script runs in native macOS JavaScriptCore', () => {
  const {spawnSync} = require('node:child_process');
  const os = require('node:os');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'surge-jsc-'));
  try {
    const filename = path.join(directory, 'amdc-test.js');
    fs.writeFileSync(filename, 'var $request={headers:{"USER-AGENT":"Cainiao"}}; var count=0; function $done(v){count++; if(v.response.body!=="ddgksf2013")throw new Error("wrong body");}\n' + fs.readFileSync(path.join(root,'GoofishAds/js/amdc.js'),'utf8') + '\nif(count!==1)throw new Error("done count"); print("PASS");');
    const result = spawnSync('/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc', [filename], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /PASS/);
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
test('three modules coexist in a complete config accepted by native Surge', () => {
  assert.match(validateSurge(names), /OK|valid|success|passed/i);
});
// Dropping a record from a newly changed schema is a data-loss bug, even on a known endpoint.
const unknownCollections = [
  ['BiliBiliComicsAds','S0032',{home_type:[{new_name:'future'}],home_feed:[{name:'商城'}]}],
  ['BiliBiliComicsAds','S0035',{feeds:[{new_type:42}],banner:{image:'keep'}}],
  ['BiliBiliComicsAds','S0056',{confs:[{new_title:'future'}]}],
  ['GoofishAds','S0031',{circleList:[{new_code:'future'}]}],
  ['GoofishAds','S0033',{homeTopList:[1],sections:[{new_data:{bizType:'item'}}]}],
  ['GoofishAds','S0041',{ability:[1],container:{sections:[{sectionBizCode:null}]}}],
  ['GoofishAds','S0045',{sections:[{data:{newBizType:'item'}}]}],
  ['GoofishAds','S0047',{resultList:[{data:{item:{main:{clickParam:{args:{new_type:'item'}}}}}}]}],
  ['GoofishAds','S0049',{cardList:[{newCardData:{bizType:'mamaAD'}}]}],
  ['MoJiWeatherAds','S0021',{entrance_region_res_list:[{new_name:'future'},{region_name:'工具区'}]}]
];
for (const [name,id,data] of unknownCollections) {
  test(`${name} ${id}: unknown collection element schema passes through intact`, () => {
    const body = name === 'MoJiWeatherAds' ? data : {data};
    assert.deepEqual(JSON.parse(runJq(expressionFor(entryFor(name,id)),body)),body);
  });
}
test('owned native script URLs resolve locally and require no runtime loader', () => {
  for (const name of names) {
    const sections = parseModule(name);
    for (const entry of sections.Script || []) {
      const prefix = `https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/${name}/js/`;
      assert.ok(entry.options['script-path'].startsWith(prefix));
      const filename = entry.options['script-path'].slice(prefix.length);
      assert.ok(!filename.includes('/') && filename.endsWith('.js'));
      assert.ok(fs.statSync(path.join(root,name,'js',filename)).isFile());
      assert.equal(entry.options.timeout,'5');
      if (entry.options['requires-body'] === 'true') assert.equal(entry.options['max-size'],'1048576');
    }
    assert.ok(sections.MITM[0].text.startsWith('hostname = %APPEND% '));
    assert.ok(!sections.MITM[0].text.split(/[, ]+/).includes('*'));
    assert.match(validateSurge([name]), /OK/);
  }
});
test('Goofish search discovery and shade survive the overlapping broad search predicate', () => {
  const rules = parseModule('GoofishAds')['Body Rewrite'];
  for (const [url,body,want] of [
    ['https://acs.m.goofish.com/gw/mtop.taobao.idlemtopsearch.search.discover/1.0/',{data:{resultList:[{id:1}],keep:7}},{data:{keep:7}}],
    ['http://g-acs.m.goofish.com/gw/mtop.taobao.idlemtopsearch.search.shade/1.0/',{data:{singleShadeWords:[{word:'ad'}],keep:7}},{data:{singleShadeWords:[{}],keep:7}}]
  ]) {
    let actual=body;
    for (const entry of rules) if(new RegExp(entry.tokens[1]).test(url)) actual=JSON.parse(runJq(expressionFor(entry),actual));
    assert.deepEqual(actual,want);
  }
});
