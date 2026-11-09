# HUMAN FUTURES

**Discover → Analyze → Present** · Project 04

## Research question

How have fertility and life expectancy changed across countries?

## Original source

https://github.com/vega/vega-datasets/blob/main/data/gapminder.json

Gapminder-derived 1955–2005 historical snapshots.

## Analysis & presentation

Open [index.html](index.html) through a local HTTP server or GitHub Pages. The controls change the actual plotted source data; statistical summaries and visual encodings are computed in browser. Inspect `../../assets/lab.js` for data-cleaning, aggregation and visualization logic. Run `python ../../tools/audit_data.py` from repository root for dataset auditing.

## Limitations

Gapminder has imputed missing data and cautions against overly precise inference.

## Local run

```bash
# from repository root
python3 -m http.server 8000
# browse http://localhost:8000/projects/04-human-futures/
```
