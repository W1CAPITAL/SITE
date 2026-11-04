import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");

test("W1 and LexisPredict logos use standalone vectors and preserve their aspect ratios",()=>{
 for(const [path,kind] of [
  ["assets/w1-symbol.svg","square"],
  ["assets/w1-wordmark.svg","horizontal"],
  ["assets/lexispredict-symbol.svg","square"],
  ["assets/lexispredict-wordmark.svg","horizontal"],
  ["assets/lexispredict-wordmark-light.svg","horizontal"],
 ]){
  assert.ok(existsSync(join(root,path)),path+" missing");
  const svg=read(path);
  assert.match(svg,/<svg\s[^>]*viewBox=/);
  assert.doesNotMatch(svg,/<script|<foreignObject|<image\s|(?:xlink:href|href)="https?:\/\//i);
  const match=svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  assert.ok(match,path+" missing numeric viewBox");
  const ratio=Number(match[1])/Number(match[2]);
  assert.ok(kind==="square"?ratio>0.98&&ratio<1.02:ratio>2.7,path+" ratio incorrect");
 }
});

test("both commercial pages load logo-integrity stylesheet last and never squash branding",()=>{
 const home=read("index.html");
 const product=read("lexispredict/index.html");
 for(const page of [home,product]){
  assert.match(page,/logo-integrity\.css\?v=20261104/);
  assert.match(page,/brand-atlas-w1-symbol/);
  assert.match(page,/brand-atlas-lexis-full/);
 }
 const css=read("sales/logo-integrity.css");
 assert.match(css,/background-size:\s*contain/);
 assert.match(css,/background-position:\s*center/);
 assert.match(css,/url\("\.\.\/assets\/w1-symbol\.svg"\)/);
 assert.match(css,/url\("\.\.\/assets\/lexispredict-wordmark\.svg"\)/);
 assert.match(css,/\.product-logo\.brand-atlas-lexis-full/);
 assert.match(css,/\.lp-gallery-header \.lp-gallery-logo/);
 assert.match(css,/\.footer-logo\.brand-atlas-w1-full/);
 assert.match(css,/@media\s*\(max-width:\s*600px\)/);
});
