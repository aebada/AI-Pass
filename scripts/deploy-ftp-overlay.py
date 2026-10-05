#!/usr/bin/env python3
"""Overlay static export onto Hostinger FTP. One connection per file; never LIST."""

from __future__ import annotations

import os
import re
import sys
import time
from ftplib import FTP, error_perm
from pathlib import Path

SKIP_DIRS = {"auth", "auth-lib", "laravel-auth"}
SKIP_NAMES = {".env", ".env.local", ".env.production"}


def load_env() -> dict[str, str]:
    env = dict(os.environ)
    secret = Path(__file__).resolve().parents[1] / ".local-secrets" / "deploy.env"
    if secret.exists():
        for line in secret.read_text().splitlines():
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env.setdefault(key, value)
    return env


def should_skip(rel: Path) -> bool:
    if rel.name in SKIP_NAMES:
        return True
    return any(part in SKIP_DIRS for part in rel.parts)


def connect(env: dict[str, str]) -> FTP:
    ftp = FTP()
    ftp.connect(env["FTP_HOST"], 21, timeout=30)
    ftp.login(env["FTP_USER"], env["FTP_PASS"])
    ftp.set_pasv(True)
    ftp.voidcmd("TYPE I")
    if ftp.sock is not None:
        ftp.sock.settimeout(40)
    return ftp


def ensure_dir(ftp: FTP, remote_dir: str) -> None:
    parts = [p for p in remote_dir.split("/") if p]
    cwd = ""
    for part in parts:
        cwd = f"{cwd}/{part}"
        try:
            ftp.mkd(cwd)
        except error_perm:
            pass


def upload_one(env: dict[str, str], local: Path, remote: str) -> None:
    import re
    import socket

    last_err: Exception | None = None
    payload = local.read_bytes()
    for attempt in range(8):
        ctrl = None
        data = None
        try:
            ctrl = socket.create_connection((env["FTP_HOST"], 21), 20)

            def recv(timeout: float = 25) -> str:
                buf = b""
                ctrl.settimeout(timeout)
                while True:
                    chunk = ctrl.recv(4096)
                    if not chunk:
                        break
                    buf += chunk
                    lines = [ln for ln in buf.split(b"\r\n") if ln]
                    if lines and len(lines[-1]) >= 4 and lines[-1][3:4] == b" ":
                        break
                return buf.decode("latin1", "replace")

            recv()
            ctrl.sendall(f"USER {env['FTP_USER']}\r\n".encode())
            recv()
            ctrl.sendall(f"PASS {env['FTP_PASS']}\r\n".encode())
            login = recv()
            if "230" not in login:
                raise RuntimeError(login.strip())
            ctrl.sendall(b"TYPE I\r\n")
            recv()
            parent = str(Path(remote).parent)
            if parent not in {"", "/"}:
                ctrl.sendall(f"MKD {parent}\r\n".encode())
                recv()
            ctrl.sendall(b"PASV\r\n")
            pasv = recv()
            match = re.search(r"(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)", pasv)
            if not match:
                raise RuntimeError(pasv.strip())
            ip = ".".join(match.group(i) for i in range(1, 5))
            port = int(match.group(5)) * 256 + int(match.group(6))
            ctrl.sendall(f"STOR {remote}\r\n".encode())
            data = socket.create_connection((ip, port), 15)
            stor = recv(30)
            if stor.startswith("550") and ".in." in stor:
                ctrl.sendall(f"DELE {parent}/.in.{Path(remote).name}.\r\n".encode())
                recv()
                raise RuntimeError(stor.strip())
            if not stor.startswith("1"):
                raise RuntimeError(stor.strip())
            data.sendall(payload)
            data.close()
            data = None
            fin = recv(30)
            if "226" not in fin:
                raise RuntimeError(fin.strip())
            ctrl.sendall(b"QUIT\r\n")
            try:
                ctrl.close()
            except Exception:
                pass
            return
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            for sock in (data, ctrl):
                if sock is not None:
                    try:
                        sock.close()
                    except Exception:
                        pass
            time.sleep(1.4 * (attempt + 1))
    raise RuntimeError(f"{remote}: {last_err}")


def collect_files(root: Path, focus: bool) -> list[Path]:
    if focus:
        wanted: list[Path] = list(root.glob("research/**/*.html"))
        wanted += [root / "index.html", root / "research.html", root / ".htaccess"]
        html = ""
        for name in ("research/index.html", "index.html"):
            path = root / name
            if path.exists():
                html += path.read_text(errors="ignore")
        for ref in sorted(set(re.findall(r"/(?:_next/[^\"'\\\s]+|logo[^\"'\\\s]*)", html))):
            local = root / ref.lstrip("/")
            if local.exists() and local.is_file():
                wanted.append(local)
        seen: set[Path] = set()
        files: list[Path] = []
        for path in wanted:
            if path in seen:
                continue
            seen.add(path)
            files.append(path)

        def focus_rank(path: Path) -> tuple[int, str]:
            rel = path.relative_to(root).as_posix()
            if rel == ".htaccess":
                return (0, rel)
            if rel.endswith(".html") and rel.startswith("research"):
                return (1, rel)
            if rel == "research.html":
                return (1, rel)
            if rel == "index.html":
                return (2, rel)
            return (3, rel)

        files.sort(key=focus_rank)
        return files

    files = [p for p in root.rglob("*") if p.is_file() and not should_skip(p.relative_to(root))]

    def rank(path: Path) -> tuple[int, str]:
        rel = path.relative_to(root).as_posix()
        if rel.startswith("research") or rel.startswith("_next/") or rel in {"index.html", ".htaccess"}:
            return (0, rel)
        return (1, rel)

    files.sort(key=rank)
    return files


def main() -> int:
    env = load_env()
    root = Path(__file__).resolve().parents[1] / "apps" / "web" / "out"
    if not (root / "index.html").exists():
        print("static export missing", file=sys.stderr)
        return 1
    focus = env.get("FTP_FOCUS", "1") == "1"
    files = collect_files(root, focus)
    print(f"overlay {len(files)} files to ftp://{env['FTP_HOST']}/ focus={focus}")
    for i, path in enumerate(files, 1):
        remote = "/" + path.relative_to(root).as_posix()
        upload_one(env, path, remote)
        print(f"{i}/{len(files)} {remote}", flush=True)
        time.sleep(0.15)
    print("overlay complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
