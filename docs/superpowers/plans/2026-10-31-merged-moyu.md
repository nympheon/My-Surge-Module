# Merged Moyu Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. This is one packaging task with one fresh final review.

**Goal:** Replace eight separate user-selected module entries with one complete MoyuAds module.

**Architecture:** One native module retains the audited rule lines and source groups; five byte-identical owned JS files replace seven copies. Tests inspect the real artifact and published baseline.

**Tech Stack:** Surge module, Node tests, jq, macOS Surge CLI and JavaScriptCore.

**Spec:** docs/superpowers/specs/2026-10-31-merged-moyu-design.md

## Global Constraints
- Preserve all 96 source mappings, complete behavior and within-section order.
- Keep seven original Script declarations and patterns/options; only paths change to MoyuAds/js. Five JS files preserve original bytes.
- Exact deduplicated MITM union, one %APPEND% assignment; Mac 5.9+/iOS 5.14+ syntax.
- Replace eight old runtime directories locally; retain audits/frozen sources and all unrelated published runtime bytes. Latest user steering limits this task to local module preparation. No README, converter, live profile changes, commit, push or installation.

## Review Focus
- Rules with repeated physical source IDs must remain attributed to the right original source.
- Overlapping AMDC declarations must keep original patterns/order despite sharing one identical file.
- Broad Goofish search predicates and jq pipeline order must remain unchanged.
- MITM union must preserve every exact host/wildcard/IP without introducing a global wildcard.
- Old subscriptions must have an explicit manual migration instruction; no documentation/test references may imply eight installable artifacts remain.

### Task 1: Merge and verify locally
**Files:** Create MoyuAds/MoyuAds.sgmodule, MoyuAds/js/*, MoyuAds/audits/* and tests/merged-module.test.js; remove the eight old runtime directories; adapt tests/helpers/index.js, existing behavior tests, tests/integration.test.js, tests/native-jsc.cjs, AGENTS.md and current docs.

**Interfaces:** parseModule(name) reads actual published artifacts and attaches source group to entries; parseSource(name) filters actual MoyuAds entries for source-based behavioral fixtures. It never generates production modules. Existing fixture inputs/expected results stay unchanged apart from physical path/ownership assertions.

- [x] Write baseline-equivalence, runtime identity, exact MITM union, ownership/removal and actual native-parser tests; observe failures for missing merged artifact.
- [x] Manually combine existing sections, relocate unchanged JS/audits, adapt source-group test parsing and current docs, and remove old paths.
- [x] Run focused merge checks then full npm test and npm run test:jsc; inspect full-range whitespace/path scope. Leave changes uncommitted for local review.
- [x] Obtain one fresh independent whole-branch review; address concrete findings with focused regressions.
- [x] Deliver local module and five owned JS files; explain future install migration and that new hosted JS paths await a later authorized publication. Do not operate Surge or publish in this task.

### Authorized publication after local handoff

The user subsequently authorized repository consolidation. Previous local-only steps describe that completed handoff; the following publication is now in scope. Runtime bytes remain the reviewed candidate.

- [ ] Commit only the reviewed packaging change and current publication-state documentation; preserve all unrelated runtime files and history.
- [ ] Normally fast-forward main; verify remote commit/tree, absence of eight old runtime directories and byte identity of one module plus five JS. Keep live Surge untouched.
