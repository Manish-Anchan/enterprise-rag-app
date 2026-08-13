import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create a FastAPI test client.
    
    Note: These tests validate the API contract and error handling.
    Full end-to-end tests require running services (Qdrant, Groq, Gemini).
    """
    # Import here to avoid side effects at module level
    from app.main import app
    return TestClient(app)


class TestHealthEndpoints:
    """Tests for health and status endpoints."""

    def test_home_endpoint(self, client):
        """GET / should return a 200 with service info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "NovaTech KnowledgeHub" in data["message"]
        assert data["status"] == "healthy"

    def test_health_endpoint(self, client):
        """GET /health should return component health status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "components" in data
        assert data["components"]["api"] == "up"
        assert data["components"]["guardrails"] == "enabled"


class TestQueryEndpoint:
    """Tests for the POST /query endpoint."""

    def test_query_requires_body(self, client):
        """POST /query without a body should return 422."""
        response = client.post("/query")
        assert response.status_code == 422

    def test_query_accepts_valid_payload(self, client):
        """POST /query with valid payload should not return 422."""
        response = client.post(
            "/query",
            json={"q": "What is the remote work policy?", "thread_id": "test_001"}
        )
        # Should not be a validation error (422)
        # May be 200 (success) or 500 (if services are down)
        assert response.status_code != 422

    def test_query_default_thread_id(self, client):
        """POST /query without thread_id should use default."""
        response = client.post(
            "/query",
            json={"q": "Hello"}
        )
        assert response.status_code != 422


class TestGraphEndpoint:
    """Tests for the GET /graph endpoint."""

    def test_graph_endpoint_exists(self, client):
        """GET /graph should return 200 or 500 (if mermaid rendering fails)."""
        response = client.get("/graph")
        # Either succeeds with PNG or fails gracefully
        assert response.status_code in (200, 500)
