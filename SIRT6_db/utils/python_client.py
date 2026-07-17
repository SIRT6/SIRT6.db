import pandas as pd
import numpy as np
import math
from pathlib import Path
import scanpy as sc

class SIRT6db:
    """
    A client to access and load datasets from the SIRT6_db.
    """
    def __init__(self, db_path: str):
        """Initializes the client with the path to the SIRT6_db directory."""
        self.db_path = Path(db_path)
        if not self.db_path.is_dir():
            raise FileNotFoundError(f"SIRT6_db not found at {self.db_path}")
    
    def version(self) -> str:
        """
        Returns the version of the SIRT6_db.
        Reads the version from the version.txt file in the database root.
        """
        version_file = self.db_path / "version.txt"
        if version_file.exists():
            try:
                with open(version_file, 'r') as f:
                    return f.read().strip()
            except IOError as e:
                return f"Error reading version file: {e}"
        else:
            return "Version file not found."
    
    def available_species(self) -> list:
        """
        Returns a list of all available species in the database.
        Determines this by checking experiment_stats.parquet file.
        """
        stats_path = self.db_path / "indices" / "experiment_stats.parquet"
        if not stats_path.exists():
            print("Warning: experiment_stats.parquet not found.")
            return []
        
        species_df = pd.read_parquet(stats_path)
        return sorted(species_df.organism.unique())
            
    def list_experiments(self):
        """Lists all available experiments from the index file."""
        stats_path = self.db_path / "indices" / "experiment_stats.parquet"
        if not stats_path.exists():
            print("Warning: experiment_stats.parquet not found.")
            return pd.DataFrame()
        return pd.read_parquet(stats_path)
        
    def load_dataset(self, species: str, gse_id: str):
        """
        Loads expression, sample, and gene data for a specific dataset.

        Args:
            species (str): The species name (e.g., 'mus_musculus').
            gse_id (str): The GEO Series ID (e.g., 'GSE109280').

        Returns:
            dict: A dictionary containing 'expression', 'samples', and 'genes' DataFrames.
        """
        expr_path = self.db_path / "expression" / species / f"{gse_id}.parquet"
        samples_path = self.db_path / "metadata" / species / "samples.parquet"
        genes_path = self.db_path / "genes" / f"{species}_genes.parquet"

        if not expr_path.exists():
            raise FileNotFoundError(f"Expression file not found: {expr_path}")
        
        print(f"Loading dataset {gse_id} for {species}...")
        expression_df = pd.read_parquet(expr_path)
        samples_df = pd.read_parquet(samples_path)
        genes_df = pd.read_parquet(genes_path)
        
        # Filter samples metadata to only include samples in this experiment
        samples_df = samples_df[samples_df.sample_id.isin(expression_df.columns)]
        
        print("  -> Loaded expression matrix:", expression_df.shape)
        print("  -> Loaded metadata for", len(samples_df), "samples.")
        print("  -> Loaded gene annotations for", len(genes_df), "genes.")
        
        return {"expression": expression_df, "samples": samples_df, "genes": genes_df}
    
    def filter_low_expressed_genes(self, data_dict: dict, min_counts: int = 5, 
                                   min_samples_pct: float = 0.2, max_zeros_pct: float = 0.4) -> dict:
        """
        Filters out lowly expressed genes based on user-defined criteria.
        "No less than {min_counts} counts in no fewer than {min_samples_pct} of the samples, and no more than {max_zeros_pct} zeros."

        Args:
            data_dict (dict): The dictionary from load_dataset().
            min_counts (int): The minimum count value to consider.
            min_samples_pct (float): The fraction of samples that must have 
                                     counts >= min_counts (e.g., 0.2 for 20%).
            max_zeros_pct (float): The maximum fraction of samples allowed to be zero.

        Returns:
            dict: The updated data_dict with a filtered expression DataFrame.
        """
        raw_data_dict = data_dict.copy()

        expr_df = raw_data_dict['expression'].copy()
        genes_df = raw_data_dict['genes'].copy()
        num_samples = expr_df.shape[1]
        
        print(f"\n--- Filtering Lowly Expressed Genes ---")
        print(f"Initial gene count: {expr_df.shape[0]}")
        
        # Criteria 1: No less than `min_counts` in no fewer than `min_samples_pct` of samples
        required_samples = math.ceil(num_samples * min_samples_pct)
        filter_counts = (expr_df >= min_counts).sum(axis=1) >= required_samples
        
        # Criteria 2: No more than `max_zeros_pct` zeros
        max_zeros_allowed = math.ceil(num_samples * max_zeros_pct)
        filter_zeros = (expr_df == 0).sum(axis=1) <= max_zeros_allowed
        
        combined_filter = filter_counts & filter_zeros
        
        filtered_expr_df = expr_df[combined_filter]
        filtered_genes_df = genes_df.loc[genes_df.gene_id.isin(filtered_expr_df.index)]
        
        print(f"Genes passing filter: {filtered_expr_df.shape[0]}")
        print(f"Genes removed: {expr_df.shape[0] - filtered_expr_df.shape[0]}")
        
        raw_data_dict['expression'] = filtered_expr_df
        raw_data_dict['genes'] = filtered_genes_df
        return raw_data_dict
    
    def get_anndata_object(self, data_dict: dict):
        """
        Create an AnnData object for a downstream analysis

        Args:
            data_dict (dict): The dictionary from load_dataset().

        Returns:
            AnnData: An output object.
        """
        expr_df = data_dict["expression"]
        samples_df = data_dict["samples"]
        genes_df = data_dict["genes"]

        var_df = genes_df.set_index('gene_id').loc[expr_df.index]
        adata = sc.AnnData(X=expr_df.T, obs=samples_df.set_index('sample_id'), var=var_df)
        return adata
