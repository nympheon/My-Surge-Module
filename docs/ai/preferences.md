# 用户偏好与禁用提醒

维护索引：[根 AGENTS.md](../../AGENTS.md)。记录日期：2026-11-01。

## 以后提醒不要使用的两套广告规则

用户明确要求：记录以下两套规则，以后涉及它们时提醒“之前央视频排查后已停用，先不要使用”。适用范围为维护者个人 Surge 配置。

| 规则 | 精确来源 | 本次确认的行为 | 后续处理 |
| --- | --- | --- | --- |
| blackmatrix7 Advertising_All | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Advertising/Advertising_All.list` | 曾拒绝 `mtrace.ysp.cctv.cn`、`btrace.ysp.cctv.cn` | 保持停用；涉及恢复、导入、推荐或启用时提醒用户 |
| anti-AD | `https://raw.githubusercontent.com/privacy-protection-tools/anti-AD/master/anti-ad-surge.txt` | 停用 Advertising_All 后，仍由此规则集拒绝同两域名 | 保持停用；涉及恢复、导入、推荐或启用时提醒用户 |

- 这是两个 `[Rule]` 下引入的分流规则集；不要把它们写成两个独立 Surge 模块。
- 用户手工注释规则并保存、应用后，才在远端运行规则中确认关闭生效。界面里关掉但尚未应用，不算完成。
- 不要通过同步、恢复旧配置、推荐新的整套配置或更新模板再次带回这两条启用引用。用户以后明确改变偏好时，记录新的选择和适用范围。
- `ChinaMax_All.list` 是另一个国内服务直连规则集，本次保持启用；此次偏好只针对上表两条广告规则。
- 这两套外部分流规则没有因此成为本仓库的模块来源。

## 结论的准确范围

[央视频案例](incidents/2026-10-31-yangshipin-playback.md)确认了规则拦截、关闭后路由变化和随后未复现的播放结果。两套规则一起停用且中途重启过 Surge，尚未通过逐域名对照证明哪一条规则或哪个域名单独导致故障。

个人使用偏好已经确定，机制层面的根因仍保留“未确认”。不能把 `mtrace`、`btrace` 写成已证实的鉴权或续签接口。
