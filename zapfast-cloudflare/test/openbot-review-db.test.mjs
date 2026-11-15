import test from 'node:test';
import assert from 'node:assert/strict';
import {LexisAgentDb} from '../src/lexis-agent-db.js';

const validItem={id:'1b78c4bf-aa8c-4401-b7f3-ab3e9e3e986b',empresa_id:'d37fd4bb-1c71-4dca-b97e-292355918d39',jid:'5511988881111@s.whatsapp.net',status:'draft',processo_id:42,source_type:'DataJud',source_at:'2026-11-15T12:00:00Z',reason:'status_oficial_conferido',draft:'Seu processo foi encaminhado ao juiz para análise; não houve decisão ainda.'};
const now=new Date('2026-11-15T13:00:00Z');
function setup(authorization=[{approved:true,processo_id:42}]){
 const db=new LexisAgentDb({LEXIS_SUPABASE_SERVICE_ROLE_KEY:'X'.repeat(40)});
 const calls=[];
 db.call=async(table,filter,options={})=>{
  calls.push({table,filter,options});
  if(table==='zapfast_agent_inbox'&&(!options.method||options.method==='GET'))return [validItem];
  if(table==='zapfast_agent_contacts')return authorization;
  if(table==='zapfast_openbot_reviews'&&options.method==='POST')return [{id:'review-1',decision:options.body.decision}];
  return [];
 };
 return {db,calls};
}
test('per-message manual approval is unique, tenant-filtered and never touches WhatsApp',async()=>{
 const {db,calls}=setup();
 const out=await db.reviewOpenBotDraft({inboxId:validItem.id,decision:'allow_once',reviewer:'Davi',note:'Dados conferidos',now});
 assert.equal(out.ok,true);
 assert.equal(out.decision,'approved_for_manual_use');
 const writes=calls.filter(x=>x.options.method==='POST');
 assert.equal(writes.length,1);
 assert.equal(writes[0].table,'zapfast_openbot_reviews');
 assert.equal(writes[0].options.body.triggers_whatsapp_send,false);
 assert.equal(writes[0].options.body.action_scope,'single_message');
 assert.equal(writes[0].filter.on_conflict,'empresa_id,inbox_id');
 assert.ok(calls.every(x=>x.filter?.empresa_id===undefined||x.filter.empresa_id==='eq.'+db.empresaId));
});
test('unknown contacts cannot approve an agent draft',async()=>{
 const {db,calls}=setup([]);
 const out=await db.reviewOpenBotDraft({inboxId:validItem.id,decision:'allow_once',reviewer:'Davi',note:'Conferi',now});
 assert.equal(out.ok,false);
 assert.equal(calls.some(x=>x.options.method==='POST'),false);
});
test('allowing all future replies is not supported',async()=>{
 const {db,calls}=setup();
 const out=await db.reviewOpenBotDraft({inboxId:validItem.id,decision:'always',reviewer:'Davi',note:'Conferi',now});
 assert.equal(out.ok,false);
 assert.equal(calls.some(x=>x.options.method==='POST'),false);
});
