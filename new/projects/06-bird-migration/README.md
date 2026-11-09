# MIGRATION PATHWAYS

**Discover → Analyze → Present** · Project 06

## Research question

What do GPS-tracked bird migration paths reveal?

## Original source

https://github.com/vega/vega-datasets/blob/main/data/bird-migration.csv

GPS-like tracked trajectories in published sample dataset.

## Analysis & presentation

Open [index.html](index.html) through a local HTTP server or GitHub Pages. The controls change the actual plotted source data; statistical summaries and visual encodings are computed in browser. Inspect `../../assets/lab.js` for data-cleaning, aggregation and visualization logic. Run `python ../../tools/audit_data.py` from repository root for dataset auditing.

## Limitations

Geodesic displacement between consecutive daily points is not full migration distance; sparse sampling limits speed estimates.

## Local run

```bash
# from repository root
python3 -m http.server 8000
# browse http://localhost:8000/projects/06-bird-migration/
```
