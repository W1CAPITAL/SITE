# ZapFast Cloudflare Web

Adaptacao web independente inspirada no [ZapFast](https://github.com/crmne/zapfast) (MIT). Interface e conexão WhatsApp via QR diretamente na Cloudflare Workers Free + Durable Objects SQLite Free. Sem servidor local ou Render.

A conexão usa [baileyrs](https://github.com/oxidezap/baileyrs) (MIT), integração não oficial. Há risco de limitações, desconexões e restrições de conta, além de quotas da Cloudflare. O pareamento de uma conta real ainda precisa ser testado.

## Configuração sem download no computador do usuário

Cloudflare Workers Builds: conectar a branch `zapfast-cloudflare-worker` do repositório W1CAPITAL/SITE, com diretório raiz `zapfast-cloudflare`; build `npm test`; deploy `npm run deploy`. Configurar secret de runtime `ADMIN_PASSWORD` de no mínimo 20 caracteres.

O Worker publica interface no mesmo endereço `*.workers.dev`. É uma versão web de mensagens de texto, não port integral do cliente Rust (sem chamadas/arquivos de mídia).
