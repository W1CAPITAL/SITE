import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");

test("example report is clearly fictitious, demonstrates tangible deliverables, and does not promise case outcomes",()=>{
 const html=read("exemplo-relatorio/index.html");
 assert.match(html,/<html lang="pt-BR">/);
 assert.match(html,/<h1\b/);
 assert.match(html,/Exemplo fictício/i);
 assert.match(html,/Relatório de acompanhamento/i);
 for(const term of ["EX-001","EX-002","EX-003","Pendências","Responsável","Modelo de retorno","Revisão do escritório"]){
  assert.ok(html.includes(term),term+" missing from example");
 }
 assert.match(html,/dados fictícios/i);
 assert.match(html,/não representa|não corresponde/i);
 assert.doesNotMatch(html,/cliente verdadeiro|processo real|resultado garantido|taxa de êxito garantida|100% de sucesso/i);
 assert.doesNotMatch(html,/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/,"no real-looking CNJ number");
});
test("sample is lightweight, printable, responsive, and does not collect data",()=>{
 const html=read("exemplo-relatorio/index.html");
 assert.match(html,/<meta name="viewport"/);
 assert.match(html,/<button[^>]+onclick="window\.print\(\)"/);
 assert.match(html,/@media print/);
 assert.match(html,/@media\(max-width:7/);
 assert.doesNotMatch(html,/<form\b|localStorage|sessionStorage|fetch\s*\(|document\.cookie|sendBeacon|<iframe\b/i);
 assert.ok(Buffer.byteLength(html)<27000,"too heavy for a free public preview");
});
test("sales funnel exposes sample from operational page, with booking and organic indexing",()=>{
 const html=read("exemplo-relatorio/index.html");
 const ops=read("operacao/index.html"),site=read("sitemap.xml");
 assert.match(ops,/href="\.\.\/exemplo-relatorio\/"/);
 assert.match(html,/href="\.\.\/operacao\/"/);
 assert.match(html,/https:\/\/calendly\.com\/daviconcentrix\/apoio-a-carteira-processual-w1-capital/);
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.match(site,/<loc>https:\/\/w1-capital-sales\.pages\.dev\/exemplo-relatorio\/<\/loc>/);
 assert.match(html,/rel="canonical" href="https:\/\/w1-capital-sales\.pages\.dev\/exemplo-relatorio\/"/);
});
