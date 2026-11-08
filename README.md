# W1 Capital — W1 Sales Studio

Site institucional e comercial premium da W1 Capital em HTML, CSS e JavaScript nativos. Sem frameworks, bibliotecas de animação, Ollama ou API paga de IA.

## Nova oferta comercial: criação de sites para pequenos negócios (05/11/2026)

A W1 Capital também oferece **sites institucionais, landing pages e catálogos digitais** para negócios de setores diversos, não apenas escritórios jurídicos. Página: [Criação de sites](/sites/). O briefing prepara mensagem para WhatsApp ou e-mail, após validação e consentimento do visitante; não há salvamento no Supabase nem envio automático pela W1. Valores, hospedagem, domínio, recursos adicionais e prazos dependem de proposta aprovada. Não há portfólio de clientes fictícios. Site da própria W1 é exemplo de trabalho publicado.

## Entrega

- Página principal do antigo portfólio substituída integralmente por uma experiência comercial. A versão anterior é recuperável pelo histórico Git.
- Visual autoral vinho, marfim, coral e dourado, composição editorial geométrica e transições suaves.
- Catálogo: LexisPredict, CRM, integrações/automações e indicadores.
- Destaque LexisPredict com acesso à plataforma e painel conceitual claramente identificado, sem expor dados reais.
- Fluxo interativo de metodologia, menu mobile acessível e navegação por teclado.
- Consulta guiada por regras: necessidade, tamanho da equipe, recomendação; resumo TXT sem pedir dados pessoais.
- Formulário de lead com consentimento preparado, mas **inativo** até configurar um Supabase comercial independente e proteção anti-spam.
- FAQ, SEO social, favicon original e respeito à preferência de movimento reduzido.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Página pública principal |
| sales/styles.css | Estilos estruturais |
| sales/studio.css | Camada visual da primeira versão |
| sales/premium.css | Design premium e responsividade |
| sales/core.js | Recomendações e validações |
| sales/app.js | Catálogo, consulta e exportação TXT |
| sales/premium.js | Mobile, animações acessíveis e método interativo |
| sales/config.js | Configuração pública vazia por padrão |
| sales/supabase/001_sales_leads.sql | Migração para banco comercial separado |
| sales/index.html | Redirecionamento da antiga rota /sales/ |
| .github/workflows/w1-sales.yml | Testes e checagem de sintaxe |

## Validar

Executar na raiz, com Node.js 22 ou superior:

    node --check sales/core.js
    node --check sales/app.js
    node --check sales/premium.js
    node --test sales/core.test.mjs sales/site.test.mjs

Para visualizar localmente:

    python3 -m http.server 8080

Abrir http://localhost:8080/ .

## Publicação

É uma aplicação estática. Uma hospedagem com plano gratuito que permita **uso comercial**, como Cloudflare Pages dentro de suas cotas, pode servir o conteúdo. Conecte o repositório W1CAPITAL/SITE na branch main, sem framework ou build, configurando o **diretório raiz do repositório** e output ".". A pasta sales deixou de ser a raiz de deploy. Um domínio próprio pode custar à parte.

Fazer merge não significa que exista hospedagem pública vinculada. Nenhum domínio público será considerado publicado sem confirmação do provedor.

## Privacidade e escopo

A configuração Supabase continua vazia, portanto a experiência está em modo demonstração. Nenhum lead é salvo; as duas perguntas do assistente funcionam apenas no navegador. O banco jurídico do LexisPredict não é usado.

Para captação real, validar projeto Supabase comercial distinto, executar a migração apenas nele, testar RLS e adicionar proteção contra spam, política de privacidade e canal comercial real. Nunca inserir chaves privadas na página pública.

As soluções são apresentadas sem preço fixo, garantias ou depoimentos fictícios. As recomendações são determinísticas, não respostas de um modelo GPT integrado. Contratação e atendimento humano exigem confirmação da equipe.

## Prospecção comercial (preparação para uso futuro)

