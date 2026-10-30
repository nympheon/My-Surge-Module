# Eight independent Surge modules implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Implement the tasks sequentially; review each task before moving on.

**Goal:** Manually port the eight user-selected upstream configurations, with full original purification behavior, to independently installable Surge Mac/iOS modules.

**Architecture:** Native Surge sections implement simple rules and jq edits. Module-owned readable JS handles conditional JSON and binary payloads. Frozen upstream references support audit and offline behavioral parity checks.

**Tech Stack:** Surge sgmodule, JavaScriptCore-compatible JavaScript, Node built-in test runner, real jq, installed Surge CLI, native Swift/JSC runner.

**Spec:** docs/superpowers/specs/2026-10-31-independent-modules-design.md

## Global Constraints
- Preserve full upstream purification behavior on healthy supported inputs, as explicitly selected by the user; each active source line is accounted for.
- Use the eight exact module folders listed in the spec; runtime JS belongs to each module's js/ directory, with URLs owned by nympheon/My-Surge-Module/main. Do not add a converter, external runtime dependencies, or GitHub workflow.
- Shared Surge Mac 5.9.0+ / iOS 5.14.0+ syntax. Existing StartUpAds files remain byte-identical.
- Readable scripts, one $done, malformed/unknown data passthrough, exact non-ad numeric preservation, body cap 1048576, timeout 5. MITM %APPEND%, no global *, no CA or relaxed server verification.
- Preserve source URL predicates and selected script branches; map native HTTP status/body semantics correctly. Explain deliberate corrections in audits.
- Binary payload modifications preserve unknown fields, field ordering, non-target raw bytes and integer precision; unsupported endpoint/status/cmd and malformed frames pass through.
- Validate locally without enabling modules or modifying the user's live Surge setup. Distinguish static/fixture/JSC checks from iOS and all-App live acceptance.

## Review Focus
- Valid error or new-schema responses must remain unchanged instead of gaining synthetic UI fields; pin with active-endpoint fixtures.
- Unsafe numeric IDs, decimals and encoded JSON must retain raw precision; test literal input/output rather than parsed Numbers.
- Text substitutions must not corrupt escaped strings or match suffix keys; use exact-key/raw-response regressions.
- Module combinations must not shadow stronger transformations; test shared AMDC behavior and known StartUpAds overlaps.
- Binary variants, duplicate/unknown protobuf fields, truncation and non-200 responses must preserve business content or pass through; assert raw bytes.

## Task 1: Native modules and shared validation foundation
**Files:** Create BiliBiliComicsAds/BiliBiliComicsAds.sgmodule, GoofishAds/GoofishAds.sgmodule and GoofishAds/js/amdc.js, MoJiWeatherAds/MoJiWeatherAds.sgmodule; module README/audits; package.json; tests/helpers/ and tests/native-modules.test.js. Frozen references already exist.
**Interfaces:** Test helpers export repository root, a quote-aware module parser, source active-line reader, actual jq execution, an isolated owned-script runner and a native full-profile Surge validator. Keep interfaces small and documented in the task report for following tasks. No production shared JS loader.
- [ ] Read the three full source configurations and relevant script; write focused failing behavioral/source-coverage/native-resource tests first.
- [ ] Hand-author all 43 source lines using native sections where equivalent, plus the request-stage Goofish AMDC script. Preserve full UI cleanup. Guard unknown jq shapes and document deviations.
- [ ] Test representative real jq effects for every expression; map all source IDs/predicates/actions; test UA case/missing/unrelated and malformed/unsafe JSON behavior where JS applies.
- [ ] Run focused tests then npm test once, native Surge parse, diff --check; self-review, commit explicit paths and write task report with RED/GREEN evidence and helper interfaces.

