import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const pdf=readFileSync(join(root,"assets/w1-carrossel-operacao.pdf"));
test("published marketing PDF is valid, self-contained and has five slides",()=>{
 assert.equal(pdf.subarray(0,8).toString("latin1"),"%PDF-1.4");
 assert.match(pdf.toString("latin1").slice(-100),/%%EOF/);
 assert.equal((pdf.toString("latin1").match(/\/Type \/Page\b/g)||[]).length,5);
 assert.ok(pdf.length<100000,"mobile-friendly file size");
});
test("link is discoverable in operational offering",()=>{
 const html=readFileSync(join(root,"operacao/index.html"),"utf8");
 assert.match(html,/href="\.\.\/assets\/w1-carrossel-operacao\.pdf"/);
 assert.match(html,/Apresentação visual em PDF/);
 assert.match(html,/download/);
});
