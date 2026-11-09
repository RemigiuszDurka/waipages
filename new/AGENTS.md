# Agent instructions: AI Data Science Laboratory

You are developing a course showcase of **6** standalone interactive studies (original project numbers 01, 02, 04, 06, 11 and 12). User expectations: impressive but elegant design, scientifically correct data analysis, responsive design, *actual* dynamic interaction, documented datasets, accessibility, reproducibility. Core process: **Discover → Analyze → Present**. Do NOT use the term storytelling as a project-stage name.

## Non-negotiable
- Never invent data, numerical discoveries, scientific sources, exoplanet attributes, rankings, or science-fiction references.
- Keep all 6 remaining labs functional and independent. Do not clone one generic chart into every lab. Include a visual signature tailored to data.
- Use a GitHub Pages-compatible static architecture by default. A lightweight local build is acceptable but avoid unnecessary services.
- Histories and source dates should be explicit; avoid 'live' unless it is a live API with clear loading/error behavior.
- Provide keyboard-accessible controls, reduced-motion fallback, responsive UI, and informative loading/error states.
- Data access and derived calculations must be traceable to files and source citations. Prefer SVG/WebGL/canvas charts that reflect real data.
- 11: nearest 100 *stellar objects in source selection* from RECONS-derived catalog; convert RA/DEC/radius to XYZ consistently; distinguish binaries and brown dwarfs. Cite SF media with link + explanation. No fake science-fiction matches.
- 12: Madagascar, prefer official World Bank API; distinguish Global Forest Watch canopy loss from FAO 'forest area' metrics. GFW warns of a pre/post-2015 methodology change; do not interpret that discontinuity as a physical trend.
- Keep this repository on the single `main` branch. Commit and push completed changes to `main`; do not create extra branches or force-push. Do not modify other user repositories.

## Before delivery
Run `python tools/audit_data.py`, `node tests/smoke.mjs` and browser smoke tests at responsive widths (375, 768, 1440). Verify that no charts use placeholders or simulated values labeled as observations. Fix console errors.

## Where to work
- assets/: common design, visualizations, project metadata
- projects/01, 02, 04, 06, 11, 12/: one HTML page, README and data files per lab
- tools/: validation and analysis utilities

## Prioritize
1. Reliability/data correctness
2. Discover/Analyze/Present completeness
3. Distinctive visualization and high-impact, smooth UI
4. Accessibility/performance
5. Polish and technical documentation
