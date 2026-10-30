# 百度贴吧净化 · Surge 原生版

手工移植墨鱼 TieBaAds 配置的全部 8 条有效规则，以及配置实际调用的 app2smile protobuf 净化分支。包含搜索、抽屉、我的页等完整界面净化；普通视频帖子默认保留。

- 模块：[TieBaAds.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/TieBaAds/TieBaAds.sgmodule)
- 支持语法：Surge Mac 5.9.0+ / iOS 5.14.0+。
- 独立脚本：[js/tieba-proto.js](js/tieba-proto.js)，资源属于本模块，无远程加载器或第三方依赖。
- HTTPS 改写需要用户已有的 MITM 与证书信任配置；模块只追加 `tieba.baidu.com, tiebac.baidu.com`。

二进制脚本只编辑明确识别的 protobuf 字段，保留其余原始字节、未知字段、顺序与 64 位整数。只处理 HTTP 200；未知命令、字段 wire 类型不符、损坏帧或超限整体放行。体积上限 1 MiB，超时 5 秒。详细字段、边界与原行为差异见 [AUDIT.md](AUDIT.md)。

来源：[ddgksf2013 / TieBaAds.conf](https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/TieBaAds.conf)、[app2smile / tieba-proto.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-proto.js)。冻结快照在仓库 `references/moyu-independent/`，仅作离线审计与测试 oracle，不由模块运行。

本地已验证真实 jq、字节级 fixtures、原脚本语义对照、macOS JavaScriptCore 和 Surge 原生配置解析。未启用用户配置，未完成 iOS、旧版本设备或真实 App 全流程验收。上方链接是发布目标；本任务未推送，也未核验远端字节。
