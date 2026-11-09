# Near Stars / Distant Stories — Laboratory 11

This independent static atlas runs directly from `index.html` or over HTTP. It owns its CSS, JavaScript, Canvas projection and SVG analysis. The workflow is visibly **Discover → Analyze → Present**. It relates a historical nearby-object catalog to a documented, deliberately curated index of science-fiction books, films and television; fictional planets and events are never treated as observations.

## Discover: sources and inclusion

- Astronomy: [historical RECONS-derived CSV mirror](https://github.com/RyanLin5967/liftoff/blob/main/data/recons_top100_nearest_stars.csv), committed as [data/recons_top100_nearest_stars.csv](data/recons_top100_nearest_stars.csv). Its original export date is unspecified. It is not a current complete census, and its `top100` filename does not describe its actual **143 data rows**.
- Culture: [data/works.json](data/works.json), curated 18 October 2026. It contains **15 distinct works: 8 books, 4 films and 3 television entries**, with **17 documented work–system links** to **9 catalog IDs**. Each record supplies a year, medium, role, explanation and evidence URL. The 2021 *Project Hail Mary* novel and 2026 film are separate works sharing the same fictional premise. The *Star Trek / Vulcan* entry's 1991 year is the documented 40 Eridani A association, not the television premiere.
- All rows are represented. The Sun is the central zero-distance marker; the other **142 rows** have valid positive distance and parseable J2000 coordinates. Of these, **133 are stellar objects** (including white dwarfs) and **9 have L/T/Y prefixes and are brown dwarfs**. Brown dwarfs are plotted in purple and labeled separately. The 142 mapped objects have **103 distinct `cns_name` IDs** and extend to **21.38 light-years** in this file. No data are fabricated to reach an arbitrary object count.
- A catalog ID is used for grouping and media joins; it is not a full physical/dynamical system definition. Some historically associated components can have different IDs or near-identical coordinates.

## Analyze: transformations and comparisons

- Right ascension `hh mm ss` becomes degrees via `15 × (hh + mm/60 + ss/3600)`; signed declination `dd mm ss` becomes degrees. With both angles in radians and catalog distance `r` in light-years: `x = r cos δ cos α`, `y = r cos δ sin α`, `z = r sin δ`. Every mapped radius is verified against the source distance.
- The cumulative radius chart counts mapped non-Sun objects and distinct catalog IDs within each integer-light-year sphere. It describes this historical file, not spatial density of all nearby objects. The spectral chart counts recorded first letters; **98 of 133 stellar entries** have an M prefix, while L/T/Y remain separate.
- The crosswalk and chronology are generated from work–system links, not hand-entered plot values. One work linked to two systems yields one work and two links. Release years are used except for the explicitly explained 1991 *Star Trek / Vulcan* association. Recurrence describes this evidence index, not all of science fiction.
- **Time to Contact** compares one-way light travel (`r` years because 1 ly/year = `c`) with a straight-line constant-speed thought experiment at **17 km/s**, the approximate Voyager 1 speed relative to the Sun reported by [NASA's Voyager 1 mission page](https://science.nasa.gov/mission/voyager/voyager-1/). The formula is `r × 299,792.458 / 17` years. It ignores target motion, acceleration, deceleration, navigation and spacecraft lifetime. Voyager 1 is not on a course to these stars; the result is not a mission forecast.

## Present: interaction and limitations

The opening Canvas signal field names four systems present in the committed catalog (Proxima Centauri, Sirius, Tau Ceti and Barnard's Star) and reads their catalog distances directly from `stellar-data.js`. Its screen positions, emitter colors, pulse timing and spherical wavefronts are deliberately **schematic and hypothetical**. They are a visual metaphor for signals crossing space, not observations of extraterrestrial transmissions, measured emissions, or a time-to-contact calculation. The banner marks that distinction on screen. The animation pauses offscreen, when the tab is hidden, or when the visitor uses its pause control; reduced-motion users receive a static frame by default.

The Canvas renderer projects the source-derived 3D coordinates with yaw, pitch and perspective. The translucent wireframe sphere follows the selected radius. Drag or use arrow keys to orbit; scroll or use `+`/`-` to zoom. The selected system, sphere radius, spectral class, media layer and evidence-shelf medium filter update the map and details. Auto-rotation is opt-in and stops during manual drag; reduced-motion preference disables it. Controls are keyboard accessible.

Points do not depict true star diameters or luminosity. The sphere is a visual distance boundary, not an observed physical shell. J2000 positions do not account for later proper motion. The source has measurement uncertainties and does not establish planets or fictional destinations.

## Reproduce and verify

Run `python tools/build_stellar_data.py` from the repository root to compile the CSV and JSON into [data/stellar-data.js](data/stellar-data.js) for `file://` use. `python tools/build_stellar_data.py --check` confirms the committed bundle is current. Then run `python tools/audit_data.py`, `node tests/validate-data.mjs`, `node tests/stellar-analysis.mjs` and `node tests/smoke.mjs`. Browser-check widths 375, 768 and 1440 px, drag/keyboard controls, filters, evidence links and reduced-motion behavior.
