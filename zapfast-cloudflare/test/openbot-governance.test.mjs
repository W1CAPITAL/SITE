import test from 'node:test';
import assert from 'node:assert/strict';
import {OPENBOT_ROLES, assessDraftDecision} from '../src/openbot-governance.js';

const approved = [{approved:true,processo_id:42}];
const draft = {id:'f23f36a4-3b6b-4ddf-a605-3c319a313373',status:'draft',processo_id:42,jid:'166950328082501@lid',source_type:'DataJud',source_at:'2026-11-15T12:00:00Z',reason:'status_oficial_conferido',draft:'A última movimentação confirmada foi o encaminhamento ao juiz para análise.'};
const now = new Date('2026-11-15T14:00:00Z');

test('OpenBot coworker roles explicitly exclude WhatsApp sending and customer disclosure',()=>{
  assert.equal(OPENBOT_ROLES.length,6);
  for(const role of OPENBOT_ROLES){
    assert.equal(role.canSendWhatsApp,false);
    assert.equal(role.canDiscloseCaseData,false);
    assert.ok(role.id && role.title && role.responsibility);
  }
});
test('allow once only for fresh source-backed draft and unique approved contact-case match',()=>{
  const result=assessDraftDecision({item:draft,authorizations:approved,decision:'allow_once',reviewer:'Davi Alves Figueredo',note:'Identidade conferida e resposta validada',now});
  assert.equal(result.allowed,true);
  assert.equal(result.status,'approved_for_manual_use');
  assert.equal(result.triggersTransport,false);
});
test('never approves disconnected, unauthenticated, ambiguous or stale evidence',()=>{
  const base={item:draft,authorizations:approved,decision:'allow_once',reviewer:'Davi Alves Figueredo',note:'Conferido',now};
  assert.equal(assessDraftDecision({...base,authorizations:[]}).allowed,false);
  assert.equal(assessDraftDecision({...base,authorizations:[...approved,...approved]}).allowed,false);
  assert.equal(assessDraftDecision({...base,item:{...draft,status:'needs_authorization'}}).allowed,false);
  assert.equal(assessDraftDecision({...base,item:{...draft,source_type:null}}).allowed,false);
  assert.equal(assessDraftDecision({...base,item:{...draft,source_at:'2026-10-01T00:00:00Z'}}).allowed,false);
  assert.equal(assessDraftDecision({...base,item:{...draft,processo_id:43}}).allowed,false);
  assert.equal(assessDraftDecision({...base,item:{...draft,draft:''}}).allowed,false);
});
test('deny is always permitted with a reason and cannot trigger send',()=>{
  const result=assessDraftDecision({item:{...draft,status:'human_review'},authorizations:[],decision:'deny',reviewer:'Davi',note:'Exige análise humana',now});
  assert.equal(result.allowed,true);
  assert.equal(result.status,'rejected');
  assert.equal(result.triggersTransport,false);
  assert.equal(assessDraftDecision({item:draft,authorizations:approved,decision:'deny',reviewer:'',note:'',now}).allowed,false);
});
