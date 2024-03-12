import h5py
import numpy as np
import numpy.typing as npt
from umap import UMAP
import requests
import json
import hashlib
import os
import shutil
from datetime import date
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from typing import Tuple, List, Dict


UNIPROT_EMBEDDINGS_URL = "https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/embeddings/UP000005640_9606/per-protein.h5"
KEYWORD_REQUEST_URL = "https://rest.uniprot.org/uniprotkb/search?query=accession_id:ENTRY_ID&fields=keyword"
EMBEDDINGS_H5_FILENAME = "embeddings.h5"
INGEST_DIR = "ingest"
LAST_CHECKSUM_FILENAME = "last_checksum"
PLOTDATA_DIR = "plotdata"
DATA_FILE_PREFIX = "plotdata"
LATEST_PLODATA_FILENAME = "latest.json"


def download_embeddings(embedding_url: str, outfile: str) -> None:
    """Download .h5 embedding from embedding_url into outfile

    Args:
        embedding_url (str): UniProt embedding URL
        outfile (str): File name to save embedding in

    Raises:
        Exception: Error downloading embedding
    """

    # Download embedding, save to EMBEDDINGS_H5_FILENAME
    response = requests.get(embedding_url, params={"stream": True})

    if response.status_code != 200:
        raise Exception("Error downloading embedding")

    with open(outfile, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            f.write(chunk)


def is_new_embedding(
    embedding_filename: str, checksum_filename: str
) -> Tuple[str, bool]:
    """Determine if embedding is newer than previous by comparing embedding
        checksum with last known checksum

    Args:
        embedding_filename (str): Name of embedding file
        checksum_filename (str): Name of file contatining latest checksum

    Returns:
        str: Checksum of embeddding
        bool: True if embedding is new
    """

    embedding_checksum = None
    last_checksum = None

    with open(embedding_filename, "rb") as f:
        data = f.read()
        embedding_checksum = hashlib.md5(data).hexdigest()

    with open(checksum_filename, "r") as f:
        last_checksum = f.read()

    return embedding_checksum, embedding_checksum != last_checksum


def parse_embedding(embedding_filename: str) -> Tuple[List[str], npt.NDArray]:
    """Parse .h5 embedding file and return the list of UniProt entries and embedding

    Args:
        embedding_filename (str): Name of embedding file to parse

    Returns:
        Tuple[List[str], List[NDArray]]: Tuple containing the list of entry_ids and embeddings
    """

    entry_ids = []
    embeddings = []

    with h5py.File(embedding_filename, "r") as f:
        entry_ids = list(f.keys())

        if len(entry_ids) == 0:
            raise Exception("Embedding file is empty")

        embedding_size = f[entry_ids[0]].shape[0]
        embeddings = np.zeros((len(entry_ids), embedding_size))

        for i, val in enumerate(f.values()):
            embeddings[i, :] = np.array(val)

    return entry_ids, embeddings


def download_keywords(
    accession_ids: List[str], request_url_template: str = KEYWORD_REQUEST_URL
) -> Dict[str, Dict[str, int]]:
    """Download keywords associated with UniProt ids, and store keyword associations based on index.

    Args:
        accession_ids (List[str]): List of UniProt accession ids present in UMAP
        request_url_template (str, Optional): _description_. Defaults to KEYWORD_REQUEST_URL.

    Returns:
        Dict[str, Dict[ str, int]]: Mapping of category and keywords into accession_id indices
    """

    keyword_mapping = {}

    def _request_keyword(accession_id):

        try:
            response = requests.get(request_url_template.replace("ENTRY_ID", accession_id))
            response.raise_for_status()

            body = response.json()

            # We expect there would only be 1 result
            result = body["results"][0]
            accession_id_idx = accession_ids.index(accession_id)

            # keyword object has the shape
            # {
            #     "id": "KW-1064",
            #     "category": "Biological process",
            #     "name": "Adaptive immunity"
            # }

            for keyword_object in result["keywords"]:
                category = keyword_object["category"]
                keyword = keyword_object["name"]

                if not keyword_mapping.get(category):
                    keyword_mapping[category] = defaultdict(list)

                keyword_mapping[category][keyword].append(accession_id_idx)

        except Exception as e:
            raise Exception(f"Failed requesting keyword for accession_id {accession_id}: {str(e)}")

    with ThreadPoolExecutor() as executor:
        results = executor.map(_request_keyword, accession_ids)

        # Iterate over results to catch exceptions
        for result in results:
            if result is not None:
                result.exception()

    print("Successfully downloaded keywords for", len(accession_ids), "proteins")

    return keyword_mapping


def update_checksum(embedding_checksum: str, last_checksum_path: str) -> None:
    """Replace content of last checksum with latest embedding checksum

    Args:
        embedding_checksum (str): Checksum of latest embedding
        last_checksum_path (str): Path to file containing last checksum
    """

    with open(last_checksum_path, "w") as f:
        f.write(embedding_checksum)


def replace_latest_plotdata(plotdata_path: str, latest_plotdata_filepath) -> None:
    """Name the latest plotdata file for easier reference

    Args:
        plotdata_path (str): Path to the latest plotdata file
        latest_plotdata_filepath (str): Path to the latest plotdata file
    """
    os.remove(latest_plotdata_filepath)
    shutil.copyfile(plotdata_path, latest_plotdata_filepath)


if __name__ == "__main__":
    print("Downloading embedding...", end=" ")

    embeddings_path = os.path.join(INGEST_DIR, EMBEDDINGS_H5_FILENAME)
    download_embeddings(UNIPROT_EMBEDDINGS_URL, embeddings_path)
    print("Complete")

    print("Checking for new release...", end=" ")
    last_checksum_path = os.path.join(INGEST_DIR, LAST_CHECKSUM_FILENAME)
    embedding_checksum, is_new = is_new_embedding(embeddings_path, last_checksum_path)

    if not is_new:
        print("No new changes. Aborting ingest")
        os.remove(embeddings_path)
        os._exit(os.EX_OK)
    print("New embedding present. Ingesting data.")

    print("Parsing embedding...", end=" ")
    accession_ids, embeddings = parse_embedding(embeddings_path)
    print("Complete")

    print("Downloading kewords for entries...")
    keyword_mapping = download_keywords(accession_ids)
    print("Complete")

    print("Fitting UMAP...", end="")
    # Returns umap in a Pandas dataframe with the form [(x, y)]
    umap = UMAP().fit_transform(embeddings)
    print("Complete")

    print("Preparing JSON objects...")
    UMAP_1 = umap[:, 0].tolist()
    UMAP_2 = umap[:, 1].tolist()

    payload = {
        "accession_ids": accession_ids,
        "keyword_mapping": keyword_mapping,
        "UMAP_1": UMAP_1,
        "UMAP_2": UMAP_2,
    }

    data_filename = f'{DATA_FILE_PREFIX}-{date.today().strftime("%Y-%m-%d")}.json'
    data_filepath = os.path.join(PLOTDATA_DIR, data_filename)

    with open(data_filepath, "w") as f:
        json.dump(payload, f)

    print("Data saved to", data_filepath)

    print("Updating checksum and latest plotdata...")
    update_checksum(embedding_checksum, last_checksum_path)
    print("Checksum updated")

    os.remove(embeddings_path)
    print("Embeddings removed")

    latest_plotdata_path = os.path.join(PLOTDATA_DIR, LATEST_PLODATA_FILENAME)
    replace_latest_plotdata(data_filepath, latest_plotdata_path)
    print("Latest plotdata updated")
