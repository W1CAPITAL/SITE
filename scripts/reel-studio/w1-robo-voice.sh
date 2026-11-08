#!/usr/bin/env bash
# VoiceStudio 3900 + W1 Reel Studio. Execute only in a private worker.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MEDIA_DIR="${1:-}"
[[ -n "$MEDIA_DIR" && -d "$MEDIA_DIR" ]] || { echo "Uso: bash scripts/reel-studio/w1-robo-voice.sh /pasta/privada" >&2; exit 2; }
MEDIA_DIR="$(cd "$MEDIA_DIR" && pwd)"
[[ "$MEDIA_DIR" != "$ROOT"* ]] || { echo "Mídia deve ficar fora do repositório público." >&2; exit 2; }
for f in referencia_voz_gemini.wav 02_automacao.txt 03_convite.txt; do
  [[ -s "$MEDIA_DIR/$f" ]] || { echo "Falta $MEDIA_DIR/$f" >&2; exit 2; }
done
export VOICESTUDIO_BASE_URL="${VOICESTUDIO_BASE_URL:-http://127.0.0.1:3900}"
echo "[1/4] Verificando perfis reais no VoiceStudio..."
node "$ROOT/scripts/reel-studio/studio.mjs" voices
VOICE_ID="${W1_VOICE_PROFILE_ID:-}"
if [[ -z "$VOICE_ID" ]]; then
  [[ "${VOICE_REFERENCE_CONSENT:-}" == yes ]] || { echo "Confirme VOICE_REFERENCE_CONSENT=yes para criar uma voz usando referência." >&2; exit 2; }
  echo "[2/4] Criando perfil privado de voz..."
  RESULT="$(node "$ROOT/scripts/reel-studio/studio.mjs" clone "$MEDIA_DIR/referencia_voz_gemini.wav" W1_Robo)"
  VOICE_ID="$(printf '%s' "$RESULT" | node -e 'let b="";process.stdin.on("data",x=>b+=x);process.stdin.on("end",()=>{const x=JSON.parse(b); if(!x.id)process.exit(1);process.stdout.write(x.id)})')"
else echo "[2/4] Usando perfil existente";fi
echo "[3/4] Sintetizando as duas falas com o MESMO perfil..."
node "$ROOT/scripts/reel-studio/studio.mjs" voice "$MEDIA_DIR/02_automacao.txt" "$VOICE_ID" "$MEDIA_DIR/cap2.wav"
node "$ROOT/scripts/reel-studio/studio.mjs" voice "$MEDIA_DIR/03_convite.txt" "$VOICE_ID" "$MEDIA_DIR/cap3.wav"
echo "[4/4] Narração gerada. Ouça cap2.wav/cap3.wav antes de montar o vídeo."
echo "Perfil de voz: $VOICE_ID"
echo "Arquivos: $MEDIA_DIR/cap2.wav | $MEDIA_DIR/cap3.wav"
