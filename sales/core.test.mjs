import test from "node:test";
import assert from "node:assert/strict";
import {PRODUCTS,recommendProduct,normalizeLead,buildBrief} from "./core.js";

test("all four solution lines have deterministic matches",()=>{
  assert.equal(PRODUCTS.length,4);
  for(const p of PRODUCTS){
    assert.equal(recommendProduct(p.need,"pequena")?.id,p.id);
    assert.equal(recommendProduct(p.need,"pequena",p.id)?.id,p.id);
  }
  assert.equal(recommendProduct("not-in-catalog","pequena"),null);
});

test("lead requires explicit consent and valid inputs",()=>{
  const base={name:"Ana Lima",email:"ANA@EMPRESA.COM",message:"Preciso de automação",need:"automacao",size:"pequena",product_id:"automation",consent:true};
  const result=normalizeLead(base);
  assert.equal(result.ok,true);
  assert.equal(result.data.email,"ana@empresa.com");
  assert.equal(result.data.company_size,"pequena");
  assert.equal(result.data.source,"w1_sales_portal");
  assert.equal(normalizeLead({...base,consent:false}).ok,false);
  assert.equal(normalizeLead({...base,email:"not-an-email"}).ok,false);
  assert.equal(normalizeLead({...base,product_id:"lexis"}).ok,false);
  assert.equal(normalizeLead({...base,need:"invalid"}).ok,false);
});

test("brief has no personal data, prices or claims",()=>{
  const text=buildBrief({need:"juridico",size:"individual",product:PRODUCTS[0]});
  assert.match(text,/LexisPredict/);
  assert.match(text,/Nenhum dado pessoal foi coletado/);
  assert.match(text,/Não constitui preço/);
  assert.doesNotMatch(text,/ana@empresa.com/);
});
