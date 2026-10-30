# Eight independent Surge modules

## Intent and authorization
The user selected table entries 1, 2, 3, 6, 7, 10, 12 and 19: Amap, WeChat applets, BiliBili Comics, Cainiao, CheLaiLe, Goofish, MoJi Weather and TieBa. They explicitly selected **保留原配置的完整净化行为** on 2026-10-31. Preserve healthy-input upstream purification behavior, including normal-looking UI/search/recommendation removals; do not silently replace this with an ads-only edition. Existing StartUpAds publication and its 19 JS files must remain byte-identical.

The already agreed approach is manual native Surge authoring and readable JS rewrites, not a converter or scheduled updater. The user previously approved uploading module-owned JS and separate per-module directories; this batch continues that repository workflow.

## Approaches
1. Automatic QX/Loon conversion was explicitly rejected by the user.
2. Ads-only extraction was offered and the user chose full purification instead.
3. Selected: manually port the 96 active configuration lines, use native Surge functionality when equivalent, hand-rewrite required scripts and validate before publication.

## Deliverables
One installable module in each folder, with module-owned runtime JS under its `js/` subdirectory only when needed:
- AmapAds/AmapAds.sgmodule (19 source lines)
- Applet/Applet.sgmodule (5 source lines)
- BiliBiliComicsAds/BiliBiliComicsAds.sgmodule (20 source lines)
- CainiaoAds/CainiaoAds.sgmodule (13 source lines)
- CheLaiLeAds/CheLaiLeAds.sgmodule (8 source lines)
- GoofishAds/GoofishAds.sgmodule (15 source lines)
- MoJiWeatherAds/MoJiWeatherAds.sgmodule (8 source lines)
- TieBaAds/TieBaAds.sgmodule (8 source lines)

Snapshots and SHA-256 records are frozen in references/moyu-independent/. Record every active source line in module Sxxxx comments and per-module human-readable audits, including explained rewrites or exclusions. Keep upstream author/source attribution. Root README indexes all nine modules and explains full purification, requirements, MITM and verification limitations. No GitHub workflow or converter.

## Runtime constraints
- Compatible shared syntax for Surge Mac 5.9.0+ and iOS 5.14.0+; validate with installed Surge CLI and actual jq. Version floors are documented support floors, not old-device acceptance claims.
- Every runtime resource URL uses https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/<module>/js/<file>. No upstream runtime loaders, npm dependency or cross-module JS dependency.
- Preserve each source URL predicate unless a concrete bug is documented and justified. Do not activate commented rules or unused branches of multipurpose upstream scripts.
- reject-200/dict/img use native Map Local with original empty/body/MIME intent. Plain reject uses native URL Rewrite reject or equivalent Rule. Host/host-suffix/IP rules use native Rule syntax.
- QX response-body and jsonjq-response-body use equivalent native Body Rewrite when possible. Guard malformed/unknown data; preserve valid original transformations.
- JS must be readable, bounded, fail open on malformed/unknown data, call $done exactly once, preserve unrelated payload data and numeric precision, and use only Surge JSC-supported APIs. JSON with unsafe numeric tokens must pass through unchanged rather than rounding IDs. No eval, remote loaders, obfuscation, generated protobuf runtime or runtime require.
- Script requires-body only when needed; max-size=1048576 for body scripts and timeout=5. AMDC becomes request-phase short-circuit with case-insensitive User-Agent lookup and original UA predicate, response text ddgksf2013. Each module needing AMDC owns its copy to keep installation independent.
- TieBa binary processing uses binary-body-mode=true. Hand-author only the wire traversal needed by activated endpoints, preserve unknown fields and raw non-target bytes/integers, and pass through unsupported cmd/status/malformed bytes. Preserve upstream default per_filter_video_thread=0; no new user options unless needed for equivalent behavior.
- MITM uses hostname = %APPEND% with original domains plus justified missing targets/ports, no global *, no CA material and no skip-server-cert-verify. Generic applet URL matching only operates on enumerated MITM domains; never broaden to decrypt all hosts. Retain and document the legacy public-account rule even though source WeChat standalone is marked obsolete.

## Verification and evidence
Node built-in tests with no npm third-party packages: native configuration parse, source-line and action mapping, real jq/text behavior, Surge JS mock execution, upstream differential samples when safe and meaningful, unknown-schema/numeric/binary regressions, resource ownership and module coexistence checks. Replay JS fixtures in native macOS JavaScriptCore. Keep original snapshot VM isolated and time-bounded. Tests inspect or execute artifacts, never generate modules.

No App installs, live certificate changes or current Surge profile mutations. Do not claim iOS or all-App live acceptance. Explain incomplete upstream coverage and legacy rules in docs. Before pushing, inspect scoped diff, rerun the suite, ensure StartUpAds unchanged, and verify all public raw files against local bytes after publication.
