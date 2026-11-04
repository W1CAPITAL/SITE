# LexisPredict — primeira oferta comercial da W1 Capital

**Auditoria:** 04/11/2026. **Status:** material interno pronto para validação comercial; **não há autorização automática para cobrar ou prometer todos os recursos**. Preços recorrentes já codificados no produto; implantação e custos abaixo são **sugestões**, não preços formalmente aprovados.

## 1. O que foi verificado nas fontes

### GitHub — `W1CAPITAL/LexisPredict`

- Branch `main`, commit `e99338a02f9f839388999c81a920b8ea8526cb22` (03/11/2026).
- Next.js `15.5.23`, Node `24.x`, TypeScript, React, Supabase; scripts `typecheck`, `test`, `build`, `commercial:check`.
- Planos definidos em `src/lib/planos-pacotes.ts`; preços em `src/lib/planos-precos.ts`.
- Rotas e server actions de processos, tarefas, equipe, clientes, importação, XLSX/CSV, análise de fases de prova, relatórios PDF, CRM, DataJud/DJEN, WhatsApp, configurações, cadastro e gestão comercial.
- Os botões e server actions existem, mas **não foi executado um teste end-to-end de um cliente externo neste diagnóstico**. Código presente e build válido não demonstram cada fluxo de usuário funcionando.

### Vercel — produção

- Projeto `private` da equipe `assecom`; domínio `https://lexispredict.vercel.app`.
- Deployment `dpl_4PBo3pSWdVbdehQt3msez6PayNkc`, **READY**, branch `main`, commit `e99338a0`.
- A implantação não comprova funcionamento de autenticação, pagamento, integrações terceiras ou UX em navegador com dados.
- Plano atual da conta e faturas efetivamente pagas **não puderam ser confirmados** (consulta ao resumo de cobrança indisponível); não afirmar custo real Vercel como se fosse fatura.

### Supabase — projeto `lexis-predict`

- ID `segjskjlbeydlljnefai`, status `ACTIVE_HEALTHY`; base `249 MB` no momento da consulta.
- `processos`: **2.726 registros, concentrados em 1 empresa**.
- `empresas`: **3 registros** (todos `plano=maximo`, `billing_status=active`); `usuarios`: **11 perfis**; `tarefas_realizadas`: **961 registros**.
- `crm_negocios`: **0 registros**; logo não se pode anunciar pipeline de vendas comprovadamente usado.
- RLS habilitada nas tabelas centrais examinadas, incluindo empresas, usuários, processos e tabelas CRM. **Não houve simulação negativa entre duas empresas**; isolamento comercial ainda precisa de teste com contas segregadas.
- `wa_local_bridges`: 1 bridge com heartbeat recente e estado **`qr`**. Não está vinculada a aparelho nesta auditoria.
- **Não existem no schema público `assinaturas`, `solicitacoes_assinatura` ou `commercial_audit_log`**, embora o fluxo comercial no código faça referência a essas tabelas. O campo `billing_status=active` é um estado do cadastro, **não uma prova de pagamento recebido**.
- Não foram acessados, extraídos ou alterados dados pessoais de clientes nesta auditoria; apenas metadados e contagens agregadas.

## 2. Matriz de disponibilidade comercial

| Funcionalidade | Evidência | Como vender com precisão |
| --- | --- | --- |
| Carteira de processos e filtros | Rota `/processos`, código de consulta, 2.726 registros | **Demonstração orientada**, após confirmar acesso com dados de teste |
| Agenda, tarefas, retornos e equipe | `/agenda`, `/tarefas`, registros históricos e usuários | **Demonstração orientada**, sem garantir automações ou prazos judiciais |
| Importação e exportação CSV/XLSX | `/import`, `exportCasesToCSVAction`, `exportDossieXlsxAction`, permissões por cargo | **Demonstração condicionada** à conta/role e conjunto de dados completos |
| Fases processuais/provas | `/fases-provas` com classificação e exportação XLSX | **Apoio à triagem**, exige conferência documental; não oferece certeza sobre sentença ou revelia |
| Relatórios e PDF | `/report/completo`, exportação PDF sujeita a permissão/dados completos | **Demonstração condicionada** à exportação funcionar no tenant de teste |
| CRM/financeiro | Rotas CRM, actions e tabelas, mas `crm_negocios=0` | **Módulo existente**, maturidade operacional externa ainda não comprovada |
| Scanner DataJud/DJEN | Código para consulta e rotas do plano Operacional/Máximo | **Capacidade dependente de fontes externas e validação**; sem prometer atualização em tempo real |
| Peças, OCR e IA | Componentes/actions específicos, alguns dependem de configuração e serviços | **Sob avaliação por caso de uso**; não anunciar automação jurídica ilimitada |
| WA.Auto/WhatsApp | Worker e interface; bridge está em `qr` | **Não anunciar como envio automático pronto**; precisa de vinculação, testes e regras de plataforma |
| Cadastro, planos e pagamentos self-service | UI e actions existentes, mas tabelas de assinatura/solicitação ausentes; webhook genérico marca CRM recebido, não subscription | **Bloqueado para venda autônoma**; implantação comercial assistida só após testes |
| Multiempresa e permissões | Estrutura por `empresa_id` e políticas RLS existentes | **Projeto multiempresa previsto**; não prometer isolamento auditado sem testes negativos |

