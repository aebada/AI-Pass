#!/usr/bin/env python3
"""Upload a zip overlay to aipass.space via FTPS + self-deleting PHP receive.

Hostinger requires TLS session reuse on the FTPS data channel (PROT P).
Plain lftp/curl often fail with: Temporary hidden file /.in.<name>. already exists
after a broken data-channel handshake.

Usage:
  set -a; source .local-secrets/deploy.env; set +a
  python3 scripts/deploy-overlay-ftps.py /tmp/demo-overlay.zip
"""
from __future__ import annotations

import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from ftplib import FTP, FTP_TLS, error_perm


class FTP_TLS_Reuse(FTP_TLS):
    """FTPS with TLS session reuse on data connections."""

    def ntransfercmd(self, cmd, rest=None):
        conn, size = FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            conn = self.context.wrap_socket(
                conn,
                server_hostname=None,
                session=self.sock.session,
            )
        return conn, size


def main() -> int:
    zip_path = sys.argv[1] if len(sys.argv) > 1 else ""
    if not zip_path or not os.path.isfile(zip_path):
        print("usage: deploy-overlay-ftps.py <overlay.zip>", file=sys.stderr)
        return 2

    host = os.environ["FTP_HOST"]
    user = os.environ["FTP_USER"]
    passwd = os.environ["FTP_PASS"]
    key = os.environ["EXTRACT_KEY"]
    recv = f"__aipass_recv_{int(time.time())}.php"

    php = f"""<?php
$key = {key!r};
if (!hash_equals($key, $_GET['k'] ?? '')) {{ http_response_code(403); exit('forbidden'); }}
$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) < 100) {{ http_response_code(400); exit('empty'); }}
$zipPath = __DIR__ . '/__aipass_overlay.zip';
file_put_contents($zipPath, $raw);
$zip = new ZipArchive();
if ($zip->open($zipPath) !== true) {{ http_response_code(500); exit('open fail'); }}
$zip->extractTo(__DIR__);
$n = $zip->numFiles;
$zip->close();
@unlink($zipPath);
@unlink(__FILE__);
echo "RECEIVE_OK files=$n " . date('c');
"""
    local_php = f"/tmp/{recv}"
    with open(local_php, "w", encoding="utf-8") as f:
        f.write(php)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    ftp = FTP_TLS_Reuse(context=ctx, timeout=90)
    ftp.connect(host, 21)
    ftp.login(user, passwd)
    ftp.prot_p()
    ftp.set_pasv(True)

    for victim in (recv, f".in.{recv}", f".in.{recv}.", f"/ .in.{recv}."):
        victim = victim.replace("/ ", "/")
        try:
            ftp.delete(victim)
        except error_perm:
            pass

    with open(local_php, "rb") as f:
        ftp.storbinary(f"STOR {recv}", f)
    ftp.quit()
    print(f"FTPS_OK {recv}")

    try:
        urllib.request.urlopen(f"https://aipass.space/{recv}", timeout=20)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        if e.code != 403 or body.strip() != "forbidden":
            print(f"unexpected probe {e.code} {body[:120]}", file=sys.stderr)
            return 1
    else:
        print("probe did not return 403 forbidden", file=sys.stderr)
        return 1

    data = open(zip_path, "rb").read()
    req = urllib.request.Request(
        f"https://aipass.space/{recv}?k={key}",
        data=data,
        method="POST",
        headers={"Content-Type": "application/zip", "Content-Length": str(len(data))},
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        print(resp.read().decode("utf-8", "replace"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
