#!/usr/bin/env python3
"""Generate the file://-compatible mirror for laboratory 12.

Run ``python tools/build_madagascar_data.py --check`` to verify that the
committed browser data exactly matches the cited JSON source files.
"""

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "projects/12-madagascar-observatory/data"
TARGET = DATA / "madagascar-data.js"


def build():
    snapshot = json.loads((DATA / "world-bank-mdg.json").read_text(encoding="utf-8"))
    island = json.loads((DATA / "madagascar.geo.json").read_text(encoding="utf-8"))
    if snapshot.get("country") != "MDG" or island.get("features", [{}])[0].get("id") != "MDG":
        raise ValueError("Unexpected Madagascar source structure")
    payload = {"snapshot": snapshot, "island": island}
    return "/* Generated from world-bank-mdg.json and madagascar.geo.json. */\nwindow.MDG_DATA=" + json.dumps(
        payload, ensure_ascii=False, separators=(",", ":")
    ) + ";\n"


def main():
    generated = build()
    if "--check" in sys.argv:
        if not TARGET.exists() or TARGET.read_text(encoding="utf-8") != generated:
            raise SystemExit("Madagascar browser mirror is out of date. Run python tools/build_madagascar_data.py")
        print("Project 12 browser snapshot is current.")
    else:
        TARGET.write_text(generated, encoding="utf-8")
        print(f"Saved {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
