import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const home=read("index.html"),css=read("sales/refined.css");

test("single visual system, not accumulated template layers",()=>{
 const links=[...home.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(links.length,1,"homepage should load one CSS system");
 assert.match(links[0],/^\.\/sales\/refined\.css\?v=/);
 assert.doesNotMatch(home,/<script[^>]+(?:chatbot|analytics|tracking)/i);
 assert.doesNotMatch(css,/@import\s/);
 assert.doesNotMatch(css,/url\((["']?)https?:/);
});

test("short, image-backed hero and clear single primary sales path",()=>{
 const hero=home.match(/<section class="hero section"[\s\S]*?<\/section>/)?.[0]||"";
 assert.match(hero,/<h1[^>]+id="hero-heading"/);
 assert.match(hero,/<img[^>]+class="hero-photo"/);
 assert.match(hero,/Imagem ilustrativa/);
 assert.match(hero,/href="\.\/lexispredict\/"/);
 assert.match(hero,/href="https:\/\/wa\.me\/5513991199349/);
 assert.match(hero,/Demonstração|demonstração/);
 assert.match(css,/\.hero-photo/);
 assert.match(css,/@media\s*\(max-width:\s*760px\)/);
 assert.doesNotMatch(hero,/clientes satisfeitos|100%|garantia de resultado|depoimentos de clientes/i);
});

test("capabilities appear ahead of product narrative and do not overpromise",()=>{
 const ids=["conteudo","inicio","solucoes","catalogo","lexispredict","metodo","agentes","atendimento","faq","menu-mobile","year"];
 for(const id of ids) assert.match(home,new RegExp('id="'+id+'"'));
 assert.ok(home.indexOf('id="solucoes"') < home.indexOf('id="lexispredict"'));
 assert.match(home,/brand-atlas-w1-symbol/);
 assert.match(home,/brand-atlas-w1-full/);
 assert.match(home,/brand-atlas-lexis-full/);
 assert.match(home,/brand-atlas-lexis-symbol/);
 assert.match(home,/assets\/w1-pessoas-ficticias\.svg/);
 assert.doesNotMatch(home,/Pexels|Unsplash/);
});

test("consultation remains functional yet secondary to direct human contact",()=>{
 for(const id of ["step-body","step-number","progress-bar","next","back","summary-need","summary-product","process-stage","process-title","process-description"]){
  assert.match(home,new RegExp('id="'+id+'"'));
 }
 assert.match(home,/corporacaow1capital@gmail\.com/);
 assert.match(home,/https:\/\/wa\.me\/5513991199349/);
 assert.match(home,/class="consultation-details"/);
 assert.match(css,/\.consultation-details/);
});

test("mobile navigation and reduced motion work without heavy dependencies",()=>{
 assert.match(home,/<style data-critical>/);
 assert.match(home,/aria-controls="menu-mobile"/);
 assert.match(home,/aria-expanded="false"/);
 assert.match(home,/class="menu-toggle"/);
 assert.match(css,/\.mobile-navigation\[hidden\]/);
 assert.match(css,/\.top \.mobile-navigation:not\(\[hidden\]\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/scroll-margin-top/);
 assert.match(css,/\.top/);
});
