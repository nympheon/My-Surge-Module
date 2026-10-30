"""Offline behavior checks of hand-written native JQ expressions."""
from pathlib import Path
import re, json, subprocess, copy
root = Path(__file__).resolve().parents[2]
text = (root/'kelee/kelee.sgmodule').read_text()
rules = []
for line in text.splitlines():
    if line.startswith('http-response-jq '):
        _, pattern, expression = line.split(' ',2)
        rules.append((re.compile(pattern), expression[1:-1]))
checks = 0
def apply(url, value, **args):
    global checks
    count = 0
    for pattern, expression in rules:
        if not pattern.search(url): continue
        count += 1
        for key, default in [('Tieba_FilterVideo',True),('IThome_RemovePinned',False),('IThome_RemoveBanners',False)]:
            expression = expression.replace('{{{'+key+'}}}',json.dumps(args.get(key,default)))
        r = subprocess.run(['jq','-c',expression],input=json.dumps(value),capture_output=True,text=True)
        assert r.returncode == 0, (url,r.stderr)
        value = json.loads(r.stdout)
    assert count, 'No rule matched '+url
    checks += 1
    return value

for banners in [False, True]:
    for pinned in [False, True]:
        values = [{'feedType':1,'feedContent':{'title':'news','focusNewsData':[{'isAd':True},{'id':'normal'},{'isAd':0},{'isAd':''}]}},
                  {'feedType':10002},{'feedType':10003},{'feedType':10004},
                  {'feedType':1,'feedContent':{'flag':2}},
                  {'feedType':1,'feedContent':{'smallTags':[{'text':'广告'}]}}]
        r = apply('https://napi.ithome.com/api/news/indexv2/iphone/123', {'data':{'list':values}},
                  IThome_RemoveBanners=banners,IThome_RemovePinned=pinned)
        assert len(r['data']['list']) == 3-int(banners)-int(pinned)
        assert r['data']['list'][0]['feedContent']['focusNewsData'] == [{'id':'normal'},{'isAd':0},{'isAd':''}]
assert apply('https://napi.ithome.com/api/topmenu/getfeeds?', {'other':1}) == {'other':1}

r = apply('https://api.coolapk.com/v6/main/indexV8', {'data':[{'entityId':123,'title':'normal'},
    {'entityId':8639},{'entityTemplate':'sponsorCard'},{'title':'红包'}]})
assert r['data'] == [{'entityId':123,'title':'normal'}]
r = apply('https://api.coolapk.com/v6/main/init', {'data':[{'entityId':944}, {'entityId':123},
    {'entityId':20131,'entities':[{'title':'酷品'},{'title':'normal'}]}]})
assert len(r['data']) == 2 and r['data'][1]['entities'] == [{'title':'normal'}]

ems_url = 'https://ump.ems.com.cn/new-generation-extend/redis/pageInfoByChannel'
ems = {'info':{'moduleJson':json.dumps([{'moduleName':'广告banner'},{'moduleName':'寄件'}])},'normal':1}
r = apply(ems_url,ems)
assert json.loads(r['info']['moduleJson']) == [{'moduleName':'寄件'}] and r['normal'] == 1
for value in [{'info':{'moduleJson':'bad JSON'}},{'normal':1}]: assert apply(ems_url,value) == value
kff_url = 'https://webapi.qmai.cn/web/catering/design/homePage-Config'
kff = {'data':{'config':json.dumps([{'id':'prefix13502ede-f5fd-4d5c-90f5-f2454a30fda0suffix'}, {'id':'ordering'}])}}
assert json.loads(apply(kff_url,kff)['data']['config']) == [{'id':'ordering'}]
assert apply(kff_url,{'data':{'config':'not JSON'}}) == {'data':{'config':'not JSON'}}

