# 给后续 AI 的 MoyuAds 更新步骤

先读根 [AGENTS.md](../AGENTS.md)，再读 [SOURCES.md](SOURCES.md)、本次涉及的来源审计和 [兼容性说明](../docs/compatibility.md)。当前产品是一个合并模块，八份 `.conf` 是冻结来源，不是八个发布入口。不要重建被删除的独立模块。

## 先明确这次更新

1. 查看当前 Git 工作树、提交和远端 main；保留其他会话的未提交内容。确认用户要求更新哪个来源、是否包含 JS 变化及是否已经要求发布。用户要求只本地或不提交时遵守；已明确要求更新仓库时按已授予范围完成，不重复询问同一授权。
2. 记录更新前仓库提交及相关冻结文件 SHA-256。正常克隆需保留测试依赖的历史；若用了浅克隆，按报错取得所需历史提交，不把缺历史误判为规则错误。
3. 本仓库维护不包含启用/安装 Surge 模块、切换配置、修改证书或卸载重装 App。设备操作需要用户另行明确要求。

## 分别比较配置和依赖

按 [manifest.json](../references/moyu-independent/manifest.json) 的实际 URL 获取本次相关配置及其引用脚本。把新内容先保存在任务临时目录，不覆盖冻结基线后才开始比较。

检查 HTTP 状态和完整正文。HTML 错误页、只有元信息的空壳、截断脚本不能当作有效源文件。分别记录配置及每份 JS 的来源提交/哈希；配置没变也可能有 JS 变化。首次导入的固定提交文件见 SOURCES，不依赖旧聊天、被清理的 .superpowers 工作目录、/tmp 日志或另一台机器的本地路径。

逐条比较：URL、方法、请求/响应阶段、头部条件、返回类型/状态/MIME、脚本参数、JQ 表达式和 MITM 主机。将变更分为规则逻辑、脚本逻辑、地址迁移、说明/联系方式、重命名。检查真实 diff，不只看 UpdateTime 或最后一次仓库提交；车来了还需追溯 `.cof` 旧路径。

共享 amdc.js 更新要同时审查 AmapAds、CainiaoAds、GoofishAds 三条声明及 StartUpAds 的已知重叠。StartUpAds 的文件不因为同名自动同步；如果不在本次范围，应先保留并报告有无行为分歧。

## 手工修改与追溯

- 在 [MoyuAds.sgmodule](MoyuAds.sgmodule) 对应 `# @source` 分组手工编辑。优先原生 Rule、URL Rewrite、Map Local、Body Rewrite/JQ；复杂 HTML/包装文本或二进制才维护对应明文 JS。不要写转换器覆盖生成模块。
- 保留完整既定净化及已确认的修正。只处理被选配置实际激活的脚本分支，不因上游多用途脚本或更大合集新增功能而扩展范围。
- 一个原生段只出现一次；保留可能重叠的规则顺序。若合并重复行为，核对阶段、谓词、返回内容和业务例外，并保留所有来源映射。
- 处理原始数字时检查字面量。JSON.parse/stringify 路径必须防精度损失；无损 span 编辑可保留数字原文后定向净化。不要把所有数字先解析成 Number 再与同样舍入的预期比较。
- `Sxxxx` 只在原来源快照内有效。上游插行后按语义对照更新该分组注释、manifest 行数及审计，不能按相同行号盲目覆盖。不同分组重复编号是正常的。
- 配套资源保持 `main/MoyuAds/js/` 自仓地址，业务 API/匹配主机仍为目标服务。所有被引用文件须存在，不跨模块加载；添加资源时审查引用和实际样例。
- MITM 单个 `%APPEND%` 赋值使用所需主机并集，不开全域通配、不改 CA 或关闭服务器验证。通用 URL 不意味着应扩大解密到所有主机。
- 响应脚本正文上限 1048576、timeout=5；AMDC 不读正文。贴吧 binary-body-mode、Uint8Array 和单次 done 保持正确。原生 JQ 没有脚本的 max-size/timeout 参数，平台限制见兼容性文档。
- 受影响源快照与 manifest 更新时保留原始字节，注明哪些来源核对过及获取时间；旧版从更新前 Git 提交恢复。同步 SOURCES 固定版本、审计差异及新增/修正的行为测试。

## 现有测试的基线陷阱

当前 `tests/merged-module.test.js` 是首次合并的迁移保护，不是允许任意更新后仍原样成立的规范：

