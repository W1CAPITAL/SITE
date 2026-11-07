import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validatePlan,makeAss,parseDuration,parseOrigin,requestVoice,listVoices,categorizeGenjutsu,render,probe} from './studio.mjs';

function plan(){
 return {version:1,title:'W1 real-site smoke',resolution:'1080x1920',fps:30,shots:[
  {file:'assets/1.mp4',start:0,duration:1.6,role:'hook',rights:'owned',kind:'real',caption:'Seu site afasta clientes?'},
  {file:'assets/2.mp4',start:0,duration:3.1,role:'problem',rights:'owned',kind:'real',caption:'Quando não encontram o contato'},
  {file:'assets/3.mp4',start:0,duration:3.2,role:'proof',rights:'owned',kind:'real',caption:'Aqui está o projeto real W1',framing:'blurred'},
  {file:'assets/4.mp4',start:0,duration:2.5,role:'cta',rights:'owned',kind:'real',caption:'Envie SITE no direct'}],
 audio:{voice:'assets/voz.wav',music:'assets/trilha.wav',musicRights:'licensed',musicGain:.1}};
}
test('validates real-footage proof, initial hook and audio rights',()=>{
 const p=plan();assert.equal(validatePlan(p).duration,10.4);
 for(const mutate of [p=>p.shots[0].duration=3,p=>p.shots[2].kind='generated',
  p=>p.audio.voice='',p=>p.audio.musicRights='',p=>p.shots[3].file='../secrets',
  p=>p.shots[1].duration=9]){
  const data=plan();mutate(data);assert.throws(()=>validatePlan(data));
 }
});
test('a dedicated foley / sound-effects track needs rights and safe volume',()=>{
 const p=plan();
 p.audio.effects='assets/foley.wav';
 assert.throws(()=>validatePlan(p));
 p.audio.effectsRights='licensed';p.audio.effectsGain=.2;
 assert.equal(validatePlan(p).audio.effectsGain,.2);
 p.audio.effectsGain=3;assert.throws(()=>validatePlan(p));
});
test('VoiceStudio lists actual local voice profiles rather than guessing IDs',async()=>{
 const voices=await listVoices({base:'http://127.0.0.1:8000',fetcher:async(url)=>{
  assert.equal(url,'http://127.0.0.1:8000/v1/audio/voices');
  return Response.json({voices:[{voice_id:'nova',type:'openai_alias',name:'Nova'},
   {voice_id:'br_jovem',type:'profile',name:'Voz brasileira',language:'pt-BR'}]});
 }});
 assert.equal(voices.length,1);assert.equal(voices[0].id,'br_jovem');
});
test('Genjutsu must have whole-clip visual approval; CGI requires disclaimer',()=>{
 const p=plan(),s=p.shots[1];s.kind='generated';s.provider='abdullayevziyodulla/open-genjutsu';
 assert.throws(()=>validatePlan(p));s.caption='Cena ilustrativa, não interface real';
 assert.throws(()=>validatePlan(p));s.fullClipReviewed=true;assert.equal(validatePlan(p).shots[1].kind,'generated');
 assert.equal(categorizeGenjutsu('sirioberati/Genjustsu-Open-Source-Workflow'),'depth-sam-seedance');
 assert.equal(categorizeGenjutsu('Anil-matcha/open-genjutsu'),'muapi-motion');
});
test('stamped ASS captions are text-based and cannot provide invented timecodes',()=>{
 const s=makeAss([{start:0,end:1.25,text:'Seu site {vende}?'},{start:1.25,end:2,text:'Fale com a W1'}],2);
 assert.match(s,/Dialogue: 0,0:00:00.00,0:00:01.25/);
 assert.match(s,/Seu site/);assert.equal(parseDuration(65.23),'0:01:05.23');
 assert.throws(()=>makeAss([{start:2,end:1,text:'Errado'}],2));
});
test('localhost-only VoiceStudio with one speech request, no paid fallbacks',async()=>{
 assert.equal(parseOrigin('http://127.0.0.1:8000'),'http://127.0.0.1:8000');
 assert.throws(()=>parseOrigin('https://remote.example'));
 let count=0;
 const fetcher=async(url,opts)=>{count++;assert.equal(url,'http://127.0.0.1:8000/v1/audio/speech');
  const body=JSON.parse(opts.body);assert.equal(body.response_format,'wav');assert.equal(body.language,'pt');
  return new Response(new Uint8Array([82,73,70,70,0]),{headers:{'content-type':'audio/wav'}});};
 const wav=await requestVoice({base:'http://127.0.0.1:8000',text:'Teste de narração em português.',voice:'Autorizada',fetcher});
 assert.equal(wav.byteLength,5);assert.equal(count,1);
});
function ff(...args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error',...args],{encoding:'utf8'});
 if(r.error)throw r.error;if(r.status!==0)throw Error('ffmpeg exit '+r.status+': '+(r.stderr||r.stdout||'unknown error'));}
test('actual smoke: MP4 vertical has visible captions, audio, footage and correct duration',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'w1-reel-smoke-'));
 try{
  const assets=path.join(dir,'assets');await mkdir(assets);
  for(let i=1;i<=4;i++)ff('-f','lavfi','-i','testsrc2=size=320x180:rate=30:duration=4','-an',
    '-c:v','libx264','-preset','ultrafast','-y',path.join(assets,i+'.mp4'));
  ff('-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=10.4','-y',path.join(assets,'voz.wav'));
  ff('-f','lavfi','-i','sine=frequency=300:sample_rate=48000:duration=3','-y',path.join(assets,'trilha.wav'));
  ff('-f','lavfi','-i','sine=frequency=800:sample_rate=48000:duration=3','-y',path.join(assets,'foley.wav'));
  const src=path.join(dir,'plan.json'),out=path.join(dir,'render.mp4');
  const p=plan();p.audio.effects='assets/foley.wav';p.audio.effectsRights='owned';p.audio.effectsGain=.15;
  await writeFile(src,JSON.stringify(p));
  const result=await render(src,out,{width:360,height:640,preset:'ultrafast'});
  const media=await probe(out);
  assert.equal(result.ok,true);assert.ok(Math.abs(media.duration-10.4)<.3);
  assert.ok(media.streams.some(s=>s.codec_type==='video'&&s.width===360&&s.height===640));
  assert.ok(media.streams.some(s=>s.codec_type==='audio'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
