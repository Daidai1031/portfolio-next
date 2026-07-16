#!/usr/bin/env python3
"""
migrate_categories.py (v2 — safe to re-run / safe on partially-migrated repos)
-------------------------------------------------------------------------
Reorganizes portfolio-next's project categories into:
    ai-software, hardware-product, creative-media, architecture-fabrication
(that display order is the single source of truth: CATEGORY_ORDER below).

Unlike v1, this version does NOT assume where a project currently lives.
For every slug it searches ALL known category folders (old ones AND any of
the new ones) to find where it currently sits, then moves it to the correct
target if it isn't already there. The 5 hardcoded-reference files are patched
by locating each variable declaration with regex and rewriting the whole
block from CATEGORY_ORDER, rather than string-matching an assumed "before"
state — so running this multiple times, or on top of a previous partial
run, converges to the same correct result instead of silently skipping.

Run from the REPO ROOT of portfolio-next:
    python3 migrate_categories.py

teaguard is NOT included — it doesn't exist in the repo yet. Create it
directly under content/projects/ai-software/teaguard/ (category already
correct, no migration needed).
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Single source of truth for both grouping AND display order.
CATEGORY_ORDER = ["ai-software", "hardware-product", "creative-media", "architecture-fabrication"]

CATEGORY_DISPLAY_NAME = {
    "ai-software": "AI & Software",
    "hardware-product": "Hardware & Product",
    "creative-media": "Creative Media",
    "architecture-fabrication": "Architecture & Fabrication",
}

CATEGORY_PAGE_DESCRIPTION = {
    "ai-software": "Software-first systems — detection pipelines, recommender logic, and interface systems — where the core work is designing how a system reasons and decides.",
    "hardware-product": "Physical devices that pair sensors, microcontrollers, and language models to read context and respond to it in real time.",
    "creative-media": "Experiments in spatial storytelling, AR-augmented public space, and critical media that reframe how a place or system is understood.",
    "architecture-fabrication": "Spatial design and digital fabrication projects that push the boundaries of traditional making through computational and robotic construction.",
}

CATEGORY_MDX_TITLE = {
    "ai-software": "AI & Software Systems",
    "hardware-product": "Creative Hardware & Product Design",
    "creative-media": "Creative Media",
    "architecture-fabrication": "Architecture & Digital Fabrication",
}

CATEGORY_MDX_BODY = {
    "ai-software": (
        "Software-first projects — detection pipelines, recommender logic, and "
        "interface systems — where the core work is designing how a system "
        "reasons, scores, and decides, not what it looks like on a screen."
    ),
    "hardware-product": (
        "Physical devices built to feel like finished products, not demos — "
        "wearables and ambient objects that pair sensors, microcontrollers, and "
        "language models to read context and respond to it in real time."
    ),
    "creative-media": (
        "Experiments that live outside a single medium — spatial storytelling, "
        "AR-augmented public space, robotic fabrication as material narrative, "
        "and critical media work that use data and form to reframe how a place "
        "or a system is understood."
    ),
    "architecture-fabrication": (
        "These projects trace a line from architectural design thinking to the "
        "machines and materials that build it — parametric structures, robotic "
        "fabrication workflows, and responsive material systems that treat "
        "construction as a computational problem rather than a drafting exercise."
    ),
}

# slug -> target category
SLUG_TARGET = {
    "huanshi-east-city-renewal":         "architecture-fabrication",
    "kindergarten-spatial-design":       "architecture-fabrication",
    "river-life-museum-xiguan":          "architecture-fabrication",
    "3d-printed-bamboo-structure":       "architecture-fabrication",
    "dupont-paper-plywood-installation": "architecture-fabrication",

    "prompt":                            "hardware-product",
    "geomelody":                         "hardware-product",
    "socratidesk":                       "hardware-product",
    "subway-telltale":                   "hardware-product",
    "adaptive-tension-structure":        "hardware-product",  # Proxemic Fibers

    "ceta-prototype":                    "ai-software",

    "ironic-shaxi":                      "creative-media",
    "interactive-pocket-parks":          "creative-media",
    "urban-systems-storymap":            "creative-media",
    "encoded-elevation":                 "creative-media",
    "camino-quest-board-game":           "creative-media",
}

# Every folder name a project could conceivably currently be sitting in —
# the 4 original categories plus the 4 new ones — so re-runs and partial
# migrations are found regardless of current state.
OLD_CATEGORIES = ["architecture", "fabrication", "hci", "urban-interaction"]
ALL_SEARCH_CATEGORIES = OLD_CATEGORIES + CATEGORY_ORDER


def log(msg):
    print(f"[migrate] {msg}")


def move_project_folders():
    for slug, new_cat in SLUG_TARGET.items():
        for base in ("content/projects", "public/projects"):
            dst = ROOT / base / new_cat / slug
            if dst.exists():
                log(f"  already in place: {dst.relative_to(ROOT)}")
                continue
            src = None
            for cat in ALL_SEARCH_CATEGORIES:
                candidate = ROOT / base / cat / slug
                if candidate.exists():
                    src = candidate
                    break
            if src is None:
                log(f"  SKIP (not found anywhere): {base}/*/{slug}")
                continue
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
            log(f"  moved {src.relative_to(ROOT)} -> {dst.relative_to(ROOT)}")


def update_meta_json_categories():
    for slug, new_cat in SLUG_TARGET.items():
        meta_path = ROOT / "content" / "projects" / new_cat / slug / "meta.json"
        if not meta_path.exists():
            log(f"  SKIP (no meta.json at expected location): {meta_path.relative_to(ROOT)}")
            continue
        data = json.loads(meta_path.read_text(encoding="utf-8"))
        old_value = data.get("category")
        data["category"] = new_cat
        meta_path.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        if old_value != new_cat:
            log(f"  {slug}: category '{old_value}' -> '{new_cat}'")
        else:
            log(f"  {slug}: category already '{new_cat}'")


def remove_empty_old_category_dirs():
    for base in ("content/projects", "public/projects"):
        for old_cat in OLD_CATEGORIES:
            d = ROOT / base / old_cat
            if d.exists() and not any(d.iterdir()):
                d.rmdir()
                log(f"  removed empty dir {d.relative_to(ROOT)}")
            elif d.exists():
                remaining = [p.name for p in d.iterdir()]
                log(f"  WARNING: {d.relative_to(ROOT)} not empty, left in place: {remaining}")


def rebuild_category_pages():
    categories_dir = ROOT / "content" / "categories"
    for old_cat in OLD_CATEGORIES:
        old_dir = categories_dir / old_cat
        if old_dir.exists():
            shutil.rmtree(old_dir)
            log(f"  removed old category page dir {old_dir.relative_to(ROOT)}")

    for slug in CATEGORY_ORDER:
        new_dir = categories_dir / slug
        new_dir.mkdir(parents=True, exist_ok=True)
        mdx = f"---\ntitle: {CATEGORY_MDX_TITLE[slug]}\nslug: {slug}\n---\n\n{CATEGORY_MDX_BODY[slug]}\n"
        (new_dir / "index.mdx").write_text(mdx, encoding="utf-8")
        log(f"  wrote {(new_dir / 'index.mdx').relative_to(ROOT)}")


def replace_block(path: Path, pattern: str, build_replacement, label: str):
    """Find `pattern` (regex, DOTALL) in `path` and replace the whole match
    with build_replacement(match). Idempotent: works no matter what the
    current matched content is, as long as the surrounding markers exist."""
    if not path.exists():
        log(f"  SKIP (file not found): {path.relative_to(ROOT)}")
        return
    text = path.read_text(encoding="utf-8")
    m = re.search(pattern, text, flags=re.DOTALL)
    if not m:
        log(f"  WARNING: could not locate '{label}' in {path.relative_to(ROOT)} — left untouched")
        return
    new_text = text[: m.start()] + build_replacement(m) + text[m.end():]
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        log(f"  patched '{label}' in {path.relative_to(ROOT)}")
    else:
        log(f"  '{label}' in {path.relative_to(ROOT)} already correct")


def patch_hardcoded_references():
    # 1. scripts/build_projects_index.py
    replace_block(
        ROOT / "scripts" / "build_projects_index.py",
        r"CATEGORIES = \[.*?\]",
        lambda m: "CATEGORIES = [" + ", ".join(f'"{c}"' for c in CATEGORY_ORDER) + "]",
        "CATEGORIES list",
    )

    # 2. app/projects/page.tsx — categoryOrder array
    replace_block(
        ROOT / "app" / "projects" / "page.tsx",
        r"const categoryOrder = \[.*?\];",
        lambda m: "const categoryOrder = [" + ", ".join(f'"{c}"' for c in CATEGORY_ORDER) + "];",
        "categoryOrder",
    )
    # app/projects/page.tsx — categoryNames object
    replace_block(
        ROOT / "app" / "projects" / "page.tsx",
        r"const categoryNames: Record<string, string> = \{.*?\n\};",
        lambda m: "const categoryNames: Record<string, string> = {\n" + "".join(
            f'  "{c}": "{CATEGORY_DISPLAY_NAME[c]}",\n' for c in CATEGORY_ORDER
        ) + "};",
        "categoryNames",
    )

    # 3. app/projects/[category]/page.tsx — categoryInfo object
    def build_category_info(_m):
        body = "const categoryInfo = {\n"
        for c in CATEGORY_ORDER:
            body += (
                f"  '{c}': {{\n"
                f"    name: '{CATEGORY_DISPLAY_NAME[c]}',\n"
                f"    description: '{CATEGORY_PAGE_DESCRIPTION[c]}',\n"
                f"  }},\n"
            )
        body += "};"
        return body

    replace_block(
        ROOT / "app" / "projects" / "[category]" / "page.tsx",
        r"const categoryInfo = \{.*?\n\};",
        build_category_info,
        "categoryInfo",
    )

    # 4. components/RelatedProjects.tsx
    replace_block(
        ROOT / "components" / "RelatedProjects.tsx",
        r"const CATEGORY_DISPLAY_NAMES: Record<string, string> = \{.*?\n\};",
        lambda m: "const CATEGORY_DISPLAY_NAMES: Record<string, string> = {\n" + "".join(
            f"  '{c}': '{CATEGORY_DISPLAY_NAME[c]}',\n" for c in CATEGORY_ORDER
        ) + "};",
        "CATEGORY_DISPLAY_NAMES",
    )

    # 5a. app/page.tsx — categoryDisplayNames object
    replace_block(
        ROOT / "app" / "page.tsx",
        r"const categoryDisplayNames: Record<string, string> = \{.*?\n\};",
        lambda m: "const categoryDisplayNames: Record<string, string> = {\n" + "".join(
            f"  '{c}': '{CATEGORY_DISPLAY_NAME[c]}',\n" for c in CATEGORY_ORDER
        )[:-2] + "\n};",  # drop trailing comma on last line, matches original style
        "categoryDisplayNames",
    )
    # 5b. app/page.tsx — homepage "Areas of Focus" category cards array
    def build_cards(_m):
        lines = []
        for i, c in enumerate(CATEGORY_ORDER):
            comma = "," if i < len(CATEGORY_ORDER) - 1 else ""
            lines.append(
                f"                {{ name:'{CATEGORY_DISPLAY_NAME[c]}', slug:'{c}', "
                f"count:projects.filter(p=>p.category==='{c}').length }}{comma}"
            )
        return "\n".join(lines)

    replace_block(
        ROOT / "app" / "page.tsx",
        r"(?<=\{\[\n)                \{ name:.*?length \}(?:,)?(?:\n                \{ name:.*?length \}(?:,)?)*(?=\n\s*\]\.map\(\(cat, index\))",
        build_cards,
        "homepage category cards",
    )


def rebuild_index():
    script = ROOT / "scripts" / "build_projects_index.py"
    if not script.exists():
        log("  build_projects_index.py not found — skipping regeneration, run it manually.")
        return
    try:
        subprocess.run([sys.executable, str(script)], cwd=ROOT, check=True)
        log("  regenerated content/projects_index.json")
    except subprocess.CalledProcessError as e:
        log(f"  WARNING: build_projects_index.py failed ({e}). Run it manually after fixing the issue.")


def main():
    log("1/6 moving project folders (searches all known category locations)")
    move_project_folders()

    log("2/6 updating meta.json category fields")
    update_meta_json_categories()

    log("3/6 removing now-empty OLD category folders")
    remove_empty_old_category_dirs()

    log("4/6 rebuilding content/categories/*")
    rebuild_category_pages()

    log("5/6 patching hardcoded category references (regex, idempotent)")
    patch_hardcoded_references()

    log("6/6 regenerating content/projects_index.json")
    rebuild_index()

    log("Done. Review `git status` / `git diff` before committing.")
    log("Reminder: teaguard was NOT touched — create it directly under "
        "content/projects/ai-software/teaguard/ with category already set to 'ai-software'.")


if __name__ == "__main__":
    main()