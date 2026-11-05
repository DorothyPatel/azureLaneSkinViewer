/**
 * 碧蓝航线图鉴 Host 端。
 *
 * 职责：
 *  - 读取 D:\deepseekHarness\azur-skins\data\catalog.json（抓取管线产出）
 *  - 同源流式返回本地立绘（thumb / full）
 *  - 评分与评语的持久化（data/reviews.json）
 *  - 给 Agent 的 azur_skins_* 工具
 */
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';

export const inject = ['tools', 'webServer'];

const API_PREFIX = '/azur-skins/api';
const IMG_PREFIX = `${API_PREFIX}/img/`;
const REVIEWS_PREFIX = `${API_PREFIX}/reviews/`;
const JSON_BODY_LIMIT = 32768;
const MAX_COMMENT_LENGTH = 2000;
const ICON_RE = /^[a-z0-9_-]+$/i;

const MIME_WEBP = 'image/webp';

function defaultDataRoot() {
  const fromEnv = typeof process.env.AZUR_SKINS_DIR === 'string' ? process.env.AZUR_SKINS_DIR.trim() : '';
  return fromEnv || process.env.AZUR_SKINS_DIR === '' ? fromEnv : '';
}

function resolveDataRoot() {
  const env = typeof process.env.AZUR_SKINS_DIR === 'string' ? process.env.AZUR_SKINS_DIR.trim() : '';
  if (env) return env;
  return path.win32.join('D:\\deepseekHarness', 'azur-skins');
}

function sendJson(res, statusCode, value) {
  const body = JSON.stringify(value);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, statusCode, message, extra) {
  sendJson(res, statusCode, { ok: false, error: message, ...(extra || {}) });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > JSON_BODY_LIMIT) {
        reject(new Error('请求内容过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(new Error('请求内容不是有效的 JSON'));
      }
    });
    req.on('error', (error) => reject(error));
  });
}

function sameOrigin(req) {
  const origin = req.headers && req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch (error) {
    return false;
  }
}

function nowStamp() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------- catalog

class CatalogSource {
  constructor(root) {
    this.root = root;
    this.catalogFile = path.join(root, 'data', 'catalog.json');
    this.cache = { mtime: 0, value: null };
  }

  async load() {
    let stat;
    try {
      stat = await fs.stat(this.catalogFile);
    } catch (error) {
      return null;
    }
    if (this.cache.value && this.cache.mtime === stat.mtimeMs) return this.cache.value;
    const raw = await fs.readFile(this.catalogFile, 'utf8');
    const value = JSON.parse(raw);
    this.cache = { mtime: stat.mtimeMs, value };
    return value;
  }

  imagePath(size, icon) {
    const dir = size === 'thumb' ? 'thumb' : 'full';
    return path.join(this.root, 'images', dir, `${icon}.webp`);
  }

  // 高清图还没下载完时，退回到低清 compact 版本，保证任何一张立绘都点得开。
  fallbackPath(size, icon) {
    if (size === 'thumb') return '';
    return path.join(this.root, 'images', 'compact', `${icon}.webp`);
  }
}

// ---------------------------------------------------------------- reviews

class ReviewStore {
  constructor(file) {
    this.file = file;
    this.data = null;
    this.queue = Promise.resolve();
  }

  async load() {
    if (this.data) return this.data;
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      this.data = {
        version: 1,
        items: parsed && typeof parsed.items === 'object' && parsed.items ? parsed.items : {},
      };
    } catch (error) {
      this.data = { version: 1, items: {} };
    }
    return this.data;
  }

  async snapshot() {
    const data = await this.load();
    return { items: { ...data.items } };
  }

  async upsert(key, patch) {
    const run = async () => {
      const data = await this.load();
      const prev = data.items[key] || { rating: null, comment: '', favorite: false };
      const next = {
        rating: patch.rating !== undefined ? patch.rating : prev.rating ?? null,
        comment: patch.comment !== undefined ? patch.comment : prev.comment ?? '',
        favorite: patch.favorite !== undefined ? patch.favorite : prev.favorite === true,
        updatedAt: nowStamp(),
      };
      if (!next.rating && !next.comment && !next.favorite) {
        delete data.items[key];
      } else {
        data.items[key] = next;
      }
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 0), 'utf8');
      await fs.rename(tmp, this.file);
      return { key, ...next };
    };
    this.queue = this.queue.then(run, run);
    return this.queue;
  }
}

function normalizeRating(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('评分必须是 1-5 的整数，或 null 表示清除');
  return n;
}

