import importlib

import pytest
from fastapi.testclient import TestClient


def _load_app(monkeypatch, app_env: str):
    monkeypatch.setenv("APP_ENV", app_env)
    from app import config, main

    importlib.reload(config)
    importlib.reload(main)
    return main.app


def test_health_check_development(monkeypatch):
    app = _load_app(monkeypatch, "development")
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "environment": "development"}


def test_docs_enabled_outside_production(monkeypatch):
    app = _load_app(monkeypatch, "development")
    client = TestClient(app)

    assert client.get("/docs").status_code == 200


def test_docs_disabled_in_production(monkeypatch):
    app = _load_app(monkeypatch, "production")
    client = TestClient(app)

    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404
