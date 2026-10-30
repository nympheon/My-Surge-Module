# My-Surge-Module：AI 维护交接

本文件供后续 AI 更新上游规则时读取，不是面向订阅者的 README。形成日期：2026-10-31。

## 先确认当前状态

- 仓库：`https://github.com/nympheon/My-Surge-Module`，发布分支为 `main`。
- 本文件形成时，最后已发布提交为 `6ccf2ba7ba12f9cc05e1fa7e69fc3301852cfd45`，内容是删除四份 README。
- 更早的发布提交：`63268de` 发布 StartUpAds；`ecb111c` 发布三个 kelee 模块。提交缩写仅供定位，不能当作未来最新状态。
- 开始工作先运行 `git status --short`、`git log`、`git fetch` 并核对远端。保留已有未提交内容；需要时使用独立检出，不把其他会话的改动带入。
- 用户先审阅本文件，随后于 2026-10-31 明确授权将 `AGENTS.md` 提交并推送。后续任务按用户当次指令决定是否发布。
- 用户已删除所有 README，不要在常规更新中重新创建宣传、安装介绍类 README。

## 用户已经确认的维护方式

1. **逐条手工转换、优化和检查，不写批量转换器重新生成模块。** 下载、差异分析、统计、校验程序可以使用，但不能用来覆盖生成发布模块。
2. 同时兼容 Surge Mac 和 iPhone/iPad。当前共同版本下限为 Mac 5.9 / iOS 5.14，因为使用了原生 JQ。
3. 优先使用合适的 Surge 原生 Rule、URL Rewrite、Map Local、Body Rewrite/JQ。需要复杂 HTML、二进制协议或异步请求时保留明文 JS。
4. 用户已选择的页面精简、微信/QQ 外链功能也属于范围；不要擅自缩成“纯广告”，也不要额外加入会员伪装、地区修改或其他新功能。
5. 每个模块使用独立目录，名称和已发布 URL 保持稳定。运行脚本、静态 JSON、网页 JS、图片均由本仓库托管。
6. 这是按用户发起请求进行的人工维护，没有定时同步或自动转换任务。讨论某个外部规则集不等于授权把它加入仓库。
7. 不把个人完整配置、节点凭据、API 密钥、MITM 私钥或捕获到的账户数据提交到仓库。不顺带更改用户正在运行的 Surge。

## 当前发布结构与用途

原始地址统一以以下前缀开头：

```text
https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/
```

| 模块入口，相对于仓库根目录 | 运行依赖 | 用途 |
| --- | --- | --- |
| `MoyuAds/MoyuAds.sgmodule` | `MoyuAds/js/`，5 个 JS | 墨鱼八来源完整净化合集，替换原八个独立入口 |
| `StartUpAds/StartUpAds.sgmodule` | `StartUpAds/js/`，19 个 JS | 墨鱼去开屏合集的 Surge 手工移植 |
| `kelee/kelee.sgmodule` | `kelee/js/`，11 个 JS；`kelee/resources/`，3 个静态资源 | 已选 52 项可莉插件的集合，含外链功能和页面精简 |
| `kelee-HTTPDNS/kelee-HTTPDNS.sgmodule` | 无 JS | 可莉 `Block_HTTPDNS` |
| `kelee-JDPrice/kelee-JDPrice.sgmodule` | `kelee-JDPrice/js/JD_Price.js` | 慢慢买参数捕获、京东商品页比价 |

不要把本地文件系统路径写回 `script-path`、Map Local 的资源地址或正文内的图片 URL。这里的仓库托管只针对脚本和静态资源下载地址：URL 正则匹配的业务主机、慢慢买等实际 API 地址仍是目标服务，不能一起替换成仓库 URL。不要把这些既有入口合并、重命名或替换成第三方动态转换链接。

## 墨鱼八来源合并模块

用户随后明确要求把八个独立模块合并为一个入口。统一入口为 `MoyuAds/MoyuAds.sgmodule`，覆盖 AmapAds、Applet、BiliBiliComicsAds、CainiaoAds、CheLaiLeAds、GoofishAds、MoJiWeatherAds、TieBaAds。保留完整净化、96 条来源映射和七条原 Script 声明；三份字节相同 AMDC 文件合为一个，配套五个运行 JS 均位于 `MoyuAds/js/`。原脚本匹配条件和各节内顺序保持不变，单个 MITM `%APPEND%` 使用原主机去重并集。用户这次要求替换八入口，覆盖之前保持这八个入口名称稳定的约定。

