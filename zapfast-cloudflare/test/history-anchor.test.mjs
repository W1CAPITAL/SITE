import test from 'node:test';
import assert from 'node:assert/strict';
import { historyRequestAnchor } from '../src/history-anchor.js';

test('constructs correct Baileys history request for a LID chat', () => {
  const row = {id:'MSGabc',at:1794676770,from_me:0};
  assert.deepEqual(historyRequestAnchor('166950328082501@lid',row),{
    key:{remoteJid:'166950328082501@lid',id:'MSGabc',fromMe:false},timestamp:1794676770
  });
});
test('works with outgoing messages, too', () => {
  const row={id:'outgoing',at:1794676800,from_me:1};
  assert.equal(historyRequestAnchor('5511999990000@s.whatsapp.net',row).key.fromMe,true);
});
test('rejects missing anchor, invalid chat JID and timestamps',()=>{
  assert.equal(historyRequestAnchor('166950328082501@lid',null),null);
  assert.equal(historyRequestAnchor('evil@domain.tld',{id:'ID',at:1700000000}),null);
  assert.equal(historyRequestAnchor('166950328082501@lid',{id:'ID',at:0}),null);
});
