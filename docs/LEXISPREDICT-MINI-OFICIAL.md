# Prévia leve do LexisPredict oficial

A demonstração da W1 Capital não deve apresentar uma interface genérica como se fosse o LexisPredict real. Esta versão é **um recorte visual e navegável da aplicação oficial**, com dados criados exclusivamente para demonstração comercial.

## Fontes consultadas no repositório `W1CAPITAL/LexisPredict`

- `src/components/layout/sidebar-vertical.tsx`: navegação real e o degradê azul-marinho `#061d35 → #082944 → #0a3554`.
- `src/app/reference-dashboard.css`: fundo claro, tipografia e cartões da composição atual.
- `src/components/dashboard/dashboard-visual-overview.tsx`: título **Visão da carteira**, cartões e histórico.
- `src/app/processos/page.tsx`: carteira empresarial, busca e organização.
- `src/app/tarefas/page.tsx`: fila de atendimento e tarefas.
- `src/app/agenda/page.tsx`, `src/app/report/page.tsx`, `src/app/team/page.tsx` e `src/app/settings/page.tsx`: navegação e conceito de cada seção.

## Recorte implementado

| Miniatura | Rota da aplicação real | Demonstração |
|---|---|---|
| Início | `/` | Indicadores sintéticos e histórico visual ilustrativo |
| Processos da Empresa | `/processos` | Busca, filtro e cadastro temporário |
| Hoje | `/tarefas` | Lista de tarefas temporárias e conclusão |
| Agenda | `/agenda` | Eventos sintéticos |
| Relatórios | `/report` | Métricas locais e CSV marcado como exemplo |
| Equipe | `/team` | Equipes fictícias e tarefas |
| Configurações | `/settings` | Preferências somente da prévia |

**Limites:** não replica autenticação, RLS, conexões judiciais, sincronizações, integrações, cálculo jurídico, automações ou dados de clientes. Não promete paridade funcional com a aplicação completa. A cada atualização da página, os dados demonstrativos retornam ao estado inicial.

## Peso e isolamento

Arquivos de funcionamento: `sales/interactive-demo.mjs` (JavaScript da interface), `sales/interactive-demo-model.mjs` (estado sintético puro). O CSS é consolidado no stylesheet existente da página. Nenhuma biblioteca/framework adicional é carregada e não há acesso a APIs, cookies, Supabase ou armazenamento persistente. Testes garantem o alinhamento das rotas e a ausência de dependências externas.

A demonstração deve ser reavaliada se a navegação e o design do app oficial mudarem.