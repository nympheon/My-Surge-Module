# StartUpAds 来源、修正与历史资料

维护索引：[根 AGENTS.md](../../../AGENTS.md)。

本文件由 2026-10-31 的根 `AGENTS.md` 按主题迁移，源提交为 `e9c3bf046a9a6729a011265e34ed11ca2f9aa927`；拆分日期为 2026-11-01。文中代码路径均相对仓库根目录。历史日期、数量、验证结果和发布锚点需要按当次任务重新核对。

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
