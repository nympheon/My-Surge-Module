# Applet manual port audit

Authority: frozen `references/moyu-independent/Applet.conf`, `scripts/applet.js` and `scripts/zhangshanggongjiao.js`. ddgksf2013 / Cuttlefish attribution retained. All five predicates are unchanged; repeated identical MITM hosts are deduplicated without adding hosts or a global wildcard.

| Source | Owned action | Behavior |
|---|---|---|
| S0029 | Map Local | blibee banner empty 200 text |
| S0031 | Map Local | SF ad query empty 200 text |
| S0033 | native Body Rewrite | getappmsgad advertisement -> ddgksf2013 (legacy public-account rule retained) |
| S0035 | js/bus.js | exact Ad/Ad_ab numeric toggle 1 -> 0 |
| S0037 | js/applet.js | exact ad-control scalar edits, ad unit identifiers and known HTML unit-id attributes |

The generic URL predicate remains generic, but HTTPS decryption is confined to the original enumerated domains and scoped wildcard domains. Old public-account coverage is retained even though upstream describes standalone WeChat coverage as obsolete; no current service acceptance is inferred.

## Concrete original corruption and deliberate corrections

The original JS string for `Ad` contains `\d` as a JS string escape, which evaluates to `d`, while excitationAd uses `\\d`, which becomes the intended regex digit. The running frozen oracle proves:

```
input:  {"Ad":"2","prefixAdId":"keep","slot":"adunit123","adunitKey":"x"}
source: {"Ad":"2","prefixAdId":"","slot":"","":"x"}
owned:  {"Ad":"0","prefixAdId":"keep","slot":"","adunitKey":"x"}
```

The AdId/adid/ad and bus Ad regexes lacked property boundaries; suffix keys were modified. The final adunit[^" ]* pattern (actual source: `adunit[^\"]*\"`, no space) consumed either a property name or an ID through its following quote, renaming keys and breaking escaped text. The owned tokenizer validates JSON first and edits exact decoded property names and scalar tokens. It corrects intended single digit excitationAd/Ad strings to "0", true ad to false, string AdId/adid to "", and fr_videp_if "1" to "0". Other types and suffix keys survive. Exact adunit numeric IDs or adunit-hex strings are cleared only as complete string values. In recognized HTML opening tags, only a quoted value of the exact unit-id attribute containing adunit-hex is emptied. A small tag/attribute-aware scanner consumes complete quoted values, so data-unit-id, title text mentioning unit-id, and plain article prose are preserved; HTML comments and raw-text elements are opaque. Surrounding HTML and JSON remain valid. No DOM dependency is used. Arbitrary text mentioning adunit is untouched. Whole encoded inner JSON is not blindly interpreted or quote-stripped.

The bus oracle proves `{"Ad":10,"myAd":1,"Ad_ab":1}` became invalid `{"Ad":00,"myAd":0,"Ad_ab":0}`. The readable replacement changes only exact Ad/Ad_ab properties with numeric token 1; 10, suffix keys and escaped prose survive. This deliberately fixes corrupt prefix-number rewriting.

Both scripts inspect parsed roots only for validity/error markers; they never stringify the response tree. Raw unrelated IDs, high-precision decimals, whitespace, escaped strings and property order are preserved. Root arrays of posts and escaped exact property keys are supported. Non-object/malformed inputs, explicit error/errorMessage and generic MTop FAIL_ envelopes pass through (bus checks explicit error markers). errmsg="ok" is healthy. $done occurs once; timeout=5, requires-body=true, max-size=1048576. Native text replacement S0033 retains original literal semantics. No converter, loader, obfuscated runtime or external dependency is shipped.

All tests are local: actual owned scripts under Node VM and macOS JSC; frozen originals are isolated bounded test-only oracles; native Surge validates standalone and combined configs. No iOS/all-app/online coverage claim. [Official native text Body Rewrite syntax](https://manual.nssurge.com/http/body-rewrite.html).

## 使用与验证边界

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/Applet/Applet.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 Rewrite、Scripting、MITM 并信任自己的证书。覆盖上游枚举的特定小程序、便利蜂、顺丰和掌上公交；通用 WordPress URL 只在模块列出的 MITM 主机上解密，不会扩大为全站解密。

完整保留广告控制/隐藏内容相关净化意图，并修复上游文本替换误改后缀键、引号和数字的问题，见本文。不能保证移除微信 5 秒开屏；旧公众号 getappmsgad 规则按要求保留，但不承诺其现时可用性。上游作者 ddgksf2013、Cuttlefish。

脚本为独立可读资源，无外部运行时。已做本地 fixture、精度、原生 Surge/JSC 检查；没有在线证书/配置更改，也没有 iOS 或所有小程序验收。main 链接需发布后才包含这次更新。