function normalizeComment(value) {
  if (value === undefined) return undefined;
  if (value === null) return '';
  const text = String(value).replace(/\r\n/g, '\n').trim();
  if (text.length > MAX_COMMENT_LENGTH) throw new Error(`评语最多 ${MAX_COMMENT_LENGTH} 字`);
  return text;
}

function normalizeFavorite(value) {
  if (value === undefined) return undefined;
  return value === true || value === 'true' || value === 1 || value === '1';
}

function reviewStats(reviews, catalog) {
  const items = reviews.items || {};
  const keys = Object.keys(items);
  let sum = 0;
  let rated = 0;
  let favorites = 0;
  for (const key of keys) {
    const item = items[key];
    if (item && Number.isInteger(item.rating)) {
      sum += item.rating;
      rated += 1;
    }
    if (item && item.favorite === true) favorites += 1;
  }
  const totalImages = catalog && catalog.counts ? catalog.counts.images : 0;
  return {
    reviews: keys.length,
    rated,
    favorites,
    average: rated ? Math.round((sum / rated) * 100) / 100 : 0,
    totalImages,
  };
}

// ---------------------------------------------------------------- routes

function createRoutes(catalogSource, store) {
  return [
    {
      kind: 'exact',
      path: `${API_PREFIX}/catalog`,
      handler: async (req, res) => {
        if (req.method !== 'GET') {
          sendError(res, 405, '只支持 GET');
          return;
        }
        try {
          const catalog = await catalogSource.load();
          if (!catalog) {
            sendError(res, 503, 'catalog-missing', {
              hint: '先运行 python D:\\deepseekHarness\\azur-skins\\fetch\\cli.py meta',
            });
            return;
          }
          const reviews = await store.snapshot();
          sendJson(res, 200, {
            ok: true,
            catalog,
            reviews,
            stats: { ...reviewStats(reviews, catalog), dataRoot: catalogSource.root },
          });
        } catch (error) {
          sendError(res, 500, error && error.message ? error.message : '读取 catalog 失败');
        }
      },
    },
    {
      kind: 'exact',
      path: `${API_PREFIX}/reviews`,
      handler: async (req, res) => {
        if (req.method !== 'GET') {
          sendError(res, 405, '只支持 GET');
          return;
        }
        try {
          const reviews = await store.snapshot();
          const catalog = await catalogSource.load();
          sendJson(res, 200, { ok: true, reviews, stats: reviewStats(reviews, catalog) });
        } catch (error) {
          sendError(res, 500, error && error.message ? error.message : '读取评语失败');
        }
      },
    },
    {
      kind: 'prefix',
      path: `${API_PREFIX}/img`,
      handler: async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          sendError(res, 405, '只支持 GET');
          return;
        }
        const rest = decodeURIComponent((req.url || '').split('?')[0].slice(IMG_PREFIX.length));
        const match = /^(thumb|full)\/([a-z0-9_-]+)\.webp$/i.exec(rest);
        if (!match) {
          sendError(res, 400, '图片路径不合法');
          return;
        }
        const size = match[1].toLowerCase();
        const icon = match[2];
        if (!ICON_RE.test(icon)) {
          sendError(res, 400, '图片名不合法');
          return;
        }
        const fallback = catalogSource.fallbackPath(size, icon);
        let file = catalogSource.imagePath(size, icon);
        let isFallback = false;
        try {
          await fs.stat(file);
        } catch (error) {
          file = '';
        }
        if (!file && fallback) {
          try {
            await fs.stat(fallback);
            file = fallback;
            isFallback = true;
          } catch (error) {
            file = '';
          }
        }
        if (!file) {
          sendError(res, 404, '没有这张图片', { icon, size });
          return;
        }
        try {
          const stat = await fs.stat(file);
          res.writeHead(200, {
            'content-type': MIME_WEBP,
            'content-length': stat.size,
            'cache-control': isFallback ? 'public, max-age=300' : 'public, max-age=31536000, immutable',
            etag: `"${Math.floor(stat.mtimeMs).toString(16)}-${stat.size}"`,
          });
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          const stream = createReadStream(file);
          stream.on('error', () => {
            try {
              res.destroy();
            } catch (error) {
              /* 连接可能已断开 */
            }
          });
          stream.pipe(res);
        } catch (error) {
          sendError(res, 404, '没有这张图片', { icon, size });
        }
      },
    },
    {
      kind: 'prefix',
      path: `${API_PREFIX}/reviews`,
      handler: async (req, res) => {
        if (req.method !== 'PUT' && req.method !== 'POST') {
          sendError(res, 405, '只支持 PUT');
          return;
        }
        if (!sameOrigin(req)) {
          sendError(res, 403, '请求来源不被允许');
          return;
        }
        const key = decodeURIComponent((req.url || '').split('?')[0].slice(REVIEWS_PREFIX.length));
        if (!ICON_RE.test(key)) {
          sendError(res, 400, '立绘 key 不合法');
          return;
        }
        try {
          const body = await readJsonBody(req);
          const patch = {
            rating: normalizeRating(body.rating),
            comment: normalizeComment(body.comment),
            favorite: normalizeFavorite(body.favorite),
          };
          const saved = await store.upsert(key, patch);
          const reviews = await store.snapshot();
          const catalog = await catalogSource.load();
          sendJson(res, 200, { ok: true, saved, stats: reviewStats(reviews, catalog) });
        } catch (error) {
          sendError(res, 400, error && error.message ? error.message : '保存评语失败');
        }
      },
    },
    {
      kind: 'exact',
      path: `${API_PREFIX}/stats`,
      handler: async (req, res) => {
        if (req.method !== 'GET') {
          sendError(res, 405, '只支持 GET');
          return;
        }
        try {
          const catalog = await catalogSource.load();
          const reviews = await store.snapshot();
          sendJson(res, 200, { ok: true, stats: reviewStats(reviews, catalog), catalog: catalog ? catalog.counts : null });
        } catch (error) {
          sendError(res, 500, error && error.message ? error.message : '读取统计失败');
        }
      },
    },
    {
      kind: 'exact',
      path: `${API_PREFIX}/export`,
      handler: async (req, res) => {
        if (req.method !== 'GET') {
          sendError(res, 405, '只支持 GET');
          return;
        }
        try {
          const catalog = await catalogSource.load();
          const reviews = await store.snapshot();
          const rows = [];
          if (catalog) {
            for (const ship of catalog.ships) {
              for (const image of ship.images) {
                const review = reviews.items[image.key];
                if (!review) continue;
                rows.push({
                  icon: image.key,
                  shipGid: ship.gid,
                  shipZh: ship.nameZh,
                  shipEn: ship.nameEn,
                  section: image.section,
                  skinId: image.skinId,
                  nameZh: image.nameZh,
                  nameEn: image.nameEn,
                  rating: review.rating ?? null,
                  comment: review.comment || '',
                  favorite: review.favorite === true,
                  updatedAt: review.updatedAt || '',
                });
              }
            }
          }
          sendJson(res, 200, { ok: true, exportedAt: nowStamp(), total: rows.length, rows });
        } catch (error) {
          sendError(res, 500, error && error.message ? error.message : '导出失败');
        }
      },
    },
  ];
}

