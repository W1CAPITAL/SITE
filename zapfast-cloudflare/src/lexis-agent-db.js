const PROJECT_URL='https://segjskjlbeydlljnefai.supabase.co';
export const MAIN_COMPANY='d37fd4bb-1c71-4dca-b97e-292355918d39';

function ensureKey(env){
  const key=env.LEXIS_SUPABASE_SERVICE_ROLE_KEY;
  if(typeof key!=='string'||key.length<30)throw Error('lexis_credentials_missing');
  return key;
}
const cleanId=x=>typeof x==='string'&&/^[0-9a-f-]{36}$/.test(x)?x:null;
const keyCompany=env=>cleanId(env.LEXIS_EMPRESA_ID)||MAIN_COMPANY;

export class LexisAgentDb {
  constructor(env) {
    this.env=env;
    this.empresaId=keyCompany(env);
    this.key=ensureKey(env);
  }
  async call(table,filters={},opts={}){
    if(!/^([a-z_]+)$/.test(table))throw Error('invalid_resource');
    const url=new URL('/rest/v1/'+table,PROJECT_URL);
    for(const [key,value] of Object.entries(filters))url.searchParams.set(key,String(value));
    const headers={'apikey':this.key,'authorization':'Bearer '+this.key,'content-type':'application/json'};
    if(opts.prefer)headers.prefer=opts.prefer;
    const r=await fetch(url,{method:opts.method||'GET',headers,body:opts.body===undefined?undefined:JSON.stringify(opts.body),signal:AbortSignal.timeout(11000)});
    if(!r.ok)throw Error('lexis_'+r.status+'_'+table);
    if(r.status===204)return [];
    return r.json().catch(()=>[]);
  }
  async createInbox(jid,messageId,text,receivedAt,kind,reason){
    const rows=await this.call('zapfast_agent_inbox',{on_conflict:'empresa_id,jid,provider_message_id'},{
      method:'POST',prefer:'resolution=ignore-duplicates,return=representation',
      body:{empresa_id:this.empresaId,jid,provider_message_id:messageId,message_excerpt:text.slice(0,600),
        received_at:new Date(receivedAt).toISOString(),category:kind,status:'pending',reason}
    });
    return rows?.[0]||null;
  }
  async patchInbox(id,fields){
    const rows=await this.call('zapfast_agent_inbox',{id:'eq.'+id,empresa_id:'eq.'+this.empresaId},{method:'PATCH',prefer:'return=representation',body:fields});
    return rows?.[0]??null;
  }
  async authorizations(jid){
    return await this.call('zapfast_agent_contacts',{select:'id,empresa_id,jid,processo_id,approved',empresa_id:'eq.'+this.empresaId,jid:'eq.'+jid,approved:'eq.true',limit:'2'});
  }
  async getCase(caseId){
    const rows=await this.call('processos',{
      select:'id,empresa_id,cliente,protocolo_ref,status,datajud_last_ok,datajud_consultado_em,datajud_ultimo_movimento,datajud_ultimo_nome,djen_last_ok,djen_consultado_em,djen_ultima_data,djen_ultimo_resumo',
      id:'eq.'+caseId,empresa_id:'eq.'+this.empresaId,limit:'1'
    });
    return rows?.[0]||null;
  }
  async listQueue(){
    return await this.call('zapfast_agent_inbox',{select:'id,jid,message_excerpt,category,status,reason,received_at,processo_id,source_type,source_at,draft,sent_at',empresa_id:'eq.'+this.empresaId,order:'received_at.desc',limit:'60'});
  }
  async searchCases(term){
    const clean=String(term||'').replace(/[^\p{L}\p{N}\s.-]/gu,'').trim().slice(0,60);
    if(clean.length<3)return [];
    return await this.call('processos',{select:'id,cliente,protocolo_ref,status',
      empresa_id:'eq.'+this.empresaId,cliente:'ilike.*'+clean.replace(/\s+/g,'*')+'*',limit:'12'});
  }
  async approveContact(jid,caseId,evidence){
    if(!/^\d+@(s\.whatsapp\.net|lid)$/.test(jid)||!/^[1-9]\d{0,14}$/.test(String(caseId))||typeof evidence!=='string'||evidence.trim().length<10)throw Error('invalid_authorization_details');
    const p=await this.getCase(caseId);
    if(!p)throw Error('processo_not_in_company');
    return await this.call('zapfast_agent_contacts',{on_conflict:'empresa_id,jid,processo_id'},{
      method:'POST',prefer:'resolution=merge-duplicates,return=representation',
      body:{empresa_id:this.empresaId,jid,processo_id:p.id,approved:true,
        authorized_by:'Operador autenticado do ZapFast',
        authorized_at:new Date().toISOString(),authorization_evidence:evidence.trim().slice(0,300)}
    });
  }
  async getSafety(){
    const rows=await this.call('wa_outbound_safety_limits',{select:'paused,min_gap_minutes,daily_limit,business_start_hour,business_end_hour,weekdays_only,cooldown_until',empresa_id:'eq.'+this.empresaId,limit:'1'});
    return rows?.[0]||null;
  }
  async deliveryHistory(){
    return await this.call('zapfast_agent_deliveries',{select:'jid,status,reserved_at,sent_at',
      empresa_id:'eq.'+this.empresaId,status:'in.(reserved,sent,uncertain)',order:'reserved_at.desc',limit:'50'});
  }
  async reserveDelivery(jid,inboxId){
    const res=await this.call('zapfast_agent_deliveries',{on_conflict:'inbox_id'},{
      method:'POST',prefer:'resolution=ignore-duplicates,return=representation',
      body:{empresa_id:this.empresaId,jid,inbox_id:inboxId,status:'reserved'}
    });
    return res?.[0]||null;
  }
  async finishDelivery(id,status,providerMessageId){
    return this.call('zapfast_agent_deliveries',{id:'eq.'+id,empresa_id:'eq.'+this.empresaId},{
      method:'PATCH',prefer:'return=minimal',body:{status,sent_at:status==='sent'?new Date().toISOString():null,provider_message_id:providerMessageId||null}
    });
  }
  async auditSuccessfulReply(record,caseInfo,transportId){
    return this.call('auditoria_logs_app',{},{
      method:'POST',prefer:'return=minimal',
      body:{empresa_id:this.empresaId,user_nome:'Davi Alves Figueredo',
        action:'zapfast_agent_reply_confirmed_by_transport',
        protocolo_ref:caseInfo.protocolo_ref||'',
        detalhes:{source:'ZapFast Cloudflare',processo_id:caseInfo.id,inbox_id:record.id,
          provider_message_id:transportId,scope:'atendimento processual privado',proof:'sendMessage succeeded',note:'Nao confirma entrega ou leitura'}}
    });
  }
}
export const lexisAgentConfigured=env=>typeof env.LEXIS_SUPABASE_SERVICE_ROLE_KEY==='string'&&env.LEXIS_SUPABASE_SERVICE_ROLE_KEY.length>=30;
