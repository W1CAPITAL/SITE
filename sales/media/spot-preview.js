/** Deterministic, lightweight brand spot storyboard preview.
 * No audio, GPU, frames, tracking, network or external media.
 */
export const DURATION=15;
export function sceneAt(seconds){
  const time=Number(seconds);
  if(!Number.isFinite(time))return 0;
  if(time<4)return 0;
  if(time<8)return 1;
  if(time<12)return 2;
  return 3;
}
export function clampTime(seconds){
  const number=Number(seconds);
  return Number.isFinite(number)?Math.max(0,Math.min(DURATION,number)):0;
}
if(typeof window!=="undefined"){
  const slider=document.getElementById("time");
  const display=document.getElementById("seconds");
  const play=document.getElementById("play");
  const sections=[...document.querySelectorAll("[data-scene]")];
  let raf=0,playing=false,startStamp=0,startedAt=0;
  function setTime(next){
    const time=clampTime(next);
    slider.value=String(time);
    display.textContent=time.toFixed(1);
    const idx=sceneAt(time);
    for(const section of sections){
      const active=Number(section.dataset.scene)===idx;
      section.classList.toggle("active",active);
      section.setAttribute("aria-hidden",String(!active));
    }
    return time;
  }
  function stop(){
    playing=false;
    cancelAnimationFrame(raf);
    play.textContent="Reproduzir";
  }
  function tick(now){
    if(!playing)return;
    const current=setTime(startedAt+(now-startStamp)/1000);
    if(current>=DURATION){stop();return;}
    raf=requestAnimationFrame(tick);
  }
  slider?.addEventListener("input",()=>{stop();setTime(slider.value);});
  play?.addEventListener("click",()=>{
    if(playing){stop();return;}
    const at=Number(slider.value)>=DURATION?0:Number(slider.value);
    setTime(at);
    startedAt=at;startStamp=performance.now();playing=true;
    play.textContent="Pausar";raf=requestAnimationFrame(tick);
  });
  // Explicit seek interface for future deterministic frame capture tools.
  window.W1BrandSpot=Object.freeze({duration:DURATION,setTime:(value)=>{stop();return setTime(value);},getTime:()=>Number(slider.value)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
  setTime(0);
}
