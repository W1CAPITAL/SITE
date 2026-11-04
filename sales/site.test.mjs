import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";

const folder=dirname(fileURLToPath(import.meta.url));
const root=join(folder,"..");
const read=(file)=>readFileSync(join(root,file),"utf8");
const html=read("index.html");
const redirect=read("sales/index.html");
const app=read("sales/app.js");
const core=read("sales/core.js");
const cfg=read("sales/config.js");
const studio=read("sales/studio.css");
const premium=read("sales/premium.css");
const premiumJS=read("sales/premium.js");
const sql=read("sales/supabase/001_sales_leads.sql");

test("the W1 Capital homepage replaces the personal portfolio",()=>{
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html,/W1 Capital — Soluções digitais/);
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:title"/);
  assert.doesNotMatch(html,/Portfólio de Davi|Davi Alves Figueredo|LinkedIn/);
  assert.match(redirect,/http-equiv="refresh" content="0;url=\.\.\/"/);
});

test("canonical homepage has complete working navigation and JS assets",()=>{
  for(const id of ["conteudo","inicio","solucoes","agentes","metodo","atendimento","faq",
    "catalogo","step-body","step-number","progress-bar","next","back","summary-need","summary-product",
    "process-stage","process-title","process-description","menu-mobile","year"]) {
      assert.match(html,new RegExp('id="'+id+'"'));
    }
  for(const file of ["sales/styles.css","sales/studio.css","sales/premium.css",
    "sales/core.js","sales/app.js","sales/premium.js","sales/config.js","sales/favicon.svg"]) {
    assert.ok(existsSync(join(root,file)),file+" missing");
  }
  assert.match(html,/\.\x2fsales\x2fapp\.js/);
  assert.match(html,/\.\x2fsales\x2fpremium\.js/);
  assert.match(html, /aria-controls="menu-mobile"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-valuenow="1"/);
  assert.match(html, /<a class="skip"/);
  assert.match(app, /document\.getElementById/);
});

test("interactions support keyboards, reduced motion and unobtrusive marketing",()=>{
  assert.match(premiumJS,/event\.key === "Escape"/);
  assert.match(premiumJS,/ArrowDown/);
  assert.match(premiumJS,/aria-pressed/);
  assert.match(premiumJS,/setMenuOpen\(false\)/);
  assert.match(premiumJS,/IntersectionObserver/);
  assert.match(premium,/prefers-reduced-motion: reduce/);
  assert.match(premium,/\.w1-premium\.reveal-ready \[data-reveal\]/);
  assert.match(premiumJS,/classList\.add\("reveal-ready"\)/);
  assert.doesNotMatch(premium,/^\.w1-premium \[data-reveal\] \{ opacity: 0/m);
  assert.match(studio,/prefers-reduced-motion:reduce/);
  assert.match(html,/FLUXO ILUSTRATIVO/);
  assert.match(html,/Sem compromisso/);
  assert.match(html,/Não são uma proposta comercial/);
  assert.doesNotMatch(html,/100% garantido|clientes satisfeitos|vagas restantes|últimas unidades/i);
});

test("demo mode and commercial database remain separate from legal clients",()=>{
  assert.doesNotMatch(html+app+core+cfg,/(?:service_role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*['"]/i);
  assert.doesNotMatch(html+app+core+cfg,/postgres:\/\//i);
  assert.match(cfg,/supabaseUrl: ""/);
  assert.match(app,/raw\.get\("consent"\)/);
  assert.match(app,/form\?\.reportValidity/);
  assert.match(app,/AbortSignal\.timeout/);
  assert.match(sql,/alter table public\.sales_leads enable row level security/i);
  assert.match(sql,/revoke all on table public\.sales_leads from anon, authenticated/i);
  assert.match(sql,/grant insert \(/i);
  assert.doesNotMatch(sql,/grant select .* to anon/i);
  assert.match(sql,/consent is true/i);
});


test("cinematic W1 identity preserves a local fictional-person hero and visual consistency",()=>{
  const lexis=read("lexispredict/index.html");
  assert.match(html,/\.\/sales\/cinematic\.css/);
  assert.match(lexis,/\.\/cinematic\.css/);
  assert.match(html,/src="\.\/assets\/w1-hero-ficticia\.webp"/);
  assert.ok(existsSync(join(root,"assets/w1-hero-ficticia.webp")),"synthetic hero asset missing");
  assert.match(html,/Imagem gerada digitalmente/);
  assert.doesNotMatch(html,/pexels\.com|unsplash\.com|images\.pexels/i);
  assert.match(html,/Estratégia, tecnologia e clareza/);
  assert.match(lexis,/Demonstração com dados fictícios/i);
  assert.ok(existsSync(join(root,"sales/cinematic.css")),"home visual design missing");
  assert.ok(existsSync(join(root,"lexispredict/cinematic.css")),"product visual design missing");
});
