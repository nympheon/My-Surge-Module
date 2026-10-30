# 高德地图净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/AmapAds/AmapAds.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 HTTP Rewrite、Scripting 和 MITM，并已信任自己的 MITM 证书。脚本归属本模块，无跨模块依赖。

完整保留上游选定净化，包括首页卡片、附近的优惠/场景/商品、我的页、搜索热词、AI/运营配置、天气和推广；因此也会移除部分正常 UI/推荐。保留 optimus-ads.amap.com 直连例外和原 MITM 主机范围。上游 ddgksf2013，来源与逐条对应见 [AUDIT.md](AUDIT.md)。

上游建议在挂载前卸载重装；本次没有执行安装/卸载、修改在线配置或证书。已通过本机 jq、原脚本样本差分、原生 Surge 配置检查和 AMDC 测试；未宣称旧版本设备、iOS 或全应用在线验收。模块尚需发布后才能通过上述 main 链接获取最新内容。
