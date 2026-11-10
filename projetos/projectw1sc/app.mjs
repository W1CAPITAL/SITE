import {INSTALL_PROMPT,NOTEBOOKLM_CONTENT,NOTEBOOKLM_VISUAL} from './projectw1sc-prompt.mjs';

const prompt=document.querySelector('#prompt');
const status=document.querySelector('#status');
prompt.value=INSTALL_PROMPT;
const snippets={content:NOTEBOOKLM_CONTENT,visual:NOTEBOOKLM_VISUAL};
async function copyText(text,success){
 try{
  await navigator.clipboard.writeText(text);
  status.textContent=success;
 }catch{
  prompt.value=text;
  prompt.focus();
  prompt.select();
  status.textContent='Selecione e copie o texto usando Ctrl+C. Este navegador não liberou a área de transferência.';
 }
}
document.querySelector('#copy-prompt').addEventListener('click',()=>copyText(INSTALL_PROMPT,'Prompt completo copiado.'));
for(const button of document.querySelectorAll('[data-copy]')){
 button.addEventListener('click',()=>{
  const kind=button.dataset.copy;
  if(Object.hasOwn(snippets,kind))copyText(snippets[kind],kind==='content'?'Prompt de conteúdo copiado.':'Prompt visual copiado.');
 });
}
document.querySelector('#download-prompt').addEventListener('click',()=>{
 const file=new Blob([INSTALL_PROMPT],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(file);
 const link=document.createElement('a');
 link.href=url;
 link.download='projectw1sc-instalacao-assistida.txt';
 document.body.appendChild(link);
 link.click();
 link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='Arquivo TXT preparado para download.';
});
