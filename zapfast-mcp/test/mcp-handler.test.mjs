import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpRequest } from '../src/mcp-handler.js';
import { DeliveryStore } from '../src/delivery-store.js';

class FakeStorage {
  constructor(){this.data=new Map();}
  async get(key){return this.data.get(key);}
  async put(key,value){this.data.set(key,structuredClone(value));}
  async delete(key){return this.data.delete(key);}
  async list({prefix=''}={}){return new Map([...this.data].filter(([k])=>k.startsWith(prefix)));}
  async transaction(callback){
    const snapshot=new Map([...this.data].map(([k,v])=>[k,structuredClone(v)]));
    const tx={get:async key=>snapshot.get(key),put:async(key,value)=>snapshot.set(key,structuredClone(value)),delete:async key=>snapshot.delete(key)};
    const result=await callback(tx);this.data=snapshot;return result;
  }
}

function makeEnv({sendEnabled=false,state='connected'}={}) {
  const storage=new FakeStorage();
  const store=new DeliveryStore(storage);
  const sent=[];
  const wa={
    idFromName:name=>name,
    get:()=>({fetch:async request=>{
      const url=new URL(request.url);
      if(url.pathname==='/api/status') return Response.json({state,qrSvg:'DO_NOT_EXPOSE'});
      if(url.pathname==='/api/chats') return Response.json({chats:[{jid:'5511999999999@s.whatsapp.net',name:'Cliente A'},{jid:'120363012345678901@g.us',name:'Grupo'}]});
      if(url.pathname==='/api/messages') return Response.json({messages:[{text:'Oi',from_me:0},{text:'Olá',from_me:1}]});
      if(url.pathname==='/api/send') { sent.push(await request.json()); return Response.json({ok:true}); }
      return Response.json({error:'not_found'},{status:404});
    }})
  };
  const guard={
    idFromName:name=>name,
    get:()=>({fetch:async request=>{
      const url=new URL(request.url);
      try {
        if(url.pathname==='/draft') return Response.json(await store.createDraft(await request.json()),{status:201});
        if(url.pathname==='/reserve') {const b=await request.json();return Response.json(await store.reserve({id:b.draft_id,confirmText:b.confirm_text}));}
        if(url.pathname==='/finish') {const b=await request.json();return Response.json({ok:await store.finish({id:b.draft_id,status:b.status})});}
        return Response.json({error:'not_found'},{status:404});
      } catch(error) { return Response.json({error:error.message},{status:409}); }
    }})
  };
  return {env:{ZAPFAST_MCP_TOKEN:'t'.repeat(64),ZAPFAST_MCP_SEND_ENABLED:sendEnabled?'true':'false',WA:wa,GUARD:guard},sent,store};
}

async function rpc(env, method, params={}, id=1) {
  const request=new Request('https://zapfast-mcp.example/mcp',{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream','authorization':'Bearer '+'t'.repeat(64)},body:JSON.stringify({jsonrpc:'2.0',id,method,params})});
  const response=await handleMcpRequest(request,env);
  return {response,body:response.status===202?null:await response.json()};
}

function toolData(body) { return JSON.parse(body.result.content[0].text); }

test('requires a long bearer token and rejects unauthenticated MCP calls',async()=>{
  const {env}=makeEnv();
  const request=new Request('https://x/mcp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})});
  const response=await handleMcpRequest(request,{...env,ZAPFAST_MCP_TOKEN:undefined});
  assert.equal(response.status,503);
  const response2=await handleMcpRequest(request,env);
  assert.equal(response2.status,401);
});

test('initializes with supported protocol and lists only the five scoped tools',async()=>{
  const {env}=makeEnv();
  const init=await rpc(env,'initialize',{protocolVersion:'2025-11-25'});
  assert.equal(init.body.result.protocolVersion,'2025-11-25');
  assert.equal(init.body.result.serverInfo.name,'ZapFast MCP');
  assert.match(init.body.result.instructions,/INFINITUM/);
  const list=await rpc(env,'tools/list');
  assert.deepEqual(list.body.result.tools.map(t=>t.name),['zapfast_status','zapfast_list_chats','zapfast_read_messages','zapfast_draft_reply','zapfast_send_approved']);
});

test('status never exposes the existing QR code',async()=>{
  const {env}=makeEnv({state:'waiting_for_qr'});
  const result=await rpc(env,'tools/call',{name:'zapfast_status',arguments:{}});
  const data=toolData(result.body);
  assert.equal(data.qr_available,true);
  assert.equal(JSON.stringify(data).includes('DO_NOT_EXPOSE'),false);
  assert.equal(data.connected,false);
});

test('reads private chats and rejects group message access',async()=>{
  const {env}=makeEnv();
  const chats=await rpc(env,'tools/call',{name:'zapfast_list_chats',arguments:{limit:1}});
  assert.equal(toolData(chats.body).chats.length,1);
  const group=await rpc(env,'tools/call',{name:'zapfast_read_messages',arguments:{jid:'120363012345678901@g.us'}});
  assert.equal(group.body.result.isError,true);
});

test('drafts do not send, and send stays disabled until the server flag is enabled',async()=>{
  const {env,sent}=makeEnv({sendEnabled:false});
  const draft=await rpc(env,'tools/call',{name:'zapfast_draft_reply',arguments:{jid:'5511999999999@s.whatsapp.net',text:'Resposta revisada'}});
  const data=toolData(draft.body);
  assert.equal(data.sent,false);
  assert.equal(sent.length,0);
  const blocked=await rpc(env,'tools/call',{name:'zapfast_send_approved',arguments:{draft_id:data.draft_id,confirm_text:data.text,confirmation_phrase:'ENVIAR_MENSAGEM_APROVADA'}});
  assert.equal(blocked.body.result.isError,true);
  assert.equal(sent.length,0);
});

test('sends a reviewed draft once and blocks a duplicate attempt',async()=>{
  const {env,sent}=makeEnv({sendEnabled:true});
  const draft=await rpc(env,'tools/call',{name:'zapfast_draft_reply',arguments:{jid:'5511999999999@s.whatsapp.net',text:'Resposta revisada'}});
  const data=toolData(draft.body);
  const args={draft_id:data.draft_id,confirm_text:data.text,confirmation_phrase:'ENVIAR_MENSAGEM_APROVADA'};
  const sentResult=await rpc(env,'tools/call',{name:'zapfast_send_approved',arguments:args});
  assert.equal(toolData(sentResult.body).status,'transport_accepted');
  assert.equal(toolData(sentResult.body).delivery_confirmed,false);
  assert.equal(sent.length,1);
  const duplicate=await rpc(env,'tools/call',{name:'zapfast_send_approved',arguments:args});
  assert.equal(duplicate.body.result.isError,true);
  assert.equal(sent.length,1);
});
