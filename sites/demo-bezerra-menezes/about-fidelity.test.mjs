import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const dir=dirname(fileURLToPath(import.meta.url));
const app=readFileSync(join(dir,'app.js'),'utf8'),css=readFileSync(join(dir,'style.css'),'utf8');
function render(page){
  let ready;
  const mount={innerHTML:''};
  const document={documentElement:{dataset:{page},classList:{add(){}}},title:'',addEventListener(k,cb){if(k==='DOMContentLoaded')ready=cb},getElementById(k){return k==='site-app'?mount:null},querySelector(){return null},querySelectorAll(){return []}};
  vm.runInNewContext(app,{document,window:{matchMedia:()=>({matches:true})}},{timeout:2000});
  ready();
  return mount.innerHTML;
}
test('About page identifies the woman as Dra. Bezerra Menezes, not Dr.',()=>{
 const html=render('sobre');
 assert.match(html,/Dra\. Bezerra Menezes/);
 assert.match(html,/Advogada e Fundadora/);
 assert.doesNotMatch(html,/\bDr\. Bezerra Menezes/);
});
test('About uses three visually distinct regions, without repeating portrait and manifesto backgrounds',()=>{
 const html=render('sobre');
 assert.match(html,/hero-sobre\.webp/);
 assert.match(html,/manifesto-sobre\.webp/);
 assert.match(html,/portrait-sobre\.webp/);
 for(const asset of ['hero-sobre.webp','manifesto-sobre.webp','portrait-sobre.webp']){
  assert.ok(existsSync(join(dir,'assets',asset)),asset);
 }
});
test('Outlined icons are genuine SVGs, not font glyphs or emoji',()=>{
 const html=render('sobre');
 assert.match(html,/<svg\b/);
 assert.match(html,/stroke="currentColor"/);
 assert.doesNotMatch(html,/class="icon"[^>]*>[♞♧◇⌕▤]/);
});
test('Buttons are rounded and scale sensibly',()=>{
 assert.match(css,/\.btn[^{}]*\{[^}]*border-radius:\s*(?:999px|2[0-9]px|3[0-9]px)/s);
 assert.match(css,/\.nav-cta[^{}]*\{[^}]*border-radius:\s*(?:999px|2[0-9]px|3[0-9]px)/s);
 assert.match(css,/@media\(max-width:640px\)/);
});
