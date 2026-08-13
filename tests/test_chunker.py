from app.ingestion.chunking.splitter import chunk_text


class TestChunkText:
    """Tests for the chunk_text function."""

    def test_empty_text_returns_empty_list(self):
        """Empty or whitespace-only input should return no chunks."""
        assert chunk_text("") == []
        assert chunk_text("   ") == []
        assert chunk_text("\n\n") == []

    def test_single_paragraph_returns_one_chunk(self):
        """A single paragraph shorter than chunk_size should return one chunk."""
        text = "This is a single paragraph about NovaTech's remote work policy."
        chunks = chunk_text(text)
        assert len(chunks) == 1
        assert "remote work policy" in chunks[0]

    def test_multiple_paragraphs_combined_under_limit(self):
        """Paragraphs that fit within chunk_size should be combined."""
        text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
        chunks = chunk_text(text, chunk_size=1000)
        assert len(chunks) == 1
        assert "First paragraph" in chunks[0]
        assert "Third paragraph" in chunks[0]

    def test_paragraphs_split_at_chunk_size(self):
        """Paragraphs should split when they exceed chunk_size."""
        # Create two paragraphs that together exceed 100 chars
        para1 = "A" * 60
        para2 = "B" * 60
        text = f"{para1}\n\n{para2}"
        chunks = chunk_text(text, chunk_size=100)
        assert len(chunks) == 2
        assert "A" * 60 in chunks[0]
        assert "B" * 60 in chunks[1]

    def test_preserves_content_integrity(self):
        """All original text should be present across all chunks."""
        text = "Policy one details.\n\nPolicy two details.\n\nPolicy three details."
        chunks = chunk_text(text, chunk_size=40)
        combined = " ".join(chunks)
        assert "Policy one" in combined
        assert "Policy two" in combined
        assert "Policy three" in combined

    def test_strips_whitespace_from_chunks(self):
        """Chunks should not have leading/trailing whitespace."""
        text = "  Content with spaces.  \n\n  More content.  "
        chunks = chunk_text(text, chunk_size=1000)
        for chunk in chunks:
            assert chunk == chunk.strip()

    def test_realistic_document_chunking(self, sample_long_text):
        """Test chunking with a realistic company document."""
        chunks = chunk_text(sample_long_text, chunk_size=500)
        assert len(chunks) >= 2  # Should split into multiple chunks
        # Verify no content is lost
        combined = " ".join(chunks)
        assert "Remote Work Policy" in combined
        assert "Hybrid Work Schedule" in combined
        assert "$1,500" in combined

    def test_default_chunk_size(self):
        """Default chunk size should be 1500 characters."""
        # Create text that would fit in 1500 chars
        short_text = "Short paragraph.\n\n" * 10
        chunks = chunk_text(short_text)
        assert len(chunks) >= 1

    def test_no_empty_chunks(self):
        """Result should never contain empty strings."""
        text = "Content.\n\n\n\n\n\nMore content.\n\n\n\n"
        chunks = chunk_text(text)
        for chunk in chunks:
            assert len(chunk.strip()) > 0
