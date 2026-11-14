import { assessInbound, buildProcessReply, canAutoSend } from './legal-agent-policy.js';
import { textMessage, timestamp } from './format.js';

const whenLocal=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);

export async function evaluateInboundLegalMessage({message,db,socket,now=new Date(),autoSend=false,contactRecentlyAnswered=false}){
  const key=message?.key??{};
  const jid=key.remoteJid, body=textMessage(message);
  const gate=assessInbound({jid,id:key.id,text:body,fromMe:key.fromMe});
  if(gate.kind==='ignore')return {status:'ignored',reason:gate.reason};
  const inbox=await db.createInbox(jid,key.id,body,timestamp(message?.messageTimestamp)*1000,gate.kind,gate.reason);
  if(!inbox)return {status:'duplicate'};
  const set=async(status,reason,extra={})=>{
    await db.patchInbox(inbox.id,{status,reason,...extra,updated_at:new Date().toISOString()});
    return {status,reason};
  };
  const authorized=await db.authorizations(jid);
  if(authorized.length!==1||authorized[0].approved!==true)return set('needs_authorization','contato_sem_autorizacao_unica');
  const caseRow=await db.getCase(authorized[0].processo_id);
  if(!caseRow||Number(caseRow.id)!==Number(authorized[0].processo_id))return set('human_review','processo_nao_corresponde_ao_cadastro');
  if(gate.kind==='human')return set('human_review','assunto_sensivel_ou_administrativo',{processo_id:caseRow.id});
  const reply=buildProcessReply(caseRow,now);
  if(!reply.ok)return set('human_review',reply.reason,{processo_id:caseRow.id});
  await db.patchInbox(inbox.id,{status:'draft',reason:'status_oficial_conferido',processo_id:caseRow.id,
    source_type:reply.source,source_at:caseRow.datajud_consultado_em,draft:reply.text,updated_at:now.toISOString()});
  if(!autoSend)return {status:'draft',reason:'aguarda_ativacao_e_revisao'};
  if(contactRecentlyAnswered)return {status:'draft',reason:'funcionario_ja_respondeu_recentemente'};
  if(!socket)return {status:'draft',reason:'whatsapp_desconectado'};
  const limits=await db.getSafety();
  const history=await db.deliveryHistory();
  const today=whenLocal(now);
  const todayRows=history.filter(x=>whenLocal(new Date(x.reserved_at))===today);
  const forContact=todayRows.filter(x=>x.jid===jid);
  const last=history[0]?.reserved_at;
  const allowed=canAutoSend({now,limits,allToday:todayRows.length,contactToday:forContact.length,lastSentAt:last});
  if(!allowed.ok)return {status:'draft',reason:allowed.reason};
  // Reservation is unique per inbound message. Never retry an ambiguous send:
  // WhatsApp may have accepted a message even if the transport later fails.
  const reserved=await db.reserveDelivery(jid,inbox.id);
  if(!reserved)return {status:'draft',reason:'duplicate_delivery_reservation'};
  let sent;
  try{
    sent=await socket.sendMessage(jid,{text:reply.text});
  }catch(error){
    await db.finishDelivery(reserved.id,'uncertain').catch(()=>{});
    await db.patchInbox(inbox.id,{status:'human_review',reason:'envio_incerto_nao_repetir',updated_at:new Date().toISOString()}).catch(()=>{});
    return {status:'human_review',reason:'envio_incerto_nao_repetir'};
  }
  const providerId=sent?.key?.id||null;
  await db.finishDelivery(reserved.id,'sent',providerId);
  await db.patchInbox(inbox.id,{status:'sent',reason:'transport_accepted_not_delivered',sent_at:new Date().toISOString(),sent_message_id:providerId});
  try{await db.auditSuccessfulReply(inbox,caseRow,providerId)}
  catch{return {status:'sent',reason:'auditoria_precisa_conferencia'};}
  return {status:'sent',reason:'enviado_e_registrado'};
}
