import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENES,FPS,validateScenes} from './live-browser-reel.mjs';
test('storyboard requires actual site footage, conceptual labelling and short hook',()=>{
 assert.equal(FPS,24);assert.ok(validateScenes()>=8);
 assert.ok(SCENES.length>=6);assert.equal(SCENES[0].seconds<=2,true);
 assert.ok(SCENES.every(s=>s.url.startsWith('/sites/')));
 assert.ok(SCENES.some(s=>s.kind==='concept'));
 assert.match(SCENES.at(-1).caption,/DIRECT/);
});
test('no fake clients or third-party video in storyline',()=>{
 assert.equal(SCENES.filter(s=>s.kind==='proof').length,0);
 assert.ok(SCENES.every(s=>!/medxai|crm\.elite|luis/.test(s.url)));
});