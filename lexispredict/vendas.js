/* W1 Sales: manual demo request, no network, tracking or backend. */
export const SALES_EMAIL="corporacaow1capital@gmail.com";
export const SALES_WHATSAPP="5513991199349";
export const PLAN_CHOICES=Object.freeze(["Essencial","Financeiro","Operacional","Máximo","Ainda não sei"]);
const clean=(value,max)=>String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
export function makeDemoRequest(raw){
 const nome=clean(raw?.nome,100);
 const empresa=clean(raw?.empresa,120);
 const email=clean(raw?.email,160).toLowerCase();
 const desafio=clean(raw?.desafio,550);
 const plano=clean(raw?.plano,30);
 if(nome.length<2||empresa.length<2)throw Error("Informe seu nome e o nome do escritório.");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("Informe um e-mail válido.");
 if(desafio.length<8)throw Error("Conte brevemente o que gostaria de melhorar.");
 if(!PLAN_CHOICES.includes(plano))throw Error("Selecione um plano válido.");
 if(raw?.consent!==true)throw Error("Confirme que deseja preparar uma solicitação de contato.");
 const subject="LexisPredict | Solicitação de demonstração | "+empresa.slice(0,75);
 const body=[
  "Olá, equipe W1 Capital.",
  "",
  "Tenho interesse em conhecer o LexisPredict e gostaria de receber informações sobre uma demonstração assistida.",
  "",
  "Nome: "+nome,
  "Escritório ou empresa: "+empresa,
  "Meu e-mail de contato: "+email,
  "Plano de interesse: "+plano,
  "",
  "Principal desafio:",
  desafio,
  "",
  "Autorizo a W1 Capital a responder a esta solicitação comercial. Entendo que a mensagem será enviada somente quando eu confirmar no aplicativo escolhido e que a proposta final dependerá de validação.",
  "",
  "Obrigado(a)."
 ].join("\n");
 const mailto="mailto:"+SALES_EMAIL+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
 const whatsapp="https://wa.me/"+SALES_WHATSAPP+"?text="+encodeURIComponent(subject+"\n\n"+body);
 return Object.freeze({subject,body,mailto,whatsapp,address:SALES_EMAIL});
}
if(typeof window!=="undefined"){
 const $=id=>document.getElementById(id);
 const shortcuts=document.querySelector(".mobile-shortcuts");
 shortcuts?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
   shortcuts.open = false;
 }));
 document.addEventListener("keydown",event=>{
   if(event.key === "Escape" && shortcuts?.open){
     shortcuts.open = false;
     shortcuts.querySelector("summary")?.focus();
   }
 });
 document.addEventListener("pointerdown",event=>{
   if(shortcuts?.open && !shortcuts.contains(event.target)) shortcuts.open = false;
 });
 const form=$("demo-form");
 const status=$("status");
 const fallback=$("fallback");
 const msg=$("prepared");
 document.querySelectorAll("[data-plan]").forEach(a=>a.addEventListener("click",()=>{
   const selected=a.getAttribute("data-plan");
   if(PLAN_CHOICES.includes(selected))$("plano").value=selected;
 }));
 form?.addEventListener("submit",event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   try{
     const raw=Object.fromEntries(new FormData(form).entries());
     raw.consent=$("consent").checked;
     const data=makeDemoRequest(raw);
     msg.value="Para: "+data.address+"\nAssunto: "+data.subject+"\n\n"+data.body;
     fallback.hidden=false;
     status.textContent="Mensagem preparada. Confirme o envio no seu aplicativo de e-mail. Se ele não abrir, copie a mensagem abaixo. Nenhuma solicitação foi enviada por este site.";
     // The user clicks Submit: open the OS email composer. Do not claim it was sent.
     window.location.href=data.mailto;
   }catch(error){status.textContent=error instanceof Error?error.message:"Confira os dados.";}
 });
 $("send-whatsapp")?.addEventListener("click",()=>{
   if(!form?.reportValidity())return;
   try{
     const raw=Object.fromEntries(new FormData(form).entries());
     raw.consent=$("consent").checked;
     const data=makeDemoRequest(raw);
     msg.value="WhatsApp: +55 13 99119-9349\n\n"+data.body;
     fallback.hidden=false;
     status.textContent="Mensagem preparada para o WhatsApp. Confirme o envio na conversa aberta. Se não abrir, copie o texto abaixo. Nenhuma solicitação foi enviada por este site.";
     window.open(data.whatsapp,"_blank","noopener,noreferrer");
   }catch(error){status.textContent=error instanceof Error?error.message:"Confira os dados.";}
 });
 $("copy-email")?.addEventListener("click",()=>{
    navigator.clipboard?.writeText(SALES_EMAIL).then(()=>{status.textContent="Endereço de e-mail copiado.";}).catch(()=>{
      status.textContent="Copie o endereço exibido: "+SALES_EMAIL;
    });
 });
 $("copy-message")?.addEventListener("click",()=>{
    if(!msg.value)return;
    if(!navigator.clipboard){msg.focus();msg.select();status.textContent="Selecione e copie a mensagem preparada.";return;}
    navigator.clipboard.writeText(msg.value).then(()=>{status.textContent="Mensagem copiada. Agora envie pelo seu e-mail para "+SALES_EMAIL+".";}).catch(()=>{
      msg.focus();msg.select();status.textContent="Selecione e copie a mensagem preparada.";
    });
 });
 const year=$("year");if(year)year.textContent=String(new Date().getFullYear());
}
