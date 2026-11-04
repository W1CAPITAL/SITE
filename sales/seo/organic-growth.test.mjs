import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {normalizeOrigin,buildWhatsAppHref} from "../../guia/origem.mjs";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");
test("free educational guide is accessible, useful and clearly separate from the app",()=>{
 const p="guia/index.html";assert.ok(existsSync(join(root,p)));
 const s=read(p);
 assert.match(s,/<html lang="pt-BR">/);
 assert.match(s,/<h1/);
 assert.match(s,/Checklist gratuito/);
 assert.match(s,/LexisPredict/);
 assert.match(s,/dados fictícios|sem dados pessoais reais/i);
 assert.match(s,/data-wa-conversion/);
 assert.match(s,/https:\/\/w1-capital\.onrender\.com\/guia\//);
 assert.match(s,/<button[^>]+data-print/i);
 assert.doesNotMatch(s,/algum cliente já|98% de êxito|resultado garantido|depoimentos de clientes/i);
});
test("social source is explicitly whitelisted, not tracked or collected",()=>{
 for(const [input,expected] of [["linkedin","linkedin"],["instagram","instagram"],["whatsapp","whatsapp"],["indicacao","indicacao"],["telegram","site"],["<img>","site"],["","site"]]){
  assert.equal(normalizeOrigin(input),expected);
 }
 const url=new URL(buildWhatsAppHref("instagram"));
 assert.equal(url.hostname,"wa.me");
 assert.equal(url.pathname,"/5513991199349");
 assert.match(url.searchParams.get("text"),/Instagram/);
 const unsafe=new URL(buildWhatsAppHref('sensitive-id=123'));
 assert.doesNotMatch(unsafe.searchParams.get("text"),/sensitive-id|123/);
 const code=read("guia/origem.mjs");
 assert.doesNotMatch(code,/localStorage|sessionStorage|fetch\s*\(|navigator\.sendBeacon|document\.cookie/);
});
test("public SEO entry points include the three actual consumer-facing pages, not internal tools",()=>{
 const robots=read("robots.txt"),xml=read("sitemap.xml");
 assert.match(robots,/Sitemap: https:\/\/w1-capital\.onrender\.com\/sitemap\.xml/);
 assert.match(robots,/Disallow: \/sales\/prospecting\//);
 assert.match(robots,/Disallow: \/sales\/operations\//);
 assert.doesNotMatch(robots,/^Disallow: \/sales\/$/m,"Do not block CSS and JS assets from search robots");
 for(const uri of ["https://w1-capital.onrender.com/","https://w1-capital.onrender.com/lexispredict/","https://w1-capital.onrender.com/guia/","https://w1-capital.onrender.com/diagnostico/"]){
  assert.ok(xml.includes("<loc>"+uri+"</loc>"),uri+" omitted");
 }
 assert.doesNotMatch(xml,/\/sales\/|example\.com|localhost|<lastmod>2027/i);
});

test("homepage and product page prominently link to the free educational resource",()=>{
 const home=read("index.html"),product=read("lexispredict/index.html");
 assert.match(home,/href="\.\/guia\/"/);
 assert.match(product,/href="\.\.\/guia\/"/);
 assert.match(home,/Checklist gratuito/);
 assert.match(product,/Checklist gratuito/);
});
