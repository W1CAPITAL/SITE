# W1 Reel Studio — contrato de qualidade e produção V2
**Vigência:** 08/11/2026. **Área:** W1 Capital / LexisPredict / AI Lab.
**Decisão do proprietário:** o primeiro clipe 3D da robozinha gerado no Gemini é a referência mínima; as continuações 2D simplificadas de novembro foram reprovadas.

## Perfil da marca e três linguagens visuais
1. **Robozinha 3D (série educativa):** fundo creme `#FFF4E7`, preto `#101010`, laranja `#FF641D`; personagem original preta, antena curta, olhos brancos animados, módulos laranja, peito laranja; luz de estúdio, volume físico e animação articulada. Acento da campanha, não rebranding global.
2. **W1 editorial/comercial:** vinho, prata e marfim; fontes legíveis, visuais reais dos projetos, cenas úteis e hierarquia forte. Evitar “banner de site” transplantado para Instagram.
3. **App showcase/UX:** interfaces reais ou protótipos claramente identificados; transições de estado, microinteração, pan/zoom para leitura e dados sem invenções. Preferir vídeos demonstrativos de uma tarefa a uma sequência de telas aleatórias.

## Checklist de pré-produção
- Definir **público, objetivo, único insight, gancho, prova visual, ação desejada** e a permissão para mencionar a marca.
- Identificar fonte de cada fato, tela, número e ativo. Marcar `REAL`, `PROTOTIPO` ou `SIMULACAO`.
- Escolher técnica: **JavaScript 2D/motion** para explicações gráficas e interfaces; **renderização 3D/geração temporal licenciada** para personagens e objetos em cena; composição/legendas em JavaScript e finalização em FFmpeg.
- Não anunciar personagem 3D completo sem rig/atuação. Não chamar de “pronto” o vídeo sem voz ou sem revisão.
- Desenhar um storyboard de **tempo absoluto**, incluindo ações de personagem, estados de UI, posições da câmera, voz e Foley.

## Requisitos técnicos
- Master vertical **1080×1920, 9:16, 30 fps** como padrão; H.264 + AAC em MP4. Deixar zonas seguras para botões/legendas do Instagram.
- Cenas calculadas por tempo ou número do frame, não pela taxa de animação da prévia no navegador.
- Exportação reproduzível; transições contínuas nos frames limítrofes, especialmente em séries de 3 × 10s. Medir cortes em 10,000s e 20,000s.
- Uma **ação narrativa principal** por batida. Gancho nos primeiros 2–3s. Evitar pausas sem propósito e texto que compete com a locução.
- Introduzir títulos grandes somente onde ampliam a compreensão da cena. Legendas sincronizadas em blocos curtos quando houver voz.
- Formato original de referência pode ser 720×1280; ampliação para 1080×1920 não recupera detalhe inexistente. Não declarar “4K” sem prova.

## Personagem: benchmark obrigatório
- Modelo **idêntico** entre capítulos (escala, cabeça, antena, corpo, materiais, paleta e expressão).
- Articulações críveis nos ombros, braços, punhos, pernas e cabeça; contato com o celular/cartão; sombras coerentes.
- **Atuação com intenção:** olhar → notar → reagir → agir → observar consequência. Timing natural, easing, antecipação e follow-through sem sacudir a personagem.
- **Câmera motivada:** enquadramentos aberto, médio e close; no máximo um movimento dominante por batida; profundidade real, não parallax repetitivo disfarçado de 3D.
- Luz: chave macia, preenchimento moderado, recortes suaves e sombra de contato; evitar brilho plástico excessivo e clipping.
- Proibido como “solução final”: PNG recortado da robozinha deslizando em frente a cartões, personagem sem braços articulados, telas de mockup estáticas e substituição de cena 3D por diagrama.

## Áudio
- Narração **pt-BR feminina adulta-jovem, natural, expressiva e consistente** na série da robozinha; não utilizar voz do proprietário nem clonagem sem pedido explícito.
- Texto falado fiel ao roteiro aprovado. Verificar duração e ausência de palavras cortadas; ajustar cenas à voz, não acelerar sílabas para caber artificialmente.
- Foley por ação visível: notificação suave, contato com cartão, pulso de fluxo, confirmação, interação física.
- Mix de áudio: voz em primeiro plano, efeitos discretos e sem picos abruptos; trilha única e licenciada na montagem final, nunca três músicas incompatíveis.
- Se a voz natural não estiver disponível, **status: prévia sem locução**. Não lançar como peça concluída.

