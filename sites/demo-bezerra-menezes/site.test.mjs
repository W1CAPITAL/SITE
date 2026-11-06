import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const base=path.dirname(new URL(import.meta.url).pathname);
const code=fs.readFileSync(path.join(base,'app.js'),'utf8');
const css=fs.readFileSync(path.join(base,'style.css'),'utf8');
const pages=['inicio','sobre','atuacao','diferenciais','como-funciona','contato'];
function render(page){
 let domReady;
 const root={innerHTML:''};
 const doc={
   documentElement:{dataset:{page},classList:{add(){}}},
   title:'',
   addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')domReady=fn},
   getElementById:(name)=>name==='site-app'?root:null,
   querySelector:()=>null,
   querySelectorAll:()=>[]
 };
 const window={matchMedia:()=>({matches:true})};
 vm.runInNewContext(code,{document:doc,window}, {timeout:2000,filename:'app.js'});
 assert.equal(typeof domReady,'function');
 domReady();
 return {html:root.innerHTML,doc};
}
test('six standalone HTML routes exist',()=>{
 for(const page of pages){
   const dir=page==='inicio'?base:path.join(base,page);
   const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
   assert.match(html,new RegExp('data-page="'+page+'"'));
   assert.match(html,/<meta name="viewport"/);
   assert.match(html,/<script defer src=/);
 }
});
test('all pages render with native navigation and unique active tab',()=>{
 for(const page of pages){
  const {html,doc}=render(page);
  assert.ok(html.length>4000,page);
  assert.match(html,/<main id="conteudo">/);
  assert.match(html,/<header class="site-header">/);
  assert.match(html,/<footer class="footer">/);
  assert.match(html,/<a class="btn gold"/);
  assert.match(html,/<button class="menu-toggle"/);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1,page);
  assert.ok(doc.title.includes('Bezerra Menezes'),page);
 }
});
test('each hero uses its own supplied visual crop',()=>{
 for(const page of pages){
  const {html}=render(page);
  assert.ok(html.includes('hero-'+page+'.webp'),page);
  assert.ok(fs.existsSync(path.join(base,'assets','hero-'+page+'.webp')),page);
  assert.ok(fs.existsSync(path.join(base,'assets','band-'+page+'.webp')),page);
 }
 assert.ok(fs.existsSync(path.join(base,'assets','logo-bm.webp')));
 assert.ok(fs.existsSync(path.join(base,'assets','portrait-sobre.webp')));
});
test('contact and homepage use real non-submitting form elements',()=>{
 for(const page of ['inicio','contato']){
  const {html}=render(page);
  assert.match(html,/<form class="demo-form"/);
  assert.match(html,/<textarea[^>]+required/);
  assert.match(html,/<input[^>]+type="email"[^>]+required/);
  assert.match(html,/<button class="btn gold full" type="submit">/);
  assert.ok(!/<form[^>]+action=/.test(html));
 }
 assert.ok(!/\bfetch\s*\(/.test(code));
 assert.ok(!/XMLHttpRequest/.test(code));
});
test('responsive zoom support and reduced-motion preference',()=>{
 assert.match(css,/@media\(max-width:920px\)/);
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css, /prefers-reduced-motion:reduce/);
 assert.match(css, /\.nav-list\.open/);
 assert.match(css, /max-width:100%/);
});
test('user manifesto is present as real selectable text',()=>{
 const html=render('inicio').html;
 assert.match(html,/Mais do que defender direitos/);
 assert.match(html,/ética, estratégia e dedicação/);
 assert.match(html,/<q>/);
});
