const SALES_WHATSAPP="5513991199349";
const SALES_EMAIL="corporacaow1capital@gmail.com";
const form=document.getElementById("site-briefing");
const status=document.getElementById("site-status");

function prepareBrief(){
  if(!form.reportValidity())return null;
  const d=new FormData(form);
  if(d.get("consent")!=="on"){status.textContent="Marque o consentimento para continuar.";return null;}
  const safe=(key,n)=>String(d.get(key)||"").trim().slice(0,n).replace(/[\r\n]+/g," ");
  const name=safe("contactName",90),business=safe("business",110),sector=safe("sector",85),type=safe("siteType",50),goal=String(d.get("goal")||"").trim().slice(0,600);
  const subject="Orçamento de site — "+business;
  const body="Olá, equipe W1 Capital! Gostaria de conversar sobre a criação de um site.\n\n"+
    "Nome: "+name+"\nNegócio: "+business+"\nSetor: "+sector+"\nFormato desejado: "+type+"\nObjetivo: "+goal+"\n\n"+
    "Autorizo o uso destas informações para responder ao pedido. Sei que não há contratação automática.";
  return {body,subject,whatsapp:"https://wa.me/"+SALES_WHATSAPP+"?text="+encodeURIComponent(body),
    email:"mailto:"+SALES_EMAIL+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body)};
}

function openPrepared(channel){
  const brief=prepareBrief();if(!brief)return;
  if(channel==="copy"){
    const copy=globalThis.navigator?.clipboard?.writeText;
    if(!copy){status.textContent="A cópia automática não está disponível neste navegador; utilize WhatsApp ou e-mail.";return;}
    copy.call(globalThis.navigator.clipboard,brief.body).then(()=>{status.textContent="Briefing copiado. Você decide onde enviar.";}).catch(()=>{status.textContent="Não foi possível copiar. Utilize WhatsApp ou e-mail.";});
    return;
  }
  const url=channel==="whatsapp"?brief.whatsapp:brief.email;
  const opened=window.open(url,"_blank","noopener,noreferrer");
  status.textContent=channel==="whatsapp"?"WhatsApp preparado. Confira a mensagem e confirme o envio por lá.":"Rascunho de e-mail preparado. Confira e confirme o envio no seu aplicativo.";
}

document.getElementById("site-whatsapp")?.addEventListener("click",()=>openPrepared("whatsapp"));
document.getElementById("site-email")?.addEventListener("click",()=>openPrepared("email"));
document.getElementById("site-copy")?.addEventListener("click",()=>openPrepared("copy"));