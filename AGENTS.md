# My-Surge-Module：AI 维护交接

本文件供后续 AI 更新上游规则时读取，不是面向订阅者的 README。维护核对日期：2026-10-31。

## 先确认当前状态

- 仓库：`https://github.com/nympheon/My-Surge-Module`，发布分支为 `main`。
- 本次文档增补前核对的运行代码发布基线为 `0d9342efba3019f0814ee65f8a69202fe977ce61`：八个墨鱼独立模块已合为 MoyuAds，原八运行目录已删除。这是运行代码的历史锚点，未来必须重新核对远端，不能当作永远最新的 HEAD。
- 历史节点：`63268de` 发布 StartUpAds；`ecb111c` 发布三个 kelee 模块；`74662af` 包含合并前八个独立墨鱼模块；`0d9342e` 合并为一个 MoyuAds。完整锚点见各模块维护说明。
- 开始工作先运行 `git status --short`、`git log`、`git fetch` 并核对远端。保留已有未提交内容；需要时使用独立检出，不把其他会话的改动带入。
- 本次用户要求直接完善现有交接文件，供未来 AI 维护。后续任务按当次要求确定本地/发布范围；已有明确授权就继续完成，不重复询问同一授权。仓库发布授权不包含设备配置操作。
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
| `kelee/kelee.sgmodule` | `kelee/js/`，11 个 JS；`kelee/resources/`，3 个静态资源 | 已选 54 项可莉插件的集合，含外链功能和页面精简 |
| `kelee-HTTPDNS/kelee-HTTPDNS.sgmodule` | 无 JS | 可莉 `Block_HTTPDNS` |
| `kelee-JDPrice/kelee-JDPrice.sgmodule` | `kelee-JDPrice/js/JD_Price.js` | 慢慢买参数捕获、京东商品页比价 |
| `kelee-YouTube/kelee-YouTube.sgmodule` | `kelee-YouTube/js/`，2 个 JS | 独立 YouTube 去广告与原插件增强，保留经用户同意的作者 Worker |

不要把本地文件系统路径写回 `script-path`、Map Local 的资源地址或正文内的图片 URL。这里的仓库托管只针对脚本和静态资源下载地址：URL 正则匹配的业务主机、慢慢买等实际 API 地址仍是目标服务，不能一起替换成仓库 URL。不要把这些既有入口合并、重命名或替换成第三方动态转换链接。

## MoyuAds：后续更新的入口

- [来源与实现映射](MoyuAds/SOURCES.md)：八配置/七原脚本的固定版本、SHA-256 入口、原生 JQ 与五份运行 JS 的对应关系、必须延续的修正。
- [更新操作手册](MoyuAds/MAINTENANCE.md)：逐条比较与手工更新、冻结来源/ID 的维护、测试基线陷阱、检查命令、发布回读和下一次交接。
- [逐来源审计](MoyuAds/audits)：完整 96 条映射与已确认差异；[兼容性与共存](docs/compatibility.md)；[行为索引](docs/moyu-independent-modules.md)。

当前一个 MoyuAds 入口覆盖高德、小程序、漫画、菜鸟、车来了、闲鱼、墨迹、贴吧；包含完整正常 UI/搜索/推荐精简，七条原 Script 声明共用五份自有 JS。`references/moyu-independent/manifest.json` 的 modules 是八个来源分组，不是八个待发布模块。不要恢复旧运行目录。`# @source` 与该分组下 Sxxxx 共同标识原配置物理行；上游插行后按 URL/阶段/动作识别，不按编号盲目覆盖。

特别注意 `tests/merged-module.test.js` 固定读取合并前 `74662af` 的旧路径，合法更新也会触发规则/JS 原文相等断言。不能直接把 base 换成已删除旧路径的当前提交，不能仅为测试变绿删除保护；按操作手册为允许的变化建立新行为样例和明确基线。根 integration 另固定 StartUpAds 的 `63268de` 字节身份。当前 96 源行、5 JS、7 Script 是基线统计，未来有意变更时逐项审查并维护，不能把数量当成永久业务目标。

用户要求仓库中八来源只保留一个 MoyuAds 合集；StartUpAds 和 kelee 系列继续独立，其中 YouTube 按本次要求独立为 `kelee-YouTube`。仓库维护、下载回读、离线解析均不意味着安装/启用 Surge；不得顺带切换用户设备模块、改在线配置或证书。

