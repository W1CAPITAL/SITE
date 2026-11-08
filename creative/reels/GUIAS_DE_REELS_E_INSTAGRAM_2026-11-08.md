# GUIAS DE REELS E INSTAGRAM — REGRAS INCORPORADAS (08/11/2026)

Fonte principal: dois PDFs de **8 páginas cada**, enviados pelo usuário:
- `guia_maquina_de_reels (1).pdf` — Claude + Máquina de Reels.
- `guia_instagram.pdf` — Claude como gerente do Instagram.

Este documento **não** instala ou habilita o Claude, Apify, Gemini ou a skill proprietária descrita nos guias; organiza somente o método que o usuário deseja que o escritório W1 Capital / LexisPredict e os projetos criativos aproveitem. Não presumir credenciais, créditos ou resultados.

## 1. Método da Máquina de Reels

Págs. 1–2: entrada pode ser **áudio** ou **prompt**; transforma-se em roteiro, cenas animadas em código, renderização **quadro a quadro** e MP4, sem exigir crédito de um modelo generativo de vídeo. Em cenas de motion graphics/pixel-art, renderização em código pode ser apropriada; para **Dia Zero**, código vetorial com zoom/filtros/triângulos de fogo **não** satisfaz animação realista de personagens, objetos, água, incêndio ou fumaça.

Pág. 3: o vídeo tem **gancho nos primeiros 3 segundos** + início → conflito → virada → final que cumpre o gancho. **Uma ação na tela por frase da narração, sincronizada no tempo da fala; nenhuma cena é slide parado.**

Pág. 4: saídas desejadas — Reels vertical 9:16, **legenda palavra por palavra**, efeitos discretos e sincronizados com a ação, capa no mesmo visual, guia PDF opcional, logos/interfaces autênticos quando necessários, revisão quadro a quadro. Esta lista é a especificação do guia, não uma alegação automática de que cada vídeo produzido inclui os itens.

Pág. 5: aprovar visual da abertura antes de propagá-lo a todo Reel; preservar timing de uma narração enviada. Pág. 6: estilos de referência Dark premium, Neon, Papel e Cinema. Face gravada pode ser usada de forma pontual, mas evitar excesso e falsos lábios. Págs. 7–8: site e perfil exibidos são **referências**, não conectores já autorizados.

## 2. Método da gestão do Instagram

Págs. 1–2: 
1. pesquisar vídeos acima da média dentro do mesmo nicho;
2. escolher 5–15 perfis comparáveis;
3. decompor gancho, narrativa, cortes, linguagem e resultados;
4. transformar isso em roteiros e planejamento editorial;
5. editar, publicar **somente com autorização**, aprender com métricas reais.

O critério **média + 2 desvios padrão** aparece no guia como forma de marcar um Reel atípico em relação ao *próprio perfil* (pág. 2); depende de dados suficientes e não garante viralização. Não fabricar métricas nem assumir que houve coleta real.

Pág. 3: repositório citado `https://github.com/bradautomates/head-of-content` (informação da fonte, não integração confirmada). Ferramentas referidas: `instagram-research`, `video-content-analyzer`, `content-planner`, com `APIFY_TOKEN` e `GEMINI_API_KEY`; planos gratuitos e APIs estão sujeitos a limites, permissões e custo. Não inserir tokens no código cliente e não contratar serviços por conta própria.

Pág. 4: registrar perfis em `instagram-accounts.md`; relatórios de pesquisa `report.md` e `outliers.json`; separar conteúdo extraído e interpretação. Pág. 5: gerar até cinco roteiros de Reels de até 60s, ganchos de 2s, linguagem do perfil, CTA e calendário. Pág. 6: painel com **Ideias / Roteiro / Edição / Publicado**, mais indicadores reais de publicação. Pág. 7: edição em código da Máquina de Reels, agendamento/publicação via ferramenta autorizada, e retroalimentação baseada em resultados observados. Pág. 8: chamada para seguir perfil `@igao.ia` é da referência, **não** da W1 Capital.

## 3. Regras operacionais para W1 Capital, LexisPredict e projeto Dia Zero

