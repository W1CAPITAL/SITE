import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");

test("preview navigation follows the authentic LexisPredict app, not invented generic SaaS labels",()=>{
 const s=read("sales/interactive-demo.mjs");
 for(const [key,label] of [
  ["overview","Início"],["processes","Processos da Empresa"],["tasks","Hoje"],
  ["calendar","Agenda"],["reports","Relatórios"],["team","Equipe"],["settings","Configurações"]]){
  assert.match(s,new RegExp(key+':"'+label+'"'));
 }
 for(const route of ["/","/processos","/tarefas","/agenda","/report","/team","/settings"]){
  assert.ok(s.includes('"'+route+'"'),"missing actual official app route "+route);
 }
 assert.match(s,/Visão da carteira/);
 assert.match(s,/Fila de contato|Fila de atendimento/);
 assert.match(s,/Dados fictícios/i);
});

test("mini preview uses the real LexisPredict visual language: navy sidebar and light panels",()=>{
 for(const path of ["sales/refined.css","lexispredict/conversion.css"]){
  const s=read(path);
  assert.match(s,/\.lexis-live-demo/);
  assert.match(s,/#061d35/i,"navy sidebar from LexisPredict source");
  assert.match(s,/#f6f7fc/i,"light app background from official interface");
  assert.match(s,/@media\s*\(max-width:620px\)/);
  assert.match(s,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(s.slice(s.indexOf("/* LexisPredict public interactive demo.")),/#[1-9a-f]{3,6}[^;\n]*\b(?:hotpink|deeppink)\b/i);
 }
});

test("preview remains static-site friendly and small, without React or external data",()=>{
 const s=read("sales/interactive-demo.mjs");
 const model=read("sales/interactive-demo-model.mjs");
 assert.ok(Buffer.byteLength(s,"utf8")<19000,"preview JS bundle grew too large");
 assert.ok(Buffer.byteLength(model,"utf8")<7500,"pure demonstration model grew too large");
 assert.doesNotMatch(s,/from\s+["'](?:react|next|recharts)|fetch\s*\(|localStorage|supabase/i);
 for(const p of ["index.html","lexispredict/index.html"]){
  const html=read(p);
  assert.match(html,/interactive-demo\.mjs/);
  assert.match(html,/LexisPredict oficial|app oficial|aplicativo oficial/i);
 }
});
