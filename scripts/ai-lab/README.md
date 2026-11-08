# W1 Capital — AI Lab / integração dos novos motores (08/11/2026)

Este é o **inventário de instalação reproduzível** do W1 Reel Studio. O site público em HTML estático **não** executa Python, FFmpeg, modelos de vídeo ou MCP; cada motor precisa de um runner/servidor apropriado. O que já existe permanece em `scripts/reel-studio/` e `scripts/higgsfield/`; manter geração, mídia privada e chaves **fora** do site.

## Componentes já existentes
- W1 Reel Studio: `node scripts/reel-studio/studio.mjs doctor`, validação, legendas, voz e montagem MP4 por FFmpeg.
- Cliente Open-Higgsfield: `node scripts/higgsfield/render.mjs doctor`; exige instância privada/autorizada.
- Genjutsu: clipes produzidos em serviço externo/instalação própria entram no Reel Studio após revisão integral, sob licença aplicável.
- VoiceStudio: cliente localhost apenas; não é um motor de voz instalado na hospedagem pública.

## Novos componentes e instalação em um ambiente autorizado

### 1. Hypit — https://github.com/hypit-ai/hypit
Requisitos documentados pelo upstream: agente de código compatível com skills, ambiente Node apropriado, ferramentas de render e, conforme o caso, modelos/API. Em runner próprio ou workspace autorizado:

```sh
npx skills add hypit-ai/hypit -g
```

Esta instrução instala a skill no ambiente **em que for executada**, não no site público. O Hypit pode gerar composições sem modelos generativos, mas renders e mídia real ainda exigem dependências. Sua licença modificada **permite uso interno/comercial para a própria organização**, porém restringe SaaS multi-tenant, redistribuição comercial e alterações a avisos de marca. Não incorporar o código como serviço para clientes sem revisar licença.

### 2. AI YouTube Shorts Generator — https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator
MIT. Python 3.10+ e modo API (MuAPI, com chave, potencial custo) ou modo local (FFmpeg, yt-dlp, faster-whisper, OpenCV e API OpenAI/Gemini para ranking). Instalar **isoladamente**, não na raiz do SITE:

```sh
git clone https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator.git ./private/tools/ai-shorts
python3 -m venv ./private/tools/ai-shorts/.venv
./private/tools/ai-shorts/.venv/bin/pip install -r ./private/tools/ai-shorts/requirements-local.txt
```

Executar só depois de revisar commit, dependências, memória e termos de uso dos vídeos. Preferir entrada por arquivo próprio/licenciado, por exemplo `python main.py ./private/meu-video.mp4 --mode local`, **dentro da pasta do programa** e após configurar provedor remoto de LLM. O modo local não é 100% offline e não garante custo zero. Os MP4 de saída podem ser usados como **clipes reais licenciados**, depois revisados, no Reel Studio.

### 3. MotionSmith Pro V2 — https://github.com/webportalim/MotionSmith-AI-Pro-Text-to-Motion-for-Sequencer
O repositório é essencialmente um README, não contém o plugin instalável. É produto para Unreal Engine 5.8, Windows 64-bit e GPU NVIDIA CUDA; runtime/modelos e licença de Fab são separados. **Não instalar no frontend da W1 nem prometer que funciona em celular/PC fraco.** Quando houver ambiente adequado, seguir documentação oficial e importar apenas o vídeo renderizado e autorizado ao Reel Studio.

### 4. Endpoint informado — https://motionsmith.miftahul.com/api/mcp
A resposta pública/autenticidade do endereço **não pôde ser confirmada**. Não misturar com MotionSmith Pro V2 nem registrar como MCP instalado. Não conectar chaves, contas, dados jurídicos ou serviços internos ao endpoint sem verificar a identidade/termos do operador e o fluxo OAuth.

## Fluxo integrado
Briefing de marketing → capturas **reais** de site/produto → Hypit (composição opcional) / Shorts Generator (cortes) / Higgsfield-Genjutsu (B-roll autorizado) → exportar arquivos revisados → Reel Studio (legenda, narração natural, música e efeitos) → revisão completa do MP4 → publicação autorizada.

## Estado real nesta entrega
- `/projetos/`: página pública com inventário e gerador de **roteiros-base determinísticos**.
- Materiais de referência: `creative/reels/REFERENCIAS_VISUAIS_CARROSSEIS_2026-11-08.md`.
- Esta pasta registra integrações e comandos. **Não declara** Hypit, Shorts, Unreal ou MCP instalados e operacionais em servidor; a instalação precisa ser executada em runtime com acesso à rede, recursos e autorizações.
- Não publicar serviço, acessar provedores pagos, enviar dados nem configurar segredos no GitHub para “automatizar” antes da verificação.
