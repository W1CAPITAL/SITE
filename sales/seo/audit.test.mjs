import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {auditHtml,buildSitemap} from "./audit.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const page=readFileSync(resolve(root,"index.html"),"utf8");

test("SEO audit passes substantive static checks for W1 homepage",()=>{
  const items=auditHtml(page);
  assert.deepEqual(items.filter(x=>x.severity==="error"),[]);
  assert.ok(!items.some(x=>x.code==="CANONICAL"&&x.severity==="pending"),"Verified Render domain has a canonical now");
  assert.match(page,/<link rel="canonical" href="https:\/\/w1-capital\.onrender\.com\/">/);
  assert.ok(page.includes('type="application/ld+json"'));
});
test("audit catches missing headings, invalid structured data and bad anchors",()=>{
  const stripped=page.replace(/<h1\s[^>]*>/,"<h2>").replace('href="#solucoes"','href="#inexistente"').replace(/"@context"\s*:\s*"https:\/\/schema\.org"/,'"@context":"invalid"');
  const issues=auditHtml(stripped).filter(x=>x.severity==="error").map(x=>x.code);
  assert.ok(issues.includes("SEO_H1"));
  assert.ok(issues.includes("BROKEN_ANCHOR"));
  assert.ok(issues.includes("JSON_LD_INVALID"));
});
test("sitemap generator never fabricates the W1 public domain or publishes internal tools",()=>{
  const xml=buildSitemap("https://example.org/");
  assert.match(xml,/<loc>https:\/\/example\.org\/<\/loc>/);
  assert.doesNotMatch(xml,/prospecting|\/sales\//);
  for(const bad of ["","http://example.org/","https://example.org/private","https://example.org/?ref=x","https://user:pass@example.org/","file:///tmp/index.html"])
    assert.throws(()=>buildSitemap(bad));
});