- Consultar os vídeos e posts de referência fornecidos anteriormente pelo usuário, inclusive exemplos virais que funcionaram e que não funcionaram. Não entregar peças com estética de banner genérico, memes colados ou locução robótica.
- Não confundir **Reel de marketing de até 60s** com o **curta narrativo Dia Zero de 120s**. Reutilizar os princípios de gancho/história/som/legendas, não encurtar o curta sem pedido.
- Cada fala deve provocar uma ação na tela, mas os movimentos precisam ser contínuos e fisicamente críveis.
- Dentro do escritório: efeitos internos; chuva, carros, incêndio, fumaça e explosão somente do lado de fora (com vidro, distância, reflexos e oclusão de som), até o personagem sair.
- Nunca animar a boca de um protagonista que apenas **ouve narração em off**. Se estiver falando de verdade, a boca deve seguir essa fala, não movimentação aleatória.
- Revisar o MP4 final reproduzindo, não só lendo metadados. Verificar volume consistente, legendas sincronizadas e sequência da história.
- Arquivos concluídos devem ter cópias acessíveis por **download direto de arquivo verificado**. Em versões anteriores, links de Biblioteca retornaram *Library file not found*.
- Não publicar, mandar mensagens, contratar assinaturas, autorizar gastos, mesclar alterações de produção ou usar tokens secretos sem autorização do usuário.

## 4. Retomada real do curta Dia Zero — V9

Em 08/11/2026, o curta V9 de 32 tomadas temporais geradas com Wan 2.2 foi recuperado do artefato GitHub Actions `42433023979` (ZIP `DIA_ZERO_V9_120s_Video_Gerado_32_Cenas.zip`); o MP4 base possuía 120,000s, 2880 frames a 24fps, 720×1280, H.264 + AAC. A abertura de 30s já tinha uma cópia com boca estabilizada e, nesta retomada, foi corrigida adicionalmente a boca no **telefonema de 93,75–97,50s**, preservando expressões e o áudio original. A montagem entregue é `DIA_ZERO_V9_COMPLETO_2MIN_ANIMADO_BOCA_CORRIGIDA.mp4`; a montagem combina vídeo temporal gerado, não slides da V6/V7.

**Limitação:** estabilidade da boca foi corrigida nos trechos identificados, mas não se deve afirmar precisão de lip-sync em todas as tomadas sem assistir integralmente. Encerramento real do vídeo confirmado por decodificação, 120s e 2880 frames.

## 5. Padrão permanente — REELS EM JAVASCRIPT 9:16 (08/11/2026)

**Decisão do proprietário:** o formato de produção padrão dos Reels W1 Capital / LexisPredict é criar as cenas **em JavaScript** no quadro **vertical 9:16** e exportar para MP4. Isso complementa, sem substituir, o AI Lab e o Reel Studio já existentes; manter a aba **Projetos** em `/portfolio/?tab=projetos`.

### Especificação de produção

- Composição 1080 × 1920 px; 30 fps como referência. Escala 720 × 1280 é aceitável para insumos, mas o master preferido é 1080 × 1920. H.264 + AAC em MP4.
- Criar cenas com JavaScript + HTML/CSS/SVG/Canvas (ou Remotion, **se a dependência estiver realmente instalada**), usando texto grande, gráficos, imagens, capturas reais, personagens e movimento. JavaScript é o **motor da animação**, não um substituto da direção criativa.
- Ter uma linha de tempo em segundos/quadros; animações e transições dependem do tempo de cena, não do desempenho do aparelho. Para exportação reproduzível, renderizar quadros sequenciais no navegador/renderer autorizado e compor som no FFmpeg, ou encaminhar clipes reais ao `scripts/reel-studio/studio.mjs`. **Não presumir um renderizador de navegador instalado no servidor.**
- Gancho claro nos 0–2/3 s; cada sequência deve revelar informação, prova visual ou mudança narrativa. Evitar slides estáticos, excesso de texto, movimento lento ou cortes aleatórios. Uma ação/movimento legível por ideia principal.
- Legendas com boa hierarquia visual e sincronizadas com a fala. Testar posições no Instagram: preservar margens de segurança para barra superior, legenda/CTA e botões sobrepostos, sem depender de valores universais de interface.
- Priorizar voz pt-BR natural **ou gravação humana**; não publicar locução robótica. Música e Foley apenas com autorização/licença, mixados sob a voz sem colagens de memes e sem picos de volume.
- Separar sempre **demonstração real** de interface/projeto W1 de **cena ilustrativa** gerada por IA. Não usar dados reais de clientes sem base legal e autorização.
- Revisão obrigatória de: (1) gancho e payoff, (2) ortografia, (3) contraste e leitura em tela pequena, (4) movimentos e cortes, (5) vídeo completo sem congelamentos, (6) voz e trilha, (7) sincronismo de legendas, (8) CTA, (9) marca W1, (10) direitos de uso.
- Preservar estética de marca W1: **vinho, prata e marfim** como base, com cor de acento quando a ideia pedir. Não copiar a aparência de influenciadores ou reproduzir imagens de terceiros sem licença.

