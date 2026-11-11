#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'const [a,b]=process.versions.node.split(".").map(Number);if(a<22||(a===22&&b<18))throw Error("OpenFilm source needs Node 22.18+")'
command -v ffmpeg
command -v ffprobe
npm install --no-audit --no-fund
python3 -m pip install -r requirements.txt
bash scripts/smoke-tools.sh
