# MoyuAds 维护入口

维护索引：[根 AGENTS.md](../../../AGENTS.md)。

本文件由 2026-10-31 的根 `AGENTS.md` 按主题迁移，源提交为 `e9c3bf046a9a6729a011265e34ed11ca2f9aa927`；拆分日期为 2026-11-01。文中代码路径均相对仓库根目录。历史日期、数量、验证结果和发布锚点需要按当次任务重新核对。

## MoyuAds：后续更新的入口

- [来源与实现映射](../../../MoyuAds/SOURCES.md)：八配置/七原脚本的固定版本、SHA-256 入口、原生 JQ 与五份运行 JS 的对应关系、必须延续的修正。
- [更新操作手册](../../../MoyuAds/MAINTENANCE.md)：逐条比较与手工更新、冻结来源/ID 的维护、测试基线陷阱、检查命令、发布回读和下一次交接。
- [逐来源审计](../../../MoyuAds/audits)：完整 96 条映射与已确认差异；[兼容性与共存](../../compatibility.md)；[行为索引](../../moyu-independent-modules.md)。

当前一个 MoyuAds 入口覆盖高德、小程序、漫画、菜鸟、车来了、闲鱼、墨迹、贴吧；包含完整正常 UI/搜索/推荐精简，七条原 Script 声明共用五份自有 JS。`references/moyu-independent/manifest.json` 的 modules 是八个来源分组，不是八个待发布模块。不要恢复旧运行目录。`# @source` 与该分组下 Sxxxx 共同标识原配置物理行；上游插行后按 URL/阶段/动作识别，不按编号盲目覆盖。

特别注意 `tests/merged-module.test.js` 固定读取合并前 `74662af` 的旧路径，合法更新也会触发规则/JS 原文相等断言。不能直接把 base 换成已删除旧路径的当前提交，不能仅为测试变绿删除保护；按操作手册为允许的变化建立新行为样例和明确基线。根 integration 另固定 StartUpAds 的 `63268de` 字节身份。当前 96 源行、5 JS、7 Script 是基线统计，未来有意变更时逐项审查并维护，不能把数量当成永久业务目标。

用户要求仓库中八来源只保留一个 MoyuAds 合集；StartUpAds 和 kelee 系列继续独立，其中 YouTube 按本次要求独立为 `kelee-YouTube`。仓库维护、下载回读、离线解析均不意味着安装/启用 Surge；不得顺带切换用户设备模块、改在线配置或证书。