### Referência audiovisual fornecida neste pedido

O vídeo enviado em 08/11/2026 (`75120.mp4`, **referência privada — não adicionar o arquivo ao repositório público**) tem cerca de **35,26 s**, 720 × 1280, 30 fps, vídeo H.264 e áudio AAC. Os quadros observados apresentam paleta laranja/preto/creme, títulos amplos, personagem geométrico/pixelado, cartões gráficos, cronômetro e UI animada. Aproveitar **dinâmica de narrativa e composição**, adaptando para os serviços e identidade da W1; não copiar os elementos como se fossem originais.

### Método dos carrosséis mostrado nas capturas

- Capa de alto contraste e título enorme: começar pela curiosidade/problema real do público, não por apresentação institucional genérica.
- Alternar texto curto com **prints reais**, interfaces, esquemas, ilustração e visualização de resultado. Não fazer um carrossel inteiro de parágrafos.
- Sequência editorial com personalidade: **gancho → problema → contraste/exemplo → prova/solução → benefício → CTA**.
- Música do catálogo do Instagram pode apoiar a experiência, mas não é requisito técnico para um carrossel ter desempenho e **não garante alcance**.
- Mostrar projetos reais da aba **Projetos**: W1 Capital, LexisPredict, demos e automações apenas na medida em que cada recurso estiver comprovadamente funcional. Não apresentar mockups como resultados de clientes.
- Usar referências visuais como aprendizado, não copiar layout, identidade, fotografias ou textos de terceiros.

### Famílias de skills citadas nas imagens (a avaliar, não instaladas automaticamente)

As capturas mencionam **42 fontes**; apenas os itens abaixo ficaram legíveis nas imagens recebidas. A lista é um **catálogo de pesquisa**: a existência do nome na imagem **não comprova licença, URL oficial, disponibilidade ou instalação**. Conferir a fonte de cada skill antes de integrar ao ambiente.

| Grupo | Nomes visíveis nas imagens |
| --- | --- |
| Camada 1 · Frontend e UI (01–10) | `frontend-design`, `impeccable`, `taste-skill`, `make-interfaces-better`, `color-expert`, `design-tokens-skill`, `design-system-governance`, `brandkit`, `format-storybook`, `mobile-app-design` |
| Camada 2 · Imagem, gráficos e vídeo (11–18) | `canvas-design`, `algorithmic-art`, `p5js-hermes`, `shader-dev`, `animate-skill`, `css-animation-skill`, `wiggle-claude-skill`, `remotion-best-practices` |
| Camada 5 · Comportamento e conteúdo (29–36) | `design-brief`, `design-consultation`, `ux-writing-skill`, `content-strategy`, `copywriting-skill`, `product-position`, `user-research-cookiy`, `software-ux-research` |
| Camada 6 · Confiança e avaliação (37–42) | `plan-design-review`, `design-review-garrytan`, `design-debt-audit`, `design-impact-reporting`, `cloudflare-web-perf`, `dark-pattern-audit` |

**Não inferir os itens 19–28:** as capturas recebidas não incluem as camadas intermediárias. Nenhuma dessas 32 skills é declarada instalada só por aparecer aqui.

### Aplicação prática

O fluxo de criação permanente é: **ideia do marketing → roteiro com cenas temporizadas → composição em JavaScript 9:16 → capturas/ilustrações autorizadas → renderização de quadros ou clipes → edição e mixagem com Reel Studio → inspeção do MP4 final → publicação somente após revisão/autorização**. Manter os projetos acessíveis em `/portfolio/?tab=projetos` e registrar as peças da W1 dentro da operação criativa já existente.


## 6. Novo padrão mínimo de acabamento — referência Gemini 3D (08/11/2026)

O proprietário enviou um vídeo de referência privado `75344.mp4` e declarou que este é o **nível de qualidade exigido** para o Reels educativo da robozinha W1. Não subir o arquivo original nem quadros do vídeo a um repositório público sem autorização expressa.

### Evidência inspecionada

