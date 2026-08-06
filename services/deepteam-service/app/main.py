"""FastAPI wrapper for Confident AI DeepTeam red teaming and guardrails."""

from __future__ import annotations

import os
from typing import Annotated, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .guards import run_guard
from .scanner import is_stub_mode, run_security_scan

load_dotenv()

app = FastAPI(title="AI-Pass DeepTeam Security Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    engine: str
    stub_mode: bool
    deepteam_installed: bool
    openai_configured: bool


class ScanRequest(BaseModel):
    systemId: Optional[str] = None
    targetUrl: Optional[str] = None
    framework: Optional[str] = Field(
        default=None,
        description="OWASP, NIST, MITRE, Aegis, BeaverTails, OWASP_ASI_2026",
    )
    vulnerabilities: Optional[List[str]] = None
    attacks: Optional[List[str]] = None


class GuardRequest(BaseModel):
    channel: Literal["input", "output"]
    text: str
    pairedText: Optional[str] = None


def _require_api_key(authorization: Optional[str] = None) -> None:
    expected = os.getenv("DEEPTEAM_SERVICE_API_KEY", "").strip()
    if not expected:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing DeepTeam service API key")
    token = authorization.removeprefix("Bearer ").strip()
    if token != expected:
        raise HTTPException(status_code=403, detail="Invalid DeepTeam service API key")


def _deepteam_installed() -> bool:
    try:
        import deepteam  # noqa: F401

        return True
    except ImportError:
        return False


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        engine="confident-ai/deepteam",
        stub_mode=is_stub_mode(),
        deepteam_installed=_deepteam_installed(),
        openai_configured=bool(os.getenv("OPENAI_API_KEY", "").strip()),
    )


@app.post("/security/scan")
async def scan(
    body: ScanRequest,
    authorization: Annotated[Optional[str], Header()] = None,
) -> dict:
    _require_api_key(authorization)
    try:
        return await run_security_scan(
            target_url=body.targetUrl,
            framework=body.framework,
            vulnerabilities=body.vulnerabilities,
            attacks=body.attacks,
            system_id=body.systemId,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Scan failed: {exc}") from exc


@app.post("/security/guard")
async def guard(
    body: GuardRequest,
    authorization: Annotated[Optional[str], Header()] = None,
) -> dict:
    _require_api_key(authorization)
    try:
        return run_guard(channel=body.channel, text=body.text, paired_text=body.pairedText)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Guard failed: {exc}") from exc


def main() -> None:
    import uvicorn

    host = os.getenv("DEEPTEAM_HOST", "0.0.0.0")
    port = int(os.getenv("DEEPTEAM_PORT", "8200"))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
