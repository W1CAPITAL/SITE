import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const expected="https://calendly.com/daviconcentrix/demonstracao-lexispredict-w1-capital";
test("W1 site offers a real bookable LexisPredict 15-minute meeting",()=>{
 const paths=["index.html","lexispredict/index.html","guia/index.html","diagnostico/index.html"];
 for(const path of paths){
  const html=read(path);
  assert.ok(html.includes(expected),"missing scheduling link in "+path);
  assert.match(html,/Agendar (uma )?demonstração|Reservar 15 minutos|Agendar conversa/i);
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 }
});
test("booking is a separate authorized flow; the site does not claim a confirmed sale",()=>{
 const html=read("lexispredict/index.html");
 assert.match(html,/15 minutos/);
 assert.match(html,/sem compromisso|gratuita/i);
 assert.match(html,/dados fictícios/i);
 assert.doesNotMatch(html,/compra confirmada|cliente pagante confirmado|pagamento aprovado/i);
});
