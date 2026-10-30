# My Surge Module

个人手工维护的 Surge Mac / iOS 模块仓库。每个模块使用独立目录，配套脚本和静态资源也放在对应目录内。

在 Surge 中选择“从 URL 安装模块”，复制下表链接即可。脚本与静态资源通过模块中的本仓库 HTTPS 地址下载，无需手动复制目录。

| 模块 | 安装地址 | 内容 |
| --- | --- | --- |
| StartUpAds | [StartUpAds.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/StartUpAds/StartUpAds.sgmodule) | 已有墨鱼去开屏合集 |
| kelee | [kelee.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee/kelee.sgmodule) | 52 项去广告、界面精简及微信/QQ 外链功能 |
| kelee-HTTPDNS | [kelee-HTTPDNS.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee-HTTPDNS/kelee-HTTPDNS.sgmodule) | 应用内置 HTTPDNS 拦截 |
| kelee-JDPrice | [kelee-JDPrice.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee-JDPrice/kelee-JDPrice.sgmodule) | 京东商品详情页比价 |

最低版本为 **Surge Mac 5.9 / iOS 5.14**。根据模块内容开启 Rewrite、Scripting、MITM，并安装、信任自己的 Surge CA。模块仅追加所需 MITM 域名，不包含证书或代理节点。

StartUpAds 和 kelee 包含重叠的 App 规则，建议先分别启用验证。HTTPDNS 和京东比价可以按需要独立启用。

## 目录与来源

```text
StartUpAds/       已有模块及 js/
kelee/            去广告集合、js/、resources/、checks/
kelee-HTTPDNS/    HTTPDNS 模块
kelee-JDPrice/    比价模块及 js/
```

kelee 系列共覆盖选定的 54 项 Loon 来源；不包含防 DNS 泄漏和已排除的外部 `jq_file` 项目。规则是逐条手工整理的 Surge 原生配置，保留必要的明文运行脚本，没有批量转换器或定时更新任务。

- [kelee 安装与参数说明](kelee/README.md)
- [kelee 来源、作者与手工修正](kelee/SOURCES.md)
- [HTTPDNS 说明](kelee-HTTPDNS/README.md)
- [京东比价说明](kelee-JDPrice/README.md)

## kelee 系列检查

本地需要 Python 3、Node.js、`jq` 以及 Surge Mac CLI：

```sh
python3 kelee/checks/validate.py
node kelee/checks/runtime.cjs
python3 kelee/checks/jq.py
```

检查程序只读取模块和资源、创建临时验证配置，不转换或重新生成模块，也不修改当前 Surge 配置。检查覆盖运行资源引用、三模块单独/组合语法、JQ 编译、JS 语法和离线行为样例。

静态及模拟检查通过不等同于真实 App 验收；尚未完成这三项新模块在 Mac/iOS 全部目标应用上的实机测试。
