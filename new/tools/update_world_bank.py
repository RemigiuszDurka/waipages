#!/usr/bin/env python3
"""Refresh the committed Madagascar World Bank indicator snapshot.

Run from the repository root: python tools/update_world_bank.py
Requires network access; uses only the Python standard library.
"""
import datetime
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "projects/12-madagascar-observatory/data/world-bank-mdg.json"
CODES = (
    "SP.DYN.LE00.IN",  # life expectancy
    "SP.POP.TOTL",  # population
    "AG.LND.FRST.ZS",  # FAO/WDI forest area
    "EG.ELC.ACCS.ZS",  # electricity access
    "NY.GDP.PCAP.CD",  # current-dollar GDP per capita
)


def main():
    snapshot = {
        "retrieved": datetime.date.today().isoformat(),
        "source": "World Bank Open Data API",
        "country": "MDG",
        "indicators": {},
    }
    for code in CODES:
        url = f"https://api.worldbank.org/v2/country/MDG/indicator/{code}?format=json&per_page=100"
        with urlopen(url, timeout=30) as response:
            payload = json.load(response)
        if not isinstance(payload, list) or len(payload) < 2 or not isinstance(payload[1], list):
            raise ValueError(f"Unexpected World Bank response for {code}")
        rows = payload[1]
        if not rows:
            raise ValueError(f"No World Bank rows for {code}")
        points = sorted(
            ({"year": int(row["date"]), "value": row["value"]}
             for row in rows if row.get("value") is not None),
            key=lambda point: point["year"],
        )
        if not points or len({point["year"] for point in points}) != len(points):
            raise ValueError(f"Empty or duplicate-year series for {code}")
        snapshot["indicators"][code] = {
            "url": url,
            "name": rows[0]["indicator"]["value"],
            "points": points,
        }
        print(f"{code}: {len(points)} observations, {points[0]['year']}–{points[-1]['year']}")
    TARGET.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
