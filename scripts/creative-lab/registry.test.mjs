import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {CREATIVE_TOOLS,findCreativeTool,installableTools} from "./registry.mjs";
const directory=dirname(fileURLToPath(import.meta.url));
const root=resolve(directory,"../..");

test("preserves existing creative engines alongside the new candidates",()=>{
  for(const id of ["open-higgsfield","genjutsu-sirio","genjutsu-abdullayev","genjutsu-anil","voicestudio",
    "hypit","youtube-shorts","motionsmith-mcp","motionsmith-unreal"]){
    assert.ok(findCreativeTool(id),id+" missing");
  }
  assert.equal(new Set(CREATIVE_TOOLS.map(t=>t.id)).size,CREATIVE_TOOLS.length);
});

test("only Hypit and YouTube Shorts have automated private-worker installers",()=>{
  assert.deepEqual(installableTools().map(t=>t.id),["hypit","youtube-shorts"]);
  const hypit=findCreativeTool("hypit");
  assert.match(hypit.license,/restri|comercial|multiusu/i);
  assert.match(findCreativeTool("motionsmith-unreal").requirements.join(" "),/Unreal Engine 5\.8/);
  assert.equal(findCreativeTool("motionsmith-mcp").state,"unverified");
});

test("installer requires opt-in and uses pinned commits, not moving branches",()=>{
  const script=readFileSync(resolve(directory,"install-private.sh"),"utf8");
  assert.match(script,/W1_CREATIVE_INSTALL/);
  assert.match(script,/2d31e88765e297f0795348b460c77a6067f12261/);
  assert.match(script,/13451d439b71643bd3e9df091e0f3ca786610dc9/);
  assert.doesNotMatch(script,/curl.*\|\s*(bash|sh)|sudo |pip install --break-system-packages/);
});

test("the 7-tab portfolio still includes Projects and the real W1 Reel Studio work",()=>{
  const js=readFileSync(resolve(root,"portfolio/script.js"),"utf8");
  const html=readFileSync(resolve(root,"portfolio/index.html"),"utf8");
  assert.match(html,/data-tab="projetos">Projetos/);
  assert.match(js,/name:'W1 Reel Studio'/);
  assert.match(js,/scripts\/reel-studio/);
  assert.equal(existsSync(resolve(root,"scripts/reel-studio/studio.mjs")),true);
});
