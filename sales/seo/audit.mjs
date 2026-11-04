/**
 * Offline W1 SEO/GEO quality gate inspired by the user-provided Claude SEO
 * Agent Skill guide. No Claude runtime or paid API required.
 *
 * This is a static source audit, NOT a Lighthouse result, Google indexing
 * verdict, AI citation measurement or live production website audit.
 */
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
function result(severity,code,description,failedIf){
  return {severity,code,description,failedIf};
}
export function auditHtml(html){
  const findings=[];
  const title=/<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim()||"";
  const description=/<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1]?.trim()||"";
  const h1=[...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length;
  if(!title||title.length<24||title.length>75)findings.push(result("error","SEO_TITLE","Título inexistente ou fora da faixa editorial de 24–75 caracteres.","Título ausente, truncado ou genérico."));
  if(!description||description.length<70||description.length>190)findings.push(result("error","SEO_DESCRIPTION","A descrição precisa esclarecer o serviço, sem exageros, em aproximadamente 70–190 caracteres.","Descrição vazia ou sem proposta de valor."));
  if(h1!==1)findings.push(result("error","SEO_H1","A homepage deve ter apenas um H1 semântico.","Quantidade de H1 diferente de um."));
  for(const [label,pattern] of [
    ["idioma",/<html\s+lang="pt-BR"/i],
    ["viewport",/<meta\s+name="viewport"/i],
    ["título social",/<meta\s+property="og:title"/i],
    ["descrição social",/<meta\s+property="og:description"/i],
    ["FAQ identificável",/id="faq"/i],
    ["descrição de serviços",/id="solucoes"/i],
    ["acessibilidade de navegação",/class="skip"/i]
  ])if(!pattern.test(html))findings.push(result("error","SEO_"+label.toUpperCase().replaceAll(" ","_"),"Falta: "+label+".","O HTML perde uma estrutura informativa verificável."));
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const href of [...html.matchAll(/\bhref="#([^"]+)"/g)].map(m=>m[1])){
    if(!ids.has(href))findings.push(result("error","BROKEN_ANCHOR","Âncora interna #"+href+" sem ID correspondente.","Clique interno não alcança sua seção."));
  }
  const blocks=[...html.matchAll(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi)];
  if(blocks.length===0)findings.push(result("error","JSON_LD_MISSING","Falta Schema.org verificável.","Nenhum dado estruturado é apresentado."));
  for(const [,content] of blocks){
    try{
      const object=JSON.parse(content);
      if(object["@context"]!=="https://schema.org")throw Error("missing schema context");
      const schemaTypes=(object["@graph"]||[object]).map(o=>o["@type"]);
      if(!schemaTypes.includes("Organization"))throw Error("Organization missing");
      if(JSON.stringify(object).match(/aggregateRating|reviewCount|priceValidUntil/))
        throw Error("Dados de avaliações ou preços devem ser sustentados por evidência");
    }catch(error){findings.push(result("error","JSON_LD_INVALID","Structured data inválido: "+String(error.message||error), "Google/validador não consegue analisar as entidades."));}
  }
  if(!/id="featured-title"/.test(html))findings.push(result("warning","PRODUCT_CONTEXT","Falta uma explicação visível do produto principal.","Fica difícil vincular nome do produto às suas funções."));
  // Do not publish guessed canonicals, sitemap URLs, social images or addresses.
  if(!/<link\s+rel="canonical"/.test(html))findings.push(result("pending","CANONICAL","Adicionar canonical e sitemap somente depois de confirmar o domínio público da W1.", "A produção foi publicada e ainda falta URL canônica."));
  return findings;
}
export function buildSitemap(base){
  let url;
  try{url=new URL(base);}catch{throw Error("Informe uma URL HTTPS real e verificada para o site.");}
  if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||
     url.pathname!=="/"||!url.hostname.includes("."))
    throw Error("A URL pública deve ser https://dominio-verificado.tld/ sem caminho, parâmetros ou credenciais.");
  const home=url.href.endsWith("/")?url.href:url.href+"/";
  const encoded=home.replaceAll("&","&amp;").replaceAll("<","&lt;");
  // No public sitemap route for manual prospecting or unlaunched products.
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    '  <url><loc>'+encoded+'</loc></url>\n'+
    '</urlset>\n';
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const html=readFileSync(resolve(root,"index.html"),"utf8");
  const findings=auditHtml(html);
  console.log(JSON.stringify({
    kind:"source_static_only",
    audited:"index.html",
    runAt:new Date().toISOString(),
    errors:findings.filter(f=>f.severity==="error"),
    notes:findings.filter(f=>f.severity!=="error"),
    verified:false,
    liveDomainTested:false
  },null,2));
  if(findings.some(f=>f.severity==="error"))process.exitCode=1;
}
