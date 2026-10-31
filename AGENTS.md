# My-Surge-Module：AI 阅读索引

本文件是 AI 的入口；详细维护资料按主题存放在 `docs/ai/`。索引整理日期：2026-11-01。

## 每次开始先读

1. [用户偏好与禁用提醒](docs/ai/preferences.md)：包括 anti-AD 停用提醒，以及 blackmatrix7 回装测试正常后的偏好更新。
2. [通用维护约定与发布流程](docs/ai/maintenance.md)：确认 Git、远端、本次任务范围和发布授权。
3. [验证入口与证据边界](docs/ai/verification.md)：按受影响产品运行适用检查。

## 按任务继续阅读

| 任务 | 详细入口 |
| --- | --- |
| MoyuAds 更新 | [AI 维护入口](docs/ai/modules/moyuads.md)、[来源映射](MoyuAds/SOURCES.md)、[操作手册](MoyuAds/MAINTENANCE.md)、相关 audit 与 tests |
| StartUpAds 更新 | [来源、保留修正与旧资料边界](docs/ai/modules/startupads.md) |
| kelee / HTTPDNS / JDPrice / YouTube 更新 | [来源与保留修正](docs/ai/modules/kelee.md)、[kelee 来源](kelee/SOURCES.md)、[YouTube 来源](kelee-YouTube/SOURCES.md)、受影响模块与 checks |
| 央视频播放中断 / 广告规则误拦排查 | [2026-10-31 案例](docs/ai/incidents/2026-10-31-yangshipin-playback.md)、[脱敏统计](docs/ai/incidents/2026-10-31-yangshipin-playback.evidence.json) |

## 不能遗漏的约定

- **每次新增或修改 Surge 规则、模块、配置或脚本之前，必须先查询最新官方语法。** 不仅依赖旧交接、模型记忆或上次查询；执行方式见[通用维护文档的编写前语法核对](docs/ai/maintenance.md#每次编写前必须核对最新官方语法)。
- **从 Quantumult X、Loon 等其他工具语法转换时，先研究是否有更优化、更简化的 Surge 写法，再逐条手工实现；不得只做机械逐行替换。** 优先评估原生能力、规则合并和减少不必要的脚本/依赖，并核对行为等价；详见[转换前的实现评估](docs/ai/maintenance.md#跨语法转换前先评估更简洁的-surge-实现)。
- **2026-11-01 补充验证：用户确认问题来自 anti-AD，blackmatrix7 回装测试正常。** 以后仅对 **anti-AD `anti-ad-surge.txt`** 保留不要启用的提醒；解除 blackmatrix7 `Advertising_All.list` 的禁用建议。不得继续沿用“两套规则都不要使用”的旧结论。具体 URL、验证来源与历史记录见偏好文件及央视频案例。
- 模块逐条手工维护；下载、差异分析和校验程序可以使用，不写批量转换器覆盖生成发布模块。
- 保留现有模块入口、用户已选功能和修正；保留其他会话的未提交内容，发布只带本次文件。
- 不提交个人完整配置、控制密码、节点凭据、API 密钥、MITM 私钥或捕获到的账户数据。
- 仓库维护和发布授权与设备操作范围分别判断；不顺带修改在线配置或设备模块。
- 用户已删除 README；维护资料使用这里索引的 Markdown 文件，不重新创建宣传、安装介绍类 README。

`docs/superpowers/` 是历史设计和计划背景。当前用户指令、实际仓库与远端证据决定本次工作范围；历史未勾选步骤和过去的本地限制不覆盖新授权。

