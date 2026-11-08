#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -hide_banner -version | head -1
ffprobe -hide_banner -version | head -1
mkdir -p report
ffmpeg -v error -y -f lavfi -i color=c=black:s=320x568:r=12:d=1 -f lavfi -i sine=f=440:d=1 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest report/ffmpeg-test.mp4
ffprobe -v error -show_entries format=duration -of json report/ffmpeg-test.mp4
python3 -c 'import faster_whisper; print("Whisper backend import verified")'
python3 -m yt_dlp --version
./node_modules/.bin/hyperframes --help >/dev/null
./node_modules/.bin/openfilm --help >/dev/null
./node_modules/.bin/remotion --help >/dev/null
echo 'W1 creative tools CLI smoke test passed'