## Task 2: Amap, applets, Cainiao and CheLaiLe
**Files:** Create AmapAds/, Applet/, CainiaoAds/, CheLaiLeAds/ modules, js/ as needed, README/audits; tests/json-modules.test.js and targeted fixtures/helpers. Modify shared tests only as needed.
**Interfaces:** Consume Task 1 helpers; each standalone module runs from its owned raw paths. Script files have no runtime require/import. Consume frozen source scripts only for audit/differential tests.
- [ ] Read all four source configs and all activated source JS branches. Decode obfuscated Amap and CheLaiLe in isolated offline analysis; no obfuscated runtime copy. Write a concise decoded behavior map in docs/audits/ with per-URL expected transformations.
- [ ] Write failing tests for all selected JSON branches, conditional fields/arrays and text cases before authoring replacements. Include original happy-path differential fixtures, unknown/error/malformed payloads, missing child entries, escaped text and raw unsafe numbers.
- [ ] Hand-author the 45 source configuration lines and readable equivalents; use native JQ/text rules when truly equivalent and safer. Preserve full purification and ignore source JS branches unreachable by these configs.
- [ ] Applet generic host predicates retain enumerated MITM host list without global decryption; document old public-account coverage. Fix malformed original text replacements only with recorded evidence. AMDC scripts remain behavior-equivalent with Task 1/StartUpAds.
- [ ] Run focused tests then npm test once, Surge native checks and diff --check; self-review, commit explicit paths and write report with RED/GREEN and all script mappings.

## Task 3: TieBa binary module
**Files:** Create TieBaAds/TieBaAds.sgmodule, TieBaAds/js/tieba-proto.js, module README/audit, tests/tieba.test.js and protobuf fixtures/test helpers as needed.
**Interfaces:** Consume Task 1 module/script helpers and frozen upstream tieba-proto.js. Output Surge Uint8Array body only for recognized activated source branches.
- [ ] Extract the exact protobuf field map and activated transformation branches from frozen upstream; document it for review. Only frs/page, frs/threadlist, frs/generalTabList, pb/page and excellent/personalized from source are active; keep unrelated ad/getFeedAd and b/ad/adBid branches out because config rejects/does not match them.
- [ ] Write failing byte-level fixtures for forum/thread lists, old cmd=302001 and list cmd=309751 post pages, personalized feed, generalTabList, unknown cmd/status/schema and truncated bytes. Include retained goods-free posts, large raw varints, duplicate/unknown fields and live/non-ad cards. Differentially compare supported semantic output with original runtime without requiring original serializer ordering.
- [ ] Hand-author a readable bounded wire editor and all eight config lines, native JQ/reject/IP rules and targeted MITM. No generated schema runtime, loader, BigInt dependency or numeric loss. Preserve upstream default video filtering disabled.
- [ ] Run focused tests then npm test once, Surge native check and diff --check; self-review and commit explicit paths with report evidence.

## Task 4: Integration, documentation and publication preparation
**Files:** Root README.md; tests/integration.test.js; tests/native-jsc.cjs and tests/helpers/jsc-runner.swift; docs/compatibility.md; manifest/audits only as required.
**Interfaces:** Consume the eight completed standalone modules plus unchanged StartUpAds; test runners discover actual owned runtime files and source manifests, not a parallel generated implementation.
- [ ] Add focused tests for nine-module native parsing/coexistence, runtime resource ownership, stable source hashes and StartUpAds byte identity against 63268de. Record expected duplicate AMDC handling and legacy overlapping public-account rules.
- [ ] Index all nine install links and each module's full purification behavior; explain MITM scope, generic applet restrictions, inherited legacy rules, minimum versions and lack of App/iOS live acceptance. Do not recommend destructive App reinstalls as a required validation step.
- [ ] Replay real owned-script test fixtures in native JavaScriptCore; run full npm test and native checks; inspect git diff --check and scoped tree; write final report and commit.
- [ ] Controller obtains final independent review, fixes findings with targeted regressions, then fast-forwards main with user-authorized modules. Verify published raw module and every owned JS URL byte-for-byte and report all eight links.
