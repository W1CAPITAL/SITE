const draftKey = id => `draft:${id}`;
const deliveryKey = id => `delivery:${id}`;

export class DeliveryStore {
  constructor(storage) {
    this.storage = storage;
  }

  async createDraft({ id, jid, text, now = Date.now(), ttlSeconds = 600 }) {
    const draft = {
      id,
      jid,
      text,
      status: 'pending',
      created_at: now,
      expires_at: now + Math.max(60, Math.min(600, ttlSeconds)) * 1000,
    };
    await this.storage.transaction(async tx => {
      if (await tx.get(draftKey(id)) || await tx.get(deliveryKey(id))) throw new Error('draft_id_already_exists');
      await tx.put(draftKey(id), draft);
    });
    await this.scheduleNextAlarm();
    return draft;
  }

  async reserve({ id, confirmText, now = Date.now() }) {
    let reserved;
    await this.storage.transaction(async tx => {
      const draft = await tx.get(draftKey(id));
      const delivery = await tx.get(deliveryKey(id));
      if (!draft || delivery || draft.status !== 'pending' || draft.expires_at <= now || draft.text !== confirmText) {
        throw new Error('draft_not_pending_or_text_mismatch');
      }
      reserved = { ...draft, status: 'reserved' };
      await tx.put(draftKey(id), reserved);
      await tx.put(deliveryKey(id), { draft_id: id, status: 'reserved', reserved_at: now, completed_at: null });
    });
    return reserved;
  }

  async finish({ id, status, now = Date.now() }) {
    if (!['sent', 'uncertain'].includes(status)) throw new Error('delivery_status_invalid');
    let finished = false;
    await this.storage.transaction(async tx => {
      const delivery = await tx.get(deliveryKey(id));
      if (!delivery || delivery.status !== 'reserved') return;
      await tx.put(deliveryKey(id), { ...delivery, status, completed_at: now });
      await tx.delete(draftKey(id));
      finished = true;
    });
    await this.scheduleNextAlarm();
    return finished;
  }

  async cleanupExpired(now = Date.now()) {
    const drafts = await this.storage.list({ prefix: 'draft:' });
    for (const [key, draft] of drafts) {
      if (!draft || draft.expires_at > now) continue;
      const id = key.slice('draft:'.length);
      await this.storage.transaction(async tx => {
        const current = await tx.get(key);
        if (!current || current.expires_at > now) return;
        if (current.status === 'reserved') {
          const delivery = await tx.get(deliveryKey(id));
          if (delivery?.status === 'reserved') {
            await tx.put(deliveryKey(id), { ...delivery, status: 'uncertain', completed_at: now });
          }
        }
        await tx.delete(key);
      });
    }
    await this.scheduleNextAlarm();
  }

  async scheduleNextAlarm() {
    const drafts = await this.storage.list({ prefix: 'draft:' });
    let next = Infinity;
    for (const draft of drafts.values()) {
      if (Number.isFinite(draft?.expires_at)) next = Math.min(next, draft.expires_at);
    }
    if (Number.isFinite(next) && typeof this.storage.setAlarm === 'function') {
      await this.storage.setAlarm(next);
    } else if (typeof this.storage.deleteAlarm === 'function') {
      await this.storage.deleteAlarm();
    }
  }

  async getDelivery(id) {
    return (await this.storage.get(deliveryKey(id))) ?? null;
  }
}
