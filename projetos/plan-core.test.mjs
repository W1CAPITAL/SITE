import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan,PROVIDERS} from './plan-core.mjs';
test('Reel tem gancho, prova real, CTA e revisão',()=>{
 const p=buildPlan({brand:'w1',format:'reel',topic:'um site comercial que funciona'});
 assert.equal(p.scenes.length,5);
 assert.match(p.scenes[0].role,/gancho/i);
 assert.match(p.scenes[2].role,/demonstração real/i);
 assert.match(p.scenes.at(-1).role,/convite/i);
 assert.match(p.checklist.join(' '),/música licenciada/i);
});
test('Carrossel usa imagem e print de interface com chamada grande',()=>{
 const p=buildPlan({brand:'lexis',format:'carrossel',topic:'organização de prazos'});
 assert.equal(p.brand,'LexisPredict');
 assert.equal(p.scenes.length,6);
 assert.match(p.scenes[0].visual,/interface/i);
 assert.match(p.scenes[1].visual,/print/i);
});
test('Não aceita tema vazio, marcas arbitrárias ou assunto exageradamente longo',()=>{
 for(const x of [
 {brand:'w1',format:'reel',topic:' '},{brand:'qualquer',format:'reel',topic:'abc'},
 {brand:'w1',format:'filme',topic:'abc'},{brand:'w1',format:'reel',topic:'a'.repeat(181)}
 ])assert.throws(()=>buildPlan(x));
});
test('Catálogo distingue status real e limitações de licença e ambiente',()=>{
 assert.equal(PROVIDERS.find(x=>x.id==='hypit').usage,'internal-only');
 assert.equal(PROVIDERS.find(x=>x.id==='motionsmith-unreal').usage,'external-unreal');
 assert.equal(PROVIDERS.find(x=>x.id==='motionsmith-mcp').usage,'unverified');
});
