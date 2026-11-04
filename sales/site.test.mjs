import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
const app=readFileSync(new URL("./app.js",import.meta.url),"utf8");
const core=readFileSync(new URL("./core.js",import.meta.url),"utf8");
const cfg=readFileSync(new URL("./config.js",import.meta.url),"utf8");
const sql=readFileSync(new URL("./supabase/001_sales_leads.sql",import.meta.url),"utf8");
const studio=readFileSync(new URL("./studio.css",import.meta.url),"utf8");

test("isolated no-cost static portal exposes navigable sections and accessible flow",()=>{
  assert.match(html, /<html lang="pt-BR">/);
  for(const id of ["conteudo","solucoes","agentes","atendimento","catalogo","step-body","next","back"])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/\.\/config\.js/);
  assert.match(html,/\.\/app\.js/);
  assert.match(html,/\.\/studio\.css/);
  assert.match(html,/<a class="skip"/);
  assert.match(html,/aria-live="polite"/);
});

test("client cannot read other companies' data and does not embed privileged keys",()=>{
  assert.doesNotMatch(html+app+core+cfg,/(?:service_role|SUPABASE_SERVICE_ROLE_KEY)\\s*[:=]\\s*[\x27\x22]/i);
  assert.doesNotMatch(html+app+core+cfg,/postgres:\/\//i);
  assert.match(sql,/alter table public\.sales_leads enable row level security/i);
  assert.match(sql,/revoke all on table public\.sales_leads from anon, authenticated/i);
  assert.match(sql,/grant insert \(/i);
  assert.doesNotMatch(sql,/grant select .* to anon/i);
  assert.match(sql,/consent is true/i);
  assert.match(app,/AbortSignal\.timeout/);
  assert.match(app,/raw\.get\("consent"\)/);
  assert.match(app,/if\(!form\?\.reportValidity\(\)\)return/);
});

test("animations and conversion copy remain transparent and accessible",()=>{
  assert.match(studio,/prefers-reduced-motion:reduce/);
  assert.match(studio,/step-swap/);
  assert.match(app,/IntersectionObserver/);
  assert.match(html,/CENA ILUSTRATIVA/);
  assert.match(html,/Não nesta versão/);
  assert.match(html,/sem compromisso/i);
});
