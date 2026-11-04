import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const home=read("index.html");
const product=read("lexispredict/index.html");
const siteCSS=read("sales/refined.css");
const app=read("sales/app.js");

test("human-focused W1 presentation with clear calls to action",()=>{
 const hero=home.match(/<section class="hero section"[\s\S]*?<\/section>/)?.[0]||"";
 assert.match(hero,/Estratégia, tecnologia e clareza/);
 assert.match(hero,/class="hero-photo"/);
 assert.match(hero,/Imagem gerada digitalmente/);
 assert.match(hero,/href="#solucoes"/);
 assert.match(home,/href="\.\/lexispredict\/"/);
 assert.match(hero,/href="https:\/\/wa\.me\/5513991199349/);
 assert.match(hero,/Demonstração guiada/);
 assert.doesNotMatch(hero,/clientes satisfeitos|ganho garantido|100% de resultados/i);
});
test("three tangible benefits and a compact featured software offer",()=>{
 assert.match(home,/id="beneficios"/);
 const area=home.match(/<section class="impact-zone"[\s\S]*?<\/section>/)?.[0]||"";
 for(const item of ["Processos","Equipe","Decisões"])assert.match(area,new RegExp(item));
 assert.match(home,/id="lexispredict"/);
 assert.match(home,/id="featured-title"/);
 assert.match(home,/FLUXO ILUSTRATIVO/);
 assert.match(app,/product--/);
 assert.match(app,/Conhecer o LexisPredict/);
});
test("one cohesive style, mobile behavior and reduced motion",()=>{
 assert.match(home,/href="\.\/sales\/refined\.css\?v=[^"]+"/);
 assert.doesNotMatch(home,/<link rel="stylesheet" href="\.\/sales\/(?:studio|premium|conversion|styles)\.css/);
 assert.match(siteCSS,/@media\(max-width:950px\)/);
 assert.match(siteCSS,/@media\(max-width:760px\)/);
 assert.match(siteCSS,/prefers-reduced-motion/);
 assert.match(siteCSS,/\.mobile-navigation\[hidden\]/);
 assert.match(product,/href="\.\/conversion\.css/);
 assert.doesNotMatch(siteCSS,/@import/i);
});
test("safe lead conversion and no invented sales performance",()=>{
 for(const link of ["./lexispredict/","mailto:corporacaow1capital@gmail.com","https://wa.me/5513991199349"])assert.ok(home.includes(link));
 const sections=new Set([...home.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
 for(const hash of [...home.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]))assert.ok(sections.has(hash),"Anchor "+hash+" missing");
 assert.doesNotMatch(home,/vendas realizadas|clientes satisfeitos|NPS|reduz em [0-9]+%/i);
 assert.match(home,/não representa a equipe W1/);
 assert.match(app,/consultation\.open=true/);
 assert.match(app,/raw\.get\("consent"\)/);
});
