# 墨鱼应用净化合集

`MoyuAds/MoyuAds.sgmodule` 将原八个独立入口合并为一个，完整保留 96 条来源规则及正常 UI、搜索、推荐与功能入口精简。配套 JS 集中在 `MoyuAds/js/`，三份相同 AMDC 共用一个文件，共五份 JS、七条原 Script 声明，URL 谓词和处理顺序保持原样。原 StartUpAds 及其 19 个脚本保持原字节。

统一订阅：[MoyuAds.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/MoyuAds.sgmodule)。原八个独立运行目录和入口已由本合集替换，配套脚本统一从本仓库 `main/MoyuAds/js/` 下载。原来源审计保留在 `MoyuAds/audits/`，冻结参考配置保留用于追溯。

如果设备上已安装原八个订阅，以后请手动移除这些旧订阅并添加新合集。此任务只更新仓库，设备上的 Surge 配置、模块开关与证书保持原样。StartUpAds 和三个 kelee 模块继续独立保留。

| 内容 | 完整行为与审计 |
|---|---|
| 高德地图 | 开屏、信息流、路线规划卡片、Tip、图片；首页只留登录/常用位置，我的页只留订单/高德推荐；移除附近优惠/场景/活动/商品、打车推广、角标、顶部消息、搜索热词、AI/运营配置、归因与 AMDC，天气接口返回空字典。[行为与逐行审计](../MoyuAds/audits/AmapAds.md) |
| 微信小程序 | 便利蜂 banner、顺丰广告、掌上公交 Ad/Ad_ab 开关，以及选定小程序广告控制/隐藏内容标记、adunit 和 HTML unit-id；保留旧公众号文本规则。[行为与逐行审计](../MoyuAds/audits/Applet.md) |
| 哔哩哔哩漫画 | 开屏、各类 banner/气泡/福利/活动与营销入口；移除指定活动 Tab、商城/游戏入口、type=42 信息流、搜索填词/展示/横幅/推荐/热搜及漫画推荐；我的页只留“我的已购”，初始化未读计数和红点清零。[行为与逐行审计](../MoyuAds/audits/BiliBiliComicsAds.md) |
| 菜鸟 | 我的页 banner/活动/资产/钱包/会员；首页大 banner 和待办，搜索热词、广告展示、底部商品/角标、匿名问卷，含支付宝小程序相关端点与 AMDC。[行为与逐行审计](../MoyuAds/audits/CainiaoAds.md) |
| 车来了 | 选定广告/跟踪端点；底栏只保留“首页、我的、路线规划”，并删除保留项的 picUrl/clickIconUrl。[行为与逐行审计](../MoyuAds/audits/CheLaiLeAds.md) |
| 闲鱼 | 开屏、曝光上报、悬浮球、策略/省钱入口；首页顶部仅留第一项，首页/本地仅留商品流；搜索填词/激活卡/发现及非商品结果、我的页非 head/user/trade 分支与 ability、购买推荐、mamaAD 商品推荐、AMDC。[行为与逐行审计](../MoyuAds/audits/GoofishAds.md) |
| 墨迹天气 | 我的页工具区/灯泡/banner、顶部浮窗、短视频、商品推广、开屏和 DNS 配置；时景发现及关注整个端点返回空响应。[行为与逐行审计](../MoyuAds/audits/MoJiWeatherAds.md) |
| 百度贴吧 | 选定 IP/广告接口，搜索、抽屉、我的页 UI；二进制论坛/推荐/帖子中的商品、直播、广告活动、直播卡、小说卡及指定帖子外层卡。普通视频默认保留。[行为与逐行审计](../MoyuAds/audits/TieBaAds.md) |

需要 Surge Mac 5.9.0+ / iOS 5.14.0+ 的原生语法，并启用相应 Rewrite、Scripting、MITM。HTTPS 净化需要在自己的设备上正确安装并信任 MITM 证书；模块仅 `%APPEND%` 指定主机，不提供证书、不关闭服务器校验、不全局解密。合集运行脚本均位于 `MoyuAds/js/`，无需依赖其他模块。原生 Body Rewrite 与脚本有不同体积限制，见[兼容性与验证边界](compatibility.md)。

通用小程序 URL 模式只在枚举的 MITM 主机范围内生效，不保证微信 5 秒开屏或所有小程序；旧公众号规则为遗留兼容，不承诺现时有效。贴吧覆盖选定八条源规则，未额外启用原作者较新原生模块的 JSON 路由。请在安装前阅读各模块说明，确认上述正常功能移除符合需要；卸载重装 App 不是本项目验证步骤。

已验证本机真实 jq、Node fixture/上游差分、原生 macOS JavaScriptCore，以及实际 MoyuAds、StartUpAds 分别和组合后的临时 Surge 完整配置解析。未进行 iOS、旧版本设备、真实网络或各 App 全流程验收；语法最低版本不是设备实测结果。脚本/接口随 App 与服务更新仍可能失效。发布后需单独下载模块及五份 JS 核对远端字节；本地测试本身不代表远端验证。

本地验证：`npm test`；`npm run test:jsc`。无需 npm 第三方依赖；测试需 Node 18+、jq、macOS Surge CLI，JSC 重放另需 Swift 与系统 JavaScriptCore。测试不启用模块、不改在线配置或证书。[冻结来源与 SHA-256](../references/moyu-independent/manifest.json)仅用于审计和测试，不是运行时资源；app2smile 参考源码保留其[原 MIT 声明](../references/moyu-independent/scripts/tieba-proto.LICENSE.md)，其他来源仍归各自作者，未统一宣称许可证。
