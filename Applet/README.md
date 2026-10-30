# 微信小程序净化

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/Applet/Applet.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 Rewrite、Scripting、MITM 并信任自己的证书。覆盖上游枚举的特定小程序、便利蜂、顺丰和掌上公交；通用 WordPress URL 只在模块列出的 MITM 主机上解密，不会扩大为全站解密。

完整保留广告控制/隐藏内容相关净化意图，并修复上游文本替换误改后缀键、引号和数字的问题，见 [AUDIT.md](AUDIT.md)。不能保证移除微信 5 秒开屏；旧公众号 getappmsgad 规则按要求保留，但不承诺其现时可用性。上游作者 ddgksf2013、Cuttlefish。

脚本为独立可读资源，无外部运行时。已做本地 fixture、精度、原生 Surge/JSC 检查；没有在线证书/配置更改，也没有 iOS 或所有小程序验收。main 链接需发布后才包含这次更新。