- 它读取 `74662af52b4a2c581aef34e17cbbb7fe030b06ff` 下已删除的八个旧模块，比较现合集规则原文/顺序、MITM 并集和 JS 字节。合法上游更新也会使这些等价断言失败。
- **不能只把 base 改成当前 HEAD**：当前提交已经没有 `<旧名>/<旧名>.sgmodule` 和旧 JS 路径，会造成新的缺文件错误。
- 有意更新前先保存本次已发布基线，列出允许变化的来源和行为。为变更增加独立预期的正反例；随后将迁移断言调整为新的明确契约，或只保留对未受影响来源的旧版等价保护。记录断言为何改变，不以换哈希、删断言、固定返回值来掩盖缺陷。
- 同一文件的“其他模块字节不变”测试实际读取 StartUpAds 与 kelee 各目录的全部原有文件，也包括检查程序和 SOURCES 等文档。用户有意更新这些目录时需要单独审查其保护基线。

`tests/integration.test.js` 还固定 StartUpAds 的 `63268de8cb9b433b04878999dacf1e2965a12d2b` 真实 20 个文件、来源 SHA-256/字节数、96 条来源总数、许可 blob 等。更新 StartUpAds、来源规则数量或快照时有相应断言需要有依据地调整；没有改到的保护继续保留。当前 5 个 JS/7 条 Script/96 源行是已审计数量，不是永远不能改变的业务目标。

## 运行哪些检查

在仓库根执行；根测试无 npm 第三方依赖，不需要先 npm install：

```sh
npm test
npm run test:jsc
git diff --check
```

需要 Node 18+、jq、macOS Surge CLI；JSC 重放另需 Swift 与系统 JavaScriptCore。Surge CLI 路径当前为 `/Applications/Surge.app/Contents/Applications/surge-cli`。其他机器缺工具时明确记录缺失，不将跳过写成通过。

| 检查入口 | 实际负责的范围 |
| --- | --- |
| tests/native-modules.test.js | 漫画、闲鱼、墨迹的实际 JQ/AMDC、正常/失败/未知结构及原始数值 |
| tests/json-modules.test.js | 高德、菜鸟、微信小程序、车来了；原脚本差分、HTML/文本/包装与精度保护 |
| tests/tieba.test.js | 激活 protobuf 分支、字节保持、未知/重复字段、两个 pb cmd、UTF-8、坏帧/预算及实际 JQ |
| tests/merged-module.test.js | 合并迁移保护、实际入口/资源、MITM 并集、其他模块字节；更新前按上节审查基线 |
| tests/integration.test.js | 快照/ID/许可/StartUpAds 身份、真实模块解析及已知重叠行为 |
| tests/native-jsc.cjs | 捕获实际行为测试的输入和预期，用系统 JSC 执行真实脚本并比较原始输出；包含所有五份 MoyuAds JS 和 StartUpAds AMDC |

`tests/helpers/index.js` 的 parseSource 只从真实合并模块筛选来源分组；它不生成产品子模块。validateSurge 生成临时完整配置、补 FINAL、解析 MITM 追加后只调用 `--check`，不会安装/启用模块或改在线配置。不要用“单独检查 .sgmodule 不含 FINAL 报错”判断发布模块有问题，也不要给发布模块增加 FINAL。

本次已发布运行基线的历史结果：269 项测试、230 次 JSC 调用通过；MoyuAds、StartUpAds 分别及组合的临时配置解析通过；MoyuAds 模块和五份 JS 共六个 raw 文件已回读一致。以后更新需要运行当次适用检查，这些数字不能代替未来的验证，也不证明 iOS/历史引擎或各 App 真实流量通过。

若修改 kelee，同时执行根 AGENTS 所列 kelee/checks。根测试只覆盖明确列出的 StartUpAds 重叠和身份，不具备其全部 19 个脚本的原始完整验证框架；详见根 AGENTS 的历史资料边界。

## 发布与下一次交接

在当次用户授权发布的范围内检查精确 diff、只暂存本任务文件，并运行 `git diff --cached --check`。正常快进推送；远端推进先重新整合，不能强推。保留五个现有产品入口，不恢复八个旧独立模块，不增加自动同步 workflow。

发布后回读 main 提交/tree，确认实际入口、资源路径和需要删除的旧文件。下载受影响模块及其每个去重后的运行资源，比较 HTTP 状态和原始字节/哈希；只读 HEAD、网页显示或 push 成功不能代替资源核验。配置中的下载 URL 指向 main，主分支的发布提交才决定客户端可取得的版本。

每次更新至少留下以下交接信息：

- 更新前仓库提交、此次发布提交及受影响模块/来源。
- 上游配置与依赖各自的获取时间、不可变提交/URL、SHA-256，实际增删改和未启用分支。
- 手工映射、保留/新增的修正，ID/manifest/测试基线为什么改变。
- 当次命令及观察到的结果、远端资源核验范围；实机效果与未验证部分单独说明。

稳定维护事实写入本文件/SOURCES/来源审计；历史设计与计划保留作背景。不要让未来 AI 依赖被清理的临时任务账本、旧聊天或日志，也不要根据历史计划未勾选就断言当前工作没有发布。
