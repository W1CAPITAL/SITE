import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {makeDemoRequest,SALES_EMAIL,PLAN_CHOICES} from "./vendas.js";
const dir=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(join(dir,"index.html"),"utf8");
const css=readFileSync(join(dir,"vendas.css"),"utf8");
const script=readFileSync(join(dir,"vendas.js"),"utf8");
const homepage=readFileSync(join(dir,"../index.html"),"utf8");
const draft={nome:"Ana Silva",empresa:"Escritório Exemplo",email:"ana@example.org",plano:"Essencial",desafio:"Precisamos organizar tarefas e retornos de processos.",consent:true};

test("creates a real manual email request rather than claiming to store or send a lead",()=>{
 const r=makeDemoRequest(draft);
 assert.equal(SALES_EMAIL,"corporacaow1capital@gmail.com");
 assert.match(r.subject,/LexisPredict/);
 assert.match(r.body,/Escritório Exemplo/);
 assert.match(r.body,/Ana Silva/);
 assert.match(r.body,/organizar tarefas/);
 assert.match(r.mailto,/^mailto:corporacaow1capital@gmail\.com\?/);
 const url=new URL(r.mailto);
 assert.equal(url.searchParams.get("subject"),r.subject);
 assert.equal(url.searchParams.get("body"),r.body);
 assert.equal(Object.hasOwn(r,"sent"),false);
});
test("requires useful information and an explicit request for contact",()=>{
 for(const value of [{...draft,nome:"A"},{...draft,consent:false},{...draft,plano:"premium"},{...draft,email:"not email"},{...draft,desafio:"curto"}]){
 assert.throws(()=>makeDemoRequest(value));
 }
 assert.deepEqual(PLAN_CHOICES,["Essencial","Financeiro","Operacional","Máximo","Ainda não sei"]);
});
test("does not put injected HTML into the site or execute user input",()=>{
 const r=makeDemoRequest({...draft,nome:'<img src=x onerror=alert(1)>',empresa:"Empresa X"});
 assert.match(r.body,/<img src=x/); // Only a string in the outgoing draft.
 assert.doesNotMatch(script,/innerHTML|document\.write|eval\(/);
 assert.match(script,/\.value=/);
 assert.doesNotMatch(script,/\bfetch\s*\(|\bWebSocket\b|\blocalStorage\b|\bsessionStorage\b/);
 assert.match(script,/Nenhuma solicitação foi enviada/);
 assert.match(html,/envio depende da confirmação/);
});
test("landing is accessible, honest about terms, and directly linked by homepage",()=>{
 assert.match(html,/<html lang="pt-BR">/);
 assert.match(html,/<h1>/);
 assert.match(html,/role="status"/);
 assert.match(html,/autocomplete="email"/);
 assert.match(html,/type="email"/);
 assert.match(html,/type="checkbox" required/);
 assert.match(html,/Não corresponde a uma captura de dados reais/);
 assert.match(html,/implantação.*referência de R\$ 490/i);
 assert.match(html,/R\$ 197/);
 assert.match(html,/R\$ 297/);
 assert.match(html,/R\$ 397/);
 assert.match(html,/R\$ 597/);
 assert.match(html,/não recebe pagamentos/i);
 assert.match(html,/copie o texto abaixo/i);
 assert.match(html,/corporacaow1capital@gmail.com/);
 assert.match(homepage,/href="\.\/lexispredict\/"/);
 assert.doesNotMatch(css,/url\(https?:/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
 for(const id of [...html.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]))
  assert.ok(ids.has(id),"Missing landing anchor "+id);
});
