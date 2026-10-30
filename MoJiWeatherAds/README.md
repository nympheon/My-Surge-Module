# 墨迹天气净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoJiWeatherAds/MoJiWeatherAds.sgmodule) · [逐条审计](AUDIT.md)

需要 Surge Mac 5.9.0+ / iOS 5.14.0+；启用模块，并在自己的设备上完成 MITM 证书信任。MITM 追加原域名 `*.api.moji.com`、`tnc*-*.zijieapi.com`，未扩大为全局解密。

保留完整原净化：我的页工具区/灯泡/banner、首页浮窗与短视频、商品推广、时景发现/关注、DNS 配置和开屏。因此时景发现/关注等正常功能入口请求也会被阻止。来源作者 ddgksf2013；使用原生 Rule、Map Local、jq，无运行脚本。未知响应结构保持原样。

已验证本地实际 jq 结果和 Surge 原生完整配置解析，未进行 iOS 或应用内全流程验收。