## Estrutura de episódio educativo W1: 30 segundos
**Capítulo 1, 0–10s:** celular/comentários → surpresa → robozinha segura notificação → pergunta “E SE DESSE PRA AUTOMATIZAR?” → toque.
**Capítulo 2, 10–20s:** toque vira fluxo visual → `COMENTÁRIO → REGRA → DIRECT` → palavra-chave **W1** → resposta/simulação → celular domina frame final.
**Capítulo 3, 20–30s:** continuidade da conversa → convite a aprender → título `COMENTE W1` → ícones `GUIA`, `AUTOMAÇÃO`, `FERRAMENTAS` → fechamento W1 com marca verdadeira.
**Verdade operacional:** nenhum episódio pode fingir que Direct automático, API da Meta ou entrega de guia já estão operacionais. “Comente W1” é convite, não promessa de envio automático.

## Roteiros canônicos dessa série (manter palavras)
1. “Você acha que o ChatGPT só serve para responder perguntas? Olha o que uma automação pode fazer.”
2. “Quando você conecta as ferramentas certas, um comentário pode acionar uma resposta e entregar um guia no Direct.”
3. “Quer aprender a montar esse fluxo? Comente W1. Aqui a gente transforma tecnologia em prática.”

## Garantia de qualidade — rubrica interna (não métrica externa)
Marcar cada dimensão como `PASSOU`, `AJUSTAR` ou `FALHOU`:
1. **Narrativa:** gancho, coerência, payoff e CTA.
2. **Identidade:** paleta, personagem, logotipo verdadeiro quando autorizado.
3. **3D/atuação:** modelagem, rig, gesto, física, sombras e close; se o briefing requer 3D, aprovação 2D é impossível.
4. **Motion/UI:** fluidez, causalidade, sem congelamentos, movimentos de câmera adequados.
5. **Legibilidade:** ortografia, contraste, hierarquia, zonas seguras e leitura no smartphone.
6. **Som:** voz pt-BR natural, timing, efeitos e níveis balanceados.
7. **Honestidade:** fatos e demonstrações reais separados de simulação; direitos de terceiros.
8. **Entrega:** duração/fps/resolução/codec e download verificados; reprodução integral.

**Critério de aprovação:** todos os oito itens devem estar como `PASSOU`. Qualquer `FALHOU` impede o rótulo `PRONTO PARA PUBLICAR`. Se não houver narração ou a qualidade visual ficar abaixo da referência, o status deve ser `RASCUNHO` ou `REPROVADO`.

## Rotina por peça
`brief → fontes/consentimento → storyboard → teste de personagem/abertura → produção 3D/2D conforme demanda → narração → mixagem → renderização → QA de 8 itens → revisão humana → autorização de publicação → métricas pós-publicação`.

## Antipadrões observados nas tentativas anteriores
- Usar o primeiro clipe Gemini como abertura e completar com animação 2D de qualidade incompatível.
- Recriar uma personagem com rosto/proporções diferentes em cada trecho.
- Confundir áudio de fundo com narração natural entregue.
- Dizer que o clipe tem “áudio” sem distinguir efeitos, trilha e voz.
- Aplicar transição/efeito porque existe, sem função narrativa.
- Mostrar telas de terceiros como se fossem produto próprio.
- Prometer automação ativa ou envio de mensagens sem comprovação.
- Entregar links antes de confirmar que o arquivo existe e pode ser aberto.

## Integração com repositório
- Documentação existente: `creative/reels/GUIAS_DE_REELS_E_INSTAGRAM_2026-11-08.md`.
- Catálogo de fontes: `creative/knowledge/REPERTORIO_DRIVE_W1_2026-11-08.md`.
- Projeto AI Lab/Reel Studio: `scripts/creative-lab/README.md`.
- Aba Projetos: preservar `/portfolio/?tab=projetos`.
- Não versionar vídeo, screenshot e voz de referência privados em repositório público.
