import {
  TOOL_DEFINITIONS,
  constantTimeEqual,
  isPrivateJid,
  validateDraftArgs,
  validateSendArgs,
} from './policy.js';

const DEFAULT_PROTOCOL_VERSION = '2025-03-26';
const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-03-26', '2025-06-18', '2025-11-25']);
const INSTRUCTIONS = [
  'Este servidor controla somente a sessão WhatsApp já conectada ao ZapFast (sessão única atual). Não cria QR Code nem conecta outro número.',
  'Use o MCP do INFINITUM separadamente para identificar o cliente, consultar o processo, ler atendimentos anteriores e registrar o atendimento após uma resposta enviada. Não afirme que o atendimento foi registrado sem confirmação do CRM.',
  'Antes de responder, leia o histórico da conversa e consulte o cadastro/processo no INFINITUM. Não identifique clientes apenas pelo nome exibido no WhatsApp.',
  'Não responda em grupos. Não envie mensagens em massa. Não envie nada sem aprovação humana explícita no OpenMausBot.',
  'Para enviar: prepare o texto com zapfast_draft_reply, mostre o texto integral ao operador, aguarde a aprovação humana e só então chame zapfast_send_approved com o mesmo texto e a frase exigida.',
  'Se o envio retornar resultado incerto, não tente novamente. Peça ao operador para conferir a conversa no WhatsApp.',
  'A troca de número e a limpeza do histórico permanecem na interface do ZapFast; não tente desconectar a sessão por este servidor.',
].join(' ');

function jsonResponse(request, payload, protocolVersion = DEFAULT_PROTOCOL_VERSION) {
  const headers = {
    'cache-control': 'no-store',
    'mcp-protocol-version': protocolVersion,
  };
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/event-stream') && !accept.includes('application/json')) {
    headers['content-type'] = 'text/event-stream; charset=utf-8';
    return new Response(`event: message\ndata: ${JSON.stringify(payload)}\n\n`, { status: 200, headers });
  }
  headers['content-type'] = 'application/json; charset=utf-8';
  return new Response(JSON.stringify(payload), { status: 200, headers });
}

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function toolResult(id, value, isError = false) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      isError,
    },
  };
}

