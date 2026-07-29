# SIRT6.db

A comprehensive database of SIRT6-targeted omics experiments.

SIRT6.db is a public resource for studying the transcriptional consequences of
SIRT6 perturbation in aging-related biology. It brings together bulk RNA-seq
data from SIRT6 knockout, overexpression, point-mutant, and heterozygous
experiments across six species. The repository provides study metadata,
expression matrices, differential-expression results, normalized counts, gene
annotations, one-to-one ortholog mappings, and a cross-species knockout
meta-analysis.

- **Website:** <https://sirt6.github.io/SIRT6.db/>
- **Repository:** <https://github.com/SIRT6/SIRT6.db>
- **Database version:** `0.0.2`

## Contents

SIRT6.db currently covers 29 RNA-seq studies and 349 samples:

| Species | Common name | Study-level expression matrices |
| --- | --- | ---: |
| *Homo sapiens* | Human | 6 |
| *Mus musculus* | Mouse | 18 |
| *Rattus norvegicus* | Rat | 1 |
| *Macaca fascicularis* | Crab-eating macaque | 1 |
| *Sus scrofa* | Pig | 1 |
| *Drosophila melanogaster* | Fruit fly | 2 |
| **Total** |  | **29** |

The data release includes:

- 29 study-level expression matrices;
- 54 differential-expression contrasts;
- 54 matching DESeq2-normalized count tables;
- sample, experiment, and sample-to-experiment metadata for all six species;
- species-specific gene ID-to-symbol tables;
- a one-to-one human ortholog map; and
- knockout meta-analysis results and study-level meta-analysis inputs.

## Explore the website

The browser interface provides several ways to work with the data:

- **Datasets** — browse source studies, organisms, genotypes, tissues or cell
  types, and sample counts.
- **DE Results** — inspect one differential-expression contrast at a time,
  search genes, and sort by log2 fold change, p-value, or FDR.
- **Gene Explorer** — compare DESeq2-normalized expression between perturbation
  and control groups on a logarithmic scale.
- **Meta-analysis** — browse conserved SIRT6 knockout signatures and draw
  per-gene forest plots.
- **Downloads** — download individual Parquet tables, clients, walkthroughs, or
  the complete repository.
- **Methods** — read a concise summary of preprocessing, differential
  expression, ortholog mapping, and cross-species meta-analysis.

The website is static: Parquet files are read directly in the browser with
hyparquet, and plots are rendered with Plotly.

## Download the database

Clone the complete repository:

```bash
git clone https://github.com/SIRT6/SIRT6.db.git
cd SIRT6.db
```

