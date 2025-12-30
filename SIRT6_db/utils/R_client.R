library(R6)
library(arrow)
library(dplyr)
library(tibble)
library(SummarizedExperiment)

SIRT6db <- R6Class("SIRT6db",
  public = list(
    
    db_path = NULL,
    
    initialize = function(db_path) {
      "Initializes the client with the path to the SIRT6_db directory."
      self$db_path <- path.expand(db_path)
      if (!dir.exists(self$db_path)) {
        stop("SIRT6_db not found at ", self$db_path)
      }
    },
    
    version = function() {
      "Returns the version of the SIRT6_db from the VERSION.txt file."
      version_file <- file.path(self$db_path, "VERSION.txt")
      if (file.exists(version_file)) {
        tryCatch({
          return(readLines(version_file, warn = FALSE)[1])
        }, error = function(e) {
          return(paste("Error reading version file:", e$message))
        })
      } else {
        return("Version file not found.")
      }
    },
    
    available_species = function() {
      "Returns a list of all available species in the database."
      stats_path <- file.path(self$db_path, "indices", "experiment_stats.parquet")
      if (!file.exists(stats_path)) {
        message("Warning: experiment_stats.parquet not found.")
        return(character(0))
      }
      species_df <- read_parquet(stats_path)
      return(sort(unique(species_df$organism)))
    },
    
    list_experiments = function() {
      "Lists all available experiments from the index file."
      stats_path <- file.path(self$db_path, "indices", "experiment_stats.parquet")
      if (!file.exists(stats_path)) {
        message("Warning: experiment_stats.parquet not found.")
        return(data.frame())
      }
      return(read_parquet(stats_path))
    },
    
    load_dataset = function(species, gse_id) {
      "Loads expression, sample, and gene data for a specific dataset."
      expr_path <- file.path(self$db_path, "expression", species, paste0(gse_id, ".parquet"))
      samples_path <- file.path(self$db_path, "metadata", species, "samples.parquet")
      genes_path <- file.path(self$db_path, "genes", paste0(species, "_genes.parquet"))

      if (!file.exists(expr_path)) {
        stop("Expression file not found: ", expr_path)
      }
      
      message(paste("Loading dataset", gse_id, "for", species, "..."))
      expression_df <- read_parquet(expr_path)
      samples_df <- read_parquet(samples_path)
      genes_df <- read_parquet(genes_path)
      
      samples_df <- samples_df[samples_df$sample_id %in% colnames(expression_df), ]

      samples_df <- column_to_rownames(samples_df, var = "sample_id")
      expression_df <- column_to_rownames(expression_df, var = "gene_id")
      
      message("  -> Loaded expression matrix: ", paste(dim(expression_df), collapse = " x "))
      message("  -> Loaded metadata for ", nrow(samples_df), " samples.")
      message("  -> Loaded gene annotations for ", nrow(genes_df), " genes.")
      
      return(list(expression = expression_df, samples = samples_df, genes = genes_df))
    },
    
    filter_low_expressed_genes = function(data_list, min_counts = 5, 
                                         min_samples_pct = 0.2, max_zeros_pct = 0.4) {
      "Filters out lowly expressed genes based on user-defined criteria."
      expr_df <- data_list$expression
      num_samples <- ncol(expr_df)
      
      message("\n--- Filtering Lowly Expressed Genes ---")
      message(paste("Initial gene count:", nrow(expr_df)))
      
      # Criteria 1: No less than `min_counts` in no fewer than `min_samples_pct` of samples
      required_samples <- ceiling(num_samples * min_samples_pct)
      filter_counts <- rowSums(expr_df >= min_counts) >= required_samples
      
      # Criteria 2: No more than `max_zeros_pct` zeros
      max_zeros_allowed <- ceiling(num_samples * max_zeros_pct)
      filter_zeros <- rowSums(expr_df == 0) <= max_zeros_allowed
      
      # Combine filters
      combined_filter <- filter_counts & filter_zeros
      
      filtered_expr_df <- expr_df[combined_filter, , drop = FALSE]
      
      message(paste("Genes passing filter:", nrow(filtered_expr_df)))
      message(paste("Genes removed:", nrow(expr_df) - nrow(filtered_expr_df)))
      message("--- Filtering Complete ---\n")
      
      # Update the list with the filtered data
      data_list$expression <- filtered_expr_df
      data_list$genes <- data_list$genes[data_list$genes$gene_id %in% rownames(filtered_expr_df), ]
      
      return(data_list)
    },

    get_summarized_experiment_object = function(data_list) {
      "Creates a SummarizedExperiment object for downstream analysis."
      expr_df <- data_list$expression
      samples_df <- data_list$samples
      genes_df <- data_list$genes
      
      se <- SummarizedExperiment(
        assays = list(counts = as.matrix(expr_df)),
        colData = samples_df,
        rowData = genes_df 
      )
      return(se)
    }
  )
)

