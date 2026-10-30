# kelee-HTTPDNS

应用内置 HTTPDNS 拦截，保留原插件的嘀嗒出行例外。使用原生 Rule 和 Map Local，无运行 JS。

```text
https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/kelee-HTTPDNS/kelee-HTTPDNS.sgmodule
```

启用模块、Rewrite 和所需主机的 MITM。仅追加主机，不修改证书或用户代理策略。

来源为可莉 `Block_HTTPDNS`，作者包括可莉与 VirgilClyne，固定镜像提交见 [来源说明](../kelee/SOURCES.md)。此模块用于内置解析接口拦截，不是本次已排除的“防 DNS 泄漏”模块。
