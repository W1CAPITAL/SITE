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
        if(shouldRecover({socket:this.socket,state:this.state.state,now:Date.now(),retryAfter:this.retryAfter}))await this.connect(false);
        return this.statusResponse();
      }
      if(path==='/api/connect' && req.method==='POST'){
        await this.connect(true);
        if(!this.socket && this.state.state==='stopped')await this.connect(true);
        return this.statusResponse();
      }
      if(path==='/api/chats' && req.method==='GET')return Response.json({chats:[...this.ctx.storage.sql.exec('SELECT * FROM chats ORDER BY last_at DESC LIMIT 400')]});
      if(path==='/api/messages' && req.method==='GET'){
        const jid=url.searchParams.get('jid');
        if(!validJid(jid))return Response.json({error:'Conversa inválida'},{status:400});
        return Response.json({messages:[...this.ctx.storage.sql.exec('SELECT jid,id,text,at,from_me FROM messages WHERE jid=? ORDER BY at DESC LIMIT 150',jid)].reverse()});
      }
      if(path==='/api/history' && req.method==='POST'){
        const body=await req.json().catch(()=>null),jid=body?.jid;
        if(!validJid(jid))return Response.json({error:'Conversa inválida'},{status:400});
        if(this.state.state!=='connected'||!this.socket)return Response.json({error:'WhatsApp desconectado. Reconecte antes de buscar mensagens anteriores.'},{status:409});
        const oldest=[...this.ctx.storage.sql.exec('SELECT id,at,from_me FROM messages WHERE jid=? ORDER BY at ASC LIMIT 1',jid)][0];
        const anchor=historyRequestAnchor(jid,oldest);
        if(!anchor)return Response.json({error:'Ainda não há mensagens sincronizadas para usar como ponto de partida. Aguarde a sincronização inicial pelo WhatsApp.'},{status:422});
        const key='history:requested:'+jid;
        const previous=Number(await this.ctx.storage.get(key)||0);
        if(Date.now()-previous<90000)return Response.json({error:'Solicitação de histórico em andamento. Aguarde a sincronização.'},{status:429});
        await this.ctx.storage.put(key,Date.now());
        const sock=this.socket;
        this.ctx.waitUntil(Promise.resolve().then(()=>sock.fetchMessageHistory(100,anchor.key,anchor.timestamp)).catch(async error=>{
          this.reportDataFailure('history-request',error);
          await this.ctx.storage.delete(key);
        }));
        return Response.json({ok:true,notice:'Pedido de histórico enviado ao WhatsApp. A entrega depende da sincronização do aparelho.'},{status:202});
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
        this.ctx.waitUntil(this.ensureAlarm(60000).catch(error=>this.reportDataFailure('maintenance-schedule',error)));
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
          this.ctx.waitUntil(this.ensureAlarm(30000).catch(error=>this.reportDataFailure('reconnect-schedule',error)));
        }
      }
    });

    socket.ev.on('messages.upsert',e=>{
      try { this.saveRows(normalizeHistory(e.messages)); }
      catch(error) { this.reportDataFailure('live-messages',error); }
    });
    socket.ev.on('messaging-history.set',e=>{
      // Import in bounded durable chunks; a large history must not block the socket.
      this.ctx.waitUntil(this.enqueueHistory(e).catch(error=>this.reportDataFailure('history',error)));
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

  reportDataFailure(area,error){
    // Never log message bodies, identifiers or credentials.
    console.error('zapfast-storage',area,error?.name||'Error',error?.code||'');
  }
  safeImport(items,process,area){
    for(const item of Array.isArray(items)?items:[]){
      try{process(item)}catch(error){this.reportDataFailure(area,error);}
    }
  }
  saveRows(rows){
    if(rows.length)persistHistoryBatch(this.ctx.storage.sql,rows);
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
    const batch=await this.ctx.storage.list({prefix:'history:pending:',limit:5});
    for(const [key,rows] of batch){
      try{
        this.saveRows(rows);
        await this.ctx.storage.delete(key);
      }catch(error){
        this.reportDataFailure('history-alarm',error);
        await this.ensureAlarm(30000);
        return;
      }
    }
    const remaining=await this.ctx.storage.list({prefix:'history:pending:',limit:1});
    if(remaining.size) {
      await this.ensureAlarm(wakeAfter(true));
      return;
    }
    if(shouldRecover({socket:this.socket,state:this.state.state,now:Date.now(),retryAfter:this.retryAfter})) {
      await this.connect(false);
    }
    // A session is not guaranteed to remain alive forever in the Free plan.
    // Alarms provide best-effort recovery without a local computer.
    if(this.state.state!=='stopped' && this.state.state!=='logged_out')await this.ensureAlarm(wakeAfter(false));
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
    if(!['/api/status','/api/connect','/api/chats','/api/messages','/api/history','/api/send'].includes(url.pathname))return jsonError('Rota inválida',404);
    const obj=env.WA.get(env.WA.idFromName('one-whatsapp'));
    return obj.fetch(new Request('https://internal'+url.pathname+url.search,request));
  }
};