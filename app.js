import { parquetRead } from "https://cdn.jsdelivr.net/npm/hyparquet/+esm";

const ORG = {
  drosophila_melanogaster: "Drosophila melanogaster",
  homo_sapiens: "Homo sapiens",
  macaca_fascicularis: "Macaca fascicularis",
  mus_musculus: "Mus musculus",
  rattus_norvegicus: "Rattus norvegicus",
  sus_scrofa: "Sus scrofa"
};

const TAB_IDS = new Set(["datasets", "de", "gene", "meta", "downloads", "methods", "about"]);

const DE_FILES = [
  "de/drosophila_melanogaster/GSE191320/GSE191320_Adult__10_days__SIRT6-OE_vs_WT_deseq2.parquet",
  "de/drosophila_melanogaster/GSE191320/GSE191320_Aged__40_days__SIRT6-OE_vs_WT_deseq2.parquet",
  "de/drosophila_melanogaster/GSE309387/GSE309387_100uM_TDO2_inhibitor_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/drosophila_melanogaster/GSE309387/GSE309387_DMSO_TDO2_inhibitor_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_100nM_of_RAFi_and_1nM_of_MEKi_4_days_SIRT6-Het_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_100nM_of_RAFi_and_1nM_of_MEKi_4_days_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_2_M_of_RAFi_4_days_SIRT6-Het_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_2_M_of_RAFi_4_days_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_DMSO__1_1000__4_days_SIRT6-Het_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE102813/GSE102813_DMSO__1_1000__4_days_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_A549_SIRT6-OE_K3Q_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_A549_SIRT6-OE_K3R_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_A549_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_H1299_SIRT6-OE_K3Q_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_H1299_SIRT6-OE_K3R_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE212057/GSE212057_H1299_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE213425/GSE213425_all_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE235082/GSE235082_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE64642/GSE64642_Early_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/GSE64642/GSE64642_Late_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/homo_sapiens/HRA003336/HRA003336_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Brain_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Heart_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Kidney_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Liver_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Lung_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Muscle_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/macaca_fascicularis/GSE102830/GSE102830_Thymus_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE109280/GSE109280_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE115953/GSE115953_a6High_CD34m_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE115953/GSE115953_a6High_CD34p_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE115953/GSE115953_a6Low_CD34m_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE129370/GSE129370_ethanol-fed_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE129370/GSE129370_pair-fed_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE130690,GSE130692/GSE130690,GSE130692_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE157838/GSE157838_all_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE166840/GSE166840_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE168983/GSE168983_mdx_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE168984/GSE168984_mdx_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE199487/GSE199487_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE202470/GSE202470_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE206513/GSE206513_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE216185,GSE216186/GSE216185,GSE216186_all_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE221077/GSE221077_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE221092/GSE221092_0_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE221092/GSE221092_20_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE221092/GSE221092_60_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE236460/GSE236460_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE246209/GSE246209_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE287696/GSE287696_all_SIRT6-OE_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE290902/GSE290902_Ang_II_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/mus_musculus/GSE290902/GSE290902_Saline_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/rattus_norvegicus/GSE276440/GSE276440_all_SIRT6-KO_vs_WT_deseq2.parquet",
  "de/sus_scrofa/GSE161068/GSE161068_all_SIRT6-KO_vs_WT_deseq2.parquet"
];

const EXPRESSION_FILES = [
  "expression/drosophila_melanogaster/GSE191320.parquet",
  "expression/drosophila_melanogaster/GSE309387.parquet",
  "expression/homo_sapiens/GSE102813.parquet",
  "expression/homo_sapiens/GSE212057.parquet",
  "expression/homo_sapiens/GSE213425.parquet",
  "expression/homo_sapiens/GSE235082.parquet",
  "expression/homo_sapiens/GSE64642.parquet",
  "expression/homo_sapiens/HRA003336.parquet",
  "expression/macaca_fascicularis/GSE102830.parquet",
  "expression/mus_musculus/GSE109280.parquet",
  "expression/mus_musculus/GSE115953.parquet",
  "expression/mus_musculus/GSE129370.parquet",
  "expression/mus_musculus/GSE130690,GSE130692.parquet",
  "expression/mus_musculus/GSE157838.parquet",
  "expression/mus_musculus/GSE166840.parquet",
  "expression/mus_musculus/GSE168983.parquet",
  "expression/mus_musculus/GSE168984.parquet",
  "expression/mus_musculus/GSE199487.parquet",
  "expression/mus_musculus/GSE202470.parquet",
  "expression/mus_musculus/GSE206513.parquet",
  "expression/mus_musculus/GSE216185,GSE216186.parquet",
  "expression/mus_musculus/GSE221077.parquet",
  "expression/mus_musculus/GSE221092.parquet",
  "expression/mus_musculus/GSE236460.parquet",
  "expression/mus_musculus/GSE246209.parquet",
  "expression/mus_musculus/GSE287696.parquet",
  "expression/mus_musculus/GSE290902.parquet",
  "expression/rattus_norvegicus/GSE276440.parquet",
  "expression/sus_scrofa/GSE161068.parquet"
];

