# 碧蓝航线立绘图鉴插件（`@local/azur-skins`）

本 Harness 的 Web UI 插件：在侧栏「碧蓝航线立绘」里浏览本地保存的全部舰船立绘与皮肤立绘，打分、写评语、收藏。

完整版本历史见 [CHANGELOG.md](CHANGELOG.md)。数据与抓取说明见 `../azur-skins/README.md`。

## 安装与重载

```powershell
# 安装（首次）
plugin\_manager install\_bundle target="D:\\deepseekHarness\\azur-skins-plugin"

# 改完 index.js / client.js 后重载
plugin\_manager action:"set\_bundle" target:"@local/azur-skins" enabled:false
plugin\_manager action:"set\_bundle" target:"@local/azur-skins" enabled:true
```

`client.js` 的改动需要页面拿到新的模块 revision 才生效（本机没开 `pnpm run dev:web` 时请刷新页面）。

## 依赖的数据

* 默认数据根：`D:\\deepseekHarness\\azur-skins`，可用环境变量 `AZUR\_SKINS\_DIR` 覆盖。
* `data/catalog.json`：舰船/立绘/中文名/标签。
* `images/full/<icon>.webp`、`images/thumb/<icon>.webp`、`images/compact/<icon>.webp`（兜底）。
* `data/reviews.json`：评分、评语与收藏（插件写入，可自行备份）。

## HTTP 接口（同源，无需鉴权）

|方法|路径|说明|
|-|-|-|
|GET|`/azur-skins/api/catalog`|图鉴 + 评分评语 + 统计|
|GET|`/azur-skins/api/stats`|统计（含 `favorites`）|
|GET|`/azur-skins/api/export`|展开成行的评分/评语/收藏导出|
|PUT/POST|`/azur-skins/api/reviews/<icon>`|`{rating?:1-5\|null, comment?:string, favorite?:boolean}`|
|GET|`/azur-skins/api/img/thumb/<icon>.webp`|缩略图|
|GET|`/azur-skins/api/img/full/<icon>.webp`|原图（缺失时回退 compact）|

## Agent 工具

* `azur\_skins\_status`：立绘总数、已下载、缺失、已评/收藏数量与均分。
* `azur\_skins\_reviews`：按星级/关键词/收藏过滤列出评分与评语。

## 版权

立绘素材来自 `azurlane.mrlar.dev`，仅供本地私人浏览，请勿再分发。