- Vídeo de aproximadamente **10,03 segundos**, **720×1280**, **24 fps**, MP4 H.264 com AAC estéreo, fundo creme, personagem robótica preta com detalhes laranja.
- A personagem tem **volume tridimensional perceptível**, corpo e cabeça consistentes, materiais foscos com highlights controlados, contorno suave, iluminação quente e sombras coerentes no chão.
- O telefone e as notificações têm **perspectiva, camadas, profundidade, sombras**, sensação de objeto físico; a câmera alterna enquadramento mais aberto com close e acompanha a ação, em vez de manter um layout tipográfico estático.
- A robozinha **olha, reage, gesticula e segura um cartão**; seu olhar e postura acompanham o objeto da cena. A carta/notificação e o bloco preto/laranja fazem parte da ação dramática, não são apenas overlays.
- O texto grande e legível `E SE DESSE PRA AUTOMATIZAR?` só aparece quando a narrativa pede. Sem UI excessiva, barras decorativas persistentes ou cards genéricos dominando a cena.

### Gap reconhecido no Reels JavaScript anterior

O vídeo anterior criado para a W1 tinha cabeça/corpo da robozinha em formas 2D simples, telas de interface esquemáticas, pouca variação de enquadramento e texto em posições fixas. Tinha composição 9:16 e renderização em código, mas **não** alcançava a profundidade, o timing de atuação da personagem e o acabamento da referência. Também faltou voz feminina pt-BR natural (serviço de voz bloqueado por plano). **Não considerar aquele MP4 o padrão de qualidade aprovado para publicar.**

### Requisitos para a próxima implementação

1. **Não confundir JavaScript com animação 2D:** usar uma cena 3D real quando o conceito exigir, com WebGL/Three.js ou renderização de modelos e assets 3D licenciados, controlados em JavaScript. Se o ambiente não suportar, renderizar a cena 3D num worker e compor em JavaScript/FFmpeg. Não alegar qualidade 3D apenas por sombras CSS, gradientes ou desenhos vetoriais.
2. **Personagem persistente e rigada:** um único modelo e materiais compartilhados entre cenas, com articulações definidas (pescoço, ombros, cotovelos, punhos), olhos animados e gestos naturais. Sem mudar proporções entre cortes.
3. **Atuação e direção de câmera:** coreografia por beats; antecipação, reação, pausa curta e consequência física. Enquadramentos aberto, médio e close motivados pela história, DOF/sombras sutis e câmera móvel sem tremedeira.
4. **Objetos 3D que interagem:** celular inclinado, notificações com profundidade, cartão segurado de verdade pelas duas mãos, bloco/mesa com contato físico e oclusão coerente. Manter o dispositivo e a mão no mesmo lugar em emendas entre capítulos.
5. **Luz e acabamento:** iluminação de estúdio quente, contraste consistente, antialiasing, sombras de contato, materiais PBR ou aparência fisicamente coerente, renderização fluida. Não deixar visual de PowerPoint/banners/infográfico animado.
6. **Design sonoro:** voz feminina adulta-jovem em pt-BR natural e estável em todos os capítulos; efeitos discretos acionados por eventos visíveis; sem música em cada clipe; trilha unificada opcional no master. Se não houver serviço de voz adequado, marcar o vídeo como **prévia sem locução**, não como versão final pronta.
7. **Conteúdo honesto:** cena de comentários e Direct é **simulação conceitual**, nunca uma conexão de Instagram confirmada. `Comente W1` não promete envio automático até a automação estar operacional e testada.
8. **Verificação:** assistir a todos os 30 segundos, conferir frames de emenda aos 10s e 20s, sincronismo de fala e ação, ortografia, clipping, fluidez, áudio real em pt-BR, leitura no celular e identidade W1. Registrar o que não estiver concluído antes de chamar de final.

**Regra de aprovação:** o próximo vídeo só deve ser classificado como `pronto para publicar` quando atender à referência 3D/atuação/iluminação **e** tiver voz e revisão final concluídas. O vídeo de 10s enviado é um **benchmark criativo**, não autorização para copiá-lo quadro a quadro, nem prova de que um renderizador 3D já está instalado no projeto.


## 7. Catálogo consolidado do Drive e novos sistemas de produção

O inventário da pasta de referências enviada em 08/11/2026 (76 itens: 49 MP4, 25 PNG e dois PDFs duplicados), o método de carrosséis (10 estruturas e 20 tipos de gancho) e os sete sistemas de Matheus Tilli foram registrados no [guia operacional de referências e sistemas](BIBLIOTECA_REFERENCIAS_DRIVE_E_7_SISTEMAS_2026-11-08.md). Este arquivo complementar também especifica critérios de **aprovação/reprovação** para Reels, diretrizes de áudio natural, movimento 3D real e distinção entre referência, implementação e resultado confirmado. Preservar a aba Projetos e o AI Lab existente. A listagem da pasta está verificada, mas não presumir uma auditoria quadro a quadro de todos os vídeos.
