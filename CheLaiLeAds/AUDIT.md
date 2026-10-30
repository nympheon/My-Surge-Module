# CheLaiLe manual port audit

Authority: frozen `references/moyu-independent/CheLaiLeAds.conf` and `scripts/chelaile.js`, author ddgksf2013. Eight predicates retain exact source bytes. Decoded map: [docs/audits/chelaile.md](../docs/audits/chelaile.md).

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
