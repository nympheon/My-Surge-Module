# 兼容性、覆盖与验证边界

本批八模块移植的是 2026-10-31 冻结的选定配置，完整保留健康、已支持结构上的净化，包含正常 UI 与功能移除；不是上游全部项目或所有 App 版本的兼容承诺。每个源配置的有效行数为 Amap 19、Applet 5、BiliBiliComics 20、Cainiao 13、CheLaiLe 8、Goofish 15、MoJiWeather 8、TieBa 8，共 96。配置物理行号 Sxxxx、原 URL 谓词、动作与差异在各模块 AUDIT.md；[manifest](../references/moyu-independent/manifest.json)固定八配置和七脚本的 SHA-256/脚本字节数。

## 已验证范围

- 九模块分别、全部九模块共同生成临时完整配置，经本机 `/Applications/Surge.app/Contents/Applications/surge-cli --check` 接受。只调用离线语法检查；未启用模块、切换用户配置、变更证书或安装/卸载 App。
- 所有已发布 StartUpAds 文件直接对照 Git `63268de8cb9b433b04878999dacf1e2965a12d2b` 的真实 20 个 blob，模块和 19 个脚本保持字节身份；冻结源逐一重算 SHA-256。每个运行资源指向本模块 `main/<folder>/js/<file>`，没有跨模块加载器或上游运行资源。
- 真实 jq 的健康输入与冻结原 jq/隔离原脚本差分；未知/错误结构、非法 JSON、非目标大整数和长小数、重叠 jq、原字段/普通内容保留均有 fixtures。原始来源只在测试 VM 中有界执行。
- `npm run test:jsc` 重跑实际行为测试，捕获实际拥有脚本的调用与预期结果；在执行前保存独立输入快照。带类型的边界保留 undefined 和 Uint8Array 子视图范围，再由 Swift 的系统 JavaScriptCore 新建每个 realm 执行真实脚本文件；逐项比较真实输出，二进制按原始字节比较，要求恰好一次 `$done`。七个新增脚本均须有捕获调用，另涵盖 StartUpAds AMDC 重叠测试；没有为重放生成替代产品实现。
- TieBa 包括未知字段/次序/原始数值字节、singular message 合并/重复标量、两种 pb cmd、UTF-8 已知字符串、状态/坏帧/边界体积测试；未知 byte 字段保持不透明。具体字段路径与故意修正见 [TieBa 审计](../TieBaAds/AUDIT.md)。

这些是本地静态检查和受控 fixture/native 引擎证据，不能证明真实网络命中、App 登录/页面全流程、iOS/旧版引擎或服务今后的结构兼容。安装 URL 是发布目标，本地测试不证明远端已发布或字节一致；发布与远端读回另行验证。最低支持语法为 Surge Mac 5.9.0+ / iOS 5.14.0+，并未在这两个历史版本的设备上验收。当前 jq 的数字保留测试也不能代替每版 Surge 内置 jq 的实测。

## MITM、原生响应和共存

启用相应 Rewrite/Scripting/MITM，按设备需要正确配置并信任自己的证书。模块只追加域名，不携带 CA、不启用 skip-server-cert-verify、不要求全局 HTTP/2 或全局 `*` 解密。CheLaiLe 将原 HTTPS IP 目标 124.70.194.16 补入 MITM；其他未覆盖的 HTTPS 主机不会因 URL 正则宽泛而自动解密。Applet 通用 WordPress/小程序 URL 仅在原枚举的域名/有界通配主机上作用，不能保证所有小程序或微信 5 秒开屏。墨迹原 URL 比原 MITM 更宽的限制也保留。

