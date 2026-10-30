# 闲鱼净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/GoofishAds/GoofishAds.sgmodule) · [逐条审计](AUDIT.md)

需要 Surge Mac 5.9.0+ / iOS 5.14.0+；启用模块，并在自己的设备上完成 MITM 证书信任。模块追加 `acs.m.goofish.com`、`g-acs.m.goofish.com`；没有证书或放宽服务器验证。

保留完整原配置净化：开屏、悬浮球、首页顶部与信息流、搜索填词/发现/推荐、我的页与购买推荐、本地及商品推荐。它会保留首页第一顶部项、商品流及我的页 head/user/trade 分支，功能超出仅去广告。来源作者 ddgksf2013；快照与差异见审计。

AMDC 使用本目录独立 `js/amdc.js`，按原 UA 分支在请求阶段返回文本；无需响应正文。原作者提示首次使用前卸载应用再挂载；本项目没有执行该操作。已验证本地 jq、脚本 VM、macOS JavaScriptCore 与 Surge 配置解析，未进行 iOS 或应用内全流程验收。
