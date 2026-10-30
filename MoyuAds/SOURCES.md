# MoyuAds 来源与实现映射

核对日期：2026-10-31。运行代码发布基线：`0d9342efba3019f0814ee65f8a69202fe977ce61`；合并前八模块基线：`74662af52b4a2c581aef34e17cbbb7fe030b06ff`。这些是历史锚点，未来更新先核对真实远端。

当前发布入口只有 [MoyuAds.sgmodule](MoyuAds.sgmodule)。旧八个运行目录已经删除；下表八个名称是来源分组，不是待恢复的独立模块。用户选择保留完整净化，包括天气、搜索推荐、底栏和个人页等正常功能的删减。操作流程见 [MAINTENANCE.md](MAINTENANCE.md)。

## 配置快照

当前上游入口、完整 SHA-256 和脚本依赖以 [manifest.json](../references/moyu-independent/manifest.json) 为准，原始配置保存在相邻目录。下列固定提交文件已逐字节对照冻结快照；提交日期是文件提交日期，可能只有注释变更，不能当作广告逻辑更新时间或当前生效证明。

| 来源分组 | 活动源行 | 固定配置文件 | 来源审计 |
| --- | ---: | --- | --- |
| AmapAds | 19 | [316e223，2025-12-12](https://github.com/ddgksf2013/Rewrite/blob/316e223dd51f1d39a26fc130e1d25a4770feddf0/AdBlock/AmapAds.conf) | [高德地图](audits/AmapAds.md) |
| Applet | 5 | [64621c2，2025-04-15](https://github.com/ddgksf2013/Rewrite/blob/64621c2461c822c1caf86ec617079428778ae93d/AdBlock/Applet.conf) | [微信小程序](audits/Applet.md) |
| BiliBiliComicsAds | 20 | [dc3ea2c，2026-06-15](https://github.com/ddgksf2013/Rewrite/blob/dc3ea2c1fb2db870676b26da24006083eb1d44d3/AdBlock/BiliBiliComicsAds.conf) | [哔哩哔哩漫画](audits/BiliBiliComicsAds.md) |
| CainiaoAds | 13 | [4d81226，2025-12-12](https://github.com/ddgksf2013/Rewrite/blob/4d812261d77f0dcf1f2059fb73ebe303080b8d0d/AdBlock/CainiaoAds.conf) | [菜鸟](audits/CainiaoAds.md) |
| CheLaiLeAds | 8 | [ad44ffb，2026-01-01](https://github.com/ddgksf2013/Rewrite/blob/ad44ffbc06181914e608ad047f9a5be94598b6bb/AdBlock/CheLaiLeAds.conf) | [车来了](audits/CheLaiLeAds.md) |
| GoofishAds | 15 | [a30ccfb，2025-12-12](https://github.com/ddgksf2013/Rewrite/blob/a30ccfb253094011adf148b1931753d91fe1bfc8/AdBlock/GoofishAds.conf) | [闲鱼](audits/GoofishAds.md) |
| MoJiWeatherAds | 8 | [1683a1a，2025-12-12](https://github.com/ddgksf2013/Rewrite/blob/1683a1a3f675ec232062b2d74d7877db8067148e/AdBlock/MoJiWeatherAds.conf) | [墨迹天气](audits/MoJiWeatherAds.md) |
| TieBaAds | 8 | [f8d088c，2025-12-12](https://github.com/ddgksf2013/Rewrite/blob/f8d088cc3e42e9a2bba5693eb9156c36dc64abd2/AdBlock/TieBaAds.conf) | [百度贴吧](audits/TieBaAds.md) |

共 96 条来源映射。模块内 `# @source <名称>` 与该分组下的 `Sxxxx` 合起来标识原配置物理行；单独 S0022 等并不全局唯一。上游插入注释后物理行号也可能变化，应按 URL、阶段、动作和参数匹配变化，再更新行号。

车来了此前拼写为 `AdBlock/CheLaiLeAds.cof`，2026-01-01 只修正后缀。追溯更早历史时检查旧路径，不能误判为当天新建。2025-12-12 的上述五份配置更新只是删除联系方式；小程序 2025-04-15 改下载链接，漫画 2026-06-15 改说明。分别比较实际 diff，不只读时间戳。

## 原脚本到当前实现

冻结的七份原脚本在 [references/moyu-independent/scripts](../references/moyu-independent/scripts)，只用于审计及受限测试 oracle，不是客户端运行依赖。

| 原脚本及固定版本 | 当前实现 | 更新时的范围 |
| --- | --- | --- |
| [amap.js，87737f3](https://github.com/ddgksf2013/Scripts/blob/87737f3860fb0dd140175acf83f4532d4c4f1856/amap.js) | 合集内 AmapAds 分组的 9 条原生 JQ；[解读](../docs/audits/amap.md) | 只移植源配置实际激活的分支；不恢复混淆代码或新增同名运行脚本 |
| [amdc.js，819a88e](https://github.com/ddgksf2013/Scripts/blob/819a88e0efbfeb5dfdb15e93c6d007a5e790a15f/amdc.js) | [js/amdc.js](js/amdc.js) | AmapAds:S0028、CainiaoAds:S0020、GoofishAds:S0051 三条原声明共用一个文件；保持各自匹配条件和顺序 |
| [applet.js，4a53cc1](https://github.com/ddgksf2013/Scripts/blob/4a53cc15ca549ff003788f18c784f6cd0b14f7ca/applet.js) | [js/applet.js](js/applet.js) | 精确 JSON 键及 HTML 属性处理，不直接恢复原全局字符串替换 |
| [zhangshanggongjiao.js，7731362](https://github.com/ddgksf2013/Scripts/blob/77313627a9a4adcb15870a2b911e109506d11242/zhangshanggongjiao.js) | [js/bus.js](js/bus.js) | 精确 Ad/Ad_ab 数值开关，保留其他原始文本及数字 |
| [cainiao_json.js，9d3ea6c](https://github.com/ddgksf2013/Scripts/blob/9d3ea6c91d410f5035d7591bf0dbcb960b10241b/cainiao_json.js) | 合集内 CainiaoAds 分组的 4 条原生 JQ | 原脚本的其他分支没有配置入口，不能因原脚本更新自动激活 |
| [chelaile.js，f9418df](https://github.com/ddgksf2013/Scripts/blob/f9418df2e26b88d8bc853423523517610063da46/chelaile.js) | [js/chelaile.js](js/chelaile.js)；[解读](../docs/audits/chelaile.md) | 仅选定 city! 端点；保持 YGKJ 包装、前后缀与原始数值 |
| [app2smile/tieba-proto.js，c9d4d50](https://github.com/app2smile/rules/blob/c9d4d50aa5d6f96b04fddd5f2386e79047314830/js/tieba-proto.js) | [js/tieba-proto.js](js/tieba-proto.js) | 手写 wire 编辑器；只实现配置激活的 protobuf 分支，按字段表逐项维护 |

原始 amdc、applet、cainiao_json 在 2026-01-19 的提交只删注释联系方式；其中 AMDC 的上次逻辑调整为 2025-11-14，菜鸟为 2025-04-07。修改日期不等于业务逻辑更新日期。

漫画采用 20 条 JQ；闲鱼采用 11 条 JQ 加 AMDC；墨迹采用 1 条 JQ 和原生拒绝/响应映射。它们没有遗漏同名运行 JS。当前模块共有 Rule 4、URL Rewrite 2、Map Local 32、Body Rewrite 51、Script 7；7 条 Script 只引用 5 份自有 JS。这些是本次基线，不是未来必须维持的数量。

## 必须延续的修正

| 范围 | 不能被上游旧写法覆盖的行为 |
| --- | --- |
| 成功/错误与未知结构 | Bili 显式失败 code、Goofish/Cainiao 的 FAIL_ 信封保留原数据；菜鸟合并子响应各自判断。高德正常 code=1 不作为失败。集合出现未知判别字段时优先保留；不凭空补成功 UI。 |
| JS 与 JQ 真值 | JS 的 0、空字符串、null、false 与 JQ 判断不同；高德 Object.values 数字索引键顺序也需保留。 |
| 小程序 | 后缀键、文章说明、data-unit-id、注释及 script/style 等原文不能误改；精确属性、引号、转义、完整 JSON 校验和无损数字保护继续有效。 |
| 车来了 | 只保留首页、我的、路线规划，删除保留项 picUrl/clickIconUrl；保留 YGKJ 包装、无关字段和数值原文，未知/重复键整体放行。 |
| AMDC | 请求阶段、头名大小写不敏感、UA 值保持原区分大小写；HTTP 200、text/plain UTF-8、ddgksf2013；无需正文、5 秒、一次 done。共享文件改动同时影响三组来源，还要检查与 StartUpAds 重叠。 |
| 原生响应 | 空 200、JSON 字典 `{}`、透明 GIF 与直接 reject 分别维护；字典显式 application/json，不能统一替换成一种拒绝方式。 |
| 贴吧 | 普通视频默认保留；pb cmd 精确匹配；singular 重复消息合并和 last-present scalar 判断正确。未知字段/顺序/64 位数值字节保持原样；已知字符串 UTF-8 在删除前校验，坏帧整体透传。 |

详细依据保存在各来源 [audits](audits) 与 [兼容性说明](../docs/compatibility.md)。审计中“本来源的 MITM”指它贡献的主机范围，合集实际使用八来源的并集。贴吧源字段表、两个 pb cmd 的差异、最大 1 MiB/100000 字段/深度 12 及未激活分支见 [TieBa 审计](audits/TieBaAds.md)。

## 冻结与归属

- 冻结文件保持原 CRLF/尾空白；[.gitattributes](../.gitattributes) 只对 references 范围豁免格式化，SHA-256 仍核对原字节。不借机格式化源快照。
- 修改来源及实现时，保留旧仓库提交用于恢复快照，并更新受影响 manifest 项、审计、分组 ID 和行为样例。只获取一个来源时不要把未核对的其他来源写成“已同步最新”。
- app2smile 参考源码保留相邻 [MIT 声明](../references/moyu-independent/scripts/tieba-proto.LICENSE.md)，已核对 Git blob 为 `d448042e50096ce6482b86199249f543951e051b`。这份许可不自动覆盖其他作者的来源。
- 获取源配置成功、脚本可下载、本地校验通过、真实 App 生效是不同证据；不能用其中一种代替另一种。
