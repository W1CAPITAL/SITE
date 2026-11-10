import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Página de Projetos exibe os projetos próprios e distingue dependências externas',async()=>{
 const html=await readFile(new URL('index.html',import.meta.url),'utf8');
 for(const s of ['../sites/','../lexispredict/','../videos/','../portfolio/?tab=projetos','./app.mjs','Hypit','MotionSmith MCP'])
 assert.ok(html.includes(s),s);
 assert.match(html,/não significa que a ferramenta esteja gerando/i);
});
test('Página inicial dá acesso a Projetos também no menu do celular',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok((html.match(/\.\/projetos\//g)||[]).length>=2);
});
test('O gerador nunca publica automaticamente nem solicita API key no front-end',async()=>{
 const js=await readFile(new URL('app.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(js,/fetch\s*\(/);
 assert.doesNotMatch(js,/api.?key|localStorage|sessionStorage/i);
 assert.match(js,/buildPlan/);
});

test('Acervo registra ambos os Reels sem anunciar dublagem ou publicação inexistentes',async()=>{
 const html=await readFile(new URL('index.html',import.meta.url),'utf8');
 for(const marker of ['id="reels-acervo"','Reels de automação','VoiceStudio · referência audiovisual','Narração gerada · Aprovação vocal pendente','Acervo privado','Voz Davi']){
   assert.ok(html.includes(marker),'Falta registro: '+marker);
 }
 assert.doesNotMatch(html,/src="[^"]*sandbox:|src="[^"]*\/mnt\/data/);
});

test('A aba Projetos apresenta o kit ProjectW1SC e o instalador em página própria',async()=>{
 const html=await readFile(new URL('index.html',import.meta.url),'utf8');
 assert.match(html,/ProjectW1SC · CRM/);
 assert.match(html,/\.\/projectw1sc\//);
 const kit=await readFile(new URL('projectw1sc/index.html',import.meta.url),'utf8');
 for(const term of ['Instalação assistida','Supabase','Vercel','GitHub','MCP','NotebookLM','id="copy-prompt"','projectw1sc-prompt.mjs'])
  assert.ok(kit.includes(term),'Ausente: '+term);
 const module=await readFile(new URL('projectw1sc/projectw1sc-prompt.mjs',import.meta.url),'utf8');
 for(const term of ['ProjectW1SC/Automation','Não copie clientes','Supabase','Vercel','GitHub','RLS','nove abas'])
  assert.ok(module.includes(term),'Ausente no prompt: '+term);
 assert.doesNotMatch(module,/sb_secret_|service_role\s*=|[0-9]{11}/i,'Sem credenciais ou dados privados');
});
