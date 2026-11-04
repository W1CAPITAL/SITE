import {companyPageUrl,formatCnpj,advancedSearchUrl} from "./fichario.js";

const $ = (id) => document.getElementById(id);
const cnpjForm = $("cnpj-form");
const segmentForm = $("segment-form");

function message(container,text,type){
  container.replaceChildren();
  container.className="status"+(type?" "+type:"");
  const paragraph=document.createElement("p");
  paragraph.textContent=text;
  container.appendChild(paragraph);
}
function showDestination(container,url,label){
  message(container,"Pesquisa preparada. Caso a nova aba não abra, use o link abaixo:","success");
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.textContent=label;
  anchor.target="_blank";
  anchor.rel="noopener noreferrer";
  anchor.style.display="inline-block";
  anchor.style.marginTop="8px";
  anchor.style.fontWeight="800";
  anchor.style.textDecoration="underline";
  container.appendChild(anchor);
}
function openDestination(url){
  // Only open fixed provider URLs constructed by the adapter.
  window.open(url,"_blank","noopener,noreferrer");
}
cnpjForm.addEventListener("submit",(event)=>{
  event.preventDefault();
  const output=$("cnpj-status");
  try{
    const url=companyPageUrl($("cnpj").value);
    $("cnpj").value=formatCnpj($("cnpj").value);
    showDestination(output,url,"Abrir ficha da empresa ↗");
    openDestination(url);
  }catch(error){
    message(output,error instanceof Error?error.message:"Não foi possível validar o CNPJ.","error");
    $("cnpj").focus();
  }
});
segmentForm.addEventListener("submit",(event)=>{
  event.preventDefault();
  const output=$("segment-status");
  try{
    const criteria={uf:$("uf").value,cnae:$("cnae").value,cidade:$("cidade").value,porte:$("porte").value};
    const url=advancedSearchUrl(criteria);
    const csvUrl=advancedSearchUrl(criteria,{format:"csv"});
    showDestination(output,url,"Abrir pesquisa segmentada ↗");
    const csvLink=document.createElement("a");
    csvLink.href=csvUrl;
    csvLink.target="_blank";
    csvLink.rel="noopener noreferrer";
    csvLink.textContent="Exportar CSV no Fichário (conforme limite da fonte) ↗";
    csvLink.style.display="block";
    csvLink.style.marginTop="9px";
    csvLink.style.fontWeight="700";
    output.appendChild(csvLink);
    openDestination(url);
  }catch(error){
    message(output,error instanceof Error?error.message:"Confira os filtros da pesquisa.","error");
  }
});
