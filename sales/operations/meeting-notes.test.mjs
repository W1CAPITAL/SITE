import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {createMeetingMarkdown} from "./meeting-notes.js";
const page=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),"meeting-notes.html"),"utf8");

test("creates a human-reviewable markdown brief, not an AI transcript",()=>{
  const text=createMeetingMarkdown({
    project:"W1 Sales",date:"2026-11-04",objective:"Apresentar CRM",
    notes:"A equipe quer organizar os retornos.",
    actions:"Agendar demonstração",reviewed:true
  });
  assert.match(text,/W1 Sales/);
  assert.match(text,/Agendar demonstração/);
  assert.match(text,/não comprova gravação/);
  assert.doesNotMatch(text,/Gravação confirmada|Autorização de marketing: sim/);
});
test("rejects missing data and unreviewed meeting summaries",()=>{
  const base={project:"Teste",date:"2026-11-04",objective:"Escopo",notes:"Discussão",actions:"Revisar",reviewed:true};
  assert.throws(()=>createMeetingMarkdown({...base,reviewed:false}));
  assert.throws(()=>createMeetingMarkdown({...base,date:"amanhã"}));
  assert.throws(()=>createMeetingMarkdown({...base,actions:""}));
});
test("notes page uses no microphone, recording, network or durable client storage",()=>{
  const js=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),"meeting-notes.js"),"utf8");
  assert.match(page,/noindex,nofollow/);
  assert.match(page,/não grava áudio/);
  assert.doesNotMatch(js,/getUserMedia|MediaRecorder|fetch\s*\(|WebSocket|localStorage|sessionStorage/);
  assert.match(js,/Blob\(\[md\]/);
});
