import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {selectChangedUrls,createIndexNowPayload,KEY,BASE_URL} from "./indexnow.mjs";

const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");
const urls=[
 "https://w1-capital.onrender.com/",
 "https://w1-capital.onrender.com/lexispredict/",
 "https://w1-capital.onrender.com/operacao/",
 "https://w1-capital.onrender.com/guia/",
 "https://w1-capital.onrender.com/diagnostico/",
 "https://w1-capital.onrender.com/parcerias/",
 "https://w1-capital.onrender.com/exemplo-relatorio/"
];
test("notify only public changed pages and deduplicate results",()=>{
 assert.deepEqual(selectChangedUrls(["operacao/index.html","operacao/index.html","sales/core.js",".github/workflows/w1-sales.yml"],urls),["https://w1-capital.onrender.com/operacao/"]);
 assert.deepEqual(selectChangedUrls(["index.html","lexispredict/index.html"],urls),[urls[0],urls[1]]);
 assert.deepEqual(selectChangedUrls(["sales/prospecting/workspace.js"],urls),[]);
});
test("initial ownership-key deployment notifies all public sitemap URLs",()=>{
 assert.deepEqual(selectChangedUrls([KEY+".txt"],urls),urls);
 assert.deepEqual(selectChangedUrls(["sitemap.xml"],urls),urls);
});
test("will not notify external or admin URLs even if maliciously supplied",()=>{
 const all=[...urls,"https://evil.example/","https://w1-capital.onrender.com/sales/operations/"];
 const selected=selectChangedUrls(["sitemap.xml"],all);
 assert.deepEqual(selected,urls);
 const payload=createIndexNowPayload(selected);
 assert.equal(payload.host,"w1-capital.onrender.com");
 assert.equal(payload.key,KEY);
 assert.deepEqual(payload.urlList,urls);
 assert.equal(payload.keyLocation,BASE_URL+"/"+KEY+".txt");
});
test("key file, sitemap and integration workflow agree on host and security",()=>{
 const keyFile=read(KEY+".txt").trim();
 assert.equal(keyFile,KEY);
 assert.match(KEY,/^[0-9a-f]{32}$/);
 const xml=read("sitemap.xml");
 for(const u of urls)assert.ok(xml.includes("<loc>"+u+"</loc>"),"missing "+u);
 const workflow=read(".github/workflows/w1-indexnow.yml");
 assert.match(workflow,/workflow_dispatch/);
 assert.match(workflow,/indexnow\.mjs --submit/);
 assert.match(workflow,/fetch-depth: 2/);
 assert.match(workflow,/github\.event\.before/);
 assert.match(read("sales/seo/indexnow.mjs"),/https:\/\/api\.indexnow\.org\/indexnow/);
 assert.doesNotMatch(workflow,/pull_request:|curl -d '.*email|api\.google\.com/);
});
