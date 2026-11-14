import { DurableObject } from 'cloudflare:workers';
import makeWASocket, { createAuthenticationState } from '@oxidezap/baileyrs/host';
import { initSync } from '@oxidezap/whatsapp-rust-bridge/host';
import wasm from './bridge.wasm';
import qrcode from 'qrcode-generator';

import { validJid, textMessage, timestamp } from './format.js';

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
        if(!this.socket && Date.now()>=this.retryAfter && this.state.state!=='logged_out')await this.connect(false);
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
        return Response.json({messages:[...this.ctx.storage.sql.exec('SELECT * FROM messages WHERE jid=? ORDER BY at DESC LIMIT 150',jid)].reverse()});
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
      else if(connection==='open'){this.state={state:'connected'};this.retryAfter=0;}
      else if(connection==='connecting')this.state={state:'connecting'};
      else if(connection==='close'){
        this.socket=undefined;
        const code=lastDisconnect?.error?.output?.statusCode;
        if(code===401){
          this.state={state:'logged_out'};
          void this.clearAuth().catch(()=>{this.state={state:'closed',error:'Não foi possível limpar sessão'};});
        }else{this.state={state:'closed',error:'Conexão interrompida'};this.retryAfter=Date.now()+30000;}
      }
    });
    socket.ev.on('messages.upsert',e=>{for(const m of e.messages||[])this.importMessage(m);});
    socket.ev.on('messaging-history.set',e=>{
      for(const c of e.contacts||[])this.saveContact(c);
      for(const c of e.chats||[])this.saveChat(c);
      for(const m of e.messages||[])this.importMessage(m);
    });
    socket.ev.on('contacts.upsert',list=>{for(const c of list)this.saveContact(c);});
    socket.ev.on('contacts.update',list=>{for(const c of list)this.saveContact(c);});
    socket.ev.on('chats.upsert',list=>{for(const c of list)this.saveChat(c);});
    socket.ev.on('chats.update',list=>{for(const c of list)this.saveChat(c);});
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
  importMessage(m){
    const jid=m?.key?.remoteJid,id=m?.key?.id;
    if(!validJid(jid)||typeof id!=='string'||!id||id.length>180)return;
    this.saveMessage({jid,id,text:textMessage(m),at:timestamp(m.messageTimestamp),from_me:m.key.fromMe?1:0});
  }
  saveMessage(m){
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO messages(jid,id,text,at,from_me) VALUES(?,?,?,?,?)',m.jid,m.id,m.text,m.at,m.from_me);
    this.ctx.storage.sql.exec('INSERT INTO chats(jid,last_at,preview) VALUES(?,?,?) ON CONFLICT(jid) DO UPDATE SET last_at=MAX(chats.last_at,excluded.last_at),preview=CASE WHEN excluded.last_at>=chats.last_at THEN excluded.preview ELSE chats.preview END',m.jid,m.at,m.text.slice(0,150));
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
    if(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<20)return jsonError('Configure a senha do administrador',503);
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
    if(!['/api/status','/api/connect','/api/chats','/api/messages','/api/send'].includes(url.pathname))return jsonError('Rota inválida',404);
    const obj=env.WA.get(env.WA.idFromName('one-whatsapp'));
    return obj.fetch(new Request('https://internal'+url.pathname+url.search,request));
  }
};