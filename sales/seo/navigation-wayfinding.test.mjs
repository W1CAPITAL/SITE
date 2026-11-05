import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=path=>readFileSync(join(root,path),"utf8");
const home=read("index.html");
const script=read("sales/premium.js");
const routes=["lexispredict/","operacao/","diagnostico/","guia/","exemplo-relatorio/","parcerias/","explorar/"];

test("a visible desktop disclosure exposes all existing public paths",()=>{
  const desktop=home.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)?.[0]||"";
  const grouped=desktop.match(/<details class="w1-mega-nav">[\s\S]*?<\/details>/)?.[0]||"";
  assert.match(grouped,/<summary[^>]*>Explorar tudo/);
  for(const route of routes) {
    assert.ok(existsSync(join(root,route,"index.html")),route+" must resolve");
    const href=route==="operacao/"?'./operacao/#piloto':'./'+route;
    assert.ok(grouped.includes('href="'+href+'"'),"missing header link for "+route);
  }
  assert.match(grouped,/calendly\.com\/daviconcentrix\/demonstracao-lexispredict-w1-capital/);
  assert.match(grouped,/href="\.\/assets\/w1-carrossel-operacao\.pdf"/);
  assert.match(grouped,/target="_blank" rel="noopener noreferrer"/);
});

test("the first visible content offers routes to product, free tool, service and checklist",()=>{
  const main=home.indexOf('<main id="conteudo">');
  const strip=home.indexOf('class="w1-choice-strip"');
  const hero=home.indexOf('class="hero section"');
  assert.ok(main>=0&&strip>main&&strip<hero,"quick choices should precede the hero");
  const block=home.match(/<section class="w1-choice-strip"[\s\S]*?<\/section>/)?.[0]||"";
  for(const href of ["./lexispredict/","./diagnostico/","./operacao/#piloto","./guia/"]){
    assert.ok(block.includes('href="'+href+'"'),"missing high-visibility action "+href);
  }
  assert.doesNotMatch(block,/href="#"|href="javascript:/);
});

test("new navigation works without JS, adapts to mobile and closes gracefully with JS",()=>{
  assert.match(home,/<style data-wayfinding>/);
  assert.match(home,/\.w1-mega-nav summary:focus-visible/);
  assert.match(home,/@media\(max-width:950px\)/);
  assert.match(home,/\.w1-choice-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(home,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(script,/const resourceMenu = \$\("\.w1-mega-nav"\)/);
  assert.match(script,/resourceMenu\.open = false/);
  assert.match(script,/event\.key === "Escape"/);
  assert.equal([...home.matchAll(/<link rel="stylesheet"/g)].length,1);
});
