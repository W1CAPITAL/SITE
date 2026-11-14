// Verified in-db links only. These are INTERNAL notes, not court evidence.
// Never paste this object into an outbound WhatsApp message or untrusted AI.
const clip=(v,max=1000)=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
const array=(v,limit)=>Array.isArray(v)?v.slice(0,limit):[];
const cnj=(v)=>String(v??'').replace(/\D/g,'');
const isCompany=(v,e)=>v?.empresa_id===e;
const internal=(source,text,at)=>({source,classification:'internal_unverified',text:clip(text,1200),recordedAt:at||null});

export function compileCaseEvidence(p,{
  audits=[],hermes=[],snapshots=[],activities=[],businessIds=[],businesses=[],
  agentFacts=[],agentTasks=[],missingSources=[]
}={}){
 if(!p?.empresa_id||!Number.isSafeInteger(Number(p.id)))throw Error('invalid_case_for_evidence');
 const company=p.empresa_id,proc=Number(p.id),reference=String(p.protocolo_ref||'').trim();
 const normalized=cnj(reference),validCnj=normalized.length===20;
 const notes=[];
 for(const [source,text] of [
   ['processos.observacoes',p.observacoes],
   ['processos.dados.observacao',p.dados?.observacao],
   ['processos.dados.evento_resumo',p.dados?.evento_resumo]
 ]){if(typeof text==='string'&&text.trim())notes.push(internal(source,text,p.updated_at))}
 const audit=array(audits,80).filter(x=>isCompany(x,company)&&reference&&x.protocolo_ref===reference)
   .slice(0,30).map(x=>({source:'auditoria_logs_app',classification:'internal_unverified',
     action:clip(x.action,90),summary:clip(JSON.stringify(x.detalhes||{}),650),
     recordedAt:x.created_at||null}));
 const relatedHermes=array(hermes,30).filter(x=>isCompany(x,company)&&Number(x.processo_id)===proc)
   .slice(0,12).map(x=>({source:'hermes_return_reviews',classification:'internal_unverified',
     checkedAt:x.checked_at||null,djenOk:x.djen_ok===true,datajudOk:x.datajud_ok===true,
     highlights:clip(JSON.stringify(x.highlights||{}),650)}));
 const officialChecks=validCnj?array(snapshots,30)
   .filter(x=>isCompany(x,company)&&cnj(x.process_number)===normalized)
   .slice(0,12).map(x=>({source:clip(x.source,32),classification:'source_snapshot_needs_validation',
     checkedAt:x.checked_at||null,found:x.found===true})):[];
 const businessSet=new Set(array(businessIds,20).map(String));
 const commercial=array(businesses,20)
   .filter(x=>isCompany(x,company)&&validCnj&&cnj(x.protocolo_cnj)===normalized)
   .slice(0,8).map(x=>internal('crm_negocios.observacao',x.observacao,x.updated_at))
   .filter(x=>x.text);
 const activity=array(activities,80)
   .filter(x=>isCompany(x,company)&&businessSet.has(String(x.negocio_id)))
   .slice(0,30).map(x=>({
     source:'crm_atividades',classification:'internal_unverified',
     title:clip(x.titulo,100),text:clip(x.corpo,850),recordedAt:x.created_at||null
   }));
 const facts=array(agentFacts,30)
   .filter(x=>isCompany(x,company)&&['processo','case'].includes(String(x.subject_type))&&String(x.subject_id)===String(proc))
   .slice(0,10).map(x=>({source:'crm_agent_facts',classification:'internal_unverified',
     field:clip(x.field,80),text:clip(JSON.stringify(x.value??null),450),evidenceKind:clip(x.evidence_kind,60),
     recordedAt:x.created_at||null}));
 const tasks=array(agentTasks,30)
   .filter(x=>isCompany(x,company)&&['processo','case'].includes(String(x.subject_type))&&String(x.subject_id)===String(proc))
   .slice(0,10).map(x=>({source:'crm_agent_tasks',classification:'internal_unverified',
     status:clip(x.status,60),dueAt:x.due_at||null,
     details:clip(JSON.stringify(x.payload??{}),500)}));
 return {
   processo_id:proc,empresa_id:company,protocolo_ref:reference,
   notes,audit,hermes:relatedHermes,officialChecks,activities:activity,commercial,facts,tasks,
   incompleteSources:array(missingSources,12).map(x=>clip(x,60)),
   counts:{notes:notes.length,audit:audit.length,hermes:relatedHermes.length,officialChecks:officialChecks.length,
     activities:activity.length,commercial:commercial.length,facts:facts.length,tasks:tasks.length},
   autoDiscloseInternalEvidence:false,
   caution:'Contexto interno pode conter relatos, pedidos e hipóteses. Não equivale a movimentação oficial ou decisão. Não compartilhar diretamente com cliente.'
 };
}
