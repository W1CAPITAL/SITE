import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const base=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(join(base,"index.html"),"utf8");
const css=readFileSync(join(base,"conversion.css"),"utf8");
const js=readFileSync(join(base,"vendas.js"),"utf8");
test("LexisPredict has accessible mobile navigation independent of a JavaScript runtime",()=>{
 assert.match(html,/<details class="mobile-shortcuts"/);
 assert.match(html,/<summary[^>]*aria-label="Abrir navegação"/);
 for(const hash of ["#recursos","#planos","#como-funciona","#demonstracao"]){
  assert.match(html,new RegExp('href="'+hash+'"'));
  assert.ok(html.includes('id="'+hash.slice(1)+'"'));
 }
 assert.match(css,/@media\s*\(max-width:\s*780px\)/);
 assert.match(css,/\.mobile-shortcuts/);
 assert.match(css,/\.mobile-shortcuts\[open\]/);
});
test("menu does not obscure the contact call to action and closes after navigation",()=>{
 assert.match(html,/class="top-cta" href="https:\/\/calendly\.com\/daviconcentrix\/demonstracao-lexispredict-w1-capital"/);
 assert.match(html,/href="#demonstracao">Solicitar demonstração/);
 assert.match(js,/mobile-shortcuts/);
 assert.match(js,/shortcuts\.open = false/);
 assert.match(js,/event\.key === "Escape"/);
 assert.doesNotMatch(js,/\bfetch\s*\(/);
});
