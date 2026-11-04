import {PRODUCTS, recommendProduct, normalizeLead, buildBrief} from "./core.js";

const config = window.W1_SALES_CONFIG || {};
const ready = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(String(config.supabaseUrl||"")) &&
  typeof config.publishableKey==="string" && config.publishableKey.length>20 &&
  !config.publishableKey.includes("COLOQUE");
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const needChoices = [
  ["juridico","Meus processos e prazos estão espalhados","Quero mais organização e menos sustos na rotina jurídica"],
  ["crm","Perco o fio das conversas com clientes","Preciso enxergar quem está interessado e o que falta fazer"],
  ["automacao","Minha equipe repete as mesmas tarefas","Quero tirar o trabalho manual do caminho"],
  ["dados","Falta clareza sobre os resultados","Quero entender a operação sem montar planilha toda hora"],
];
const sizeChoices = [["individual","Profissional ou autônomo"],["pequena","Equipe de até 10 pessoas"],["media","Equipe de 11 a 50 pessoas"],["grande","Organização com mais de 50 pessoas"]];
const state = {step:0,need:"",size:"",selected:"",busy:false};
$("catalogo").innerHTML=PRODUCTS.map(p=>{
  const isLexis=p.id==="lexis";
  const icon=isLexis
    ?'<span class="product-brandmark brand-atlas-lexis-symbol" role="img" aria-label="Símbolo LexisPredict"></span>'
    :'<span class="product-icon" aria-hidden="true">'+escapeHtml(p.icon)+'</span>';
  const action=isLexis
    ?'<a class="product-link" href="./lexispredict/">Conhecer o LexisPredict ↗</a>'
    :'<button type="button" data-product="'+escapeHtml(p.id)+'">Avaliar esta solução ↗</button>';
  return '<article class="product product--'+escapeHtml(p.id)+'">'+icon+'<h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.description)+'</p>'+action+'</article>';
}).join("");
$("catalogo").addEventListener("click",ev=>{
  const target=ev.target.closest("[data-product]");if(!target)return;
  const item=PRODUCTS.find(x=>x.id===target.dataset.product);if(!item)return;
  state.need=item.need;state.selected=item.id;state.step=1;
  // The consultation is secondary and normally collapsed; open it before
  // scrolling from a capability card so the next step is actually visible.
  const consultation=document.querySelector(".consultation-details");
  if(consultation) consultation.open=true;
  render();
  $("atendimento").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
});
const choiceMarkup=(pairs,current,group)=>'<div class="choices" role="group" aria-label="'+escapeHtml(group)+'">'+pairs.map(([value,label,detail])=>'<button type="button" class="choice" data-choice="'+escapeHtml(value)+'" aria-pressed="'+(current===value)+'"><strong>'+escapeHtml(label)+'</strong>'+(detail?'<div class="muted" style="font-size:11px;margin-top:6px">'+escapeHtml(detail)+'</div>':"")+'</button>').join("")+'</div>';
function render(){
  const product=recommendProduct(state.need,state.size,state.selected);
  $("step-number").textContent=state.step+1;
  $("progress-bar").style.width=((state.step+1)*100/3)+"%";
  $("progress-bar").parentElement?.setAttribute("aria-valuenow",String(state.step+1));
  $("summary-need").textContent=needChoices.find(x=>x[0]===state.need)?.[1]||"A definir";
  $("summary-size").textContent=sizeChoices.find(x=>x[0]===state.size)?.[1]||"A definir";
  $("summary-product").textContent=product?.name||"A definir";
  $("back").disabled=state.step===0||state.busy;
  $("next").disabled=state.busy||(!state.need&&state.step===0)||(!state.size&&state.step===1);
  $("storage-status").textContent=ready?"Formulário comercial configurado com banco de dados isolado.":"Modo demonstração: nenhum dado pessoal é coletado ou enviado. Configure um Supabase comercial para habilitar o contato.";
  if(state.step===0){
    $("step-body").innerHTML='<h3 class="step-title">Qual dessas situações parece a sua?</h3><p class="step-copy">Escolha o problema que mais atrapalha o dia a dia.</p>'+choiceMarkup(needChoices,state.need,"Necessidade");
    $("next").textContent="Continuar ↗";
  }else if(state.step===1){
    $("step-body").innerHTML='<h3 class="step-title">Hoje, quantas pessoas trabalham com você?</h3><p class="step-copy">É só para contextualizar a conversa. Não muda nenhum preço automaticamente.</p>'+choiceMarkup(sizeChoices,state.size,"Porte da empresa");
    $("next").textContent="Ver recomendação ↗";
  }else{
    const p=product||PRODUCTS[0];
    $("step-body").innerHTML='<h3 class="step-title">Acho que vale começar por aqui</h3><div class="note"><strong>'+escapeHtml(p.name)+'</strong><p>'+escapeHtml(p.reason)+'</p></div><p class="step-copy" style="margin-top:18px">É apenas uma indicação preliminar. Uma pessoa da W1 precisa confirmar o serviço e as condições.</p>'+(ready?'<form id="lead-form" autocomplete="on"><label class="field">Seu nome<input name="name" maxlength="120" autocomplete="name" required placeholder="Como podemos chamar você?"></label><label class="field">E-mail profissional<input type="email" name="email" maxlength="240" autocomplete="email" required placeholder="voce@empresa.com"></label><label class="field">Contexto adicional (opcional)<textarea name="message" maxlength="700" rows="3" placeholder="Conte brevemente sua necessidade, sem dados sensíveis."></textarea></label><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><label class="consent"><input name="consent" type="checkbox" required><span>Autorizo a W1 Capital a utilizar estas informações para responder a este pedido comercial. Não autorizo campanhas automáticas nem a transferência para a carteira jurídica.</span></label></form>':'<div class="status" role="status">O banco comercial ainda não está ativo. Você pode gerar um resumo da necessidade, sem incluir informações pessoais, para encaminhar depois.</div>')+'<div id="send-status" role="status" aria-live="polite"></div>';
    $("next").textContent=ready?"Quero conversar com a W1 ↗":"Guardar minha sugestão ↓";
  }
  $("step-body").classList.remove("step-swap");
  void $("step-body").offsetWidth;
  $("step-body").classList.add("step-swap");
}
$("step-body").addEventListener("click",e=>{
  const option=e.target.closest("[data-choice]");if(!option||state.busy)return;
  if(state.step===0){state.need=option.dataset.choice;state.selected="";}
  if(state.step===1)state.size=option.dataset.choice;
  render();
});
$("back").addEventListener("click",()=>{if(state.step>0&&!state.busy){state.step--;render();}});
function downloadBrief(){
  const blob=new Blob([buildBrief({need:state.need,size:state.size,product:recommendProduct(state.need,state.size,state.selected)})],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="W1-Sales-Resumo.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function submit(){
  const form=$("lead-form");
  if(!form?.reportValidity())return;
  const raw=new FormData(form);
  if(raw.get("website"))return; // Honeypot, not a substitute for server-side rate limits.
  const product=recommendProduct(state.need,state.size,state.selected);
  const lead=normalizeLead({name:raw.get("name"),email:raw.get("email"),message:raw.get("message"),need:state.need,size:state.size,product_id:product.id,consent:raw.get("consent")==="on"});
  const result=$("send-status");result.className="status";
  if(!lead.ok){result.className="status error";result.textContent=lead.error;return;}
  state.busy=true;$("next").disabled=true;$("next").textContent="Enviando…";
  try{
    const response=await fetch(String(config.supabaseUrl).replace(/\/$/,"")+"/rest/v1/sales_leads",{
      method:"POST",headers:{"apikey":config.publishableKey,"Authorization":"Bearer "+config.publishableKey,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify(lead.data),signal:AbortSignal.timeout(12000),cache:"no-store"
    });
    if(!response.ok)throw Error("Falha ao registrar solicitação (HTTP "+response.status+").");
    result.className="status success";result.textContent="Pronto, recebemos seu pedido. A equipe poderá responder no e-mail informado.";
    form.reset();
  }catch(e){result.className="status error";result.textContent="Não conseguimos confirmar o envio. Antes de tentar de novo, confira com a equipe para evitar pedidos duplicados. "+String(e?.message||"");}
  finally{state.busy=false;$("next").disabled=false;$("next").textContent="Quero conversar com a W1 ↗";}
}
$("next").addEventListener("click",()=>{if(state.step<2){if(state.step===0&&!state.need||state.step===1&&!state.size)return;state.step++;render();}else if(ready){void submit();}else{downloadBrief();}});
const motionAllowed=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(motionAllowed&&"IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.add("is-visible");observer.unobserve(entry.target);
    }
  },{rootMargin:"0px 0px -35px 0px",threshold:.04});
  for(const el of document.querySelectorAll(".product,.agent,.section-header,.consultant,.metric")){
    el.classList.add("reveal");observer.observe(el);
  }
}
render();
