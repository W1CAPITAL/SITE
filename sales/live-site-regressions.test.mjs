import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=(name)=>readFileSync(join(root,name),"utf8");
const home=read("index.html");
const script=read("sales/premium.js");
const css=read("sales/premium.css");
const landing=read("lexispredict/index.html");

test("W1 homepage has initial critical styling even when a mobile network delays stylesheets",()=>{
  // Screenshot 2026-11-04: user saw serif text and default purple links while assets loaded.
  const head=home.split("</head>")[0];
  assert.match(head,/<style[^>]*data-critical[^>]*>/i,"Embed a compact above-the-fold CSS fallback");
  assert.match(head,/font-family:\s*(?:Inter|system-ui|ui-sans-serif)/i);
  assert.match(head,/\.menu-toggle/);
  assert.match(head,/@media\s*\(max-width:\s*950px\)/);
  assert.match(head,/\.mobile-navigation\[hidden\]/);
});
test("mobile drawer is a real controlled sidebar with navigation to sales and contact",()=>{
  assert.match(home,/aria-controls="menu-mobile"/);
  assert.match(home,/id="menu-mobile"[^>]*hidden/);
  assert.match(home,/href="\.\/lexispredict\/"/);
  const drawer=home.match(/<nav id="menu-mobile"[\s\S]*?<\/nav>/)?.[0]||"";
  assert.match(drawer,/href="\.\/lexispredict\/"/);
  assert.match(drawer,/href="#solucoes"/);
  assert.match(drawer,/href="#atendimento"/);
  assert.match(script,/setMenuOpen\(false\)/);
  assert.match(script,/aria-expanded/);
  assert.match(script,/event\.key === "Escape"/);
  assert.match(css,/\.mobile-navigation\[hidden\]/);
});
test("desktop nav scroll observer never sends product URLs to querySelector",()=>{
  // Previously: document.querySelector("./lexispredict/") raises SyntaxError.
  assert.doesNotMatch(script,/document\.querySelector\(a\.getAttribute\("href"\)\)/);
  assert.match(script,/startsWith\("#"\)/);
});
test("W1 official contact channels exist on home and LexisPredict without automatic messaging",()=>{
  for(const [name,html] of [["home",home],["LexisPredict",landing]]){
    assert.match(html,/corporacaow1capital@gmail\.com/,name+" email");
    assert.match(html,/https:\/\/wa\.me\/5513991199349(?:\?|")/,name+" WhatsApp");
    assert.match(html,/WhatsApp/,name+" WhatsApp label");
  }
  assert.match(home,/mailto:corporacaow1capital@gmail\.com/);
  assert.match(landing,/mailto:corporacaow1capital@gmail\.com/);
  assert.doesNotMatch(home+landing,/wa\.me\/[^" ]*send=true/);
});
