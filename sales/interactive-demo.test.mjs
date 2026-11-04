import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {createDemoState,updateDemoState,selectProcesses,demoMetrics,TABS} from "./interactive-demo-model.mjs";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");

test("every sidebar tab is a valid interactive destination",()=>{
 assert.deepEqual(TABS,["overview","processes","tasks","calendar","reports","team","settings"]);
 for(const tab of TABS){
  const result=updateDemoState(createDemoState(),{type:"navigate",tab});
  assert.equal(result.activeTab,tab);
 }
});

test("process search and filters change the displayed results without altering the source",()=>{
 const state=createDemoState();
 const matches=selectProcesses(state,{status:"Em andamento",query:"exemplo a"});
 assert.ok(matches.length>0);
 assert.ok(matches.every(p=>p.status==="Em andamento"&&p.client.toLowerCase().includes("exemplo a")));
 assert.equal(selectProcesses(state,{query:"não existe"}).length,0);
 assert.equal(state.processes.length,5);
});

test("tasks actually change completion status and overview metrics",()=>{
 const state=createDemoState();
 const task=state.tasks.find(t=>!t.completed);
 const before=demoMetrics(state);
 const next=updateDemoState(state,{type:"toggleTask",id:task.id});
 assert.equal(next.tasks.find(t=>t.id===task.id).completed,true);
 assert.equal(demoMetrics(next).pendingTasks,before.pendingTasks-1);
 assert.equal(demoMetrics(next).completedTasks,before.completedTasks+1);
 assert.equal(state.tasks.find(t=>t.id===task.id).completed,false);
});

test("demo can create process, task and appointment without external storage",()=>{
 let s=createDemoState();
 s=updateDemoState(s,{type:"addProcess",client:"Empresa fictícia teste",subject:"Teste interno"});
 assert.equal(s.processes.length,6);
 s=updateDemoState(s,{type:"addTask",title:"Revisar minuta de teste",assignee:"Equipe 01"});
 assert.equal(s.tasks.length,6);
 s=updateDemoState(s,{type:"addEvent",title:"Reunião simulada",date:"2026-11-20"});
 assert.equal(s.events.length,5);
 assert.equal(updateDemoState(s,{type:"reset"}).tasks.length,5);
 assert.equal(updateDemoState(s,{type:"reset"}).processes.length,5);
});

test("reject invalid input, unknown IDs and prototype-like tab names",()=>{
 const state=createDemoState();
 assert.throws(()=>updateDemoState(state,{type:"addTask",title:"  ",assignee:"Equipe 01"}));
 assert.throws(()=>updateDemoState(state,{type:"addProcess",client:"",subject:"Teste"}));
 assert.throws(()=>updateDemoState(state,{type:"navigate",tab:"__proto__"}));
 assert.throws(()=>updateDemoState(state,{type:"toggleTask",id:"unknown"}));
 assert.equal(updateDemoState(state,{type:"compact",value:true}).compact,true);
});

test("both site pages load the interactive demo, with no real client data",()=>{
 const home=read("index.html"), product=read("lexispredict/index.html");
 for(const page of [home,product]){
  assert.match(page,/interactive-demo\.mjs\?v=/);
  assert.match(page,/refined\.css\?v=20261104-ops1|conversion\.css\?v=20261104-ops1/);
  assert.match(page,/data-lexis-gallery/);
  assert.match(page,/Dados fictícios|dados fictícios/);
 }
 const js=read("sales/interactive-demo.mjs");
 const css=read("sales/interactive-demo.css");
 for(const feature of ["overview","processes","tasks","calendar","reports","team","settings"]){
  assert.match(js,new RegExp(feature));
 }
 assert.match(js,/aria-current/);
 assert.match(js,/data-demo-action/);
 assert.match(js,/addEventListener/);
 assert.match(js,/escapeHtml/);
 assert.match(css,/@media\s*\(max-width:\s*620px\)/);
 assert.match(read("sales/refined.css"),/\.lexis-live-demo/);
 assert.match(read("lexispredict/conversion.css"),/\.lexis-live-demo/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|supabase|localStorage/i);
});
