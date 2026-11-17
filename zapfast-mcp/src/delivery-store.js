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
    return finished;
  }

  async getDelivery(id) {
    return (await this.storage.get(deliveryKey(id))) ?? null;
  }
}