Não chamar um plano de “mais escolhido” sem registros agregados e auditáveis de vendas. Não prometer ganhos judiciais, ausência de erro, consulta oficial contínua, WhatsApp ilimitado nem IA gratuita integrada.

## 3. Perfil inicial de cliente ideal — hipótese a testar

**Escritórios pequenos e equipes de assessoria jurídica que lidam com carteiras processuais recorrentes.** Dor de compra: informações espalhadas, retornos vencidos, dificuldade de localizar quem acompanhou o caso e geração manual de relatórios. Priorizar clientes que aceitem demonstração e piloto com dados de teste, com responsável por contratação e por proteção de dados.

Não presumir que qualquer segmento jurídico é compatível. Perguntas mínimas: volume de processos, equipe, ferramentas atuais, como acompanham prazos/retornos, dificuldade mais custosa, urgência real, quem decide e necessidade de migração.

## 4. Planos e precificação

**Preços recorrentes abaixo já estão codificados em `src/lib/planos-precos.ts` no LexisPredict.** São referência comercial existente, **não comprovação de venda ou aprovação final**.

| Plano | Referência mensal | Anual do código | Conteúdo verificável no mapeamento do produto |
| --- | ---: | ---: | --- |
| **Essencial** | **R$ 197** | R$ 1.970 | Carteira, fila, clientes, tarefas, agenda, equipe, importação e exportação |
| **Financeiro** | **R$ 297** | R$ 2.970 | Essencial + CRM, finanças, cálculos, relatórios e analytics |
| **Operacional** | **R$ 397** | R$ 3.970 | Essencial + módulos judiciais, Scanner DataJud/DJEN, documentos e atendimento, **somente após validação por módulo** |
| **Máximo** | **R$ 597** | R$ 5.970 | Combinação Operacional + Financeiro, **sem promessa incondicional das integrações** |

Os valores anuais correspondem a 10 mensalidades no código. **Não ofertar cobrança anual adiantada até formalizar contratos, entrega, suporte, cancelamento, fluxo financeiro e faturamento.**

### Taxa de implantação — sugestão comercial, ainda não cadastrada no LexisPredict

| Plano | Implantação sugerida (única) | Hipótese de horas de implantação |
| --- | ---: | ---: |
| Essencial | **R$ 490** | 3 h |
| Financeiro | **R$ 690** | 4 h |
| Operacional | **R$ 790** | 5 h |
| Máximo | **R$ 990** | 6 h |

A implantação sugerida cobre levantamento inicial, configuração básica e orientação dentro do escopo firmado. Migração extensa, automações específicas, personalizações, integrações externas e treinamento adicional devem ser orçados separadamente. Quantidade de registros importáveis, SLA e capacidade multiusuário precisam de testes de carga; esses valores não constituem garantia técnica de limite.

**Oferta inaugural recomendada:** vender **Essencial — R$ 197/mês + R$ 490 de implantação**, apenas **após** criar e validar tenant segregado e confirmar cobrança/contrato. Oferecer demonstração gratuita sem dados reais. Para escritório com necessidade comprovada de tribunais, propor Operacional como proposta sob validação.

## 5. Custo estimado e margem — premissas explícitas

### Despesa de infraestrutura futura, não fatura atual

| Provedor | Faixa pública em 04/11/2026 | Observação |
| --- | --- | --- |
| Vercel | **Pro a partir de US$ 20/mês por assento pago** | Hobby não permite uso comercial; plano atual da W1 não confirmado; excessos/adicionais possíveis |
| Supabase | **Pro a partir de US$ 25/mês**, um projeto Micro incluído | Backup diário com 7 dias; projetos adicionais/uso têm preço variável |
| **Base mínima hipotética** | **US$ 45/mês** | 1 assento Vercel Pro + 1 projeto Supabase Pro, sem impostos, câmbio, Render, IA, domínio, storage adicional ou custos de operação |
| Worker Render / WhatsApp | **Não precificado nesta auditoria** | Opcional e não vendável como recurso garantido no piloto |
| Integrações, SMS, e-mail, IA, tribunais | **Variável / não verificado** | Devem ser orçados antes de entrar nos contratos |

O Supabase Free oferece 500 MB de banco e não oferece backup automático; o banco observado possui aproximadamente 249 MB. **Não usar a capacidade restante do Free como prova de que o produto pode escalar gratuitamente ou que os dados têm backup confiável.**

### Custo de atendimento por cliente — hipótese para decisão

Supondo **R$ 80/h de custo interno total de mão de obra** (apenas premissa, não despesa contábil conhecida):

