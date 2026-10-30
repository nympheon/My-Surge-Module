# Amap manual port audit

Frozen authority: `references/moyu-independent/AmapAds.conf` (ddgksf2013, V1.0.28) and `scripts/amap.js`, manifest SHA-256. All 19 predicates retain source bytes. Decoded branch map: [docs/audits/amap.md](../docs/audits/amap.md). No converter or obfuscated code is shipped.

| Source | Owned action | Full selected behavior |
|---|---|---|
| S0020 | Rule | DOMAIN-SUFFIX optimus-ads.amap.com DIRECT |
| S0024 | Map Local | splash empty 200 text |
| S0026 | Map Local | ai_rec empty JSON dictionary |
| S0028 | js/amdc.js | request-phase UA short-circuit |
| S0030 | jq | clear noticeList |
| S0032 | Map Local | route plan empty dictionary |
| S0034 | jq | reset every matching frogserver config to status=1/version=""/value="" |
| S0036 | jq | delete coupon/scene/activity/commodity_rec/operation_activity; remove those names from modules |
| S0038 | jq | clear icon/banner/tips/popup/bubble/other |
| S0040 | Map Local | information empty 200 text |
| S0042 | jq | retain LoginCard/FrequentLocation; clear mapBizList/business_position/pull3.msgs |
| S0044 | URL Rewrite | reject ads_attribution |
| S0046 | jq | set display_time=0, first creative start/end=2240150400 |
| S0048 | jq | clear root msgs and pull3.msgs |
| S0050 | jq | delete tipData; retain MyOrderCard/GdRecommendCard |
| S0052 | jq | clear header_hotword |
| S0054 | Map Local | scene recommendation empty dictionary |
| S0056 | Map Local | tiny-gif, preserving reject-img intent |
| S0058 | Map Local | weather empty dictionary |

The nine jq actions execute real jq and match frozen JS on complete healthy fixtures, including code=1, absent code and errmsg="ok". Object.values on recognized keyed card dictionaries preserves ECMAScript numeric-index ordering (0..4294967294 first, then insertion order); array forms are covered too. Exact target fields cleared by original truthy checks retain those semantics for nonempty objects/strings and for empty arrays/objects; false/0/empty-string/null remain unchanged. Splash requires recognizable set.setting and creative[0]; card and modules filters require recognizable discriminators. Unknown records or changed nested scalar schemas pass through rather than being removed, and a jq try/catch retains the full original input on unexpected indexing errors.

Explicit error/errorMessage payloads and status="0" with infocode pass through before cleanup. This is a bounded recognizable failure guard, not a claim that all private endpoint error contracts are known. Arbitrary nonzero code is not failure. Native jq retains non-target unsafe integer and decimal tokens in actual installed jq fixtures, avoiding JSON.parse/stringify precision loss. Malformed JSON is skipped by Surge native jq. No source text was rewritten to approximate JSON.

AMDC is an independent copy of Task 1's reviewed script: case-insensitive header lookup, unchanged case-sensitive UA value regex, body-free http-request response 200 text ddgksf2013 or empty result. Source only used response-stage interception; moving to request-stage preserves selected response while avoiding the remote request. One done, timeout=5. The four reject-dict Map Local responses explicitly set Content-Type:application/json with body {}, rather than inheriting text/plain; empty reject-200 responses retain text/plain and tiny-gif uses image/gif. Native Body Rewrite uses Surge's managed limits (1MB iOS, 10MB Mac); it has no script max-size option.

Source MITM list is unchanged, %APPEND% only; no global wildcard/CA/relaxed verification. Wider source URL regexes do not imply wider HTTPS interception. No live profile change, iOS run or all-app acceptance occurred. Native syntax: [Body Rewrite](https://manual.nssurge.com/http/body-rewrite.html) and [Map Local](https://manual.nssurge.com/http/map-local.html).

## 使用与验证边界

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/AmapAds/AmapAds.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 HTTP Rewrite、Scripting 和 MITM，并已信任自己的 MITM 证书。脚本归属本模块，无跨模块依赖。

完整保留上游选定净化，包括首页卡片、附近的优惠/场景/商品、我的页、搜索热词、AI/运营配置、天气和推广；因此也会移除部分正常 UI/推荐。保留 optimus-ads.amap.com 直连例外和原 MITM 主机范围。上游 ddgksf2013，来源与逐条对应见本文。

上游建议在挂载前卸载重装；本次没有执行安装/卸载、修改在线配置或证书。已通过本机 jq、原脚本样本差分、原生 Surge 配置检查和 AMDC 测试；未宣称旧版本设备、iOS 或全应用在线验收。模块尚需发布后才能通过上述 main 链接获取最新内容。
