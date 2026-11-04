import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const text=readFileSync(join(root,"operacao/index.html"),"utf8");
test("portfolio prospect can contact via official W1 WhatsApp without sending private info",()=>{
 const contacts=[...text.matchAll(/href="(https:\/\/wa\.me\/5513991199349\?text=[^"]+)"/g)];
 assert.ok(contacts.length>=2,"WhatsApp CTA missing from service hero or booking area");
 for(const match of contacts){
  const url=new URL(match[1].replaceAll("&amp;","&"));
  assert.equal(url.hostname,"wa.me");
  assert.equal(url.pathname,"/5513991199349");
  assert.match(url.searchParams.get("text"),/apoio|carteira/i);
  assert.doesNotMatch(url.searchParams.get("text"),/CNJ|processo\s*\d|CPF|documento|senha/i);
 }
 assert.match(text,/Falar no WhatsApp|Conversar no WhatsApp/);
 assert.match(text,/https:\/\/calendly\.com\/daviconcentrix\/apoio-a-carteira-processual-w1-capital/);
});
