#!/usr/bin/env bash
# Only for an authorized private worker: never execute in Vercel or a public site.
set -euo pipefail
mode="all"
if [[ $# -ge 1 ]]; then mode="$1"; fi
case "$mode" in all|hypit|shorts) ;; *) echo "Uso: $0 [all|hypit|shorts]" >&2; exit 2;; esac
if [[ "$(printenv W1_CREATIVE_INSTALL || true)" != "yes" ]]; then
  echo "Instalação bloqueada. Revise licenças e defina W1_CREATIVE_INSTALL=yes no worker privado." >&2
  exit 2
fi
: "$HOME"
dest="$(printenv W1_CREATIVE_TOOLS_DIR || true)"
if [[ -z "$dest" ]]; then dest="$HOME/.local/share/w1-capital/creative-lab"; fi
if [[ "$dest" != /* || "$dest" == "/" ]]; then echo "Use diretório absoluto fora do site." >&2; exit 2; fi
mkdir -p "$dest"
command -v git >/dev/null || { echo "Falta git." >&2; exit 2; }

install_source () {
  local name="$1" source_url="$2" sha="$3" target="$dest/$1"
  if [[ -e "$target" ]]; then
    if [[ ! -d "$target/.git" || "$(git -C "$target" rev-parse HEAD 2>/dev/null)" != "$sha" ]]; then
      echo "Diretório existente com versão divergente: $target. Nada será sobrescrito." >&2
      return 3
    fi
  else
    mkdir "$target"
    git -C "$target" init -q
    git -C "$target" remote add origin "$source_url"
    git -C "$target" fetch -q --depth 1 origin "$sha"
    git -C "$target" checkout -q --detach FETCH_HEAD
  fi
}

if [[ "$mode" == "all" || "$mode" == "hypit" ]]; then
  command -v node >/dev/null || { echo "Falta Node.js >=22.15." >&2; exit 2; }
  node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<15))process.exit(2)' ||
    { echo "Node.js >=22.15 obrigatório." >&2; exit 2; }
  install_source "hypit" "https://github.com/hypit-ai/hypit.git" "2d31e88765e297f0795348b460c77a6067f12261"
  if command -v pnpm >/dev/null; then
    (cd "$dest/hypit" && pnpm install --frozen-lockfile)
  elif command -v corepack >/dev/null; then
    (cd "$dest/hypit" && corepack pnpm install --frozen-lockfile)
  else
    echo "Código Hypit salvo. Falta instalar pnpm no worker para concluir dependências." >&2
    exit 3
  fi
  echo "Código e dependências Hypit preparados em $dest/hypit."
fi

if [[ "$mode" == "all" || "$mode" == "shorts" ]]; then
  command -v python3 >/dev/null || { echo "Falta Python >=3.10." >&2; exit 2; }
  python3 -c 'import sys;assert sys.version_info>=(3,10)' ||
    { echo "Python >=3.10 obrigatório." >&2; exit 2; }
  install_source "youtube-shorts" "https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator.git" "13451d439b71643bd3e9df091e0f3ca786610dc9"
  if [[ ! -d "$dest/youtube-shorts/.venv" ]]; then python3 -m venv "$dest/youtube-shorts/.venv"; fi
  "$dest/youtube-shorts/.venv/bin/python" -m pip install -r "$dest/youtube-shorts/requirements.txt"
  if [[ "$(printenv W1_SHORTS_LOCAL || true)" == "yes" ]]; then
    command -v ffmpeg >/dev/null || { echo "FFmpeg exigido no modo local." >&2; exit 2; }
    "$dest/youtube-shorts/.venv/bin/python" -m pip install -r "$dest/youtube-shorts/requirements-local.txt"
  fi
  echo "Shorts Generator preparado em $dest/youtube-shorts."
fi
echo "Concluído somente neste worker. Nenhuma mídia foi gerada e não houve cobrança nem publicação."