用户先要求“不要改我的 Surge，你先只做模块”，随后明确要求“仓库里也只保留一个模块”，因此本次授权将这八个独立入口在仓库中替换为 MoyuAds 合集，并发布配套五份 JS。旧八个运行目录和模块入口删除，审计迁入 MoyuAds/audits；冻结来源保留。此授权只涉及仓库，不安装、切换设备模块或更改证书。设备订阅以后需移除旧八入口并添加一个合集，仓库变更不自动操作用户设备。StartUpAds 和三个 kelee 模块继续独立保留。

来源快照和 SHA-256 仍在 `references/moyu-independent/manifest.json`；每个来源审计在 `MoyuAds/audits/<来源名>.md`，`# @source` 与 Sxxxx 共同区分原始行号。总索引 `docs/moyu-independent-modules.md`、兼容性 `docs/compatibility.md`。根 `tests/` 通过实际合并模块的来源分组运行已有行为 fixtures；parseSource 只是测试视图，不生成或发布虚拟子模块。`tests/merged-module.test.js` 对照已发布 74662af 的规则、顺序、JS 字节和 MITM 并集。未来有意更新规则时应审查并更新相应基线，不能为保数字而删断言。

`npm test` 和 `npm run test:jsc` 服务于本合集及明确列出的 StartUpAds 重叠/字节身份检查，不是旧 StartUpAds 完整测试框架，也不替代 kelee/checks。合集与其他广告合集任意开关顺序没有全面验收；iOS、历史版本和各 App 实际流量仍未全量验收。原 StartUpAds、三个 kelee 模块及资源字节保持已发布版本；不重新创建 README。

## 阅读顺序

1. 本文件。
2. `kelee/SOURCES.md`：固定上游提交、作者、已修正缺陷、返回类型和重叠规则的取舍。
3. `kelee/selected-plugins.txt`：用户选定的 54 个来源名称和原始 URL。
4. 本次涉及的 `.sgmodule`、其运行 JS/静态资源及对应 `kelee/checks/` 样例。
5. 更新 StartUpAds 时，再阅读下面的专门说明；不能把 kelee 的测试覆盖外推到 StartUpAds。

## StartUpAds 的来源与基线

- 上游入口：`https://ddgksf2013.top/rewrite/StartUpAds.conf`，输入为 Quantumult X 重写配置。
- 已采用快照获取于 2026-10-30，上游正文标注更新日期为 2026-08-29。
- 原始配置 SHA-256：`9a3443554fe38d94c1b65d648c89f408c87574c674d4a7f4550c758d5d75639b`。
- 基线有 504 条有效输入：排除 2 条，保留 502 条来源映射；三组相同规则合并后为 499 条原生指令。
- `Sxxxx` 注释对应**这一冻结快照的原始行号**，不是跨版本稳定 ID。上游插行后必须按 URL、动作和参数识别变化，不能直接按同号覆盖。
- 排除源行 33 的版本展示伪 URL、源行 724 的 TestFlight 商店区域修改；原先注释禁用的内容维持禁用。
- 三组重复输入：源行 `160/186`、`265/420`、`831/861`，每组只有一份输出，但保留两条来源编号。

原始脚本一般来自：

```text
https://raw.githubusercontent.com/ddgksf2013/Scripts/master/<文件名>
```

例外是百度地图：`https://raw.githubusercontent.com/app2smile/rules/master/js/baidumap.js`。

当前发布的 19 个 JS 文件名与对应上游文件名一致，唯有本地拼写需要特别区分：StartUpAds 使用 `hanglvzongheng.js`，kelee 使用 `Umetrip_remove_ads.js`；它们并不是可直接互换的同一个脚本。

另有 6 个上游脚本已手工替换成原生能力，更新时不能把“没有同名 JS 文件”误判为遗漏：

| 原上游脚本 | 当前实现 |
| --- | --- |
| `123pan.js` | 原生文本重写，只保留本合集实际启用的 HTML 广告开关 |
| `dict.js` | Map Local，200 空 JSON 对象 |
| `iqiyi_open_ads.js` | JQ 删除 `adSlots`，保留未知数据结构 |
| `qidian.js` | JQ 清理指定广告字段，保持 JavaScript 真假值语义 |
| `quark.js` | JQ 删除 `result` 中键名含 `cms_` 的内容 |
| `startup.js` | JQ 处理本合集启用的京东 `delivery_show` 时间字段 |

