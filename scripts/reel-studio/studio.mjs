/**
 * W1 Reel Studio, independent MIT glue for Open-Higgsfield, Genjutsu exports and VoiceStudio.
 * FFmpeg editor; no model weights, paid generation or third-party source code included.
 */
import { spawn } from 'node:child_process';
import { readFile,writeFile,stat,realpath,rm,mkdir,mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GENJUTSU=Object.freeze({
 'sirioberati/Genjustsu-Open-Source-Workflow':'depth-sam-seedance',
 'abdullayevziyodulla/open-genjutsu':'multi-provider-motion',
 'Anil-matcha/open-genjutsu':'muapi-motion'
});
export const categorizeGenjutsu=name=>GENJUTSU[name]||null;
function check(ok,msg){if(!ok)throw Error(msg);}
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const rights=['owned','licensed','consented'];
const safeFile=f=>typeof f==='string'&&f.length<300&&f.length>0&&!path.isAbsolute(f)&&!f.split(/[\\/]/).includes('..')&&!/[\x00-\x1f]/.test(f)&&!f.includes('://');
const inside=(root,f)=>{let p=path.resolve(root,f);check(p.startsWith(root+path.sep),'Arquivo fora do projeto');return p;};
export function validatePlan(p){
 check(p&&p.version===1&&p.resolution==='1080x1920'&&p.fps===30,'Plano requer version=1, 1080x1920 a 30 fps');
 check(typeof p.title==='string'&&p.title.length>=3,'Título obrigatório');
 check(Array.isArray(p.shots)&&p.shots.length>=4&&p.shots.length<=14,'Use de 4 a 14 tomadas em vídeo');
 check(p.shots[0]?.role==='hook'&&p.shots.at(-1)?.role==='cta','Gancho inicial e CTA final obrigatórios');
 let duration=0;
 p.shots.forEach((s,i)=>{
  check(s&&safeFile(s.file)&&/\.(mp4|mov|mkv|webm)$/i.test(s.file),'Cena '+(i+1)+': vídeo inválido');
  check(['hook','problem','proof','solution','cta'].includes(s.role)&&['real','generated'].includes(s.kind)&&rights.includes(s.rights),'Cena '+(i+1)+': tipo ou direito inválido');
  check(finite(s.start)&&s.start>=0&&finite(s.duration)&&s.duration>=0.5&&s.duration<=6,'Cena '+(i+1)+': duração inválida');
  check(i!==0||s.duration<=2,'Gancho deve ocorrer em até 2 s');
  check(i!==p.shots.length-1||s.duration<=3,'CTA deve durar até 3 s');
  check(typeof s.caption==='string'&&s.caption.length>=3&&s.caption.length<=110,'Legenda breve obrigatória');
  if(s.kind==='generated'){
   check(s.role!=='proof','Cena gerada não comprova funcionalidade');
   check(/ilustrativ[ao]|ficcional|simula[çc][ãa]o/i.test(s.caption),'Trecho gerado precisa ser identificado como ilustrativo');
   check(s.provider==='open-higgsfield'||Boolean(categorizeGenjutsu(s.provider)),'Indique de qual gerador veio o vídeo');
   if(categorizeGenjutsu(s.provider))check(s.fullClipReviewed===true,'Revise TODO o vídeo Genjutsu antes da edição');
  }
  check(!s.framing||['blurred','cover'].includes(s.framing),'Framing inválido');
  duration+=s.duration;
 });
 check(duration>=8&&duration<=40,'Reel deve ter 8–40 s');
 check(p.shots.some(s=>s.role==='proof'&&s.kind==='real'),'Falta demonstração real verificável');
 check(p.audio&&safeFile(p.audio.voice)&&/\.(wav|mp3|flac|m4a)$/i.test(p.audio.voice),'Narração aprovada obrigatória: sem fallback robótico');
 if(p.audio.music){
  check(safeFile(p.audio.music)&&/\.(wav|mp3|flac|m4a)$/i.test(p.audio.music),'Trilha inválida');
  check(rights.includes(p.audio.musicRights),'Informe licença da trilha');
 }
 check(p.audio.musicGain===undefined||finite(p.audio.musicGain)&&p.audio.musicGain>=0&&p.audio.musicGain<=.3,'Música deve ficar abaixo da fala');
 if(p.audio.effects){
  check(safeFile(p.audio.effects)&&/\.(wav|mp3|flac|m4a)$/i.test(p.audio.effects),'Faixa de Foley inválida');
  check(rights.includes(p.audio.effectsRights),'Informe direito de uso dos efeitos sonoros');
 }
 check(p.audio.effectsGain===undefined||finite(p.audio.effectsGain)&&p.audio.effectsGain>=0&&p.audio.effectsGain<=.4,'Efeitos sonoros devem ficar abaixo da narração');

 if(p.subtitles)for(const x of p.subtitles)check(finite(x.start)&&finite(x.end)&&x.start>=0&&x.end>x.start&&x.end<=duration+.05&&typeof x.text==='string'&&x.text.length>0&&x.text.length<=170,'Legenda/timing inválidos');
 return {...p,duration:Math.round(duration*1000)/1000};
}
export function parseDuration(n){check(finite(n)&&n>=0,'Tempo inválido');let v=Math.round(n*100);const h=Math.floor(v/360000);v%=360000;const m=Math.floor(v/6000);v%=6000;const s=Math.floor(v/100);const c=v%100;return h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(c).padStart(2,'0');}
const assEscape=s=>s.replace(/\\/g,'\\\\').replace(/[{}]/g,m=>'\\'+m).replace(/[\r\n]/g,' ').replace(/<[^>]+>/g,'').trim();
export function makeAss(subtitles,duration){
 const head='[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Main,DejaVu Sans,59,&H00FFFFFF,&H00FFFFFF,&HCC140B17,&H8C160A12,1,0,0,0,100,100,0,0,3,12,0,2,72,72,290,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
 return head+subtitles.map(x=>{check(finite(x.start)&&finite(x.end)&&x.start>=0&&x.end>x.start&&x.end<=duration+.05,'Tempos de legenda inválidos');return 'Dialogue: 0,'+parseDuration(x.start)+','+parseDuration(x.end)+',Main,,0,0,0,,'+assEscape(x.text);}).join('\n')+'\n';
}
export function parseOrigin(s){const u=new URL(s);check(u.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(u.hostname)&&u.pathname==='/'&&!u.username&&!u.password&&!u.search&&!u.hash,'VoiceStudio exige localhost; não exponha uma API de voz pública');return u.origin;}
export async function requestVoice({base,text,voice,fetcher=fetch}){
 const host=parseOrigin(base);check(typeof text==='string'&&text.length>=4&&text.length<=1500,'Roteiro de voz inválido');check(typeof voice==='string'&&/^[\p{L}0-9_-]{2,100}$/u.test(voice),'Voz inválida');
 const r=await fetcher(host+'/v1/audio/speech',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:'tts-1',input:text,voice,response_format:'wav',speed:1,language:'pt',instructions:'Português brasileiro natural, expressivo, com pausas humanas; sem entonação robótica.'}),redirect:'error',signal:AbortSignal.timeout(120000)});
 check(r.ok,'VoiceStudio HTTP '+r.status+'; confirme modelo/voz pt-BR instalada');
 check(/audio\/(wav|x-wav|wave|vnd.wave)|application\/octet-stream/i.test(r.headers.get('content-type')||''),'VoiceStudio não retornou WAV');
 const buf=await r.arrayBuffer();check(buf.byteLength>=4&&buf.byteLength<=35_000_000,'Narração inválida');return buf;
}
export async function listVoices({base,fetcher=fetch}){
 const host=parseOrigin(base);
 const r=await fetcher(host+'/v1/audio/voices',{method:'GET',redirect:'error',signal:AbortSignal.timeout(12000)});
 check(r.ok,'VoiceStudio não respondeu à consulta de vozes');
 const data=await r.json();
 const items=Array.isArray(data.voices)?data.voices:[];
 return items.filter(x=>x&&x.type==='profile'&&typeof x.voice_id==='string').map(x=>({
  id:x.voice_id,name:String(x.name||x.voice_id),language:String(x.language||'')
 }));
}
function exec(bin,args){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',b=>{if(out.length<2e6)out+=b});p.stderr.on('data',b=>{if(err.length<2e6)err+=b});p.on('error',reject);p.on('close',code=>code===0?resolve(out):reject(Error(bin+' falhou: '+err.slice(-1200))));});}
export async function probe(file){const out=await exec('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]);const j=JSON.parse(out);return {duration:Number(j.format?.duration),streams:j.streams||[]};}
async function inputChecks(root,plan){
 const files=[...plan.shots.map(x=>x.file),plan.audio.voice,...(plan.audio.music?[plan.audio.music]:[]),...(plan.audio.effects?[plan.audio.effects]:[])];
 for(const f of new Set(files)){const file=inside(root,f),st=await stat(file);check(st.isFile()&&st.size>0,'Mídia vazia: '+f);const real=await realpath(file);check(real.startsWith(root+path.sep),'Mídia fora do projeto: '+f);}
 for(let i=0;i<plan.shots.length;i++){const s=plan.shots[i],m=await probe(inside(root,s.file));check(m.streams.some(x=>x.codec_type==='video')&&finite(m.duration)&&s.start+s.duration<=m.duration+.1,'Clip '+(i+1)+' não tem vídeo ou duração adequada');}
 const voice=await probe(inside(root,plan.audio.voice));check(voice.streams.some(x=>x.codec_type==='audio')&&voice.duration<=plan.duration+5,'Regrave ou ajuste o tempo da voz');
}
export async function render(planPath,outPath,{width=1080,height=1920,preset='medium'}={}){
 const root=path.dirname(path.resolve(planPath)),p=validatePlan(JSON.parse(await readFile(planPath,'utf8')));
 await inputChecks(root,p);const temp=await mkdtemp(path.join(tmpdir(),'w1-reel-'));
 try{
  const clips=[];
  for(let i=0;i<p.shots.length;i++){
   const s=p.shots[i],file=path.join(temp,'shot-'+i+'.mp4');const vf=s.framing==='blurred'
    ? '[0:v]split=2[bg0][fg0];[bg0]scale='+width+':'+height+':force_original_aspect_ratio=increase,crop='+width+':'+height+',gblur=sigma=24[bg];[fg0]scale='+width+':'+height+':force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1,format=yuv420p[v]'
    : '[0:v]scale='+width+':'+height+':force_original_aspect_ratio=increase,crop='+width+':'+height+',fps=30,setsar=1,format=yuv420p[v]';
   await exec('ffmpeg',['-hide_banner','-nostdin','-v','error','-y','-ss',String(s.start),'-i',inside(root,s.file),'-t',String(s.duration),'-filter_complex',vf,'-map','[v]','-an','-c:v','libx264','-crf','19','-preset',preset,'-pix_fmt','yuv420p',file]);clips.push(file);
  }
  const fileList=path.join(temp,'concat.txt'),silent=path.join(temp,'silent.mp4');
  await writeFile(fileList,clips.map(c=>"file '"+c+"'").join('\n')+'\n');
  await exec('ffmpeg',['-hide_banner','-nostdin','-v','error','-y','-f','concat','-safe','0','-i',fileList,'-c','copy',silent]);
  let start=0;const subtitles=p.subtitles??p.shots.map(s=>{const result={start,end:start+s.duration,text:s.caption};start+=s.duration;return result;});
  const ass=path.join(temp,'captions.ass');await writeFile(ass,makeAss(subtitles,p.duration));
  const argv=['-hide_banner','-nostdin','-v','error','-y','-i',silent,'-i',inside(root,p.audio.voice)],music=Boolean(p.audio.music),effects=Boolean(p.audio.effects);
  if(music)argv.push('-stream_loop','-1','-i',inside(root,p.audio.music));
  if(effects)argv.push('-i',inside(root,p.audio.effects));
  const vf='highpass=f=70,lowpass=f=12500,loudnorm=I=-17:TP=-2:LRA=8';
  let audio=music
   ? '[1:a]'+vf+',asplit=2[vmain][vside];[2:a]volume='+(p.audio.musicGain??.11)+',highpass=f=45[bed];[bed][vside]sidechaincompress=threshold=0.03:ratio=10:attack=25:release=350[duck];[vmain][duck]amix=inputs=2:duration=longest:dropout_transition=0[base]'
   : '[1:a]'+vf+'[base]';
  if(effects){
   const index=music?3:2;
   audio+=';['+index+':a]volume='+(p.audio.effectsGain??.16)+',highpass=f=90[fx];[base][fx]amix=inputs=2:duration=longest:dropout_transition=0[pre];[pre]loudnorm=I=-14:TP=-1.5:LRA=8[a]';
  }else audio+=';[base]loudnorm=I=-14:TP=-1.5:LRA=8[a]';
  await mkdir(path.dirname(path.resolve(outPath)),{recursive:true});
  await exec('ffmpeg',[...argv,'-filter_complex','[0:v]ass='+ass+'[v];'+audio,'-map','[v]','-map','[a]','-t',String(p.duration),'-c:v','libx264','-crf','18','-preset',preset,'-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',outPath]);
  const result=await probe(outPath);check(Math.abs(result.duration-p.duration)<.3&&result.streams.some(x=>x.codec_type==='video')&&result.streams.some(x=>x.codec_type==='audio'),'MP4 final inválido');
  return {ok:true,file:path.resolve(outPath),duration:result.duration,shots:p.shots.length,width,height};
 }finally{await rm(temp,{recursive:true,force:true});}
}
export async function cli(argv){
 const [action,...rest]=argv;
 if(action==='doctor'){const f=await exec('ffmpeg',['-version']),p=await exec('ffprobe',['-version']);return {ffmpeg:f.split('\n')[0],ffprobe:p.split('\n')[0],genjutsuModes:GENJUTSU};}
 if(action==='validate'){const root=path.dirname(path.resolve(rest[0])),p=validatePlan(JSON.parse(await readFile(rest[0],'utf8')));await inputChecks(root,p);return{ok:true,shots:p.shots.length,duration:p.duration};}
 if(action==='render')return render(rest[0],rest[1]);
 if(action==='voices')return listVoices({base:process.env.VOICESTUDIO_BASE_URL||'http://127.0.0.1:8000'});
 if(action==='voice'){const [script,voice,file]=rest;const b=await requestVoice({base:process.env.VOICESTUDIO_BASE_URL||'http://127.0.0.1:8000',text:await readFile(script,'utf8'),voice});await writeFile(file,Buffer.from(b));return{ok:true,file,bytes:b.byteLength};}
 throw Error('Uso: node studio.mjs doctor | voices | validate plan.json | voice roteiro.txt VOZ out.wav | render plan.json out.mp4');
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))cli(process.argv.slice(2)).then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e.message);process.exitCode=1});
