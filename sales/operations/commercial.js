import {quoteDraft,funnelMetrics,funnelExport,brl} from "./commercial-core.js";
const byId=id=>document.getElementById(id);
function saveLocal(text,filename,mime){
  const blob=new Blob([text],{type:mime});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const toObj=form=>{
  const entries=Object.fromEntries(new FormData(form).entries());
  entries.reviewed=entries.reviewed==="on";
  return entries;
};
const quote=byId("quote-form");
quote?.addEventListener("submit",event=>{
  event.preventDefault();
  if(!quote.reportValidity())return;
  const status=byId("quote-status");
  try{
    const data=quoteDraft(toObj(quote));
    saveLocal(data,"W1-Proposta-Para-Revisao.md","text/markdown;charset=utf-8");
    status.textContent="Proposta criada para revisão no seu dispositivo. Não foi enviada a ninguém.";
  }catch(error){status.textContent=error instanceof Error?error.message:"Confira os dados da proposta.";}
});
const funnel=byId("funnel-form");
let last=null;
funnel?.addEventListener("submit",event=>{
  event.preventDefault();
  if(!funnel.reportValidity())return;
  const status=byId("funnel-status");
  try{
    const metrics=funnelMetrics(toObj(funnel));
    last=metrics;
    byId("rate-qualified").textContent=metrics.qualifiedRate===null?"sem base":metrics.qualifiedRate.toFixed(1)+"%";
    byId("rate-proposals").textContent=metrics.proposalWinRate===null?"sem base":metrics.proposalWinRate.toFixed(1)+"%";
    byId("amount-received").textContent=brl(metrics.received);
    byId("amount-net").textContent=brl(metrics.net);
    byId("funnel-results").hidden=false;
    byId("export-funnel").disabled=false;
    status.textContent="Cálculo feito com dados digitados. Confira os registros antes de usar estes números.";
  }catch(error){
    last=null;byId("funnel-results").hidden=true;byId("export-funnel").disabled=true;
    status.textContent=error instanceof Error?error.message:"Não foi possível calcular.";
  }
});
byId("export-funnel")?.addEventListener("click",()=>{
  if(!last)return;
  saveLocal(funnelExport(last),"W1-Funil-Para-Conferencia.txt","text/plain;charset=utf-8");
});