响应脚本 `requires-body=true,max-size=1048576,timeout=5`；TieBa 使用原生 binary-body-mode，必须为 HTTP 200 和 Uint8Array。AMDC 仅处理请求头，不读取正文，timeout=5。原生 Body Rewrite 不接受脚本的 max-size/timeout，体积限制由 Surge 管理（iOS 1 MB、Mac 10 MB），不是统一脚本上限。参考：[Body Rewrite](https://manual.nssurge.com/http/body-rewrite.html)、[Map Local](https://manual.nssurge.com/http/map-local.html)、[请求脚本 response](https://manual.nssurge.com/scripting/http-request.html)。

共存测试具体证明下列重叠输出等价，不推断所有未来配置都无冲突：

| 重叠 | 验证与边界 |
|---|---|
| StartUpAds / Amap / Cainiao / Goofish AMDC | 共用命中 URL `http://amdc.m.taobao.com/amdc/mobileDispatch`，逐一跑全部 11 个原 UA 分支及大小写/未知/缺失/非字符串 UA；命中时 200、text/plain UTF-8、ddgksf2013，否则放行。因此首个匹配脚本决定处理时结果相同；Amap/Cainiao 主机谓词较窄，未扩大源范围。 |
| StartUpAds / TieBa getFeedAd | tiebac.baidu.com `/c/f/ad/getFeedAd` 都为默认 200 空文本，不再进入二进制广告分支。 |
| StartUpAds / Cainiao show、mshow | cn-acs.m.cainiao.com 两个实际 ads.show/mshow 路径都为空 200 文本。 |
| StartUpAds / Goofish splash | acs.m.goofish.com 实际 splash.ads 路径都为空 200 文本；Goofish 还保留自己的 g-acs 覆盖。 |
| StartUpAds / Applet 公众号 | `/mp/getappmsgad` 的 advertisement → ddgksf2013 文本替换，按两个顺序执行均幂等；这是样本语义验证，不是现时公众号生效证明。 |
| StartUpAds / Goofish 域名 | iyes.youku.com 都是 DOMAIN-SUFFIX,REJECT，重复策略相同。 |

## 保留的集成决定及代价

以下决定将内部审查结论固定为可复查的兼容性契约。若假设不再成立，应对照源与实际样本重新审查，不应以扩大解密或静默删功能掩盖问题。

| 决定 | 原因与取舍 | 假设错误时的代价 |
|---|---|---|
| QX reject-200/dict 转原生 Map Local，AMDC 转请求阶段短路 | 保留实际 HTTP 意图，空文本默认 200、字典为 `{}` 且显式 application/json、图片为 tiny-gif；不照搬其他工具声明。每条映射保留在审计中。 | 若原服务依赖不同状态/MIME/时序，可能改变客户端流程；需用端点真实响应回归，不应统一改成 reject 或 JSON。 |
| 未知/错误结构和无法安全处理的数字透传，健康支持结构完整净化 | provider 专用成功/错误信封与结构保护避免将诊断或未来字段清空，修复上游腐坏文本替换。不存在跨提供方通用 code!=0 规则。 | 结构变化时广告可能保留；过严保护会漏清，过松则可能损坏正常数据。 |
| 每个需要 AMDC 的模块拥有独立小脚本 | 单模块可独立安装，不依赖 StartUpAds 或共享外部加载器。 | 多份代码会有维护漂移成本；共存行为测试约束漂移。 |
| Applet 保留枚举 MITM，不按通用 URL 开全局解密 | 保持源范围和用户解密边界，接受范围外 HTTPS 不净化。 | 新主机广告可能遗漏；错误扩大范围会解密无关流量。 |
| 保留旧公众号替换并标明遗留 | 用户选择完整源语义；另一个上游 WeChat.conf 已标过时，不将遗留规则冒充现时功能。 | 可能无效，也可能随服务变化影响返回文本；不要据此承诺公众号净化。 |
| 无损 scalar/span 编辑可在保留不安全数值原字节时继续目标净化 | 旧“含不安全数字整份透传”是针对 JSON.parse/stringify 精度损失的防护；已证明无损编辑无需丢弃全部净化。仍须校验结构/坏数据。 | tokenizer/span 错误可能破坏 JSON 或误改无关内容；原始数字/引号/HTML 边界回归持续约束。 |
| 冻结参考源保持 CRLF/尾空格，只给 references/** 设置 -text -whitespace | 可重现原始 SHA-256，避免为格式化篡改证据；运行时、测试和文档的空白检查继续有效。 | 参考文件有意不检查空白，误改依靠 SHA-256 检出；将豁免扩大到产品文件会掩盖格式问题。 |

## 贴吧选定源与原作者现行模块

本模块只实现 ddgksf2013 TieBaAds.conf 的八条有效源行及其实际调用的冻结 `tieba-proto.js` 分支。app2smile [现行原生模块](https://github.com/app2smile/rules/blob/master/module/tieba.sgmodule)（本次比较标记 260106）还包括 tieba-json.js 的 splash、commonbatch、picpage、sync、普通 JSON feed/forum/post，域名规则集以及更宽 protobuf 端点；这些不在本批选择中，未激活。源本就本地拦截 getFeedAd，adBid 未命中；也未顺手启用多用途脚本的无入口分支。普通视频默认保留，显式原参数行为仍受测。

原作者原生模块同样使用二进制响应 API；它没有强制全局 MITM h2，本项目不添加这个要求。[issue #266](https://github.com/app2smile/rules/issues/266)最初描述 TieBa 22.01/Bili 失败，但报告人随后在 2026-01-26 确认是 HTTPS 解密证书密码错误且已解决，不能据标题断言该 App 版本普遍失效。[issue #271](https://github.com/app2smile/rules/issues/271)是 Shadowrocket 2.282 的 HTTP/2 登录报告，不是已验证 Surge 故障。以上只限定证据解读，不构成本项目的真实 App 验收。

冻结的 app2smile 原脚本只作测试 oracle，保留相邻[原 MIT License](../references/moyu-independent/scripts/tieba-proto.LICENSE.md)，Copyright (c) 2023 app2smile；从原仓库 LICENSE.md 获取，Git blob SHA-1 `d448042e50096ce6482b86199249f543951e051b`。这份许可未被扩展到 ddgksf2013/Cuttlefish 或其他来源；每份源仍保留自己的归属。
