import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>readFileSync(join(root,p),"utf8");
const home=read("index.html");
const landing=read("lexispredict/index.html");
const css=read("sales/premium.css");
const landingCss=read("lexispredict/vendas.css");
const atlas=readFileSync(join(root,"assets/w1-lexis-atlas.webp"));
test("approved logo image is an optimized valid WebP image",()=>{
  assert.equal(atlas.toString("ascii",0,4),"RIFF");
  assert.equal(atlas.toString("ascii",8,12),"WEBP");
  assert.ok(atlas.length>2000&&atlas.length<50000);
});
test("homepage uses W1 logo instead of a text-only temporary square, and LexisPredict logo in feature section",()=>{
  assert.match(home,/brand-atlas-w1-symbol/);
  assert.match(home,/brand-atlas-w1-full/);
  assert.match(home,/brand-atlas-lexis-full/);
  assert.match(home,/brand-atlas-lexis-symbol/);
  assert.match(home,/<style data-critical>[\s\S]*brand-atlas-w1-symbol/);
  assert.match(css,/background-image:\s*url\(["']?\.\.\/assets\/w1-lexis-atlas\.webp/);
});
test("LexisPredict sales page shows brand logos in header, preview, footer",()=>{
  assert.match(landing,/brand-atlas-w1-symbol/);
  assert.match(landing,/brand-atlas-w1-full/);
  assert.match(landing,/brand-atlas-lexis-full/);
  assert.match(landing,/brand-atlas-lexis-symbol/);
  assert.match(landingCss,/background-image:\s*url\(["']?\.\.\/assets\/w1-lexis-atlas\.webp/);
  assert.match(landing,/corporacaow1capital@gmail\.com/);
});