const state = {
  cache: new Map(),
  indexRows: [],
  contrasts: DE_FILES.map(describeContrast),
  deRows: [],
  metaRows: [],
  metaInput: null,
  geneMaps: new Map()
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindControls();
  populateContrastControls();
  renderDownloads();
  loadVersion();
  loadIndex();
});

function dataUrl(path) {
  return rootUrl(`SIRT6_db/${path}`);
}

function rootUrl(path) {
  const normalizedPath = path.replace(/^\/+/, "");
  if (location.hostname.endsWith("github.io")) {
    return `/SIRT6.db/${normalizedPath}`;
  }
  return normalizedPath;
}

async function readParquet(path) {
  if (state.cache.has(path)) return state.cache.get(path);
  const promise = new Promise(async (resolve, reject) => {
    const url = dataUrl(path);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Could not load Parquet file ${url} (${response.status})`);
      }
      const file = await response.arrayBuffer();
      const maybePromise = parquetRead({
        file,
        rowFormat: "object",
        onComplete: (rows) => resolve(rows)
      });
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(resolve).catch(reject);
      }
    } catch (error) {
      reject(error);
    }
  });
  state.cache.set(path, promise);
  return promise;
}

async function readText(path) {
  const response = await fetch(rootUrl(path));
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.text();
}

function describeContrast(path) {
  const parts = path.split("/");
  const slug = parts[1];
  const gse = parts[2];
  const filename = parts.at(-1);
  const core = filename.replace(`${gse}_`, "").replace("_deseq2.parquet", "");
  const genotypeMatch = core.match(/(SIRT6-[A-Za-z0-9_/-]+_vs_WT)$/);
  const contrast = genotypeMatch ? formatContrastName(genotypeMatch[1]) : core;
  const stratum = genotypeMatch ? core.slice(0, genotypeMatch.index).replace(/_$/, "") : core;
  const labelStratum = stratum.replaceAll("__", "; ").replaceAll("_", " ");
  return {
    path,
    countsPath: path.replace("_deseq2.parquet", "_normalized_counts.parquet"),
    slug,
    organism: ORG[slug],
    gse,
    stratum,
    contrast,
    label: `${ORG[slug]} - ${gse} - ${labelStratum || "all"} - ${contrast}`
  };
}

function formatContrastName(rawContrast) {
  const [perturbation, reference] = rawContrast.split("_vs_");
  const cleanPerturbation = perturbation.replaceAll("_", "/");
  return reference ? `${cleanPerturbation} vs ${reference}` : cleanPerturbation;
}

function bindNavigation() {
  const nav = $(".tabs");
  $(".nav-toggle").addEventListener("click", (event) => {
    const open = nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  $("[data-home-link]").addEventListener("click", (event) => {
    event.preventDefault();
    showHome();
    history.replaceState(null, "", "#home");
    nav.classList.remove("open");
  });
  $$("[data-tab], [data-tab-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = link.dataset.tab || link.dataset.tabLink;
      if (!target) return;
      event.preventDefault();
      showTab(target);
      history.replaceState(null, "", `#${target}`);
      nav.classList.remove("open");
    });
  });
  const initialHash = location.hash.replace("#", "");
  if (TAB_IDS.has(initialHash)) {
    showTab(initialHash);
  } else {
    showHome();
  }
}

