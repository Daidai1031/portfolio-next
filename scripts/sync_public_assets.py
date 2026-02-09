#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Sync project assets from:
  content/projects/<category>/<slug>/assets/*
to:
  public/projects/<category>/<slug>/*

Usage (run from repo root):
  python scripts/sync_public_assets.py
  python scripts/sync_public_assets.py --dry-run
  python scripts/sync_public_assets.py --clean
  python scripts/sync_public_assets.py --src content/projects --dst public/projects

Notes:
- Default: incremental copy (only when changed).
- --clean: mirror mode per project folder (deletes extra files in dst that don't exist in src).
"""

import argparse
import os
import shutil
from pathlib import Path
from typing import Set, Tuple


def file_signature(p: Path) -> Tuple[int, int]:
    """Return (size, mtime_ns) signature."""
    st = p.stat()
    return (st.st_size, getattr(st, "st_mtime_ns", int(st.st_mtime * 1e9)))


def should_copy(src: Path, dst: Path) -> bool:
    if not dst.exists():
        return True
    try:
        return file_signature(src) != file_signature(dst)
    except OSError:
        return True


def ensure_dir(p: Path, dry_run: bool):
    if dry_run:
        return
    p.mkdir(parents=True, exist_ok=True)


def copy_file(src: Path, dst: Path, dry_run: bool):
    ensure_dir(dst.parent, dry_run)
    if dry_run:
        print(f"[DRY] COPY  {src}  ->  {dst}")
        return
    shutil.copy2(src, dst)
    print(f"[OK]  COPY  {src}  ->  {dst}")


def delete_path(p: Path, dry_run: bool):
    if dry_run:
        print(f"[DRY] DELETE {p}")
        return
    if p.is_dir():
        shutil.rmtree(p)
    else:
        p.unlink()
    print(f"[OK]  DELETE {p}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="content/projects", help="Source projects root (default: content/projects)")
    ap.add_argument("--dst", default="public/projects", help="Destination public root (default: public/projects)")
    ap.add_argument("--dry-run", action="store_true", help="Print actions without changing files")
    ap.add_argument("--clean", action="store_true", help="Mirror sync: delete extra files in dst per project folder")
    args = ap.parse_args()

    repo_root = Path.cwd()
    src_root = (repo_root / args.src).resolve()
    dst_root = (repo_root / args.dst).resolve()

    if not src_root.exists():
        raise SystemExit(f"[ERR] Source root not found: {src_root}")
    # dst_root may not exist yet — create when needed.

    # Find all assets directories under content/projects/<category>/<slug>/assets
    assets_dirs = []
    for category_dir in src_root.iterdir():
        if not category_dir.is_dir():
            continue
        for project_dir in category_dir.iterdir():
            if not project_dir.is_dir():
                continue
            assets_dir = project_dir / "assets"
            if assets_dir.is_dir():
                assets_dirs.append((category_dir.name, project_dir.name, assets_dir))

    if not assets_dirs:
        print("[WARN] No assets folders found under:", src_root)
        return

    total_copied = 0
    total_skipped = 0
    total_deleted = 0

    for category, slug, assets_dir in assets_dirs:
        dst_project_dir = dst_root / category / slug
        ensure_dir(dst_project_dir, args.dry_run)

        # Collect source files (relative paths)
        src_files: Set[Path] = set()
        for root, _, files in os.walk(assets_dir):
            root_p = Path(root)
            for f in files:
                src_p = root_p / f
                rel = src_p.relative_to(assets_dir)  # keep subfolders if any
                src_files.add(rel)
                dst_p = dst_project_dir / rel
                if should_copy(src_p, dst_p):
                    copy_file(src_p, dst_p, args.dry_run)
                    total_copied += 1
                else:
                    total_skipped += 1

        # Clean mode: delete extra files in dst project folder
        if args.clean and dst_project_dir.exists():
            dst_files: Set[Path] = set()
            for root, _, files in os.walk(dst_project_dir):
                root_p = Path(root)
                for f in files:
                    dst_p = root_p / f
                    rel = dst_p.relative_to(dst_project_dir)
                    dst_files.add(rel)

            extras = sorted(dst_files - src_files)
            for rel in extras:
                delete_path(dst_project_dir / rel, args.dry_run)
                total_deleted += 1

    print("\n==== Summary ====")
    print(f"Source: {src_root}")
    print(f"Dest:   {dst_root}")
    print(f"Copied:   {total_copied}")
    print(f"Skipped:  {total_skipped}")
    if args.clean:
        print(f"Deleted:  {total_deleted}")
    print("Done.")


if __name__ == "__main__":
    main()
