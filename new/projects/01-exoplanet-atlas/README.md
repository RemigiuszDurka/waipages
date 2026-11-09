# Other Worlds — Laboratory 01

An independent, static, scroll-led analysis of a historical exoplanet export. The visible workflow is **Discover → Analyze → Present**. The hero's transit and light curve are explicitly illustrative; they are not a plotted observation.

## Discover: source and selection

- Source: the committed [exoplanets.csv](data/exoplanets.csv), mirrored from [Jiaatong's third-party NASA Exoplanet Archive export](https://github.com/Jiaatong/nasa-exoplanets-dataset). The source contains **5,250 rows** and 13 columns, with reported discovery years **1992–2023**. Its exact export date is undocumented. It is neither a live feed nor a complete current census.
- All 5,250 rows enter year, method, and type counts. Rows with missing, nonpositive, or unrecognized-unit mass/radius values remain in those counts but are excluded from the mass–radius field.
- The five-row drawer displays original source radius value and unit from the committed file. Other views use the reproducible project-specific [browser bundle](data/exoplanets-data.js), generated from the CSV by [`tools/build_exoplanet_data.py`](../../tools/build_exoplanet_data.py). This avoids network fetch failures and works on GitHub Pages or from a local file.

## Analyze: calculations and interpretation

- The source labels **3,945 of 5,250** entries as Transit (**75.1%**). The annual record peak is **1,517 entries in 2016**; 2014 has **875**. These are archived discovery-year counts, not exoplanet occurrence rates. Changes in search programs, detection and reporting affect the series.
- The scroll scanner uses the exact annual counts (linear bar height), full method counts, and within-era type shares. Its two eras contain **414 rows through 2009** and **4,836 rows from 2010 through 2023**. Gas Giants make up **88.2%** of the earlier slice; Neptune-like and Super Earth labels together make up **69.7%** of the later slice. This is a changing discovered sample, not evidence that the underlying planet population changed.
- The method × type crosswalk counts every row. Cell percentages use the **method row total** as denominator; selecting a row or cell applies its filters to the field.
- For positive values with explicit units, `radius_earth = radius_multiplier × 11.21` if `radius_wrt = Jupiter`; `mass_earth = mass_multiplier × 317.83` if `mass_wrt = Jupiter`. Earth-unit values remain unchanged. These factors are from [NASA's Solar System table](https://science.nasa.gov/learn/basics-of-space-flight/chapter1-2/) and [NASA's Jupiter fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html). The bundle rounds converted Jupiter values to six decimal places. The field uses log axes and plots all **5,215** rows with a positive pair.
- **2,889 of those 5,215 plotted rows share an identical normalized radius–mass pair** with another row (pair equality after bundle conversion). The conspicuous narrow traces warrant caution: source properties may be rounded, estimated, or derived. The plot must not be used to assert that every point is an independent measurement or to infer a new physical law. The export does not include the provenance and uncertainty needed for that.

## Present: interaction and accessibility

The scroll scanner switches between annual counts, method totals and era composition. The crosswalk transfers a selected method/type to the interactive mass–radius field. The year range, method and source type filters recalculate all plotted points and the count. Hover or click a point for its name; focus the Canvas and use arrow keys to move through filtered records alphabetically. Named-world buttons give another keyboard route to individual records. Controls and table remain available when motion is reduced; the transit animation and transitions stop under `prefers-reduced-motion`.

No visual circle represents true physical size. The hero transit and light curve are illustrative. Colors encode **source-assigned type**, not atmospheric composition or habitability. The source's `planet_type` categories, masses and radii can be model-dependent; this project does not identify potentially habitable worlds or estimate their prevalence.

## Reproduce and verify

From the repository root, run `python tools/build_exoplanet_data.py --check`, `python tools/audit_data.py`, `node tests/validate-data.mjs`, and `node tests/smoke.mjs`. To regenerate the project bundle after editing the CSV, run `python tools/build_exoplanet_data.py`. Browser-check widths 375, 768 and 1440 px, the crosswalk, filters, named-world selection, keyboard point navigation and reduced-motion behavior.
