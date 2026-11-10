# ProjectW1SC — implantação independente, treinamento e manutenção

**W1 Capital · Materiais públicos de orientação · 10/11/2026**

## O que é este material

Este documento reúne a visão geral do ProjectW1SC e o caminho para uma pessoa sem experiência em programação criar uma nova instalação em contas próprias. Ele complementa a área [Projetos do site W1 Capital](../index.html) e o [formulário para copiar o prompt completo](index.html#comando).

**Código de origem:** https://github.com/ProjectW1SC/Automation

**Site de referência da operação original:** https://projectw1sc-crm.vercel.app

O site de referência não é o endereço da nova instalação. Cada pessoa deve publicar uma cópia independente e começar com seu próprio banco e seus próprios usuários.

## O que o CRM tem

| Área | Objetivo | Onde procurar no código original |
| --- | --- | --- |
| Visão geral | Indicadores, gráficos, prioridades e status da carteira | `app/page.jsx`, `components/reference-pages.jsx` |
| Tarefas | Fila, prazos, criticidade e registros de atendimento | `app/tarefas/page.jsx`, `lib/tarefas.mjs` |
| Clientes | Cadastro, filtros, edição e histórico | `components/reference-pages.jsx`, `app/page.jsx` |
| Processos | Número CNJ, DataJud e DJEN quando disponíveis | `app/processos/page.jsx`, `app/api/processos/consulta/route.js` |
| Finalizados | Encerramento e reabertura com histórico | `components/reference-pages.jsx`, `lib/finalizados.mjs` |
| Instituições | Financeiras, assessorias, fotos e contatos | `components/reference-pages.jsx`, `components/institution-logo.jsx` |
| Minhas atividades | Registro por usuário, edição e exportação | `app/minhas-atividades/page.jsx` |
| Relatórios | Indicadores, filtros, PDF e CSV | `app/report/page.jsx`, `components/report-print-document.jsx` |
| Configurações | Temas, perfil, senha, imagens, usuários | `app/configuracoes/page.jsx` |

Os caminhos acima são referências para começar a procurar. Consulte a versão atual do repositório antes de modificar arquivos.

## A trilha de aprendizagem — 30 módulos

### Fase 1 — Nunca programei (módulos 1–5)
1. O que é o CRM e para que serve.
2. Preparar o computador: Node.js, editor e Git.
3. GitHub para leigos: repositório, clone, commit e branch.
4. Primeira execução local: instalar dependências e abrir no navegador.
5. Mapa de pastas e arquivos do ProjectW1SC.

### Fase 2 — Interface e código (módulos 6–9)
6. Conceitos indispensáveis de HTML, CSS, JavaScript e React.
7. Como o Next.js organiza páginas e componentes.
8. Menu lateral, cartões, formulários, filtros e gráficos.
9. Temas, cores, imagens, banners, responsividade e contraste.

### Fase 3 — Supabase e segurança (módulos 10–14)
10. Criar o próprio projeto Supabase e entender tabelas.
11. Ajustar e aplicar migrações na ordem correta, em banco vazio.
12. Login, recuperação de senha, usuários e sessões.
13. Row Level Security (RLS), papéis, permissões e segurança das rotas.
14. Storage para logos e imagens com acesso controlado.

### Fase 4 — As nove áreas reais (módulos 15–23)
15. Visão geral.
16. Tarefas.
17. Clientes.
18. Processos.
19. Finalizados.
20. Instituições.
21. Minhas atividades.
22. Relatórios.
23. Configurações.

Para cada uma: explicar por que existe, onde clicar, arquivo responsável, dados utilizados, uma modificação guiada, testes e erros frequentes.

### Fase 5 — Integrações e IA (módulos 24–27)
24. Excel, Google Sheets, DataJud, DJEN e fontes autorizadas.
25. ChatGPT, Claude, Grok, OpenCode, Freebuff e alternativas disponíveis.
26. MCP, plugins, skills e agentes com permissões explícitas.
27. Prompts para adicionar funcionalidades, revisar design, testar e corrigir erros.

### Fase 6 — Publicação e manutenção (módulos 28–30)
28. Testes e investigação de problemas.
29. Conectar GitHub à Vercel e publicar com variáveis seguras.
30. Recriar a instalação completa e validar cada área em produção.

## Roteiro de implantação para leigos

1. **GitHub:** conecte sua conta e copie o código-fonte com atribuição correta; não copie segredos.
2. **Supabase:** crie um projeto seu. Revise e aplique as migrações. Elas incluem referências à instalação original que precisam ser substituídas antes da aplicação.
3. **Administrador:** configure a primeira conta por um fluxo seguro de Auth. Não crie usuários administrativos a partir de um formulário aberto ao público.
4. **RLS:** teste se um visitante consegue acessar dados privados. O resultado correto é não.
5. **Vercel:** conecte seu repositório e configure variáveis no painel privado. Ajuste Site URL/redirecionamentos no Supabase.
6. **Testes:** execute `npm test`, `npm run build` e confira a aplicação no navegador.
7. **Manutenção:** preserve backup e histórico de migrações antes de atualizar qualquer base usada em produção.

### Variáveis — nunca inclua valores secretos no GitHub

Consulte o arquivo `.env.example` atual. As variáveis públicas do navegador geralmente começam com `NEXT_PUBLIC_`; chaves privadas e credenciais devem ficar somente no servidor. As planilhas e contas de serviço do projeto original não podem ser reutilizadas.

## Biblioteca de prompts e agentes

A [página de implantação](index.html#comando) disponibiliza o prompt mestre para copiar e baixar em TXT. Ele instrui um agente a:
- Ler os arquivos originais e apontar as dependências da instalação anterior.
- Preparar GitHub, banco Supabase novo, RLS, login e Vercel.
- Recriar as nove áreas preservando o funcionamento.
- Testar e informar resultados verificáveis.
- Criar um instalador real para etapas impossíveis por conectores.

Também há dois prompts menores para NotebookLM: conteúdo do curso e estilo visual.

**Como usar IA corretamente:** peça sempre que a ferramenta cite arquivos e caminhos, faça mudanças pequenas, acrescente testes, mostre o que executou e não declare resultado que não confirmou. Nunca cole tokens ou dados de clientes em ferramentas públicas.

## MCP e plugins

MCP é um padrão que permite a assistentes usar ferramentas autorizadas, como GitHub, Supabase e Vercel. A pessoa precisa conectar as contas e conceder permissões. Uma função conectada pode ser limitada por seu tipo de conta ou plano; o nome de um plugin não garante que ele consiga editar todos os recursos.

**Regra:** acesso mínimo, revisão de ações com impacto e nenhuma instalação que faça cobrança sem aprovação. Agentes não devem contornar RLS ou desativar autenticação para resolver erros.

## Checklist de entrega

- [ ] O repositório pertence ao novo proprietário.
- [ ] O Supabase pertence ao novo proprietário e começa sem dados de terceiros.
- [ ] E-mails administrativos e IDs de planilhas antigas foram substituídos.
- [ ] O usuário administrador consegue entrar e sair com segurança.
- [ ] RLS e Storage foram revisados por papel.
- [ ] Todas as nove áreas estão presentes.
- [ ] Os testes automatizados e o build passaram.
- [ ] A publicação foi confirmada na Vercel.
- [ ] O README explica implantação e manutenção.
- [ ] As integrações opcionais mostram estado real, sem inventar conexões.

## Acervo completo de treinamento — privado

O treinamento detalhado inclui 27 PDFs, mapas visuais, exemplos de código, práticas de GitHub/Supabase/Vercel e exercícios com agentes. Por conter documentação operacional extensa, os arquivos ZIP/PDF são preservados na **Biblioteca da W1 Capital**, e **não** são publicados por padrão nesta página aberta.

## Direitos autorais e transparência

© 2026 W1 Capital. O código original do [ProjectW1SC](https://github.com/ProjectW1SC/Automation) está sujeito à [licença MIT](https://github.com/ProjectW1SC/Automation/blob/main/LICENSE). Essa licença não inclui automaticamente marcas registradas, imagens de personagens e outros materiais de terceiros.

**O botão de copiar o prompt não instala o CRM por si só.** A execução exige ferramentas conectadas, permissões e verificação das operações reais.
