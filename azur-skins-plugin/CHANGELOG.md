# 更新记录 / Changelog

碧蓝航线立绘图鉴插件（`@local/azur-skins`）与配套抓取管线（`azur-skins/fetch/cli.py`）的版本变更。

版本号遵循 `主版本.次版本.修订号`：

* 主版本：数据格式或接口不兼容的改动
* 次版本：新增功能
* 修订号：修复与体验优化

\---

## v1.0.1 — 2026-11-05

**体验优化与收藏功能。**

### 新增

* **收藏**：每张立绘都可以收藏（卡片右上角 ♥，大图标题旁 ♥），收藏与评分/评语互相独立。
* **我的收藏入口**：侧栏模式切换新增第三个标签「收藏」，集中浏览所有已收藏的立绘，支持原有的分类、L2D/动态、排序与搜索筛选。
* **顶部统计**：新增「收藏」计数，实时更新。
* **大图内保存反馈**：保存评分/评语或切换收藏后，按钮下方直接出现绿色「✓ 已保存」，1.8 秒后自动淡出；大图底部补充「按 Esc 或点空白处关闭」提示。

### 修复

* **大图关闭按钮位置**：`×` 从右侧信息栏内部移到整个弹窗的右上角，独立圆形按钮（34×34），视觉位置与点击区域一致；不再随信息栏滚动而移动。
* **「已保存」提示被遮罩挡住**：提示条 `z-index` 由 60 提升到 90，浮于大图遮罩之上，不再发虚；同时大图内部也有就地反馈。
* 清空评分/评语时不再误删收藏标记。

### 数据与接口

* `reviews.json` 记录新增 `favorite: boolean` 字段（旧数据自动兼容，缺省视为未收藏）。
* `PUT /azur-skins/api/reviews/<icon>` 新增可选 `favorite` 参数；`GET /azur-skins/api/stats` 新增 `favorites` 计数；`GET /azur-skins/api/export` 每行新增 `favorite`。
* Agent 工具 `azur\_skins\_status` 增加 `favorites`；`azur\_skins\_reviews` 增加 `onlyFavorites` 参数与 `favorite` 字段。

\---

## v1.0.0 — 2026-11-05

**首个可用版本：全量立绘图鉴 + 浏览/评分/评语。**

### 数据

* 从 `https://azurlane.mrlar.dev/db/ships` 抓取全部 **902 艘舰船**、**1600 个皮肤**，共 **2502 张立绘**（原皮 902 + 皮肤 1423 + 改造立绘 109 + 誓约立绘 68），原图 2.72 GiB。
* 中文名来自 AzurLaneTools/AzurLaneData（CN 服官方数据）：舰船 859/902、皮肤 1511/1600 直接命中；其余 43 艘船、89 个皮肤人工补译并以「译名」徽章标记。
* 附带站点低清版（`images/compact`，约 5 KB/张）作为原图缺失时的兜底，缩略图（480px webp）全量生成。
* 抓取器 `azur-skins/fetch/cli.py`：`meta / compact / images / thumbs / verify / status` 六个子命令，断点续传、gzip 协商、keep-alive 复用、RIFF 长度校验（防截断文件）。

### 插件

* 侧栏入口「碧蓝航线立绘」，面板三种视图：按舰船、全部立绘、（v1.0.1 起）收藏。
* 按舰种 / 阵营 / 稀有度 / 名称筛选舰船；按分类（原皮/改造/誓约/皮肤）、L2D、动态、已评筛选立绘；按评分/最近/名称排序。
* 每张立绘可打 1–5 星并写最多 2000 字评语，落盘 `azur-skins/data/reviews.json`（原子写、串行队列）。
* 大图查看、原图新窗口打开、徽章展示（L2D / 动态 / 动态背景 / 双形态 / 差分 / 皮肤分类 / 获取方式 / 价格 / 译名）。
* Host 路由：`/azur-skins/api/{catalog,reviews,stats,export}` + `/img/{thumb|full}/<icon>.webp`（同源流式、一年 immutable 缓存）；Agent 工具 `azur\_skins\_status`、`azur\_skins\_reviews`。

\---

## 约定（后续版本）

* 每次改动插件或抓取器，都在本文件顶部追加一节，写明：版本号、日期、新增 / 修复 / 数据与接口变化。
* 版本号同步更新 `azur-skins-plugin/package.json` 的 `version`。
* 数据格式（`reviews.json`、`catalog.json`）若有字段变化，在「数据与接口」里说明是否向后兼容。

