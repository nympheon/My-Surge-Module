# YouTube 来源、手工适配与维护

独立入口：`kelee-YouTube.sgmodule`。2026-10-31 用户要求 YouTube 单独发布，墨迹天气及 360 智慧生活放入既有 `kelee`，丰巢不添加。用户已明确选择保留源插件完整行为，包括作者 Worker。

## 冻结来源

原 Loon 插件与两个脚本来自 [Moli-X/Tool](https://github.com/Moli-X/Tool/tree/bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d/Loon/Plugin/Kelee)，固定提交 `bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d`。原始字节存于 `references/kelee-additions/`，不是运行时加载器。脚本作者 Maasea；原配置也保留 VirgilClyne、Choler、DivineEngine、app2smile 的归属。

| 文件，相对冻结目录 | 原始字节数 | 原始 SHA-256 |
| --- | ---: | --- |
| `YouTube_remove_ads.plugin` | 2700 | `81e4607619009539081db25c6f59f20de146834b84f594e17b7e8ac662da8003` |
| `Script/YouTube_remove_ads_request.js` | 44157 | `af0646890f9847aa4576181b0637e31b86a3e2f6dd4d2041a56ffa971aacc10b` |
| `Script/YouTube_remove_ads_response.js` | 133107 | `b926d339069a8f54e84bd5d29e8c8364ee9ea72bb170197e281b04eda49e3568` |

脚本的 Maasea 上游为 `sgmodule/Script/Youtube/youtube.request.js`、`youtube.response.js`。Apache-2.0 原文随本目录 `LICENSE` 保留；它不替代其他来源各自的许可。上述两个冻结脚本的原作者注释保留在运行副本中。

## 映射与适配

- 三条原声明仍分别处理 API 响应、`googlevideo.com/initplayback` 请求与 `log_event` 请求；Protobuf 使用 `requires-body=true,binary-body-mode=true`。脚本完整托管到本模块的 `js/`，不从其他模块加载。
- 请求脚本已有 Surge 适配器，Surge 的 `$argument` 必须是 JSON 字符串；不传 Loon 对象。四个参数在三条声明上统一传递，避免 Worker 分支使用 JS 内部默认值而与用户配置不同。保留可莉默认：三个隐藏按钮开关均 false、字幕语言 `zh-Hans`。
- 只为原请求脚本加异常放行包装；坏 Protobuf、无效参数或缓存不再导致脚本无结束。原响应脚本已有解析异常保护，外层另保留非 HTTP 200 响应。正常数据的原始处理函数未改写。
- 保留原视频、推荐、搜索、Shorts、按钮、字幕/歌词、画中画及后台播放处理，不新增地域或会员状态伪装。对应行为仍受接口和服务端限制，不能承诺付费下载或会员权益。
- `max-size=-1` 沿用作者 Surge 原生模块的无自定大小上限选择，脚本 timeout 为 10 秒。较大二进制响应仍受设备内存限制；没有在历史版本/iOS 扩展中做真实压力测试。
- MITM 仅追加 `*.googlevideo.com`、`youtubei.googleapis.com`。原 Loon 文档要求 HTTP/2 解密及 QUIC 回退；模块不擅自覆盖用户全局设置或证书，需在设备上确保目标 HTTPS 请求实际进入 Surge HTTP 引擎。tvOS 不在支持范围内。

## 作者 Worker：保留的外部依赖

匹配的加密 `initplayback` 请求在缓存 key 一致时改发 `https://init-stream.maasea.workers.dev/`，URL 附 `ck`（播放配置 clientKey）、`target`（原 Google 视频请求地址）及脚本参数；请求本身由 Surge 按修改后的 URL 发送。缓存 key 不匹配时，保留原源逻辑：清掉对应缓存并返回 200 空正文，让客户端回退。

2026-10-31 已向用户说明并获得保留完整源行为的明确选择。Worker 服务端源码未取得，不能确认其内部处理、日志策略或后续媒体流范围；它不受本仓库脚本冻结控制。**把两个 JS 放在本仓库并不会消除这个运行服务依赖。**测试中只检查合成转发结果，没有调用 Worker、Google 播放接口或捕获账户数据。

## 验证与更新

运行 `node --test kelee-YouTube/checks/youtube.test.cjs`：用手工 Protobuf 字节构造正常/广告数据，检查广告消息删除、未知字段和超安全整数原字节保留、按钮参数、Worker URL 参数、缓存回退、正常头保留、坏数据与非 200 放行、单次 `$done`。同一批实际脚本输入/输出在系统 JavaScriptCore 重放，不注入 Node 编解码器；mock 持久化只存在于测试工具。

`python3 kelee/checks/validate.py` 包括本独立模块及四个 kelee 模块的组合语法、所有运行资源引用和 JS 语法检查。根 `npm test` 同时运行本模块及墨迹/360 新增测试。原 kelee、StartUpAds、MoyuAds 各自回归仍保留。

Surge 每个方向只执行首个匹配 HTTP 脚本。其他 YouTube 去广告、Enhance 或字幕脚本可能匹配相同接口；需在设备上选择兼容组合，不宣称同时启用一定叠加。仓库发布与本地样例通过不等于当前 YouTube App 实际去广告验收，也没有安装/启用本模块或修改用户运行配置。
