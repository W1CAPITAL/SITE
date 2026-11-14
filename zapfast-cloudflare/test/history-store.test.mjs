import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHistory, persistHistoryBatch } from '../src/history-store.js';

test('history respects WhatsApp LID contacts and skips invalid messages', () => {
  const rows = normalizeHistory([
    {key:{remoteJid:'166950328082501@lid',id:'A',fromMe:false},messageTimestamp:1763150000,message:{conversation:'Oi'}},
    {key:{remoteJid:'166950328082501@lid',id:'B',fromMe:true},messageTimestamp:1763150002,message:{conversation:'Resposta'}},
    {key:{remoteJid:'invalid@example.com',id:'C'},message:{conversation:'invalid'}}
  ]);
  assert.equal(rows.length,2);
  assert.equal(rows[0].jid,'166950328082501@lid');
  assert.equal(rows[1].from_me,1);
});
test('history inserts in bounded SQL batches and upserts recent chat previews', () => {
  const calls=[];
  const sql={exec:(statement,...args)=>{calls.push({statement,args});return []}};
  const rows=Array.from({length:65},(_,i)=>({jid:i%2?'111@s.whatsapp.net':'166950328082501@lid',id:'MSG'+i,text:'Mensagem '+i,at:1000+i,from_me:i%2}));
  const total=persistHistoryBatch(sql,rows,25);
  assert.equal(total,65);
  assert.equal(calls.filter(c=>c.statement.includes('INSERT OR IGNORE INTO messages')).length,3);
  assert.equal(calls.filter(c=>c.statement.includes('INSERT INTO chats')).length,3);
  assert.ok(calls.every(c=>!c.statement.includes('166950328082501@lid')));
  assert.ok(calls.some(c=>c.args.includes('166950328082501@lid')));
  assert.ok(calls.every(c=>c.args.length<=125));
});
test('history preserves empty batches without touching SQLite',()=>{
  let invoked=false;const sql={exec:()=>{invoked=true}};
  assert.equal(persistHistoryBatch(sql,[],25),0);
  assert.equal(invoked,false);
});
