# Surge 原生净化模块

本页列出本批八个独立模块及原有 StartUpAds。九者的指定重叠行为已有受控样本检查；这不代表与仓库其他广告合集任意叠加都无冲突。八个独立模块按选定上游配置的**完整净化行为**手工移植，共 96 条有效规则；因此会移除部分正常 UI、搜索、推荐与功能入口。原有 StartUpAds 及其 19 个脚本保持原字节。

| 模块 | 原生安装链接 | 完整行为与审计 |
|---|---|---|
| 开屏合集 | [StartUpAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/StartUpAds/StartUpAds.sgmodule) | 原有多应用开屏/广告合集，保留既有行为；[模块内来源说明](../StartUpAds/StartUpAds.sgmodule) |
| 高德地图 | [AmapAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/AmapAds/AmapAds.sgmodule) | 开屏、信息流、路线规划卡片、Tip、图片；首页只留登录/常用位置，我的页只留订单/高德推荐；移除附近优惠/场景/活动/商品、打车推广、角标、顶部消息、搜索热词、AI/运营配置、归因与 AMDC，天气接口返回空字典。[行为与逐行审计](../AmapAds/AUDIT.md) |
| 微信小程序 | [Applet](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/Applet/Applet.sgmodule) | 便利蜂 banner、顺丰广告、掌上公交 Ad/Ad_ab 开关，以及选定小程序广告控制/隐藏内容标记、adunit 和 HTML unit-id；保留旧公众号文本规则。[行为与逐行审计](../Applet/AUDIT.md) |
| 哔哩哔哩漫画 | [BiliBiliComicsAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/BiliBiliComicsAds/BiliBiliComicsAds.sgmodule) | 开屏、各类 banner/气泡/福利/活动与营销入口；移除指定活动 Tab、商城/游戏入口、type=42 信息流、搜索填词/展示/横幅/推荐/热搜及漫画推荐；我的页只留“我的已购”，初始化未读计数和红点清零。[行为与逐行审计](../BiliBiliComicsAds/AUDIT.md) |
| 菜鸟 | [CainiaoAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/CainiaoAds/CainiaoAds.sgmodule) | 我的页 banner/活动/资产/钱包/会员；首页大 banner 和待办，搜索热词、广告展示、底部商品/角标、匿名问卷，含支付宝小程序相关端点与 AMDC。[行为与逐行审计](../CainiaoAds/AUDIT.md) |
| 车来了 | [CheLaiLeAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/CheLaiLeAds/CheLaiLeAds.sgmodule) | 选定广告/跟踪端点；底栏只保留“首页、我的、路线规划”，并删除保留项的 picUrl/clickIconUrl。[行为与逐行审计](../CheLaiLeAds/AUDIT.md) |
| 闲鱼 | [GoofishAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/GoofishAds/GoofishAds.sgmodule) | 开屏、曝光上报、悬浮球、策略/省钱入口；首页顶部仅留第一项，首页/本地仅留商品流；搜索填词/激活卡/发现及非商品结果、我的页非 head/user/trade 分支与 ability、购买推荐、mamaAD 商品推荐、AMDC。[行为与逐行审计](../GoofishAds/AUDIT.md) |
| 墨迹天气 | [MoJiWeatherAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoJiWeatherAds/MoJiWeatherAds.sgmodule) | 我的页工具区/灯泡/banner、顶部浮窗、短视频、商品推广、开屏和 DNS 配置；时景发现及关注整个端点返回空响应。[行为与逐行审计](../MoJiWeatherAds/AUDIT.md) |
| 百度贴吧 | [TieBaAds](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/TieBaAds/TieBaAds.sgmodule) | 选定 IP/广告接口，搜索、抽屉、我的页 UI；二进制论坛/推荐/帖子中的商品、直播、广告活动、直播卡、小说卡及指定帖子外层卡。普通视频默认保留。[行为与逐行审计](../TieBaAds/AUDIT.md) |

需要 Surge Mac 5.9.0+ / iOS 5.14.0+ 的原生语法，并启用相应 Rewrite、Scripting、MITM。HTTPS 净化需要在自己的设备上正确安装并信任 MITM 证书；模块仅 `%APPEND%` 指定主机，不提供证书、不关闭服务器校验、不全局解密。每个模块的运行脚本都位于自己的 `js/`，无需依赖其他模块。原生 Body Rewrite 与脚本有不同体积限制，见[兼容性与验证边界](compatibility.md)。

通用小程序 URL 模式只在枚举的 MITM 主机范围内生效，不保证微信 5 秒开屏或所有小程序；旧公众号规则为遗留兼容，不承诺现时有效。贴吧覆盖选定八条源规则，未额外启用原作者较新原生模块的 JSON 路由。请在安装前阅读各模块说明，确认上述正常功能移除符合需要；卸载重装 App 不是本项目验证步骤。

已验证本机真实 jq、Node fixture/上游差分、原生 macOS JavaScriptCore，以及九模块各自与共同组成的临时 Surge 完整配置解析。未进行 iOS、旧版本设备、真实网络或各 App 全流程验收；语法最低版本不是设备实测结果。脚本/接口随 App 与服务更新仍可能失效。安装链接指向 main，只有对应提交发布后才包含此次内容。

本地验证：`npm test`；`npm run test:jsc`。无需 npm 第三方依赖；测试需 Node 18+、jq、macOS Surge CLI，JSC 重放另需 Swift 与系统 JavaScriptCore。测试不启用模块、不改在线配置或证书。[冻结来源与 SHA-256](../references/moyu-independent/manifest.json)仅用于审计和测试，不是运行时资源；app2smile 参考源码保留其[原 MIT 声明](../references/moyu-independent/scripts/tieba-proto.LICENSE.md)，其他来源仍归各自作者，未统一宣称许可证。
