const directJid=/^[0-9]+@(s[.]whatsapp[.]net|lid)$/;
const legalWords=/\b(processo|processual|andamento|movimenta[cç][aã]o|juiz|judicial|justi[cç]a|audi[eê]ncia|senten[cç]a|recurso|intima[cç][aã]o|publica[cç][aã]o|meu caso|minha a[cç][aã]o)\b/i;
const sensitiveWords=/\b(honor[aá]rios|contrato|boleto|cobran[cç]a|pagamento|saque|alvar[aá]|bloqueio|aposentadoria|conta banc[aá]ria|chave pix|dados pessoais|cpf|senha|demiss[aã]o|acordo|recurso|prazo|audi[eê]ncia|senten[cç]a|desistir)\b/i;

export function assessInbound({jid,id,text,fromMe}){
  if(fromMe||!directJid.test(jid||'')||typeof id!=='string'||!id||id.length>180)return {kind:'ignore',reason:'outside_private_inbound'};
  if(typeof text!=='string'||!text.trim()||text.length>4096||text==='Mensagem de mídia ou outro conteúdo')return {kind:'ignore',reason:'not_plain_text'};
  const normalized=text.trim().slice(0,4096).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(sensitiveWords.test(normalized))return {kind:'human',reason:'sensitive_or_administrative'};
  if(!legalWords.test(normalized))return {kind:'ignore',reason:'not_about_process'};
  return {kind:'process',reason:'legal_status_question'};
}
const dateMs=value=>{
  if(!value||typeof value!=='string')return NaN;
  return Date.parse(value);
};
function safeMovement(name){
  if(typeof name!=='string')return null;
  const x=name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/^conclusos? para (decisao|despacho|julgamento)/.test(x))return 'Seu processo foi encaminhado ao juiz para análise. Isso não significa que ele já decidiu.';
  if(/^juntada (de |do |da )?(peticao|documento|manifestacao)/.test(x))return 'Foi acrescentado um documento ao processo. Isso não significa que houve uma decisão.';
  if(/^expedicao de (intimacao|citacao)/.test(x))return 'O tribunal registrou o envio de uma comunicação sobre o processo. Isso não significa que já houve decisão.';
  return null;
}
export function buildProcessReply(row, now=new Date()){
  if(!row||row.datajud_last_ok!==true)return {ok:false,reason:'datajud_not_confirmed'};
  const checked=dateMs(row.datajud_consultado_em),when=dateMs(row.datajud_ultimo_movimento);
  if(!Number.isFinite(checked)||checked>now.getTime()+300000||now.getTime()-checked>7*86400000)return {ok:false,reason:'stale_official_check'};
  if(!Number.isFinite(when)||when>now.getTime()+86400000)return {ok:false,reason:'invalid_movement_date'};
  const summary=safeMovement(row.datajud_ultimo_nome);
  if(!summary)return {ok:false,reason:'movement_requires_human_review'};
  const date=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(when));
  return {ok:true,source:'DataJud',sourceDate:date,text:'A última movimentação confirmada no seu processo, registrada em '+date+', foi esta: '+summary+' Se houver alguma nova decisão, ela precisa ser confirmada na consulta oficial antes de ser informada.'};
}
export function canAutoSend({now=new Date(),limits,allToday=0,contactToday=0,lastSentAt}={}){
  if(!limits)return {ok:false,reason:'no_existing_lexis_safety_policy'};
  if(limits.paused)return {ok:false,reason:'sends_paused_by_lexis'};
  const start=Math.max(9,Number(limits.business_start_hour)||9),end=Math.min(17,Number(limits.business_end_hour)||17);
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const weekday=parts.find(x=>x.type==='weekday')?.value;
  const hour=Number(parts.find(x=>x.type==='hour')?.value);
  if(!['Mon','Tue','Wed','Thu','Fri'].includes(weekday))return {ok:false,reason:'outside_business_days'};
  if(hour<start||hour>=end)return {ok:false,reason:'outside_business_hours'};
  if(Number(allToday)>=Math.min(10,Math.max(0,Number(limits.daily_limit)||0)))return {ok:false,reason:'lexis_daily_cap'};
  if(Number(contactToday)>=1)return {ok:false,reason:'one_auto_reply_per_contact_per_day'};
  const gap=Math.max(20,Number(limits.min_gap_minutes)||0);
  if(lastSentAt&&Number.isFinite(Date.parse(lastSentAt))&&now.getTime()-Date.parse(lastSentAt)<gap*60000)return {ok:false,reason:'lexis_min_gap'};
  if(limits.cooldown_until&&Date.parse(limits.cooldown_until)>now.getTime())return {ok:false,reason:'lexis_cooldown'};
  return {ok:true};
}
