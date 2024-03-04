# UniProt Protein UMAP

## Background

The UniProt Protein UMAP is a visualization of the [UniProt embeddings](https://www.uniprot.org/help/embeddings) processed through [supervised UMAP](https://umap-learn.readthedocs.io/en/latest/supervised.html). The visualization makes it easy to browse and explore the UMAP dataset based on tags.

Currently, only human (H. sapiens) per-protein embedding is displayed.

View the UMAP here: https://cragnolini-lab.github.io/uniprot-umap

## Code structure

The code runs entirely on Github and Github actions, and consist of 3 separate parts:

- Ingestion pipeline
- UMAP Data
- Visualization

### Ingestion pipeline

The ingestion pipeline is written in Python and stored under [ingest](/ingest). This pipeline is run daily using the Github Action [ingest-embedding.yaml](/.github/workflows/ingest-embedding.yaml). The pipeline downloads the [per-protein H.sapies raw embedding](https://www.uniprot.org/help/downloads#embeddings) and compares the checksum. If the checksum is different (new data has been uploaded), the ingest parses the embedding, extracts the protein ids and associate it with UniProt keywords and reconstruct a . The pipeline then pushes the new data in JSON format under the [plotdata](/plotdata/) folder, updating the latest version.

### Metadata

The UMAP metadata is stored inside the [plotdata](/plotdata/) folder. The data contain mapping between the association protein's UniProt accession id, categories and embedding coordinates.

### Visualization

Visualization of the UMAP uses [Vega](https://vega.github.io/) via the [react-vega](https://www.npmjs.com/package/react-vega) library, built on top of [Next JS](https://nextjs.org/). Visualization is exported into static files and served over [Github Pages](https://pages.github.com/). The site parses the latest metadata file ([latest.json](/plotdata/latest.json)) and presents it into a UMAP.

## Maintainers & Contributors

- Anugerah Erlaut (@aerlaut)
- Tristan Cragnolini (@tc427)

## References
1. The UniProt Consortium. UniProt: the Universal Protein Knowledgebase in 2023.  2022;<b>51</b>:D523–31.
2. McInnes L, Healy J, Melville J. UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction.  2018, DOI: https://doi.org/10.48550/arXiv.1802.03426.