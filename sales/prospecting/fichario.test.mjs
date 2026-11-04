import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
import {FICHARIO,normalizeCnpj,formatCnpj,companyPageUrl,normalizeSearch,advancedSearchUrl,prospectiveCompanyDraft} from "./fichario.js";

test("validates the user-supplied example CNPJ with both check digits",()=>{
  const sample="48.659.344/0001-33";
  assert.equal(normalizeCnpj(sample),"48659344000133");
  assert.equal(formatCnpj("48659344000133"),sample);
  assert.equal(companyPageUrl(sample),"https://cnpj.genesisinnovation.io/cnpj/48659344000133");
  for(const invalid of ["","00000000000000","48659344000134","123","aaaaaaaaaaaaaa","12.345.678/0001-96"]){
    assert.equal(normalizeCnpj(invalid),"");
  }
  assert.throws(()=>companyPageUrl("00000000000000"),/inválido/);
});
test("builds advanced searches with strict UF, CNAE, city and porte validation",()=>{
  const url=new URL(advancedSearchUrl({uf:"sp",cnae:"4781400",cidade:"São Paulo",porte:"ME"}));
  assert.equal(url.origin,FICHARIO.origin);
  assert.equal(url.pathname,"/busca-avancada");
  assert.equal(url.searchParams.get("uf"),"SP");
  assert.equal(url.searchParams.get("cnae"),"4781400");
  assert.equal(url.searchParams.get("cidade"),"São Paulo");
  assert.equal(url.searchParams.get("porte"),"ME");
  assert.equal(normalizeSearch({uf:"SP",cidade:"Campinas"}).cnae,"");
  const csv=new URL(advancedSearchUrl({uf:"SC",cnae:"4781400"},{format:"csv"}));
  assert.equal(csv.pathname,"/api/v1/busca-avancada");
  assert.equal(csv.searchParams.get("formato"),"csv");
  for(const criteria of [
    {uf:"XX",cnae:"4781400"},{uf:"SP"},
    {uf:"SP",cnae:"123"},{uf:"SP",cidade:"a"},
    {uf:"SP",cidade:"Campinas",porte:"fake"},
  ])assert.throws(()=>advancedSearchUrl(criteria));
});
test("generates research-only draft without contact fields or implied permission",()=>{
  const d=prospectiveCompanyDraft({cnpj:"48659344000133",companyName:"Empresa Exemplo",segment:"Tecnologia"});
  assert.equal(d.stage,"pesquisa");
  assert.equal(d.contact_allowed,false);
  assert.equal(d.reviewed_by_human,false);
  assert.equal(d.legal_basis_reviewed,false);
  assert.equal(d.source_url,companyPageUrl(d.cnpj));
  assert.match(d.source_credit,/Fonte: Fichário/);
  assert.equal(Object.hasOwn(d,"phone"),false);
  assert.equal(Object.hasOwn(d,"email"),false);
  assert.ok(Object.isFrozen(d));
});
test("research workspace cannot silently fetch data, collect contacts or automate messaging",()=>{
  const dir=dirname(fileURLToPath(import.meta.url));
  const html=readFileSync(join(dir,"index.html"),"utf8");
  const js=readFileSync(join(dir,"workspace.js"),"utf8");
  const migration=readFileSync(join(dir,"../supabase/002_company_research_future.sql"),"utf8");
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/Não é um serviço da Receita Federal/);
  assert.match(html,/Fichário/);
  assert.match(html,/Sem coleta de dados pessoais/);
  assert.match(js,/window\.open/);
  assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/);
  assert.doesNotMatch(js,/\blocalStorage\b|\bsessionStorage\b/);
  assert.match(migration,/ALTER TABLE public\.sales_company_research ENABLE ROW LEVEL SECURITY/i);
  assert.match(migration,/REVOKE ALL ON public\.sales_company_research FROM anon, authenticated/i);
  assert.doesNotMatch(migration,/GRANT .* TO anon|CREATE POLICY/i);
  assert.match(migration,/not_an_automatically_approved_lead/);
});
