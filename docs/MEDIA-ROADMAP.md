# W1 Capital — roteiro para vídeos, voz e reuniões

**Estado:** protótipos leves e políticas disponíveis; não há serviço de IA multimodal, clonagem de voz nem gravação de reuniões ativados no SITE. Base nos guias enviados: \`guia-pratico-hyperframes.pdf\` (14 p.), \`MiniMax H3 — Guia Completo.pdf\` (9 p.), \`OmniVoice — Guia Completo de Instalação e Uso.pdf\` (8 p.), \`Meetily — Guia Completo de Instalação e Teste.pdf\` (4 p., cópia duplicada).

## 1. Comercial de 15 segundos, com fonte original

Arquivos implementados:

- [Storyboard editável](../sales/media/spot-storyboard.json): quatro cenas sobre valor do tempo, catálogo, diagnóstico e marca W1.
- [Prévia navegável](../sales/media/spot-preview.html): página HTML/CSS com seleção de tempo, playback simples e as quatro cenas. Não carrega modelo, dados ou mídia remota.
- [Timeline determinística](../sales/media/spot-preview.js): função \`sceneAt(seconds)\` e interface \`window.W1BrandSpot.setTime(t)\` para posicionar um instante e capturar um frame sem aleatoriedade.

A prévia **não é um MP4** e também **não é um projeto HyperFrames completo**: fornece a direção editorial e o contrato de tempo para posterior adaptação a uma composição real. Nenhum áudio, imagem de pessoa ou obra musical de terceiros está incluído.

### Caminho de produção profissional com HyperFrames

O guia indica Node.js 22+, FFmpeg e uma instalação compatível. Em uma máquina de render apropriada, e **após** converter o storyboard para o contrato HTML específico do HyperFrames:

1. \`npx hyperframes doctor\` — validar runtime.
2. \`npx hyperframes lint\` — validar contrato da composição.
3. \`npx hyperframes check\` — confirmar layout, motion e qualidade.
4. \`npx hyperframes preview\` — revisar o resultado e a timeline.
5. \`npx hyperframes render --quality draft --output review.mp4\` — gerar versão de revisão.
6. \`npx hyperframes render --quality high --output master.mp4\` — render final aprovado.

Não executar essas etapas no PC fraco por padrão, nem assumir que um preview equivale a render concluído. Os vídeos precisam ser visualmente inspecionados, sem cortes ou texto ilegível; produção 4K só se houver recurso compatível.

## 2. MiniMax H3: opcional, não prioridade

O PDF descreve geração multimodal de vídeo e áudio com FL2VA e Ref2VA e requisitos de VRAM. O modelo é regido pela **MiniMax H3 Community License Agreement**, com condições territoriais e para serviços hospedados. Não classificar automaticamente como livre para qualquer produto comercial.

- Não instalar WanGP, CUDA ou pesos pesados no computador de escritório que não suporta Ollama.
- Somente avaliar geração remota se houver licença, disponibilidade, cota/custo verificáveis e aprovação da W1.
- Priorizar primeiro vídeos geométricos e narração humana gravada pela equipe, que são mais leves e controláveis.

## 3. OmniVoice: identidade de voz com consentimento

O guia apresenta \`Voice Clone\`, \`Voice Design\` e \`Auto Voice\`, com suporte dependente do backend. Clonar voz exige autorização explícita da pessoa e licença de uso do material.

**Fluxo futuro:** briefing de roteiro → escolha de voz própria ou devidamente autorizada → verificação de licença/modelo → geração em ambiente compatível → revisão humana → identificação como áudio sintético quando houver risco de confusão → registro de autorização e publicação.

É proibido usar a voz de cliente, celebridade, funcionário ou terceiro sem permissão para falsificar depoimento ou se passar pela pessoa. Não prometer gratuidade permanente, latência ou GPU mínima a partir do guia.

## 4. Meetily: atas e reuniões, com privacidade

O PDF explica que Meetily pode capturar áudio do sistema e do microfone localmente, transcrever por modelos como Whisper/Parakeet e usar modelos de resumo. Esse fluxo tem exigências de hardware; a alternativa via APIs transfere áudio/dados para terceiros e pode custar.

**Aplicação W1 atual:** [resumo manual](../sales/operations/meeting-notes.html), que exporta Markdown no navegador, sem microfone, gravação, IA, upload ou retenção.

**Se a W1 optar por gravar:** informar claramente todos os participantes, obter autorização legalmente adequada, definir finalidade e retenção, limitar acesso, não usar o áudio para treinar/clonar voz e preservar a possibilidade de recusa. Qualquer resumo com IA externa exige avaliação explícita do fluxo de dados.

## 5. Prompts de criação de conteúdo, sem rostos não autorizados

A referência \`prompt.pdf\` enviada neste lote descreve reconstrução de uma selfie fotográfica pessoal e não tem relação direta com o site W1. Não incorporamos esse prompt, imagem de pessoa, vestuário ou aparência a peças comerciais. Criativos W1 devem usar geometria própria, produto real, texto verificável e mídia com direitos esclarecidos.

### Texto recomendado para o vídeo inicial

| Tempo | Texto principal | Mensagem secundária |
| --- | --- | --- |
| 0–4s | Seu tempo vale mais. | Menos tarefas repetidas. Mais clareza. |
| 4–8s | Tecnologia que acompanha a rotina. | Gestão jurídica, CRM, automações e indicadores. |
| 8–12s | Comece pelo problema certo. | Conte o que trava a sua operação. |
| 12–15s | W1 Capital. | Conheça nossas soluções. Sem compromisso. |

Sem depoimentos inventados, falsa escassez, métricas fictícias, promessas judiciais ou resultados comerciais garantidos.

## 6. Critérios de entrega

- Roteiro revisado por pessoa responsável por marca/negócio.
- Legibilidade em tela pequena e alto contraste sem flashes excessivos.
- Vídeo sem dados pessoais, clientes jurídicos ou informações do Supabase.
- Identificar claramente telas conceituais e IA/voz sintética quando necessário.
- Consentimento de voz/imagem e trilha licenciada documentados.
- Testar formatos 9:16 e 16:9 em dispositivos reais.
- Registrar direitos, arquivo mestre, versão, data e canal de publicação.
- Medir visualizações/conversões **reais** somente após a publicação e com privacidade adequada.
