/** W1 media CLI — client for independently hosted TechBeme/open-higgsfield (MIT). */
import { fileURLToPath } from 'node:url';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

export function config(env=process.env){
  const raw=String(env.OPEN_HIGGSFIELD_BASE_URL||'').trim();
  if(!raw)throw Error('OPEN_HIGGSFIELD_BASE_URL ausente');
  const u=new URL(raw),local=['localhost','127.0.0.1','[::1]'].includes(u.hostname);
  if(u.username||u.password||u.search||u.hash||u.pathname!=='/'||
    (u.protocol!=='https:'&&!(local&&env.NODE_ENV!=='production'&&u.protocol==='http:')))
    throw Error('URL Open-Higgsfield inválida');
  const id=String(env.OPEN_HIGGSFIELD_ACCESS_CLIENT_ID||'').trim();
  const secret=String(env.OPEN_HIGGSFIELD_ACCESS_CLIENT_SECRET||'').trim();
  if((!local&&(!id||!secret))||Boolean(id)!==Boolean(secret))
    throw Error('Cloudflare Access obrigatório para estúdio remoto');
  return{origin:u.origin,headers:id?{'CF-Access-Client-Id':id,'CF-Access-Client-Secret':secret}:{},
    enabled:env.OPEN_HIGGSFIELD_GENERATION_ENABLED==='true'};
}
export function args(argv){
  const [action,...rest]=argv;
  if(!['doctor','models','generate','status','download'].includes(action))
    throw Error('Ação: doctor | models | generate | status <id> | download <id> <arquivo.mp4>');
  return{action,rest};
}
async function request(endpoint,opts={}){
  const cfg=config(opts.env);
  const res=await (opts.fetcher||fetch)(cfg.origin+endpoint,{
    method:opts.method||'GET',body:opts.body,
    headers:{...cfg.headers,...(opts.method==='POST'?{Origin:cfg.origin}:{})},
    cache:'no-store',redirect:'error',signal:AbortSignal.timeout(opts.timeout||15000)});
  if(!res.ok)throw Error('Estúdio retornou HTTP '+res.status);
  return res;
}
const taskPattern=/^[A-Za-z0-9_-]{1,128}$/;
export async function run(argv,opts={}){
  const {action,rest}=args(argv);
  const cfg=config(opts.env);
  if(action==='doctor'){
    const ready=await(await request('/api/ready',opts)).json();
    const models=await(await request('/api/models',opts)).json();
    return{ready:ready.ready===true,enabled:cfg.enabled,
      models:Array.isArray(models.model_list)?models.model_list.length:0};
  }
  if(action==='models'){
    const data=await(await request('/api/models',opts)).json();
    return(Array.isArray(data.model_list)?data.model_list:[]).map(m=>({
      id:m.id,label:m.label,provider:m.provider}));
  }
  if(action==='generate'){
    if(!cfg.enabled)throw Error('Geração desativada. Defina OPEN_HIGGSFIELD_GENERATION_ENABLED=true.');
    const [model,prompt,duration='',aspectRatio='9:16']=rest;
    if(!model||!/^[A-Za-z0-9._:/-]{2,160}$/.test(model)||model.split('/').some(x=>x==='..'||x==='.'))
      throw Error('Modelo inválido');
    if(!prompt||prompt.length<3||prompt.length>2500)throw Error('Prompt inválido');
    const models=await(await request('/api/models',opts)).json();
    if(!(Array.isArray(models.model_list)&&models.model_list.some(x=>x.id===model)))
      throw Error('Modelo não conectado');
    const form=new FormData();
    form.set('model_id',model);form.set('prompt',prompt);
    form.set('settings',JSON.stringify({...(duration?{duration}:{}),...(aspectRatio?{aspectRatio}:{})}));
    // NEVER retry a POST: the provider may have charged even after a timeout.
    const output=await(await request('/api/generate',{
      ...opts,method:'POST',body:form,timeout:270000})).json();
    if(output.recovery_required)throw Error('Resultado incerto; consulte histórico antes de repetir');
    if(!output.accepted||!taskPattern.test(output.task_id||''))throw Error('Sem confirmação de aceite; consulte histórico');
    return{accepted:true,taskId:output.task_id};
  }
  const [id,filename]=rest;
  if(!taskPattern.test(id||''))throw Error('ID inválido');
  if(action==='status')return(await request('/api/tasks/'+encodeURIComponent(id),opts)).json();
  if(!filename||!filename.endsWith('.mp4'))throw Error('Informe arquivo de destino .mp4');
  const response=await request('/api/download/'+encodeURIComponent(id)+'?inline=1',
    {...opts,timeout:60000});
  if(!/^video\/(mp4|webm|quicktime)(;|$)/i.test(response.headers.get('content-type')||''))
    throw Error('Resposta não é vídeo');
  if(!response.body)throw Error('Resposta vazia');
  await pipeline(Readable.fromWeb(response.body),createWriteStream(filename,{flags:'wx',mode:0o600}));
  return{downloaded:true,file:filename};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  run(process.argv.slice(2)).then(data=>console.log(JSON.stringify(data,null,2)))
    .catch(e=>{console.error('Falha:',e.message);process.exitCode=1;});
}
