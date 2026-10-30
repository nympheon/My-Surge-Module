# kelee

手工整合选定的 52 项去广告、界面精简及微信/QQ 外链功能。完整范围见 [来源清单](selected-plugins.txt)，其中 HTTPDNS 和京东比价独立为另外两个模块。

安装地址：

```text
https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee/kelee.sgmodule
```

需要 Surge iOS 5.14+ / Mac 5.9+，开启 Rewrite、Scripting、MITM，并安装、信任自己的 Surge CA。11 个运行脚本及顺丰 JSON、拼多多 JS、茶颜悦色图片都使用本仓库地址，模块安装后按需下载缓存。

| 可选参数 | 默认值 | 功能 |
| --- | --- | --- |
| `Tieba_FilterVideo` | `true` | 过滤贴吧推荐视频帖 |
| `IThome_RemovePinned` | `false` | 过滤 IT之家置顶文章 |
| `IThome_RemoveBanners` | `false` | 过滤 IT之家全部横幅 |

参数填写 `true` 或 `false`。其中两项 IT之家可选精简默认关闭，广告项始终过滤。

独立的 [kelee-HTTPDNS](../kelee-HTTPDNS/README.md) 和 [kelee-JDPrice](../kelee-JDPrice/README.md) 可按需安装。防 DNS 泄漏及已排除的外部 `jq_file` 项目未包含在此模块中。

[来源与变更说明](SOURCES.md) 记录上游版本、作者、主动修复及重叠规则取舍。`checks/` 仅包含离线检查，不是转换器。实机效果仍需结合具体 App 版本与请求命中验证。
