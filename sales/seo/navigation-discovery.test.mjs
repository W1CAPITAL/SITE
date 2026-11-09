import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const read=file=>readFileSync(join(root,file),"utf8");
const home=read("index.html");
const publicRoutes=["lexispredict/","operacao/","guia/","diagnostico/","exemplo-relatorio/","parcerias/"];
const htmlDirs=[...publicRoutes,"explorar/"];
const direct=["./lexispredict/","./operacao/#piloto","./guia/","./diagnostico/","./exemplo-relatorio/","./parcerias/","./explorar/"];
const booking=[
 "https://calendly.com/daviconcentrix/demonstracao-lexispredict-w1-capital",
 "https://calendly.com/daviconcentrix/apoio-a-carteira-processual-w1-capital",
 "https://calendly.com/daviconcentrix/parcerias-de-gestao-juridica-w1-capital"
];
test("homepage desktop and mobile menus lead to actual public pages instead of only anchors",()=>{
 const desktop=home.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)?.[0]||"";
 const mobile=home.match(/<nav id="menu-mobile"[\s\S]*?<\/nav>/)?.[0]||"";
 for(const nav of [desktop,mobile]){
   assert.match(nav,/href="\.\/lexispredict\/"/);
   assert.match(nav,/href="\.\/operacao\/#piloto"/);
   assert.match(nav,/href="\.\/explorar\/"/);
   assert.match(nav,/href="\.\/parcerias\/"/);
 }
 for(const href of direct)assert.ok(home.includes('href="'+href+'"'),"homepage missing "+href);
 assert.match(mobile,/href="#solucoes"/);
 assert.match(mobile,/href="#atendimento"/);
 assert.match(home,/aria-controls="menu-mobile"/);
});
test("visible homepage quick-access area makes every public destination immediately discoverable",()=>{
 const block=home.match(/<section class="discover-section"[\s\S]*?<\/section>/)?.[0]||"";
 assert.match(block,/id="atalhos"/);
 assert.match(block,/<h2[^>]*>/);
 for(const href of direct.slice(0,-1))assert.ok(block.includes('href="'+href+'"'),"missing visible tile "+href);
 assert.match(block,/href="\.\/assets\/w1-carrossel-operacao\.pdf"/);
 assert.match(block,/id="atalhos"/);
 assert.ok(home.indexOf('id="atalhos"')<home.indexOf('id="solucoes"'),"quick access should precede main product catalog");
 assert.ok(home.includes('href="#atalhos"'),"hero CTA to the quick-access area");
});
test("resource hub routes, titles and bookings all resolve",()=>{
 const hub=read("explorar/index.html");
 assert.match(hub,/<html lang="pt-BR">/);
 assert.match(hub,/href="\.\.\/"/);
 assert.match(hub,/<h1\b/);
 assert.match(hub,/name="description"/);
 assert.match(hub,/rel="canonical" href="https:\/\/w1-capital-sales\.pages\.dev\/explorar\/"/);
 for(const route of htmlDirs){
  const target=route==="explorar/"?"explorar/index.html":route+"index.html";
  assert.ok(existsSync(join(root,target)),target+" does not exist");
  if(route!=="explorar/")assert.ok(hub.includes('href="../'+route),route+" not linked");
 }
 for(const url of booking)assert.ok(hub.includes('href="'+url+'"'),"booking link missing: "+url);
 assert.match(hub,/href="\.\.\/assets\/w1-carrossel-operacao\.pdf"/);
 assert.match(hub,/href="https:\/\/lexispredict\.vercel\.app\/login"/);
 assert.ok(existsSync(join(root,"assets/w1-carrossel-operacao.pdf")));
 assert.match(read("operacao/index.html"),/id="piloto"/);
 assert.doesNotMatch(hub,/href=["'](?:\.\.\/)?sales\/(?:prospecting\/)?/);
});
test("all standalone public pages contain a link back to the directory",()=>{
 for(const route of publicRoutes){
  const html=read(route+"index.html");
  assert.match(html,/href="\.\.\/explorar\/"/,"missing hub link in "+route);
 }
});
test("site map includes directory and homepage keeps one original stylesheet",()=>{
 assert.match(read("sitemap.xml"),/<loc>https:\/\/w1-capital-sales\.pages\.dev\/explorar\/<\/loc>/);
 const styles=[...home.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(styles.length,1);
 assert.match(styles[0],/^\.\/sales\/refined\.css\?v=/);
 const css=read("sales/refined.css");
 assert.match(css,/\.discover-section/);
 assert.match(css,/\.discover-grid/);
 assert.match(css,/\.mobile-navigation/);
 assert.match(css,/max-height:\s*calc\(100dvh/,"mobile menu must scroll on small displays");
 assert.match(css,/@media\(max-width:760px\)/);
});

test("on narrow screens every standalone page prioritizes the directory link over crowded menus",()=>{
 const standalone=["operacao","guia","diagnostico","exemplo-relatorio","parcerias"];
 for(const route of standalone){
  const html=read(route+"/index.html");
  assert.match(html,/@media\(max-width:660px\)/,route+" requires mobile header rules");
  assert.match(html,/\.top nav a:not\(\[href="\.\.\/explorar\/"\]\)\{display:none!important\}/,route+" must hide extra header links on phones");
  assert.match(html,/\.top nav a\[href="\.\.\/explorar\/"\]\{display:inline-flex/,route+" must keep directory visible");
 }
 const product=read("lexispredict/index.html");
 assert.match(product,/class="mobile-shortcuts"/);
 assert.match(product,/href="\.\.\/explorar\/"/);
});
