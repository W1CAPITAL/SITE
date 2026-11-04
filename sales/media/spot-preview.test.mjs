import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {sceneAt,clampTime,DURATION} from "./spot-preview.js";
const root=dirname(fileURLToPath(import.meta.url));
const page=readFileSync(resolve(root,"spot-preview.html"),"utf8");
const story=JSON.parse(readFileSync(resolve(root,"spot-storyboard.json"),"utf8"));

test("15-second storyboard segments are contiguous and seekable",()=>{
  assert.equal(DURATION,15);
  assert.deepEqual(story.scenes.map(s=>[s.start,s.end]),[[0,4],[4,8],[8,12],[12,15]]);
  for(const [time,scene] of [[0,0],[3.9,0],[4,1],[7.9,1],[8,2],[11.9,2],[12,3],[15,3]])
    assert.equal(sceneAt(time),scene);
  assert.equal(clampTime(-50),0);
  assert.equal(clampTime(50),15);
  assert.equal(clampTime("NaN"),0);
});
test("preview is a genuinely original visual storyboard, not a claimed MP4",()=>{
  assert.match(page,/storyboard navegável/);
  assert.match(page,/não um vídeo MP4 pronto/);
  assert.match(page,/prefers-reduced-motion/);
  assert.match(page,/spot-preview\.js/);
  assert.equal(story.render.status,"nao_gerado");
  assert.equal(story.audio.music,"none");
  assert.equal(story.audio.voice,"none");
  assert.equal(story.legal.noUnauthorizedFacesOrVoiceCloning,true);
});
