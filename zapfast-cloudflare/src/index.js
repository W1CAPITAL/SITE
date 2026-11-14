import { DurableObject } from 'cloudflare:workers';
import makeWASocket, { createAuthenticationState } from '@oxidezap/baileyrs/host';
import { initSync } from '@oxidezap/whatsapp-rust-bridge/host';
import wasm from './bridge.wasm';
import qrcode from 'qrcode-generator';

import { validJid, textMessage, timestamp } from './format.js';
import { getAdminConfigError } from './admin-config.js';
import { normalizeHistory, persistHistoryBatch } from './history-store.js';
import { historyRequestAnchor } from './history-anchor.js';
import { shouldRecover, wakeAfter } from './reconnect-policy.js';
import { LexisAgentDb, lexisAgentConfigured } from './lexis-agent-db.js';
import { evaluateInboundLegalMessage } from './legal-agent.js';
import { isDurableWriteQuotaError, quotaRetrySeconds, quotaResponse } from './quota-policy.js';

const authStore = storage => {
  const k=(ns,key) => 'auth:'+ns+':'+key;
  return {
    get: async(ns,key)=>(await storage.get(k(ns,key))) || null,
    set: async(ns,key,value)=>storage.put(k(ns,key),value),
    delete: async(ns,key)=>storage.delete(k(ns,key)),
    setMany: async(ns,entries)=>{if(entries.length) await storage.put(Object.fromEntries(entries.map(([key,val])=>[k(ns,key),val])));},
    getMany: async(ns,keys)=>{if(!keys.length)return [];const values=await storage.get(keys.map(key=>k(ns,key)));return keys.flatMap(key=>values.has(k(ns,key))?[[key,values.get(k(ns,key))]]:[]);},
    listKeys: async(ns,prefix='')=>[...(await storage.list({prefix:k(ns,prefix)})).keys()].map(key=>key.slice(k(ns,'').length))
  };
};
export class WaSession extends DurableObject {
  socket; state={state:'stopped'}; starting; retryAfter=0;
  constructor(ctx,env) {
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS chats(jid TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT "",last_at INTEGER NOT NULL DEFAULT 0,preview TEXT NOT NULL DEFAULT "")');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS messages(jid TEXT NOT NULL,id TEXT NOT NULL,text TEXT NOT NULL,at INTEGER NOT NULL,from_me INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(jid,id))');
    ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS messages_chat_at ON messages(jid,at DESC)');
  }
  statusResponse() {
    if(this.state.qr) {
      try { const qr=qrcode(0,'M');qr.addData(this.state.qr);qr.make();
        return Response.json({state:this.state.state,qrSvg:qr.createSvgTag(5,6)});
      }catch(e){return Response.json({state:'closed',error:'QR indisponível'});}
    }
    return Response.json(this.state);
  }
  async fetch(req) {
    const url=new URL(req.url), path=url.pathname;
    try {
      if(path==='/api/status' && req.method==='GET'){
        // Status checks must never start WhatsApp or spend SQLite writes.
        return this.statusResponse();
      }
      if(path==='/api/connect' && req.method==='POST'){
        await this.connect(true);
        return this.statusResponse();
      }
      if(path==='/api/agent/status' && req.method==='GET')return Response.json({configured:lexisAgentConfigured(this.env),mode:this.env.ZAPFAST_AGENT_AUTOSEND==='true'?'inbound_approved_auto':'review_only',tenant:'LexisPredict',safe_limits:'10/dia, intervalo >=20min, dias úteis 9h-17h',rules:['Somente mensagens privadas recebidas','Contato autorizado e processo da empresa','Somente fontes oficiais recentes','Outras perguntas seguem para revisão','Sem campanhas ou mensagens em massa']});
      if(path.startsWith('/api/agent/'))return this.agentRequest(req,url);
      if(path==='/api/chats' && req.method==='GET')return Response.json({chats:[...this.ctx.storage.sql.exec('SELECT * FROM chats ORDER BY last_at DESC LIMIT 400')]});
      if(path==='/api/messages' && req.method==='GET'){
        const jid=url.searchParams.get('jid');
        if(!validJid(jid))return Response.json({error:'Conversa inválida'},{status:400});
        return Response.json({messages:[...this.ctx.storage.sql.exec('SELECT jid,id,text,at,from_me FROM messages WHERE jid=? ORDER BY at DESC LIMIT 150',jid)].reverse()});
      }
      if(path==='/api/history' && req.method==='POST') {
        return Response.json({error:'A sincronização de histórico antigo foi pausada para não esgotar novamente o limite gratuito de gravações. As mensagens já guardadas foram preservadas.'},{status:422});
      }
      if(path==='/api/send' && req.method==='POST'){
        const data=await req.json().catch(()=>null);
        if(!validJid(data?.jid) || typeof data?.text!=='string' ||
           !data.text.trim() || data.text.length>4096)return Response.json({error:'Mensagem inválida'},{status:400});
        if(this.state.state!=='connected'||!this.socket)return Response.json({error:'WhatsApp desconectado'},{status:409});
        const text=data.text.trim(), jid=data.jid;
        const sent=await this.socket.sendMessage(jid,{text});
        this.saveMessage({jid,id:sent?.key?.id || crypto.randomUUID(),text,at:Math.floor(Date.now()/1000),from_me:1});
        return Response.json({ok:true});
      }
      return new Response('Não encontrado',{status:404});
    }catch(e){ console.error('zapfast-operation',e?.name||'error');
      return Response.json({error:'Operação indisponível, tente novamente'},{status:503});}
  }
  async connect(pair) {
    if(this.socket)return;
    if(this.starting){await this.starting;return;}
    if(this.state.state==='closed'&&Date.now()<this.retryAfter)return;
    const task=this.open(pair).catch(e=>{
      console.error('zapfast-start',e?.name||'error');
      this.state={state:'closed',error:'Não foi possível conectar'};this.retryAfter=Date.now()+30000;
    });
    this.starting=task;
    try{await task;}finally{if(this.starting===task)this.starting=undefined;}
  }
  async open(pair) {
    initSync({module:wasm});
    const auth=await createAuthenticationState(authStore(this.ctx.storage));
    if(!auth.creds.registered&&!pair){this.state={state:'stopped'};return;}
    this.state={state:'connecting'};
    const socket=makeWASocket({auth,version:[2,3000,1043857760],logger:undefined});
    this.socket=socket;this.retryAfter=0;
    socket.ev.on('connection.update',({connection,qr,lastDisconnect})=>{
      if(qr)this.state={state:'waiting_for_qr',qr};
      else if(connection==='open'){
        this.state={state:'connected'};this.retryAfter=0;
        // No recurring alarms: each alarm writes a SQLite row in the Free plan.
      }
      else if(connection==='connecting')this.state={state:'connecting'};
      else if(connection==='close'){
        this.socket=undefined;
        const code=lastDisconnect?.error?.output?.statusCode;
        if(code===401){
          this.state={state:'logged_out'};
          void this.clearAuth().catch(()=>{this.state={state:'closed',error:'Não foi possível limpar sessão'};});
        }else{
          this.state={state:'closed',error:'Conexão interrompida'};this.retryAfter=Date.now()+30000;
          // Require explicit reconnect while running on the Free plan.
        }
      }
    });

    socket.ev.on('messages.upsert',e=>{
      // Avoid importing huge WhatsApp history as repeated message upserts.
      if(e?.type==='notify'){
        try { this.saveRows(normalizeHistory(e.messages).slice(-20)); }
        catch(error) { this.reportDataFailure('live-messages',error); }
      }
      if(e?.type!=='notify' || !lexisAgentConfigured(this.env))return;
      for(const message of e.messages||[]){
        const received=timestamp(message?.messageTimestamp)*1000;
        // Never auto-answer old messages replayed after reconnect or history import.
        if(message?.key?.fromMe || Math.abs(Date.now()-received)>5*60*1000)continue;
        this.agentSequence=(this.agentSequence||Promise.resolve()).then(async()=>{
          const jid=message?.key?.remoteJid;
          const previous=jid?[...this.ctx.storage.sql.exec('SELECT MAX(at) AS at FROM messages WHERE jid=? AND from_me=1',jid)][0]?.at:null;
          const humanRecentlyAnswered=Number(previous)>0 && Date.now()-Number(previous)*1000<24*60*60*1000;
          const db=new LexisAgentDb(this.env);
          return evaluateInboundLegalMessage({message,db,socket:this.state.state==='connected'?this.socket:null,
            autoSend:this.env.ZAPFAST_AGENT_AUTOSEND==='true',contactRecentlyAnswered:humanRecentlyAnswered});
        }).catch(error=>this.reportDataFailure('agent-inbound',error));
        this.ctx.waitUntil(this.agentSequence);
      }
    });
    socket.ev.on('messaging-history.set',e=>{
      // Keep only a small initial sample. Do not enqueue thousands of old
      // messages: a prior sync exhausted the Cloudflare Free daily write quota.
      try {
        this.safeImport((e.contacts||[]).slice(0,30),c=>this.saveContact(c),'initial-contacts');
        this.safeImport((e.chats||[]).slice(0,30),c=>this.saveChat(c),'initial-chats');
        this.saveRows(normalizeHistory(e.messages).slice(-50));
      }catch(error){this.reportDataFailure('limited-history',error);}
    });
    for (const type of ['contacts.upsert','contacts.update']) {
      socket.ev.on(type,list=>this.safeImport(list,c=>this.saveContact(c),'contacts'));
    }
    for (const type of ['chats.upsert','chats.update']) {
      socket.ev.on(type,list=>this.safeImport(list,c=>this.saveChat(c),'chats'));
    }
  }
  saveContact(c){
    const jid=c?.id;if(!validJid(jid))return;
    const name=String(c.name||c.notify||c.verifiedName||'').slice(0,180);if(!name)return;
    this.ctx.storage.sql.exec('INSERT INTO chats(jid,name) VALUES(?,?) ON CONFLICT(jid) DO UPDATE SET name=excluded.name',jid,name);
  }
  saveChat(c){
    const jid=c?.id;if(!validJid(jid))return;
    const name=String(c.name||c.subject||'').slice(0,180);
    const at=c.conversationTimestamp?timestamp(c.conversationTimestamp):0;
    this.ctx.storage.sql.exec('INSERT INTO chats(jid,name,last_at) VALUES(?,?,?) ON CONFLICT(jid) DO UPDATE SET name=CASE WHEN excluded.name!="" THEN excluded.name ELSE chats.name END,last_at=MAX(chats.last_at,excluded.last_at)',jid,name,at);
  }

  async agentRequest(req,url){
    if(!lexisAgentConfigured(this.env))return Response.json({error:'Agente sem conexão autorizada ao banco do LexisPredict. Configure LEXIS_SUPABASE_SERVICE_ROLE_KEY como Secret de produção; nenhuma mensagem será enviada enquanto estiver ausente.'},{status:503});
    const db=new LexisAgentDb(this.env),path=url.pathname;
    try{
      if(path==='/api/agent/queue'&&req.method==='GET')return Response.json({items:await db.listQueue()});
      if(path==='/api/agent/search'&&req.method==='GET')return Response.json({cases:await db.searchCases(url.searchParams.get('q')||'')});
      if(path==='/api/agent/approve'&&req.method==='POST'){
        const body=await req.json().catch(()=>null);
        if(!body||typeof body.jid!=='string'||!Number.isSafeInteger(Number(body.processo_id)))return Response.json({error:'Dados incompletos'},{status:400});
        await db.approveContact(body.jid,Number(body.processo_id),body.evidence);
        return Response.json({ok:true,notice:'Contato autorizado para futuras mensagens processuais, mediante comprovação registrada. Não foi enviada mensagem.'});
      }
      return Response.json({error:'Rota desconhecida'},{status:404});
    }catch(error){
      this.reportDataFailure('agent-api',error);
      return Response.json({error:'Não foi possível consultar o cadastro ou registrar a autorização no LexisPredict.'},{status:503});
    }
  }
  reportDataFailure(area,error){
    // Never log message bodies, identifiers or credentials.
    console.error('zapfast-storage',area,error?.name||'Error',error?.code||'');
  }
  safeImport(items,process,area){
    // Cumulative per-isolate budget for contact/chat metadata. History is
    // never allowed to consume the free-tier daily write allowance in bulk.
    const allowed=Math.max(0,120-(this.metadataWrites||0));
    for(const item of (Array.isArray(items)?items:[]).slice(0,Math.min(allowed,40))){
      try {process(item);this.metadataWrites=(this.metadataWrites||0)+1;}
      catch(error){this.reportDataFailure(area,error);break;}
    }
  }
  saveRows(rows){
    const allowed=Math.max(0,300-(this.messageWrites||0));
    const subset=rows.slice(0,allowed);
    if(subset.length){persistHistoryBatch(this.ctx.storage.sql,subset);this.messageWrites=(this.messageWrites||0)+subset.length;}
  }
  saveMessage(m){this.saveRows([m]);}
  async enqueueHistory(event){
    this.safeImport(event?.contacts,c=>this.saveContact(c),'history-contacts');
    this.safeImport(event?.chats,c=>this.saveChat(c),'history-chats');
    const rows=normalizeHistory(event?.messages);
    if(!rows.length)return;
    // SQLite writes are moved to DO alarms, so the event handling remains responsive.
    for(let i=0;i<rows.length;i+=25) {
      await this.ctx.storage.put('history:pending:'+crypto.randomUUID(),rows.slice(i,i+25));
    }
    await this.ensureAlarm(1000);
  }
  async ensureAlarm(delay){
    const next=Date.now()+delay;
    const existing=await this.ctx.storage.getAlarm();
    if(existing===null||existing>next)await this.ctx.storage.setAlarm(next);
  }
  async alarm(){
    // Intentionally no recurring writes. Previously queued history is
    // preserved in storage, not deleted or drained automatically.
  }
  async clearAuth(){
    for(const key of (await this.ctx.storage.list({prefix:'auth:'})).keys())await this.ctx.storage.delete(key);
  }
}
const encode=new TextEncoder();
async function sign(value,secret){
  const key=await crypto.subtle.importKey('raw',encode.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,encode.encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function authenticated(req,secret){
  const raw=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('zf_session='))?.slice(11);
  if(!raw)return false;
  const [until,sig]=raw.split('.');
  if(!/^\d{13}$/.test(until)||Date.now()>Number(until)||!sig)return false;
  return await sign(until,secret)===sig;
}
const jsonError=(error,status)=>Response.json({error},{status});
let storageQuotaBlockedUntil=0;
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
    const configError=getAdminConfigError(env.ADMIN_PASSWORD);
    if(configError)return jsonError(configError,503);
    if(url.pathname==='/api/login'&&request.method==='POST'){
      if(request.headers.get('origin')!==url.origin)return jsonError('Origem inválida',403);
      const body=await request.json().catch(()=>null);
      if(body?.password!==env.ADMIN_PASSWORD)return jsonError('Senha incorreta',401);
      const until=String(Date.now()+43200000),signature=await sign(until,env.ADMIN_PASSWORD);
      return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json',
        'Set-Cookie':'zf_session='+until+'.'+signature+'; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200'}});
    }
    if(!await authenticated(request,env.ADMIN_PASSWORD))return jsonError('Acesso não autorizado',401);
    if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return jsonError('Origem inválida',403);
    if(url.pathname==='/api/logout'&&request.method==='POST')return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Set-Cookie':'zf_session=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}});
    if(!['/api/status','/api/connect','/api/chats','/api/messages','/api/history','/api/send','/api/agent/status','/api/agent/queue','/api/agent/search','/api/agent/approve'].includes(url.pathname))return jsonError('Rota inválida',404);
    if(url.pathname==='/api/agent/status'){
      return Response.json({configured:lexisAgentConfigured(env),mode:env.ZAPFAST_AGENT_AUTOSEND==='true'?'inbound_approved_auto':'review_only',
        tenant:'LexisPredict',safe_limits:'10/dia, intervalo >=20min, dias úteis 9h-17h',
        rules:['Somente mensagens privadas recebidas','Contato autorizado e processo da empresa','Sem campanhas ou mensagens em massa']});
    }
    if(Date.now()<storageQuotaBlockedUntil)return quotaResponse(url.pathname);
    try {
      const obj=env.WA.get(env.WA.idFromName('one-whatsapp'));
      return await obj.fetch(new Request('https://internal'+url.pathname+url.search,request));
    }catch(error){
      if(isDurableWriteQuotaError(error)){
        storageQuotaBlockedUntil=Date.now()+quotaRetrySeconds()*1000;
        console.warn('zapfast-quota-blocked','durable-objects-free-rows');
        return quotaResponse(url.pathname);
      }
      console.error('zapfast-runtime',error?.name||'Error');
      return jsonError('Falha na sessão do WhatsApp. Nenhum envio foi confirmado.',503);
    }
  }
};