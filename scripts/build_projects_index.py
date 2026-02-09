# scripts/build_projects_index.py
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]  # portfolio-next/
CONTENT_DIR = ROOT / "content"
PROJECTS_DIR = CONTENT_DIR / "projects"
OUTFILE = CONTENT_DIR / "projects_index.json"

CATEGORIES = ["architecture", "fabrication", "hci", "urban-interaction"]

ASSET_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".pdf"}

def read_json(p: Path) -> dict[str, Any]:
    return json.loads(p.read_text(encoding="utf-8"))

def list_assets(assets_dir: Path) -> list[str]:
    if not assets_dir.exists():
        return []
    files = []
    for f in assets_dir.iterdir():
        if f.is_file() and f.suffix.lower() in ASSET_EXTS:
            files.append(f.name)
    # stable order
    files.sort(key=lambda s: s.lower())
    return files

def pick_hero(meta: dict[str, Any], assets: list[str]) -> str | None:
    # 1) meta.hero explicitly
    hero = meta.get("hero")
    if isinstance(hero, str) and hero in assets:
        return hero
    # 2) auto hero.*
    for name in assets:
        base = name.lower()
        if base.startswith("hero."):
            return name
    return None

def pick_cover(meta: dict[str, Any], assets: list[str]) -> str | None:
    cover = meta.get("cover")
    if isinstance(cover, str) and cover in assets:
        return cover
    # Optional: allow meta.hero as cover fallback
    return None

def pick_gallery(meta: dict[str, Any], assets: list[str]) -> list[str]:
    # 1) meta.gallery explicitly
    g = meta.get("gallery")
    if isinstance(g, list):
        ok = [x for x in g if isinstance(x, str) and x in assets]
        if ok:
            return ok

    # 2) auto detect gallery-*, and also tolerate "galleray-*" typo
    def is_gallery(name: str) -> bool:
        n = name.lower()
        return n.startswith("gallery-") or n.startswith("galleray-") or n.startswith("portfolio-")

    gallery = [a for a in assets if is_gallery(a)]
    # if none, return all images except hero/cover, as a fallback (optional)
    if not gallery:
        gallery = [a for a in assets if not a.lower().startswith("hero.")]
    return gallery

def make_public_url(category: str, slug: str, filename: str) -> str:
    # assets 已经被你同步脚本复制到 public/projects/{category}/{slug}/
    return f"/projects/{category}/{slug}/{filename}"

def build_index() -> list[dict[str, Any]]:
    projects: list[dict[str, Any]] = []

    for cat in CATEGORIES:
        cat_dir = PROJECTS_DIR / cat
        if not cat_dir.exists():
            continue

        for proj_dir in sorted([p for p in cat_dir.iterdir() if p.is_dir()], key=lambda p: p.name.lower()):
            slug = proj_dir.name
            meta_path = proj_dir / "meta.json"
            mdx_path = proj_dir / "index.mdx"
            assets_dir = proj_dir / "assets"

            if not meta_path.exists():
                continue

            meta = read_json(meta_path)
            assets = list_assets(assets_dir)

            hero_file = pick_hero(meta, assets)
            cover_file = pick_cover(meta, assets)
            gallery_files = pick_gallery(meta, assets)

            url = f"/projects/{cat}/{slug}"

            record: dict[str, Any] = {
                **meta,
                "category": cat,
                "slug": slug,
                "url": url,
                "path": str(proj_dir.relative_to(CONTENT_DIR)).replace("\\", "/"),
                "mdxPath": str(mdx_path.relative_to(ROOT)).replace("\\", "/"),
                "assets": assets,
                "hero": hero_file or meta.get("hero"),  # keep original field too
                "gallery": gallery_files,              # normalized gallery list
                "heroUrl": make_public_url(cat, slug, hero_file) if hero_file else None,
                "coverUrl": make_public_url(cat, slug, cover_file) if cover_file else None,
                "galleryUrls": [make_public_url(cat, slug, f) for f in gallery_files],
            }

            # warnings
            warnings = []
            if not mdx_path.exists():
                warnings.append("missing index.mdx")
            if hero_file is None:
                warnings.append("missing hero (meta.hero not found and no hero.* in assets)")
            if warnings:
                record["_warnings"] = warnings

            projects.append(record)

    # Sort: featured desc, category, order asc, year desc, title
    def sort_key(p: dict[str, Any]):
        featured = 1 if p.get("featured") else 0
        order = p.get("order", 9999)
        year = p.get("year", 0)
        title = p.get("title", "")
        return (-featured, str(p.get("category", "")), int(order) if isinstance(order, int) else 9999, -(int(year) if isinstance(year, int) else 0), str(title))

    projects.sort(key=sort_key)
    return projects

def main():
    projects = build_index()
    OUTFILE.write_text(json.dumps(projects, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Wrote {len(projects)} projects to: {OUTFILE}")

if __name__ == "__main__":
    main()
