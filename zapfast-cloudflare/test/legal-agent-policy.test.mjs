import test from 'node:test';
import assert from 'node:assert/strict';
import { assessInbound, buildProcessReply, canAutoSend } from '../src/legal-agent-policy.js';

test('ignora grupos, mensagens próprias e mensagens não processuais',()=>{
  assert.equal(assessInbound({jid:'123@g.us',id:'x',text:'meu processo',fromMe:false}).kind,'ignore');
  assert.equal(assessInbound({jid:'5511999991234@s.whatsapp.net',id:'x',text:'meu processo',fromMe:true}).kind,'ignore');
  assert.equal(assessInbound({jid:'5511999991234@s.whatsapp.net',id:'x',text:'bom dia',fromMe:false}).kind,'ignore');
});
test('questão processual privada é analisada, mas honorários e pagamentos exigem humano',()=>{
  assert.equal(assessInbound({jid:'12345@lid',id:'m1',text:'Qual a última movimentação do meu processo?',fromMe:false}).kind,'process');
  assert.equal(assessInbound({jid:'12345@lid',id:'m2',text:'Quero saber dos honorários do meu processo',fromMe:false}).kind,'human');
  assert.equal(assessInbound({jid:'12345@lid',id:'m2',text:'Já foi pago o alvará?',fromMe:false}).kind,'human');
});
test('só gera texto a partir de consulta oficial recente e andamento seguro',()=>{
  const base={cliente:'Maria',datajud_last_ok:true,datajud_consultado_em:'2026-11-14T13:00:00Z',datajud_ultimo_movimento:'2026-11-13T10:00:00Z',datajud_ultimo_nome:'Conclusos para decisão'};
  const ok=buildProcessReply(base,new Date('2026-11-14T15:00:00Z'));
  assert.equal(ok.ok,true);
  assert.match(ok.text,/13\/11\/2026/);
  assert.match(ok.text,/encaminhado ao juiz/);
  assert.ok(!ok.text.includes('Maria'));
  assert.equal(buildProcessReply({...base,datajud_last_ok:false},new Date('2026-11-14T15:00:00Z')).ok,false);
  assert.equal(buildProcessReply({...base,datajud_ultimo_nome:'Sentença de improcedência'},new Date('2026-11-14T15:00:00Z')).ok,false);
  assert.equal(buildProcessReply({...base,datajud_consultado_em:'2026-10-01T10:00:00Z'},new Date('2026-11-14T15:00:00Z')).ok,false);
});
test('cumpre limites do Lexis: dez mensagens/dia, vinte minutos, horário comercial e por contato',()=>{
  const now=new Date('2026-11-16T14:10:00Z'); // segunda-feira 11h10 em São Paulo
  const baseline={now,limits:{paused:false,min_gap_minutes:20,daily_limit:10,business_start_hour:9,business_end_hour:17,weekdays_only:true},allToday:2,contactToday:0,lastSentAt:'2026-11-16T13:40:00Z'};
  assert.equal(canAutoSend(baseline).ok,true);
  assert.equal(canAutoSend({...baseline,contactToday:1}).ok,false);
  assert.equal(canAutoSend({...baseline,allToday:10}).ok,false);
  assert.equal(canAutoSend({...baseline,lastSentAt:'2026-11-16T14:00:00Z'}).ok,false);
  assert.equal(canAutoSend({...baseline,limits:{...baseline.limits,paused:true}}).ok,false);
  assert.equal(canAutoSend({...baseline,now:new Date('2026-11-15T14:10:00Z')}).ok,false);
});
