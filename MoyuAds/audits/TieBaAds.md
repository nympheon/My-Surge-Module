> 合并模块：本来源由 `../MoyuAds.sgmodule` 的对应 `# @source` 分组实现，运行脚本统一位于 `../js/`。历史独立模块描述保留作审计语境；原八个独立入口已替换为一个 MoyuAds 合集。

# TieBa 源码映射与边界

以 `references/moyu-independent/TieBaAds.conf` 的 2026-10-31 冻结快照为准。全部 8 条有效源行手工实现，URL 正则逐字保留；Sxxxx 是源文件物理行号。原脚本作者 app2smile，配置整理 ddgksf2013。

| 源行 | 原行为 | 原生实现 |
|---|---|---|
| S0019 | 拒绝 180.76.76.200/32 | Rule `IP-CIDR,...,REJECT,no-resolve`；不为匹配此规则主动解析 DNS，仍匹配直接访问 IP 或目标 IP 已解析的请求 |
| S0022 | 清空首页、进吧搜索发现列表 | Body Rewrite jq，`.data.discover_list=[]` |
| S0024 | 删除抽屉游戏中心、工具、VIP 横幅与任务列表 | Body Rewrite jq，保留原四个删除项 |
| S0026 | 删除我的页六个推荐/VIP 字段；功能区只保留 common_func、auxiliary_func | Body Rewrite jq，保留完整原筛选，不缩减为纯广告过滤 |
| S0028 | 清空进吧 hot_search | Body Rewrite jq |
| S0030 | 删除搜索推荐 data | Body Rewrite jq |
| S0032 | getFeedAd 返回空 200 | Map Local 空文本；没有启用原 JS 的 getFeedAd 分支 |
| S0034 | 被原 URL 正则选中的 protobuf 页面净化 | 本模块自有可读 wire 编辑器，binary-body-mode=true、requires-body=true、max-size=1048576、timeout=5 |

