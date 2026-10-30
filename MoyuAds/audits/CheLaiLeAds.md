> 合并模块：本来源由 `../MoyuAds.sgmodule` 的对应 `# @source` 分组实现，运行脚本统一位于 `../js/`。历史独立模块描述保留作审计语境；原八个独立入口已替换为一个 MoyuAds 合集。

# CheLaiLe manual port audit

Authority: frozen `references/moyu-independent/CheLaiLeAds.conf` and `scripts/chelaile.js`, author ddgksf2013. Eight predicates retain exact source bytes. Decoded map: [docs/audits/chelaile.md](../../docs/audits/chelaile.md).

| Source | Owned action | Behavior |
|---|---|---|
| S0022 | URL Rewrite reject | domain flowPos/listByPos |
| S0024 | Map Local empty 200 text | info-flow HTML |
| S0026 | Map Local empty 200 text | optional api/adpub |
| S0028 | Map Local empty 200 text | explicit IP ip/adpub |
| S0030 | Map Local empty 200 text | explicit IP flowPos/listByPos |
| S0032 | js/chelaile.js | cityList whitelist and picUrl/clickIconUrl removal |
| S0034 | Map Local empty 200 text | operative_position/infoflow |
| S0036 | Map Local empty 200 text | wx_preloadAd/adAnalysis tracking |

Only the configured goocity/city! branch is active. The original regex extracts wrapped JSON and reconstructs only **YGKJ + JSON.stringify + YGKJ**, dropping arbitrary wrapper prefix/suffix and rounding unsafe JSON numbers. The manual port validates JSON, reads structural spans, and splices only the cityList array. Whitelisted item fields retain their original key/value slices in original order; no numeric token is regenerated, including unsafe integers and long decimals. Unrelated prefix/suffix/root/data/string values survive. Removing picUrl/clickIconUrl and unwanted cities is the full source behavior, including ordinary UI changes.

Unknown/malformed wrapper JSON, missing list, unknown item discriminator, duplicate object keys, nesting beyond 100, unsupported URL or explicit root/jsonr error/errorMessage/FAIL_ envelope passes through unchanged. Source malformed JSON could throw; corrected fail-open behavior is intentional. No universal code/nonzero convention is assumed. A retained list may be empty, as upstream intends.

Original five MITM domains are retained; 124.70.194.16 is added because two original predicates explicitly target HTTP **and HTTPS** at that IP. No global wildcard, CA or relaxed certificate check. Owned response script has requires-body=true, max-size=1048576, timeout=5, one done, no imports/loader/eval/network. Native config checks, Node VM fixtures, original happy-path differential and native macOS JSC pass; no iOS/device/network acceptance is claimed.

## 使用与验证边界

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/MoyuAds.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 Rewrite、Scripting、MITM 并信任自己的证书。完整净化上游广告/跟踪端点和底栏，仅保留「首页、我的、路线规划」，移除保留项的 picUrl/clickIconUrl。

可读脚本只修改 YGKJ 包装内的目标列表，保留包装前后内容、未知字段和数字精度。来源 ddgksf2013，见本文。原 HTTPS IP 规则补入目标 IP 的 MITM，不扩大为全局解密。

已通过本地原脚本差分、原始数字/包装 fixture、原生 Surge/JSC 检查；未修改在线配置或证书，未做 iOS/全应用验收。main 安装链接需发布后包含本次更新。