function showTab(tab) {
  const target = TAB_IDS.has(tab) ? tab : "datasets";
  $("#home").classList.remove("active");
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === target));
  $$("[data-tab]").forEach((link) => link.classList.toggle("active", link.dataset.tab === target));
}

function showHome() {
  $("#home").classList.add("active");
  $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $$("[data-tab]").forEach((link) => link.classList.remove("active"));
}

function bindControls() {
  $("#dataset-search").addEventListener("input", renderDatasets);
  $("#de-species").addEventListener("change", () => populateContrastControls("de"));
  $("#de-stratum").addEventListener("change", () => populateDeContrastSelect());
  $("#load-de").addEventListener("click", loadDeTable);
  $("#de-search").addEventListener("input", renderDeTable);
  $("#gene-species").addEventListener("change", () => populateContrastControls("gene"));
  $("#plot-gene").addEventListener("click", plotGene);
  $("#gene-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") plotGene();
  });
  $("#load-meta").addEventListener("click", loadMetaSummary);
  $("#meta-search").addEventListener("input", renderMetaTable);
}

async function loadIndex() {
  try {
    setStatus("dataset-status", "Loading studies...");
    state.indexRows = await readParquet("indices/datasets_table.parquet");
    state.indexRows.sort((a, b) => {
      const organismCompare = String(a.organism || "").localeCompare(String(b.organism || ""));
      return organismCompare || String(a.experiment_id || "").localeCompare(String(b.experiment_id || ""));
    });
    renderDatasets();
    setStatus("dataset-status", `${state.indexRows.length} studies`);
  } catch (error) {
    setStatus("dataset-status", "Studies failed");
    $("#datasets-body").innerHTML = errorRow(5, error);
  }
}

function renderDatasets() {
  const query = $("#dataset-search").value.trim().toLowerCase();
  const rows = state.indexRows.filter((row) => {
    const text = `${row.experiment_id} ${row.organism} ${row.genotypes} ${row.system}`.toLowerCase();
    return !query || text.includes(query);
  });
  $("#datasets-body").innerHTML = rows.map((row) => {
    return `
      <tr>
        <td><strong>${renderStudyLinks(row.experiment_id)}</strong></td>
        <td><em>${escapeHtml(row.organism)}</em></td>
        <td>${renderGenotypePills(row.genotypes)}</td>
        <td>${escapeHtml(row.system || "Not recorded")}</td>
        <td>${formatNumber(row.n_samples)}</td>
      </tr>
    `;
  }).join("");
}

function populateContrastControls(scope = "all") {
  if (scope === "all" || scope === "de") {
    fillSpeciesSelect($("#de-species"));
    populateDeStrata();
  }
  if (scope === "all" || scope === "gene") {
    fillSpeciesSelect($("#gene-species"));
    populateGeneContrastSelect();
  }
}

function fillSpeciesSelect(select) {
  if (select.options.length) return;
  Object.entries(ORG).forEach(([slug, label]) => {
    select.add(new Option(label, slug));
  });
}

function populateDeStrata() {
  const slug = $("#de-species").value || Object.keys(ORG)[0];
  const strata = unique(state.contrasts.filter((item) => item.slug === slug).map((item) => `${item.gse} - ${item.stratum || "all"}`));
  $("#de-stratum").innerHTML = strata.map((label) => `<option value="${escapeAttr(label)}">${escapeHtml(label.replaceAll("_", " "))}</option>`).join("");
  populateDeContrastSelect();
}

function populateDeContrastSelect() {
  const slug = $("#de-species").value;
  const stratum = $("#de-stratum").value;
  const rows = state.contrasts.filter((item) => item.slug === slug && `${item.gse} - ${item.stratum || "all"}` === stratum);
  $("#de-contrast").innerHTML = rows.map((item) => `<option value="${escapeAttr(item.path)}">${escapeHtml(item.label)}</option>`).join("");
}

function populateGeneContrastSelect() {
  const slug = $("#gene-species").value || Object.keys(ORG)[0];
  const rows = state.contrasts.filter((item) => item.slug === slug);
  $("#gene-contrast").innerHTML = rows.map((item) => `<option value="${escapeAttr(item.path)}">${escapeHtml(item.label)}</option>`).join("");
}

