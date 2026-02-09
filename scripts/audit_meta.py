import json
from pathlib import Path

ROOT = Path.cwd()  # ✅ 强制以当前终端所在目录作为项目根目录
PROJECTS_DIR = ROOT / "content" / "projects"

REQUIRED_FIELDS = {
    "slug": str,
    "title": str,
    "subtitle": str,
    "category": str,
    "tags": list,
    "year": int,
    "location": str,
    "type": str,
    "role": list,
    "featured": bool,
    "order": int,
    "hero": str,
}

ALLOWED_CATEGORIES = {"architecture", "fabrication", "hci", "urban-interaction"}

def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return e

def check_project(project_dir: Path, category: str):
    issues = []
    meta_path = project_dir / "meta.json"
    mdx_path = project_dir / "index.mdx"
    assets_dir = project_dir / "assets"

    if not mdx_path.exists():
        issues.append("Missing index.mdx")

    if not meta_path.exists():
        issues.append("Missing meta.json")
        return issues

    data = load_json(meta_path)
    if isinstance(data, Exception):
        issues.append(f"meta.json invalid JSON: {data}")
        return issues

    for k, t in REQUIRED_FIELDS.items():
        if k not in data:
            issues.append(f"Missing field: {k}")
            continue
        if k == "year" and isinstance(data[k], str) and data[k].isdigit():
            continue
        if not isinstance(data[k], t):
            issues.append(f"Field type wrong: {k} expected {t.__name__}, got {type(data[k]).__name__}")

    folder_slug = project_dir.name
    if "slug" in data and data["slug"] != folder_slug:
        issues.append(f"slug mismatch: meta.slug='{data['slug']}' folder='{folder_slug}'")

    if category not in ALLOWED_CATEGORIES:
        issues.append(f"Unknown category folder: {category}")
    if "category" in data and data["category"] != category:
        issues.append(f"category mismatch: meta.category='{data['category']}' parent='{category}'")
    if "category" in data and data["category"] not in ALLOWED_CATEGORIES:
        issues.append(f"meta.category not allowed: {data['category']}")

    if not assets_dir.exists():
        issues.append("Missing assets/ directory")
    else:
        if "hero" in data:
            hero_path = assets_dir / data["hero"]
            if not hero_path.exists():
                issues.append(f"hero file missing: assets/{data['hero']}")
        for p in assets_dir.glob("*"):
            if p.is_file() and "galleray" in p.name.lower():
                issues.append(f"typo asset name: '{p.name}' (use 'gallery-')")

    return issues

def main():
    print("=== audit_meta.py ===")
    print("ROOT =", ROOT)
    print("PROJECTS_DIR =", PROJECTS_DIR)
    print("PROJECTS_DIR exists:", PROJECTS_DIR.exists())
    if PROJECTS_DIR.exists():
        cats = [p.name for p in PROJECTS_DIR.iterdir() if p.is_dir()]
        print("Categories found:", cats)

    if not PROJECTS_DIR.exists():
        print(f"ERROR: {PROJECTS_DIR} not found. Run this script from project root.")
        return

    issues_count = 0
    project_count = 0

    for category_dir in sorted([p for p in PROJECTS_DIR.iterdir() if p.is_dir()]):
        category = category_dir.name
        for project_dir in sorted([p for p in category_dir.iterdir() if p.is_dir()]):
            project_count += 1
            issues = check_project(project_dir, category)
            if issues:
                issues_count += 1
                print(f"\n[{category}/{project_dir.name}]")
                for i in issues:
                    print("  -", i)

    if project_count == 0:
        print("No projects found under content/projects.")
    else:
        print(f"\n✅ Checked {project_count} projects, {issues_count} with issues.")

if __name__ == "__main__":
    main()
