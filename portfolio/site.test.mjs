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
