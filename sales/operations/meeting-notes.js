/** Lightweight manual meeting notes for W1 Sales.
 * No microphones, recording APIs, analytics, network, storage or AI.
 */
export function createMeetingMarkdown(data){
  const clean=(v,max)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
  const project=clean(data?.project,120), date=clean(data?.date,10);
  const objective=clean(data?.objective,1200),notes=clean(data?.notes,3500),actions=clean(data?.actions,1400);
  if(!project||!objective||!notes||!actions||! /^\d{4}-\d{2}-\d{2}$/.test(date))throw Error("Preencha o projeto, a data, o objetivo, a discussão e os próximos passos.");
  if(data.reviewed!==true)throw Error("Confirme que revisou as anotações antes de baixar.");
  return [
    "# W1 Capital — Resumo de reunião comercial",
    "","**Projeto:** "+project,
    "**Data:** "+date,"",
    "## Objetivo",objective,"",
    "## Conversa e necessidades",notes,"",
    "## Próximos passos",actions,"",
    "---",
    "Registro manual; não comprova gravação, presença, consentimento para campanhas ou contratação."
  ].join("\n");
}
if(typeof window!=="undefined"){
  const form=document.getElementById("notes-form");
  form?.addEventListener("submit",(event)=>{
    event.preventDefault();
    const status=document.getElementById("status");
    if(!form.reportValidity())return;
    try{
      const data=new FormData(form);
      const md=createMeetingMarkdown({
        project:data.get("project"),date:data.get("date"),
        objective:data.get("objective"),notes:data.get("notes"),
        actions:data.get("actions"),reviewed:data.get("reviewed")==="on"
      });
      const blob=new Blob([md],{type:"text/markdown;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=url;link.download="W1-Resumo-Reuniao.md";
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      if(status)status.textContent="Resumo criado. O conteúdo ficou no seu dispositivo.";
    }catch(error){if(status)status.textContent=error instanceof Error?error.message:"Verifique os campos informados.";}
  });
}
