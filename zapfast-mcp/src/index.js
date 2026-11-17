import { McpDeliveryGuard } from './delivery-guard.js';
import { handleMcpRequest } from './mcp-handler.js';

export { McpDeliveryGuard };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return Response.json({ ok: true, server: 'zapfast-mcp', auth_required: true, mcp_path: '/mcp' }, {
        headers: { 'cache-control': 'no-store' },
      });
    }
    if (url.pathname !== '/mcp') return new Response('Not found', { status: 404 });
    return handleMcpRequest(request, env);
  },
};
