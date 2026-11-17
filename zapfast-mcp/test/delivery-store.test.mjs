import test from 'node:test';
import assert from 'node:assert/strict';
import { DeliveryStore } from '../src/delivery-store.js';

class FakeStorage {
  constructor(){this.data=new Map();}
  async get(key){return this.data.get(key);}
  async put(key,value){this.data.set(key,structuredClone(value));}
  async delete(key){return this.data.delete(key);}
  async list({prefix='' }={}){return new Map([...this.data].filter(([k])=>k.startsWith(prefix)));}
  async transaction(callback){
    const snapshot=new Map([...this.data].map(([k,v])=>[k,structuredClone(v)]));
    const tx={
      get:async key=>snapshot.get(key),
      put:async (key,value)=>snapshot.set(key,structuredClone(value)),
      delete:async key=>snapshot.delete(key),
    };
    const result=await callback(tx);
    this.data=snapshot;
    return result;
  }
}
const base={id:'123e4567-e89b-12d3-a456-426614174000',jid:'5511999999999@s.whatsapp.net',text:'Resposta aprovada',now:1_800_000_000_000,ttlSeconds:600};

test('creates an expiring pending draft without creating a delivery',async()=>{
  const storage=new FakeStorage(),store=new DeliveryStore(storage);
  const draft=await store.createDraft(base);
  assert.equal(draft.status,'pending');
  assert.equal(draft.expires_at,base.now+600_000);
  assert.equal(await storage.get('delivery:'+base.id),undefined);
});

test('reserves a draft once only and requires exact preview text',async()=>{
  const storage=new FakeStorage(),store=new DeliveryStore(storage);
  await store.createDraft(base);
  await assert.rejects(()=>store.reserve({id:base.id,confirmText:'alterado',now:base.now+1}),/draft_not_pending_or_text_mismatch/);
  const reserved=await store.reserve({id:base.id,confirmText:base.text,now:base.now+1});
  assert.equal(reserved.status,'reserved');
  assert.equal((await storage.get('draft:'+base.id)).status,'reserved');
  await assert.rejects(()=>store.reserve({id:base.id,confirmText:base.text,now:base.now+2}),/draft_not_pending_or_text_mismatch/);
});

test('does not reserve an expired draft',async()=>{
  const storage=new FakeStorage(),store=new DeliveryStore(storage);
  await store.createDraft(base);
  await assert.rejects(()=>store.reserve({id:base.id,confirmText:base.text,now:base.now+600_001}),/draft_not_pending_or_text_mismatch/);
});

test('sent and uncertain outcomes permanently block a second send',async()=>{
  for(const outcome of ['sent','uncertain']){
    const storage=new FakeStorage(),store=new DeliveryStore(storage);
    await store.createDraft(base);
    await store.reserve({id:base.id,confirmText:base.text,now:base.now+1});
    await store.finish({id:base.id,status:outcome,now:base.now+2});
    await assert.rejects(()=>store.reserve({id:base.id,confirmText:base.text,now:base.now+3}),/draft_not_pending_or_text_mismatch/);
    assert.equal((await store.getDelivery(base.id)).status,outcome);
  }
});
