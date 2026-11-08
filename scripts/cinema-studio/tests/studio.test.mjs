import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../film.html',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
test('original videos play in chronological order, exactly ten seconds each',()=>{
 const found=[...html.matchAll(/<video[^>]+src="([^"]+)"[^>]+at="(\d+)"/g)];
 assert.deepEqual(found.map(x=>x[2]),['0','10','20']);
 assert.deepEqual(found.map(x=>x[1]),[
 'assets/clip_01_horizontal.mp4#t=0,10',
 'assets/clip_02_vertical.mp4#t=0,10',
 'assets/clip_03_74999.mp4#t=0,10'
 ]);
});
test('source voices muted; dubbed voice on a separate 30s track',()=>{
 assert.equal((html.match(/<video[^>]+muted/g)||[]).length,3);
 assert.match(html,/mixed_audio_30s\.wav#t=0,30/);
});
test('all native editor CLIs declared',()=>{
 for(const n of ['openfilm','hyperframes','remotion','@remotion/cli'])assert.ok(pkg.dependencies[n]);
});
