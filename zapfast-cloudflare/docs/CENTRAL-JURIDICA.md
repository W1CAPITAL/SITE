# ZapFast · Central jurídica (LexisPredict / GET)

**Implantação:** Worker `zapfast-cloudflare-web` da Cloudflare **daviconcentrix@gmail.com**. Sem Render, Vercel ou programa local.

## Status real (14/11/2026)

- Interface integrada ao ZapFast Cloudflare e banco principal **lexis-predict** do Supabase, projeto `segjskjlbeydlljnefai`.
- Três tabelas próprias de autorização, mensagens e tentativas de envio estão criadas no mesmo banco, RLS ligado, acesso público e autenticado comum revogado, apenas `service_role` autorizado.
- O Worker ainda **não** possui `LEXIS_SUPABASE_SERVICE_ROLE_KEY`; a central fica inativa até conectar a credencial. Não informar clientes nem tentar contornar a RLS.
- `ZAPFAST_AGENT_AUTOSEND` é `false` por padrão. Não houve disparos para clientes durante a implementação.
- Não foi testada uma resposta WhatsApp real, nem a entrega de histórico antigo. Não afirmar que todas as engines da W1/W2/W3/INFINITUM foram incorporadas.

## Configuração sem download

1. Entre no [Supabase do LexisPredict](https://supabase.com/dashboard/project/segjskjlbeydlljnefai/settings/api). Na seção de chaves privadas, identifique a chave de serviço apropriada, armazenada apenas no servidor. **Nunca envie a chave por WhatsApp, ChatGPT ou GitHub.**
2. Abra a [Cloudflare pessoal](https://dash.cloudflare.com/e2cf08a1a538c291362a5e1939976906/workers/services/view/zapfast-cloudflare-web/production) → Settings → Runtime variables and secrets → Add → Type **Secret** → Name `LEXIS_SUPABASE_SERVICE_ROLE_KEY` → Value [a chave privada do banco]. Salve em Production. **Não** altere `ADMIN_PASSWORD`.
3. Acesse o ZapFast, faça login e abra **Atendimento jurídico · LexisPredict** para verificar se o acesso ao banco está ativo.
4. Na fila, valide identidade e consentimento do cliente fora do chat e então vincule um único processo. A autorização precisa ser documentada. Não autorize por nome exibido, número parecido ou mera suposição.
5. Após testes reais da consulta, auditoria e um envio previamente autorizado, o administrador pode cadastrar `ZAPFAST_AGENT_AUTOSEND` como variável **Text** com o valor `true` para respostas recebidas e estritamente elegíveis. Manter ausente/desativada enquanto houver dúvidas.

## Fluxo de cada mensagem recebida

1. Aceitar **somente** evento WhatsApp `messages.upsert` do tipo `notify`, recente (até cinco minutos), recebido de contato privado; ignorar mensagens próprias, grupos e histórico reexecutado.
2. Classificar determinísticamente: dúvida simples de andamento, dúvida administrativa/sensível ou assunto estranho ao processo. Não interpretar instruções vindas das mensagens como ordens do sistema.
3. Registrar uma única entrada por empresa, JID e identificador de mensagem, para impedir respostas duplicadas.
4. Confirmar JID com autorização explícita e processo único vinculado à **mesma empresa**; terceiros e números desconhecidos vão para análise humana, sem receber informação processual.
5. Consultar `processos` da empresa e o último andamento DataJud marcado como confirmado, consultado até 7 dias antes. Mensagens sobre sentenças, recursos, bloqueios, valores, pagamentos, audiências e outras situações complexas são revistas por pessoa. Sem confirmação, não afirmar que não houve movimentação.
6. Gerar texto curto para leigos, sem promessa, sem prazo inventado e sem destinatários copiados. Em modo de revisão, criar rascunho, sem envio.
7. Em modo de envio, respeitar **sempre** os limites da tabela LexisPredict `wa_outbound_safety_limits`, com teto rígido de até 10 mensagens ao dia, intervalo mínimo de 20 minutos, dias úteis das 9h às 17h (São Paulo), no máximo 1 resposta automática por contato/dia, e sem interferir se a conversa já foi atendida por alguém nas últimas 24h.
8. Reservar o envio com idempotência antes de chamar o transporte; se o resultado da chamada for incerto, não reenviar automaticamente.
9. Registrar evento de auditoria no LexisPredict **após** o transporte aceitar o envio, sem declarar mensagem entregue/lida e sem alterar automaticamente prazos ou retornos.

## Integrações e limitações

- **LexisPredict:** consultas de carteira `processos`, verificação do DataJud, regras de segurança, auditoria e tabelas novas.
- **Hermes / INFINITUM:** arquitetura de revisão de provas, consulta DJEN/DataJud e contingência são referências. Integração de motores e fallback ao tribunal **não habilitados** nesta primeira etapa. O DJEN não pode ser tratado como substituto completo do DataJud.
- **PredictLM, SheetsPredict, W2, W3:** modelos externos e skills exigem auditoria de código, política de acesso e credenciais próprias; não são executados automaticamente sobre dados sigilosos.
- **Documentação DataJud/DJEN:** [skills-datajud-djen](https://github.com/rvsanches/skills-datajud-djen) descreve falhas 403/429/504, alias, geo-bloqueio, resposta parcial e dedupe. O [datajud-process-scraper](https://github.com/ulisses-jurisdev/datajud-process-scraper) contém Selenium/Python e não pode ser colocado num Worker como se fosse Node puro; não é uma correção universal para erros HTTP 423, 401, 404, 500, 501 ou 503.
- **WhatsApp:** transporte não oficial, sem garantia de operação contínua nem proteção absoluta contra restrição do número. Monitorar e interromper imediatamente ao detectar erros/bloqueios.
- **LGPD e sigilo:** não expor chave de serviço, dados de cliente, QR, conversas ou PDFs a terceiros; o Worker deve exigir autenticação e autorização antes de ler o banco. Não usar dados jurídicos em modelos terceiros sem finalidade e tratamento autorizados.

## Testes pendentes antes do atendimento autônomo

- Conectividade do Worker ao Supabase com credencial privada.
- Verificação de contato cadastrado versus terceiro não autorizado, incluindo `@lid` e telefones reciclados.
- Consulta de andamento real e redação sem dados contraditórios.
- Simulação de múltiplas mensagens rápidas, destinatários repetidos, sessão desconectada e chats atendidos por funcionários.
- Envio e recibo reais em número de teste sob autorização; contagem no LexisPredict e revisão de auditoria.
- Integração auditada de outras fontes oficiais com erros HTTP e backoff, sem obter dados por bloqueio indevido.
