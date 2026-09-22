"""Environment-aware application settings.

Loads variables from the OS environment first, then falls back to an
environment-specific dotenv file: `.env.<APP_ENV>` (e.g. `.env.staging`).
The active environment is selected via the `APP_ENV` system variable,
falling back to `ENVIRONMENT`, defaulting to `development` if neither is set.
"""
import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


def _active_environment() -> str:
    return os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or "development"


def _env_file_for(environment: str) -> Path:
    return BASE_DIR / f".env.{environment}"


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "AI-Pass Backend API"
    debug: bool = True

    host: str = "0.0.0.0"
    port: int = 8001

    log_level: str = "info"

    cors_allowed_origins: str = "http://localhost:3000"

    database_url: str = "sqlite:///./dev.db"
    secret_key: str = "dev-only-not-secret"

    model_config = SettingsConfigDict(
        env_file=str(_env_file_for(_active_environment())),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
