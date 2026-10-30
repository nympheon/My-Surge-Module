# BiliBiliComicsAds 源行审计

源作者：[@ddgksf2013](https://t.me/ddgksf2021)。[原配置](https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/BiliBiliComicsAds.conf)，版本 V1.0.6，更新 2026-06-14，冻结于 2026-10-31。准确字节与 SHA-256 见 `references/moyu-independent/manifest.json`。下表 ID 是冻结配置物理行号；20 条活动规则全部保留，无排除、无启用注释规则。

每行均为 `[Body Rewrite] http-response-jq`，原 URL 正则逐字保留（含 `v\d`、大小写以及 `GetOperaterBanner` 拼写）。域名保持 `manga.bilibili.com`，以 `%APPEND%` 加入 MITM。

| 源行 | URL 端点 | 完整保留的动作 |
|---|---|---|
| S0023 | Comic/ListFlash | list、ad_list、show、verifying_list 清空，ad_loc=false |
| S0026 | Comic/Banner | data=[] |
| S0029 | Comic/AppInit | flash/operate 完整零值对象；user_center_operate、activity_tab、bubble、card_banner_in_pay/coupon=null；card_banner_in_ctrl 零值对象；fission 禁用零值对象；shop/game 入口、文本、描述、URL、图标清空；act_entry 文本/类型与 unread_message_count 清零 |
| S0032 | Comic/GetClassPageAllTabs | 移除“初夏纯爱！”、“妖气村”及 home_feed“商城” |
| S0035 | Home/HomeFeed | 移除 type=42；banner image/jump_url/text 清空、remain_sign_days=0 |
| S0038 | Comic/GetActivityTab | name/img/url/gif/bubble_txt 清空，cycle_num/id=0 |
| S0041 | Comic/GetBubbles | bubbles=[]、rule=null |
| S0044 | Comic/GetWelfareBanner | type=0，title/sub_title/content/jump_url 清空 |
| S0047 | Comic/GetOperaterBanner | operate 使用原完整零值对象 |
| S0050 | Comic/GetCommonBanner | 原 25 个横幅字段全部按源赋空、0、false、null，包括 column/banner_ext/calendar_ext |
| S0053 | Comic/GetHookBanner | id=0，title/jump_url/image_url 清空 |
| S0056 | User/UCenterConf | confs 仅留“我的已购”，show_welfare/show_all_welfare=false |
| S0059 | User/GetMarketingCenterInfo | show_entry/show_popup=false；entry/popup 图、URL 清空，标识字符串为 "0" |
| S0062 | Search/GetSearchBoxKeyword | keywords=[] |
| S0065 | Comic/SearchDisplay | list=[] |
| S0068 | Comic/SearchBanner | banners=[] |
| S0071 | Search/GetGuessLabel | labels=[] |
| S0074 | Search/GetHotSearch | comics=[] |
| S0077 | Line/TabRedDot | has_red_dot=false |
| S0080 | Comic/Recommend | data=[] |

## 保护与差异

源表达式会在缺失字段时构造新字段，部分未知结构会抛错。本模块仅在已支持的响应形态上执行：根为对象，data 类型符合端点；数组操作要求目标数组存在，过滤数组还校验每项判别字段。初始化要求 flash/operate 对象；横幅要求对应 id/title、name、type/title 或 operate；营销中心要求 entry/popup 对象。未知根、错误信封、缺失数据及未知数组项整份保留，避免把服务端错误改成空成功响应。这是刻意的防破坏修正。空已知数组仍按上游处理。

原生 Surge 对非法 JSON 跳过处理；jq 执行错误也不改原正文。jq 不对非目标字段做算术；实际 jq 1.7.1 测试证明未触碰的大整数 token `9007199254740993123456789` 完整保留。原生 Body Rewrite 的响应体限制由 Surge 控制（iOS 1MB、Mac 10MB）；它没有脚本的 max-size/timeout 参数，本模块不加虚构参数。

本地验证：20 个表达式均对照冻结原 jq 在代表性健康样本上的完整结果，含所有 AppInit 与 CommonBanner 字段；另测未知根/数组项、非法 JSON、大整数和原生完整配置解析。未证实旧版引擎数值实现、iOS 设备与真实应用的全部响应形态。

原生语法和跳过语义依据：[Surge Body Rewrite](https://manual.nssurge.com/http/body-rewrite.html)。