async function callWa(env, path, method = 'GET', body) {
  if (!env.WA) throw new Error('wa_binding_missing');
  const stub = env.WA.get(env.WA.idFromName('one-whatsapp'));
  const request = new Request(`https://zapfast-internal${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await stub.fetch(request);
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: 'invalid_internal_response' }; }
  if (!response.ok) throw new Error(data?.error || `whatsapp_http_${response.status}`);
  return data;
}

async function callGuard(env, path, method = 'GET', body) {
  if (!env.GUARD) throw new Error('delivery_guard_binding_missing');
  const stub = env.GUARD.get(env.GUARD.idFromName('zapfast-mcp-deliveries'));
  const response = await stub.fetch(new Request(`https://zapfast-guard${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: 'invalid_guard_response' }; }
  if (!response.ok) throw new Error(data?.error || `guard_http_${response.status}`);
  return data;
}

async function executeTool(name, args = {}, env) {
  if (name === 'zapfast_status') {
    const data = await callWa(env, '/api/status');
    const state = String(data?.state || 'unknown');
    return {
      connected: state === 'connected',
      state,
      qr_available: state === 'waiting_for_qr',
      error: data?.error || null,
      note: 'O QR Code nunca é retornado pelo MCP. Use a interface ZapFast para parear ou trocar o número.',
    };
  }

  if (name === 'zapfast_list_chats') {
    const limit = Math.max(1, Math.min(100, Number.isInteger(args.limit) ? args.limit : 50));
    const query = typeof args.query === 'string' ? args.query.trim().toLocaleLowerCase('pt-BR') : '';
    const data = await callWa(env, '/api/chats');
    const chats = Array.isArray(data?.chats) ? data.chats : [];
    const filtered = query
      ? chats.filter(chat => `${chat.name || ''} ${chat.jid || ''}`.toLocaleLowerCase('pt-BR').includes(query))
      : chats;
    return { count: Math.min(filtered.length, limit), total_matches: filtered.length, chats: filtered.slice(0, limit) };
  }

  if (name === 'zapfast_read_messages') {
    if (!isPrivateJid(args.jid)) throw new Error('Somente conversas privadas podem ser consultadas por este MCP.');
    const limit = Math.max(1, Math.min(150, Number.isInteger(args.limit) ? args.limit : 50));
    const params = new URLSearchParams({ jid: args.jid });
    const data = await callWa(env, `/api/messages?${params.toString()}`);
    const messages = Array.isArray(data?.messages) ? data.messages : [];
    return { jid: args.jid, count: Math.min(messages.length, limit), messages: messages.slice(-limit) };
  }

  if (name === 'zapfast_draft_reply') {
    const validation = validateDraftArgs(args);
    if (!validation.ok) throw new Error(validation.error);
    const status = await callWa(env, '/api/status');
    if (status?.state !== 'connected') throw new Error('WhatsApp não está conectado. Nenhum rascunho foi preparado.');
    const draftId = crypto.randomUUID();
    const draft = await callGuard(env, '/draft', 'POST', {
      id: draftId,
      jid: validation.value.jid,
      text: validation.value.text,
      now: Date.now(),
      ttlSeconds: 600,
    });
    return {
      draft_id: draft.id,
      jid: draft.jid,
      text: draft.text,
      expires_at: new Date(draft.expires_at).toISOString(),
      status: 'pending_human_approval',
      sent: false,
    };
  }

  if (name === 'zapfast_send_approved') {
    if (env.ZAPFAST_MCP_SEND_ENABLED !== 'true') throw new Error('Envio desativado. Primeiro teste leitura e rascunhos; habilite ZAPFAST_MCP_SEND_ENABLED somente depois de revisar as permissões.');
    const validation = validateSendArgs(args);
    if (!validation.ok) throw new Error(validation.error);
    const status = await callWa(env, '/api/status');
    if (status?.state !== 'connected') throw new Error('WhatsApp desconectado. O rascunho não foi enviado.');
    const reserved = await callGuard(env, '/reserve', 'POST', {
      draft_id: validation.value.draft_id,
      confirm_text: validation.value.confirm_text,
    });
    try {
      const sent = await callWa(env, '/api/send', 'POST', { jid: reserved.jid, text: reserved.text });
      if (sent?.ok !== true) throw new Error('O transporte não confirmou a aceitação da mensagem.');
      await callGuard(env, '/finish', 'POST', { draft_id: reserved.id, status: 'sent' });
      return {
        status: 'transport_accepted',
        draft_id: reserved.id,
        recipient: reserved.jid,
        delivery_confirmed: false,
        note: 'O WhatsApp aceitou a operação de envio. Isso não confirma entrega nem leitura. Registre o atendimento no INFINITUM separadamente.',
      };
    } catch (error) {
      await callGuard(env, '/finish', 'POST', { draft_id: reserved.id, status: 'uncertain' }).catch(() => {});
      throw new Error(`Resultado de envio incerto; não repita automaticamente. Confira a conversa no WhatsApp. Detalhe: ${error?.message || 'falha no transporte'}`);
    }
  }

  throw new Error(`Ferramenta desconhecida: ${name}`);
}

function getProtocolVersion(body) {
  const requested = body?.params?.protocolVersion;
  return SUPPORTED_PROTOCOL_VERSIONS.has(requested) ? requested : DEFAULT_PROTOCOL_VERSION;
}

export async function handleMcpRequest(request, env) {
  if (request.method !== 'POST') return new Response('Use POST com JSON-RPC MCP.', { status: 405, headers: { allow: 'POST' } });
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return new Response('Content-Type application/json obrigatório.', { status: 415 });
  const token = env.ZAPFAST_MCP_TOKEN;
  if (typeof token !== 'string' || token.length < 32) return Response.json({ error: 'ZAPFAST_MCP_TOKEN não configurado como Secret.' }, { status: 503 });
  const authorization = request.headers.get('authorization') || '';
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!constantTimeEqual(supplied, token)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return Response.json(rpcError(null, -32700, 'Parse error'), { status: 400 }); }
  if (!body || Array.isArray(body) || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return Response.json(rpcError(body?.id ?? null, -32600, 'Invalid Request'), { status: 400 });
  }
  const protocolVersion = getProtocolVersion(body);
  if (body.method.startsWith('notifications/')) return new Response(null, { status: 202, headers: { 'mcp-protocol-version': protocolVersion } });
  if (!Object.prototype.hasOwnProperty.call(body, 'id')) return new Response(null, { status: 202, headers: { 'mcp-protocol-version': protocolVersion } });

  if (body.method === 'initialize') {
    return jsonResponse(request, {
      jsonrpc: '2.0',
      id: body.id,
      result: {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'ZapFast MCP', version: '1.0.0' },
        instructions: INSTRUCTIONS,
      },
    }, protocolVersion);
  }
  if (body.method === 'ping') return jsonResponse(request, { jsonrpc: '2.0', id: body.id, result: {} }, protocolVersion);
  if (body.method === 'tools/list') return jsonResponse(request, { jsonrpc: '2.0', id: body.id, result: { tools: TOOL_DEFINITIONS } }, protocolVersion);
  if (body.method === 'tools/call') {
    const name = body.params?.name;
    const args = body.params?.arguments || {};
    if (typeof name !== 'string') return jsonResponse(request, rpcError(body.id, -32602, 'Tool name is required'), protocolVersion);
    try {
      const value = await executeTool(name, args, env);
      return jsonResponse(request, toolResult(body.id, value), protocolVersion);
    } catch (error) {
      return jsonResponse(request, toolResult(body.id, { error: error?.message || 'tool_failed' }, true), protocolVersion);
    }
  }
  return jsonResponse(request, rpcError(body.id, -32601, `Method not found: ${body.method}`), protocolVersion);
}
