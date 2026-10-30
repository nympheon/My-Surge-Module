# 哔哩哔哩漫画净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/BiliBiliComicsAds/BiliBiliComicsAds.sgmodule) · [逐条审计](AUDIT.md)

需要 Surge Mac 5.9.0+ / iOS 5.14.0+；启用模块，并在自己的设备上完成 MITM 证书信任。模块以 `%APPEND%` 加入 `manga.bilibili.com`，不带证书或放宽服务器验证。

这是原配置的完整净化：除了广告，还移除活动 Tab、商城/游戏入口、搜索填词/展示/热搜/推荐、我的页除“我的已购”以外的入口，并清零初始化未读计数。全部使用原生 jq Body Rewrite，无外部运行脚本。原作者 ddgksf2013；来源与快照见审计。

未知响应结构会保留；健康已支持结构保持原 jq 行为。原作者提示首次使用前卸载应用再挂载；本项目没有执行该操作。已验证本地 jq 样本与 Surge 原生完整配置解析，未进行 iOS 或应用内全流程验收。
