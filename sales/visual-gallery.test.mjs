import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root,path),"utf8");

test("hero retains the local fictional-person asset without external portrait services",()=>{
 const html=read("index.html");
 assert.match(html,/assets\/w1-hero-ficticia\.webp/);
 const asset=join(root,"assets/w1-hero-ficticia.webp");
 assert.ok(existsSync(asset));
 const b=readFileSync(asset);
 assert.equal(b.toString("ascii",0,4),"RIFF");
 assert.equal(b.toString("ascii",8,12),"WEBP");
 assert.match(html,/class="hero-photo"[^>]*width="560" height="356"/);
 assert.match(html,/Personagem fictícia/);
});

test("both commercial pages demonstrate the app visually with privacy-safe labeled illustrations",()=>{
 const homepage=read("index.html");
 const lexis=read("lexispredict/index.html");
 for(const [path,token] of [
  ["assets/lexis-dashboard-preview.svg","Visão geral"],
  ["assets/lexis-processos-preview.svg","Carteira processual"],
  ["assets/lexis-tarefas-preview.svg","Tarefas e agenda"],
 ]) {
  assert.ok(existsSync(join(root,path)),path+" missing");
  const svg=read(path);
  assert.match(svg,/<svg /);
  assert.match(svg,/Dados fictícios/);
  assert.match(svg,new RegExp(token));
  assert.doesNotMatch(svg,/<script|<foreignObject|(?:href|src)=["\x27]https?:\/\//i);
 }
 for(const page of [homepage,lexis]){
  assert.match(page,/lexis-dashboard-preview\.svg/);
  assert.match(page,/lexis-processos-preview\.svg/);
  assert.match(page,/lexis-tarefas-preview\.svg/);
  assert.match(page,/Prévia ilustrativa|Prévias ilustrativas/);
  assert.doesNotMatch(page, /https:\/\/images\.pexels\.com/i);
 }
 assert.match(homepage,/id="vitrine-lexis"/);
 assert.match(lexis,/id="telas"/);
 assert.match(homepage,/visual-gallery\.js/);
 assert.match(lexis,/visual-gallery\.js/);
 const controls=read("sales/visual-gallery.js");
 assert.match(controls,/aria-pressed/);
 assert.match(controls,/showModal/);
 assert.match(controls,/\.dataset\.previewSrc/);
 assert.match(read("sales/refined.css"),/@media\(max-width:460px\)/);
 assert.match(read("sales/refined.css"),/\.lp-screen-showcase/);
 assert.match(read("lexispredict/conversion.css"),/\.lp-screen-gallery/);
});
