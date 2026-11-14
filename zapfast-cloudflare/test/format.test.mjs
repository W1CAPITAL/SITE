import test from 'node:test';
import assert from 'node:assert/strict';
import { validJid, textMessage, timestamp } from '../src/format.js';

test('aceita identificadores válidos de contato e grupo', () => {
  assert.equal(validJid('5511999990000@s.whatsapp.net'), true);
  assert.equal(validJid('120363123456789@g.us'), true);
  assert.equal(validJid('12345@lid'), true);
});

test('recusa identificadores inseguros e texto que não é JID', () => {
  for(const value of ['javascript:alert(1)', '5511988882222@evil.test', 'a'.repeat(160)+'@lid', '', null]) {
    assert.equal(validJid(value), false);
  }
});

test('mostra mensagens de texto e mensagens efêmeras', () => {
  assert.equal(textMessage({message:{conversation:'Oi!'}}), 'Oi!');
  assert.equal(textMessage({message:{ephemeralMessage:{message:{extendedTextMessage:{text:'Olá'}}}}}), 'Olá');
});

test('mostra texto substituto para mídia ou conteúdo vazio', () => {
  assert.equal(textMessage({message:{imageMessage:{}}}), 'Mensagem de mídia ou outro conteúdo');
  assert.equal(textMessage({}), 'Mensagem de mídia ou outro conteúdo');
});

test('restringe mensagens longas e preserva a data de histórico', () => {
  assert.equal(textMessage({message:{conversation:'x'.repeat(9000)}}).length,4096);
  assert.equal(timestamp(1690000000),1690000000);
  assert.equal(timestamp('1690000000'),1690000000);
});
