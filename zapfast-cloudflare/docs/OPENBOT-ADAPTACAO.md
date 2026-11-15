# ZapFast: recursos adaptados do CopilotKit OpenBot

Fonte estudada: [CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot) — aplicativo sob licença MIT; CopilotKit Intelligence é um serviço distinto, com condições de licenciamento próprias.

## Implementação real no ZapFast

A integração no Worker pessoal usa **código original** e adapta o conceito de agentes com papéis fixos e controle de ações. Não é instalação do servidor OpenBot, nem executa sua interface React, serviço Intelligence, computadores, Kubernetes, modelos ou servidor AG-UI externo.

Agentes visíveis na central jurídica:
- Identidade: contato e processo único autorizado
- Fontes oficiais: DataJud/DJEN e checagem de evidência
- Memória processual: observações/atividades internas vinculadas ao processo
- Redação simples: rascunho jurídico sem jargão
- Conformidade: risco, bloqueios e encaminhamento
- Auditoria: decisões da revisão humana

`src/openbot-governance.js` implementa os papéis e a verificação de revisão. `src/lexis-agent-db.js` grava uma decisão **uma única vez por mensagem recebida** no banco compartilhado Supabase/LexisPredict, em `zapfast_openbot_reviews`. A revisão é limitada ao contato autorizado, à mesma empresa e processo, com fonte DataJud recente. A decisão **nunca envia pelo WhatsApp**; no máximo libera o botão de copiar um rascunho para uso manual.

A aprovação de mensagens sensíveis ou de contatos não cadastrados é recusada; é possível rejeitar e registrar uma justificativa. Não existe “sempre autorizar” nem permissões amplas. As tentativas de envio do ZapFast permanecem com regras anteriores e os envios automáticos estão desligados por padrão.

Rotas autenticadas: `GET /api/agent/status` (papéis e modo), `GET /api/agent/openbot/reviews` (decisões) e `POST /api/agent/openbot/review` (permitir uma vez ou negar). Todas exigem login administrativo; as duas últimas exigem também o segredo do Supabase configurado.

## Segurança e custos

- Uma sessão WhatsApp existente no Durable Object. Nenhum QR extra e nenhum conector Web adicional.
- Supabase compartilhado, RLS ligado, sem `anon` ou `authenticated` lerem o histórico de aprovação; somente serviço autorizado.
- Não fornecer a `service_role` no navegador, GitHub, conversa ou em tabelas comuns.
- O Worker pessoal ainda precisa da configuração protegida `LEXIS_SUPABASE_SERVICE_ROLE_KEY` para habilitar leitura e escrita do CRM. Sem essa chave, mostrar papéis é possível mas consultar a fila e aprovar mensagens não.
- Nenhuma licença OpenBot, CopilotKit Intelligence ou serviço de inferência foi contratado, iniciado ou apresentado como gratuito para produção.
- O projeto OpenBot completo depende de backend, banco, ambiente de execução de agentes e licença de Intelligence conforme a forma de implantação. Para uso real do produto upstream, deve ser hospedado em infraestrutura compatível e integrado por AG-UI, sem duplicar sessão WhatsApp.
- Não confundir sucesso nos testes GitHub/Cloudflare com teste de QR Code, sessão, envio real e entrega do WhatsApp.

## Testes

- `test/openbot-governance.test.mjs`: papel de cada agente, escopo por mensagem, recusa de fontes antigas, contatos ambíguos, autorização genérica e envios.
- `test/openbot-review-db.test.mjs`: vínculo por empresa, persistência única, aprovação manual e bloqueio a pessoas sem autorização.

Fonte das ideias de governança: OpenBot [docs/approvals.md](https://github.com/CopilotKit/OpenBot/blob/main/docs/approvals.md), [docs/coworkers.md](https://github.com/CopilotKit/OpenBot/blob/main/docs/coworkers.md) e [docs/architecture.md](https://github.com/CopilotKit/OpenBot/blob/main/docs/architecture.md).