## 阅读顺序

1. 本文件，然后确认当前 Git/远端与本次用户范围。
2. 更新 MoyuAds：SOURCES、MAINTENANCE、相关来源 audit、实际模块/JS、相关 tests；这些文件都在仓库，不依赖旧机器或临时日志。
3. 更新 kelee：`kelee/SOURCES.md`、`kelee/selected-plugins.txt`、受影响模块/资源和 kelee/checks；不把 root tests 的结论外推到这组模块。
4. 更新 StartUpAds：先读下节，确认旧资料是否实际存在；根测试没有它全部 19 份脚本的完整原始框架。不要依据缺失路径编造历史验证。
5. `docs/superpowers/` 是历史设计/计划背景，不是当前发布状态；其中未勾选步骤或过去的本地限制不覆盖最新用户指令与实际远端证据。

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

StartUpAds 的以下**旧版完整**源快照和测试框架未迁入发布仓库（仓库根目录的 tests/ 和 package.json 服务于 MoyuAds，不属于这套旧框架）：

```text
references/moyu/StartUpAds.conf
references/moyu/manifest.json
references/moyu/scripts/             25 个冻结上游 JS
docs/startup-rule-audit.md
docs/script-audit.json
docs/COMPATIBILITY.md
tests/、package.json（旧 StartUpAds 完整框架，非当前 MoyuAds 测试）
```

完整旧资料没有一起迁入仓库。维护时可在本机尝试检查下面的历史位置，但未来 AI 不能假设新机器存在这个路径，也不能依赖该路径才能维护 MoyuAds：

```text
$HOME/Documents/Codex/2026-10-30/c/work/My-Surge-Module/
```

2026-10-31 交接核对时，该旧工作区的 StartUpAds 模块及 19 个运行脚本与已发布文件逐字节一致，但旧工作区还有其他未提交改动，不能直接把整个目录提交。

旧资料存在时，先取回快照、manifest 中的原始 URL/哈希及审计表，再比较新上游。旧资料不存在时，当前模块和 Git 历史仍可作为行为基线；明确说明无法重跑旧源的完整差分，不能编造快照、历史脚本或覆盖结论。

旧测试框架中曾有 `npm test` 65 项通过、JavaScriptCore 289 次调用通过的记录；这是历史证据，**不是新克隆仓库可直接执行的命令，也不是对未来更新的验证**。

## kelee 系列的来源与范围

- 最初选择 55 项，后来用户删除“防 DNS 泄漏”，形成 54 项基线；2026-10-31 新增墨迹天气、360 智慧生活和 YouTube，目前为 57 项。
- `Block_HTTPDNS`、`JD_Price`、`YouTube_remove_ads` 分别独立发布，其余 54 项进入 `kelee`。丰巢已明确排除。新增来源冻结于 `references/kelee-additions/`，映射及校验入口见 `kelee/SOURCES.md` 与 `kelee-YouTube/SOURCES.md`。
- 用户明确要求 YouTube 独立模块，并在得知加密播放初始化请求会经过作者 `init-stream.maasea.workers.dev` 后，选择保留原源完整行为。不要把该运行服务依赖误写成仅下载两个 JS。更新时须重新核对引用链，不能默认服务端行为已审计。
- 2026-10-31 用户明确要求删除将 kelee 文件锁定到历史字节的保护测试；该测试和临时替代的增量锁定测试均已删除。后续维护使用实际行为、资源引用和语法检查，不恢复这条历史锁定。
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
2. **分别比较配置与依赖**：同一个配置 URL 没变化，引用 JS、JQ、图片、静态 JSON 仍可能变化；先取到临时目录，与冻结基线逐字节比较，区分注释/地址变化和业务逻辑变化。记录实际引用链和固定提交/哈希，不只看头部更新时间。MoyuAds 的映射与特殊重命名见 SOURCES。
3. **逐条列增删改**：按 URL 谓词、方法、请求/响应阶段、条件头、返回方式和参数判断，不只按应用名或正则文本去重。
4. **手工修改**：保留本仓库已确认修正和用户选择。未知新结构优先保留原响应；不因为接口名称含广告词就拒绝整个公共业务接口。
5. **维护依赖和引用**：只带需要的文件，保持各自模块目录和作者信息。脚本和静态资源下载地址应指向本仓库真实路径，核对大小写；业务 API 和匹配目标不在此列。
6. **验证**：运行受影响的行为样例和语法检查，加入本次修复的正反案例。验证正常内容保留、缺字段/错误响应、单次 `$done`、返回类型、二进制完整性及 JS/JQ 语义。
7. **记录与审阅**：更新受影响快照/manifest、固定源码版本/哈希、来源 ID、审计和变更说明。保护未受影响来源的原字节。报告实际修改与仍未验证的范围；用户要求先看时停在本地，不提交、不推送。
8. **获得发布授权后**：检查 diff、只提交本任务文件，以正常快进方式推送。远端推进先重新整合，不能强推覆盖别人改动。
9. **发布后核验**：回读远端提交，再下载受影响的模块及其运行资源，与本地提交逐字节/哈希核对；不能只看到 push 成功就宣称订阅完整可用。