重要实现不能被上游旧逻辑覆盖：

- 12306 在请求阶段读取正文 `placementNo`，使用原生合成响应；不要改成 kelee 那个只检查请求头并中止的实现。
- AMDC、航旅纵横、农业银行、平安健康在请求阶段判断。缺少条件、未知业务操作正常放行；头名按大小写不敏感处理。
- 百度地图使用二进制模式，保留 BE32 帧头长度、protobuf 未知字段、非广告消息和偏移关系，正确重算长度与 MD5。
- 解析并重新序列化 JSON 的 StartUpAds 脚本有数字往返保护；不要让超过安全整数的 ID、高精度小数、`-0` 等因 JSON.parse/stringify 被静默改写。回归样例需要检查原始文本，不能把期望值也先解析后比较而掩盖舍入。
- 原生拒绝响应区分空正文、`{}`、透明 GIF，不能都改成 `REJECT`。
- Script 声明中带逗号的 URL 正则需要正确引号；保留按请求/响应阶段及二进制模式确定的声明。
- 对疑似失效、标注 invalid、证书锁定或缺真实请求的接口，不声称已验证当前有效。

### StartUpAds 的历史资料在哪里

StartUpAds 的以下**旧版完整**源快照和测试框架未迁入发布仓库（新独立模块的 tests/package.json 不属于这套旧框架）：

```text
references/moyu/StartUpAds.conf
references/moyu/manifest.json
references/moyu/scripts/             25 个冻结上游 JS
docs/startup-rule-audit.md
docs/script-audit.json
docs/COMPATIBILITY.md
tests/、package.json（旧 StartUpAds 完整框架，非新增独立模块测试）
```

这些仍保留在旧本地工作区。当前机器可检查：

```text
$HOME/Documents/Codex/2026-10-30/c/work/My-Surge-Module/
```

2026-10-31 交接核对时，该旧工作区的 StartUpAds 模块及 19 个运行脚本与已发布文件逐字节一致，但旧工作区还有其他未提交改动，不能直接把整个目录提交。

旧资料存在时，先取回快照、manifest 中的原始 URL/哈希及审计表，再比较新上游。旧资料不存在时，当前模块和 Git 历史仍可作为行为基线；明确说明无法重跑旧源的完整差分，不能编造快照、历史脚本或覆盖结论。

旧测试框架中曾有 `npm test` 65 项通过、JavaScriptCore 289 次调用通过的记录；这是历史证据，**不是新克隆仓库可直接执行的命令，也不是对未来更新的验证**。

## kelee 系列的来源与范围

- 最初选择 55 项，后来用户删除“防 DNS 泄漏”，最终为 54 项。
- 其中 `Block_HTTPDNS` 和 `JD_Price` 分开发布，其余 52 项进入 `kelee`。
- `Weixin_external_links_unlock`、`QQ_Redirect` 已明确选择，必须保留。
- 依赖无法取得的外部 `jq_file` 的高德、哔哩哔哩、Reddit 等项目未加入。哔哩哔哩漫画是另一项已选来源，不能混淆。
- 主要可读镜像：`bunizao/Mirrored`，基线提交 `a8e1cbf97a2298a5f64412fcd1c6deb11d5de4f6`，文件位于 `Chores/sgmodule/`、`Chores/js/`。
- 原 Loon 对照：`Moli-X/Tool`，基线提交 `bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d`，目录 `Loon/Plugin/Kelee/`；当时可读 41 项，不是完整 54 项。
- kelee 原站曾返回不可读内容/错误，镜像经过用户抽查认可。但下载成功、只有元数据的空壳、脚本正文齐全是三种不同状态，不能混为“源码已取得”。
- 固定资源副本及原作者详见 `kelee/SOURCES.md`。优先使用固定提交复现旧版，再另外获取最新版本；不要把随时变化的 `main/master` 当冻结基线。

### 必须保留的修正

详细条目见 `kelee/SOURCES.md`，尤其注意：

