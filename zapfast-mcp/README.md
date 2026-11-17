# ZapFast MCP

Servidor MCP remoto separado para o OpenMausBot. O Worker `zapfast-mcp` usa uma ligação cross-script para a classe `WaSession` já existente no Worker `zapfast-cloudflare-web`; não cria sessão WhatsApp nem QR Code.

## Ferramentas

- `zapfast_status`: estado da sessão, sem expor QR Code.
- `zapfast_list_chats`: lista conversas da sessão atual.
- `zapfast_read_messages`: lê mensagens de uma conversa privada.
- `zapfast_draft_reply`: prepara um rascunho temporário (10 minutos), sem enviar.
- `zapfast_send_approved`: envia uma única vez o rascunho após aprovação humana, com texto idêntico e frase de confirmação.

O envio começa desativado (`ZAPFAST_MCP_SEND_ENABLED=false`). O envio incerto nunca é repetido automaticamente. A troca de número permanece na interface do ZapFast, pois ela pode invalidar a sessão e apagar histórico.

## Segurança

- Configure `ZAPFAST_MCP_TOKEN` como Secret de produção, com pelo menos 32 caracteres aleatórios.
- Envie o token ao OpenMausBot somente no cabeçalho `Authorization: Bearer ...`.
- Nunca coloque o token no GitHub, no código, na URL, em logs ou no Supabase.
- A sessão atual é única (`one-whatsapp`). Este Worker não implementa multiempresa/múltiplos números.
- O histórico existente continua sob responsabilidade do Worker ZapFast/Supabase; o novo Worker armazena somente rascunhos temporários e recibos de envio para impedir duplicidade.
- O MCP atual do INFINITUM é somente leitura: ele pesquisa clientes/processos e propõe edições, mas não grava atendimentos. Até existir uma ação de atendimento com aprovação, o operador deve registrar manualmente o atendimento no CRM. Não use `crm_propose_edit` como substituto de uma atividade de atendimento.\n- O retorno do WhatsApp não prova entrega ou leitura.

## Endpoint

`https://zapfast-mcp.daviconcentrix.workers.dev/mcp`

Transporte: Streamable HTTP. Autenticação: `Authorization: Bearer <ZAPFAST_MCP_TOKEN>`.

## Testes

`npm test`