// ---------------------------------------------------------------- tools

function buildToolRender(summary) {
  return [{ type: 'text', text: summary }];
}

function registerTools(ctx, catalogSource, store) {
  const disposers = [];
  const register = (definition) => disposers.push(ctx.tools.register(definition));

  register({
    name: 'azur_skins_status',
    description: '查看碧蓝航线图鉴的本地状态：立绘总数、已下载数、缺失数、已评分/已评语/收藏数量与均分。只读，不修改任何数据。',
    parameters: { type: 'object', additionalProperties: false, properties: {} },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          images: { type: 'integer' },
          ships: { type: 'integer' },
          skins: { type: 'integer' },
          downloaded: { type: 'integer' },
          missing: { type: 'integer' },
          reviewed: { type: 'integer' },
          rated: { type: 'integer' },
          favorites: { type: 'integer' },
          average: { type: 'number' },
          dataRoot: { type: 'string' },
        },
        required: ['images', 'ships', 'skins', 'downloaded', 'missing', 'reviewed', 'rated', 'favorites', 'average', 'dataRoot'],
      },
      render: (_args, value) =>
        buildToolRender(
          `立绘 ${value.downloaded}/${value.images} 已下载（缺失 ${value.missing}），${value.ships} 艘船 / ${value.skins} 个皮肤；已评 ${value.rated} 张、收藏 ${value.favorites} 张，均分 ${value.average}；数据目录 ${value.dataRoot}`,
        ),
    },
    async execute() {
      const catalog = await catalogSource.load();
      if (!catalog) throw new Error('catalog 不存在：先运行 python azur-skins\\fetch\\cli.py meta');
      const reviews = await store.snapshot();
      const stats = reviewStats(reviews, catalog);
      let downloaded = 0;
      let missing = 0;
      try {
        const state = JSON.parse(await fs.readFile(path.join(catalogSource.root, 'data', 'download.json'), 'utf8'));
        for (const item of Object.values(state)) {
          if (item && (item.status === 'ok' || item.status === 'cached' || item.status === 'compact')) downloaded += 1;
          else missing += 1;
        }
      } catch (error) {
        downloaded = 0;
        missing = catalog.counts.images;
      }
      return {
        images: catalog.counts.images,
        ships: catalog.counts.ships,
        skins: catalog.counts.skins,
        downloaded,
        missing,
        reviewed: stats.reviews,
        rated: stats.rated,
        favorites: stats.favorites,
        average: stats.average,
        dataRoot: catalogSource.root,
      };
    },
  });

  register({
    name: 'azur_skins_reviews',
    description: '列出本地的立绘评分、评语与收藏（可按最低星级过滤、只看收藏、按舰船名/皮肤名关键词搜索）。用于回顾打过分的立绘或导出清单。只读。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        minRating: { type: 'integer', minimum: 1, maximum: 5, description: '只看评分不低于该星级的立绘。' },
        query: { type: 'string', description: '关键词：匹配舰船中文名/英文名、皮肤中文名/英文名、icon。' },
        onlyWithComment: { type: 'boolean', description: '只看写了评语的。' },
        onlyFavorites: { type: 'boolean', description: '只看已收藏的立绘。' },
        limit: { type: 'integer', minimum: 1, maximum: 300, description: '最多返回多少条，默认 50。' },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          total: { type: 'integer' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                icon: { type: 'string' },
                shipZh: { type: 'string' },
                nameZh: { type: 'string' },
                section: { type: 'string' },
                rating: { type: 'integer', description: '1-5 星；0 表示只写了评语、没有评分。' },
                comment: { type: 'string' },
                favorite: { type: 'boolean' },
                updatedAt: { type: 'string' },
              },
              required: ['icon', 'shipZh', 'nameZh', 'section', 'rating', 'comment', 'favorite', 'updatedAt'],
            },
          },
        },
        required: ['total', 'items'],
      },
      render: (_args, value) => {
        if (value.total === 0) return buildToolRender('没有符合条件的评分记录。');
        const lines = [`共 ${value.total} 条（显示 ${value.items.length} 条）：`];
        for (const item of value.items) {
          const stars = item.rating ? '★'.repeat(item.rating) : '未评分';
          const comment = item.comment ? ` · ${item.comment}` : '';
          const heart = item.favorite ? ' ♥' : '';
          lines.push(`- ${stars} ${item.shipZh} / ${item.nameZh}${heart}${comment}`);
        }
        return buildToolRender(lines.join('\n'));
      },
    },
    async execute(args) {
      const catalog = await catalogSource.load();
      if (!catalog) throw new Error('catalog 不存在：先运行 python azur-skins\\fetch\\cli.py meta');
      const source = args && typeof args === 'object' ? args : {};
      const reviews = (await store.snapshot()).items;
      const minRating = Number.isInteger(source.minRating) ? source.minRating : 0;
      const query = typeof source.query === 'string' ? source.query.trim().toLowerCase() : '';
      const limit = Number.isInteger(source.limit) ? Math.max(1, Math.min(300, source.limit)) : 50;
      const rows = [];
      for (const ship of catalog.ships) {
        for (const image of ship.images) {
          const review = reviews[image.key];
          if (!review) continue;
          if (minRating && (!review.rating || review.rating < minRating)) continue;
          if (source.onlyWithComment === true && !review.comment) continue;
          if (source.onlyFavorites === true && review.favorite !== true) continue;
          if (query) {
            const haystack = [
              ship.nameZh, ship.nameEn, image.nameZh, image.nameEn, image.key, review.comment || '',
            ].join(' ').toLowerCase();
            if (!haystack.includes(query)) continue;
          }
          rows.push({
            icon: image.key,
            shipZh: ship.nameZh,
            nameZh: image.nameZh,
            section: image.section,
            rating: review.rating ?? 0,
            comment: review.comment || '',
            favorite: review.favorite === true,
            updatedAt: review.updatedAt || '',
          });
        }
      }
      rows.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return { total: rows.length, items: rows.slice(0, limit) };
    },
  });

  return disposers;
}

export function apply(ctx) {
  const root = resolveDataRoot();
  const catalogSource = new CatalogSource(root);
  const store = new ReviewStore(path.join(root, 'data', 'reviews.json'));

  ctx.effect(() => {
    const disposers = createRoutes(catalogSource, store).map((route) => ctx.webServer.register(route));
    return () => {
      disposers.reverse().forEach((dispose) => {
        try {
          dispose();
        } catch (error) {
          /* 卸载时忽略单个路由的注销失败 */
        }
      });
    };
  }, 'azur-skins: http routes');

  ctx.effect(() => {
    const disposers = registerTools(ctx, catalogSource, store);
    return () => {
      disposers.reverse().forEach((dispose) => {
        try {
          dispose();
        } catch (error) {
          /* 卸载时忽略单个工具的注销失败 */
        }
      });
    };
  }, 'azur-skins: tools');
}