Uma ferramenta separada de pesquisa manual de empresas foi adicionada em `sales/prospecting/`. Ela abre fichas de CNPJ e buscas setoriais no Fichário (Genesis Innovation), respeitando os termos de uso e sem coletar contatos, armazenar listas ou acionar campanhas. A futura integração de API/MCP e o modelo privado de pesquisa no Supabase estão descritos em [sales/prospecting/README.md](sales/prospecting/README.md). Nada foi aplicado ao banco do LexisPredict.


## Contexto consolidado e ferramentas leves

Revisamos os materiais enviados sobre autenticação Supabase, Claude SEO, ScrapeGraphAI, HyperFrames, MiniMax H3, Meetily e OmniVoice. As soluções foram distribuídas entre **implementações sem custo de IA**, planos de arquitetura e recursos futuros dependentes de infraestrutura/licença. O conteúdo `prompt.pdf` de reconstrução de foto pessoal não foi aplicado ao marketing W1.

- [Contexto consolidado e situação de cada ferramenta](docs/W1-CONTEXTO-CONSOLIDADO.md)
- [SEO técnico e GEO: auditoria offline](docs/SEO-WORKFLOW.md) · código em [sales/seo/audit.mjs](sales/seo/audit.mjs)
- [Plano de autenticação e RLS para um CRM comercial privado](docs/AUTH-ROADMAP.md)
- [Produção de vídeo, narração e reuniões com consentimento](docs/MEDIA-ROADMAP.md)
- [Guia permanente: Reels JavaScript 9:16, carrosséis, referências e critérios de revisão](creative/reels/GUIAS_DE_REELS_E_INSTAGRAM_2026-11-08.md)
- [Prévia leve do vídeo W1 (não é MP4)](sales/media/spot-preview.html)
- [Resumo manual de reuniões, sem gravação ou IA](sales/operations/meeting-notes.html)
- [Pesquisa manual de empresas via Fichário](sales/prospecting/README.md)

Os novos recursos não foram conectados ao Supabase nem ao WhatsApp jurídico, não capturam contatos de terceiros, não fazem scraping e não iniciam serviços de IA pagos. Sem domínio comercial confirmado, não adicionamos canonical ou sitemap com URL suposta.

## Objetivo empresarial prioritário: receita e clientes

A W1 deve se transformar em **empresa operacional, com produtos/serviços efetivamente vendidos, clientes atendidos e receita comprovada**, não apenas em um site de portfólio. O site é canal comercial; sucesso é medido em qualificação, contato autorizado, propostas, contratos, recebimentos, margem e retenção — sempre com dados verdadeiros.

- [Diretriz comercial, ofertas e plano de 30 dias](docs/W1-DIRETRIZ-COMERCIAL.md)
- [Ferramenta comercial manual de propostas e funil](sales/operations/commercial.html)
- [Guia CLAUDE.md de fidelidade visual, adaptado ao foco comercial W1](docs/UI-RECREATION-WORKFLOW.md)

O gerador de propostas não envia documentos e não é CRM autenticado. A empresa precisa confirmar sua oferta, preço e serviço antes de usar uma minuta em negociação. Nenhuma conversão ou receita foi fabricada.

## Primeira oferta comercial do LexisPredict

A equipe W1 tem agora uma primeira proposta **baseada em fontes reais** do LexisPredict (GitHub, Vercel e Supabase), com preços já cadastrados no código, status de funcionalidades, restrições de assinaturas, custos hipotéticos e roteiro demonstrativo. **Não confundir material pronto com fluxo de pagamento/cadastro plenamente validado.**

- [Auditoria de comercialização, planos, preços e bloqueios](docs/LEXISPREDICT-PRIMEIRA-OFERTA-2026-11-04.md)
- [Apresentação resumida para interessados — revisão humana](sales/offers/lexispredict-apresentacao-comercial.md)
- [Demonstração de 12 minutos com dados fictícios](sales/offers/lexispredict-demo.md)
- [Modelo auditável de receita e despesas hipotéticas](sales/offers/lexispredict-unit-economics.mjs)

