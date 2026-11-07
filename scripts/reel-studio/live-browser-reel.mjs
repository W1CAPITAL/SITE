/**
 * W1 Capital original vertical reel, filmed from real pages rendered in Chromium.
 * Never captures third-party Instagram footage or claims concepts are client sites.
 */
import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const FPS=24;
export const SCENES=[
 {url:'/sites/',seconds:1.35,start:0.015,end:.10,caption:'UM SITE BONITO BASTA?',kind:'w1'},
 {url:'/sites/',seconds:1.65,start:.15,end:.31,caption:'E SE O CONTATO NÃO APARECER?',kind:'w1'},
 {url:'/sites/demo-autentica/',seconds:1.95,start:0,end:.20,caption:'IDENTIDADE QUE FAZ SENTIDO.',kind:'concept'},
 {url:'/sites/demo-autentica/solucoes/',seconds:1.70,start:.02,end:.27,caption:'INFORMAÇÃO SEM COMPLICAÇÃO.',kind:'concept'},
 {url:'/sites/demo-bezerra-menezes/',seconds:1.90,start:.02,end:.22,caption:'CADA PROJETO, UMA DIREÇÃO.',kind:'concept'},
 {url:'/sites/',seconds:1.65,start:.40,end:.63,caption:'UM CAMINHO ATÉ VOCÊ.',kind:'w1'},
 {url:'/sites/',seconds:1.85,start:.77,end:.93,caption:'ENVIE SITE NO DIRECT.',kind:'cta'}
];
export function validateScenes(scenes=SCENES){
 if(scenes.length<5||scenes.length>10)throw Error('Storyboard precisa de 5 a 10 cenas');
 const total=scenes.reduce((a,s)=>{
   if(!s.url.startsWith('/sites/')||s.url.includes('..')||!Number.isFinite(s.seconds)||s.seconds<1||s.seconds>3
    ||s.start<0||s.end>1||s.end<=s.start||s.caption.length>39)throw Error('Cena inválida');
   return a+s.seconds;
 },0);
 if(total<8||total>16||scenes[0].seconds>2||!scenes.at(-1).caption.includes('DIRECT'))
   throw Error('Ritmo de Reels/CTA inválidos');
 if(!scenes.some(s=>s.kind==='concept'))throw Error('Conceitos precisam ser identificados');
 return Math.round(total*100)/100;
}
const OUTPUT=process.env.W1_REEL_OUTPUT||'out/w1-reel-real-sites';
function ff(args) {
 const r=spawnSync('ffmpeg',['-hide_banner','-v','error','-y',...args],{encoding:'utf8',timeout:240000});
 if(r.error||r.status!==0)throw Error('FFmpeg: '+(r.error?.message||r.stderr||r.status));
}
function generateSound(seconds,file,cutTimes){
 const sr=48000,n=Math.ceil(seconds*sr),output=Buffer.alloc(44+n*4);
 output.write('RIFF',0);output.writeUInt32LE(output.length-8,4);output.write('WAVE',8);
 output.write('fmt ',12);output.writeUInt32LE(16,16);output.writeUInt16LE(1,20);output.writeUInt16LE(2,22);
 output.writeUInt32LE(sr,24);output.writeUInt32LE(sr*4,28);output.writeUInt16LE(4,32);output.writeUInt16LE(16,34);
 output.write('data',36);output.writeUInt32LE(n*4,40);
 const BPM=116,beat=60/BPM;let low=0,random=2463534242;
 const noise=()=>{random^=random<<13;random^=random>>>17;random^=random<<5;return ((random>>>0)/4294967295)*2-1};
 for(let i=0;i<n;i++){
   const t=i/sr,period=t%beat;
   const pump=.14*Math.exp(-17*period)*Math.sin(2*Math.PI*(62*period+60*period/(1+13*period)));
   const pulse=.021*Math.exp(-5*period)*Math.sin(2*Math.PI*73.42*t);
   const pad=(Math.sin(2*Math.PI*146.83*t)+.75*Math.sin(2*Math.PI*174.61*t)+.4*Math.sin(2*Math.PI*220*t))*.0055*(.7+.3*Math.sin(2*Math.PI*.13*t));
   const d2=(t+beat/2)%beat,hatEnv=Math.exp(-125*d2);
   const v=noise();low+=.015*(v-low);const hat=(v-low)*.014*hatEnv;
   let cut=0;for(const c of cutTimes){const dt=t-c;if(dt>=0&&dt<.11)cut+=noise()*.023*(1-dt/.11);}
   const fade=Math.min(1,t/.21,(seconds-t)/.44);
   const vout=Math.max(-.88,Math.min(.88,(pump+pulse+pad+hat+cut)*Math.max(0,fade)));
   output.writeInt16LE(Math.round(vout*32767),44+i*4);
   output.writeInt16LE(Math.round((vout+pad*.08)*32767),44+i*4+2);
 }
 return writeFile(file,output);
}
const escapeHtml=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function overlayHTML(scene){
 return '<div id="w1-film-overlay" style="pointer-events:none;position:fixed;inset:0;z-index:2147483600;font-family:system-ui,-apple-system,Arial,sans-serif;color:white">'+
 '<div style="position:absolute;inset:57% 0 0;background:linear-gradient(0deg,rgba(16,9,18,.84),rgba(16,9,18,0));"></div>'+
 '<div style="position:absolute;top:38px;left:27px;font-size:11px;font-weight:700;letter-spacing:.18em;text-shadow:0 2px 12px #000b">W1  /  CAPITAL</div>'+
 (scene.kind==='concept'?'<div style="position:absolute;top:38px;right:27px;font-size:9px;font-weight:700;letter-spacing:.08em;text-shadow:0 2px 12px #000b">CONCEITO VISUAL</div>':'')+
 '<div id="w1-film-caption" style="position:absolute;bottom:205px;left:25px;right:53px;font-size:29px;font-weight:780;letter-spacing:-.05em;line-height:1.04;text-shadow:0 2px 12px #0008;white-space:normal;overflow-wrap:break-word">'+escapeHtml(scene.caption)+'</div>'+
 '<div style="position:absolute;left:25px;bottom:186px;width:36px;height:3px;border-radius:5px;background:#f0a3c0"></div>'+
 '<div style="position:absolute;bottom:158px;left:25px;font-size:10px;font-weight:600;letter-spacing:.055em;opacity:.9">'+(scene.kind==='cta'?'W1 CAPITAL  ·  CRIAÇÃO DE SITES':'DESENVOLVIMENTO DIGITAL  ·  W1')+'</div>'+
 '</div>';
}
export async function capture({base='http://127.0.0.1:8765',dest=OUTPUT}={}){
 const total=validateScenes();
 await mkdir(dest,{recursive:true});const frames=path.join(dest,'frames');await mkdir(frames,{recursive:true});
 const {chromium}=await import('playwright');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:2,locale:'pt-BR',reducedMotion:'reduce'});
 let frameNo=0;const cuts=[];let time=0;
 try{
  for(const scene of SCENES){
    await page.goto(base+scene.url,{waitUntil:'domcontentloaded',timeout:18000});
    await page.waitForTimeout(600);
    const dimensions=await page.evaluate(()=>{
       document.documentElement.style.scrollBehavior='auto';
       document.querySelector('#w1-film-overlay')?.remove();
       return {height:document.documentElement.scrollHeight,vh:innerHeight};
    });
    if(dimensions.height<=0)throw Error('Página local vazia: '+scene.url);
    await page.evaluate(html=>document.body.insertAdjacentHTML('beforeend',html),overlayHTML(scene));
    const count=Math.round(scene.seconds*FPS);
    for(let j=0;j<count;j++){
       const p=(j+1)/(count+1),ease=p*p*(3-2*p);
       const y=Math.round(Math.max(0,dimensions.height-dimensions.vh)*(scene.start+(scene.end-scene.start)*ease));
       await page.evaluate(({y,p})=>{
          window.scrollTo(0,y);
          const caption=document.getElementById('w1-film-caption');
          if(caption){
            caption.style.opacity=String(Math.min(1,p*8));
            caption.style.transform='translateY('+Math.round(13*Math.max(0,1-p*9))+'px)';
          }
       },{y,p});
       await page.screenshot({path:path.join(frames,String(frameNo++).padStart(5,'0')+'.png'),animations:'disabled'});
    }
    time+=count/FPS;cuts.push(time);
    console.log('captured',scene.url,count,'frames',dimensions.height,'height');
  }
 }finally{await browser.close();}
 await generateSound(time,path.join(dest,'sound.wav'),cuts.slice(0,-1));
 const output=path.join(dest,'w1-reel-sites-REAL.mp4');
 ff(['-framerate',String(FPS),'-i',path.join(frames,'%05d.png'),'-i',path.join(dest,'sound.wav'),
   '-filter_complex','[0:v]fps=30,format=yuv420p[v];[1:a]highpass=f=35,lowpass=f=16000,loudnorm=I=-20:TP=-2:LRA=7[a]',
   '-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','19','-r','30',
   '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-t',String(time),output]);
 await copyFile(path.join(frames,'00000.png'),path.join(dest,'cover.png'));
 await writeFile(path.join(dest,'provenance.json'),JSON.stringify({title:'W1 Capital — Por que o cliente desiste do seu site?',
  frameCount:frameNo,duration:time,source:'W1CAPITAL/SITE branch main, Chromium real local HTML',
  examples:'Public concept pages, not official client websites',scenes:SCENES,voice:'none; deliberately no synthetic TTS',
  soundtrack:'Original programmatic licensed by author: minimal restrained pulse, no third-party recording'},null,2));
 console.log(JSON.stringify({file:output,seconds:time,frames:frameNo}));
 return {file:output,duration:time,frames:frameNo};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))
 capture().catch(e=>{console.error(e.stack||e);process.exitCode=1});
