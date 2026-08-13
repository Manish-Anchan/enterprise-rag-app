import pytest


class TestGuardrailsModule:
    """Tests for the guardrails module structure and initialization."""

    def test_guardrails_module_imports(self):
        """The guardrails module should be importable."""
        from app.guardrails import initialize_rails, guard, guard_async
        assert callable(initialize_rails)
        assert callable(guard)
        assert callable(guard_async)

    def test_guard_returns_tuple(self):
        """guard() should return a (bool, str) tuple even when not initialized."""
        from app.guardrails import guard
        result = guard("Hello")
        assert isinstance(result, tuple)
        assert len(result) == 2
        blocked, response = result
        assert isinstance(blocked, bool)
        assert isinstance(response, str)

    def test_guard_passes_through_when_not_initialized(self):
        """When guardrails are not initialized, all queries should pass through."""
        from app.guardrails import guard
        blocked, response = guard("What is the meaning of life?")
        # Without initialization, guardrails should fail-open
        assert blocked is False
        assert response == ""

    def test_config_files_exist(self):
        """Guardrails config files should exist in the expected location."""
        import os
        config_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "app", "guardrails", "config"
        )
        assert os.path.exists(os.path.join(config_dir, "config.yml"))
        assert os.path.exists(os.path.join(config_dir, "prompts.yml"))
        assert os.path.exists(os.path.join(config_dir, "rails.co"))

    def test_config_yml_has_required_fields(self):
        """config.yml should contain required guardrails configuration."""
        import os
        config_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "app", "guardrails", "config", "config.yml"
        )
        with open(config_path, "r") as f:
            content = f.read()
        assert "models:" in content
        assert "rails:" in content
        assert "input:" in content
        assert "self check input" in content
        assert "check off topic" in content
