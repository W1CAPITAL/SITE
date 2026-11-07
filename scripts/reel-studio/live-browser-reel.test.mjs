import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENES,FPS,validateScenes} from './live-browser-reel.mjs';
test('reel presents real W1 portfolio and Lexis landing, with a hook and a direct CTA',()=>{
 assert.equal(FPS,24);
 const duration=validateScenes();
 assert.ok(duration>=8&&duration<=16);
 assert.ok(SCENES[0].seconds<=2);
 assert.equal(SCENES[0].kind,'founder');
 assert.ok(SCENES.some(s=>s.url==='/lexispredict/'));
 assert.ok(SCENES.some(s=>s.kind==='concept'));
 assert.match(SCENES.at(-1).caption,/LEXIS.*DIRECT/);
});
test('only first party pages and no invented functional product claims',()=>{
 const allowed=new Set(['/portfolio/','/lexispredict/','/sites/','/sites/demo-autentica/']);
 assert.ok(SCENES.every(s=>allowed.has(s.url)));
 assert.ok(SCENES.every(s=>!/economiza [0-9]|clientes reais|resultados garantidos|medxai|crm.elite/.test(s.caption.toLowerCase())));
 assert.ok(SCENES.filter(s=>s.kind==='proof').length===0);
});
