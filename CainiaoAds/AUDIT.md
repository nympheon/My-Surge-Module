# Cainiao manual port audit

Frozen authority: `references/moyu-independent/CainiaoAds.conf` (ddgksf2013 V1.0.16), `scripts/cainiao_json.js` V1.0.21 and `scripts/amdc.js`. All 13 source predicates are retained exactly.

| Source | Owned action | Selected behavior |
|---|---|---|
| S0020 | js/amdc.js | independent request-stage UA response |
| S0022 | jq | delete truthy data.data banner/activity/asset/vip/wallet |
| S0024 | jq | for exact homepage protocol keys @0..@3 only, filter big_banner_area_v870/todo_list_v860 from nested data.result.dataList |
| S0026 | jq | same two type filters in direct homepage data.result.dataList |
| S0028 | jq | truthy adHotKeywords -> [] |
| S0030 | Map Local | empty 200; retain original negative _home lookahead |
| S0032 | Map Local | mshow empty 200 |
| S0034 | Map Local | bottom product empty 200 |
| S0036 | Map Local | bottom badge empty 200 |
| S0040 | Map Local | Alipay general ads empty 200 |
| S0042 | Map Local | Alipay new bottom products empty 200 |
| S0044 | Map Local | Alipay old bottom products empty 200 |
| S0046 | Map Local | anonymous survey empty 200 |

Full healthy fixtures compare each native jq action with isolated frozen original JS and literal expectations. Original ordinary UI removals (todo list, asset/wallet/vip) are intentionally retained. The script's ads.mshow/index.cn branches are unreachable through script actions in this config (mshow is blocked natively), so no extra runtime branch is activated. Merge @4 and unrelated keys/fields survive; missing children are not fabricated.

Any MTop ret string starting FAIL_ preserves the entire error envelope before cleanup, including target-shaped diagnostics. Merge children independently honor their own FAIL_ and explicit error markers, retaining failed children while allowing healthy siblings to be purified. Explicit error/errorMessage also passes through. code=1, marker-absent and errmsg="ok" healthy fixtures still transform; no universal code!=0 rule is imposed. Recognizable collection items require an object/string type discriminator; future/null entries preserve the whole corresponding collection. Unknown nested indexing errors retain original input via jq try/catch. Native malformed JSON is skipped by Surge.

True JS truthiness is used for simple exact target keys, retaining false/0/empty-string/null rather than deleting them. Actual jq fixtures preserve non-target raw 9007199254740993123456789 and 0.1234567890123456789012345. No runtime package or JSON stringify precision loss. Independent AMDC is identical to the reviewed Task 1 equivalent: request phase, no body, case-insensitive UA header names, original UA value predicate, response 200/plain text ddgksf2013, timeout=5, exactly one done.

Original *.cainiao.com and the two Taobao MITM hosts are retained with %APPEND%; no global wildcard, CA or relaxed server verification. Native jq response limits are managed by Surge (1MB iOS, 10MB Mac), not script max-size. Local/native tests are not iOS or real-app acceptance. [Official native jq syntax](https://manual.nssurge.com/http/body-rewrite.html).
