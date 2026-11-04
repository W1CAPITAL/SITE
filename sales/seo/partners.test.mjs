import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");
test("public partner page is an invitation, not a fictitious paid affiliate programme",()=>{
 const html=read("parcerias/index.html");
 assert.match(html,/<html lang="pt-BR">/);
 assert.match(html,/<h1/);
 assert.match(html,/Parcerias|colaboração/i);
 for(const term of ["Legal Ops","Consultorias","Tecnologia jurídica","conteúdo","15 minutos","18h30 às 21h"]){
  assert.ok(html.includes(term),"Missing "+term);
 }
 assert.match(html,/comiss(ão|ões)/i);
 assert.match(html,/não existe|não há/i);
 assert.doesNotMatch(html,/ganhe comissões|ganhos garantidos|programa de afiliados ativo|parceria garantida|clientes confirmados/i);
 assert.ok(!/<form\b/i.test(html),"No collection of prospects' personal data");
});
test("partner page offers real qualified bookable follow-up and discloses scope",()=>{
 const html=read("parcerias/index.html");
 assert.match(html,/https:\/\/calendly\.com\/daviconcentrix\/parcerias-de-gestao-juridica-w1-capital/);
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.match(html,/href="\.\.\/lexispredict\/"/);
 assert.match(html,/href="\.\.\/operacao\/"/);
 assert.match(html,/dados fictícios/i);
 assert.match(html,/sem acesso a dados reais/i);
 assert.match(html,/@media\(max-width:7/);
});
test("partners can discover opportunity organically",()=>{
 assert.match(read("index.html"),/href="\.\/parcerias\/"/);
 assert.match(read("operacao/index.html"),/href="\.\.\/parcerias\/"/);
 assert.match(read("sitemap.xml"),/<loc>https:\/\/w1-capital\.onrender\.com\/parcerias\/<\/loc>/);
 assert.match(read("parcerias/index.html"),/rel="canonical" href="https:\/\/w1-capital\.onrender\.com\/parcerias\/"/);
});
