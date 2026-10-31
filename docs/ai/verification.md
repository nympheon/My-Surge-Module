# 验证入口、历史基线与证据范围

维护索引：[根 AGENTS.md](../../AGENTS.md)。

本文件由 2026-10-31 的根 `AGENTS.md` 按主题迁移，源提交为 `e9c3bf046a9a6729a011265e34ed11ca2f9aa927`；拆分日期为 2026-11-01。文中代码路径均相对仓库根目录。历史日期、数量、验证结果和发布锚点需要按当次任务重新核对。

## 仓库内可运行的检查

在仓库根目录运行，需要 Python 3、Node.js、jq 和 Surge Mac CLI：

```sh
# MoyuAds 及明确列出的 StartUpAds 身份/重叠检查
npm test
npm run test:jsc

# kelee 三产品检查
python3 kelee/checks/validate.py
node kelee/checks/runtime.cjs
python3 kelee/checks/jq.py
node --test kelee/checks/additions.test.cjs
node --test kelee-YouTube/checks/youtube.test.cjs
npm test
git diff --check
```

- 根 npm 测试读取真实 MoyuAds 和模块自有 JS；无 npm 第三方依赖，不需要先 npm install。需要 Node 18+、jq、macOS Surge CLI，JSC 重放另需 Swift 与系统 JavaScriptCore。详见 MoyuAds/MAINTENANCE。
- `validate.py`：检查四个 kelee 模块（含独立 YouTube），校验本仓库资源引用、单独/组合 Surge 语法、JQ 编译、JS 语法和静态资源格式。
- `runtime.cjs`：读取当前仓库脚本，所有网络、通知和持久化均为替身；包含独立目录的京东比价脚本。
- `jq.py`：执行当前 kelee 原生 JQ，覆盖 IT之家参数、正常内容保留及已修正的真假值差异。
- `kelee/checks/` 与 `kelee-YouTube/checks/` 都是验证程序，不是模块转换器；它们不负责 StartUpAds。根 `npm test` 有该产品的部分语法/保留检查，不等于旧完整测试框架。这些命令均不安装或启用模块。
- 校验器原有 15 个运行资产；本次经审核添加两个 YouTube JS，目前断言为 17。后续确实新增/删除资产时，需审核新的预期数量和引用再更新断言，不得为“变绿”直接删除检查。
- Surge `--check` 面向完整配置。含 Rule 的模块需要在临时完整配置中补 FINAL；发布模块自身不能含 FINAL。临时验证可把远程资源替换成对应本地文件，以检查本次候选内容。
- Git 暂存后的变更还需 `git diff --cached --check`，并核对精确文件列表。

2026-10-31 核对的运行代码基线（0d9342e，后续可能变化）：

| 项目 | Rule | Body Rewrite | Map Local | URL Rewrite | Script 声明 |
| --- | ---: | ---: | ---: | ---: | ---: |
| MoyuAds | 4 | 51 | 32 | 2 | 7，引用 5 个 JS |
| StartUpAds | 6 | 22 | 435 | 16 | 20，引用 19 个 JS |
| kelee | 438 | 142 | 205 | 9 | 11 |
| kelee-HTTPDNS | 112 | 0 | 6 | 0 | 0 |
| kelee-JDPrice | 0 | 0 | 0 | 0 | 2，引用同一个 JS |

2026-10-31 发布时三个 kelee 模块的证据为：141 条 JQ 编译、13 个 JS 语法、77 项脚本断言、31 组 JQ 样例通过；3 个模块与 15 个资源的 18 个 raw URL 均回读一致。这里的 13 个 JS 包括 12 个运行脚本和 1 个网页静态 JS。

MoyuAds 合并发布基线的历史证据为：269 项根测试、230 次实际 JSC 调用通过；一个合集和五份 JS 的六个 raw 资源逐字节回读一致。根测试也验证实际 MoyuAds、StartUpAds 分别及组合的临时完整配置。没有逐一完成 iOS、历史版本或全部 App 真实流量验收。

这些数字是历史基线，不是更新后必须维持的业务目标。不得通过删规则、删样例或硬编码输出维持数字。修改后必须重新运行适用检查，依据实际结果报告。
