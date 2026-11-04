/**
 * W1 Sales — research-only Fichário adapter.
 *
 * The provider is a third-party, not the official Receita Federal API.
 * This module NEVER fetches, scrapes, stores, imports, sends messages or
 * extracts contact information. Public data requires human review.
 *
 * Provider docs: https://cnpj.genesisinnovation.io/api
 * Terms: https://cnpj.genesisinnovation.io/termos
 */
export const FICHARIO = Object.freeze({
  id: "fichario_genesis_innovation",
  name: "Fichário · Genesis Innovation",
  origin: "https://cnpj.genesisinnovation.io",
  docs: "https://cnpj.genesisinnovation.io/api",
  terms: "https://cnpj.genesisinnovation.io/termos",
  sourceCredit: "Fonte: Fichário (cnpj.genesisinnovation.io), dados abertos da Receita Federal",
  // Informational only; recheck at implementation time because limits can change.
  documentedFreePerMinute: 60,
  documentedFreePerDay: 3000,
});

const STATES = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
]);
const SIZES = new Set(["ME","EPP","Demais"]);

const digitsOnly = (value) => String(value ?? "").replace(/\D/g,"");
function digit(values,weights){
  const remainder=values.reduce((sum,n,i)=>sum+n*weights[i],0)%11;
  return remainder<2?0:11-remainder;
}

/** Validate full Brazilian CNPJ check digits; not merely its character count. */
export function normalizeCnpj(input){
  const value=digitsOnly(input);
  if(value.length!==14||/^(\d)\1{13}$/.test(value))return "";
  const values=[...value].map(Number);
  if(digit(values.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2])!==values[12])return "";
  if(digit(values.slice(0,13),[6,5,4,3,2,9,8,7,6,5,4,3,2])!==values[13])return "";
  return value;
}
export function formatCnpj(input){
  const value=normalizeCnpj(input);
  return value?value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5"):"";
}
export function companyPageUrl(input){
  const cnpj=normalizeCnpj(input);
  if(!cnpj)throw Error("CNPJ inválido: confira os 14 dígitos.");
  return FICHARIO.origin+"/cnpj/"+cnpj;
}

/**
 * Provider currently requires UF plus CNAE (7 digits) or city. Enforces
 * that subset and uses URLSearchParams so input cannot inject query fields.
 */
export function normalizeSearch(criteria){
  const uf=String(criteria?.uf??"").toUpperCase().trim();
  const cnae=digitsOnly(criteria?.cnae);
  const cidade=String(criteria?.cidade??"").trim().replace(/\s+/g," ").slice(0,90);
  const porte=String(criteria?.porte??"").trim();
  if(!STATES.has(uf))throw Error("Escolha um estado (UF) válido.");
  if(criteria?.cnae && !/^\d{7}$/.test(cnae))throw Error("O CNAE deve ter 7 dígitos.");
  if(!cnae && !cidade)throw Error("Informe um CNAE ou uma cidade além da UF.");
  if(cidade && cidade.length<2)throw Error("A cidade deve ter pelo menos 2 caracteres.");
  if(porte && !SIZES.has(porte))throw Error("O porte selecionado não é válido.");
  return {uf,cnae,cidade,porte};
}
export function advancedSearchUrl(criteria,{format="html"}={}){
  if(!["html","csv"].includes(format))throw Error("Formato inválido.");
  const {uf,cnae,cidade,porte}=normalizeSearch(criteria);
  const query=new URLSearchParams({uf});
  if(cnae)query.set("cnae",cnae);
  if(cidade)query.set("cidade",cidade);
  if(porte)query.set("porte",porte);
  if(format==="csv")query.set("formato","csv");
  const path=format==="csv"?"/api/v1/busca-avancada":"/busca-avancada";
  return FICHARIO.origin+path+"?"+query.toString();
}
/** Future server-side use: public company data is not opt-in lead data. */
export function prospectiveCompanyDraft({cnpj,companyName,segment,reviewedAt}){
  const id=normalizeCnpj(cnpj);
  if(!id)throw Error("CNPJ inválido.");
  const clean=(v,max)=>String(v??"").trim().replace(/[\u0000-\u001f\u007f]/g," ").slice(0,max);
  return Object.freeze({
    cnpj:id,
    company_name:clean(companyName,200),
    segment:clean(segment,150),
    source_id:FICHARIO.id,
    source_url:companyPageUrl(id),
    source_credit:FICHARIO.sourceCredit,
    source_retrieved_at:clean(reviewedAt,40)||null,
    stage:"pesquisa",
    reviewed_by_human:false,
    contact_allowed:false,
    legal_basis_reviewed:false,
  });
}
