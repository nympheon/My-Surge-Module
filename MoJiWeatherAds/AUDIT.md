# MoJiWeatherAds 源行审计

源作者：[@ddgksf2013](https://t.me/ddgksf2021)。[原配置](https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/MoJiWeatherAds.conf)，版本 V1.0.2，源更新标记 2025-11-03，冻结于 2026-10-31。字节与 SHA-256 见 `references/moyu-independent/manifest.json`。8 条活动源行全部保留，无排除、无启用注释规则。

| 源行 | 原谓词/端点 | Surge 动作与行为 |
|---|---|---|
| S0021 | api.moji.com /json/entrance/list | Body Rewrite jq 移除 region_name 为“工具区”、“我页面灯泡”、“banner区”的区域 |
| S0023 | api.moji.com /flycard/flyCard | Map Local 空文本 200：顶部浮窗 |
| S0025 | api.moji.com /shortvideo | Map Local 空文本 200：短视频 |
| S0027 | api.moji.com /json/advertising_goods | Map Local 空文本 200：商品推广 |
| S0029 | api.moji.com /forum | Map Local 空文本 200：整个时景发现 |
| S0031 | api.moji.com /user/dynamic_v\d/json/someone_interest | Map Local 空文本 200：时景关注 |
| S0033 | HTTPS tnc.*zijieapi.com /get_domains | Map Local 空文本 200：DNS 配置 |
| S0035 | host-suffix adlaunch.moji.com | Rule DOMAIN-SUFFIX,REJECT：开屏域名 |

URL 正则逐字保留，Map Local `data-type=text data=""` 对应原 reject-200 的空文本正文和默认 200；不改为 JSON 或断开连接。原 MITM 域名 `*.api.moji.com, tnc*-*.zijieapi.com` 完整保留，并使用 `%APPEND%`。原正则覆盖范围比原 MITM 范围更广；没有据此扩大解密范围。故原 MITM 范围外的 HTTPS 主机仍不处理，与源配置一致。

唯一 jq 表达式增加根对象、目标数组、元素对象与 region_name 字符串保护。未知根、错误信封、未知元素整份保留，防止源表达式对缺失数组抛错或部分清洗未知结构；健康支持输入与原 jq 完全一致。非法 JSON 由 Surge 跳过。非目标数值未参与算术；实际 jq 测试保留大整数原始 token。原生 Body Rewrite 限制由 Surge 管理（iOS 1MB、Mac 10MB），无需运行脚本或脚本的 timeout/max-size 参数。

本地验证：真实 jq 完整差分、三种区域全部删除且保留其他区域、未知结构/元素、非法 JSON、非目标数值、所有六个本地响应 URL、单模块与组合 Surge 完整配置解析。未进行 iOS 或应用内全流程验收。

参考：[Surge Body Rewrite](https://manual.nssurge.com/http/body-rewrite.html)、[Map Local](https://manual.nssurge.com/http/map-local.html)。
