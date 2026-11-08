import {buildPlan} from './plan-core.mjs';
const form=document.querySelector('#brief-form'),copy=document.querySelector('#copy'),download=document.querySelector('#download');
const output=document.querySelector('#output'),error=document.querySelector('#error');
let rendered='';
function asText(plan){return [
plan.brand.toUpperCase()+' / '+plan.format.toUpperCase()+' / '+plan.topic,'',
...plan.scenes.flatMap(s=>[s.role,'TEXTO: '+s.headline,'VISUAL: '+s.visual,'']),
'REVISÃO:',...plan.checklist.map(s=>'- '+s),'',plan.notice].join('\n');}
function render(plan){
 const container=document.querySelector('#scenes');container.replaceChildren();
 document.querySelector('#output-title').textContent=plan.brand+' · '+(plan.format==='reel'?'Roteiro de Reel':'Carrossel ilustrado');
 for(const scene of plan.scenes){
  const card=document.createElement('article');card.className='scene';
  const label=document.createElement('small');label.textContent=scene.role;
  const heading=document.createElement('h3');heading.textContent=scene.headline;
  const visual=document.createElement('p');visual.textContent=scene.visual;
  card.append(label,heading,visual);container.append(card);
 }
 rendered=asText(plan);output.hidden=false;copy.disabled=false;download.disabled=false;
}
form.addEventListener('submit',event=>{
 event.preventDefault();error.textContent='';copy.textContent='Copiar';
 try{render(buildPlan({brand:form.elements.namedItem('brand').value,format:form.elements.namedItem('format').value,topic:form.elements.namedItem('topic').value}));}
 catch(err){output.hidden=true;copy.disabled=true;download.disabled=true;rendered='';error.textContent=err.message;}
});
copy.addEventListener('click',async()=>{
 if(!rendered)return;
 try{await navigator.clipboard.writeText(rendered);copy.textContent='Copiado';}
 catch{error.textContent='Cópia indisponível neste navegador. Use Baixar TXT.';}
});
download.addEventListener('click',()=>{
 if(!rendered)return;
 const blob=new Blob([rendered],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='w1-roteiro-base.txt';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
