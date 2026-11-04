/**
 * W1 Sales — deterministic commercial guide.
 * No external AI, customer database or promises of results.
 */
export const PRODUCTS=Object.freeze([
  {id:"lexis",need:"juridico",icon:"◈",name:"LexisPredict",description:"Solução para organizar a carteira jurídica, o atendimento e o acompanhamento processual.",reason:"Sua necessidade está relacionada a processos e organização jurídica. O LexisPredict pode ser apresentado pela equipe para avaliar aderência."},
  {id:"crm",need:"crm",icon:"◎",name:"CRM e gestão comercial",description:"Organização de contatos, tarefas, oportunidades e acompanhamento do funil de vendas.",reason:"A centralização de oportunidades e retornos pode ajudar sua operação comercial. A equipe avaliará o sistema apropriado."},
  {id:"automation",need:"automacao",icon:"↻",name:"Integrações e automação",description:"Desenho de fluxos para reduzir tarefas repetitivas e integrar ferramentas existentes.",reason:"Uma análise dos processos atuais pode identificar oportunidades de automação, sujeitas a viabilidade e autorização."},
  {id:"analytics",need:"dados",icon:"▥",name:"Dashboards e indicadores",description:"Painéis para acompanhar métricas, atendimento, produtividade e resultados.",reason:"A necessidade aponta para organização de indicadores e relatórios. Um projeto pode ser definido após avaliar dados e escopo."},
]);

const NEEDS=new Set(["juridico","crm","automacao","dados"]);
const SIZES=new Set(["individual","pequena","media","grande"]);
export function recommendProduct(need,size,selected=""){
  if(!NEEDS.has(need))return null;
  if(selected&&PRODUCTS.some(p=>p.id===selected&&p.need===need))return PRODUCTS.find(p=>p.id===selected);
  return PRODUCTS.find(p=>p.need===need)||null;
}
const clean=(value,max)=>String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
export function normalizeLead(raw){
  const name=clean(raw?.name,120),email=clean(raw?.email,240).toLowerCase(),message=clean(raw?.message,700);
  const need=clean(raw?.need,32),size=clean(raw?.size,32),product=clean(raw?.product_id,32);
  if(!raw?.consent)return {ok:false,error:"A autorização de contato é obrigatória."};
  if(name.length<2)return {ok:false,error:"Informe seu nome para contato."};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {ok:false,error:"Informe um e-mail válido."};
  if(!NEEDS.has(need)||!SIZES.has(size))return {ok:false,error:"Escolha a necessidade e o porte da empresa."};
  if(recommendProduct(need,size)?.id!==product)return {ok:false,error:"A solução indicada não corresponde à consulta."};
  return {ok:true,data:{name,email,message,need,company_size:size,product_id:product,consent:true,source:"w1_sales_portal"}};
}
export function buildBrief({need,size,product}){
  const needLabels={juridico:"Gestão jurídica",crm:"Gestão de clientes",automacao:"Automação",dados:"Dados e indicadores"};
  const sizeLabels={individual:"Profissional/autônomo",pequena:"Até 10 pessoas",media:"11 a 50 pessoas",grande:"Mais de 50 pessoas"};
  return [
    "W1 CAPITAL — RESUMO DA CONSULTA COMERCIAL",
    "Nenhum dado pessoal foi coletado neste documento.",
    "",
    "Necessidade: "+(needLabels[need]||"Não selecionada"),
    "Porte: "+(sizeLabels[size]||"Não selecionado"),
    "Solução preliminar: "+(product?.name||"Não definida"),
    "Motivo: "+(product?.reason||"Não determinado"),
    "",
    "Este documento é apenas um resumo de triagem. Não constitui preço, contratação, prazo ou garantia.",
    "Nenhum contato comercial automático foi autorizado pelo simples download.",
  ].join("\n");
}
