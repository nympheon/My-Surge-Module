> 合并模块：本来源由 `../MoyuAds.sgmodule` 的对应 `# @source` 分组实现，运行脚本统一位于 `../js/`。历史独立模块描述保留作审计语境；原八个独立入口已替换为一个 MoyuAds 合集。

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

## 使用与验证边界

[安装模块](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/MoyuAds.sgmodule)。要求 Surge Mac 5.9.0+ / iOS 5.14.0+，启用 Rewrite、Scripting、MITM 并信任自己的证书。完整保留菜鸟与支付宝小程序的选定净化，包括我的页资产/钱包/会员入口、首页待办/福利与搜索推荐，属于完整 UI 净化。

上游 ddgksf2013；逐条审计（本文）说明 13 条映射、四个 JSON 分支和 MTop 错误透传。AMDC 文件统一归属 MoyuAds 合集，三条原声明共用同一份脚本。上游另有未被配置启用的脚本分支，本模块没有激活它们。

本机真实 jq 差分、数字精度、原生 Surge 配置检查和 AMDC 测试通过；未执行卸载重装、在线配置变更或 iOS/全应用验收。main 安装链接需发布后才会包含本次更新。
