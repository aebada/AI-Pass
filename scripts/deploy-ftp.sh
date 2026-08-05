#!/usr/bin/env bash
# Deploy apps/web static export to Hostinger FTP (live site: https://aipass.space).
# Credentials via environment (never commit passwords):
#   FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR (default: /)
#
# Example:
#   export FTP_HOST=92.113.19.130   # Hostinger FTP IP (may differ from public CDN A records)
#   export FTP_USER='u234903558.aipass'
#   export FTP_PASS='your-ftp-password'
#   export FTP_REMOTE_DIR=/
#   ./scripts/build-web-static.sh && ./scripts/deploy-ftp.sh
#
# If PASV data channels time out from cloud agents, prefer a local machine upload,
# or zip apps/web/out and extract via Hostinger hPanel File Manager.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/apps/web/out"

: "${FTP_HOST:?Set FTP_HOST}"
: "${FTP_USER:?Set FTP_USER}"
: "${FTP_PASS:?Set FTP_PASS}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "No static build found; running scripts/build-web-static.sh ..."
  "$ROOT/scripts/build-web-static.sh"
fi

echo "Uploading $OUT_DIR -> ftp://${FTP_HOST}${FTP_REMOTE_DIR}"

python3 - "$OUT_DIR" "$FTP_HOST" "$FTP_USER" "$FTP_PASS" "$FTP_REMOTE_DIR" <<'PY'
import os, sys, time
from ftplib import FTP, error_perm
from pathlib import Path

out_dir = Path(sys.argv[1])
host, user, password, remote_dir = sys.argv[2:6]
remote_dir = remote_dir if remote_dir.endswith("/") else remote_dir + "/"
if not remote_dir.startswith("/"):
    remote_dir = "/" + remote_dir

class FTPFixed(FTP):
    def makepasv(self):
        h, p = super().makepasv()
        peer = self.sock.getpeername()[0]
        if h != peer:
            print(f"PASV rewrite {h} -> {peer}", flush=True)
        return peer, p

def connect():
    ftp = FTPFixed()
    ftp.connect(host, 21, timeout=90)
    ftp.login(user, password)
    ftp.set_pasv(True)
    ftp.encoding = "utf-8"
    return ftp

def ensure_dir(ftp, path: str):
    parts = [p for p in path.strip("/").split("/") if p]
    cur = ""
    for part in parts:
        cur = f"{cur}/{part}"
        try:
            ftp.mkd(cur)
        except error_perm as e:
            # 550 already exists is fine
            if not str(e).startswith("550"):
                # some servers return 521/550 variants
                pass

ftp = connect()
files = sorted(p for p in out_dir.rglob("*") if p.is_file())
ok = fail = 0
for i, path in enumerate(files, 1):
    rel = path.relative_to(out_dir).as_posix()
    remote_path = f"{remote_dir.rstrip('/')}/{rel}"
    parent = remote_path.rsplit("/", 1)[0]
    for attempt in range(1, 4):
        try:
            if parent and parent != "/":
                ensure_dir(ftp, parent)
            ftp.voidcmd("TYPE I")
            with path.open("rb") as fh:
                ftp.storbinary(f"STOR {remote_path}", fh)
            ok += 1
            if i % 25 == 0 or i == len(files):
                print(f"  {i}/{len(files)} uploaded", flush=True)
            break
        except Exception as e:
            print(f"retry {attempt} {rel}: {e}", flush=True)
            try:
                ftp.close()
            except Exception:
                pass
            time.sleep(2 * attempt)
            try:
                ftp = connect()
            except Exception as ce:
                print(f"reconnect failed: {ce}", flush=True)
                fail += 1
                break
    else:
        fail += 1

try:
    ftp.quit()
except Exception:
    pass

print(f"Uploaded {ok} files ({fail} failed).")
if fail:
    sys.exit(1)
PY

# Optionally remove accidental monorepo junk from an earlier bad upload.
if [[ "${FTP_CLEAN_REPO_JUNK:-0}" == "1" ]]; then
  echo "Note: set FTP_CLEAN_REPO_JUNK=1 only after verifying the site; recursive delete is manual in hPanel File Manager if needed."
fi

echo "Deploy complete."
