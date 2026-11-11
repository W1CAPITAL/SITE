#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p upstream
while read -r name repo; do
 [ -n "$name" ] || continue
 if [ ! -d "upstream/$name/.git" ];then git clone --depth=1 "https://github.com/$repo.git" "upstream/$name";fi
 printf '%-24s %s\n' "$name" "$(git -C "upstream/$name" rev-parse --short HEAD)"
done <<'REPOSITORIES'
openfilm openfilm/openfilm
hyperframes heygen-com/hyperframes
remotion remotion-dev/remotion
open-higgsfield wide-trace/open-higgsfield
genjutsu-workflow sirioberati/Genjustsu-Open-Source-Workflow
open-genjutsu-a abdullayevziyodulla/open-genjutsu
open-genjutsu-b Anil-matcha/open-genjutsu
voicestudio debpalash/VoiceStudio
REPOSITORIES
