import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.config import get_settings

settings = get_settings()

logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger("ai_pass.backend_api")
logger.info("Starting %s in %s mode (debug=%s)", settings.app_name, settings.app_env, settings.debug)

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
