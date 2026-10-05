#!/usr/bin/env python3
"""Upload research pages + homepage assets to Hostinger (retry-tolerant FTP)."""

from __future__ import annotations

import random
import re
import sys
import time
from io import BytesIO
from pathlib import Path

import ftplib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
SECRET = ROOT / ".local-secrets" / "deploy.env"


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in SECRET.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key] = value
    return env


def connect(env: dict[str, str]) -> ftplib.FTP:
    ftp = ftplib.FTP()
    ftp.connect(env["FTP_HOST"], 21, timeout=90)
    ftp.login(env["FTP_USER"], env["FTP_PASS"])
    ftp.set_pasv(True)
    ftp.voidcmd("TYPE I")
    return ftp


def ensure_cwd(ftp: ftplib.FTP, remote: str) -> None:
    ftp.cwd("/")
    for part in Path(remote).parent.as_posix().strip("/").split("/"):
        if not part:
            continue
        try:
            ftp.mkd(part)
        except ftplib.error_perm:
            pass
        ftp.cwd(part)


def dele_hidden(env: dict[str, str], path: str) -> None:
    try:
        ftp = connect(env)
        print("  DELE", path, ftp.sendcmd(f"DELE {path}"), flush=True)
        ftp.quit()
    except Exception as exc:  # noqa: BLE001
        print(f"  hidden dele fail: {exc}", flush=True)


def upload(env: dict[str, str], local: Path, remote: str) -> None:
    payload = local.read_bytes()
    name = Path(remote).name
    last_err: Exception | None = None
    for attempt in range(16):
        tmp = f"u{int(time.time()) % 100000}{random.randint(10, 99)}.{name[-14:]}"
        try:
            ftp = connect(env)
            ensure_cwd(ftp, remote)
            for candidate in (f".in.{tmp}.", f".in.{name}.", tmp, f"{name}.uploading"):
                try:
                    ftp.delete(candidate)
                except Exception:
                    pass
            print(f"[{attempt + 1}] {remote} ({len(payload)})", flush=True)
            ftp.storbinary(f"STOR {tmp}", BytesIO(payload), blocksize=4096)
            try:
                ftp.delete(name)
            except Exception:
                pass
            try:
                ftp.rename(tmp, name)
            except Exception:
                ftp.storbinary(f"STOR {name}", BytesIO(payload), blocksize=4096)
                try:
                    ftp.delete(tmp)
                except Exception:
                    pass
            size = ftp.size(name)
            ftp.quit()
            if size != len(payload):
                raise RuntimeError(f"size mismatch {size}!={len(payload)}")
            print(f"  OK {remote}", flush=True)
            return
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            msg = str(exc)
            print(f"  fail {type(exc).__name__}: {msg[:160]}", flush=True)
            match = re.search(r"Temporary hidden file (\S+)", msg)
            if match:
                dele_hidden(env, match.group(1).rstrip(":"))
            time.sleep(min(40.0, 2.0 * (attempt + 1)))
    raise RuntimeError(f"FAILED {remote}: {last_err}")


def collect() -> list[tuple[Path, str]]:
    files: list[Path] = []
    for path in [
        OUT / ".htaccess",
        OUT / "index.html",
        OUT / "research.html",
        *sorted((OUT / "research").glob("*.html")),
    ]:
        if path.exists():
            files.append(path)

    html = ""
    for path in [
        OUT / "index.html",
        OUT / "research/index.html",
        OUT / "research.html",
        *sorted((OUT / "research").glob("*.html")),
    ]:
        if path.exists():
            html += path.read_text(errors="ignore")

    for ref in sorted(set(re.findall(r'/_next/[^"\'\\\s]+', html))):
        local = OUT / ref.lstrip("/")
        if local.exists() and local.is_file():
            files.append(local)

    for logo in ("logo-icon.png", "logo.svg", "logo-light.svg"):
        path = OUT / logo
        if path.exists():
            files.append(path)

    def rank(path: Path) -> tuple[int, str]:
        rel = path.relative_to(OUT).as_posix()
        if rel.endswith(".css"):
            return (0, rel)
        if rel.endswith(".js"):
            return (1, rel)
        if rel == ".htaccess":
            return (2, rel)
        if rel.endswith(".html"):
            return (3, rel)
        return (4, rel)

    seen: set[Path] = set()
    out: list[tuple[Path, str]] = []
    for path in sorted(files, key=rank):
        if path in seen:
            continue
        seen.add(path)
        out.append((path, "/" + path.relative_to(OUT).as_posix()))
    return out


def main() -> int:
    if not SECRET.exists():
        print("missing deploy secrets", file=sys.stderr)
        return 1
    if not OUT.exists():
        print(f"missing export dir {OUT}", file=sys.stderr)
        return 1
    env = load_env()
    items = collect()
    print(f"uploading {len(items)} files for /research + home", flush=True)
    for index, (local, remote) in enumerate(items, 1):
        print(f"({index}/{len(items)}) {remote}", flush=True)
        upload(env, local, remote)
        time.sleep(0.8)
    print("UPLOAD_COMPLETE", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
