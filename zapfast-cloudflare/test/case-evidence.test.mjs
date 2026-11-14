import test from 'node:test';
import assert from 'node:assert/strict';
import { compileCaseEvidence } from '../src/case-evidence.js';

const company='d37fd4bb-1c71-4dca-b97e-292355918d39';
const process={id:42,empresa_id:company,protocolo_ref:'1234567-89.2026.8.26.0001',observacoes:'Aguardar resposta do escritório.',updated_at:'2026-11-13T11:00:00Z',
  dados:{observacao:'Cliente solicitou última atualização.',evento_resumo:'Petição aguardando análise.'}};

test('only retains evidence explicitly bound to the exact process and company',()=>{
 const result=compileCaseEvidence(process,{
  audits:[
   {empresa_id:company,protocolo_ref:process.protocolo_ref,action:'atendimento',detalhes:{resumo:'Retorno realizado'},created_at:'2026-11-13T12:00:00Z'},
   {empresa_id:'outro',protocolo_ref:process.protocolo_ref,action:'atendimento',detalhes:{resumo:'DADO DE OUTRA EMPRESA'},created_at:'2026-11-13T12:00:00Z'},
   {empresa_id:company,protocolo_ref:'9999999',action:'atendimento',detalhes:{resumo:'OUTRO PROCESSO'}}
  ],
  hermes:[
   {empresa_id:company,processo_id:42,highlights:{info:'aguarda'},checked_at:'2026-11-13T13:00:00Z'},
   {empresa_id:company,processo_id:43,highlights:{info:'OUTRO PROCESSO'}}
  ],
  snapshots:[{empresa_id:company,process_number:'12345678920268260001',source:'djen',found:true,checked_at:'2026-11-13T14:00:00Z'}],
  activities:[{empresa_id:company,negocio_id:'abc',titulo:'Consulta',corpo:'Atendimento interno',created_at:'2026-11-13T12:00:00Z'},
              {empresa_id:'other',negocio_id:'abc',titulo:'Outro',corpo:'DADO DE OUTRA EMPRESA'}],
  businessIds:['abc']
 });
 const saved=JSON.stringify(result);
 assert.equal(result.audit.length,1);
 assert.equal(result.hermes.length,1);
 assert.equal(result.activities.length,1);
 assert.equal(result.officialChecks.length,1);
 assert.ok(!saved.includes('DADO DE OUTRA EMPRESA'));
 assert.ok(!saved.includes('OUTRO PROCESSO'));
 assert.equal(result.autoDiscloseInternalEvidence,false);
});

test('notes are flagged as unverified internal context, not an official court movement',()=>{
 const result=compileCaseEvidence(process,{});
 assert.equal(result.notes.length,3);
 assert.ok(result.notes.every(x=>x.classification==='internal_unverified'));
 assert.ok(result.notes.every(x=>x.text.length<=1200));
 assert.equal(result.processo_id,42);
});

test('malformed data cannot accidentally link two processes',()=>{
 const result=compileCaseEvidence({...process,protocolo_ref:'sem-cnJ'},{
  snapshots:[{empresa_id:company,process_number:'12345678920268260001',source:'datajud'}],
  audits:[{empresa_id:company,protocolo_ref:'1234567-89.2026.8.26.0001',action:'atendimento'}]
 });
 assert.equal(result.officialChecks.length,0);
 assert.equal(result.audit.length,0);
});
