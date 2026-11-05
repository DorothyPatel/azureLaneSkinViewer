# azur-skins —— 碧蓝航线立绘库（本地）

把 [azurlane.mrlar.dev](https://azurlane.mrlar.dev/db/ships) 的全舰船立绘 + 全皮肤立绘抓到本地，配中文名，
再用同仓插件 `azur-skins-plugin` 浏览、打分、写评语、收藏。

> 仅供个人本地浏览。图片版权归原作者/发行方，不要二次分发。

## 规模

|项|数量|
|-|-|
|舰船|902（含布里等特殊船）|
|立绘|2502（原皮 902 / 皮肤 1423 / 改造 109 / 誓约 68）|
|体积|全量原图约 2.9 GB，缩略图约 120 MB|

中文名：859 艘船、1511 张立绘来自 CN 服官方数据（AzurLaneData），其余 43 艘船 + 132 张立绘
是用 `data/overrides.zh.json` 补的译名（`zhSource: "auto"`，UI 上带「译名」角标）。

## 目录

```
azur-skins/
  fetch/cli.py          抓取管线（meta / images / compact / thumbs / verify / status）
  source/               站点原始 JSON + CN 服数据（缓存，可删，重跑 meta 会再下）
  data/catalog.json     给插件用的总目录（舰船 + 立绘 + 中文名 + 标签表）
  data/labels.zh.json   舰种/阵营/稀有度/皮肤分类/获取方式 的中文标签
  data/overrides.zh.json 官方数据没覆盖到的中译名
  data/download.json     每张图的下载状态（断点续传用）
  data/missing.json      下载失败的图（下次 images 会重试）
  data/reviews.json      评分 / 评语 / 收藏（插件写入）
  images/full/<icon>.webp    原图（约 1.1 MB/张）
  images/compact/<icon>.webp 站点的低清版本（约 5 KB/张，原图没下完时兜底）
  images/thumb/<icon>.webp   480px 缩略图（由 full 或 compact 生成）
```

## 命令

```powershell
$py = "C:\\Users\\10359\\.dsh\\dsh-runtimes\\dsh-primary-runtime\\dependencies\\python\\python.exe"
$cli = "D:\\deepseekHarness\\azur-skins\\fetch\\cli.py"

\& $py $cli meta                 # 抓站点数据 + CN 中文名，生成 catalog.json（新船/新皮肤后重跑）
\& $py $cli compact --workers 10 # 先下低清图（约 30 MB，几分钟），让图鉴立刻完整可看
\& $py $cli thumbs --workers 6   # 由 full（缺则 compact）生成缩略图（可反复跑）
\& $py $cli images --workers 6   # 下载原图（断点续传，可反复跑；受站点限速，全量要几小时）
\& $py $cli verify               # 体检：缺失/截断/孤儿文件/缩略图/中文名覆盖
\& $py $cli status               # 一行汇总
```

* 下载器做了三件事：每线程复用一条 TLS 连接（握手很贵）、每张图校验 `RIFF/WEBP` 且
`RIFF 长度字段 == 文件实际长度`（防止半截文件）、失败重试 6 次并指数退避。
* `full/` 404 时自动回退 `compact/`，并记进 `missing.json`。
* 站点偶发限速/握手超时：停下等几分钟，用更小并发（例如 `--workers 4`）再跑即可，已下载的不会重下。
* 新船/新皮肤上线后：重跑 `meta` → `compact` → `thumbs` → `images`，增量补齐。

## 插件

* 包：`D:\\deepseekHarness\\azur-skins-plugin\\`（Host `index.js` + Web UI `client.js`）
* 安装：`plugin\_manager action:"install\_bundle" target:"D:\\deepseekHarness\\azur-skins-plugin"`
* 改完代码重载：`plugin\_manager action:"set\_bundle" target:"@local/azur-skins" enabled:false` → `enabled:true`
* 侧栏入口「碧蓝航线立绘」；评分/评语/收藏存在 `data/reviews.json`（key 是 icon，例如 `lingbo\_11`）。
* 数据目录默认 `D:\\deepseekHarness\\azur-skins`，可用环境变量 `AZUR\_SKINS\_DIR` 覆盖。
* 版本更新记录：`azur-skins-plugin/CHANGELOG.md`。

## HTTP 接口（同源，无需额外起服务）

|方法|路径|说明|
|-|-|-|
|GET|`/azur-skins/api/catalog`|目录 + 评语 + 收藏 + 统计|
|GET|`/azur-skins/api/img/thumb/<icon>.webp`|缩略图|
|GET|`/azur-skins/api/img/full/<icon>.webp`|原图；还没下载完时自动返回 compact 兜底（缓存 5 分钟）|
|GET|`/azur-skins/api/reviews`|全部评语与收藏|
|PUT|`/azur-skins/api/reviews/<icon>`|`{rating:1-5\|null, comment:"...", favorite:true\|false}`；只有三者都为空才删除记录|
|GET|`/azur-skins/api/stats`|已评分/已收藏统计|
|GET|`/azur-skins/api/export`|评语/收藏导出（含舰船/立绘中文名）|

Agent 工具：`azur\_skins\_status`、`azur\_skins\_reviews`。

