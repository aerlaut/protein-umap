import os
from unittest.mock import patch, mock_open, Mock

import pytest
import h5py
import numpy as np

from ingest.ingest import (
    download_embeddings,
    is_new_embedding,
    parse_embedding,
    update_checksum,
    replace_latest_plotdata,
    UNIPROT_EMBEDDINGS_URL,
)


class TestIngest:
    @pytest.fixture
    def mock_filepaths(self):
        def _mock_path(filename: str):
            return os.path.join(os.path.dirname(__file__), "mocks", filename)

        paths = {
            "embedding.h5": _mock_path("mock-per-protein.h5"),
            "new-embedding.h5": _mock_path("mock-new-embedding.h5"),
            "empty.h5": _mock_path("empty.h5"),
            "checksum": _mock_path("mock-checksum"),
            "keyword.json": _mock_path("keyword-response.json"),
        }

        return paths

    def test_download_embedding_downloads_embedding(
        self, requests_mock, mock_filepaths
    ):
        mock_h5 = None
        with open(mock_filepaths["embedding.h5"], "rb") as f:
            mock_h5 = f.read()

        requests_mock.get(UNIPROT_EMBEDDINGS_URL, content=mock_h5)

        output_file_path = "test-output.h5"

        mock_open_context = mock_open()
        with patch("builtins.open", mock_open_context):
            download_embeddings(UNIPROT_EMBEDDINGS_URL, output_file_path)

        mock_open_context.assert_called_once_with(output_file_path, "wb")

        file_handle = mock_open_context()
        file_handle.write.assert_called_once_with(mock_h5)

    def test_download_embedding_throws_an_error_if_it_cant_reach_server(
        self, requests_mock
    ):
        requests_mock.get(UNIPROT_EMBEDDINGS_URL, status_code=500)

        with pytest.raises(Exception, match="Error downloading embedding"):
            download_embeddings(UNIPROT_EMBEDDINGS_URL, "test-output.h5")

    def test_is_new_embedding_returns_false_if_embedding_is_the_same(
        self, mock_filepaths
    ):
        checksum, is_new = is_new_embedding(
            mock_filepaths["embedding.h5"], mock_filepaths["checksum"]
        )

        content = None
        with open(mock_filepaths["checksum"]) as f:
            content = f.read()

        assert not is_new
        assert checksum == content

    def test_is_new_embedding_returns_true_if_embedding_is_not_the_same(
        self, mock_filepaths
    ):
        checksum, is_new = is_new_embedding(
            mock_filepaths["new-embedding.h5"], mock_filepaths["checksum"]
        )

        content = None
        with open(mock_filepaths["checksum"]) as f:
            content = f.read()

        assert is_new
        assert checksum != content

    def test_parse_embedding_returns_entry_ids_and_embedding(self, mock_filepaths):
        entry_ids, embedding = parse_embedding(mock_filepaths["embedding.h5"])

        with h5py.File(mock_filepaths["embedding.h5"]) as f:
            # Assert that the length of returned entry_ids is the same as entries in the h5 file
            assert len(f.keys()) == len(entry_ids)

            # Assert that all the keys in h5 file exists in entry_ids
            for entry_id in f.keys():
                assert entry_ids.index(entry_id) > -1

            # Ensure that all keys in the
            assert embedding.shape[0] == len(f.keys())

            # Ensure that the content are the same
            for idx, value in enumerate(f.values()):
                assert np.array_equal(embedding[idx] == value[idx, :])

    def test_parse_embedding_throws_on_empty_embedding_file(self, mock_filepaths):
        with pytest.raises(Exception, match="Embedding file is empty"):
            entry_ids, embedding = parse_embedding(mock_filepaths["empty.h5"])

    # download_keywords
    # def test_download_keywords_returns_accession_ids_and_keyword_mappings(self):
    #     pass

    # def test_download_keywords_throws_exception_if_request_fails(self):
    #     pass

    # def test_download_keywords_throws_exception_if_request_fails(self):
    #     pass

    def test_update_checksum_udpates_checksum(self):
        checksum_path = "test-checksum"
        embedding_checksum = "mock-checksum"

        mock_open_context = mock_open()
        with patch("builtins.open", mock_open_context):
            update_checksum(embedding_checksum, checksum_path)

        mock_open_context.assert_called_once_with(checksum_path, "w")

        file_handle = mock_open_context()
        file_handle.write.assert_called_once_with(embedding_checksum)

    def test_replace_latest_plotdata_replace_latest_plotdata(self):
        mock_remove = Mock()
        mock_copy = Mock()

        new_path = "new-plotdata.json"
        current_latest_path = "latest-plotdata.json"

        with patch("os.remove", mock_remove):
            with patch("shutil.copyfile", mock_copy):
                replace_latest_plotdata(new_path, current_latest_path)

        mock_remove.assert_called_once_with(current_latest_path)
        mock_copy.assert_called_once_with(new_path, current_latest_path)
