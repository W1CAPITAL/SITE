const PRIVATE_JID = /^\d+@(s\.whatsapp\.net|lid)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPrivateJid(value) {
  return typeof value === 'string' && PRIVATE_JID.test(value);
}

export function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(typeof left === 'string' ? left : '');
  const b = new TextEncoder().encode(typeof right === 'string' ? right : '');
  const max = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let i = 0; i < max; i += 1) {
    difference |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return a.length > 0 && b.length > 0 && difference === 0;
}

export function validateDraftArgs(args = {}) {
  const jid = args?.jid;
  const text = typeof args?.text === 'string' ? args.text.trim() : '';
  if (!isPrivateJid(jid)) return { ok: false, error: 'jid_private_required' };
  if (!text || text.length > 4096) return { ok: false, error: 'text_length_invalid' };
  return { ok: true, value: { jid, text } };
}

export function validateSendArgs(args = {}) {
  const draftId = args?.draft_id;
  const confirmText = args?.confirm_text;
  const phrase = args?.confirmation_phrase;
  if (typeof draftId !== 'string' || !UUID.test(draftId)) return { ok: false, error: 'draft_id_invalid' };
  if (typeof confirmText !== 'string' || !confirmText.trim() || confirmText.length > 4096) {
    return { ok: false, error: 'confirm_text_required' };
  }
  if (phrase !== 'ENVIAR_MENSAGEM_APROVADA') return { ok: false, error: 'explicit_confirmation_required' };
  return { ok: true, value: { draft_id: draftId, confirm_text: confirmText, confirmation_phrase: phrase } };
}

const objectSchema = properties => ({
  type: 'object',
  properties: Object.fromEntries(Object.entries(properties).map(([key, value]) => [
    key, Object.fromEntries(Object.entries(value).filter(([property]) => property !== 'optional')),
  ])),
  required: Object.keys(properties).filter(key => !properties[key].optional),
  additionalProperties: false,
});

export const TOOL_DEFINITIONS = Object.freeze([
  {
    name: 'zapfast_status',
    description: 'Consulta o estado da sessão WhatsApp já conectada ao ZapFast. Nunca retorna QR Code, cookies, tokens ou credenciais.',
    inputSchema: objectSchema({}),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'zapfast_list_chats',
    description: 'Lista conversas da única sessão WhatsApp conectada. Use apenas para localizar uma conversa privada; grupos não podem receber mensagens por este MCP.',
    inputSchema: objectSchema({
      query: { type: 'string', description: 'Filtro opcional por nome ou identificador da conversa.', optional: true },
      limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Quantidade máxima de conversas (padrão 50).', optional: true },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'zapfast_read_messages',
    description: 'Lê o histórico recente de uma conversa privada. Aceita somente JIDs individuais @s.whatsapp.net ou @lid; grupos são bloqueados.',
    inputSchema: objectSchema({
      jid: { type: 'string', description: 'Identificador da conversa privada retornado por zapfast_list_chats.' },
      limit: { type: 'integer', minimum: 1, maximum: 150, description: 'Quantidade máxima de mensagens (padrão 50).', optional: true },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'zapfast_draft_reply',
    description: 'Guarda temporariamente uma resposta para revisão humana. Não envia nada. Antes de redigir, consulte o MCP do INFINITUM para confirmar cliente, processo, histórico e regras da empresa. O rascunho expira em 10 minutos.',
    inputSchema: objectSchema({
      jid: { type: 'string', description: 'Identificador da conversa privada.' },
      text: { type: 'string', minLength: 1, maxLength: 4096, description: 'Texto integral que será mostrado ao operador antes do envio.' },
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'zapfast_send_approved',
    description: 'ENVIA uma única vez o rascunho previamente preparado. Só chame depois de mostrar o texto integral ao operador e receber aprovação humana no OpenMausBot (a frase de confirmação não substitui a aprovação da interface). Exige o texto idêntico e a frase ENVIAR_MENSAGEM_APROVADA. Não confirma entrega ou leitura. Não repita se o resultado for incerto. O MCP atual do INFINITUM é somente leitura; solicite registro manual do atendimento no CRM.',
    inputSchema: objectSchema({
      draft_id: { type: 'string', format: 'uuid', description: 'ID devolvido por zapfast_draft_reply.' },
      confirm_text: { type: 'string', minLength: 1, maxLength: 4096, description: 'Texto integral exatamente igual ao rascunho aprovado.' },
      confirmation_phrase: { type: 'string', const: 'ENVIAR_MENSAGEM_APROVADA', description: 'Frase obrigatória após a aprovação humana.' },
    }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
]);
