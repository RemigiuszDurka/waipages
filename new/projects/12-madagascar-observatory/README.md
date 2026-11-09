# Madagascar, Measured — Laboratory 12

**Discover → Analyze → Present.** A standalone, static study of five national World Bank indicator histories for Madagascar. Open [index.html](index.html) directly or serve the repository with `python -m http.server 8000`. The analysis and SVG graphics use local files only; no chart CDN or application service is required.

## Sources and scope

- [World Bank Open Data API](https://api.worldbank.org/v2/country/MDG?format=json), country code `MDG`, retrieved **18 October 2026** and committed as [data/world-bank-mdg.json](data/world-bank-mdg.json). Every series stores its direct API URL, reported observation year and value. [tools/update_world_bank.py](../../tools/update_world_bank.py) refreshes the snapshot. The browser mirror [data/madagascar-data.js](data/madagascar-data.js) is generated deterministically by [tools/build_madagascar_data.py](../../tools/build_madagascar_data.py) so the page also works from `file://`.
- Indicators: `SP.DYN.LE00.IN` life expectancy at birth, `SP.POP.TOTL` population, `AG.LND.FRST.ZS` forest area as a percentage of land area, `EG.ELC.ACCS.ZS` access to electricity as a percentage of population, and `NY.GDP.PCAP.CD` GDP per capita in **current** US dollars. The [World Bank forest indicator](https://data.worldbank.org/indicator/AG.LND.FRST.ZS?locations=MG) attributes its source to FAOSTAT/FAO.
- Island outline: [data/madagascar.geo.json](data/madagascar.geo.json), derived from [johan/world.geo.json](https://github.com/johan/world.geo.json). It is a location cue only; all plotted measurements are national, not regional.

The five series contain **265 non-null observations** in total. Population and current-dollar GDP per capita extend to 2025 in this snapshot; life expectancy, forest area and electricity access end in 2024. Forest area starts in 1990 and electricity access in 1992. Missing years are never filled or presented as observations.

## Calculations behind the views

1. **Discover.** Coverage bars encode the first and last actual observation years within 1960–2025. The source ledger exposes the count of observations and links each indicator directly to its API endpoint. The small table reproduces selected source-year values.
2. **Electricity access versus people without access, 1992–2024.** For each year with both reported population and access rate, calculate `estimated_without = population × (1 − access_percent / 100)`. The access estimate rises from **9.2% to 42.5%**, a **33.3 percentage-point** increase. The derived count without access rises from approximately **11.6 million to 18.4 million**, or about **6.8 million**. This is an arithmetic combination of two national estimates, not a household count; the source does not give a joint uncertainty interval. The two charts retain different physical units and share a selected-year cursor.
3. **Forest share, population and a relative proxy, 1990–2024.** With 1990 = 100, calculate `forest_index = forest_share_y / forest_share_1990 × 100` and `population_index = population_y / population_1990 × 100`. The third line is `forest_index / population_index × 100`. It is a **relative forest-area-per-resident proxy**, assuming a stable national land-area denominator, not a measured local area or a direct tree-cover statistic. In the snapshot, forest area falls from **23.5% to 17.3%** of land area, population reaches **265.1** on its 1990 index, and the relative proxy reaches **27.7**. These simultaneous changes do not establish causation.
4. **Present.** Five selectable histories use their own units. The selected-year board reports the latest *actual* observation at or before the chosen year and names that observation year. The analysis year spans 1992–2024, where the derived comparisons overlap; the independent observatory control extends through 2025 to inspect the population and GDP observations. The charts connect observed annual points but do not generate missing values or forecasts.

## Forest-data distinction and limits

World Bank/FAO **forest area** and Global Forest Watch **tree-cover loss** are different measures. [GFW's Madagascar dashboard](https://www.globalforestwatch.org/dashboards/country/MDG/) warns that its loss method underreports years before 2015 and advises against comparing the pre/post-2015 series as a physical change. This lab does **not** plot or merge GFW loss values with the FAO/WDI forest-area series.

The five World Bank series are national aggregates. The outline cannot locate change within Madagascar. GDP per capita in current US dollars is affected by prices and exchange rates. These descriptive comparisons cannot identify causes, estimate ecological risk, or forecast future values. The hero's animated outline is decorative and is not a geographic heat map.

## Reproduce and verify

At the repository root run `python tools/build_madagascar_data.py --check`, `python tools/audit_data.py`, `node tests/madagascar-analysis.mjs`, `node tests/validate-data.mjs`, and `node tests/smoke.mjs`. Browser checks should cover 375, 768 and 1440 px, keyboard controls, reduced motion and direct-file loading.