- 12306：Loon 裸 `$done()` 的中止语义要改成 Surge `$done({abort:true})`；只拦截那五个 Operation-Type。
- 航旅纵横：修正源正则协议/分组；按 `rpid` 条件拦截，不能恢复整个业务接口的无条件拒绝。
- 酷安：JQ 管道切换上下文前先绑定 entityId，否则可能误删全部正常条目。
- IT之家：参数不能按 Loon 对象方式读取；默认不删全部横幅、不删置顶文章。贴吧过滤推荐视频默认开启，传入布尔文本，不嵌套额外引号。
- JS 与 JQ 的真假值不一致：JQ 将 `0`、空字符串视为真；斗鱼、IT之家和彩云必须保留已修正的等价判断。
- QQ：镜像遗漏全部 8 条重定向，已从原 Loon 恢复；未来不能只依据镜像把它们删掉。保持现有捕获结果编码，不额外重复解码。
- 微信外链：保留缺模板放行、异常结束保护；不要恢复未定义 resolve、拼写 ture 或多次 `$done` 的上游缺陷。
- 顺丰：原响应被截断，现用完整有效 JSON；不要重新下载截断片段覆盖资源。
- 拼多多：网页 chunk 使用本仓库 Map Local；保留 6 个原模块 ID 及广告空组件导出，不能直接删除两个模块导致页面 import 报错。
- 京东比价：捕获分支调用 `$done({})`，不在通知/日志展示凭据；保留原价格 API/计算逻辑及 70 秒查询超时。
- 茶颜悦色原图随本仓库托管，正文图片 URL 也必须使用本仓库地址。
- 保留已确认的状态码、Content-Type、对象/数组/字符串类型。尤其不能擅自把源配置中的字符串 `"{}"`、`"[]"` 换成对象/数组。
- 保留对象删除的合并优化；数组索引删除不能随意合并或重排，否则会因索引移动改变结果。

历史 kelee JSON 脚本的异常保护不等同于 StartUpAds 全面的数字往返保护；不能把一组模块的验证结论外推到另一组。后续修改 JSON 处理时，应增加长数字、转义和未知结构的有意义样例，再决定是否调整实现。

## 更新上游时的工作步骤

1. **确认范围和基线**：本次更新哪个模块、用户是否授权新增插件/功能、是否只本地审阅。先保存当前 Git 提交和上游快照/哈希。
2. **分别比较配置与依赖**：同一个配置 URL 没变化，引用 JS、JQ、图片、静态 JSON 仍可能变化；需要核对引用链，不只看头部更新时间。
3. **逐条列增删改**：按 URL 谓词、方法、请求/响应阶段、条件头、返回方式和参数判断，不只按应用名或正则文本去重。
4. **手工修改**：保留本仓库已确认修正和用户选择。未知新结构优先保留原响应；不因为接口名称含广告词就拒绝整个公共业务接口。
5. **维护依赖和引用**：只带需要的文件，保持各自模块目录和作者信息。脚本和静态资源下载地址应指向本仓库真实路径，核对大小写；业务 API 和匹配目标不在此列。
6. **验证**：运行受影响的行为样例和语法检查，加入本次修复的正反案例。验证正常内容保留、缺字段/错误响应、单次 `$done`、返回类型、二进制完整性及 JS/JQ 语义。
7. **记录与审阅**：更新源码版本/哈希和变更说明。报告实际修改与仍未验证的范围；用户要求先看时停在本地，不提交、不推送。
8. **获得发布授权后**：检查 diff、只提交本任务文件，以正常快进方式推送。远端推进先重新整合，不能强推覆盖别人改动。
9. **发布后核验**：回读远端提交，再下载受影响的模块及其运行资源，与本地提交逐字节/哈希核对；不能只看到 push 成功就宣称订阅完整可用。

## 仓库内可运行的检查

在仓库根目录运行，需要 Python 3、Node.js、jq 和 Surge Mac CLI：

```sh
python3 kelee/checks/validate.py
node kelee/checks/runtime.cjs
python3 kelee/checks/jq.py
git diff --check
```

