# scripts/add_skills.py
"""
Adds/updates the `skills` array on every project's meta.json.
Edit SKILLS_MAP below and re-run anytime.

Run from project root:
  python scripts/add_skills.py
  python scripts/build_projects_index.py
  node scripts/update-project-images.js
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS_DIR = ROOT / "content" / "projects"

SKILLS_MAP = {
    # ── HCI ─────────────────────────────────────────────
    "hci/camino-quest-board-game": [
        "Machine Learning", "Computer Vision", "NLP",
        "Web Scraping", "Python", "Data Visualization", "Game Design",
    ],
    "hci/prompt": [
        "LLM Integration", "Edge AI", "NVIDIA Jetson", "Prompt Engineering",
        "Voice Interaction", "OCR", "Python", "FastAPI", "JavaScript",
        "Full-Stack", "Game Design",
    ],
    "hci/geomelody": [
        "LLM Integration", "Prompt Engineering", "CircuitPython", "ESP32",
        "Wearable Device", "Sensor Integration", "Next.js", "TypeScript",
        "FastAPI", "REST API", "OAuth", "Full-Stack",
    ],
    "hci/socratidesk": [
        "LLM Integration", "RAG", "Prompt Engineering", "Raspberry Pi",
        "Voice Interaction", "WebSocket", "FastAPI", "Python",
        "Full-Stack", "Physical Computing",
    ],
    "hci/subway-telltale": [
        "ESP32", "CircuitPython", "Physical Computing", "REST API",
        "Fusion 360", "3D Printing", "UI/UX Design",
    ],
    "hci/encoded-elevation": [
        "Robotic Fabrication", "Python", "Parametric Design",
        "Digital Fabrication", "Grasshopper",
    ],
    "hci/adaptive-tension-structure": [
        "Arduino", "Computer Vision", "Sensor Integration",
        "Physical Computing", "Parametric Design",
    ],
    "hci/ceta-prototype": [
        "Figma", "UI/UX Design", "Brand Identity", "Prototyping", "Adobe Suite",
    ],

    # ── Urban Interaction ───────────────────────────────
    "urban-interaction/ironic-shaxi": [
        "3D Scanning", "Animation", "Rhino", "Mental Canvas", "Adobe Suite",
    ],
    "urban-interaction/interactive-pocket-parks": [
        "Arduino", "Sensor Integration", "Physical Computing",
        "Unity", "AR", "3D Printing", "Data Analysis",
    ],
    "urban-interaction/urban-systems-storymap": [
        "ArcGIS", "GIS", "Spatial Analysis", "Data Visualization", "Data Analysis",
    ],

    # ── Architecture ────────────────────────────────────
    "architecture/huanshi-east-city-renewal": [
        "Rhino", "SketchUp", "AutoCAD", "Adobe Suite", "Spatial Analysis",
    ],
    "architecture/kindergarten-spatial-design": [
        "Rhino", "SketchUp", "AutoCAD", "Adobe Suite",
    ],
    "architecture/river-life-museum-xiguan": [
        "Rhino", "SketchUp", "AutoCAD", "Adobe Suite", "3D Scanning",
    ],

    # ── Fabrication ─────────────────────────────────────
    "fabrication/3d-printed-bamboo-structure": [
        "3D Printing", "3D Scanning", "Parametric Design",
        "Grasshopper", "Rhino", "Digital Fabrication",
    ],
    "fabrication/dupont-paper-plywood-installation": [
        "Digital Fabrication", "Laser Cutting",
    ],
}

def main() -> None:
    updated = 0
    missing = []
    for key, skills in SKILLS_MAP.items():
        meta_path = PROJECTS_DIR / key / "meta.json"
        if not meta_path.exists():
            missing.append(key)
            continue
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        meta["skills"] = skills
        meta_path.write_text(
            json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"✅ {key}: {len(skills)} skills")
        updated += 1

    print(f"\nUpdated {updated} projects.")
    if missing:
        print("⚠️  Missing (check folder names):")
        for m in missing:
            print(f"   - {m}")
    print("\nNext:")
    print("  python scripts/build_projects_index.py")
    print("  node scripts/update-project-images.js")

if __name__ == "__main__":
    main()