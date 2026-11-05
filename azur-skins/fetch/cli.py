#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""azur-skins 抓取管线：meta / images / thumbs / verify / status。

数据来源
  - 站点静态 JSON:  https://azurlane.mrlar.dev/db/static/json/{ships,skins}.json
  - 立绘:           https://als.mrlar.dev/full/<icon>.webp
  - 中文名:         AzurLaneTools/AzurLaneData (CN 服官方数据, 经 gh-proxy 中转)

用法
  python fetch\\cli.py meta
  python fetch\\cli.py images --only 155,10706 --workers 10
  python fetch\\cli.py images
  python fetch\\cli.py thumbs
  python fetch\\cli.py verify
"""
from __future__ import annotations

import argparse
import gzip
import http.client
import json
import os
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlsplit

DEFAULT_ROOT = Path(os.environ.get("AZUR_SKINS_DIR", r"D:\deepseekHarness\azur-skins"))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
SITE_JSON = "https://azurlane.mrlar.dev/db/static/json/{name}.json"
IMG_FULL = "https://als.mrlar.dev/full/{icon}.webp"
IMG_COMPACT = "https://als.mrlar.dev/compact/{icon}.webp"
GH = "https://gh-proxy.com/https://raw.githubusercontent.com/AzurLaneTools/AzurLaneData/main/"

SKIN_TYPE = {-1: "默认", 0: "常规皮肤", 1: "誓约立绘", 2: "改造立绘",
             3: "初始立绘", 4: "宣传皮肤", 5: "特殊皮肤", 6: "其他版本"}
OBTAIN = {0: "钻石购买", 1: "核心数据商店", 2: "活动获取", 3: "通行证", 4: "任务奖励",
          5: "兑换商店", 6: "誓约", 7: "改造", 8: "宣传", 9: "换装", 10: "通行证商店",
          -1: "不可获得", -2: "默认"}
CATEGORY = {0: "默认", 1: "圣诞", 2: "新年和服", 3: "皇家华服", 4: "校服", 6: "泳装",
            7: "礼服", 8: "万圣节", 9: "便服", 10: "夏日祭", 11: "闪耀之星",
            12: "特别演习", 13: "运动时间", 14: "赛车女郎", 15: "医院", 16: "兔女郎",
            17: "女仆", 18: "血月", 19: "童话", 20: "居家", 21: "韵律", 22: "温泉",
            23: "工作", 24: "RPG冒险", 25: "西部", 26: "梦境公园", 27: "尼罗风情",
            28: "忍者城堡", 29: "鬼故事", 9997: "改造", 9998: "誓约", 9999: "其他"}
HULL = {1: "驱逐舰", 2: "轻巡洋舰", 3: "重巡洋舰", 4: "战列巡洋舰", 5: "战列舰",
        6: "轻型航母", 7: "航空母舰", 8: "潜艇", 9: "航空巡洋舰", 10: "航空战列舰",
        11: "重雷装巡洋舰", 12: "维修舰", 13: "浅水重炮舰", 14: "鱼雷艇",
        15: "运输舰", 16: "轰炸舰", 17: "潜水母舰", 18: "大型巡洋舰", 19: "弹药舰",
        20: "导弹驱逐舰(前卫)", 21: "导弹驱逐舰(主力)", 22: "护卫舰(潜艇)",
        23: "护卫舰(前卫)", 24: "护卫舰(主力)", 25: "特殊舰船"}
NATION = {0: "通用", 1: "白鹰", 2: "皇家", 3: "重樱", 4: "铁血", 5: "东煌",
          6: "撒丁帝国", 7: "北方联合", 8: "自由鸢尾", 9: "维希教廷", 10: "鸢尾教国",
          11: "郁金王国", 12: "宝石之国", 94: "联合议会", 95: "X", 96: "风暴",
          97: "META", 98: "通用", 99: "塞壬", 101: "超次元海王星", 102: "哔哩哔哩",
          103: "传颂之物", 104: "绊爱", 105: "Hololive", 106: "维纳斯假期",
          107: "偶像大师", 108: "SSSS", 109: "莱莎的炼金工房", 110: "闪乱神乐",
          111: "出包王女", 112: "黑岩射手", 113: "优米雅的炼金工房",
          114: "地城邂逅", 115: "约会大作战", 117: "NieR:Automata"}
RARITY = {1: "普通", 2: "普通", 3: "稀有", 4: "精锐", 5: "超稀有", 6: "海上传奇"}

NCRE = re.compile(r"\{namecode:(\d+)\}")
PLACEHOLDER = ("？", "?")


# ---------------------------------------------------------------- utilities

def log(*a):
    print(*a, flush=True)


def read_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    os.replace(tmp, path)


def write_bytes(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".part")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def fetch(url: str, retries: int = 8, timeout: int = 45, backoff: float = 1.5,
          gzip_ok: bool = True) -> bytes:
    """GET 一个 URL，带浏览器 UA、gzip 协商与重试。

    站点/CDN 偶发连接被重置（WinError 10054）或 chunked 传输中断；JSON 接口支持
    `Accept-Encoding: gzip`，压缩后只有原体积的 1/12，重试成本极低。
    """
    import http.client

    last = None
    for attempt in range(retries):
        try:
            headers = {"User-Agent": UA, "Accept": "*/*"}
            if gzip_ok:
                headers["Accept-Encoding"] = "gzip"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                encoding = (r.headers.get("content-encoding") or "").lower()
                buf = bytearray()
                while True:
                    chunk = r.read(1 << 16)
                    if not chunk:
                        break
                    buf += chunk
            data = bytes(buf)
            if encoding == "gzip":
                data = gzip.decompress(data)
            return data
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (404, 410, 403):
                raise
        except (http.client.IncompleteRead, http.client.RemoteDisconnected,
                urllib.error.URLError, socket.timeout, TimeoutError,
                ConnectionError, OSError) as e:
            last = e
        if attempt + 1 < retries:
            time.sleep(backoff * (attempt + 1))
    raise last  # type: ignore[misc]


def fetch_cached(url: str, dest: Path, min_size: int, timeout: int = 90) -> bytes:
    if dest.exists() and dest.stat().st_size >= min_size:
        raw = dest.read_bytes()
        if not dest.name.endswith(".json"):
            return raw
        try:
            json.loads(raw)
            return raw
        except ValueError:
            log(f"  ! 缓存文件不完整，重新下载 {dest.name}")
            dest.unlink()
    log(f"  ↓ {url.split('/')[-1]} ...")
    t0 = time.time()
    data = fetch(url, retries=6, timeout=timeout)
    if len(data) < min_size:
        raise RuntimeError(f"{url} 只拿到 {len(data)} 字节")
    if dest.name.endswith(".json"):
        json.loads(data)  # 不完整就抛，宁可重跑也不要坏缓存
    write_bytes(dest, data)
    log(f"    {len(data):,} B / {time.time() - t0:.1f}s")
    return data


def section_of(skin_type) -> str:
    if skin_type == 1:
        return "oath"
    if skin_type == 2:
        return "retrofit"
    return "skin"


# ---------------------------------------------------------------- meta

def labels_doc():
    return {
        "hull": {str(k): v for k, v in HULL.items()},
        "nation": {str(k): v for k, v in NATION.items()},
        "rarity": {str(k): v for k, v in RARITY.items()},
        "skinType": {str(k): v for k, v in SKIN_TYPE.items()},
        "skinCategory": {str(k): v for k, v in CATEGORY.items()},
        "obtainType": {str(k): v for k, v in OBTAIN.items()},
        "section": {"base": "原皮", "retrofit": "改造立绘", "oath": "誓约立绘", "skin": "皮肤"},
    }


def cmd_meta(args):
    root: Path = args.root
    src = root / "source"
    cn = src / "cn"
    data = root / "data"
    for d in (src, cn, data):
        d.mkdir(parents=True, exist_ok=True)

    log("[1/5] 站点数据")
    ships = json.loads(fetch_cached(SITE_JSON.format(name="ships"), src / "ships.json", 1000))
    skins = json.loads(fetch_cached(SITE_JSON.format(name="skins"), src / "skins.json", 1000))
    log(f"  ships={len(ships)} skins={len(skins)}")

    log("[2/5] 中文数据 (CN 服官方)")
    stats = json.loads(fetch_cached(GH + "CN/sharecfgdata/ship_data_statistics.json",
                                    cn / "ship_data_statistics.json", 1000))
    tpl = json.loads(fetch_cached(GH + "CN/ShareCfg/ship_skin_template.json",
                                  cn / "ship_skin_template.json", 1000))
    names = json.loads(fetch_cached(GH + "CN/ShareCfg/name_code.json",
                                    cn / "name_code.json", 100))
    log(f"  stats={len(stats)} skin_template={len(tpl)} name_code={len(names)}")

    # 船名：CN ship id // 10 == 站点 gid
    by_group = {}
    for row in stats.values():
        try:
            gid = str(int(row["id"]) // 10)
        except (KeyError, TypeError, ValueError):
            continue
        nm = (row.get("name") or "").strip()
        if not nm or nm.startswith(PLACEHOLDER):
            continue
        by_group.setdefault(gid, nm)

    def resolve_skin_name(raw):
        if not raw:
            return ""
        out = NCRE.sub(lambda m: (names.get(m.group(1)) or {}).get("name", ""), raw)
        return out.strip()

    overrides = read_json(data / "overrides.zh.json", {}) or {}
    ov_ships = overrides.get("ships", {})
    ov_skins = overrides.get("skins", {})

    log("[3/5] 构建 catalog")
    cat_ships = []
    unmatched_ships, unmatched_skins = [], []
    counts = {"base": 0, "skin": 0, "retrofit": 0, "oath": 0}
    for sid, ship in ships.items():
        gid = str(ship.get("gid") or "")
        name_zh = ov_ships.get(gid) or by_group.get(gid) or ""
        if ov_ships.get(gid):
            name_src = "auto"
        elif by_group.get(gid):
            name_src = "official"
        else:
            name_src = "none"
            unmatched_ships.append({"gid": gid, "id": ship.get("id"), "nameEn": ship.get("name")})

        base_icon = ship.get("icon") or ""
        images = []
        if base_icon:
            images.append({
                "key": base_icon, "icon": base_icon, "section": "base", "skinId": None,
                "nameZh": name_zh or ship.get("name") or base_icon,
                "nameEn": ship.get("name") or "",
                "zhSource": name_src, "type": -1, "category": None, "obtainType": -2,
                "l2d": False, "dynamic": False, "dynamicBg": False, "customBgm": False,
                "hasAlt": False, "dualForm": False, "price": None, "currency": None,
                "servers": ship.get("servers") or [],
            })
        for skin_id in ship.get("skins") or []:
            s = skins.get(str(skin_id))
            if not s:
                continue
            icon = s.get("icon") or ""
            if not icon:
                continue
            raw = (tpl.get(str(skin_id)) or {}).get("name") or ""
            zh = resolve_skin_name(raw)
            if zh:
                src_kind = "official"
            elif ov_skins.get(str(skin_id)):
                zh, src_kind = ov_skins[str(skin_id)], "auto"
            else:
                zh, src_kind = s.get("name") or "", "none"
                unmatched_skins.append({"id": skin_id, "nameEn": s.get("name"),
                                        "shipGid": gid, "shipNameEn": ship.get("name")})
            styp = s.get("type")
            images.append({
                "key": icon, "icon": icon, "section": section_of(styp), "skinId": skin_id,
                "nameZh": zh, "nameEn": s.get("name") or "", "zhSource": src_kind,
                "type": styp, "category": s.get("category"),
                "obtainType": s.get("obtain_type"), "price": s.get("price"),
                "currency": s.get("currency"), "l2d": bool(s.get("l2d")),
                "dynamic": bool(s.get("dynamic")), "dynamicBg": bool(s.get("dynamic_bg")),
                "customBgm": bool(s.get("custom_bgm")), "hasAlt": bool(s.get("has_alt")),
                "dualForm": bool(s.get("dual_form")), "l2dPlus": bool(s.get("l2d_plus")),
                "asmr": bool(s.get("asmr")),
                "servers": s.get("servers") or [],
            })
        for im in images:
            counts[im["section"]] = counts.get(im["section"], 0) + 1
        cat_ships.append({
            "gid": gid, "id": ship.get("id"), "nameZh": name_zh or ship.get("name") or gid,
            "nameEn": ship.get("name") or "", "zhSource": name_src,
            "nation": ship.get("nation"), "hull": ship.get("hull"),
            "rarity": ship.get("rarity"), "class": ship.get("class") or "",
            "tags": ship.get("tags") or [], "aliases": ship.get("aliases") or [],
            "date": ship.get("date"), "servers": ship.get("servers") or [],
            "images": images,
        })

    labels = read_json(data / "labels.zh.json")
    if not labels:
        labels = labels_doc()
        write_json(data / "labels.zh.json", labels)

    catalog = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "source": {"ships": "https://azurlane.mrlar.dev/db/static/json/ships.json",
                   "skins": "https://azurlane.mrlar.dev/db/static/json/skins.json",
                   "zh": "AzurLaneTools/AzurLaneData CN"},
        "counts": {"ships": len(cat_ships),
                   "skins": sum(1 for s in cat_ships for i in s["images"] if i["section"] != "base"),
                   "images": sum(len(s["images"]) for s in cat_ships),
                   "bySection": counts},
        "labels": labels,
        "ships": cat_ships,
    }
    write_json(data / "catalog.json", catalog)
    write_json(data / "missing-names.json",
               {"ships": unmatched_ships, "skins": unmatched_skins})
    log(f"  catalog: {catalog['counts']}")
    log(f"  未匹配中文名: 船 {len(unmatched_ships)} / 皮肤 {len(unmatched_skins)}"
        f" -> data/missing-names.json")


# ---------------------------------------------------------------- images

def image_targets(root: Path, catalog, only=None):
    targets = []
    for ship in catalog["ships"]:
        if only and not (str(ship["gid"]) in only or str(ship["id"]) in only
                         or (ship["nameEn"] or "").lower() in only):
            continue
        for im in ship["images"]:
            targets.append((im["icon"], im["key"], ship["gid"]))
    return targets


_tls = threading.local()


def _drop_conn() -> None:
    conn = getattr(_tls, "conn", None)
    if conn is not None:
        try:
            conn.close()
        except Exception:  # noqa: BLE001 - 关连接失败无所谓
            pass
    _tls.conn = None
    _tls.host = None


def _get_conn(host: str, timeout: int) -> http.client.HTTPSConnection:
    """每个线程复用一条 TLS 连接（握手很贵，复用后吞吐明显上升）。"""
    conn = getattr(_tls, "conn", None)
    if conn is not None and getattr(_tls, "host", None) == host:
        return conn
    _drop_conn()
    conn = http.client.HTTPSConnection(host, timeout=timeout)
    _tls.conn = conn
    _tls.host = host
    return conn


def webp_problem(path: Path, min_size: int = 10_000) -> str | None:
    """检查一个 webp 是否完整：返回问题描述，None 表示正常。"""
    try:
        size = path.stat().st_size
        if size <= min_size:
            return f"文件太小 {size}B"
        with path.open("rb") as fh:
            head = fh.read(12)
        if head[:4] != b"RIFF" or head[8:12] != b"WEBP":
            return "不是 webp"
        declared = int.from_bytes(head[4:8], "little")
        if declared + 8 != size:
            return f"长度不符 {size}B != {declared + 8}B（疑似截断）"
        return None
    except OSError as e:
        return f"{type(e).__name__}: {e}"


def download_webp(url: str, dest: Path, retries: int = 6, timeout: int = 60, min_size: int = 10_000) -> int:
    """流式下载一张立绘到 dest（先写 .part 再原子替换），返回字节数。"""
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".part")
    parts = urlsplit(url)
    host = parts.hostname or "als.mrlar.dev"
    target = parts.path + (("?" + parts.query) if parts.query else "")
    last = None
    for attempt in range(retries):
        try:
            conn = _get_conn(host, timeout)
            conn.request("GET", target, headers={
                "User-Agent": UA,
                "Accept": "image/webp,image/*;q=0.8",
                "Accept-Encoding": "identity",
                "Connection": "keep-alive",
            })
            resp = conn.getresponse()
            if resp.status != 200:
                _drop_conn()
                raise urllib.error.HTTPError(url, resp.status, resp.reason or "", resp.headers, None)
            expected = resp.getheader("Content-Length")
            with open(tmp, "wb") as fh:
                while True:
                    chunk = resp.read(1 << 16)
                    if not chunk:
                        break
                    fh.write(chunk)
            if expected is not None and int(expected) != tmp.stat().st_size:
                raise ValueError(f"长度不符 {tmp.stat().st_size} != {expected}")
            problem = webp_problem(tmp, min_size=min_size)
            if problem:
                raise ValueError(problem)
            size = tmp.stat().st_size
            os.replace(tmp, dest)
            return size
        except urllib.error.HTTPError as e:
            if tmp.exists():
                tmp.unlink(missing_ok=True)
            if e.code in (403, 404, 410):
                raise
            last = e
        except Exception as e:  # noqa: BLE001 - 任何网络错误都重试
            _drop_conn()
            if tmp.exists():
                try:
                    tmp.unlink()
                except OSError:
                    pass
            last = e
        if attempt + 1 < retries:
            time.sleep(min(20.0, 2.0 * (attempt + 1)))
    raise last  # type: ignore[misc]


def download_one(icon: str, dest: Path) -> tuple:
    if dest.exists() and webp_problem(dest) is None:
        return ("cached", dest.stat().st_size)
    if dest.exists():
        dest.unlink(missing_ok=True)
    try:
        size = download_webp(IMG_FULL.format(icon=icon), dest)
        return ("ok", size)
    except urllib.error.HTTPError as e:
        if e.code in (403, 404, 410):
            try:
                size = download_webp(IMG_COMPACT.format(icon=icon), dest, retries=2, min_size=2_000)
                return ("compact", size)
            except Exception:
                return ("missing", f"http {e.code}")
        return ("error", f"http {e.code}")
    except Exception as e:
        return ("error", f"{type(e).__name__}: {e}")


def cmd_images(args):
    root: Path = args.root
    catalog = read_json(root / "data" / "catalog.json")
    if not catalog:
        raise SystemExit("缺少 data/catalog.json，先跑 meta")
    only = None
    if args.only:
        only = {x.strip().lower() for x in args.only.split(",") if x.strip()}
    targets = image_targets(root, catalog, only)
    full = root / "images" / "full"
    state_path = root / "data" / "download.json"
    state = read_json(state_path, {}) or {}
    missing_path = root / "data" / "missing.json"
    missing = read_json(missing_path, {}) or {}

    todo = [(icon, full / (icon + ".webp")) for icon, _key, _gid in targets]
    log(f"目标 {len(todo)} 张，并发 {args.workers}")
    t0 = time.time()
    done = ok = 0
    total_bytes = 0
    lock_step = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(download_one, icon, dest): (icon, dest) for icon, dest in todo}
        for fut in as_completed(futs):
            icon, dest = futs[fut]
            status, info = fut.result()
            done += 1
            if status in ("ok", "cached", "compact"):
                ok += 1
                state[icon] = {"status": status, "bytes": info if isinstance(info, int) else 0,
                               "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
                if isinstance(info, int):
                    total_bytes += info
                if status == "compact":
                    missing[icon] = {"reason": "full 404，已回退 compact", "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
            else:
                state[icon] = {"status": status, "reason": str(info),
                               "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
                missing[icon] = {"reason": str(info), "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
            if done % 20 == 0 or done == len(todo):
                el = max(0.1, time.time() - t0)
                rate = done / el
                eta = (len(todo) - done) / rate if rate else 0
                mbps = total_bytes / el / 1048576
                log(f"  {done}/{len(todo)} ok={ok} {rate:.2f}/s {mbps:.2f}MB/s ETA {eta / 60:.0f}min")
                write_json(state_path, state)
                write_json(missing_path, missing)
    write_json(state_path, state)
    write_json(missing_path, missing)
    log(f"完成 {ok}/{len(todo)}，{time.time() - t0:.0f}s，缺失 {len(missing)}")
    if missing:
        log("缺失见 data/missing.json")


# ---------------------------------------------------------------- thumbs

def make_thumb(src: Path, dst: Path, min_size: int = 10_000) -> str:
    from PIL import Image
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return "skip"
    problem = webp_problem(src, min_size=min_size)
    if problem:
        raise ValueError(f"源文件损坏（{problem}）")
    with Image.open(src) as im:
        if im.mode not in ("RGBA", "RGB"):
            im = im.convert("RGBA")
        im.thumbnail((480, 480), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        tmp = dst.with_name(dst.name + ".part")
        im.save(tmp, "WEBP", quality=78, method=6)
        os.replace(tmp, dst)
    return "ok"


def cmd_compact(args):
    root: Path = args.root
    catalog = read_json(root / "data" / "catalog.json")
    if not catalog:
        raise SystemExit("缺少 data/catalog.json，先跑 meta")
    icons = sorted({im["icon"] for s in catalog["ships"] for im in s["images"]})
    dest_dir = root / "images" / "compact"
    dest_dir.mkdir(parents=True, exist_ok=True)
    todo = [(icon, dest_dir / (icon + ".webp")) for icon in icons]
    log(f"低清图（compact）{len(todo)} 张，并发 {args.workers}")
    t0 = time.time()
    done = ok = 0

    def one(icon: str, dest: Path):
        if dest.exists() and webp_problem(dest, min_size=2_000) is None:
            return ("cached", dest.stat().st_size)
        if dest.exists():
            dest.unlink(missing_ok=True)
        try:
            return ("ok", download_webp(IMG_COMPACT.format(icon=icon), dest, retries=3, timeout=45, min_size=2_000))
        except Exception as e:
            return ("error", f"{type(e).__name__}: {e}")

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(one, icon, dest): icon for icon, dest in todo}
        for fut in as_completed(futs):
            done += 1
            status, info = fut.result()
            if status in ("ok", "cached"):
                ok += 1
            else:
                log(f"  ! {futs[fut]}: {info}")
            if done % 50 == 0 or done == len(todo):
                el = max(0.1, time.time() - t0)
                log(f"  {done}/{len(todo)} ok={ok} {done / el:.1f}/s")
    log(f"compact 完成 {ok}/{len(todo)}，{time.time() - t0:.0f}s")


def cmd_thumbs(args):
    root: Path = args.root
    catalog = read_json(root / "data" / "catalog.json")
    icons = sorted({im["icon"] for s in catalog["ships"] for im in s["images"]})
    full = root / "images" / "full"
    compact = root / "images" / "compact"
    thumb = root / "images" / "thumb"
    jobs = []
    for i in icons:
        src = full / (i + ".webp")
        min_size = 10_000
        if not src.exists():
            alt = compact / (i + ".webp")
            if alt.exists():
                src = alt
                min_size = 2_000
        if src.exists():
            jobs.append((src, thumb / (i + ".webp"), min_size))
    log(f"缩略图 {len(jobs)} 张，并发 {args.workers}")
    t0 = time.time()
    done = n_ok = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(make_thumb, a, b, c): b for a, b, c in jobs}
        for fut in as_completed(futs):
            done += 1
            try:
                if fut.result() == "ok":
                    n_ok += 1
            except Exception as e:
                log(f"  ! {futs[fut].name}: {type(e).__name__}: {e}")
            if done % 100 == 0 or done == len(jobs):
                el = max(0.1, time.time() - t0)
                log(f"  {done}/{len(jobs)} new={n_ok} {done / el:.1f}/s")
    log(f"缩略图完成，新增 {n_ok}，{time.time() - t0:.0f}s")


# ---------------------------------------------------------------- verify / status

def cmd_verify(args):
    root: Path = args.root
    catalog = read_json(root / "data" / "catalog.json")
    if not catalog:
        raise SystemExit("缺少 data/catalog.json")
    missing = read_json(root / "data" / "missing.json", {}) or {}
    icons = [im["icon"] for s in catalog["ships"] for im in s["images"]]
    full = root / "images" / "full"
    thumb = root / "images" / "thumb"
    bad, absent, thumb_missing = [], [], []
    total_bytes = 0
    for icon in icons:
        p = full / (icon + ".webp")
        if not p.exists():
            absent.append(icon)
            continue
        total_bytes += p.stat().st_size
        if webp_problem(p):
            bad.append(icon)
        if not (thumb / (icon + ".webp")).exists():
            thumb_missing.append(icon)
    on_disk = {p.stem for p in full.glob("*.webp")}
    orphan = sorted(on_disk - set(icons))
    zh_bad = [im["icon"] for s in catalog["ships"] for im in s["images"]
              if not im["nameZh"] or im["zhSource"] == "none"]
    ships_none = [s["gid"] for s in catalog["ships"] if s["zhSource"] == "none"]
    stats = {
        "ships": catalog["counts"]["ships"],
        "images_expected": len(icons),
        "images_present": len(icons) - len(absent),
        "absent": len(absent),
        "bad_magic": len(bad),
        "orphan": len(orphan),
        "thumbs_missing": len(thumb_missing),
        "zh_missing_images": len(zh_bad),
        "zh_missing_ships": len(ships_none),
        "missing_logged": len(missing),
        "bytes": total_bytes,
        "gib": round(total_bytes / 1024 ** 3, 2),
    }
    log(json.dumps(stats, ensure_ascii=False, indent=2))
    if absent[:5]:
        log("absent:", absent[:5])
    if bad[:5]:
        log("bad:", bad[:5])
    if orphan[:5]:
        log("orphan:", orphan[:5])
    return 0 if not bad else 1


def cmd_status(args):
    root: Path = args.root
    catalog = read_json(root / "data" / "catalog.json")
    state = read_json(root / "data" / "download.json", {}) or {}
    missing = read_json(root / "data" / "missing.json", {}) or {}
    thumbs = len(list((root / "images" / "thumb").glob("*.webp"))) if (root / "images" / "thumb").exists() else 0
    files = len(list((root / "images" / "full").glob("*.webp"))) if (root / "images" / "full").exists() else 0
    icons = catalog["counts"]["images"] if catalog else 0
    log(json.dumps({
        "catalog": bool(catalog),
        "images": f"{files}/{icons}",
        "thumbs": thumbs,
        "download_state": len(state),
        "missing": len(missing),
    }, ensure_ascii=False, indent=2))


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="azur-skins 抓取管线")
    ap.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("meta")

    p_img = sub.add_parser("images")
    p_img.add_argument("--only", default=None, help="gid/id/英文名，逗号分隔")
    p_img.add_argument("--workers", type=int, default=10)

    p_th = sub.add_parser("thumbs")
    p_th.add_argument("--workers", type=int, default=8)

    p_cp = sub.add_parser("compact")
    p_cp.add_argument("--workers", type=int, default=10)

    sub.add_parser("verify")
    sub.add_parser("status")

    args = ap.parse_args()
    args.root = args.root.expanduser()
    {"meta": cmd_meta, "images": cmd_images, "thumbs": cmd_thumbs,
     "compact": cmd_compact, "verify": cmd_verify, "status": cmd_status}[args.cmd](args)


if __name__ == "__main__":
    main()