2026-10-31 配置警告修正：S0019 已是合集 `[Rule]` 的最后一条，但 Surge 会将模块规则插到主配置规则之前，单在模块内后移不能避免提前解析 DNS。因此为它添加 `no-resolve`；未解析出目标 IP 的域名请求将跳过该规则，后续规则继续匹配。这是相对冻结上游的明确行为调整，冻结源文件与其他规则保持原样。规则顺序及参数语义见 [Surge 模块说明](https://manual.nssurge.com/profile/module.html)和 [IP 规则说明](https://manual.nssurge.com/rules/ip.html)。

## JSON 边界

保留 object 根及目标集合的必要结构检查，不为缺失/未知字段凭空构造成功数据。S0026 要求每条 zone_info 是有字符串 type 的对象，否则整个输入保留，避免部分删除。明确存在非零/非字符串零 `error_code` 时放行；数值 0、字符串 `"0"` 或没有该标记时处理有效结构。未知 JSON 根、错误 JSON 和未知集合结构不作破坏性改写。jq 没有 JS Number 中转，测试验证无关超大整数字面量不变。

Surge 原生 Body Rewrite 使用平台自身体积限制；脚本的 1 MiB 限制仅适用于 S0034，不将 script 参数虚构为 jq 参数。

## protobuf 手写字段表

仅认识冻结脚本激活分支所需结构；括号为 wire 字段号。所有响应根的 data 为 (2)。以下字段名来自源声明，不包含生成运行时代码。

| 消息/路径 | 认识的字段与行为 |
|---|---|
| FrsPage data | forum(2)、threadList(7)、activityhead(23)、liveFuseForum(116)、pageData(126) |
| ForumInfo → BannerList | bannerList(33) → app(1)，删除每个 App.goodsInfo(30)，保留 App.liveAd(38) |
| FrsPage threadList → ThreadInfo | alaInfo(113) **存在**就移除帖子，即使 liveId=0；videoInfo(79) 保留 |
| FrsPage activityhead | 仅合并后 isAd(13) 非零才移除整个 activityhead；否则所有原始块保留 |
| FrsPage liveFuseForum | 删除全部重复字段 |
| FrsPage pageData → PageData | feedList(2) → LayoutFactory.feed(2) → FeedLayout.businessInfo(5) → FeedKV.key(1)/value(2)；任一记录最终 key=is_live_card 且最终 value=1 时移除该 feedList 卡片 |
| ThreadList data | bannerList(3) → app(1) → goodsInfo(30)；不删除 pbBannerAd(5) 或普通 App.liveAd |
| GeneralTabList data | appList(10) → goodsInfo(30)，保留 liveAd |
| Personalized data | bannerList(9) 的 app.goodsInfo、threadList(2) 的直播帖子、liveAnswer(17)；默认保留普通视频 |
| Old PbPage data，cmd=302001 | bannerList(12) 的 app.goodsInfo；另清理 pbBannerAd(5) 内 goodsInfo(30) 和 liveAd(38)；recomAlaInfo(55) 合并后的 liveId(1) 非零时删除；postList(6) 内 outerItem(54) 和 novelRecomCard(67) 删除 |
| List PbPage data，cmd=309751 | firstFloor(6) 的 novelRecomCard(67) 删除；**保留 outerItem(54)** |

被遍历的叶消息还检查源声明的 wire 类型：GoodsInfo.id(1) varint、LiveAdData.recomAlaInfo(1) message、AlaLiveInfo.liveId(1) varint、Item.itemId(1) varint、VideoInfo.videoMd5(1)/NovelRecomCard.iconUrl(1)/LiveAnswer.bannerUrl(1)/LiveFuseForum.onlineUsers(1) 为 UTF-8 string。

原 `per_filter_video_thread=0` 默认保持不变。已有显式 string/object 参数 `per_filter_video_thread` 继续支持，非零才额外过滤 personalized 普通视频；模块没有新增选项。

## 重复字段、字节与故障处理

- 根 data 和其他 singular 消息出现多次时按 protobuf 合并语义处理。遍历同一路径的所有块，并用最后一次 scalar 值判断 activityhead、recomAlaInfo 与 FeedKV。重复集合元素各自独立，不错误合并帖子或 App。
- 判断为保留时，不重序列化任何对应块；判断删除整个 singular 字段时，删除它的所有出现位置。只改写被修改祖先的长度前缀；其 tag 字节也保留。重复空 envelope 可以继续存在，避免改变未知内容及物理布局。
- 源声明的 string 叶字段在任何净化操作前按原始字节校验 UTF-8，包括最终将被删除的消息内字符串。拒绝非法起始/续字节、截断、过长编码、代理码点和超过 U+10FFFF 的编码；整个输入放行。校验线性扫描各字符串，不依赖 TextDecoder，不解码或重编码原内容。未知 length-delimited 字段不视作字符串，继续不透明保留。
- 未知字段和所有非目标 scalar/固定宽度/字节 payload 原样复制，包括不规范但可识别的 varint、超 JS 安全整数范围的大值、原排序与非广告重复字段。只有 tag/长度使用有界 uint32 数值运算。liveId 仅测试原始低 7 位是否全部为零，没有 64 位数值转换。
- 仅遍历上述声明的消息；未知 length-delimited payload 保持不透明。对识别字段 wire 类型不匹配、截断、零 tag、溢出 varint、group wire type 3/4 或非法 wire type，整个响应放行，绝不输出部分结果。
- 输入最大 1048576 字节，最多解析 100000 个字段、深度上限 12。超限整体放行。当前支持的声明路径远小于深度上限；字段预算避免恶意极密消息占用脚本资源。支持恰好 1 MiB 且包含未知大 payload 的合法帧。
- 只接受 Uint8Array、数值 HTTP status/statusCode 200。其它情况 `$done({})`；修改时 `$done({body: Uint8Array})`，每次只调用一次。
- 无 BigInt、TextDecoder、eval、require、import、动态 schema 生成、远程加载器或第三方运行库。冻结原脚本只在 Node 测试的受限 VM 中作语义 oracle，不进入发布 JS。

## 命令匹配修正与未激活分支

模块外层 S0034 正则完全保留，包括仅 HTTPS tiebac.baidu.com 与 HTTP c.tieba.baidu.com。脚本内部用确切路径和首个 `cmd` 参数分派；pb/page 仅接受 cmd=302001 或 cmd=309751，重复 cmd 整体放行。原脚本以 URL 任意位置 `includes("302001")` / `includes("309751")` 判断，实际会误将 cmd=3020010 或 cmd=1&other=302001 当旧协议。这些有实测 fixture 的误匹配已修正，正常精确 cmd 的完整行为通过原脚本差异测试。

原 JS 额外包含 ad/getFeedAd 和 b/ad/adBid。前者源配置 S0032 已直接空响应，后者没有匹配规则；二者均不在发布脚本中激活。没有新增 HTTPS c.tieba.baidu.com 解密需求；保留原 MITM 两个域名，不添加全局通配或证书设置。

## 验证范围

`tests/tieba.test.js` 检验所有源行映射、实际 jq、原生 Surge 完整临时配置解析、各入口的手工 byte fixtures、冻结原脚本语义对照、重复 singular/last-scalar-wins、未知字段与 uint64、128 字节长度边界、1 MiB 边界、预算/坏帧回退、已知字符串 UTF-8 验证，并在 macOS JavaScriptCore 执行相同发布脚本。早期分项阶段验证过六模块组合；当前发布入口为一个 MoyuAds，根测试检查真实合集与 StartUpAds 的临时完整配置。

这些是本地离线和运行时夹具证据，不是 iOS、旧版本 Surge 或真实 App 验收。分项移植阶段没有启用模块或更改证书/live profile；随后合并版已在 0d9342e 发布，详见 SOURCES 和 MAINTENANCE。

## 使用与验证边界

手工移植墨鱼 TieBaAds 配置的全部 8 条有效规则，以及配置实际调用的 app2smile protobuf 净化分支。包含搜索、抽屉、我的页等完整界面净化；普通视频帖子默认保留。

- 模块：[MoyuAds.sgmodule](https://raw.githubusercontent.com/nympheon/My-Surge-Module/main/MoyuAds/MoyuAds.sgmodule)
- 支持语法：Surge Mac 5.9.0+ / iOS 5.14.0+。
- 独立脚本：[js/tieba-proto.js](../js/tieba-proto.js)，资源属于本模块，无远程加载器或第三方依赖。
- HTTPS 改写需要用户已有的 MITM 与证书信任配置；模块只追加 `tieba.baidu.com, tiebac.baidu.com`。

二进制脚本只编辑明确识别的 protobuf 字段，保留其余原始字节、未知字段、顺序与 64 位整数。只处理 HTTP 200；未知命令、字段 wire 类型不符、损坏帧或超限整体放行。体积上限 1 MiB，超时 5 秒。详细字段、边界与原行为差异见本文。

来源：[ddgksf2013 / TieBaAds.conf](https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/TieBaAds.conf)、[app2smile / tieba-proto.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-proto.js)。冻结快照在仓库 `references/moyu-independent/`，仅作离线审计与测试 oracle，不由模块运行。

本地已验证真实 jq、字节级 fixtures、原脚本语义对照、macOS JavaScriptCore 和 Surge 原生配置解析。未启用用户配置，未完成 iOS、旧版本设备或真实 App 全流程验收。合并版已在 0d9342e 发布，模块与五份运行 JS 已逐字节回读；以后更新仍需重新核验。
