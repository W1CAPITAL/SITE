import test from 'node:test';
import assert from 'node:assert/strict';
import {config,args,run} from './render.mjs';
const env={NODE_ENV:'production',OPEN_HIGGSFIELD_BASE_URL:'https://studio.example.com',
  OPEN_HIGGSFIELD_ACCESS_CLIENT_ID:'id',OPEN_HIGGSFIELD_ACCESS_CLIENT_SECRET:'secret',
  OPEN_HIGGSFIELD_GENERATION_ENABLED:'true'};
test('blocks exposed URLs and missing access keys',()=>{
  assert.throws(()=>config({...env,OPEN_HIGGSFIELD_ACCESS_CLIENT_SECRET:''}));
  assert.throws(()=>config({...env,OPEN_HIGGSFIELD_BASE_URL:'http://studio.example.com'}));
});
test('doctor checks readiness and model list',async()=>{
  const fetcher=async url=>Response.json(String(url).endsWith('/api/ready')?{ready:true}:{model_list:[{id:'veo',label:'Veo',provider:'google'}]});
  assert.deepEqual(await run(['doctor'],{env,fetcher}),{ready:true,enabled:true,models:1});
});
test('generate validates model and sends one multipart request with expected origin',async()=>{
  const calls=[];
  const fetcher=async(url,init)=>{
    calls.push({url:String(url),init});
    if(String(url).endsWith('/api/models'))return Response.json({model_list:[{id:'veo',label:'Veo'}]});
    return Response.json({accepted:true,recovery_required:false,task_id:'task_test'},{status:202});
  };
  const result=await run(['generate','veo','Cena profissional','5','9:16'],{env,fetcher});
  assert.equal(result.taskId,'task_test');
  assert.equal(calls.length,2);
  assert.equal(calls[1].init.body.get('prompt'),'Cena profissional');
  assert.equal(calls[1].init.headers.Origin,'https://studio.example.com');
});
test('disables generation and rejects invalid task IDs',async()=>{
  await assert.rejects(()=>run(['generate','veo','Cena'],{env:{...env,OPEN_HIGGSFIELD_GENERATION_ENABLED:'false'}}));
  assert.throws(()=>args(['unknown']));
  await assert.rejects(()=>run(['status','../bad'],{env}));
});
