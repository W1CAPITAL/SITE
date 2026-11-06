import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const script=fs.readFileSync(path.join(root,'app.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'style.css'),'utf8');
const pages=['inicio','sobre','atuacao','diferenciais','como-funciona','contato'];

function render(page) {
  let ready;
  const el={innerHTML:''};
  const document={
    title:'',documentElement:{dataset:{page},classList:{add(){}}},
    addEventListener(event,fn){if(event==='DOMContentLoaded')ready=fn},
    getElementById(id){return id==='site-app'?el:null},
    querySelector(){return null}, querySelectorAll(){return []},
  };
  vm.runInNewContext(script,{document,window:{matchMedia:()=>({matches:true})}},{timeout:2000});
  ready();
  return el.innerHTML;
}
test('every page consistently renders named bespoke gold-line SVG icons',()=>{
  const all=new Set();
  for (const page of pages) {
    const html=render(page);
    const icons=[...html.matchAll(/<svg\b[^>]*data-bm-icon="([^"]+)"[^>]*>/g)].map(m=>m[1]);
    assert.ok(icons.length>=8,`${page} rendered only ${icons.length} named icons`);
    for (const name of icons){assert.match(name,/^[a-z]+(?:-[a-z]+)*$/);all.add(name);}
    assert.doesNotMatch(html,/<span class="icon"[^>]*>[^<]+<\/span>/);
  }
  assert.ok(all.size>=18,`Only ${all.size} different icon designs`);
});
test('legal areas and founder have appropriate recognizable icon meaning',()=>{
  const services=render('atuacao');
  assert.match(services,/data-bm-icon="scale"/);
  assert.match(services,/data-bm-icon="users-round"/);
  assert.match(services,/data-bm-icon="briefcase-business"/);
  assert.match(services,/data-bm-icon="file-text"/);
  const founder=render('sobre');
  assert.match(founder,/data-bm-icon="graduation-cap"/);
  assert.match(founder,/data-bm-icon="shield-check"/);
});
test('real contact and menu controls have SVG symbols instead of Unicode pseudo-icons',()=>{
  const contact=render('contato');
  assert.match(contact,/data-bm-icon="phone"/);
  assert.match(contact,/data-bm-icon="mail"/);
  assert.match(contact,/data-bm-icon="map-pin"/);
  assert.match(contact,/data-bm-icon="menu"/);
  assert.doesNotMatch(contact,/Menu ☰|Fechar ✕|class="icon">[♧⚖◇⌕]/);
});
test('icon plates and buttons maintain coherent premium dimensions across zoom breakpoints',()=>{
 assert.match(styles,/\.icon-frame\s*\{/);
 assert.match(styles,/\.icon-frame \.icon\s*\{/);
 assert.match(styles,/\.nav-list\.open/);
 assert.match(styles,/@media\(max-width:640px\)/);
 assert.match(styles, /prefers-reduced-motion:reduce/);
});