## 仓库内可运行的检查

在仓库根目录运行，需要 Python 3、Node.js、jq 和 Surge Mac CLI：

```sh
# MoyuAds 及明确列出的 StartUpAds 身份/重叠检查
npm test
npm run test:jsc

# kelee 三产品检查
python3 kelee/checks/validate.py
node kelee/checks/runtime.cjs
python3 kelee/checks/jq.py
node --test kelee/checks/additions.test.cjs
node --test kelee-YouTube/checks/youtube.test.cjs
npm test
git diff --check
```

- 根 npm 测试读取真实 MoyuAds 和模块自有 JS；无 npm 第三方依赖，不需要先 npm install。需要 Node 18+、jq、macOS Surge CLI，JSC 重放另需 Swift 与系统 JavaScriptCore。详见 MoyuAds/MAINTENANCE。
- `validate.py`：检查四个 kelee 模块（含独立 YouTube），校验本仓库资源引用、单独/组合 Surge 语法、JQ 编译、JS 语法和静态资源格式。
- `runtime.cjs`：读取当前仓库脚本，所有网络、通知和持久化均为替身；包含独立目录的京东比价脚本。
- `jq.py`：执行当前 kelee 原生 JQ，覆盖 IT之家参数、正常内容保留及已修正的真假值差异。
- `kelee/checks/` 与 `kelee-YouTube/checks/` 都是验证程序，不是模块转换器；它们不负责 StartUpAds。根 `npm test` 有该产品的部分语法/保留检查，不等于旧完整测试框架。这些命令均不安装或启用模块。
- 校验器原有 15 个运行资产；本次经审核添加两个 YouTube JS，目前断言为 17。后续确实新增/删除资产时，需审核新的预期数量和引用再更新断言，不得为“变绿”直接删除检查。
- Surge `--check` 面向完整配置。含 Rule 的模块需要在临时完整配置中补 FINAL；发布模块自身不能含 FINAL。临时验证可把远程资源替换成对应本地文件，以检查本次候选内容。
- Git 暂存后的变更还需 `git diff --cached --check`，并核对精确文件列表。

2026-10-31 核对的运行代码基线（0d9342e，后续可能变化）：

| 项目 | Rule | Body Rewrite | Map Local | URL Rewrite | Script 声明 |
| --- | ---: | ---: | ---: | ---: | ---: |
| MoyuAds | 4 | 51 | 32 | 2 | 7，引用 5 个 JS |
| StartUpAds | 6 | 22 | 435 | 16 | 20，引用 19 个 JS |
| kelee | 438 | 142 | 205 | 9 | 11 |
| kelee-HTTPDNS | 112 | 0 | 6 | 0 | 0 |
| kelee-JDPrice | 0 | 0 | 0 | 0 | 2，引用同一个 JS |

2026-10-31 发布时三个 kelee 模块的证据为：141 条 JQ 编译、13 个 JS 语法、77 项脚本断言、31 组 JQ 样例通过；3 个模块与 15 个资源的 18 个 raw URL 均回读一致。这里的 13 个 JS 包括 12 个运行脚本和 1 个网页静态 JS。

MoyuAds 合并发布基线的历史证据为：269 项根测试、230 次实际 JSC 调用通过；一个合集和五份 JS 的六个 raw 资源逐字节回读一致。根测试也验证实际 MoyuAds、StartUpAds 分别及组合的临时完整配置。没有逐一完成 iOS、历史版本或全部 App 真实流量验收。

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
