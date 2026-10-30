# kelee-JDPrice

通过慢慢买接口，在京东商品详情页插入价格信息。脚本位于本目录 `js/JD_Price.js`，模块引用本仓库完整 HTTPS 地址。

```text
https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee-JDPrice/kelee-JDPrice.sgmodule
```

安装并开启 Scripting、MITM，完成 Surge CA 信任后，先打开慢慢买“我的”页面获取所需参数，再打开京东商品详情页。凭据保存在 Surge 本地持久化存储中，捕获通知不回显正文。

保留原作者的慢慢买接口与价格计算流程，查询超时为 70 秒。检查只使用虚构凭据和模拟 API，没有调用真实价格查询接口，因此不将离线通过描述为外部服务实测可用。

作者：wf021325、githubdulong、mw418。固定镜像与改动记录见 [来源说明](../kelee/SOURCES.md)。
