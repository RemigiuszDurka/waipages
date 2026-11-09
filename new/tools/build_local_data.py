#!/usr/bin/env python3
"""Build the static data script used when HTML pages open through file://.

The CSV and JSON files in projects/ remain the authoritative snapshots.
Run from the repository root: python tools/build_local_data.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "projects"
TARGET = ROOT / "assets/local-data.js"


def main():
    data = {}
    for path in sorted(PROJECTS.glob("*/data/*")):
        if path.suffix not in (".csv", ".json"):
            continue
        key = path.relative_to(PROJECTS).as_posix()
        data[key] = path.read_bytes().decode("utf-8-sig")
    if not data:
        raise RuntimeError("No project data files found")
    TARGET.write_text(
        "// Generated from projects/*/data/* by tools/build_local_data.py.\n"
        "window.LOCAL_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Bundled {len(data)} source files into {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
