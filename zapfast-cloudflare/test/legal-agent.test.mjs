import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateInboundLegalMessage } from '../src/legal-agent.js';
const message=(text,jid='166950328082501@lid')=>({key:{remoteJid:jid,id:'MSG123',fromMe:false},message:{conversation:text},messageTimestamp:1794660000});
const caseInfo={id:42,empresa_id:'company',protocolo_ref:'0000000-00.2026.8.00.0000',datajud_last_ok:true,datajud_consultado_em:'2026-11-14T13:00:00Z',datajud_ultimo_movimento:'2026-11-13T10:00:00Z',datajud_ultimo_nome:'Conclusos para decisão'};
function fake({auth=[],caseRow=caseInfo,limit={paused:false,daily_limit:10,min_gap_minutes:20,business_start_hour:9,business_end_hour:17,weekdays_only:true}}={}){
  const updates=[],calls=[];const db={
    createInbox:async(...args)=>{calls.push('inbox');return {id:'row-1',jid:args[0]}},
    patchInbox:async(id,obj)=>{updates.push(obj);return {id,...obj}},
    authorizations:async()=>auth,
    getCase:async()=>caseRow,
    getSafety:async()=>limit,
    deliveryHistory:async()=>[],
    reserveDelivery:async()=>({id:'delivery-1'}),
    finishDelivery:async()=>{},
    auditSuccessfulReply:async()=>{},
  };
  return {db,updates,calls};
}
test('no response without explicit verified contact authorization',async()=>{
  const x=fake();let sends=0;
  const r=await evaluateInboundLegalMessage({message:message('Qual o andamento do meu processo?'),db:x.db,socket:{sendMessage:async()=>{sends++}},now:new Date('2026-11-16T14:10:00Z'),autoSend:true});
  assert.equal(r.status,'needs_authorization');assert.equal(sends,0);
});
test('an authorized contact receives a draft, never automatic sending in review mode',async()=>{
  const x=fake({auth:[{processo_id:42,approved:true}]});let sends=0;
  const r=await evaluateInboundLegalMessage({message:message('Qual o andamento do processo?'),db:x.db,socket:{sendMessage:async()=>{sends++}},now:new Date('2026-11-14T15:00:00Z'),autoSend:false});
  assert.equal(r.status,'draft');assert.equal(sends,0);
  assert.match(x.updates.at(-1).draft,/encaminhado ao juiz/);
});
test('does not auto reply to unrelated or sensitive messages',async()=>{
  const x=fake({auth:[{processo_id:42,approved:true}]});
  assert.equal((await evaluateInboundLegalMessage({message:message('bom dia'),db:x.db})).status,'ignored');
  assert.equal((await evaluateInboundLegalMessage({message:message('Quero cobrar honorários do processo'),db:x.db})).status,'human_review');
});
