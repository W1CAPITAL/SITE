import test from 'node:test';
import assert from 'node:assert/strict';
import { LexisAgentDb } from '../src/lexis-agent-db.js';
const company='d37fd4bb-1c71-4dca-b97e-292355918d39';
test('Lexis evidence queries require exact tenant and process, not matching names',async()=>{
 const db=new LexisAgentDb({LEXIS_SUPABASE_SERVICE_ROLE_KEY:'Z'.repeat(35)});
 const calls=[];
 db.call=async(table,params)=>{
   calls.push({table,params});
   if(table==='crm_negocios')return [{id:'26f047e3-70cf-4f22-8143-068c65e1db4b',empresa_id:company,protocolo_cnj:'1234567-89.2026.8.26.0001',observacao:'Retorno do escritório'}];
   if(table==='crm_atividades')return [{empresa_id:company,negocio_id:'26f047e3-70cf-4f22-8143-068c65e1db4b',titulo:'Atendimento',corpo:'Cliente atualizado'}];
   return [];
 };
 const evidence=await db.getCaseEvidence({id:42,empresa_id:company,protocolo_ref:'1234567-89.2026.8.26.0001',observacoes:'Próximo retorno agendado'});
 assert.equal(evidence.activities.length,1);
 assert.equal(evidence.notes.length,1);
 assert.ok(calls.every(c=>c.params.empresa_id==='eq.'+company));
 assert.ok(calls.every(c=>!('cliente' in c.params)&&!('phone' in c.params)));
});
test('rejects cross-tenant evidence access before any query',async()=>{
 const db=new LexisAgentDb({LEXIS_SUPABASE_SERVICE_ROLE_KEY:'Z'.repeat(35)});
 let calls=0;db.call=async()=>{calls++};
 await assert.rejects(()=>db.getCaseEvidence({id:42,empresa_id:'different-tenant',protocolo_ref:'1234567-89.2026.8.26.0001'}),/wrong_tenant/);
 assert.equal(calls,0);
});
