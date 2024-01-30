import h5py
import numpy as np
import numpy.typing as npt
import pandas as pd
from umap import UMAP
import requests
import json
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Tuple, List, Optional


UNIPROT_EMBEDDINGS_URL = 'https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/embeddings/UP000005640_9606/per-protein.h5'
KEYWORD_REQUEST_URL = "https://rest.uniprot.org/uniprotkb/search?query=accession_id:ENTRY_ID&fields=keyword"
EMBEDDINGS_H5_FILENAME = "embeddings.h5"
UMAP_CSV_FILENAME = "umap.csv"


def download_embeddings(embedding_url: str, outfile: str) -> None:
    """Download .h5 embedding from embedding_url into outfile

    Args:
        embedding_url (str): UniProt embedding URL
        outfile (str): File name to save embedding in

    Raises:
        Exception: Error downloading embedding
    """

    # Download embedding, save to EMBEDDINGS_H5_FILENAME
    response = requests.get(embedding_url, params={'stream': True})

    if response.status_code != 200:
        raise Exception("Error downloading embedding")

    with open(outfile,'wb') as f:
        for chunk in response.iter_content(chunk_size=1024):
            f.write(chunk)


def parse_embedding(embedding_filename: str) -> Tuple[List[str], List[npt.NDArray]]:
    """Parse .h5 embedding file and return the list of UniProt entries and embedding

    Args:
        embedding_filename (str): Name of embedding file to parse

    Returns:
        Tuple[List[str], List[NDArray]]: Tuple containing the list of entry_ids and embeddings
    """

    entry_ids = []
    embeddings = []

    with h5py.File(embedding_filename, 'r') as f:
        entry_ids = list(f.keys())
        embeddings = np.zeros((len(entry_ids), 1024))

        for i, val in enumerate(f.values()):
            embeddings[i, :] = np.array(val)

    return entry_ids, embeddings


def download_keywords(entries: List[str], request_url_template: str=KEYWORD_REQUEST_URL) -> Tuple[List[str], List[str]]:
    """Download keywords associated with UniProt ids

    Args:
        entries (List[str]): List of UniProt accession idsd
        request_url_template (str, Optional): _description_. Defaults to KEYWORD_REQUEST_URL.

    Returns:
        Tuple[List[str], List[str]]: Returns list of keywords and list of available keyword categories
    """


    categories = {
        'Accession id': True
    }
    data = {}

    def _request_keyword(entry):
        response = requests.get(request_url_template.replace("ENTRY_ID", entry))

        try:
            body = response.json()

            # We expect there would only be 1 result
            result = body['results'][0]
            accession_id = result['primaryAccession']

            # keyword object has the shape
            # {
            #     "id": "KW-1064",
            #     "category": "Biological process",
            #     "name": "Adaptive immunity"
            # }
            row = { "Accession id" : accession_id }
            keyword_values = {}

            for keyword_object in result['keywords']:

                category = keyword_object['category']
                value = keyword_object["name"]

                if not keyword_values.get(category):
                    keyword_values[category] = []

                keyword_values[category].append(value)
                categories[keyword_object["category"]] = True

            row.update({ category : ','.join(values) for category, values in keyword_values.items() })

            data[accession_id] = row

        except Exception as e:
            print("Failed requesting keyword for entry", entry)
            print(e)

    with ThreadPoolExecutor() as executor:
        executor.map(_request_keyword, entry_ids)

    keywords = list(data.values())
    categories = list(categories.keys())

    print("Successfully downloaded keywords for", len(keywords), "proteins")

    return keywords, categories


if __name__ == "__main__":
    print("Downloading embedding...", end=" ")
    download_embeddings(UNIPROT_EMBEDDINGS_URL, EMBEDDINGS_H5_FILENAME)
    print("Complete")

    print("Parsing embedding...", end=" ")
    entry_ids, embeddings = parse_embedding(EMBEDDINGS_H5_FILENAME)
    print("Complete")

    print("Downloading kewords for entries...", end=" ")
    keywords, categories = download_keywords(entry_ids)
    print("Complete")

    print("Fitting UMAP...", end="")
    umap = UMAP().fit_transform(embeddings)
    print("Complete")

    print("Preparing dataframe...")
    df = pd.DataFrame(data=keywords, columns=categories)
    df['UMAP_1'] = umap[:, 0]
    df['UMAP_2'] = umap[:, 1]
    df.fillna('NA')

    # Save in CSV file format as it is more compact than JSON
    df.to_csv(UMAP_CSV_FILENAME)

    print("Dataframe saved to", UMAP_CSV_FILENAME)
