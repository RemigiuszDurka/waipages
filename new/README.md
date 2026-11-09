# AI Data Science Laboratory — 6 interactive studies

**Discover → Analyze → Present.**

An experimental collection of six independently runnable, data-backed visual laboratories for a prompt-engineering course.

> **Status:** Private GitLab repository with a GitLab Pages build on `main`. These are educational studies, not peer-reviewed scientific papers.

## The six projects

| # | Lab | Research focus | Source |
|---|---|---|---|
| 01 | [EXOPLANET ATLAS](projects/01-exoplanet-atlas/) | Where, when, and how have scientists discovered exoplanets? | See lab README |
| 02 | [TECTONIC MEMORY](projects/02-earthquake-atlas/) | What can 23,412 historical earthquake records reveal, and where do their limits begin? | See lab README |
| 04 | [HUMAN FUTURES](projects/04-human-futures/) | How have fertility and life expectancy changed across countries? | See lab README |
| 06 | [MIGRATION PATHWAYS](projects/06-bird-migration/) | What do GPS-tracked bird migration paths reveal? | See lab README |
| 11 | [NEAR STARS / DISTANT STORIES](projects/11-stellar-neighborhood/) | How do nearby catalog objects connect to documented books, films and television? | See lab README |
| 12 | [MADAGASCAR OBSERVATORY](projects/12-madagascar-observatory/) | How have forests, people, and access to services changed in Madagascar? | See lab README |

## Run locally

```bash
git clone https://gitlab.com/vizja_education/dashboard.git
cd dashboard
python -m http.server 8000
```

Open http://localhost:8000/ . The home page links directly to each study's `index.html`, including when JavaScript is disabled. You can also open an individual lab's `index.html` directly: its local data bundle avoids the browser's `file://` restrictions. Projects 02 and 11 have independent data modules and no charting CDN; Projects 04 and 06 still require Plotly's pinned CDN.

All charts show historical samples. Datasets have varied periods; they are *not* automatically current. Source, temporal coverage and caveats are listed in each project's README.

## Reproduce

Run `python tools/audit_data.py` to produce a provenance/quality report for committed CSV/JSON datasets. Refresh Madagascar's official World Bank snapshot with `python tools/update_world_bank.py` when needed; review the resulting dated data diff. After changing any dataset, run `python tools/build_local_data.py` to rebuild the shared direct-open bundle. For Project 02, run `python tools/build_quake_data.py`; for Project 11, run `python tools/build_stellar_data.py`. `node tests/validate-data.mjs` checks the shared bundle against its sources; both independent modules have a `--check` build option. All numerical visualizations are computed from data at render time. No fabricated points or fake AI conclusions.

## Development

See [AGENTS.md](AGENTS.md) for project requirements. Run `node tests/smoke.mjs`, `node tests/validate-data.mjs`, and `node tests/browser-smoke.mjs` before publishing changes. The browser test uses an installed Chrome or Edge browser; set `CHROME_PATH` if it is elsewhere.

## GitLab Pages

The `publish-site` job in [`.gitlab-ci.yml`](.gitlab-ci.yml) publishes `index.html`, `assets/`, and `projects/` from `main`. Repository tools, tests, and this README stay outside the Pages artifact. The repository is private; Pages visibility is controlled separately under GitLab's project settings. Published HTML, JavaScript, and data files are readable by site visitors.

## Licensing & provenance

Code in this repository is a teaching prototype. Original upstream datasets have their own terms; read each project's README before republishing or reusing. Scientific source records are mirrored for reproducibility; dataset ownership remains with original creators. The RECONS-derived star list is a historical selection, not a modern complete Gaia DR3 nearest-star census. Links for fictional references identify fiction, not astrophysical facts.
