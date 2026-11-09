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
    VOICESTUDIO_BASE_URL=http://127.0.0.1:8000 node scripts/reel-studio/studio.mjs voices
    VOICESTUDIO_BASE_URL=http://127.0.0.1:8000 node scripts/reel-studio/studio.mjs voice ./private/roteiro.txt VOZ_AUTORIZADA ./private/assets/voz.wav
    node scripts/reel-studio/studio.mjs validate ./private/plan.json
    node scripts/reel-studio/studio.mjs render ./private/plan.json ./private/reel-final.mp4

O comando voice exige VoiceStudio funcionando localmente, com voz e modelo realmente instalados. Se a voz estiver artificial, **não publique**: escolha outra voz ou grave uma narração humana. Não existe fallback robótico.

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

## Referência de voz oficial da W1 (09/11/2026)

O titular confirmou que a amostra limpa de **9,07 s** usada anteriormente para clonagem e as gravações adicionais de **4,5 s e 9,4 s** são de sua própria voz. Elas estão apenas no acervo privado da W1, em `Materiais de vídeo/Referencias privadas de voz`. Nunca publicá-las no GitHub.

**Leia antes de renderizar**: [proveniência e critérios de aprovação da voz](../../creative/reels/VOZ_DAVI_REFERENCIAS_PRIVADAS.md). O último Reels VoiceStudio com contraste corrigido permanece **SEM VOZ CLONADA**. Ter amostra salva ou um adaptador VoiceStudio no código **não confirma** uma narração criada ou misturada ao MP4. É obrigatório gerar fala com um motor efetivamente executado, inserir na timeline, escutar o resultado e validar.