async function loadGeneMap(slug) {
  if (state.geneMaps.has(slug)) return state.geneMaps.get(slug);
  const rows = await readParquet(`genes/${slug}_genes.parquet`);
  const byId = new Map();
  const bySymbol = new Map();
  rows.forEach((row) => {
    byId.set(String(row.gene_id), row.gene_name || row.gene_id);
    if (row.gene_name) bySymbol.set(String(row.gene_name).toLowerCase(), row.gene_id);
  });
  const map = { rows, byId, bySymbol };
  state.geneMaps.set(slug, map);
  return map;
}

async function loadDeTable() {
  const path = $("#de-contrast").value;
  const contrast = state.contrasts.find((item) => item.path === path);
  if (!contrast) return;
  try {
    setStatus("de-status", "Loading DE table...");
    const [rows, geneMap] = await Promise.all([readParquet(path), loadGeneMap(contrast.slug)]);
    state.deRows = rows.map((row) => ({
      ...row,
      gene_symbol: geneMap.byId.get(String(row.gene_id)) || row.gene_id
    })).sort((a, b) => numeric(a.padj, Infinity) - numeric(b.padj, Infinity));
    renderDeTable();
    setStatus("de-status", `${formatNumber(state.deRows.length)} genes loaded`);
  } catch (error) {
    setStatus("de-status", "DE load failed");
    $("#de-body").innerHTML = errorRow(6, error);
  }
}

function renderDeTable() {
  const query = $("#de-search").value.trim().toLowerCase();
  const rows = state.deRows.filter((row) => {
    if (!query) return true;
    return `${row.gene_symbol} ${row.gene_id}`.toLowerCase().includes(query);
  });
  $("#de-count").textContent = rows.length ? `Showing ${formatNumber(Math.min(rows.length, 500))} of ${formatNumber(rows.length)} matching genes` : "";
  $("#de-body").innerHTML = rows.slice(0, 500).map((row) => {
    const direction = directionLabel(row.log2FoldChange, row.significant);
    return `
      <tr>
        <td>${escapeHtml(row.gene_symbol)}</td>
        <td>${escapeHtml(row.gene_id)}</td>
        <td>${formatFixed(row.log2FoldChange, 3)}</td>
        <td>${formatSci(row.pvalue)}</td>
        <td>${formatSci(row.padj)}</td>
        <td class="${direction.className}">${direction.label}</td>
      </tr>
    `;
  }).join("");
}

async function plotGene() {
  const path = $("#gene-contrast").value;
  const contrast = state.contrasts.find((item) => item.path === path);
  const query = $("#gene-input").value.trim();
  if (!contrast || !query) {
    setStatus("gene-status", "Enter a gene");
    return;
  }
  try {
    setStatus("gene-status", "Loading normalized counts...");
    const [rows, geneMap] = await Promise.all([readParquet(contrast.countsPath), loadGeneMap(contrast.slug)]);
    const geneId = geneMap.bySymbol.get(query.toLowerCase()) || query;
    const row = rows.find((item) => String(item.gene_id).toLowerCase() === String(geneId).toLowerCase());
    if (!row) {
      setStatus("gene-status", "Gene not in contrast");
      $("#expression-plot").innerHTML = `No row found for ${escapeHtml(query)} in this contrast.`;
      return;
    }
    const grouped = groupCountsByCondition(row);
    const traces = Object.entries(grouped).map(([condition, values]) => ({
      type: "box",
      name: condition,
      y: values.filter((value) => value > 0),
      boxpoints: "all",
      jitter: 0.25,
      pointpos: 0
    }));
    $("#expression-plot").innerHTML = "";
    Plotly.newPlot("expression-plot", traces, {
      title: `${geneMap.byId.get(String(row.gene_id)) || query} (${row.gene_id})`,
      margin: { t: 60, r: 25, b: 80, l: 80 },
      yaxis: {
        title: "Normalized counts (DESeq2, log10 scale)",
        type: "log",
        rangemode: "tozero"
      },
      xaxis: { title: "Condition" }
    }, { responsive: true, displaylogo: false });
    setStatus("gene-status", "Plot rendered");
  } catch (error) {
    setStatus("gene-status", "Plot failed");
    $("#expression-plot").innerHTML = `<span class="up">${escapeHtml(error.message)}</span>`;
  }
}

