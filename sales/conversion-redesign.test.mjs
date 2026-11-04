import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");
const home=read("index.html");
const landing=read("lexispredict/index.html");

test("new conversion-first homepage prioritizes demonstrations and a human WhatsApp channel",()=>{
  const hero=home.match(/<section class="hero section"[\s\S]*?<\/section>/)?.[0]||"";
  assert.match(hero,/Menos caos/);
  assert.match(hero,/href="\.\/lexispredict\/"/);
  assert.match(hero,/href="https:\/\/wa\.me\/5513991199349/);
  assert.match(hero,/Demonstração guiada/);
  assert.doesNotMatch(hero,/(?:\d{2,3}%|100% de resultados|clientes satisfeitos|ganho garantido)/i);
});
test("outcomes and product are explained without extra cognitive load",()=>{
  assert.match(home,/id="beneficios"/);
  const benefits=home.match(/<section[^>]*id="beneficios"[\s\S]*?<\/section>/)?.[0]||"";
  assert.match(benefits,/Processos/);
  assert.match(benefits,/Equipe/);
  assert.match(benefits,/Decisões/);
  assert.match(home,/id="featured-title"/);
  assert.match(home,/id="atendimento"/);
});
test("vibrant yet calm conversion design is loaded after the original CSS, with accessible responsive states",()=>{
  assert.match(home,/<link rel="stylesheet" href="\.\/sales\/conversion\.css\?v=[^"]+">/);
  assert.match(landing,/<link rel="stylesheet" href="\.\/conversion\.css\?v=[^"]+">/);
  const css=read("sales/conversion.css");
  const product=read("lexispredict/conversion.css");
  assert.match(css,/@media\s*\(max-width:\s*950px\)/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/\.top \.mobile-navigation:not\(\[hidden\]\)/);
  assert.match(css,/background:.*#f(?:f|a)/i);
  assert.match(product,/\.plan-grid/);
  assert.match(product,/@media\s*\(max-width:\s*780px\)/);
  assert.match(product,/prefers-reduced-motion/);
});
test("sales links remain functional and no user data is collected in the visual redesign",()=>{
  const sections=new Set([...home.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
  for(const id of [...home.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]))assert.ok(sections.has(id),"Missing home anchor "+id);
  const allowed=["./lexispredict/","mailto:corporacaow1capital@gmail.com","https://wa.me/5513991199349"];
  for(const link of allowed)assert.ok(home.includes(link), "Missing official CTA "+link);
  assert.match(landing,/corporacaow1capital@gmail\.com/);
  assert.doesNotMatch(read("sales/conversion.css")+read("lexispredict/conversion.css"),/@import|url\(['"]?https?:/i);
});
