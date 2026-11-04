# W1 — MÉTODO CONDICIONAL DE RECRIAÇÃO DE INTERFACES

Fonte: `CLAUDE.md` fornecido em 04/11/2026, intitulado **UI Recreation Agent**. Este documento traduz as orientações relevantes ao fluxo de desenvolvimento W1, sem sobrepor a [diretriz comercial](W1-DIRETRIZ-COMERCIAL.md).

## Quando usar

Quando a W1 estiver recriando a estrutura visual de uma página **autorizada** a partir de screenshot, Figma ou um modelo de referência, com textos e identidade próprios de uma fonte de conteúdo. Não aplicar como regra cega a novos produtos e não copiar marcas, obras ou ativos de terceiros sem licença.

## Modelo Visual ≠ Fonte de Conteúdo

| Papel | Fonte | O que determina |
| --- | --- | --- |
| Modelo visual | Screenshot, Figma ou site de referência autorizada | Grid, alinhamentos, largura, ritmo de espaçamento, hierarquia tipográfica, efeitos de hover, transições e responsividade |
| Conteúdo | Textos, links e materiais oficiais e verificados da W1 | Proposta de valor, textos, imagens licenciadas, links de contato corretos, dados reais, FAQs |
| Regras de negócio | Produto, preço, entrega e capacidade comercial W1 | O que podemos afirmar, vender, entregar e medir de verdade |

**Se só houver uma referência visual, não assumir que suas alegações comerciais são verdadeiras.** O conteúdo vem da W1, e o fluxo de venda precisa funcionar.

## Sequência obrigatória para reproduções visuais

1. **Analisar o modelo**: proporções de colunas, tamanhos, fontes, cores, contraste, spacing, componentes e comportamento mobile; quando possível, registrar valores concretos.
2. **Capturar o conteúdo verificado**: links reais, logo e imagens com direitos, formulários e destinos. Não inventar telefone, WhatsApp, depoimentos ou identidade de funcionários.
3. **Analisar animação separadamente**: screenshots não revelam scroll, hover ou keyframes. Usar navegador real quando houver URL acessível. Evitar dependências grandes no PC de escritório quando CSS e JS nativos resolvem.
4. **Implementar a variação**: priorizar fidelidade de layout e interatividade, mas manter acessibilidade, contraste e privacidade.
5. **Comparar duas vezes**: screenshot inicial versus referência, corrigir divergências medidas, gerar segunda captura e revisar novamente; documentar limitações e diferenças restantes.
6. **Verificar destinos e conversão**: todos os botões e links devem funcionar; formulário comercial precisa de backend real ou explicação explícita de modo demonstração.
7. **Medir impacto comercial**: não encerrar trabalho apenas porque a interface ficou bonita. Explicitar como o resultado facilita entendimento do serviço, agendamento, pedido de proposta ou fechamento.

## Formatos gerados

Se existirem até três modelos, registrar uma especificação por modelo, extrair o mesmo conteúdo W1 uma única vez, criar variações e comparar visualmente antes de escolher. O documento original sugere os nomes `model-N-spec.md`, `content.md`, `variation-N.html` e imagens comparativas de cada variação. Não alegar que essas capturas foram geradas se não houver navegador/render disponível.

## Limites práticos para W1

- Site comercial atual usa HTML/CSS/JS nativos, portanto exemplos com Tailwind, AOS, GSAP, Lottie e Playwright são **opções condicionais**, não instalações obrigatórias.
- Sem backend autenticado, não replicar logins, checkout ou formulários como se funcionassem de verdade.
- Uma fonte externa pode proibir raspagem ou replicação comercial de assets; respeitar termos e direitos autorais.
- Não copiar defeitos que prejudiquem acessibilidade ou violem privacidade; nesses casos, sinalizar a diferença.
- Caso falte um link real, manter o CTA com um destino interno verificável ou não publicá-lo, em vez de inventar telefone ou formulário.
- Evitar falsas alegações de revisão visual quando não houve captura e confronto com o modelo.
- **Finalidade prioritária**: aumentar a capacidade da W1 de vender e entregar seus serviços, não aumentar indefinidamente o número de páginas e protótipos.

Fonte original pode ser consultada como anexo desta conversa. Este arquivo é um resumo operacional de aplicação na W1.