| Plano | Suporte hipotético/mês | Custo de trabalho/mês | Preço/mês |
| --- | ---: | ---: | ---: |
| Essencial | 0,5 h | R$ 40 | R$ 197 |
| Financeiro | 0,75 h | R$ 60 | R$ 297 |
| Operacional | 1 h | R$ 80 | R$ 397 |
| Máximo | 1,5 h | R$ 120 | R$ 597 |

Em cobrança por **cartão nacional Stripe**, a tarifa pública de referência é **3,99% + R$ 0,39 por transação**, se esse provedor vier a ser contratado. Não há checkout Stripe confirmado no LexisPredict; usar tarifa apenas como exemplo, não como custo já contratado. Recorrência Stripe Billing e PIX podem ter condições adicionais.

Exemplo **puramente hipotético**, nunca resultado real: 10 contas (4 Essencial, 3 Financeiro, 2 Operacional e 1 Máximo) gerariam **R$ 3.070/mês de receita bruta**. Suporte estimado: **R$ 620**; taxas de cartão estimadas: **R$ 126,39**; sobra **R$ 2.323,61 antes de infraestrutura em USD, impostos, aquisição, inadimplência, desenvolvedor, implantação e demais custos**. Isso não é lucro comprovado.

## 6. Como vender sem prometer demais

Mensagem central:

> **LexisPredict organiza processos, tarefas, acompanhamentos e dados da operação jurídica em um só ambiente.** A W1 apresenta o sistema com exemplos, entende o fluxo de trabalho do escritório e propõe uma implantação compatível com o que está disponível e foi testado.

- **Promessa comercial permitida:** visualização e organização operacional; papéis, filtros e exportações demonstrados em sessão real.
- **Promessa proibida sem testes:** atualização judicial garantida em tempo real, todos os tribunais integrados, IA que decide casos, WhatsApp 24 horas, pagamentos e cadastro automáticos, retorno financeiro ou resultado judicial assegurado.
- **Condições do serviço:** empresa emissora e contrato devem ser formalmente identificados; definir meios de pagamento, responsabilidade por dados, backups, suporte, limitações, portabilidade e cancelamento. Não assumir que o registro de `billing_status=active` seja recibo de pagamento.

## 7. Checklist de liberação para o primeiro cliente pagante

- [ ] Criar **tenant de demonstração segregado** e usuário novo, com validação de e-mail e política de senha.
- [ ] Fazer **teste cruzado de autorização** com dois tenants e papéis distintos nas rotas e Server Actions; confirmar que contas não veem processos, relatórios ou arquivos uma da outra.
- [ ] Corrigir divergência de schema comercial (`assinaturas`, `solicitacoes_assinatura`, `commercial_audit_log`) **em ambiente de teste, com migração e testes**.
- [ ] Testar caminho completo: cadastro → confirmação de e-mail → autorização de plano → login → onboarding → acesso apenas ao pacote vendido → cancelamento/bloqueio.
- [ ] Com dados **fictícios**, validar importação de processos, filtro por CNJ, atribuição de tarefas e exportação XLSX/CSV/PDF sob permissões corretas.
- [ ] Verificar recuperação de conta e impedir troca de senha/acesso baseada somente em e-mail sem prova de titularidade.
- [ ] Verificar backup e **restauração testada**, monitoramento, quotas, segurança de anexos e limites de suporte.
- [ ] Definir oferta aprovada, condições contratuais, política de privacidade, canal de suporte e processo **real de recebimento**.
- [ ] Remover eventual selo `Mais escolhido` se não houver histórico agregado de clientes que o comprove.
- [ ] Realizar uma demonstração a interessado **sem acesso a dados reais da carteira jurídica** e registrar objeções/retorno autorizado.

## 8. Roteiro de demonstração

Ver [roteiro de 12 minutos](../sales/offers/lexispredict-demo.md). Não usar a base atual de processos de clientes como demonstração pública.

## 9. Fontes e limitações

**Fonte de implementação:** `W1CAPITAL/LexisPredict` branch `main`: `src/lib/planos-precos.ts`, `src/lib/planos-pacotes.ts`, `src/app/actions/planos-actions.ts`, `src/app/actions/commercial-signup-actions.ts`, `src/app/actions/export-actions.ts`, `src/app/fases-provas/fases-provas-client.tsx`, `src/app/report/completo/page.tsx`, `src/app/api/webhooks/pagamento/route.ts`, `package.json`.

**Fonte de infraestrutura:** Vercel deployment READY, Supabase ACTIVE_HEALTHY, consultas read-only a schema/políticas/contagens em 04/11/2026. Não foram realizados novos cadastros nem compras, mudanças de banco, disparos de WhatsApp ou prova E2E de outro tenant.

**Referências de preços públicos:** https://vercel.com/pricing · https://vercel.com/docs/plans/hobby · https://supabase.com/pricing · https://stripe.com/br/pricing · https://supabase.com/docs/guides/platform/backups .

**Status comercial:** **pronto para apresentação preliminar supervisionada; não aprovado para autosserviço ou promessa irrestrita**.
