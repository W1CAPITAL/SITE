/*
 * Origem informada voluntariamente pelo link compartilhado.
 * Não coleta dados de navegação nem envia telemetria.
 */
const sources={
 linkedin:"LinkedIn",
 instagram:"Instagram",
 whatsapp:"WhatsApp",
 indicacao:"indicação",
 site:"site da W1 Capital",
};
export function normalizeOrigin(origin){
 const key=String(origin??"").trim().toLowerCase();
 return Object.prototype.hasOwnProperty.call(sources,key)?key:"site";
}
export function buildWhatsAppHref(origin){
 const src=sources[normalizeOrigin(origin)];
 const text="Olá, W1 Capital. Conheci o checklist de organização jurídica pelo "+src+". Gostaria de avaliar uma demonstração do LexisPredict para meu escritório.";
 return "https://wa.me/5513991199349?text="+encodeURIComponent(text);
}
if(typeof document!=="undefined"){
 const params=new URLSearchParams(window.location.search);
 const origin=normalizeOrigin(params.get("utm_source"));
 for(const a of document.querySelectorAll("[data-wa-conversion]"))a.setAttribute("href",buildWhatsAppHref(origin));
 document.querySelector("[data-print]")?.addEventListener("click",()=>window.print());
}
