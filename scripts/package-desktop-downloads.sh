#!/usr/bin/env bash
# Build desktop IDE installers and copy them into apps/web/public/downloads for Hostinger.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="$ROOT/apps/desktop"
WEB_OUT="$ROOT/apps/web/out"
PUBLIC_DL="$ROOT/apps/web/public/downloads"
RELEASE="$DESKTOP/release"

export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_BUILDER_CACHE="${ELECTRON_BUILDER_CACHE:-$HOME/.cache/electron-builder}"

if [[ ! -f "$WEB_OUT/ide.html" ]]; then
  echo "error: static web export missing at $WEB_OUT/ide.html — run scripts/build-web-static.sh first" >&2
  exit 1
fi

mkdir -p "$PUBLIC_DL" "$RELEASE"
cd "$DESKTOP"

echo "==> Compiling Electron main process"
pnpm exec tsc

echo "==> Packaging Linux + Windows with electron-builder"
# Linux is native here; Windows portable/nsis can be built on Linux without Wine for many targets.
pnpm exec electron-builder --linux AppImage deb --win portable --x64 --publish never

# Optional macOS zip via electron-packager (produces .app folder that macOS can run unsigned locally)
echo "==> Packaging macOS .app zip"
pnpm exec electron-packager . "AI-Pass" \
  --platform=darwin \
  --arch=x64,arm64 \
  --out="$RELEASE/mac-packager" \
  --overwrite \
  --prune=true \
  --ignore="(^|/)\.git($|/)|(^|/)release($|/)|(^|/)node_modules/\.cache($|/)" \
  --extra-resource="$WEB_OUT" \
  || echo "warn: electron-packager mac build failed (continuing with linux/win)"

python3 - <<'PY'
from pathlib import Path
import re
import shutil
import zipfile

root = Path("/workspace")
release = root / "apps/desktop/release"
public = root / "apps/web/public/downloads"
public.mkdir(parents=True, exist_ok=True)

# Clear old binaries we manage
for pattern in ("AI-Pass*.AppImage", "AI-Pass*.deb", "AI-Pass*.exe", "AI-Pass*macOS*.zip", "latest.json"):
    for old in public.glob(pattern):
        old.unlink()

copied = []

def copy_as(src: Path, name: str):
    dest = public / name
    shutil.copy2(src, dest)
    copied.append((name, dest.stat().st_size))
    print(f"copied {src.name} -> {name} ({dest.stat().st_size} bytes)")

# electron-builder linux/win artifacts
for path in sorted(release.rglob("*")):
    if not path.is_file():
        continue
    name = path.name
    lower = name.lower()
    if lower.endswith(".appimage"):
        copy_as(path, "AI-Pass-Linux-x64.AppImage")
    elif lower.endswith(".deb"):
        copy_as(path, "AI-Pass-Linux-x64.deb")
    elif lower.endswith(".exe") and "portable" in lower:
        copy_as(path, "AI-Pass-Windows-x64.exe")
    elif lower.endswith(".exe") and "setup" in lower:
        copy_as(path, "AI-Pass-Windows-x64-Setup.exe")

# Zip mac .app bundles if packager produced them
mac_root = release / "mac-packager"
if mac_root.exists():
    for app_dir in mac_root.glob("AI-Pass-darwin-*/AI-Pass.app"):
        arch = "arm64" if "arm64" in str(app_dir) else "x64"
        zip_name = f"AI-Pass-macOS-{arch}.zip"
        zip_path = public / zip_name
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for file in app_dir.rglob("*"):
                if file.is_file():
                    zf.write(file, arcname=str(Path("AI-Pass.app") / file.relative_to(app_dir)))
        copied.append((zip_name, zip_path.stat().st_size))
        print(f"zipped {app_dir} -> {zip_name}")

# Universal convenience zip pointing users to both mac builds if present
mac_zips = list(public.glob("AI-Pass-macOS-*.zip"))
if mac_zips and not (public / "AI-Pass-macOS.zip").exists():
    # Prefer arm64 as primary mac download alias when available
    preferred = next((p for p in mac_zips if "arm64" in p.name), mac_zips[0])
    shutil.copy2(preferred, public / "AI-Pass-macOS.zip")
    copied.append(("AI-Pass-macOS.zip", (public / "AI-Pass-macOS.zip").stat().st_size))

manifest = {
    "version": "0.1.0",
    "generated": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    "files": [
        {"name": name, "size": size, "url": f"/downloads/{name}"}
        for name, size in copied
    ],
}
(public / "latest.json").write_text(__import__("json").dumps(manifest, indent=2) + "\n")
print("manifest files:", len(copied))
if not copied:
    raise SystemExit("No desktop artifacts were produced")
PY

# Ensure AppImage is executable bit preserved when served (FTP may strip; still set locally)
chmod +x "$PUBLIC_DL"/AI-Pass-Linux-x64.AppImage 2>/dev/null || true

echo "Desktop downloads ready in $PUBLIC_DL"
ls -lh "$PUBLIC_DL"