function groupCountsByCondition(row) {
  const grouped = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key === "gene_id" || value == null || Number.isNaN(Number(value))) return;
    const condition = key.replace(/-\d+$/, "");
    if (!grouped[condition]) grouped[condition] = [];
    grouped[condition].push(Number(value));
  });
  return grouped;
}

async function loadMetaSummary() {
  try {
    setStatus("meta-status", "Loading KO summary...");
    state.metaRows = await readParquet("meta/meta_results_KO.parquet");
    state.metaRows.sort((a, b) => numeric(a.FDR, Infinity) - numeric(b.FDR, Infinity));
    renderMetaTable();
    setStatus("meta-status", `${formatNumber(state.metaRows.length)} genes`);
  } catch (error) {
    setStatus("meta-status", "Meta load failed");
    $("#meta-body").innerHTML = errorRow(8, error);
  }
}

function renderMetaTable() {
  const query = $("#meta-search").value.trim().toLowerCase();
  const rows = state.metaRows.filter((row) => {
    if (!query) return true;
    return `${row.human_gene_symbol} ${row.human_gene_id}`.toLowerCase().includes(query);
  });
  $("#meta-body").innerHTML = rows.slice(0, 500).map((row) => `
    <tr>
      <td><strong>${escapeHtml(row.human_gene_symbol)}</strong><br><span class="muted">${escapeHtml(row.human_gene_id)}</span></td>
      <td>${formatFixed(row.meta_LFC, 3)}</td>
      <td>${formatFixed(row.CI_lower, 3)} to ${formatFixed(row.CI_upper, 3)}</td>
      <td>${formatSci(row.FDR)}</td>
      <td>${formatFixed(row.I2, 1)}</td>
      <td>${formatNumber(row.k_experiments)}</td>
      <td>${formatNumber(row.n_species)}</td>
      <td><button class="secondary" type="button" data-forest="${escapeAttr(row.human_gene_id)}">Plot</button></td>
    </tr>
  `).join("");
  $$("[data-forest]").forEach((button) => {
    button.addEventListener("click", () => plotForest(button.dataset.forest));
  });
}

async function plotForest(humanGeneId) {
  const summary = state.metaRows.find((row) => String(row.human_gene_id) === String(humanGeneId));
  if (!summary) return;
  try {
    setStatus("meta-status", "Loading forest inputs...");
    if (!state.metaInput) state.metaInput = await readParquet("meta/input_for_meta.parquet");
    const rows = state.metaInput.filter((row) => String(row.human_gene_id) === String(humanGeneId));
    const labels = rows.map((row) => `${row.organism} - ${row.experiment_id} - ${row.stratum}`);
    const effects = rows.map((row) => Number(row.log2FoldChange));
    const errors = rows.map((row) => 1.96 * Number(row.lfcSE));
    const pooledY = labels.length + 1;
    $("#forest-plot").innerHTML = "";
    Plotly.newPlot("forest-plot", [
      {
        type: "scatter",
        mode: "markers",
        x: effects,
        y: labels.map((_, index) => index + 1),
        error_x: { type: "data", array: errors, visible: true },
        marker: { color: "#0f766e", size: 9 },
        name: "Study contrast",
        text: rows.map((row) => row.contrast)
      },
      {
        type: "scatter",
        mode: "markers",
        x: [Number(summary.meta_LFC)],
        y: [pooledY],
        error_x: {
          type: "data",
          array: [Number(summary.CI_upper) - Number(summary.meta_LFC)],
          arrayminus: [Number(summary.meta_LFC) - Number(summary.CI_lower)],
          visible: true
        },
        marker: { color: "#18303f", size: 14, symbol: "diamond" },
        name: "Pooled estimate"
      }
    ], {
      title: `${summary.human_gene_symbol} conserved KO response`,
      margin: { t: 60, r: 30, b: 70, l: 260 },
      xaxis: { title: "log2 fold change", zeroline: true },
      yaxis: {
        tickmode: "array",
        tickvals: [...labels.map((_, index) => index + 1), pooledY],
        ticktext: [...labels, "Pooled estimate"],
        autorange: "reversed"
      },
      shapes: [{
        type: "line",
        x0: 0,
        x1: 0,
        y0: 0,
        y1: pooledY + 1,
        line: { color: "#94a3b8", width: 1, dash: "dot" }
      }]
    }, { responsive: true, displaylogo: false });
    setStatus("meta-status", "Forest plot rendered");
  } catch (error) {
    setStatus("meta-status", "Forest failed");
    $("#forest-plot").innerHTML = `<span class="up">${escapeHtml(error.message)}</span>`;
  }
}

