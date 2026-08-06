#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$ROOT/scripts/_write_model_hub_ui.py"
echo "Model Hub UI ready at $ROOT/apps/web/app/workspace/model-hub"
