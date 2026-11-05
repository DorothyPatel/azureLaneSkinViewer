window.__ModuleLoader__.load({
  id: '@local/azur-skins',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'azur-skins';
    const API = '/azur-skins/api';

    const SECTION_ORDER = ['base', 'retrofit', 'oath', 'skin'];

    const EN = {
      panel: 'Azur Lane Gallery',
      title: 'Azur Lane Gallery',
      subtitle: 'Browse every ship illustration and skin CG, rate them, and keep your own reviews.',
      'mode.ships': 'By ship',
      'mode.all': 'All illustrations',
      'mode.favorites': 'Favorites',
      'favorite.add': 'Add to favorites',
      'favorite.remove': 'Remove from favorites',
      'favorite.badge': 'Favorite',
      'toast.saved': 'Saved',
      'toast.favorited': 'Added to favorites',
      'toast.unfavorited': 'Removed from favorites',
      'filter.search': 'Search name',
      'filter.searchPlaceholder': 'Ship, skin, class…',
      'filter.hull': 'Hull',
      'filter.nation': 'Faction',
      'filter.rarity': 'Rarity',
      'filter.clear': 'Clear',
      'filter.section': 'Category',
      'filter.sectionAll': 'All',
      'filter.shipCount': '{count} ships',
      'filter.imageCount': '{count} illustrations',
      'flag.all': 'All',
      'flag.l2d': 'L2D',
      'flag.dynamic': 'Dynamic',
      'flag.reviewed': 'Reviewed',
      'flag.unreviewed': 'Not reviewed',
      'sort.default': 'Default order',
      'sort.rating': 'Top rated',
      'sort.recent': 'Recently reviewed',
      'sort.name': 'Name',
      'stats.images': 'Illustrations',
      'stats.favorites': 'Favorites',
      'stats.downloaded': 'Downloaded',
      'stats.reviewed': 'Reviewed',
      'stats.average': 'Average',
      'empty.ships': 'No ship matches these filters.',
      'empty.images': 'No illustration matches these filters.',
      'empty.favorites': 'You have not favorited any illustration yet.',
      'empty.favoritesHint': 'Tap ♥ on any card or the large view to add one.',
      'empty.catalog': 'Catalog not found',
      'empty.catalogHint': 'Run the fetcher first: python azur-skins\\fetch\\cli.py meta',
      'state.loading': 'Loading…',
      'state.error': 'Something went wrong',
      'state.reload': 'Reload',
      'state.retry': 'Retry',
      'state.more': 'Load more',
      'state.remain': '{count} remaining',
      'ship.skins': '{count} skins',
      'ship.images': '{count} illustrations',
      'ship.class': 'Class {name}',
      'card.rate': 'Rate',
      'card.review': 'Review',
      'card.noComment': 'No review yet',
      'card.missing': 'Image missing',
      'lightbox.title': 'Illustration',
      'lightbox.rating': 'Rating',
      'lightbox.comment': 'Review',
      'lightbox.commentPlaceholder': 'What do you think of this illustration?',
      'lightbox.save': 'Save',
      'lightbox.saving': 'Saving…',
      'lightbox.saved': 'Saved',
      'lightbox.clear': 'Clear rating',
      'lightbox.close': 'Close',
      'lightbox.escHint': 'Press Esc or click outside to close',
      'lightbox.open': 'Open full size',
      'lightbox.clearReview': 'Delete review',
      'error.save': 'Save failed: {message}',
      'crash.title': 'This page crashed',
      'crash.hint': 'Reload the page to try again.',
      'crash.reload': 'Reload',
      'meta.l2d': 'L2D',
      'meta.dynamic': 'Dynamic',
      'meta.dynamicBg': 'Dynamic BG',
      'meta.alt': 'Alt form',
      'meta.dual': 'Dual form',
      'meta.autoName': 'Translated',
      'meta.price': '{currency} {price}',
      'meta.free': 'Free',
    };

    const ZH = {
      panel: '碧蓝航线立绘',
      title: '碧蓝航线立绘',
      subtitle: '浏览全部舰船立绘与皮肤立绘，打分、写评语，全部存在本地。',
      'mode.ships': '按舰船',
      'mode.all': '全部立绘',
      'mode.favorites': '收藏',
      'favorite.add': '收藏',
      'favorite.remove': '取消收藏',
      'favorite.badge': '收藏',
      'toast.saved': '已保存',
      'toast.favorited': '已收藏',
      'toast.unfavorited': '已取消收藏',
      'filter.search': '搜索名字',
      'filter.searchPlaceholder': '舰船名、皮肤名、舰级…',
      'filter.hull': '舰种',
      'filter.nation': '阵营',
      'filter.rarity': '稀有度',
      'filter.clear': '清空',
      'filter.section': '分类',
      'filter.sectionAll': '全部',
      'filter.shipCount': '{count} 艘',
      'filter.imageCount': '{count} 张',
      'flag.all': '全部',
      'flag.l2d': 'L2D',
      'flag.dynamic': '动态',
      'flag.reviewed': '已评',
      'flag.unreviewed': '未评',
      'sort.default': '默认顺序',
      'sort.rating': '评分最高',
      'sort.recent': '最近评价',
      'sort.name': '名称',
      'stats.images': '立绘总数',
      'stats.favorites': '收藏',
      'stats.downloaded': '已下载',
      'stats.reviewed': '已评',
      'stats.average': '平均分',
      'empty.ships': '没有符合筛选条件的舰船。',
      'empty.images': '没有符合筛选条件的立绘。',
      'empty.favorites': '还没有收藏任何立绘。',
      'empty.favoritesHint': '在任意卡片或大图上点一下 ♥ 就能收藏。',
      'empty.catalog': '还没生成本地图鉴数据',
      'empty.catalogHint': '先运行抓取：python azur-skins\\fetch\\cli.py meta',
      'state.loading': '加载中…',
      'state.error': '出错了',
      'state.reload': '重新加载',
      'state.retry': '重试',
      'state.more': '显示更多',
      'state.remain': '还有 {count} 张',
      'ship.skins': '{count} 个皮肤',
      'ship.images': '{count} 张立绘',
      'ship.class': '舰级 {name}',
      'card.rate': '评分',
      'card.review': '评语',
      'card.noComment': '还没写评语',
      'card.missing': '图片缺失',
      'lightbox.title': '立绘',
      'lightbox.rating': '评分',
      'lightbox.comment': '评语',
      'lightbox.commentPlaceholder': '这张立绘怎么样？',
      'lightbox.save': '保存',
      'lightbox.saving': '保存中…',
      'lightbox.saved': '已保存',
      'lightbox.clear': '清除评分',
      'lightbox.close': '关闭',
      'lightbox.escHint': '按 Esc 或点空白处关闭',
      'lightbox.open': '原图',
      'lightbox.clearReview': '删除评语',
      'error.save': '保存失败：{message}',
      'crash.title': '页面崩溃了',
      'crash.hint': '刷新页面重试。',
      'crash.reload': '刷新',
      'meta.l2d': 'L2D',
      'meta.dynamic': '动态',
      'meta.dynamicBg': '动态背景',
      'meta.alt': '差分',
      'meta.dual': '双形态',
      'meta.autoName': '译名',
      'meta.price': '{currency} {price}',
      'meta.free': '免费',
    };

    const RARITY_COLOR = {
      2: '#8d99ae',
      3: '#4f8ef7',
      4: '#9b6cf2',
      5: '#e0a53b',
      6: '#d8543f',
    };

    async function apiGet(pathname) {
      const response = await fetch(`${API}${pathname}`, { headers: { accept: 'application/json' } });
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (error) {
        throw new Error(`本地服务返回了无法解析的内容（HTTP ${response.status}）`);
      }
      if (!response.ok || !data || data.ok === false) {
        const message = data && data.error ? data.error : `HTTP ${response.status}`;
        const error = new Error(message);
        error.payload = data;
        throw error;
      }
      return data;
    }

    async function apiPut(pathname, body) {
      const response = await fetch(`${API}${pathname}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (error) {
        throw new Error(`本地服务返回了无法解析的内容（HTTP ${response.status}）`);
      }
      if (!response.ok || !data || data.ok === false) {
        throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
      }
      return data;
    }

    function imageUrl(size, key) {
      return `${API}/img/${size}/${key}.webp`;
    }

    // 缩略图还没生成（下载仍在进行）时退回到原图；原图也缺就把它藏起来，露出占位格。
    function fallbackImage(event) {
      const img = event.currentTarget;
      if (img.dataset.fallback !== 'full') {
        img.dataset.fallback = 'full';
        img.src = img.src.replace('/img/thumb/', '/img/full/');
        return;
      }
      img.style.visibility = 'hidden';
    }

    function toggleInList(list, value) {
      return list.includes(value) ? list.filter((item) => item !== value) : list.concat([value]);
    }

    function formatPrice(image, t) {
      if (image.price === undefined || image.price === null || image.price === 0) return t('meta.free');
      const currency = image.currency || '¥';
      return t('meta.price', { currency, price: String(image.price) });
    }

    function StarRating(props) {
      const value = props.value || 0;
      return h(
        'div',
        { className: `az-stars${props.small ? ' az-stars-sm' : ''}` },
        [1, 2, 3, 4, 5].map((star) =>
          h(
            'button',
            {
              key: star,
              type: 'button',
              title: `${star}★`,
              className: `az-star${star <= value ? ' is-on' : ''}`,
              onClick: (event) => {
                if (event) event.stopPropagation();
                if (props.onChange) props.onChange(value === star ? null : star);
              },
            },
            '★',
          ),
        ),
      );
    }

    function Chip(props) {
      return h(
        'button',
        {
          type: 'button',
          className: `az-chip${props.active ? ' is-active' : ''}`,
          onClick: props.onClick,
          title: props.title || props.label,
        },
        props.label,
      );
    }

    function badge(text, cls) {
      return h('span', { className: `az-badge${cls ? ` ${cls}` : ''}` }, text);
    }

    function PageCrash(props) {
      return h(
        'div',
        { className: 'az-root' },
        h('style', null, cssText()),
        h(
          'div',
          { className: 'az-crash' },
          h('div', { className: 'az-crash-title' }, props.title),
          h('div', { className: 'az-crash-hint' }, props.hint),
          h('pre', null, String(props.error && (props.error.stack || props.error.message || props.error))),
          h(
            'div',
            { className: 'az-crash-actions' },
            h('button', { className: 'az-btn az-btn-primary', type: 'button', onClick: () => window.location.reload() }, props.reload),
          ),
        ),
      );
    }

    function EmptyState(props) {
      return h(
        'div',
        { className: 'az-empty' },
        h('div', { className: 'az-empty-title' }, props.title),
        props.hint ? h('div', { className: 'az-empty-hint' }, props.hint) : null,
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'azur-skins: dictionaries');
        const t = ctx.locale.bind(NS);

        const Boundary = React.Component
          ? class extends React.Component {
              constructor(props) {
                super(props);
                this.state = { error: null };
              }

              static getDerivedStateFromError(error) {
                return { error };
              }

              componentDidCatch(error, info) {
                if (typeof console !== 'undefined' && typeof console.error === 'function') {
                  console.error('azur-skins: page render failed', error, info);
                }
              }

              render() {
                if (this.state.error) {
                  return h(PageCrash, {
                    error: this.state.error,
                    title: t('crash.title'),
                    hint: t('crash.hint'),
                    reload: t('crash.reload'),
                  });
                }
                return this.props.children;
              }
            }
          : null;

        function PanelIcon() {
          return h(
            'svg',
            { viewBox: '0 0 64 64', width: 22, height: 22, 'aria-hidden': 'true' },
            h('path', { d: 'M32 8l7 9 8 1.5-3.5 8 3.5 8-8 1.5-7 9-7-9-8-1.5 3.5-8L17 18.5l8-1.5z', fill: '#7aa7ff', opacity: 0.9 }),
            h('path', { d: 'M14 50h36', stroke: '#7aa7ff', 'stroke-width': 3, 'stroke-linecap': 'round' }),
            h('path', { d: 'M22 58h20', stroke: '#7aa7ff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.6 }),
          );
        }

        function AzurPanel() {
          if (!Boundary) return h(AzurPage);
          return h(Boundary, null, h(AzurPage));
        }

        function AzurPage() {
          const [, setLocaleRevision] = React.useState(0);
          React.useEffect(() => {
            if (!ctx.locale || typeof ctx.locale.subscribe !== 'function') return undefined;
            return ctx.locale.subscribe(() => setLocaleRevision((value) => value + 1));
          }, []);

          const [catalog, setCatalog] = React.useState(null);
          const [reviews, setReviews] = React.useState({});
          const [stats, setStats] = React.useState(null);
          const [status, setStatus] = React.useState('loading');
          const [statusText, setStatusText] = React.useState('');
          const [statusHint, setStatusHint] = React.useState('');
          const [mode, setMode] = React.useState('ships');
          const [query, setQuery] = React.useState('');
          const [hulls, setHulls] = React.useState([]);
          const [nations, setNations] = React.useState([]);
          const [rarities, setRarities] = React.useState([]);
          const [section, setSection] = React.useState('all');
          const [flag, setFlag] = React.useState('all');
          const [sort, setSort] = React.useState('default');
          const [selectedGid, setSelectedGid] = React.useState('');
          const [openKey, setOpenKey] = React.useState('');
          const [limit, setLimit] = React.useState(120);
          const [notice, setNotice] = React.useState('');
          const [savingKey, setSavingKey] = React.useState('');

          const load = React.useCallback(async () => {
            setStatus('loading');
            setStatusText('');
            setStatusHint('');
            try {
              const data = await apiGet('/catalog');
              setCatalog(data.catalog);
              setReviews(data.reviews && data.reviews.items ? data.reviews.items : {});
              setStats(data.stats || null);
              setStatus('ready');
            } catch (error) {
              const payload = error && error.payload;
              if (payload && payload.error === 'catalog-missing') {
                setStatus('empty');
                setStatusHint(payload.hint || '');
              } else {
                setStatus('error');
                setStatusText(error && error.message ? error.message : String(error));
              }
            }
          }, []);

          React.useEffect(() => {
            load();
          }, [load]);

          React.useEffect(() => {
            if (!notice) return undefined;
            const timer = setTimeout(() => setNotice(''), 2600);
            return () => clearTimeout(timer);
          }, [notice]);

          const labels = catalog && catalog.labels ? catalog.labels : {};

          const allShips = React.useMemo(() => (catalog && Array.isArray(catalog.ships) ? catalog.ships : []), [catalog]);

          const filteredShips = React.useMemo(() => {
            const keyword = query.trim().toLowerCase();
            return allShips.filter((ship) => {
              if (hulls.length && !hulls.includes(ship.hull)) return false;
              if (nations.length && !nations.includes(ship.nation)) return false;
              if (rarities.length && !rarities.includes(ship.rarity)) return false;
              if (!keyword) return true;
              const haystack = [
                ship.nameZh,
                ship.nameEn,
                ship.class,
                ...(Array.isArray(ship.aliases) ? ship.aliases : []),
                ...(Array.isArray(ship.tags) ? ship.tags : []),
              ]
                .join(' ')
                .toLowerCase();
              return haystack.includes(keyword);
            });
          }, [allShips, hulls, nations, rarities, query]);

          React.useEffect(() => {
            if (mode !== 'ships') return;
            if (filteredShips.length === 0) return;
            if (!filteredShips.some((ship) => String(ship.gid) === String(selectedGid))) {
              setSelectedGid(String(filteredShips[0].gid));
            }
          }, [filteredShips, mode, selectedGid]);

          React.useEffect(() => {
            setLimit(120);
          }, [mode, section, flag, sort, query, hulls, nations, rarities, selectedGid]);

          const hullOptions = React.useMemo(() => {
            const map = new Map();
            for (const ship of allShips) {
              const count = map.get(ship.hull) || 0;
              map.set(ship.hull, count + 1);
            }
            return Array.from(map.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([value, count]) => ({ value, count, label: (labels.hull && labels.hull[String(value)]) || `#${value}` }));
          }, [allShips, labels]);

          const nationOptions = React.useMemo(() => {
            const map = new Map();
            for (const ship of allShips) {
              const count = map.get(ship.nation) || 0;
              map.set(ship.nation, count + 1);
            }
            return Array.from(map.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([value, count]) => ({ value, count, label: (labels.nation && labels.nation[String(value)]) || `#${value}` }));
          }, [allShips, labels]);

          const rarityOptions = React.useMemo(() => {
            const map = new Map();
            for (const ship of allShips) {
              const count = map.get(ship.rarity) || 0;
              map.set(ship.rarity, count + 1);
            }
            return Array.from(map.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([value, count]) => ({ value, count, label: (labels.rarity && labels.rarity[String(value)]) || `#${value}` }));
          }, [allShips, labels]);

          const selectedShip = React.useMemo(() => {
            if (mode !== 'ships') return null;
            return filteredShips.find((ship) => String(ship.gid) === String(selectedGid)) || null;
          }, [filteredShips, mode, selectedGid]);

          const flatItems = React.useMemo(() => {
            if (mode === 'ships') return [];
            const items = [];
            for (const ship of filteredShips) {
              for (const image of ship.images || []) {
                if (mode === 'favorites' && !(reviews[image.key] && reviews[image.key].favorite)) continue;
                if (section !== 'all' && image.section !== section) continue;
                if (flag === 'l2d' && !image.l2d) continue;
                if (flag === 'dynamic' && !image.dynamic) continue;
                const review = reviews[image.key];
                if (flag === 'reviewed' && !review) continue;
                if (flag === 'unreviewed' && review) continue;
                items.push({ ship, image });
              }
            }
            if (sort === 'rating') {
              items.sort((a, b) => (reviews[b.image.key]?.rating || 0) - (reviews[a.image.key]?.rating || 0));
            } else if (sort === 'recent') {
              items.sort((a, b) => String(reviews[b.image.key]?.updatedAt || '').localeCompare(String(reviews[a.image.key]?.updatedAt || '')));
            } else if (sort === 'name') {
              items.sort((a, b) =>
                String(a.image.nameZh || a.image.nameEn || a.image.key).localeCompare(
                  String(b.image.nameZh || b.image.nameEn || b.image.key),
                  'zh-Hans-CN',
                ),
              );
            }
            return items;
          }, [mode, filteredShips, section, flag, reviews, sort]);

          const saveReview = React.useCallback(async (key, patch, noticeText) => {
            setSavingKey(key);
            try {
              const data = await apiPut(`/reviews/${encodeURIComponent(key)}`, patch);
              setReviews((prev) => {
                const next = { ...prev };
                const saved = data.saved || {};
                if (!saved.rating && !saved.comment && !saved.favorite) delete next[key];
                else {
                  next[key] = {
                    rating: saved.rating ?? null,
                    comment: saved.comment || '',
                    favorite: saved.favorite === true,
                    updatedAt: saved.updatedAt || '',
                  };
                }
                return next;
              });
              if (data.stats) setStats((prev) => (prev ? { ...prev, ...data.stats } : data.stats));
              setNotice(noticeText || t('toast.saved'));
              return true;
            } catch (error) {
              setNotice(t('error.save', { message: error && error.message ? error.message : String(error) }));
              return false;
            } finally {
              setSavingKey('');
            }
          }, [t]);

          const toggleFavorite = React.useCallback((key, nextFavorite) => {
            return saveReview(key, { favorite: nextFavorite }, t(nextFavorite ? 'toast.favorited' : 'toast.unfavorited'));
          }, [saveReview, t]);

          const openItem = React.useMemo(() => {
            if (!openKey) return null;
            for (const ship of allShips) {
              for (const image of ship.images || []) {
                if (image.key === openKey) return { ship, image };
              }
            }
            return null;
          }, [allShips, openKey]);

          React.useEffect(() => {
            if (!openKey) return undefined;
            const handler = (event) => {
              if (event.key === 'Escape') setOpenKey('');
            };
            window.addEventListener('keydown', handler);
            return () => window.removeEventListener('keydown', handler);
          }, [openKey]);

          function renderCard(ship, image, options) {
            const review = reviews[image.key];
            const compact = options && options.compact;
            return h(
              'article',
              {
                key: image.key,
                className: `az-card${compact ? ' az-card-sm' : ''}`,
                onClick: () => setOpenKey(image.key),
                role: 'button',
                tabIndex: 0,
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setOpenKey(image.key);
                  }
                },
              },
              h(
                'div',
                { className: 'az-thumb' },
                h('img', {
                  src: imageUrl('thumb', image.key),
                  alt: image.nameZh || image.nameEn || image.key,
                  loading: 'lazy',
                  decoding: 'async',
                  onError: fallbackImage,
                }),
                h(
                  'button',
                  {
                    type: 'button',
                    className: `az-fav${review && review.favorite ? ' is-on' : ''}`,
                    title: t(review && review.favorite ? 'favorite.remove' : 'favorite.add'),
                    'aria-label': t(review && review.favorite ? 'favorite.remove' : 'favorite.add'),
                    'aria-pressed': review && review.favorite ? 'true' : 'false',
                    onClick: (event) => {
                      event.stopPropagation();
                      toggleFavorite(image.key, !(review && review.favorite));
                    },
                    onKeyDown: (event) => event.stopPropagation(),
                  },
                  review && review.favorite ? '♥' : '♡',
                ),
              ),
              h(
                'div',
                { className: 'az-card-body' },
                h('div', { className: 'az-card-title' }, image.nameZh || image.nameEn || image.key),
                image.nameEn ? h('div', { className: 'az-card-sub' }, image.nameEn) : null,
                h(
                  'div',
                  { className: 'az-card-badges' },
                  image.l2d ? badge(t('meta.l2d'), 'az-badge-blue') : null,
                  image.dynamic ? badge(t('meta.dynamic'), 'az-badge-teal') : null,
                  image.dynamicBg ? badge(t('meta.dynamicBg'), 'az-badge-teal') : null,
                  image.dualForm ? badge(t('meta.dual'), 'az-badge-teal') : null,
                  image.hasAlt ? badge(t('meta.alt')) : null,
                  image.section === 'skin' && image.category !== null && image.category !== undefined
                    && labels.skinCategory && labels.skinCategory[String(image.category)]
                    ? badge(labels.skinCategory[String(image.category)])
                    : null,
                  image.price ? badge(formatPrice(image, t)) : null,
                  image.zhSource === 'auto' ? badge(t('meta.autoName'), 'az-badge-warn') : null,
                ),
                h(
                  'div',
                  { className: 'az-card-stars' },
                  h(StarRating, {
                    value: review && review.rating ? review.rating : null,
                    small: true,
                    onChange: (value) => saveReview(image.key, { rating: value }),
                  }),
                  review && review.comment ? h('span', { className: 'az-card-comment' }, review.comment) : null,
                ),
                compact ? h('div', { className: 'az-card-ship' }, ship.nameZh) : null,
              ),
            );
          }

          function renderSection(ship, sectionName, items) {
            if (!items.length) return null;
            const title = (labels.section && labels.section[sectionName]) || sectionName;
            return h(
              'section',
              { className: 'az-section', key: sectionName },
              h('div', { className: 'az-section-head' }, h('h3', null, title), h('span', { className: 'az-section-count' }, `${items.length}`)),
              h('div', { className: 'az-grid' }, items.map((image) => renderCard(ship, image))),
            );
          }

          function renderShipDetail() {
            if (!selectedShip) {
              return h(EmptyState, { title: t('empty.ships'), hint: t('filter.nation') });
            }
            const ship = selectedShip;
            const images = ship.images || [];
            const grouped = { base: [], retrofit: [], oath: [], skin: [] };
            for (const image of images) {
              (grouped[image.section] || grouped.skin).push(image);
            }
            const ratingCount = images.filter((image) => reviews[image.key] && reviews[image.key].rating).length;
            return h(
              'div',
              { className: 'az-detail' },
              h(
                'header',
                { className: 'az-ship-head' },
                h('div', { className: 'az-ship-titles' }, h('h2', null, ship.nameZh || ship.nameEn || ship.gid), ship.nameEn ? h('div', { className: 'az-ship-en' }, ship.nameEn) : null),
                h(
                  'div',
                  { className: 'az-ship-meta' },
                  h('span', { className: 'az-dot', style: { background: RARITY_COLOR[ship.rarity] || '#8d99ae' } }),
                  h('span', null, (labels.rarity && labels.rarity[String(ship.rarity)]) || `#${ship.rarity}`),
                  h('span', { className: 'az-sep' }, '·'),
                  h('span', null, (labels.hull && labels.hull[String(ship.hull)]) || `#${ship.hull}`),
                  h('span', { className: 'az-sep' }, '·'),
                  h('span', null, (labels.nation && labels.nation[String(ship.nation)]) || `#${ship.nation}`),
                  ship.class ? h('span', { className: 'az-sep' }, '·') : null,
                  ship.class ? h('span', null, t('ship.class', { name: ship.class })) : null,
                  ship.zhSource === 'auto' ? badge(t('meta.autoName'), 'az-badge-warn') : null,
                ),
                h(
                  'div',
                  { className: 'az-ship-stats' },
                  h('span', null, t('ship.images', { count: String(images.length) })),
                  h('span', null, t('ship.skins', { count: String(Math.max(0, images.length - 1)) })),
                  ratingCount ? h('span', null, `★ ${ratingCount}`) : null,
                ),
              ),
              h(
                'div',
                { className: 'az-sections' },
                SECTION_ORDER.map((name) => renderSection(ship, name, grouped[name] || [])),
              ),
            );
          }

          function renderAllMode() {
            const shown = flatItems.slice(0, limit);
            const favoritesMode = mode === 'favorites';
            return h(
              'div',
              { className: 'az-detail' },
              h(
                'div',
                { className: 'az-detail-head' },
                h('h2', null, favoritesMode ? t('mode.favorites') : t('mode.all')),
                h('span', { className: 'az-detail-count' }, t('filter.imageCount', { count: String(flatItems.length) })),
                favoritesMode && stats && stats.favorites !== undefined
                  ? h('span', { className: 'az-detail-hint' }, `♥ ${stats.favorites}`)
                  : null,
              ),
              h(
                'div',
                { className: 'az-toolbar' },
                h(
                  'div',
                  { className: 'az-toolbar-group' },
                  h('span', { className: 'az-toolbar-label' }, t('filter.section')),
                  h(Chip, { label: t('filter.sectionAll'), active: section === 'all', onClick: () => setSection('all') }),
                  SECTION_ORDER.map((name) =>
                    h(Chip, {
                      key: name,
                      label: (labels.section && labels.section[name]) || name,
                      active: section === name,
                      onClick: () => setSection(name),
                    }),
                  ),
                ),
                h(
                  'div',
                  { className: 'az-toolbar-group' },
                  h(Chip, { label: t('flag.all'), active: flag === 'all', onClick: () => setFlag('all') }),
                  h(Chip, { label: t('flag.l2d'), active: flag === 'l2d', onClick: () => setFlag('l2d') }),
                  h(Chip, { label: t('flag.dynamic'), active: flag === 'dynamic', onClick: () => setFlag('dynamic') }),
                  h(Chip, { label: t('flag.reviewed'), active: flag === 'reviewed', onClick: () => setFlag('reviewed') }),
                  h(Chip, { label: t('flag.unreviewed'), active: flag === 'unreviewed', onClick: () => setFlag('unreviewed') }),
                ),
                h(
                  'div',
                  { className: 'az-toolbar-group' },
                  h(
                    'select',
                    { className: 'az-select', value: sort, onChange: (event) => setSort(event.target.value) },
                    h('option', { value: 'default' }, t('sort.default')),
                    h('option', { value: 'rating' }, t('sort.rating')),
                    h('option', { value: 'recent' }, t('sort.recent')),
                    h('option', { value: 'name' }, t('sort.name')),
                  ),
                ),
              ),
              flatItems.length === 0
                ? h(EmptyState, {
                    title: favoritesMode ? t('empty.favorites') : t('empty.images'),
                    hint: favoritesMode ? t('empty.favoritesHint') : '',
                  })
                : h(
                    'div',
                    { className: 'az-grid az-grid-wide' },
                    shown.map((item) => renderCard(item.ship, item.image, { compact: true })),
                  ),
              flatItems.length > shown.length
                ? h(
                    'div',
                    { className: 'az-more' },
                    h(
                      'button',
                      { type: 'button', className: 'az-btn', onClick: () => setLimit((value) => value + 120) },
                      `${t('state.more')} · ${t('state.remain', { count: String(flatItems.length - shown.length) })}`,
                    ),
                  )
                : null,
            );
          }

          function renderLightbox() {
            if (!openItem) return null;
            const { ship, image } = openItem;
            return h(Lightbox, {
              t,
              ship,
              image,
              review: reviews[image.key],
              labels,
              saving: savingKey === image.key,
              onClose: () => setOpenKey(''),
              onSave: (patch) => saveReview(image.key, patch),
              onToggleFavorite: (nextFavorite) => toggleFavorite(image.key, nextFavorite),
            });
          }

          function renderSidebar() {
            return h(
              'aside',
              { className: 'az-side' },
              h(
                'div',
                { className: 'az-side-block' },
                h('input', {
                  className: 'az-input',
                  type: 'search',
                  placeholder: t('filter.searchPlaceholder'),
                  value: query,
                  onChange: (event) => setQuery(event.target.value),
                }),
              ),
              h(
                'div',
                { className: 'az-side-block' },
                h('div', { className: 'az-mode' },
                  h('button', { type: 'button', className: `az-tab${mode === 'ships' ? ' is-active' : ''}`, onClick: () => setMode('ships') }, t('mode.ships')),
                  h('button', { type: 'button', className: `az-tab${mode === 'all' ? ' is-active' : ''}`, onClick: () => setMode('all') }, t('mode.all')),
                  h('button', { type: 'button', className: `az-tab${mode === 'favorites' ? ' is-active' : ''}`, onClick: () => setMode('favorites') }, t('mode.favorites')),
                ),
              ),
              h(
                'div',
                { className: 'az-side-block' },
                h('div', { className: 'az-filter-head' }, h('span', null, t('filter.hull')), hulls.length ? h('button', { type: 'button', className: 'az-link', onClick: () => setHulls([]) }, t('filter.clear')) : null),
                h('div', { className: 'az-chips' }, hullOptions.map((option) => h(Chip, {
                  key: option.value,
                  label: `${option.label} ${option.count}`,
                  active: hulls.includes(option.value),
                  onClick: () => setHulls((prev) => toggleInList(prev, option.value)),
                }))),
              ),
              h(
                'div',
                { className: 'az-side-block' },
                h('div', { className: 'az-filter-head' }, h('span', null, t('filter.rarity')), rarities.length ? h('button', { type: 'button', className: 'az-link', onClick: () => setRarities([]) }, t('filter.clear')) : null),
                h('div', { className: 'az-chips' }, rarityOptions.map((option) => h(Chip, {
                  key: option.value,
                  label: `${option.label} ${option.count}`,
                  active: rarities.includes(option.value),
                  onClick: () => setRarities((prev) => toggleInList(prev, option.value)),
                }))),
              ),
              h(
                'div',
                { className: 'az-side-block az-side-nations' },
                h('div', { className: 'az-filter-head' }, h('span', null, t('filter.nation')), nations.length ? h('button', { type: 'button', className: 'az-link', onClick: () => setNations([]) }, t('filter.clear')) : null),
                h('div', { className: 'az-chips' }, nationOptions.map((option) => h(Chip, {
                  key: option.value,
                  label: `${option.label} ${option.count}`,
                  active: nations.includes(option.value),
                  onClick: () => setNations((prev) => toggleInList(prev, option.value)),
                }))),
              ),
              mode === 'ships'
                ? h(
                    'div',
                    { className: 'az-ship-list' },
                    h('div', { className: 'az-filter-head' }, h('span', null, t('filter.shipCount', { count: String(filteredShips.length) }))),
                    filteredShips.map((ship) =>
                      h(
                        'button',
                        {
                          key: ship.gid,
                          type: 'button',
                          className: `az-ship-row${String(ship.gid) === String(selectedGid) ? ' is-active' : ''}`,
                          onClick: () => setSelectedGid(String(ship.gid)),
                        },
                        h('span', { className: 'az-dot', style: { background: RARITY_COLOR[ship.rarity] || '#8d99ae' } }),
                        h('span', { className: 'az-ship-row-name' }, ship.nameZh || ship.nameEn || ship.gid),
                        h('span', { className: 'az-ship-row-en' }, ship.nameEn || ''),
                        h('span', { className: 'az-ship-row-count' }, String((ship.images || []).length)),
                      ),
                    ),
                  )
                : null,
            );
          }

          const header = h(
            'header',
            { className: 'az-head' },
            h('div', { className: 'az-head-titles' },
              h('h1', null, t('title')),
              h('p', null, t('subtitle')),
            ),
            h(
              'div',
              { className: 'az-head-stats' },
              stats
                ? [
                    h('div', { className: 'az-stat' }, h('span', null, t('stats.images')), h('strong', null, String(stats.totalImages || (catalog && catalog.counts ? catalog.counts.images : 0)))),
                    h('div', { className: 'az-stat' }, h('span', null, t('stats.reviewed')), h('strong', null, String(stats.rated || 0))),
                    h('div', { className: 'az-stat' }, h('span', null, t('stats.favorites')), h('strong', null, String(stats.favorites || 0))),
                    h('div', { className: 'az-stat' }, h('span', null, t('stats.average')), h('strong', null, stats.average ? String(stats.average) : '—')),
                  ]
                : null,
              h('button', { type: 'button', className: 'az-btn az-btn-ghost', onClick: load, title: t('state.reload') }, '⟳'),
            ),
          );

          let body;
          if (status === 'loading') {
            body = h('div', { className: 'az-center' }, t('state.loading'));
          } else if (status === 'empty') {
            body = h(EmptyState, { title: t('empty.catalog'), hint: `${t('empty.catalogHint')}${statusHint ? ` · ${statusHint}` : ''}` });
          } else if (status === 'error') {
            body = h(
              'div',
              { className: 'az-center' },
              h('div', { className: 'az-error' }, `${t('state.error')}: ${statusText}`),
              h('button', { type: 'button', className: 'az-btn az-btn-primary', onClick: load }, t('state.retry')),
            );
          } else {
            body = h(
              'div',
              { className: 'az-body' },
              renderSidebar(),
              h('main', { className: 'az-main' }, mode === 'ships' ? renderShipDetail() : renderAllMode()),
            );
          }

          return h(
            'div',
            { className: 'az-root' },
            h('style', null, cssText()),
            h('div', { className: 'az-shell' }, header, body, notice ? h('div', { className: 'az-toast' }, notice) : null),
            renderLightbox(),
          );
        }

        function Lightbox(props) {
          const { t, ship, image, review } = props;
          const [rating, setRating] = React.useState(review && review.rating ? review.rating : null);
          const [comment, setComment] = React.useState(review && review.comment ? review.comment : '');
          const [dirty, setDirty] = React.useState(false);
          const [errorText, setErrorText] = React.useState('');
          const [savedFlash, setSavedFlash] = React.useState(false);
          const favorite = !!(review && review.favorite);

          React.useEffect(() => {
            setRating(review && review.rating ? review.rating : null);
            setComment(review && review.comment ? review.comment : '');
            setDirty(false);
            setErrorText('');
            setSavedFlash(false);
          }, [image.key]);

          React.useEffect(() => {
            if (!savedFlash) return undefined;
            const timer = setTimeout(() => setSavedFlash(false), 1800);
            return () => clearTimeout(timer);
          }, [savedFlash]);

          async function submit(closeAfter) {
            setErrorText('');
            const ok = await props.onSave({ rating, comment });
            if (!ok) {
              setErrorText(t('error.save', { message: '' }));
              return;
            }
            setDirty(false);
            setSavedFlash(true);
            if (closeAfter) props.onClose();
          }

          async function toggleFavorite() {
            setErrorText('');
            const ok = await props.onToggleFavorite(!favorite);
            if (ok) setSavedFlash(true);
            else setErrorText(t('error.save', { message: '' }));
          }

          const labels = props.labels || {};
          const sectionName = (labels.section && labels.section[image.section]) || image.section;

          return h(
            'div',
            { className: 'az-lightbox', onClick: (event) => { if (event.target === event.currentTarget) props.onClose(); } },
            h(
              'div',
              { className: 'az-lightbox-frame' },
              h(
                'div',
                { className: 'az-lightbox-panel' },
                h(
                  'div',
                  { className: 'az-lightbox-stage' },
                  h('img', { src: imageUrl('full', image.key), alt: image.nameZh || image.key, onError: fallbackImage }),
                ),
                h(
                  'div',
                  { className: 'az-lightbox-meta' },
                  h('div', { className: 'az-lightbox-ship' }, ship.nameZh || ship.nameEn),
                  h(
                    'div',
                    { className: 'az-lightbox-name-row' },
                    h('div', { className: 'az-lightbox-name' }, image.nameZh || image.key),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: `az-fav az-fav-lg${favorite ? ' is-on' : ''}`,
                        title: t(favorite ? 'favorite.remove' : 'favorite.add'),
                        'aria-label': t(favorite ? 'favorite.remove' : 'favorite.add'),
                        'aria-pressed': favorite ? 'true' : 'false',
                        onClick: toggleFavorite,
                      },
                      favorite ? '♥' : '♡',
                    ),
                  ),
                  image.nameEn ? h('div', { className: 'az-lightbox-en' }, image.nameEn) : null,
                h(
                  'div',
                  { className: 'az-lightbox-badges' },
                  badge(sectionName),
                  image.l2d ? badge(t('meta.l2d'), 'az-badge-blue') : null,
                  image.dynamic ? badge(t('meta.dynamic'), 'az-badge-teal') : null,
                  image.dynamicBg ? badge(t('meta.dynamicBg'), 'az-badge-teal') : null,
                  image.dualForm ? badge(t('meta.dual'), 'az-badge-teal') : null,
                  image.section === 'skin' && image.category !== null && image.category !== undefined
                    && labels.skinCategory && labels.skinCategory[String(image.category)]
                    ? badge(labels.skinCategory[String(image.category)])
                    : null,
                  image.section !== 'base' && image.obtainType !== null && image.obtainType !== undefined
                    && labels.obtainType && labels.obtainType[String(image.obtainType)]
                    ? badge(labels.obtainType[String(image.obtainType)])
                    : null,
                  image.price ? badge(formatPrice(image, t)) : null,
                ),
                h('div', { className: 'az-lightbox-label' }, t('lightbox.rating')),
                h(
                  'div',
                  { className: 'az-lightbox-stars' },
                  h(StarRating, {
                    value: rating,
                    onChange: (value) => {
                      setRating(value);
                      setDirty(true);
                    },
                  }),
                  rating ? h('button', { type: 'button', className: 'az-link', onClick: () => { setRating(null); setDirty(true); } }, t('lightbox.clear')) : null,
                ),
                h('div', { className: 'az-lightbox-label' }, t('lightbox.comment')),
                h('textarea', {
                  className: 'az-textarea',
                  rows: 5,
                  maxLength: 2000,
                  placeholder: t('lightbox.commentPlaceholder'),
                  value: comment,
                  onChange: (event) => {
                    setComment(event.target.value);
                    setDirty(true);
                  },
                }),
                errorText ? h('div', { className: 'az-error-inline' }, errorText) : null,
                h(
                  'div',
                  { className: 'az-lightbox-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'az-btn az-btn-primary',
                      disabled: props.saving,
                      onClick: () => submit(false),
                    },
                    props.saving ? t('lightbox.saving') : t('lightbox.save'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'az-btn',
                      disabled: props.saving,
                      onClick: async () => {
                        setRating(null);
                        setComment('');
                        setErrorText('');
                        const ok = await props.onSave({ rating: null, comment: '' });
                        if (!ok) setErrorText(t('error.save', { message: '' }));
                        else props.onClose();
                      },
                    },
                    t('lightbox.clearReview'),
                  ),
                  h('a', { className: 'az-btn az-btn-ghost', href: imageUrl('full', image.key), target: '_blank', rel: 'noreferrer' }, t('lightbox.open')),
                ),
                savedFlash ? h('div', { className: 'az-saved-flash' }, `✓ ${t('lightbox.saved')}`) : null,
                dirty && !props.saving && !savedFlash ? h('div', { className: 'az-hint' }, '未保存') : null,
                h('div', { className: 'az-lightbox-foot' }, t('lightbox.escHint')),
              ),
            ),
            h(
              'button',
              { type: 'button', className: 'az-lightbox-close', onClick: props.onClose, title: t('lightbox.close'), 'aria-label': t('lightbox.close') },
              '×',
            ),
          ),
        );
      }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'azur-skins',
              order: 23,
              locale: NS,
              label: () => t('panel'),
            },
            PanelIcon,
          ),
        );
        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: 'azur-skins',
              locale: NS,
            },
            AzurPanel,
          ),
        );
      },
    };

    function cssText() {
      return `
.az-root { height: 100%; min-height: 0; display: flex; flex-direction: column; color: var(--az-text, #e8ecf6); background: var(--az-bg, #0f1420); font-size: 13px; }
.az-root, .az-root * { box-sizing: border-box; }
.az-shell { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.az-head { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid var(--az-line, #1e2740); background: var(--az-head, #131a2a); }
.az-head-titles h1 { margin: 0; font-size: 16px; letter-spacing: .5px; }
.az-head-titles p { margin: 3px 0 0; font-size: 12px; opacity: .62; }
.az-head-stats { margin-left: auto; display: flex; align-items: center; gap: 14px; }
.az-stat { display: flex; flex-direction: column; align-items: flex-end; font-size: 11px; opacity: .8; }
.az-stat strong { font-size: 15px; font-weight: 600; opacity: 1; }
.az-body { flex: 1; min-height: 0; display: flex; }
.az-side { width: 268px; flex: none; border-right: 1px solid var(--az-line, #1e2740); display: flex; flex-direction: column; min-height: 0; overflow-y: auto; padding: 10px 10px 0; gap: 10px; background: var(--az-side, #121827); }
.az-side-block { display: flex; flex-direction: column; gap: 6px; }
.az-main { flex: 1; min-width: 0; overflow-y: auto; padding: 14px 18px 40px; }
.az-input, .az-textarea, .az-select { width: 100%; border: 1px solid var(--az-line, #26314d); background: var(--az-input, #0c111c); color: inherit; border-radius: 8px; padding: 7px 9px; font: inherit; }
.az-input:focus, .az-textarea:focus, .az-select:focus { outline: none; border-color: #4f7fe0; }
.az-select { width: auto; padding: 5px 8px; font-size: 12px; }
.az-mode { display: flex; gap: 4px; background: var(--az-input, #0c111c); padding: 3px; border-radius: 9px; }
.az-tab { flex: 1; border: 0; background: transparent; color: inherit; padding: 6px 8px; border-radius: 7px; cursor: pointer; font: inherit; opacity: .7; }
.az-tab.is-active { background: #2a3d63; opacity: 1; }
.az-filter-head { display: flex; justify-content: space-between; align-items: center; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; opacity: .62; }
.az-link { border: 0; background: none; color: #7aa7ff; cursor: pointer; font: inherit; font-size: 11px; padding: 0; }
.az-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.az-chip { border: 1px solid var(--az-line, #26314d); background: transparent; color: inherit; border-radius: 999px; padding: 3px 8px; font-size: 11px; cursor: pointer; opacity: .78; }
.az-chip.is-active { border-color: #4f7fe0; background: #22355c; opacity: 1; }
.az-side-nations { max-height: 190px; overflow-y: auto; }
.az-ship-list { border-top: 1px solid var(--az-line, #1e2740); padding-top: 6px; display: flex; flex-direction: column; gap: 1px; }
.az-ship-row { display: flex; align-items: center; gap: 7px; border: 0; background: transparent; color: inherit; text-align: left; padding: 5px 6px; border-radius: 6px; cursor: pointer; font: inherit; }
.az-ship-row:hover { background: #1a2236; }
.az-ship-row.is-active { background: #24365a; }
.az-ship-row-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-ship-row-en { font-size: 10px; opacity: .45; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-ship-row-count { font-size: 10px; opacity: .55; }
.az-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex: none; }
.az-detail { display: flex; flex-direction: column; gap: 18px; }
.az-detail-head { display: flex; align-items: baseline; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--az-line, #1e2740); }
.az-detail-head h2 { margin: 0; font-size: 18px; }
.az-detail-count { font-size: 12px; opacity: .55; }
.az-detail-hint { margin-left: auto; font-size: 12px; color: #ff8fb0; }
.az-ship-head { display: flex; flex-direction: column; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--az-line, #1e2740); }
.az-ship-titles { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.az-ship-titles h2 { margin: 0; font-size: 20px; }
.az-ship-en { font-size: 12px; opacity: .55; }
.az-ship-meta { display: flex; align-items: center; gap: 7px; font-size: 12px; opacity: .85; flex-wrap: wrap; }
.az-ship-stats { display: flex; gap: 12px; font-size: 11px; opacity: .6; }
.az-sections { display: flex; flex-direction: column; gap: 18px; }
.az-section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.az-section-head h3 { margin: 0; font-size: 13px; letter-spacing: .04em; opacity: .9; }
.az-section-count { font-size: 11px; opacity: .5; }
.az-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.az-grid-wide { grid-template-columns: repeat(auto-fill, minmax(172px, 1fr)); }
.az-card { border: 1px solid var(--az-line, #1e2740); background: var(--az-card, #131a2a); border-radius: 10px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; transition: border-color .15s, transform .15s; }
.az-card:hover { border-color: #3d5480; transform: translateY(-1px); }
.az-thumb { position: relative; aspect-ratio: 3 / 4; background: #0a0f18 repeating-linear-gradient(45deg, #0d1522 0 10px, #0a0f18 10px 20px); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.az-thumb img { width: 100%; height: 100%; object-fit: contain; }
.az-fav { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(140, 170, 220, .45); background: rgba(10, 16, 28, .72); color: #c3d3ee; font-size: 14px; line-height: 1; cursor: pointer; padding: 0; opacity: .78; transition: opacity .15s, color .15s, border-color .15s, transform .15s; }
.az-fav:hover { opacity: 1; border-color: #ff8fb0; color: #ffc3d6; transform: scale(1.06); }
.az-fav.is-on { color: #ff6f9c; border-color: #ff6f9c; opacity: 1; }
.az-fav-lg { position: static; width: 30px; height: 30px; font-size: 16px; flex: none; }
.az-lightbox-name-row { display: flex; align-items: center; gap: 8px; }
.az-lightbox-name-row .az-lightbox-name { flex: 1; min-width: 0; }
.az-card-body { padding: 7px 9px 9px; display: flex; flex-direction: column; gap: 3px; }
.az-card-title { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-card-sub { font-size: 10px; opacity: .48; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-card-badges { display: flex; flex-wrap: wrap; gap: 3px; }
.az-badge { font-size: 9px; padding: 1px 5px; border-radius: 999px; background: #22304a; color: #b9c7e6; }
.az-badge-blue { background: #1d3b6d; color: #a7c8ff; }
.az-badge-teal { background: #14454a; color: #98e6e0; }
.az-badge-warn { background: #4a3a16; color: #f0cd8a; }
.az-card-stars { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.az-card-comment { font-size: 10px; opacity: .55; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-card-ship { font-size: 10px; opacity: .5; }
.az-stars { display: flex; gap: 1px; }
.az-star { border: 0; background: none; padding: 0 1px; cursor: pointer; color: #3a4560; font-size: 15px; line-height: 1; }
.az-star.is-on { color: #f3c349; }
.az-stars-sm .az-star { font-size: 12px; }
.az-toolbar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--az-line, #1e2740); }
.az-toolbar-group { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.az-toolbar-label { font-size: 11px; opacity: .55; margin-right: 2px; }
.az-more { display: flex; justify-content: center; padding: 18px 0; }
.az-btn { border: 1px solid var(--az-line, #26314d); background: var(--az-input, #0c111c); color: inherit; border-radius: 8px; padding: 6px 12px; cursor: pointer; font: inherit; font-size: 12px; }
.az-btn:hover { border-color: #4f7fe0; }
.az-btn:disabled { opacity: .45; cursor: default; }
.az-btn-primary { background: #2f5cc0; border-color: #2f5cc0; color: #fff; }
.az-btn-ghost { background: transparent; }
.az-btn-ghost[href] { text-decoration: none; display: inline-block; }
.az-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; opacity: .9; }
.az-empty { display: flex; flex-direction: column; gap: 6px; padding: 28px; align-items: center; text-align: center; opacity: .85; }
.az-empty-title { font-weight: 600; }
.az-empty-hint { font-size: 12px; opacity: .6; }
.az-error { color: #ff9c9c; }
.az-error-inline { color: #ff9c9c; font-size: 12px; }
.az-toast { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); background: #22304a; color: #dbe6ff; padding: 8px 16px; border-radius: 999px; font-size: 12px; box-shadow: 0 6px 20px rgba(0,0,0,.35); z-index: 90; }
.az-lightbox { position: fixed; inset: 0; background: rgba(4,7,12,.78); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 70; padding: 26px 18px; }
.az-lightbox-frame { position: relative; display: flex; max-width: min(1500px, 96vw); max-height: 94vh; }
.az-lightbox-panel { display: flex; gap: 0; width: 100%; min-width: 0; background: #0d1320; border: 1px solid #22304a; border-radius: 14px; overflow: hidden; }
.az-lightbox-stage { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; background: #070b12; }
.az-lightbox-stage img { max-width: 100%; max-height: 94vh; object-fit: contain; display: block; }
.az-lightbox-meta { width: 320px; flex: none; padding: 18px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; position: relative; }
.az-lightbox-close { position: absolute; top: -14px; right: -14px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #3a4a6b; background: #22304a; color: #e6eeff; font-size: 20px; line-height: 1; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.45); z-index: 3; padding: 0 0 2px; }
.az-lightbox-close:hover { background: #2f4570; border-color: #5b78ad; }
.az-lightbox-foot { margin-top: auto; padding-top: 8px; font-size: 11px; opacity: .35; }
.az-saved-flash { font-size: 12px; color: #8be0b0; }
.az-lightbox-ship { font-size: 12px; opacity: .55; }
.az-lightbox-name { font-size: 17px; font-weight: 600; }
.az-lightbox-en { font-size: 12px; opacity: .5; }
.az-lightbox-badges { display: flex; flex-wrap: wrap; gap: 4px; }
.az-lightbox-label { font-size: 11px; letter-spacing: .04em; text-transform: uppercase; opacity: .55; margin-top: 6px; }
.az-lightbox-stars { display: flex; align-items: center; gap: 10px; }
.az-lightbox-stars .az-star { font-size: 22px; }
.az-textarea { resize: vertical; min-height: 96px; }
.az-lightbox-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.az-hint { font-size: 11px; opacity: .5; }
.az-crash { padding: 24px; display: flex; flex-direction: column; gap: 10px; }
.az-crash-title { font-size: 16px; font-weight: 600; }
.az-crash-hint { font-size: 12px; opacity: .6; }
.az-crash pre { background: #0b101a; padding: 10px; border-radius: 8px; overflow: auto; font-size: 11px; }
.az-crash-actions { display: flex; gap: 8px; }
@media (prefers-color-scheme: light) {
  .az-root { --az-bg: #f4f6fb; --az-head: #ffffff; --az-side: #ffffff; --az-card: #ffffff; --az-line: #e2e7f2; --az-text: #1a2233; --az-input: #f7f9fd; }
  .az-tab.is-active { background: #dce6fb; }
  .az-ship-row:hover { background: #eef2fb; }
  .az-ship-row.is-active { background: #dce6fb; }
  .az-card:hover { border-color: #b9c9e8; }
  .az-lightbox-panel { background: #ffffff; }
  .az-lightbox-stage { background: #eef1f7; }
  .az-thumb { background: #eef1f7; }
  .az-fav { background: rgba(255, 255, 255, .82); color: #4a5b7a; border-color: rgba(120, 140, 175, .45); }
  .az-fav.is-on { color: #e0447a; border-color: #e0447a; }
  .az-lightbox-close { background: #ffffff; color: #1a2233; border-color: #c9d5ea; }
  .az-lightbox-close:hover { background: #eef2fb; }
  .az-detail-hint { color: #d6336c; }
  .az-saved-flash { color: #1f8a5a; }
  .az-toast { background: #1a2233; color: #eef2fb; }
  .az-badge { background: #e6ecf9; color: #3c4b68; }
}
`;
    }
  },
});