function renderDownloads() {
  const deLinks = DE_FILES.flatMap((path) => [path, path.replace("_deseq2.parquet", "_normalized_counts.parquet")]);
  const groups = [
    ["Differential expression and normalized counts", deLinks],
    ["Expression matrices", EXPRESSION_FILES],
    ["Meta-analysis", ["meta/meta_results_KO.parquet", "meta/input_for_meta.parquet"]],
    ["Gene references", Object.keys(ORG).map((slug) => `genes/${slug}_genes.parquet`).concat(["genes/ortholog_map_1to1.parquet"])],
    ["Indices and metadata", ["indices/datasets_table.parquet", "indices/experiment_stats.parquet", ...Object.keys(ORG).flatMap((slug) => [
      `metadata/${slug}/samples.parquet`,
      `metadata/${slug}/experiments.parquet`,
      `metadata/${slug}/samples_to_experiment.parquet`
    ])]],
    ["Clients and walkthroughs", [
      "SIRT6_db/utils/python_client.py",
      "SIRT6_db/utils/R_client.R",
      "SIRT6_db/utils/environment.yml",
      "SIRT6_db_walkthrough_Python.ipynb",
      "SIRT6_db_walkthrough_R.rmd",
      "README.md",
      "LICENSE"
    ]]
  ];
  $("#downloads-grid").innerHTML = groups.map(([title, paths]) => `
    <section class="download-group">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${paths.map((path) => {
          const href = path.startsWith("SIRT6_db/") || !path.includes("/") || path.endsWith(".ipynb") || path.endsWith(".rmd")
            ? rootUrl(path)
            : dataUrl(path);
          return `<li><a href="${escapeAttr(href)}" download>${escapeHtml(path)}</a></li>`;
        }).join("")}
      </ul>
    </section>
  `).join("");
}

async function loadVersion() {
  try {
    const version = (await readText("SIRT6_db/version.txt")).trim();
    $("#db-version").textContent = `v${version}`;
    $("#footer-version").textContent = `Database v${version}`;
    $("#license-link").href = rootUrl("LICENSE");
  } catch {
    $("#db-version").textContent = "version unavailable";
  }
}

function setStatus(id, text) {
  $(`#${id}`).textContent = text;
}

function unique(values) {
  return [...new Set(values)];
}

function renderGenotypePills(genotypes) {
  const values = Array.isArray(genotypes)
    ? genotypes
    : String(genotypes || "Not recorded").split(/[;,]/);
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => `<span class="pill">${escapeHtml(value)}</span>`)
    .join(" ");
}

function renderStudyLinks(experimentId) {
  return String(experimentId || "")
    .split(",")
    .map((accession) => accession.trim())
    .filter(Boolean)
    .map((accession) => {
      let href;
      if (accession.startsWith("GSE")) {
        href = `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${encodeURIComponent(accession)}`;
      } else if (accession.startsWith("HRA")) {
        href = `https://ngdc.cncb.ac.cn/gsa-human/browse/${encodeURIComponent(accession)}`;
      }
      return href
        ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(accession)}</a>`
        : escapeHtml(accession);
    })
    .join(", ");
}

function directionLabel(log2FoldChange, significant) {
  if (!significant) return { label: "not significant", className: "ns" };
  return Number(log2FoldChange) >= 0
    ? { label: "up in perturbation", className: "up" }
    : { label: "down in perturbation", className: "down" };
}

function numeric(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatFixed(value, digits) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "NA";
}

function formatSci(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "NA";
  if (number === 0) return "0";
  return number < 0.001 ? number.toExponential(2) : number.toPrecision(3);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function errorRow(colspan, error) {
  return `<tr><td colspan="${colspan}" class="up">${escapeHtml(error.message || error)}</td></tr>`;
}
