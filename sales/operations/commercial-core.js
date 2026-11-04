/**
 * W1 Sales — manual commercial offer and revenue math.
 * No network calls, accounts, payment collection, analytics or persistence.
 * Numbers shown are calculated only from user inputs, never fabricated cases.
 */
const asText=(v,max=500)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const rawNumber=(v)=>{
  if(typeof v==="number")return v;
  if(typeof v!=="string"||!v.trim())return NaN;
  const value=v.trim().replace(/\s/g,"");
  // Brazilian currency: 1.234,56 or 1234,56; numeric strings like 1234.56 also work.
  const cleaned=value.includes(",")?value.replace(/\./g,"").replace(",","."):value;
  return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)?Number(cleaned):NaN;
};
export function parseMoney(value){
  const n=rawNumber(value);
  if(!Number.isFinite(n)||n<0||n>100_000_000)throw Error("Informe um valor válido entre zero e cem milhões.");
  return Math.round(n*100)/100;
}
export function brl(value){
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
}
export const PRODUCT_AREAS=Object.freeze([
  {id:"lexispredict",label:"LexisPredict — organização jurídica"},
  {id:"crm",label:"CRM e atendimento comercial"},
  {id:"integracoes",label:"Integrações e automação"},
  {id:"indicadores",label:"Indicadores e dashboards"},
]);
export function quoteDraft(input){
  const required={company:asText(input?.company,140),solution:asText(input?.solution,160),problem:asText(input?.problem,700),scope:asText(input?.scope,1500),deliverables:asText(input?.deliverables,1200),timeline:asText(input?.timeline,160)};
  for(const [name,val] of Object.entries(required)){
    if(val.length<2)throw Error("Preencha os campos de contexto, solução, escopo, entregas e prazo. Falta: "+name+".");
  }
  const implementation=parseMoney(input?.implementation);
  const recurring=parseMoney(input?.recurring);
  const recurringPeriod=asText(input?.recurringPeriod,32)||"mensal";
  if(!["mensal","trimestral","anual"].includes(recurringPeriod))throw Error("Periodicidade não reconhecida.");
  if(!input?.reviewed)throw Error("Confirme que valores, escopo e disponibilidade foram conferidos por uma pessoa responsável.");
  const date=asText(input?.date,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error("Informe uma data no formato AAAA-MM-DD.");
  const exclusions=asText(input?.exclusions,900)||"A definir por escrito antes da contratação.";
  const nextStep=asText(input?.nextStep,400)||"Confirmar escopo e condições diretamente com a equipe W1.";
  const lines=[
    "# W1 Capital — proposta comercial para análise",
    "",
    "**Data:** "+date,
    "**Organização interessada:** "+required.company,
    "**Solução:** "+required.solution,
    "",
    "## Necessidade identificada",required.problem,"",
    "## Escopo proposto",required.scope,"",
    "## Entregas previstas",required.deliverables,"",
    "## Prazo estimado, sujeito a confirmação",required.timeline,"",
    "## Condições financeiras informadas manualmente",
    "- Implantação/projeto: "+brl(implementation),
    "- Recorrência: "+brl(recurring)+" / "+recurringPeriod,
    "- Tributos, condições de pagamento e validade: confirmar formalmente com a W1.",
    "",
    "## Limites e itens fora de escopo",exclusions,"",
    "## Próxima ação",nextStep,"",
    "---",
    "Documento de trabalho preparado com valores informados pelo operador. A contratação, o preço final, o prazo e a disponibilidade exigem confirmação formal das partes. Não representa contrato assinado nem fatura."
  ];
  return lines.join("\n");
}
export function funnelMetrics(input){
  const fields=["researched","qualified","optIn","meetings","proposals","won"];
  const data={};
  for(const field of fields){
    const v=Number(input?.[field]);
    if(!Number.isSafeInteger(v)||v<0||v>100_000_000)throw Error("Quantidade inválida: "+field);
    data[field]=v;
  }
  if(data.qualified>data.researched||data.optIn>data.qualified||data.meetings>data.optIn||data.proposals>data.meetings||data.won>data.proposals){
    throw Error("As etapas não podem superar a etapa anterior no mesmo conjunto de oportunidades.");
  }
  const received=parseMoney(input?.received);
  const costs=parseMoney(input?.costs);
  const conversion=(top,base)=>base===0?null:Number((top/base*100).toFixed(1));
  return {
    ...data,received,costs,net:Math.round((received-costs)*100)/100,
    qualifiedRate:conversion(data.qualified,data.researched),
    meetingRate:conversion(data.meetings,data.optIn),
    proposalWinRate:conversion(data.won,data.proposals),
  };
}
export function funnelExport(metrics){
  const label=(v)=>v===null?"sem base":v.toFixed(1)+"%";
  return [
    "W1 CAPITAL — FUNIL COMERCIAL / DADOS INFORMADOS PELO OPERADOR",
    "Empresas pesquisadas: "+metrics.researched,
    "Empresas qualificadas: "+metrics.qualified,
    "Leads opt-in: "+metrics.optIn,
    "Reuniões realizadas: "+metrics.meetings,
    "Propostas enviadas: "+metrics.proposals,
    "Contratos ganhos: "+metrics.won,
    "Taxa de qualificação: "+label(metrics.qualifiedRate),
    "Reuniões por opt-in: "+label(metrics.meetingRate),
    "Ganhos por proposta: "+label(metrics.proposalWinRate),
    "Recebido: "+brl(metrics.received),
    "Custos informados: "+brl(metrics.costs),
    "Saldo operacional informado (não é lucro contábil): "+brl(metrics.net),
    "",
    "Esses valores NÃO foram verificados no CRM ou banco. Somente dados digitados; não representam resultados da W1 até conferência documental."
  ].join("\n");
}
