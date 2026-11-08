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