Individual files can also be downloaded from the
[Downloads tab](https://sirt6.github.io/SIRT6.db/#downloads).

## Repository structure

```text
SIRT6.db/
├── index.html                         # Website markup
├── app.js                             # Browser logic and data catalogue
├── style.css                          # Website styles
├── images/                            # Website icons and favicon
├── SIRT6_db/
│   ├── de/<species>/<study>/          # DE results and normalized counts
│   ├── expression/<species>/          # Study-level expression matrices
│   ├── genes/                         # Gene annotations and ortholog map
│   ├── indices/                       # Dataset and experiment indices
│   ├── meta/                          # Meta-analysis results and inputs
│   ├── metadata/<species>/            # Sample and experiment metadata
│   ├── utils/                         # R/Python clients and Conda environment
│   └── version.txt                    # Database release version
├── SIRT6_db_walkthrough_Python.ipynb
├── SIRT6_db_walkthrough_R.rmd
└── LICENSE
```

Species directories use lowercase Ensembl-style names such as
`homo_sapiens`, `mus_musculus`, and `drosophila_melanogaster`.

### Main data files

| Location | Description |
| --- | --- |
| `SIRT6_db/expression/<species>/<study>.parquet` | Study-level gene-expression matrix |
| `SIRT6_db/de/<species>/<study>/*_deseq2.parquet` | Per-contrast DESeq2 results |
| `SIRT6_db/de/<species>/<study>/*_normalized_counts.parquet` | Per-contrast DESeq2-normalized counts |
| `SIRT6_db/metadata/<species>/samples.parquet` | Sample metadata |
| `SIRT6_db/metadata/<species>/experiments.parquet` | Experiment metadata |
| `SIRT6_db/metadata/<species>/samples_to_experiment.parquet` | Sample-to-experiment mapping |
| `SIRT6_db/genes/<species>_genes.parquet` | Gene ID-to-symbol annotations |
| `SIRT6_db/genes/ortholog_map_1to1.parquet` | One-to-one human ortholog mapping |
| `SIRT6_db/meta/meta_results_KO.parquet` | Knockout meta-analysis summary |
| `SIRT6_db/meta/input_for_meta.parquet` | Study-level meta-analysis input |

## Installation

All necessary dependencies for both the Python and R clients could be installed as follows:

```bash
conda env create -f ./SIRT6_db/utils/environment.yml
```

Activate the environment:

```bash
conda activate sirt6db-env
```

The environment includes Python 3.12, pandas, NumPy, Scanpy, PyArrow, R 4.4,
Arrow, dplyr, R6, and SummarizedExperiment.

## Python client

The Python client loads expression, sample metadata, and gene annotations as
pandas DataFrames and can convert a loaded dataset to an AnnData object.

```python
import os
import sys

sys.path.insert(0, os.path.abspath("./SIRT6_db/utils"))
from python_client import SIRT6db

db = SIRT6db(db_path="./SIRT6_db")

print(db.version())
print(db.available_species())
print(db.list_experiments())

data = db.load_dataset(
    species="homo_sapiens",
    gse_id="GSE213425",
)

adata = db.get_anndata_object(data)
```

The client also provides `filter_low_expressed_genes()` for optional downstream
filtering. See
[`SIRT6_db_walkthrough_Python.ipynb`](SIRT6_db_walkthrough_Python.ipynb) for a
complete example.

## R client

The R client loads the same core tables and can convert a loaded dataset to a
`SummarizedExperiment`.

```r
source("SIRT6_db/utils/R_client.R")

db <- SIRT6db$new(db_path = "./SIRT6_db")

db$version()
db$available_species()
db$list_experiments()

data <- db$load_dataset(
  species = "homo_sapiens",
  gse_id = "GSE213425"
)

se <- db$get_summarized_experiment_object(data)
```

See [`SIRT6_db_walkthrough_R.rmd`](SIRT6_db_walkthrough_R.rmd) for the full
workflow.

## Run the website locally

Because the site uses JavaScript modules and `fetch()` to load Parquet files,
serve the repository over HTTP rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a browser.

The local site still needs internet access for the Plotly, hyparquet, and
hyparquet-compressors packages loaded from public CDNs.

## Methods summary

Raw reads were processed with the `nf-core/rnaseq` pipeline, including FastQC,
Trim Galore!, and Salmon pseudo-alignment against the corresponding Ensembl
reference genome. Differential expression was computed with DESeq2 for each
species and comparison, with available covariates incorporated into the
design. Differentially expressed genes are defined at FDR < 0.05 and
|log2FC| > 0.58.

For the cross-species knockout analysis, genes were mapped through one-to-one
human protein-coding orthologs from Ensembl v115. A three-level random-effects
model was fitted with `metafor::rma.mv()`, accounting for species, experiment,
and phylogenetic correlation. The knockout meta-analysis covers 13,359
orthologous genes across 39 experiments in all six species.

See the website's [Methods tab](https://sirt6.github.io/SIRT6.db/#methods) for
the full summary.

## Citation

SIRT6.db v0.0.2. Please cite the associated manuscript and Zenodo DOI when they
become available.

## Contact

Author names, affiliations, and contact details will be added before
publication.

## License

The repository is distributed under the [MIT License](LICENSE).
