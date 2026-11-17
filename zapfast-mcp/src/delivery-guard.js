import { DurableObject } from 'cloudflare:workers';
import { DeliveryStore } from './delivery-store.js';

export class McpDeliveryGuard extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.store = new DeliveryStore(ctx.storage);
  }

  async fetch(request) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/draft' && request.method === 'POST') {
        const body = await request.json();
        const draft = await this.store.createDraft(body);
        return Response.json(draft, { status: 201 });
      }
      if (url.pathname === '/reserve' && request.method === 'POST') {
        const body = await request.json();
        const draft = await this.store.reserve({ id: body?.draft_id, confirmText: body?.confirm_text, now: Date.now() });
        return Response.json(draft);
      }
      if (url.pathname === '/finish' && request.method === 'POST') {
        const body = await request.json();
        const ok = await this.store.finish({ id: body?.draft_id, status: body?.status, now: Date.now() });
        return Response.json({ ok });
      }
      if (url.pathname === '/delivery' && request.method === 'GET') {
        const id = url.searchParams.get('draft_id') || '';
        return Response.json({ delivery: await this.store.getDelivery(id) });
      }
      return Response.json({ error: 'not_found' }, { status: 404 });
    } catch (error) {
      const conflict = /draft_not_pending|draft_id_already_exists/.test(error?.message || '');
      return Response.json({ error: error?.message || 'guard_unavailable' }, { status: conflict ? 409 : 400 });
    }
  }
}
