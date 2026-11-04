# W1 Capital — contexto consolidado de tecnologia e crescimento

**Atualização:** 04/11/2026. **Repositório:** \`W1CAPITAL/SITE\`. **Objetivo:** transformar o W1 Sales Studio na base pública de aquisição e apresentação das soluções W1, com infraestrutura leve, privacidade e evolução gradual. Este documento consolida as decisões da conversa e o que é aproveitável dos arquivos fornecidos; não copia os arquivos nem finge que dependências estão instaladas.

## 1. Decisões de produto existentes

- A página inicial do antigo portfólio foi substituída por um site institucional/comercial com identidade **vinho, marfim, coral e dourado**, geometria editorial, animações respeitando redução de movimento e linguagem humana.
- Catálogo inicial: **LexisPredict**, gestão comercial/CRM, integrações/automações e dashboards/indicadores. **Não prometer escopo, disponibilidade, resultados, avaliações, preços ou contratos não verificados.**
- W1 Sales funciona em **HTML, CSS e JavaScript nativos**. O assistente atual recomenda serviços por regras determinísticas, sem Ollama e sem chamar API paga de inteligência artificial. ChatGPT pode apoiar o trabalho da equipe mediante solicitações humanas, mas não é uma API grátis integrada ao site.
- O PC de escritório não executa Ollama adequadamente; não projetar soluções que dependam de GPU local, navegador headless pesado, transcrição ou renderização generativa no computador.
- O repositório \`SITE\` é a base desta experiência. O código antigo permanece recuperável no Git. O projeto \`LexisPredict\` não pode ser alterado nem ter sua carteira de processos usada como base de marketing sem planejamento e autorização adequados.
- **Hospedagem pública do SITE ainda não confirmada.** Não inventar domínio público, canonical, sitemap publicado nem selo de site online.
- \`sales/config.js\` está vazio: formulário de lead comercial desativado enquanto não existir Supabase **exclusivamente comercial e seguro**. Não alegar que leads foram salvos sem confirmação.
- Pesquisa manual de empresas preparada em \`sales/prospecting/\` usando links ao Fichário/Genesis Innovation; não importar dados em massa nem disparar mensagens. O modelo SQL futuro não foi executado.

## 2. Matriz de adoção dos materiais fornecidos

| Material | Aprendizado relevante | Aplicação presente | Próximo passo / bloqueio |
| --- | --- | --- | --- |
| \`Skill autenticação.pdf\` (18 p.) | Next.js 16 \`proxy.ts\`, Supabase SSR, PKCE/OTP, convites, RBAC, autorização por tabela, cookies e RLS real | Política de arquitetura do **futuro painel interno**, sem credenciais no site estático | Só construir quando houver backend, domínio e Supabase comercial; testar revogação e isolamento antes de lançar |
| \`Guia_Claude_SEO_Agent_Skill.pdf\` e \`.docx\` (mesmo guia, versão editorial) | Auditoria técnica, E-E-A-T, Schema.org, GEO, clusters e plano priorizado com teste de falha | Dados estruturados na homepage e verificação SEO **offline**, sem API | Após publicação, auditar domínio real e integrar GSC/CrUX/GA4 apenas com autorização |
| \`Guia_ScrapeGraphAI_Leads.pdf\` | Extração assistida de sites, opções self-hosted ou API, prompts e cuidados com LGPD/robots/termos | Política de pesquisa e qualificação **sem scraping indiscriminado** | Considerar somente para fontes com permissão clara; API hospedada e Ollama têm limitações/custos |
| \`MiniMax H3 — Guia Completo.pdf\` | Geração multimodal vídeo/áudio, FL2VA/Ref2VA e requisitos de GPU | Ideias para produção **futura**, nenhuma geração local | Exige infraestrutura de vídeo adequada, revisão de licença e orçamento; não rodar no PC fraco |
| \`Meetily — Guia Completo de Instalação e Teste.pdf\` e \`(1).pdf\` (duplicados) | Registro local, transcrição e resumo de reuniões, aviso de gravação e privacidade | Ferramenta manual de resumo de reunião em \`sales/operations/meeting-notes.html\`, sem microfone ou nuvem | Se houver captura de áudio, exigir autorização, retenção e máquina/serviço compatível |
| \`OmniVoice — Guia Completo de Instalação e Uso.pdf\` | Voz sintética, projeto open source, voz de referência e consentimento | Política de voz: somente vozes próprias/licenciadas e indicação de síntese se apropriado | Sem clonagem automática ou imitação de pessoas; processamento de IA exige hardware ou serviço externo |
| \`guia-pratico-hyperframes.pdf\` | Vídeos HTML/CSS com timeline deterministicamente renderizável, pré-visualização, lint/check e FFmpeg | Storyboard editorial de vídeo curto sobre W1 e procedimento de render para ambiente compatível | Nenhum MP4 ou sistema HyperFrames é alegado como pronto; vídeos finais precisam de render e QA |
| \`prompt.pdf\` (recriação fotográfica de selfie pessoal) | Referência de fotografia pessoal com alta fidelidade | **Não aplicado ao marketing W1:** não é identidade da marca, catálogo ou referência autorizada de publicidade | Utilizar apenas se houver pedido específico e material visual adequado; não reproduzir pessoa real em propaganda sem autorização |

**Os documentos descrevem ferramentas de terceiros e limites sujeitos a mudança.** Confirmar versões, licenças, termos de uso e documentação atual antes de instalações, contatos, postagem pública ou gastos.

## 3. Prioridade zero: segurança e dados

- Banco **comercial independente** do LexisPredict. Nunca importar a carteira de clientes jurídicos em campanhas.
- Separar entidades \`empresa pesquisada\`, \`potencial oportunidade\`, \`lead que pediu contato\`, \`cliente\` e \`contrato fechado\`. Registro público de CNPJ **não** equivale a consentimento comercial.
- Rastrear fonte, URL, data da consulta, critérios, revisão humana e base de tratamento aplicável. Evitar dados pessoais desnecessários e respeitar oposição e exclusão.
- Não inserir \`service_role\`, secret de integração, token privado ou dados jurídicos em frontend, JavaScript público ou repositório.
- Em eventual painel Next.js: servidor autenticado, RBAC por papel **e** escopo de organização, RLS por linha, cookies SSR seguros, autorização em API e banco — não só menu oculto.
- Nunca simular resultado comercial, receita, taxa de conversão, atendimento humano ou disponibilidade de ferramentas.

## 4. Jornada comercial planejada

1. **Descoberta orgânica:** páginas úteis e rastreáveis sobre problemas que W1 realmente resolve; SEO técnico, metadados e conteúdo explicável.
2. **Consulta guiada:** pessoa escolhe dor e porte; sistema indica linha de solução e permite salvar resumo sem fornecer dados pessoais.
3. **Pesquisa empresarial com critérios:** equipe pesquisa CNPJ e segmentos no Fichário ou outra fonte permitida, sem coleta de contatos em massa.
4. **Qualificação e revisão:** interesse e compatibilidade reais; equipe decide se é apropriado convidar a uma demonstração. Consentimento e base legal quando exigidos.
5. **Contato autorizado:** humano aprova comunicação; histórico e tarefas ficam em CRM comercial privado, sem spam ou falsas automações.
6. **Demonstração e proposta:** mostrar produto real, escopo negociado, prazos, limitações e próximos passos; nunca prometer resultados de IA.
7. **Reunião e acompanhamento:** registrar notas com cuidado, decisões e responsáveis; gravação ou voz artificial apenas quando autorizadas.
8. **Resultados verificáveis:** métricas originadas de eventos reais de CRM, não cenários fictícios usados em telas demonstrativas.

## 5. Conteúdo e persuasão responsável

- Priorizar benefícios verificáveis, contraste, hierarquia visual, clareza de botões, microinterações leves, boas margens e linguagem humana.
- Evitar urgência falsa, depoimentos criados por IA, pop-ups agressivos, alegações de 100% de resultado ou falsas identidades de vendedores.
- Explicar quando um assistente é **fluxo por regras** e não uma pessoa/IA conversando.
- Em voz e vídeo, usar ativos de marca, vozes consentidas e disclosure de conteúdo sintético quando houver risco de engano.
- Nunca usar \`prompt.pdf\` para transformar uma pessoa retratada em personagem de publicidade sem autorização explícita.

## 6. Condições para avançar

| Marco | Bloqueio atual | Como confirmar conclusão |
| --- | --- | --- |
| SEO de código | Não depende de domínio | Testes automatizados de metadata, JSON-LD, anchors e conteúdo |
| SEO público | Domínio comercial não confirmado | URL HTTPS publicada, canonical/sitemap coerentes, Search Console, avaliação real de Core Web Vitals |
| Leads no banco | Supabase comercial não provisionado/validado | Migração e RLS auditadas; coleta opt-in, proteção anti-bot e testes de acesso |
| Prospecção automatizada | Política de fonte e infraestrutura ainda não aprovadas | Permissões expressas, limites, logs, critérios de avaliação humana e segurança LGPD |
| Painel privado | Autenticação e papéis não implantados | E2E por papel/tenant, revogação imediata e tentativas de acesso indevido bloqueadas |
| Resumo de reuniões | Notas locais disponíveis, transcrição não | Consentimento, teste de qualidade, política de retenção e integração segura |
| Voz sintetizada | Sem voz licenciada aprovada nem infraestrutura de IA | Referência autorizada, checagem de licença, revisão humana e transparência |
| Vídeo de produto | Storyboard/código leve, render não executado | Render MP4 validado visualmente, direitos de mídia, tamanho e performance |

## 7. Custos e limites

**Código aberto não garante operação 100% gratuita.** Infraestrutura, uso de modelo de IA em nuvem, domínio, armazenamento, voz, renderização e API podem ter cotas ou cobrança. Como o PC é fraco, o caminho inicial deliberadamente evita modelos e renderizações locais.

## 8. Referências da implementação

- [SEO estático](../sales/seo/audit.mjs)
- [Pesquisa de empresas](../sales/prospecting/README.md)
- [Resumo manual de reunião](../sales/operations/meeting-notes.html)
- [Autenticação futura](./AUTH-ROADMAP.md)
- [Guia de produção de vídeos e voz](./MEDIA-ROADMAP.md)
- [Homepage](../index.html)

## 9. Diretriz empresarial central — decisão de 04/11/2026

**A W1 precisa conquistar clientes e gerar dinheiro de forma legítima e sustentável. Construir sites é meio, não fim.** Novos projetos serão avaliados primeiro pela capacidade de gerar demanda qualificada, transformar interesse em proposta/contrato, entregar valor e registrar receita recebida de forma verificável. Os bloqueios de domínio público, canal comercial, oferta aprovada e banco privado devem ser removidos antes de gastar tempo em efeitos decorativos. Consultar [W1-DIRETRIZ-COMERCIAL.md](W1-DIRETRIZ-COMERCIAL.md) e [sales/operations/commercial.html](../sales/operations/commercial.html).

O arquivo `CLAUDE.md` anexado complementa o processo de recreação visual com distinção entre modelo visual e conteúdo, inspeção de links reais, animação e duas rodadas de comparação. Só se aplica às tarefas com referências e permissões adequadas; ver [UI-RECREATION-WORKFLOW.md](UI-RECREATION-WORKFLOW.md).
