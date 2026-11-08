# W1 Reel Studio — Open-Higgsfield, Genjutsu e VoiceStudio

Editor original da W1 para Reels com **vídeos em movimento**, cortes de ritmo real, legendas feitas na edição, narração aprovada e música com volume reduzido automaticamente durante a fala. Node.js 22 + FFmpeg (libass e libx264). Nenhuma dependência npm. Não copia os códigos ou modelos dos projetos citados.

## Repositórios auditados e uso

- [Open-Higgsfield](https://github.com/TechBeme/open-higgsfield): gere B-roll em instância **privada** com um provedor conectado; a integração ao LexisPredict já existe. MIT.
- [Sirio Genjustsu](https://github.com/sirioberati/Genjustsu-Open-Source-Workflow): depth + SAM + Seedance via Enhancor; requer exame visual integral de máscaras e resultado. MIT.
- [Abdullayev Open Genjutsu](https://github.com/abdullayevziyodulla/open-genjutsu): motor de preparação para Seedance/Oxen, Replicate/Lec ou Wan. MIT.
- [Anil Open Genjutsu](https://github.com/Anil-matcha/open-genjutsu): referências MuAPI/Seedance/Wan e transferência de movimento. MIT.
- [VoiceStudio](https://github.com/debpalash/VoiceStudio): gera WAV pt-BR usando API de fala compatível com OpenAI em **localhost**. AGPL-3.0; permanece serviço **separado**, sem integrar seu código ao produto W1.

Esses motores não garantem fidelidade perfeita e podem requerer pagamento, GPUs, modelos baixados e credenciais. **Nenhuma geração paga é iniciada pelo editor.** Nunca transforme clipes conceituais em supostas demonstrações reais.

## Como produzir

Mantenha mídia, fotos de clientes, áudios e planos privados fora do GitHub. Edite scripts/reel-studio/sample-plan.json e substitua vídeos/áudios por arquivos **próprios ou licenciados** em uma pasta local, como private/.

    node scripts/reel-studio/studio.mjs doctor
    node --test scripts/reel-studio/studio.test.mjs
    VOICESTUDIO_BASE_URL=http://127.0.0.1:3900 node scripts/reel-studio/studio.mjs voices
    # Após confirmar autorização de uso do áudio de referência:
    VOICE_REFERENCE_CONSENT=yes node scripts/reel-studio/studio.mjs clone ./private/voz-referencia.wav W1_Robo ./private/transcricao-referencia.txt
    # O comando acima retorna o ID do perfil clonado para usar no comando voice.
    VOICESTUDIO_BASE_URL=http://127.0.0.1:8000 node scripts/reel-studio/studio.mjs voice ./private/roteiro.txt VOZ_AUTORIZADA ./private/assets/voz.wav
    node scripts/reel-studio/studio.mjs validate ./private/plan.json
    node scripts/reel-studio/studio.mjs render ./private/plan.json ./private/reel-final.mp4

O comando voice exige VoiceStudio funcionando localmente na porta oficial 3900, com voz e modelo realmente instalados. Se a voz estiver artificial, **não publique**: escolha outra voz ou grave uma narração humana. Não existe fallback robótico.

## Fluxo visual

1. Capture vídeos **reais** de sites W1 ou LexisPredict, ocultando nomes e dados jurídicos.
2. Para recasting, use o software Genjutsu original em localhost com seus vídeos e referências autorizadas; revise o clipe completo, máscara e output. Exporte MP4 aprovado para sua pasta local.
3. No plano marque esse clipe como kind=generated, informe provider com URL de repositório identificada, fullClipReviewed=true somente após inspeção e legenda contendo “Cena ilustrativa”. Nunca use um vídeo gerado para função proof.
4. Faça roteiro de 8 a 40 segundos: gancho até 2 s, demonstração real e CTA em até 3 s; use várias tomadas reais, não um slideshow.
5. Gere ou grave voz, escute e valide, adicione música autorizada discreta e marque as legendas pelo tempo.
6. Renderize MP4 H.264/AAC 1080x1920, 30 fps; confira no celular **inteiro**, checando legibilidade, cortes, naturalidade e sincronismo antes de publicar.

O editor fornece normalização de loudness, ducking da música por sidechain e fundo desfocado para capturas horizontais. Opcionalmente, adicione no bloco audio do plano uma faixa de Foley sincronizada (effects: assets/foley.wav, effectsRights: owned/ licensed/ consented, effectsGain: 0.15). Os efeitos têm volume separado da música e da narração. O comando voices lista somente perfis de voz cadastrados no VoiceStudio; isso não substitui a audição humana para verificar naturalidade. O teste automatizado realiza um render real com material **sintético apenas para testes**, jamais anunciado como Reel comercial.

## Segurança e licença

O código W1 é próprio; projetos externos são serviços independentes, com licenças preservadas. Proteja instâncias locais e tokens. Uso de rostos/vozes exige autorização. Nunca aceite custos de geração, HD ou reenvios incertos automaticamente. GitHub contém somente o código de montagem, não modelos generativos executáveis neste chat.

## Continuidade de voz: referência 75369.mp4 e VoiceStudio

O vídeo educativo fornecido pelo proprietário em 08/11/2026 apresenta o VoiceStudio como alternativa local de síntese/clonagem e destaca gráficos com forte contraste, frases de impacto e transições sincronizadas com a voz. **O vídeo é referência de técnicas, não prova que uma instalação específica já roda na W1**. “Sem limite” ou “gratuito” refere-se à ausência de mensalidade da versão local; há custos de hardware, tempo, licença de modelo e infraestrutura.

- Instância oficial atual: `http://127.0.0.1:3900` (em vez do 8000 assumido originalmente). `/v1/audio/voices` lista perfis locais e `/v1/audio/speech` sintetiza a partir de um perfil.
- `POST /profiles` cria um perfil com áudio de referência WAV; este editor oferece `clone` com confirmação de autorização, retorno de ID e sem armazenar o WAV no GitHub público.
- A amostra ideal é voz isolada, com poucos efeitos e sem música, claramente autorizada; o áudio da primeira cena do Gemini deve ser avaliado como referência de personagem sintética, **sem alegar identidade idêntica garantida**.
- Opcional: `OMNIVOICE_API_KEY` no ambiente do worker privado é enviado como Bearer; **não** registrar a chave em arquivo versionado, workflow ou browser. `VOICESTUDIO_BASE_URL` aceita somente localhost, por segurança.
- O comando `voice` gera WAV para cada capítulo; só depois entra no `render` do Reel Studio, com mesma voz e mixagem. Faça audição completa antes de publicar.
- O workflow `.github/workflows/w1-reel-studio.yml` executa **testes**, não sobe uma instância persistente do VoiceStudio. Para gerar uma voz real, o serviço precisa estar ativo no mesmo worker de produção, com modelo pt-BR baixado e mídia privada disponível. **Não confundir código integrado com serviço instalado em um runner do GitHub.**

Documentação upstream consultada: https://github.com/debpalash/VoiceStudio/blob/main/docs/agentic-voice.md e https://github.com/debpalash/VoiceStudio/blob/main/backend/api/routers/profiles.py

### Checklist do master para Reels
1. Mesmo perfil de voz nos três capítulos; escutar cada fala inteira e verificar prosódia pt-BR.
2. Continuidade do personagem 3D (modelo, materiais, pose, iluminação), evitando telas de apresentação com silhueta estática.
3. Motion em JavaScript: gancho imediato, tipografia legível e animações no tempo da narração, sem copiar vídeos de terceiros.
4. Foley leve apenas nos movimentos visíveis, trilha única licenciada, sem empilhar memes; voz na frente.
5. MP4 vertical 1080 × 1920 / 30 fps, quadro final aprovado, sem prometer integração de Direct não instalada.
