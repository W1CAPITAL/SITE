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

function showPrepared(brief,channel){
  const preview=document.getElementById("site-prepared");
  if(!preview)return null;
  preview.hidden=false;
  preview.value=(channel==="whatsapp"
    ? "Mensagem para WhatsApp:"
    : "Para: "+SALES_EMAIL+"\nAssunto: "+brief.subject)+"\n\n"+brief.body;
  return preview;
}

function selectPrepared(preview){
  if(!preview)return;
  preview.focus();
  preview.select();
}

function openPrepared(channel){
  const brief=prepareBrief();
  if(!brief)return;
  const preview=showPrepared(brief,channel);
  if(channel==="copy"){
    const clipboard=globalThis.navigator?.clipboard;
    if(typeof clipboard?.writeText!=="function"){
      selectPrepared(preview);
      status.textContent="Mensagem selecionada. Copie o texto abaixo para enviar pelo canal de sua preferência.";
      return;
    }
    clipboard.writeText(brief.body).then(()=>{
      status.textContent="Briefing copiado. Você decide onde enviar.";
    }).catch(()=>{
      selectPrepared(preview);
      status.textContent="Não foi possível copiar automaticamente. Selecione e copie o texto abaixo.";
    });
    return;
  }
  if(channel==="email"){
    // Use same-tab mailto navigation. Opening mailto in a new popup can be blocked.
    status.textContent="Rascunho preparado. Confira e confirme o envio no aplicativo de e-mail. Se ele não abrir, copie o texto abaixo.";
    window.location.href=brief.email;
    return;
  }
  const opened=window.open(brief.whatsapp,"_blank","noopener,noreferrer");
  status.textContent=opened
    ? "Mensagem preparada para o WhatsApp. Confira e confirme o envio na conversa."
    : "Se o WhatsApp não abrir, copie o texto abaixo e envie manualmente. Nada foi enviado pelo site.";
}

form?.addEventListener("submit",event=>{
  // Enter must not trigger a GET request with visitor details in the URL.
  event.preventDefault();
  openPrepared("email");
});

document.getElementById("site-whatsapp")?.addEventListener("click",()=>openPrepared("whatsapp"));
document.getElementById("site-email")?.addEventListener("click",()=>openPrepared("email"));
document.getElementById("site-copy")?.addEventListener("click",()=>openPrepared("copy"));