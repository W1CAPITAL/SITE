import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
import {QUESTIONS,evaluateAnswers,buildContactLink,levelForScore} from "./diagnostico.mjs";
const base=dirname(fileURLToPath(import.meta.url));
const read=p=>readFileSync(join(base,p),"utf8");
test("six factual, unique self-assessment questions and bounded score",()=>{
 assert.equal(QUESTIONS.length,6);
 assert.equal(new Set(QUESTIONS.map(x=>x.id)).size,6);
 assert.equal(evaluateAnswers(Array(6).fill(0)).score,0);
 assert.equal(evaluateAnswers(Array(6).fill(2)).score,12);
 assert.equal(evaluateAnswers([2,1,0,1,2,0]).score,6);
});
test("response validation rejects omissions, non-numeric input and out of-range options",()=>{
 for(const input of [[],[2,2],[-1,0,1,2,1,0],[3,0,1,2,1,0],["2",2,1,1,1,0],[NaN,1,1,1,1,1]]){
  assert.throws(()=>evaluateAnswers(input));
 }
});
test("results provide two priorities without claiming diagnoses or ROI",()=>{
 const result=evaluateAnswers([2,1,0,2,0,1]);
 assert.equal(result.score,6);
 assert.equal(result.level,"em_evolucao");
 assert.deepEqual(result.priorities.map(x=>x.id),["prazos","indicadores"]);
 assert.equal(levelForScore(0),"inicial");
 assert.equal(levelForScore(4),"inicial");
 assert.equal(levelForScore(5),"em_evolucao");
 assert.equal(levelForScore(8),"em_evolucao");
 assert.equal(levelForScore(9),"estruturada");
 assert.equal(levelForScore(12),"estruturada");
});
test("contact link sends only a generic opt-in business enquiry and never answers",()=>{
 const u=new URL(buildContactLink("instagram"));
 assert.equal(u.hostname,"wa.me");
 assert.equal(u.pathname,"/5513991199349");
 assert.match(u.searchParams.get("text"),/demonstração.*LexisPredict/i);
 assert.doesNotMatch(u.searchParams.get("text"),/score|pontuação|resposta|processo|cliente real/i);
 assert.doesNotMatch(new URL(buildContactLink("script:token")).searchParams.get("text"),/script|token/i);
});
test("web page is accessible, server-free, and discoverable",()=>{
 const s=read("index.html");
 const j=read("diagnostico.mjs");
 assert.match(s,/<html lang="pt-BR">/);
 assert.match(s,/Diagnóstico gratuito/);
 assert.match(s,/type="radio"/);
 assert.match(s,/type="submit"/);
 assert.match(s,/aria-live="polite"/);
 assert.match(s,/href="https:\/\/w1-capital-sales\.pages\.dev\/diagnostico\/"/);
 assert.match(s,/diagnostico\.mjs/);
 assert.match(j,/addEventListener\("submit"/);
 assert.match(j,/reportValidity|checkValidity/);
 assert.doesNotMatch(j,/fetch\s*\(|localStorage|sessionStorage|document\.cookie|sendBeacon/i);
 assert.ok(Buffer.byteLength(j)<12000);
 assert.match(read("../index.html"),/href="\.\/diagnostico\/"/);
 assert.match(read("../lexispredict/index.html"),/href="\.\.\/diagnostico\/"/);
 assert.match(read("../guia/index.html"),/href="\.\.\/diagnostico\/"/);
 assert.match(read("../sitemap.xml"),/https:\/\/w1-capital-sales\.pages\.dev\/diagnostico\//);
});
