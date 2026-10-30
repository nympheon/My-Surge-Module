# 来源与手工调整

## 2026-10-31 新增来源

用户新增墨迹天气、360 智慧生活；丰巢明确排除。原始两份 Loon 配置冻结于 `references/kelee-additions/`，来源均为 `Moli-X/Tool` 提交 `bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d` 的 `Loon/Plugin/Kelee/`。

| 来源文件 | 原始 SHA-256 | 手工映射 |
| --- | --- | --- |
| `MojiWeather_remove_ads.plugin` | `f45cb96f50e5b46668a3833e36104b19c49f3e04b38888814e399919558d66bc` | 6 个拦截 URL 合并成 3 条 Map Local；保留 404 空正文与 200 空 JSON 的区别；个人页 1 条原生 JQ |
| `SafetyHome_remove_ads.plugin` | `b6a31d0521be0ae8d69ba22856bdc3745f31de06b9b46b0e9b3b627884102750` | 1 条 Map Local 返回 200 空 JSON；`ad.iot.360.cn` 已在原通用域名规则中，复用而不重复 |

墨迹 JQ 保留“皇冠区域”“banner区”的整区域删除以及“墨迹钱包”“墨圈”的入口删除。遇到缺失、null 或未知结构时保留原值。MITM 只补实际规则所需的 `fcard.api.moji.com`、`vdo.api.moji.com`、`sns.api.moji.com`、`mme.api.moji.com` 和 `app.home.360.cn`，未添加源中无有效规则的 `psnlz.api.moji.com`。

新增受控样例：`node --test kelee/checks/additions.test.cjs`。既有 `MoyuAds` 也包含墨迹，范围和返回类型与本来源不同；同时启用时，重叠 Map Local 的生效顺序由设备上的模块优先级决定，不能宣称二者叠加后的效果与单模块一致。

YouTube 按用户要求另设 `kelee-YouTube` 模块，不进入此合集；其来源、Worker 依赖和检查见 `../kelee-YouTube/SOURCES.md`。当前完整选定清单共 57 项，其中本合集 54 项、HTTPDNS/京东比价/YouTube 各独立一项。

新增原生部分有 4 个行为测试，既有 77 项脚本断言和 31 组 JQ 样例继续保留。四个 kelee 模块的校验包含 142 条 JQ、15 个 JS 文件和 17 个仓库运行资源引用。根回归中曾有一条要求 kelee 每个文件与历史完全相同的保护测试；用户明确要求删除，本次已删除该历史字节锁定测试及临时替代的增量锁定测试，保留实际行为、资源引用和语法检查。最终通过情况以本次实际运行记录为准，均不等同于真实 App 流量验收。

## 固定来源

