// Original Cloudflare-friendly adaptation of OpenBot's coworker and approval concepts.
// Not the OpenBot server or CopilotKit Intelligence; no external model calls.
// https://github.com/CopilotKit/OpenBot (MIT) inspired architectural design.
export const OPENBOT_ROLES = Object.freeze([
 {id:'identity',title:'Identidade',responsibility:'Verifica vínculo autorizado entre contato, empresa e processo.'},
 {id:'research',title:'Fontes oficiais',responsibility:'Compara DataJud, DJEN e evidências judiciais verificadas.'},
 {id:'context',title:'Memória processual',responsibility:'Lê observações, atividades e atendimentos sem divulgar dados internos.'},
 {id:'writer',title:'Redação simples',responsibility:'Propõe resposta clara ao cliente, sem prometer decisão, prazo ou valores.'},
 {id:'review',title:'Conformidade',responsibility:'Bloqueia casos ambíguos, sensíveis ou sem identidade confirmada.'},
 {id:'audit',title:'Auditoria',responsibility:'Registra decisões humanas e distingue aprovação, envio e entrega.'}
].map(r=>Object.freeze({...r,canSendWhatsApp:false,canDiscloseCaseData:false,execution:'review_only'})));

const direct=/^\d+@(s\.whatsapp\.net|lid)$/;
export function assessDraftDecision({item,authorizations=[],decision,reviewer,note,now=new Date()}={}){
 const deny=reason=>({allowed:false,reason,triggersTransport:false});
 const person=typeof reviewer==='string'?reviewer.trim():'';
 const comment=typeof note==='string'?note.trim():'';
 if(!item||!direct.test(item.jid||'')||!person||person.length>100||!comment||comment.length>600)
   return deny('review_details_required');
 if(decision==='deny'){
   if(!['draft','human_review','needs_authorization'].includes(item.status))return deny('not_pending');
   return {allowed:true,status:'rejected',reason:'human_denial',triggersTransport:false};
 }
 if(decision!=='allow_once')return deny('unsupported_approval_scope');
 // Never allow standing, cross-conversation or blanket authorizations.
 if(item.status!=='draft'||item.reason!=='status_oficial_conferido')return deny('not_safe_draft');
 if(!Number.isSafeInteger(Number(item.processo_id))||Number(item.processo_id)<1)return deny('missing_process');
 if(!Array.isArray(authorizations)||authorizations.length!==1||
  authorizations[0]?.approved!==true||Number(authorizations[0]?.processo_id)!==Number(item.processo_id))
    return deny('contact_not_uniquely_authorized');
 if(item.source_type!=='DataJud'||typeof item.draft!=='string'||item.draft.length<20||item.draft.length>1600)
    return deny('unverified_source_or_draft');
 const at=Date.parse(item.source_at||'');
 if(!Number.isFinite(at)||at>now.getTime()+300000||now.getTime()-at>7*86400000)
    return deny('stale_source');
 return {allowed:true,status:'approved_for_manual_use',reason:'human_approved_once',triggersTransport:false};
}
