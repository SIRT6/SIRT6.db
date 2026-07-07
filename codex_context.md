# Codex Context: SIRT6.db Website Rebuild

## Project

This repository is the `SIRT6.db` data package and GitHub Pages website for a public SIRT6-targeted omics companion database.

The site is hosted from the `docs/` folder and is intended to run as a fully static client-side app. There is no backend/API/database server. Browser JavaScript reads static Parquet files from the repository data package.

## Source Brief

The rebuild instructions came from:

`/Users/Anya/Downloads/SIRT6db_website_rebuild_spec.md`

Important requirements from the spec:

- GitHub Pages serves from `docs/`.
- Use exactly seven tabs: Datasets, DE Results, Gene Explorer, Meta-analysis, Downloads, Methods, About.
- No separate Home tab; use a short welcome section above the tabs.
- Remove old mock-data behavior and random plots.
- Remove the QC Dashboard tab entirely.
- Read real Parquet files in the browser.
- Use lazy loading: load only `indices/experiment_stats.parquet` on page start; load DE, normalized-count, metadata, and meta files on demand.
- Use Plotly for Gene Explorer plots and meta-analysis forest plots.
- Gene Explorer label must use DESeq2 normalized counts, not TPM.
- Meta-analysis is KO-specific only.
- Methods/About prose is draft/placeholder for author approval.

## Files Changed

Created/rewrote:

- `docs/index.html`
- `docs/style.css`
- `docs/app.js`
- `codex_context.md`

The old `docs/index.html` was a single-file Bootstrap/DataTables mock draft with hardcoded fake data, random plots, and a QC Dashboard. It has been replaced with split markup/style/logic files.

## Current Website Implementation

### `docs/index.html`

Contains static markup only:

- Header/nav with 7 required tabs.
- Welcome section.
- Datasets table shell.
- DE Results controls and table shell.
- Gene Explorer controls and Plotly container.
- KO Meta-analysis controls/table/forest plot container.
- Downloads section.
- Methods draft placeholder.
- About/citation placeholder with dynamic database version.

### `docs/style.css`

Contains all layout and visual styling:

- Responsive nav.
- Welcome section.
- Tables and table toolbars.
- Form controls.
- Plot containers.
- Download groups.
- Mobile layout.

### `docs/app.js`

Main client-side app logic:

- Imports `hyparquet` from jsDelivr:
  `https://cdn.jsdelivr.net/npm/hyparquet/+esm`
- Uses exports confirmed from CDN:
  `asyncBufferFromUrl`, `parquetRead`
- Uses Plotly loaded from CDN in `index.html`.
- Reads Parquet with:
  `parquetRead({ file, rowFormat: "object", onComplete })`
- Caches loaded Parquet files in memory.
- Contains static file manifests for DE and expression files because GitHub Pages cannot list directories.
- Builds contrast labels from DE filenames.
- Loads `indices/experiment_stats.parquet` on startup for the Datasets tab.
- Loads `metadata/<organism>/experiments.parquet` on demand for source-study detail.
- Loads one DESeq2 contrast on demand for DE Results.
- Resolves gene symbols using `genes/<organism>_genes.parquet`.
- Loads one normalized-count file on demand for Gene Explorer.
- Plots Gene Explorer as Plotly box plots on log-scaled DESeq2 normalized counts.
- Loads `meta/meta_results_KO.parquet` on demand for the KO meta table.
- Loads `meta/input_for_meta.parquet` on first forest-plot request and filters by `human_gene_id`.
- Draws forest plots with per-study CI and pooled estimate.
- Builds real download links for:
  - DESeq2 files
  - normalized-count files
  - expression matrices
  - metadata
  - gene tables
  - ortholog map
  - meta files
  - clients/walkthroughs/root files
- Loads `SIRT6_db/version.txt` into About/footer.

## Data Path Decision

Important hosting issue:

If GitHub Pages serves only `docs/`, sibling repo folders like `SIRT6_db/` are not automatically same-origin assets at `https://sirt6.github.io/SIRT6.db/SIRT6_db/...`.

So `docs/app.js` uses:

- Local development:
  `../SIRT6_db/...`
- Published GitHub Pages:
  `https://raw.githubusercontent.com/SIRT6/SIRT6.db/main/SIRT6_db/...`

This is controlled by:

```js
const REPO_RAW_BASE = "https://raw.githubusercontent.com/SIRT6/SIRT6.db/main/SIRT6_db";
const LOCAL_BASE = "../SIRT6_db";
const DATA_BASE = location.hostname.endsWith("github.io") ? REPO_RAW_BASE : LOCAL_BASE;
```

Raw GitHub URL was checked for:

`https://raw.githubusercontent.com/SIRT6/SIRT6.db/main/SIRT6_db/indices/experiment_stats.parquet`

It returned `200 OK`, supports byte ranges, and has `access-control-allow-origin: *`.

## Validation Done

Local machine did not have Node/Deno/Bun/JSC, so JavaScript syntax could not be checked with a JS runtime.

Smoke checks completed:

- Started a local static server with `python3 -m http.server 8000`.
- Confirmed local HTTP `200 OK` for:
  - `/docs/index.html`
  - `/docs/app.js`
  - `/SIRT6_db/indices/experiment_stats.parquet`
- Confirmed the hyparquet CDN module exports the API used.
- Confirmed raw GitHub Parquet URL returns `200 OK`.
- Checked new files for non-ASCII characters and normalized them.

Note: `python3 -m compileall .` was attempted but failed because macOS tried to write bytecode cache outside the sandbox. This was not related to the website files.

## Current Git State at Time of This Context

Expected changed/untracked files:

- Modified: `docs/index.html`
- Untracked/new: `docs/app.js`
- Untracked/new: `docs/style.css`
- Untracked/new: `codex_context.md`

No commit was made.

## Known Caveats / Next Steps

- Run the site in a real browser and test actual Parquet loading/interactions end to end.
- If browser testing reveals hyparquet edge cases, consider switching to `parquet-wasm`, but current CDN API matched the implementation.
- Confirm GitHub Pages repository/branch setting is `main` branch, `docs/` folder.
- Confirm whether raw GitHub data loading is acceptable for production, or whether `SIRT6_db/` should be copied/symlinked into `docs/` for same-origin Pages hosting.
- Review Methods and About prose with Anna/author before publication.
- Add final contact, affiliations, manuscript citation, and Zenodo DOI when available.
- Consider adding table sorting/pagination later if needed. Current tables render/search the first 500 matching rows for responsiveness.
