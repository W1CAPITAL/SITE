import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPrivateJid,
  constantTimeEqual,
  validateDraftArgs,
  validateSendArgs,
  TOOL_DEFINITIONS,
} from '../src/policy.js';

test('accepts only private WhatsApp JIDs and rejects groups or malformed IDs', () => {
  assert.equal(isPrivateJid('5511999999999@s.whatsapp.net'), true);
  assert.equal(isPrivateJid('166950328082501@lid'), true);
  assert.equal(isPrivateJid('120363012345678901@g.us'), false);
  assert.equal(isPrivateJid('5511999999999@c.us'), false);
  assert.equal(isPrivateJid('not-a-jid'), false);
});

test('compares bearer tokens without early exit and rejects empty values', () => {
  assert.equal(constantTimeEqual('a'.repeat(64), 'a'.repeat(64)), true);
  assert.equal(constantTimeEqual('a'.repeat(64), 'a'.repeat(63)+'b'), false);
  assert.equal(constantTimeEqual('', ''), false);
  assert.equal(constantTimeEqual('short', 'much-longer'), false);
});

test('validates draft input and bounds message length', () => {
  assert.deepEqual(validateDraftArgs({jid:'5511999999999@s.whatsapp.net',text:'Olá'}), {
    ok:true, value:{jid:'5511999999999@s.whatsapp.net',text:'Olá'}
  });
  assert.equal(validateDraftArgs({jid:'120363012345678901@g.us',text:'Oi'}).ok, false);
  assert.equal(validateDraftArgs({jid:'5511999999999@s.whatsapp.net',text:'  '}).ok, false);
  assert.equal(validateDraftArgs({jid:'5511999999999@s.whatsapp.net',text:'x'.repeat(4097)}).ok, false);
});

test('send requires a valid draft id, exact confirmation phrase and nonempty preview', () => {
  const args={draft_id:'123e4567-e89b-12d3-a456-426614174000',confirm_text:'Resposta revisada',confirmation_phrase:'ENVIAR_MENSAGEM_APROVADA'};
  assert.equal(validateSendArgs(args).ok, true);
  assert.equal(validateSendArgs({...args,confirmation_phrase:'sim'}).ok, false);
  assert.equal(validateSendArgs({...args,confirm_text:''}).ok, false);
  assert.equal(validateSendArgs({...args,draft_id:'x'}).ok, false);
});

test('tool catalog exposes read-only WhatsApp tools and marks send as destructive', () => {
  const names=TOOL_DEFINITIONS.map(x=>x.name);
  assert.deepEqual(names,['zapfast_status','zapfast_list_chats','zapfast_read_messages','zapfast_draft_reply','zapfast_send_approved']);
  const send=TOOL_DEFINITIONS.find(x=>x.name==='zapfast_send_approved');
  assert.equal(send.annotations.destructiveHint,true);
  assert.equal(send.annotations.idempotentHint,false);
  assert.equal(TOOL_DEFINITIONS.find(x=>x.name==='zapfast_read_messages').annotations.readOnlyHint,true);
});
