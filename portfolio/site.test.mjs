import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const dirname=path.dirname(fileURLToPath(import.meta.url));
const app=fs.readFileSync(path.join(dirname,'script.js'),'utf8');
const html=fs.readFileSync(path.join(dirname,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dirname,'styles.css'),'utf8');
const tabs=['inicio','sobre','experiencia','formacao','projetos','competencias','contato'];
function render(tab){
 const target={innerHTML:''};
 const links=tabs.map(id=>({dataset:{tab:id},classList:{toggle(){}},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]}}));
 const mock={addEventListener(){},classList:{toggle(){return false},remove(){}},setAttribute(){}};
 const document={title:'',querySelector(sel){return sel==='#app'?target:null},querySelectorAll(sel){return sel==='[data-tab]'?links:[]},getElementById(id){return id==='email-form'?null:mock}};
 vm.runInNewContext(app,{document,location:{search:'?tab='+tab},URLSearchParams,FormData,encodeURIComponent}, {timeout:2000});
 return {html:target.innerHTML,document,links};
}
test('seven real HTML tabs render and select exactly one navigation item',()=>{
 assert.match(html,/<main id="app"/);
 for(const t of tabs){const v=render(t);assert.ok(v.html.length>1600,t+' empty');assert.match(v.html,/<h1\b/);assert.equal(v.links.filter(l=>l['aria-current']==='page').length,1,t);assert.equal(v.document.title.includes('Davi Alves Figueredo'),true);}
});
test('professional profile distinguishes GET job from W1 Capital ownership',()=>{
 const v=render('inicio').html;
 assert.match(v,/Analista de Processos Jurídicos/);
 assert.match(v,/GET Assessoria Financeira/);
 assert.match(v,/fundador da W1 Capital/);
 assert.match(render('experiencia').html,/Concentrix · Produto Claro/);
});
test('education is visible and appropriately qualified',()=>{
 const v=render('formacao').html;
 for(const x of ['UNICID','Em andamento','Técnico em Secretariado','Segurança Patrimonial','Cate SP'])assert.ok(v.includes(x),x);
});
test('projects have original W1CAPITAL and W2CAPITAL GitHub destinations',()=>{
 const v=render('projetos').html;
 assert.ok((v.match(/https:\/\/github\.com\/(W1CAPITAL|W2CAPITAL)\/[A-Za-z0-9_.-]+/g)||[]).length>=11);
 assert.match(v,/https:\/\/github\.com\/W1CAPITAL\/LexisPredict/);
 assert.match(v,/https:\/\/github\.com\/W2CAPITAL\/PredictLm/);
});
test('resume is the real PDF with expected size',()=>{
 const pdf=fs.readFileSync(path.join(dirname,'assets','Curriculo_Davi_Alves_Figueredo.pdf'));
 assert.equal(pdf.length,125656);
 assert.equal(pdf.subarray(0,5).toString('ascii'),'%PDF-');
 assert.match(html,/assets\/Curriculo_Davi_Alves_Figueredo\.pdf/);
});
test('responsive UI and email-only form',()=>{
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/@media\(max-width:600px\)/);
 const v=render('contato').html;
 assert.match(v,/id="email-form"/);
 assert.match(v,/type="email"/);
 assert.doesNotMatch(app,/\bfetch\s*\(/);
});
test('W1 Capital navigation reaches portfolio from desktop, mobile and footer',()=>{
 const home=fs.readFileSync(path.join(dirname,'..','index.html'),'utf8');
 assert.ok((home.match(/href="\.\/portfolio\/"/g)||[]).length>=3);
 assert.match(home,/Portfólio Davi/);
});
test('unknown tab falls back to the professional home page',()=>{
 const v=render('rota-inexistente');
 assert.match(v.html,/Analista de Processos Jurídicos/);
 assert.equal(v.links.find(l=>l.dataset.tab==='inicio')['aria-current'],'page');
});
test('all pages have exactly one primary heading and named navigation',()=>{
 for(const t of tabs)assert.equal((render(t).html.match(/<h1\b/g)||[]).length,1,t);
 assert.match(html,/aria-controls="navigation"/);
 assert.match(html,/class="skip" href="#app"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('email form encodes the complete message and blocks invalid submissions',()=>{
 let submit,valid=false;
 const form={reportValidity:()=>valid,addEventListener(type,fn){if(type==='submit')submit=fn}};
 const mock={addEventListener(){},classList:{toggle(){return false},remove(){}},setAttribute(){}};
 const appNode={innerHTML:''},feedback={textContent:''},loc={search:'?tab=contato',href:''};
 const doc={title:'',querySelector:()=>appNode,querySelectorAll:()=>[],getElementById:id=>id==='email-form'?form:id==='form-feedback'?feedback:mock};
 const data={name:'Teste & revisão',email:'teste@example.com',subject:'Proposta: A & B?',message:'Olá!\nTecnologia + operação = projeto.'};
 class TestFormData{get(key){return data[key]}}
 vm.runInNewContext(app,{document:doc,location:loc,URLSearchParams,FormData:TestFormData,encodeURIComponent});
 let prevented=0;submit({preventDefault(){prevented++}});assert.equal(loc.href,'');
 valid=true;submit({preventDefault(){prevented++}});
 assert.equal(prevented,2);
 const url=new URL(loc.href);
 assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,'corporacaow1capital@gmail.com');
 assert.equal(url.searchParams.get('subject'),data.subject);
 for(const value of [data.name,data.email,data.message])assert.ok(url.searchParams.get('body').includes(value));
 assert.match(feedback.textContent,/revisão/);
});


test('visual assets preserve the existing seven-tab portfolio and real CV',()=>{
 const assetNames=['hero-davi.webp','retratro-davi.webp','projeto-lexispredict.webp','projeto-w1capital.webp','projeto-autentica.webp','projeto-centro-operacional.webp','projeto-propostas.webp','projeto-automacoes.webp'];
 for(const name of assetNames){
  const file=path.join(dirname,'assets',name);
  assert.ok(fs.existsSync(file),name+' missing');
  assert.ok(fs.statSync(file).size>5000,name+' unexpectedly empty');
 }
 assert.match(html,/premium-fidelity\.css/);
 assert.match(html,/Davi Alves Figueredo/);
 assert.doesNotMatch(html+app,/Gabriel Menezes/i);
 for(const tab of tabs){const page=render(tab).html;assert.match(page,/hero-davi\.webp|retratro-davi\.webp/,'portrait not integrated in '+tab);}
 assert.match(render('sobre').html,/portrait-panel/);
 assert.match(render('inicio').html,/projeto-w1capital\.webp/);
 assert.match(render('projetos').html,/gallery-grid/);
 assert.match(render('projetos').html,/projeto-autentica\.webp/);
 assert.match(render('competencias').html,/skills-gallery/);
 assert.match(render('contato').html,/contact-portrait/);
 assert.match(render('contato').html,/davialves\.figueredo@gmail\.com/);
 assert.match(render('formacao').html,/UNICID/);
 assert.doesNotMatch(app,/20\+ projetos|15\+ sites|3\+ anos/i);
});