- 原始项目：[可莉](https://github.com/luestr/ProxyResource/blob/main/README.md)，初次转换为 54 项；当前清单见 `selected-plugins.txt`，新增来源见上节。
- 主要可读镜像：[bunizao/Mirrored](https://github.com/bunizao/Mirrored/tree/a8e1cbf97a2298a5f64412fcd1c6deb11d5de4f6/Chores)，固定提交 `a8e1cbf97a2298a5f64412fcd1c6deb11d5de4f6`。下载时核对了 Git blob 哈希。
- 原 Loon 对照：[Moli-X/Tool](https://github.com/Moli-X/Tool/tree/bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d/Loon/Plugin/Kelee)，固定提交 `bf9be1b5fbc9a1d566d028c7e7a2c0d883ab027d`。其中可读的 41 项用于交叉检查，QQ 条件重定向从此恢复。
- 顺丰完整静态响应：[QingRex/LoonKissSurge](https://github.com/QingRex/LoonKissSurge/blob/913ec005f544221e6c56a7d0ecec81c4b3b914bb/Surge/%E9%A1%BA%E4%B8%B0%E9%80%9F%E8%BF%90%E5%8E%BB%E5%B9%BF%E5%91%8A.sgmodule)。保留完整 JSON，未自行重造寄件服务项目。
- 拼多多取件页 chunk：[darkings/lat3ncy-proxy-configs](https://github.com/darkings/lat3ncy-proxy-configs/blob/96d2568cd8432384cd89c0ff5753ae93dac9c344/loon/vendor/pinduoduo/9410-b8806e870a26db7d.js)，并核对原始 `pfile.pddpic.com` 的同名 chunk。附带资源又手工恢复了两个推广模块的导出接口，以空组件代替直接删除模块。
- 茶颜悦色静态图：[axtyet/Luminous](https://github.com/axtyet/Luminous/blob/b160e64c88f94b09040f28b7b3f4281721f1006f/KeLee/Resource/Script/WexinMiniPrograms/chayanyuese/cyys1.jpg)，固定版本原图随本仓库托管。

保留的 JS 文件保留了原有作者或引用信息。规则及脚本作者包括可莉、RuCu6、app2smile、VirgilClyne、Maasea、Sliverkiss、ZenmoFeiShi、MoonYuki、zZPiglet、Keywos、fmz200、wf021325、githubdulong、mw418，以及原配置标注的“小白脸”和佚名。Surge 语法依据 [官方模块文档](https://manual.nssurge.com/profile/module.html)、[正文重写](https://manual.nssurge.com/http/body-rewrite.html)、[Map Local](https://manual.nssurge.com/http/map-local.html) 和 [脚本 API](https://manual.nssurge.com/scripting/api.html)。

## 合并和优化

| 项目 | 首次 54 项来源镜像合计 | 首次转换后三模块合计 |
| --- | ---: | ---: |
| Rule | 637 | 550 |
| Body Rewrite | 294 | 142，其中 JQ 141 条 |
| Map Local | 391 | 211 |
| Script 声明 | 49 | 13 |
| URL Rewrite | 1 | 9，补回 QQ 8 条 |
| 运行脚本文件 | 30 | 12，另附 1 个网页 JS 静态资源 |

按相同响应类型及 URL 范围合并 Map Local；合并同一正文内的对象字段删除；保留有顺序影响的数组索引删除。域名去重、后缀覆盖与 HTTPDNS 关键词覆盖均保留原例外规则。

18 个简单运行脚本改为原生 JQ：乐播投屏、哔哩哔哩漫画、薄荷健康、斗鱼、IT之家、彩云，以及企迈、EMS、小兔充充、全家、罗森、茶颜悦色、COCO、青桔、一点点、M Stand、T3、古茗的小程序脚本。

保留复杂 HTML、价格接口、Protobuf 和较复杂的 JSON 处理脚本；12306 与航旅纵横使用小型请求脚本检查头部，无需读取请求正文。

## 主动修正

1. **12306**：Loon 裸 `$done()` 中止请求的语义改为 Surge 的 `$done({abort:true})`；头部键名不区分大小写，其他业务正常放行。
2. **航旅纵横**：修正 `http?` 和正则分支优先级错误，只对正确主机、路径检查 `rpid`。通用合集原来对 `home.umetrip.com` 的 HTTP 全拦截会遮住条件判断，移除该全拦截；`umerp` 条目保留。
3. **酷安**：修正 JQ 管道切换上下文后错误使用 `index(.)` 导致误删正常条目的问题。
4. **IT之家、贴吧**：修正 Surge 参数读取和嵌入引号问题。IT之家两个可选开关默认关闭；贴吧视频开关保留默认开启。
5. **QQ**：镜像缺少所有重定向规则，按原 Loon 条件重写逐条补回 8 个原生 307。保留原捕获目标的编码形式，不额外重复解码。
6. **微信外链**：修正 `ture` 拼写、缺模板时抛错、异步未定义 `resolve` 及多次 `$done`。保留默认通知、可选强制跳转/快照以及 HTML 实体和 Base64 解码；增加 Mac 通知处理。
7. **京东比价**：捕获分支补 `$done({})`，通知不回显凭据。多接口查询超时设为 70 秒。没有更改价格算法或慢慢买 API。
8. **顺丰**：将截断的静态 JSON 换成固定来源的完整有效资源文件。
9. **拼多多取件**：不再把 JS URL 改成不可访问的 kelee 地址，使用精确 Map Local 返回附带资源。广告模块保留编号和导出、组件返回 `null`，保留电话等正常模块。
10. **彩云**：修正 A03 查询参数只能在中间匹配及 wrapper 判断恒假的错误，使用查询参数边界；移除 `cdn-w` 对应的空操作。该分支源脚本实际没有修改任何字段。
11. **Jump、微信安全页、通用 HTTP 接口和 12306 小程序**：修正可选冒号、未转义的主机点号、`http?` 及误把 `?` 当量词的问题，限制到实际有效的主机和路径。
12. **JS 与 JQ 的真假值**：斗鱼、IT之家焦点卡片、彩云显式保持 JavaScript 对 `null/false/0/空字符串` 的判断，避免 JQ 误删普通内容。
13. **MITM**：合并并补齐规则实际需要的主机，包括彩云 wrapper、HTTPDNS 部分主机、拼多多 CDN、广电与飞智；不使用全主机 `*`。
14. **异常处理**：保留的 JSON/Protobuf 脚本遇到缺正文、无效数据时正常结束并保留响应。EMS、企迈内嵌 JSON 字符串解析失败时也保留原数据。

有意保留源配置的 UI 精简范围、字符串值 `"{}"/"[]"` 及严格白名单；没有把它们擅自统一成不同类型。小红书相关项目包括源插件原有的水印处理。

## 重叠规则的取舍

- 淘宝 `mtop.taobao.idle.home.welcome` 同时出现在淘宝插件（JSON、200）和通用合集（空正文、404）。采用更具体的淘宝条目，返回 JSON、200。
- 华米六个图片响应在源合集本身已被更靠前的 404 规则覆盖，去掉不可能命中的重复条目，维持 404。
- 航旅纵横 HTTP 业务接口采用 `rpid` 条件判断，避免通用集合的整接口拦截影响普通业务。

URL 采样报告中的 8 个差异对应：航旅纵横原错误正则 1、航旅纵横主动移除的全拦截 1、彩云空操作 1、Jump 非法 URL/主机 2、微信未转义主机 1、12306 错误量词 1、通用 `htt://` 错误协议 1。均为主动修正，未发现其余遗漏。

## 验证范围

2026-10-31 发布整理：目录分别为 `kelee/`、`kelee-HTTPDNS/`、`kelee-JDPrice/`。运行脚本及静态资源统一使用本仓库的完整 raw HTTPS 地址；安装者无需复制本地附属文件。原始来源引用仍保留用于追溯。

Mac 使用 Surge 6.11.0 离线检查；单模块及组合配置均为 `OK`。JQ 使用本机 `jq` 编译并执行样例，脚本使用 Node 语法检查及隔离 VM；HTTP、通知、持久化均由样例替身提供，没有抓取真实账户数据或调用真实价格查询 API。

这些检查不能证明某一 App 当前版本的接口仍相同，也不证明 iOS 实际运行时和证书解密效果。需要后续在真实设备逐项观察日志、命中规则和页面效果。
