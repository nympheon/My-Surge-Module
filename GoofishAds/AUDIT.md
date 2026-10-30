# GoofishAds 源行审计

源作者：[@ddgksf2013](https://t.me/ddgksf2021)。[原配置](https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/GoofishAds.conf)，版本 V1.0.11，更新 2025-09-06，冻结于 2026-10-31。字节和 SHA-256 见 `references/moyu-independent/manifest.json`。15 条活动源行全部保留；未启用注释规则。

| 源行 | 原谓词/端点 | Surge 动作与完整行为 |
|---|---|---|
| S0022 | host-suffix iyes.youku.com | Rule DOMAIN-SUFFIX,REJECT |
| S0025 | mtop.*splash.ads | Map Local 空文本 200，对应 reject-200 |
| S0027 | mtop.taobao.idle.user.strategy.list | jq strategies=[{}] |
| S0029 | mtop.idle.ad.expose | Map Local 空文本 200，对应 reject-200 |
| S0031 | mtop.taobao.idlehome.home.circle.list | jq 移除 bizCode=saveMoney |
| S0033 | mtop.taobao.idlehome.home.nextfresh | jq homeTopList=[第一项]，sections 仅保留 data.bizType=item |
| S0035 | mtop.taobao.idlemtopsearch.search.shade | jq singleShadeWords=[{}] |
| S0037 | mtop.taobao.idlemtopsearch.item.search.activate | jq cardList=[{}] |
| S0039 | mtop.taobao.idlemtopsearch.search.discover | jq 删除 data.resultList |
| S0041 | mtop.idle.user.page.my.adapter | jq ability=[]，container.sections 仅保留 sectionBizCode 匹配 head\|user\|trade；原非锚定子串正则完整保留 |
| S0043 | mtop.taobao.idle.item.buy.feeds | jq 删除 data.sections |
| S0045 | mtop.taobao.idle.local.home | jq sections 仅保留 data.bizType=item |
| S0047 | mtop.taobao.idlemtopsearch.search | jq resultList 仅保留 data.item.main.clickParam.args.biz_type=item |
| S0049 | mtop.taobao.idle.item.recommend | jq cardList 移除 cardData.bizType=mamaAD |
| S0051 | HTTP /amdc/mobileDispatch，原主机段数与可选端口正则 | http-request 独立 amdc.js，保留所有原 UA 分支，匹配时直接返回 200/text/plain 与 ddgksf2013；其余 $done({}) |

## 保护与差异

所有 URL 正则逐字保留，包括 mtop 点号未转义、HTTP/HTTPS 支持、S0047 宽前缀。Surge 会依次应用匹配的 Body Rewrite：shade 路径经宽 search 规则时无 resultList 则保持；discover 删除 resultList 后宽 search 也不重建它。实际 jq 流水线回归覆盖这两个重叠路径。

jq 先识别 Goofish/MTop 错误信封：ret 数组任一字符串条目以 FAIL_ 开头（包括 FAIL_SYS_、FAIL_BIZ_）时整份保留，即使 data 符合目标结构，也不清洗诊断字段。SUCCESS::调用成功 和 ret 缺省的健康信封继续原净化；不把其他提供方的 code=0 规则套用于 Goofish，code=200 与 SUCCESS 的成功样本也通过。jq 要求根和 data 为对象，目标数组存在；S0033 同时要求 homeTopList/sections 数组；S0041 要求 ability 与 container.sections 数组。过滤前校验每项所需判别字段（包括嵌套对象）。未知形态、缺失 data、错误信封和未知数组项整份保留。源对空 homeTopList 会产生 `[null]`，此完整原行为保留；未“修正”为 `[]`。字段清空和删除语义保留，不缩减为仅去广告。

S0051 原来是响应改写；Surge 移为请求阶段短路以实际阻止 AMDC 网络请求，输出相同文本。大小写不敏感查找 header 名，UA 值匹配仍区分大小写；所有原 UA 分支均保留。没有读取正文或 JSON，不会改写数字，无需 requires-body/max-size；timeout=5，恰好一处 $done。原始脚本及既有 StartUpAds/js/amdc.js 仅作参考，安装不依赖它们。

Map Local 使用 `data-type=text data=""` 原生默认 200，不伪造 JSON 字典或图片。MITM 保留两个原域名，以 `%APPEND%` 追加；AMDC 原谓词仅 HTTP，无需解密更多主机。jq 原生体积限制由 Surge 控制（iOS 1MB、Mac 10MB），无额外脚本参数。

本地验证：11 个 jq 表达式均与冻结原 jq 的健康样本完整差分；全部 11 个 jq 端点的形态兼容错误信封、SUCCESS/ret 缺省成功信封；未知结构、数值 token、非法 JSON；所有 AMDC UA 分支、缺失/混合大小写/非字符串 UA；Node VM、原生 macOS JavaScriptCore、单模块与组合 Surge 完整配置解析。未进行 iOS 或应用内全流程验收。

参考：[Surge Body Rewrite](https://manual.nssurge.com/http/body-rewrite.html)、[请求脚本 response 短路](https://manual.nssurge.com/scripting/http-request.html)、[Map Local](https://manual.nssurge.com/http/map-local.html)。

## 使用与验证边界

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/GoofishAds/GoofishAds.sgmodule) · [逐条审计](AUDIT.md)

需要 Surge Mac 5.9.0+ / iOS 5.14.0+；启用模块，并在自己的设备上完成 MITM 证书信任。模块追加 `acs.m.goofish.com`、`g-acs.m.goofish.com`；没有证书或放宽服务器验证。

保留完整原配置净化：开屏、悬浮球、首页顶部与信息流、搜索填词/发现/推荐、我的页与购买推荐、本地及商品推荐。它会保留首页第一顶部项、商品流及我的页 head/user/trade 分支，功能超出仅去广告。来源作者 ddgksf2013；快照与差异见审计。

AMDC 使用本目录独立 `js/amdc.js`，按原 UA 分支在请求阶段返回文本；无需响应正文。原作者提示首次使用前卸载应用再挂载；本项目没有执行该操作。已验证本地 jq、脚本 VM、macOS JavaScriptCore 与 Surge 配置解析，未进行 iOS 或应用内全流程验收。