- `validate.py`：只检查三个 kelee 模块，校验本仓库资源引用、单独/组合 Surge 语法、JQ 编译、JS 语法和静态资源格式。
- `runtime.cjs`：读取当前仓库脚本，所有网络、通知和持久化均为替身；包含独立目录的京东比价脚本。
- `jq.py`：执行当前 kelee 原生 JQ，覆盖 IT之家参数、正常内容保留及已修正的真假值差异。
- 这些都是验证程序，不是模块转换器。它们**不验证 StartUpAds，也不安装或启用模块**。
- 校验器目前写死了 15 个运行资产的基线断言。若本次确实新增/删除资产，需要审核新的预期数量和引用后再更新断言，不得为“变绿”直接删除检查。
- Surge `--check` 面向完整配置。含 Rule 的模块需要在临时完整配置中补 FINAL；发布模块自身不能含 FINAL。临时验证可把远程资源替换成对应本地文件，以检查本次候选内容。
- Git 暂存后的变更还需 `git diff --cached --check`，并核对精确文件列表。

形成交接时的已发布基线：

| 项目 | Rule | Body Rewrite | Map Local | URL Rewrite | Script 声明 |
| --- | ---: | ---: | ---: | ---: | ---: |
| StartUpAds | 6 | 22 | 435 | 16 | 20，引用 19 个 JS |
| kelee | 438 | 142 | 205 | 9 | 11 |
| kelee-HTTPDNS | 112 | 0 | 6 | 0 | 0 |
| kelee-JDPrice | 0 | 0 | 0 | 0 | 2，引用同一个 JS |

2026-10-31 发布时三个 kelee 模块的证据为：141 条 JQ 编译、13 个 JS 语法、77 项脚本断言、31 组 JQ 样例通过；3 个模块与 15 个资源的 18 个 raw URL 均回读一致。这里的 13 个 JS 包括 12 个运行脚本和 1 个网页静态 JS。

这些数字是历史基线，不是更新后必须维持的业务目标。不得通过删规则、删样例或硬编码输出维持数字。修改后必须重新运行适用检查，依据实际结果报告。

## Surge 兼容性与验收边界

- 模块仅使用内部策略；不增加 FINAL、用户代理节点或代理组，不覆盖用户 MITM 证书。
- MITM 主机使用 `%APPEND%` 并按实际 HTTPS 规则核对；有需要时明确端口，不使用全主机 `*` 或顺带关闭证书校验。
- 同一个请求方向、响应方向分别最多执行一个匹配脚本。重复名称、重叠 pattern 及跨模块优先级需要检查。
- `[URL Rewrite]` 先于 `[Body Rewrite]` 和响应脚本处理；把公共业务接口直接 reject 可能遮住精细正文过滤。
- 原生 JQ 的 iOS 响应大小限制、脚本缓冲/内存限制及平台共同支持的 API 都需要考虑；不能把 Node VM 通过当作 JSC、iOS 或实际流量通过。
- 两个广告合集可能覆盖同一 App。不得宣称同时开启 StartUpAds、kelee 以及其他广告模块一定更好；需按具体重叠接口分析。
- 对 blackmatrix7 Advertising 和 AWAvenue 的讨论只是比较与提供地址，没有把它们作为本仓库新来源的授权。
- 尚未逐一完成 Mac/iOS 全部目标 App 的真实请求验收。链接可下载、上游近期提交、语法通过与广告实际消失是不同证据。

## 设备配置与本任务分开

- Surge 独立模块开关不是 `.conf` 中的 `[Module]` 字段；未知段可能被保留而不报错，不能用语法 OK 推断模块已安装/启用。
- 开关由设备上的模块管理状态控制，Mac 与 iPhone 分别设置；不要承诺修改一份共享主配置就同步了模块状态。
- 本会话曾讨论修改 Downloads 中的 mac/iphone 配置，但没有执行合并或安装，也没有完成“电脑关闭、手机开启”。不应向用户报告这些已完成。
- 如用户后续要求操作实际设备/配置，重新确认当前文件和运行状态；本仓库的维护、测试、推送不等于修改设备配置的授权。

## 官方资料

- 模块与参数：`https://manual.nssurge.com/profile/module.html`
- 配置格式：`https://manual.nssurge.com/profile/format.html`
- HTTP 处理顺序：`https://manual.nssurge.com/http/overview.html`
- 正文/JQ：`https://manual.nssurge.com/http/body-rewrite.html`
- Map Local：`https://manual.nssurge.com/http/map-local.html`
- Script 声明/API：`https://manual.nssurge.com/scripting/overview.html`、`https://manual.nssurge.com/scripting/api.html`
- CLI：`https://manual.nssurge.com/tools/cli.html`

软件能力和远端状态会变化。以后更新时查实际版本、当前官方文档和源码，不把本交接记录当作永远有效的产品说明。
