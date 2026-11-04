# W1 Sales — autenticação do futuro painel privado

**Estado:** arquitetura preparada, **não implementada nem ativada no site público**. Base: arquivo fornecido \`Skill autenticação.pdf\` (18 páginas, tema \`nextjs-supabase-multitenant-auth\`). Verificar Supabase e Next.js atuais no início da implementação.

## A decisão arquitetural

O site institucional \`SITE\` continuará estático, leve e público. O CRM de prospecção e o painel de agentes deverão ser **um aplicativo separado** com autenticação, backend protegido e Supabase **comercial independente**. Não migrar o site de divulgação inteiro para Next.js apenas porque o guia aborda Next.js.

### Papéis previstos

| Papel | Responsabilidade | Exigências |
| --- | --- | --- |
| proprietário / superadmin W1 | Administrar organizações autorizadas e controle de acesso | Login forte, trilha de auditoria, sem acesso indiscriminado a dados de outras organizações |
| admin comercial | Convidar membros e gerenciar sua organização | Escopo de tenant confirmado no servidor e no banco |
| comercial | Criar e acompanhar oportunidades da organização | Sem gestão de usuários e sem importação em massa não autorizada |
| analista | Pesquisar e qualificar empresas | Informações de fonte, data e decisão humana; sem envio automático |
| leitura / auditor | Ver indicadores permitidos | Nenhuma edição ou disparo |

Os nomes são uma especificação de papéis **propostos**, não usuários criados. Uma organização pode ter acesso suspenso; um usuário desativado não deve manter consulta nem durante a vida do JWT.

## Três clientes Supabase (guia, páginas 1–2)

1. **Navegador:** chave pública/publishable e sessão sob RLS. Nunca \`service_role\`.
2. **Servidor:** cliente SSR com cookies para Server Components, Route Handlers e Server Actions, usando \`@supabase/ssr\`.
3. **Admin:** cliente separado, \`server-only\` e chave secreta em variável protegida, para operações estritamente administrativas com autorização prévia.

Todas as leituras e mutações de oportunidades devem ter verificações de **tenant** e papel no servidor. Nunca confiar em \`tenant_id\`/papel enviados pelo navegador, nem em \`user_metadata\` editável.

## Fluxos de autenticação a implementar

- Login com mensagens de erro discretas e limitação de tentativas.
- Convite criado por admin autorizado; sem cadastro aberto indiscriminado.
- Link \`token_hash\` → \`verifyOtp\` no servidor; checar tipo \`invite\`/\`recovery\` e configuração corrente da biblioteca. Evitar colocar tokens em logs.
- Após criação de senha, renovar sessão se necessário para claims atualizados.
- Recuperação de senha, expiração de convite e revogação de sessões.
- Redirecionamentos com cookies propagados **após** confirmação de login; origem pública confiável e não baseada em \`Host\` arbitrário.
- Separar autenticação de **autorização**: o frontend pode direcionar o usuário, mas o banco é a última barreira.

## RLS e isolamento

As recomendações do PDF (páginas 3–5, 14–17) destacam falhas práticas:

- Na versão citada pelo guia, Next.js 16 utiliza \`proxy.ts\`. Validar a versão real do app antes de copiar essa estrutura; **não há Next.js no SITE estático**.
- \`getUser()\` não devolve claims como propriedades mágicas; quando presentes, \`app_metadata\` pode ser usado para interface/roteamento, mas autorização exige tabela de perfil e estado **atuais**.
- O \`Custom Access Token Hook\` deve funcionar para tenant normal **e** administrador sem tenant; testar ambos.
- Se usar \`SECURITY DEFINER\` por uma razão demonstrada, manter a função em schema não exposto, com \`search_path\` travado, \`EXECUTE\` mínimo e revisão de privilégios.
- \`GRANT\` **não substitui** política RLS. Além do tenant, checar usuário ativo e permissão específica.
- Usuário desativado com token antigo deve perder acesso **na próxima ação**, inclusive ao chamar a API diretamente.
- \`UPDATE\` requer filtro de ownership no \`USING\` e no \`WITH CHECK\` e, em geral, permissão de \`SELECT\`.
- Hooks, views, RPC e eventos de autenticação têm privilégios próprios; verificar linter e acessos anon/authenticated.
- \`supabase_auth_admin\` pode precisar de grant e política para tabelas com RLS; criar somente após examinar o schema final.
- \`supabase db advisors\` / \`get_advisors\` e testes negativos de IDOR/BOLA são parte do aceite.

## Segurança específica de leads

- Empresas pesquisadas não equivalem a leads opt-in; manter bases, estados e direitos separados.
- Toda consulta API de empresa pesquisada requer autenticação e tenant; o site \`sales/prospecting\` atual é apenas uma ferramenta de links públicos.
- Armazenar somente campos estritamente necessários, a origem, data da consulta e evidência do interesse comercial ou outro fundamento legal aplicável.
- Importações de CSV e automações devem ter verificação de termos, limites de volume, rejeição de duplicados e aprovação humana.
- Não exibir telefones ou e-mails de pessoas físicas como alvos sem avaliação de base legal; opt-out visível e registrado.

## Critérios E2E antes da implantação

- Acesso anônimo negado a qualquer registro de prospect, lead, proposta ou nota comercial.
- Usuário do tenant A não lê/altera dados do tenant B via URL direta, JWT antigo, REST, RPC nem Service Role exposto.
- Usuário desativado perde acesso na ação seguinte sem esperar expiração de JWT.
- Convite/recovery funcionam em segundo navegador; tokens não aparecem nos logs.
- Cabeçalhos de papel forjados e \`Host\` alterado não mudam autorização nem domínio de redirecionamento.
- Convites respeitam limites de envio do provedor; mensagens são transacionais, sem marketing automático.
- Todos os grants, políticas, funções e views são auditados em banco **comercial de teste**, nunca no Supabase de produção do LexisPredict.
- Chaves privadas e credenciais ficam apenas no ambiente de servidor; dependências fixadas com lockfile.

**Importante:** o guia contém exemplos concretos úteis, mas um copy/paste isolado de políticas, hooks ou proxy não constitui uma configuração segura. Primeiro modelar e testar o sistema real.
