# Decoded CheLaiLe behavior map

Authority is frozen `references/moyu-independent/scripts/chelaile.js` and its manifest hash. The obfuscated runtime is not copied. The selected config activates only `/goocity/city!`.

The original finds a YGKJ-wrapped JSON payload, parses it and reads jsonr.data.cityList. It retains entries whose exact title is 首页, 我的 or 路线规划. From retained entries it deletes picUrl and clickIconUrl, retaining all other fields. It then rebuilds only the fixed **YGKJ...YGKJ** wrapper with JSON.stringify. Its try/catch protects list manipulation but not malformed outer JSON parsing.

The readable owned script preserves those healthy data transformations. It corrects loss of existing prefix/suffix and numeric precision by replacing only the target array using original field spans. Frozen happy-path differential and hand-derived raw wrapper fixtures prove the whitelist, both removed properties, unrelated keys/escaped text, prefix/suffix, unsafe integer 9007199254740993123456789 and decimal 0.1234567890123456789012345. Unknown or malformed content passes through. Details and all eight native mappings are in [MoyuAds CheLaiLe audit](../../MoyuAds/audits/CheLaiLeAds.md).
