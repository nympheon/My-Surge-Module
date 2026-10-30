# 车来了净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/CheLaiLeAds/CheLaiLeAds.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 Rewrite、Scripting、MITM 并信任自己的证书。完整净化上游广告/跟踪端点和底栏，仅保留「首页、我的、路线规划」，移除保留项的 picUrl/clickIconUrl。

可读脚本只修改 YGKJ 包装内的目标列表，保留包装前后内容、未知字段和数字精度。来源 ddgksf2013，见 [AUDIT.md](AUDIT.md)。原 HTTPS IP 规则补入目标 IP 的 MITM，不扩大为全局解密。

已通过本地原脚本差分、原始数字/包装 fixture、原生 Surge/JSC 检查；未修改在线配置或证书，未做 iOS/全应用验收。main 安装链接需发布后包含本次更新。