A primeira meta comercial é validar um tenant independente e uma oferta de entrada **Essencial**, antes de aceitar assinaturas. Não foram realizados pagamentos, cadastros de clientes ou alterações no banco jurídico durante esta preparação.

## Primeira página de vendas ativa no código

A nova rota **`/lexispredict/`** foi preparada como página de conversão em demonstrações comerciais para a W1 Capital. Exibe quatro planos a preços já referenciados no software e explica que a implantação depende de escopo aprovado. O formulário abre **um rascunho no aplicativo de e-mail do visitante**, endereçado ao canal W1 `corporacaow1capital@gmail.com`, e fornece texto copiável como alternativa. **Nenhum pedido é salvo ou enviado sem o próprio visitante confirmar o envio.**

- [Página LexisPredict](lexispredict/index.html)
- [Formulário comercial e proteção contra envio fictício](lexispredict/vendas.js)
- [Testes de consentimento, preços, rota e endereço](lexispredict/vendas.test.mjs)

### Hospedagem para uso comercial

O repositório é público, mas a hospedagem comercial não foi conectada. **Não** usar Vercel Hobby ou GitHub Pages para esta vitrine comercial. Cloudflare Pages ou Render Static Sites têm opções estáticas gratuitas dentro de suas cotas e condições; a conta e o GitHub precisam ser conectados pelo proprietário. Para Render: criar `Static Site` pelo repositório `W1CAPITAL/SITE`, branch `main`, sem build ou com `echo ready` se exigido, e publicar a **raiz** do repositório (`.`). Verificar HTTPS, a rota `/lexispredict/` e o recebimento de uma mensagem de teste antes de divulgar. Sem publicação confirmada, não anunciar URL pública.

## Repaginação comercial de novembro de 2026

O site institucional e a landing `/lexispredict/` usam estilos finais leves em `sales/conversion.css` e `lexispredict/conversion.css`. Direção: vinho profundo + prata + branco quente, coral só para botões de ação, formas esculturais simples em CSS, grandes áreas de respiro e benefícios que podem ser lidos rapidamente. Hero com dois caminhos diretos (**demonstração LexisPredict** e **conversa no WhatsApp**). Planos do LexisPredict mais fáceis de comparar sem prometer assinaturas automáticas. Tudo sem carregar bibliotecas, fontes, imagens externas nem rastreamento.

Executar `node --test sales/conversion-redesign.test.mjs` junto à suíte do GitHub para validar os CTAs oficiais, semântica, design responsivo, redução de movimento, URLs e preservação dos módulos anteriores. A alteração visual não inclui sistema de checkout nem captura automática de leads.


## Projetos e AI Lab (08/11/2026)

A rota [`/projetos/`](projetos/index.html) reúne os projetos próprios da W1 Capital, demonstrações, inventário dos motores externos e uma ferramenta **local ao navegador** para gerar roteiros-base de reels (5 cenas) e carrosséis (6 slides), com opção de copiar/baixar TXT. Ela não aciona modelos pagos nem publica posts.

- [Integração e requisitos reais dos motores](scripts/ai-lab/README.md): Open-Higgsfield, Genjutsu, Reel Studio, Hypit, AI YouTube Shorts Generator, MotionSmith Pro V2 e endpoint MCP ainda não validado.
- [Referências visuais dos carrosséis e reels](creative/reels/REFERENCIAS_VISUAIS_CARROSSEIS_2026-11-08.md): capa forte, prints reais, imagens, música licenciada, narrativa própria e verificação de resultados.
- [Testes](projetos/plan-core.test.mjs) e [testes de navegação](projetos/page.test.mjs) executados no CI.

O portfólio pessoal continua com a aba **Projetos** existente (`/portfolio/?tab=projetos`); não se apropriar de autoria de repositórios externos. A instalação de modelos de vídeo em hospedagem estática não é possível; mantenha geração em infraestrutura apropriada e privada.