r = apply('https://api.caiyunapp.com/v1/activity?type_id=A03', {'interval':1,'activities':[{'name':'ad','type':'tab','feature':True},{'name':'normal'}]})
assert r['interval'] == 2592000 and r['activities'][0]['feature'] is False and len(r['activities']) == 2
assert apply('https://wrapper.cyapi.cn/v1/activity?v=1&type_id=A03', {'activities':[1]})['activities'] == []
assert apply('https://api.caiyunapp.com/v1/activity?type_id=A04', {'activities':[1]}) == {'status':'ok','activities':[{'items':[]}]}
assert apply('https://api.caiyunapp.com/v1/activity?type_id=A03', {'interval':0,'activities':[{'name':'','type':'tab','feature':1}]}) == {'interval':0,'activities':[{'name':'','type':'tab','feature':1}]}
r = apply('https://apiv2.douyucdn.cn/mgapi/livenc/home/getRecV3',
          {'data':{'rec_cont':[{'id':'normal','ad':0},{'ad':''},{'ad':False},{'ad':1}],
                   'rec_card':{'slot':{'card_banner':[{'ad':0},{'ad':True}]}}}})
assert len(r['data']['rec_cont']) == 3 and r['data']['rec_card']['slot']['card_banner'] == [{'ad':0}]

r = apply('https://venus.douyucdn.cn/venus/config/static/update?keyCodeSet=flow_config',
          {'bringGoodsSwitch':1,'qqGameSwitch':1,'normal':7})
assert r == {'bringGoodsSwitch':0,'qqGameSwitch':0,'normal':7}
assert apply('https://apiv2.douyucdn.cn/japi/entrance/roomRes/nc/m/list',
             {'data':{'pendant_a':1,'entrance_d':2,'room':3}}) == {'data':{'room':3}}
r = apply('https://p.kuaidi100.com/mobile/mobileapi.do', {'adsplash':1,'index_banner':1,'tracking':{'id':123}})
assert r == {'tracking':{'id':123}}
assert apply('http://p.kuaidi100.com/apicenter/xcx.dox',{'data':{'secondMenuList':[1],'normal':2}}) == {'data':{'normal':2}}
assert apply('https://switch.jumpvg.com/jump/getlaunchad/v2', {'data':{'adList':[1],'launchAd':{'showType':1},'normal':2}})['data'] == {'launchAd':{'showType':0},'normal':2}
assert apply('https://edith.xiaohongshu.com/api/sns/v4/search/trending?a=1',{'data':{'queries':[1],'hint_word':{},'normal':1}}) == {'data':{'queries':'[]','hint_word':'{}','normal':1}}

for url, value, expected in [
 ('https://minifm.maxxipoint.com/banner/list', {'data':{'topBanner':[1],'member':2}}, {'data':{'member':2}}),
 ('https://lawsonapi.yorentown.com/area/sh-lawson/app/v1/home',{'data':{'homeButtonList':[1],'dysmorphismPictureList':[2],'shop':3}},{'data':{'shop':3}}),
 ('https://coco-com.e.verystar.net/v1/home/info',{'data':{'top_background_url':'ad','bottom_banner_list':[1],'menu':[2]}},{'data':{'menu':[2]}}),
 ('https://htwkop.xiaojukeji.com/gateway?api=hm.fa.homeConfig',{'data':{'bannerInfoConfig':[1],'ride':2}},{'data':{'ride':2}}),
 ('https://mapi.xiaotucc.com/main_page/index/getActivity',{'data':{'p3':1,'p2':2}},{'data':{'p2':2}}),
 ('https://newton.gumingnc.com/newton-buyer/newton/buyer/ump',{'data':[1],'success':True},{'data':[],'success':True}),
 ('https://cappapi.alittle-tea.com/open?method=catering.set.ad',{'data':[1],'success':True},{'success':True}),
 ('https://passenger.t3go.cn/common-passenger-activity-api/notoken/trip/api/home/v3/leftmenu',{'data':[1],'success':True},{'success':True}),
]: assert apply(url,value) == expected, url

print(json.dumps({'behavior_fixtures':checks,'result':'PASS'},ensure_ascii=False))
