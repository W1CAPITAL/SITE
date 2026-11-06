"use strict";
// The six approved visual reference images are the EXACT layout, not a recreation.
// Functional links and form fields are transparent DOM layers on top of the image.
// Source image 1122x1402, browser-bar crop 40px, visual height 1362.
const NAMES={"inicio":"Início","solucoes":"Soluções","sobre":"Sobre","atuacao":"Atuação","como-funciona":"Como funciona","contato":"Contato"};
const CURRENT=document.documentElement.dataset.page||"inicio";
const PAGE_W=1122,PAGE_H=1362,CROP_Y=40,ROOT=CURRENT==="inicio"?"./":"../";
function target(id){return ROOT+(id==="inicio"?"":id+"/")}
function styleAt(x,y,w,h){return "left:"+100*x/PAGE_W+"%;top:"+100*(y-CROP_Y)/PAGE_H+"%;width:"+100*w/PAGE_W+"%;height:"+100*h/PAGE_H+"%";}
function hit(container,box,href,label,extra){
 const a=document.createElement("a");a.href=href;a.className="hot "+(extra||"");a.style.cssText=styleAt(...box);a.setAttribute("aria-label",label);container.appendChild(a);return a;
}
function modal(text){
 let node=document.getElementById("preview-modal");node.hidden=false;
 node.querySelector("pre").textContent=text;node.querySelector("[data-close]").focus();
 node.querySelector("[data-copy]").onclick=()=>{
   if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>{node.querySelector("[data-feedback]").textContent="Texto copiado.";}).catch(()=>{node.querySelector("[data-feedback]").textContent="Selecione e copie o texto.";});}
 };
}
function closeModal(){const n=document.getElementById("preview-modal");n.hidden=true;n.querySelector("[data-feedback]").textContent="";}
function addField(f,name,label,coords,kind,placeholder){
 const el=document.createElement("label");el.className="field";el.style.cssText=styleAt(...coords);
 let input=kind==="textarea"?document.createElement("textarea"):kind==="select"?document.createElement("select"):document.createElement("input");
 if(kind==="select"){["Assunto da demanda","Correspondência jurídica","Diligência","Audiência","Acompanhamento","Outro"].forEach((s,i)=>{const opt=document.createElement("option");opt.textContent=s;opt.value=i===0?"":s;input.appendChild(opt);});}
 else{if(kind!=="textarea")input.type=kind;input.placeholder=placeholder||"";}
 input.name=name;input.required=true;input.maxLength=kind==="textarea"?500:120;input.setAttribute("aria-label",label);el.appendChild(input);f.appendChild(el);
}
function addContact(root){
 const f=document.createElement("form");f.className="form-overlay";f.id="formulario";f.setAttribute("aria-label","Prévia interativa sem envio de dados");f.autocomplete="off";
 addField(f,"nome","Nome completo",[58,548,295,36],"text","Nome completo *");
 addField(f,"email","E-mail",[368,548,291,36],"email","E-mail *");
 addField(f,"telefone","Telefone ou WhatsApp",[58,592,295,36],"tel","Telefone / WhatsApp *");
 addField(f,"assunto","Assunto",[368,592,291,36],"select","");
 addField(f,"descricao","Resumo fictício da demanda",[58,638,602,69],"textarea","Descreva uma demanda fictícia");
 const b=document.createElement("button");b.type="submit";b.className="mock-send";b.style.cssText=styleAt(58,743,603,33);b.setAttribute("aria-label","Gerar prévia local; não enviar");f.appendChild(b);
 f.addEventListener("submit",e=>{
  e.preventDefault();if(!f.reportValidity())return;const d=new FormData(f);
  modal(["PRÉVIA DEMONSTRATIVA — NÃO ENVIADA","Nome: "+(d.get("nome")||""),"E-mail: "+(d.get("email")||""),"Telefone: "+(d.get("telefone")||""),"Assunto: "+(d.get("assunto")||""),"Descrição: "+(d.get("descricao")||"")].join("\n"));
 });root.appendChild(f);
 [
  [866,"Em quanto tempo receberei um retorno?","Prazos reais exigem confirmação com a responsável."],
  [901,"O atendimento inicial tem custo?","Valores e condições não são informados neste modelo visual."],
  [937,"Como meus dados seriam protegidos?","Esta versão não armazena nem envia informações."],
  [973,"Posso enviar documentos?","Este protótipo não permite envio de arquivos."]
 ].forEach(([y,q,a])=>{const t=document.createElement("button");t.type="button";t.className="hot";t.style.cssText=styleAt(594,y,470,33);t.setAttribute("aria-label",q);t.addEventListener("click",()=>modal(q+"\n\n"+a));root.appendChild(t);});
 hit(root,[548,1150,230,42],"#formulario","Voltar ao formulário");
}
function init(){
 if(!NAMES[CURRENT])return;
 const app=document.getElementById("literal-app");if(!app)return;
 const visuals=(typeof VISUAL_REFERENCE_ASSETS!=="undefined")?VISUAL_REFERENCE_ASSETS:{};
 const src=visuals[CURRENT];
 const img=document.createElement("img");img.className="original-layout";img.alt="Arte conceitual original aprovada da página "+NAMES[CURRENT]+". Os controles reais são sobrepostos e identificados para navegação.";img.width=1122;img.height=1402;
 if(src)img.src=src;else img.alt="A imagem original não está disponível; consulte o pacote completo para download.";
 img.addEventListener("error",()=>{app.classList.add("image-error");app.insertAdjacentHTML("afterbegin",'<p style="position:relative;z-index:5;padding:25px;background:#06382a;color:#fff">A imagem de referência desta sessão não pôde ser carregada. A versão completa e permanente está disponível no pacote ZIP da conversa.</p>');});
 app.appendChild(img);
 hit(app,[47,80,214,64],target("inicio"),"Início, logotipo Autêntica");
 [["inicio",327,90,61,51],["solucoes",395,90,85,51],["sobre",495,90,62,51],["atuacao",561,90,82,51],["como-funciona",655,90,113,51],["contato",770,90,80,51]].forEach(([id,x,y,w,h])=>hit(app,[x,y,w,h],target(id),"Página "+NAMES[id]));
 hit(app,[874,88,187,53],target("contato")+"#formulario","Solicitar atendimento ilustrativo");
 const hero={
  "inicio":[52,416,218,48,290,416,230,48],
  "solucoes":[49,406,221,54,289,406,203,54],
  "sobre":[49,391,217,48,278,391,215,48],
  "atuacao":[48,381,223,55,286,381,210,55],
  "como-funciona":[49,368,217,52,277,368,219,52],
  "contato":[50,360,211,52,273,360,227,52]
 }[CURRENT];
 if(hero){
  hit(app,hero.slice(0,4),CURRENT==="contato"?"#formulario":target("contato"),"Solicitar atendimento");
  hit(app,hero.slice(4,8),CURRENT==="contato"?target("como-funciona"):target("solucoes"),"Saiba mais");
 }
 if(CURRENT==="inicio")[[20,925,130,35],[160,925,130,35],[300,925,130,35],[450,925,130,35]].forEach(r=>hit(app,r,target("solucoes"),"Conhecer serviços"));
 if(CURRENT==="solucoes")[[36,835,140,36],[399,835,140,36],[746,835,140,36],[36,968,140,36],[398,968,140,36],[744,968,140,36]].forEach(r=>hit(app,r,target("contato"),"Solicitar informações sobre serviços"));
 if(CURRENT==="atuacao")hit(app,[50,765,230,51],target("contato"),"Consultar localidade");
 if(CURRENT==="como-funciona")hit(app,[866,1296,202,46],target("contato"),"Próximo passo");
 if(CURRENT==="contato")addContact(app);
 const menu=document.getElementById("route-menu"),open=document.getElementById("menu-trigger");
 menu.innerHTML=Object.entries(NAMES).map(([id,v])=>'<a href="'+target(id)+'" '+(id===CURRENT?'aria-current="page"':'')+'>'+v+'</a>').join("")+'<a href="../../sites/">Modelos W1 Capital</a>';
 open.addEventListener("click",()=>{const show=menu.hidden;menu.hidden=!show;open.setAttribute("aria-expanded",String(show));});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){menu.hidden=true;open.setAttribute("aria-expanded","false");closeModal();}});
 const backdrop=document.getElementById("preview-modal");
 backdrop.querySelector("[data-close]").addEventListener("click",closeModal);
 backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});
}
document.addEventListener("DOMContentLoaded",init);
