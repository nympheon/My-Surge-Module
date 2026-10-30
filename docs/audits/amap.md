# Decoded Amap behavior map

Manually inspected frozen `references/moyu-independent/scripts/amap.js`; analysis lookup notes live in the task handoff, while frozen bytes and manifest remain authority. Runtime contains native jq and a readable owned AMDC script only. The bogus obfuscator helper compares "tthFl" and "raOUd" and is unreachable; actual config-key matching is keywords.some(key.includes).

| Activated URL fragment | Expected transformation |
|---|---|
| valueadded/alimama/splash_screen | each ad's set.setting.display_time=0; creative[0] start_time/end_time=0x8585fb80=2240150400 |
| faas/amap-navigation/main-page | Object.values(cardList) keeps LoginCard/FrequentLocation; truthy mapBizList/business_position/pull3.msgs -> [] |
| profile/index/node | delete tipData; Object.values(cardList) keeps MyOrderCard/GdRecommendCard |
| new_hotword | truthy data.header_hotword -> [] |
| promotion-web/resource | truthy data icon/banner/tips/popup/bubble/other -> [] |
| msgbox/pull | truthy root msgs and pull3.msgs -> [] |
| message/notice/list | truthy data.noticeList -> [] |
| shield/frogserver/aocs | data keys containing gd_notch_logo, home_business_position_config, his_input_tip, operation_layer, aiNative, ai_, _ai -> {status:1,version:"",value:""} |
| search/nearbyrec_smart | delete coupon, scene, activity, commodity_rec, operation_activity and remove these exact string names from data.modules |

Full healthy purification is retained, including ordinary UI removals. Tests isolate the frozen oracle in a VM with realm-local request/response/done/console only and a 1000ms timeout; there are no host callbacks, network or process access. Hand-derived literal expectations accompany differential checks. Unknown collection schemas, explicit recognizable errors and malformed JSON fail open; see the module audit for precise boundaries and local verification limits.
