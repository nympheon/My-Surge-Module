# 用户偏好与禁用提醒

维护索引：[根 AGENTS.md](../../AGENTS.md)。更新日期：2026-11-01。

## 当前选择：停用 anti-AD，blackmatrix7 可继续使用

用户于 2026-11-01 补充验证：已将 blackmatrix7 安装回来并测试，没有出现问题，确认本次央视频异常来自 anti-AD。该补测更新了初次排查时“两套规则都先停用”的选择；后续 AI 必须按这里的最新结论处理。

| 规则 | 精确来源 | 当前结论与证据来源 | 后续处理 |
| --- | --- | --- | --- |
| anti-AD | `https://raw.githubusercontent.com/privacy-protection-tools/anti-AD/master/anti-ad-surge.txt` | 用户补测后确认本次问题来自 anti-AD | 保持停用提醒；涉及恢复、导入、推荐或启用时提醒用户此前的央视频问题 |
| blackmatrix7 Advertising_All | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Advertising/Advertising_All.list` | 用户恢复安装并测试正常 | 解除此前禁用建议，可按用户当前选择继续使用；不再提示“本次已证实有问题” |

- 不要通过同步、恢复旧配置、推荐新的整套配置或更新模板再次带回启用的 anti-AD 引用。用户以后明确改变该偏好时，记录新的选择和适用范围。
- 上表两项是通过 `[Rule]` 引入的外部分流规则集。用户所说“安装回来”记录为恢复使用，不据此把它们改称为独立 Surge 模块。
- 初次排查时两套规则曾先后拒绝 `mtrace.ysp.cctv.cn`、`btrace.ysp.cctv.cn`；这段历史记录保留，但不能继续据此将 blackmatrix7 判为本次故障来源。
- 用户手工关闭规则后，需要保存并应用，才能在运行状态中确认是否生效。
- `ChinaMax_All.list` 是另一个国内服务直连规则集，初次排查时保持开启；此次禁用提醒针对 anti-AD。
- 这两套外部分流规则没有因此成为本仓库的模块来源。

## 验证来源与准确范围

[央视频案例](incidents/2026-10-31-yangshipin-playback.md)区分两阶段证据：2026-10-31 的远程采集，以及 2026-11-01 用户报告的 blackmatrix7 回装补测。原有 300 条请求统计属于前一阶段，不能写成 AI 已经对回装后的配置重新采集了 300 条请求。

本次问题在规则集层面按用户补测定位到 anti-AD；具体是哪条 anti-AD 规则、哪个接口以及如何影响播放仍未确定。不能把 `mtrace`、`btrace` 写成已证实的鉴权或续签接口，也不能推断 blackmatrix7 回装后的这两个域名当前如何匹配。

