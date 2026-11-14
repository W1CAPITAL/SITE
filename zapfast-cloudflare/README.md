# ZapFast Cloudflare Web

Adaptacao web independente inspirada no [ZapFast](https://github.com/crmne/zapfast) (MIT). Interface e conexão WhatsApp via QR diretamente na Cloudflare Workers Free + Durable Objects SQLite Free. Sem servidor local ou Render.

A conexão usa [baileyrs](https://github.com/oxidezap/baileyrs) (MIT), integração não oficial. Há risco de limitações, desconexões e restrições de conta, além de quotas da Cloudflare. O pareamento de uma conta real ainda precisa ser testado.

## Configuração sem download no computador do usuário

Cloudflare Workers Builds: conectar a branch `zapfast-cloudflare-worker` do repositório W1CAPITAL/SITE, com diretório raiz `zapfast-cloudflare`; build `npm test`; deploy `npm run deploy`. Configurar secret de runtime `ADMIN_PASSWORD` de no mínimo 20 caracteres.

O Worker publica interface no mesmo endereço `*.workers.dev`. É uma versão web de mensagens de texto, não port integral do cliente Rust (sem chamadas/arquivos de mídia).


## Instância pessoal (Cloudflare)

- Conta proprietária: `daviconcentrix@gmail.com`, **não** `corporacaow1capital@gmail.com`.
- Worker isolado: `zapfast-cloudflare-web`.
- URL de produção: https://zapfast-cloudflare-web.daviconcentrix.workers.dev
- Git branch: `zapfast-cloudflare-worker` / pasta `zapfast-cloudflare`.
- Build automático configurado na conta pessoal; nenhum programa, túnel ou servidor local necessário.
- A interface permite iniciar conversas a partir de um número com DDD, além da busca e das conversas sincronizadas.
- Consultas periódicas são pausadas quando a aba estiver oculta.

### Primeiro acesso (obrigatório)

No painel da **conta pessoal**, abra **Workers & Pages → zapfast-cloudflare-web → Settings → Variables and Secrets** e cadastre um segredo de texto `ADMIN_PASSWORD` com pelo menos 20 caracteres, preferencialmente uma senha exclusiva e aleatória. Faça novo deploy se o painel solicitar. Enquanto não houver a variável, as APIs do ZapFast retornam HTTP 503, sem expor QR Code ou mensagens.

Depois, entre com essa senha no painel web, clique em **Vincular WhatsApp** e leia o QR Code em **WhatsApp → Aparelhos conectados** do celular.

O protocolo é não oficial. **Não foi feito pareamento com conta real por este agente.** Confirme funcionalidade, privacidade e os limites de uso do plano gratuito antes de utilizar em produção. Esta versão implementa mensagens de texto e não substitui todos os recursos do ZapFast de desktop.
