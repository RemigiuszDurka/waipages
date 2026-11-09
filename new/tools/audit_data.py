#!/usr/bin/env python3
"""Audit local research snapshots. Only Python stdlib required."""
import csv, json, pathlib, statistics
ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
    total=0
    for p in sorted((ROOT/"projects").glob("*/data/*")):
        if p.suffix not in (".csv",".json"):
            continue
        try:
            if p.suffix==".csv":
                with p.open(encoding="utf-8-sig",newline="") as f: rows=list(csv.DictReader(f))
            else:
                obj=json.loads(p.read_text(encoding="utf-8"))
                rows=obj if isinstance(obj,list) else [obj]
            count=len(rows)
            keys=list(rows[0]) if rows and isinstance(rows[0],dict) else []
            blanks={k:sum(str(row.get(k,"")).strip() in ("","None","null") for row in rows if isinstance(row,dict)) for k in keys}
            missing=sorted(blanks.items(),key=lambda x:-x[1])[:4]
            total+=count
            print(f"{p.relative_to(ROOT)}: {count:,} records; {len(keys)} columns; most-missing {missing}")
        except Exception as e:
            print(f"ERROR {p.relative_to(ROOT)}: {e}")
            raise
    print(f"Audited {total:,} records across local data files.")
if __name__=="__main__":main()
