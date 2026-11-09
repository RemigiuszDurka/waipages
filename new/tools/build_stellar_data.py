"""Build Project 11's standalone, file://-compatible data module from source files."""
from pathlib import Path
import csv
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "projects" / "11-stellar-neighborhood" / "data"

with (DATA / "recons_top100_nearest_stars.csv").open(encoding="utf-8-sig", newline="") as source:
    catalog = list(csv.DictReader(source))
works = json.loads((DATA / "works.json").read_text(encoding="utf-8"))
payload = {"catalog": catalog, "media": works}
out = DATA / "stellar-data.js"
generated = (
    "/* Generated from the adjacent CSV and JSON by tools/build_stellar_data.py. */\n"
    + "window.STELLAR_SOURCE = "
    + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    + ";\n"
)
if "--check" in sys.argv:
    if not out.exists() or out.read_text(encoding="utf-8") != generated:
        raise SystemExit("Project 11 data module is stale; run python tools/build_stellar_data.py")
    print("Project 11 data module matches the CSV and book index.")
    raise SystemExit(0)
out.write_text(generated, encoding="utf-8")
print(f"Wrote {out.relative_to(ROOT)}: {len(catalog)} catalog rows, {len(works['works'])} works")
