"""Audio for original Dia Zero: Portuguese dialogue, spatial suspense ambience and event-specific SFX."""
import asyncio, math, subprocess, os
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
from story import LINES,SECONDS

ROOT=Path(__file__).parent
OUT=ROOT/"output"
SR=48000
N=SECONDS*SR
rng=np.random.default_rng(20261107)

async def narration():
    import edge_tts
    out=OUT/"voice"
    out.mkdir(parents=True,exist_ok=True)
    available=await edge_tts.list_voices()
    candidates=[v["ShortName"] for v in available]
    wanted=["pt-BR-MacerioMultilingualNeural","pt-BR-DonatoNeural","pt-BR-FabioNeural","pt-BR-AntonioNeural"]
    voice=next((x for x in wanted if x in candidates),"pt-BR-AntonioNeural")
    print("Narrator voice",voice,flush=True)
    async def one(i,text):
        rate=["+5%","+9%","+3%","+11%","+7%","+6%","+4%","+12%","+7%","+8%","+9%","+5%","+2%","+6%","+3%","-4%"][i]
        pitch=["-3Hz","-4Hz","-3Hz","-2Hz","-2Hz","-4Hz","-3Hz","-1Hz","-2Hz","-3Hz","-3Hz","-4Hz","-4Hz","-2Hz","-3Hz","-5Hz"][i]
        path=out/f"line_{i:02d}.mp3"
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text,voice,rate=rate,pitch=pitch).save(str(path))
                if path.stat().st_size<1000:raise ValueError("empty audio")
                return
            except Exception as e:
                print("voice retry",i,attempt,repr(e)[:100],flush=True)
                await asyncio.sleep(2*(attempt+1))
        raise RuntimeError(f"No voice generated for scene {i}")
    sem=asyncio.Semaphore(3)
    async def gated(i,text):
        async with sem:await one(i,text)
    await asyncio.gather(*(gated(i,s) for i,s in enumerate(LINES)))
    # A distinct mother's voice is used only as an offscreen character, not a synthetic voice impersonation.
    mother=("pt-BR-ThalitaMultilingualNeural" if "pt-BR-ThalitaMultilingualNeural" in candidates
            else "pt-BR-FranciscaNeural")
    await edge_tts.Communicate("Não abre! Eu tô dentro do apartamento!",mother,rate="-10%",pitch="-5Hz").save(str(out/"mother.mp3"))

def add_tone(mix,at,duration,frequency=.0,volume=.04,panning=0.0,kind="tone"):
    a=int(at*SR); b=min(N,a+int(duration*SR))
    if b<=a:return
    n=b-a;t=np.arange(n,dtype=np.float32)/SR
    env=np.minimum(1.0,t/.08)*np.minimum(1.0,(duration-t)/.25)
    env=np.clip(env,0.0,1.0)
    if kind=="noise":
        wave=rng.standard_normal(n).astype(np.float32)*env
        wave=sosfilt(butter(3,[120,4200],btype="bandpass",fs=SR,output="sos"),wave)
    elif kind=="impact":
        wave=(.78*np.sin(2*np.pi*(65*t-10*t*t))+.36*rng.standard_normal(n))*np.exp(-t*9)
    elif kind=="step":
        wave=(rng.standard_normal(n).astype(np.float32)*.42+np.sin(2*np.pi*85*t))*np.exp(-t*34)
    elif kind=="beep":
        wave=(np.sin(2*np.pi*880*t)+.3*np.sin(2*np.pi*1318*t))*np.minimum(1,t*55)*np.exp(-t*5)
    else:
        wave=np.sin(2*np.pi*frequency*t)*env
    left=math.sqrt((1-panning)/2)
    right=math.sqrt((1+panning)/2)
    mix[a:b,0]+=(wave*volume*left).astype(np.float32)
    mix[a:b,1]+=(wave*volume*right).astype(np.float32)

def base_soundscape():
    print("Building spatial soundscape",flush=True)
    mix=np.zeros((N,2),dtype=np.float32)
    t=np.arange(N,dtype=np.float32)/SR
    # Restrained ambient low brass/eerie synth pads, always quieter than the narration.
    ominous=(np.sin(2*np.pi*49*t)+.57*np.sin(2*np.pi*73.4*t)+.24*np.sin(2*np.pi*98.1*t))
    intensity=np.interp(t,[0,15,35,55,78,105,113,120],[.008,.012,.024,.038,.06,.026,.008,.03])
    mix[:,0]+=ominous*intensity
    mix[:,1]+=ominous*intensity*.87
    del ominous
    # A real environmental progression: sterile office, traffic, rain and a suddenly quiet flat.
    noise=rng.standard_normal(N).astype(np.float32)
    rain=sosfilt(butter(3,[350,5000],btype="bandpass",fs=SR,output="sos"),noise)
    amp=np.interp(t,[0,13,29,45,59,64,86,101,112,120],[.002,.004,.01,.026,.035,.043,.05,.027,.004,.004])
    mix[:,0]+=(rain*amp).astype(np.float32)
    mix[:,1]+=(np.roll(rain,1900)*amp*.96).astype(np.float32)
    del noise,rain
    # AC hum in initial office and intermittent power failure.
    hum=.02*np.sin(2*np.pi*60*t)
    hum[t>38]=0;hum[(t>18)&(t<33)]*=.45
    mix[:,0]+=hum;mix[:,1]+=hum*.85
    del t,hum
    # Phone alert / first seismic shock.
    for event in [13.1,13.35,13.63,17.3,83.2,111.2]:
        add_tone(mix,event,.43,volume=.20,kind="beep",panning=-.30)
    for event,mag in [(21.6,.21),(26.1,.14),(36.4,.15),(53.6,.22),(67.8,.28),(91.4,.17),(115.6,.36)]:
        add_tone(mix,event,1.7,volume=mag,kind="impact",panning=.05)
    # Distant stereo-moving sirens after first collision.
    for start,dur in [(29,18),(49,28),(64,24),(84,13)]:
        samples=int(dur*SR);tt=np.arange(samples,dtype=np.float32)/SR
        cycle=np.sin(2*np.pi*tt/3.5)
        phase=np.cumsum((570+170*cycle)/SR)
        wave=np.sin(2*np.pi*phase)*(.5+.5*np.sin(2*np.pi*tt/3.5))
        env=np.clip(tt/2,0,1)*np.clip((dur-tt)/3,0,1)
        a=start*SR;b=min(N,a+samples)
        pan=np.sin(2*np.pi*tt/9.4)
        mix[a:b,0]+=(.023*wave[:b-a]*env[:b-a]*(1-pan[:b-a])).astype(np.float32)
        mix[a:b,1]+=(.023*wave[:b-a]*env[:b-a]*(1+pan[:b-a])).astype(np.float32)
    # Helicopter rotor, with approach/departing movement over the street.
    dur=16;start=76;tt=np.arange(dur*SR,dtype=np.float32)/SR
    rotor=np.sin(2*np.pi*110*tt)*(.25+.75*np.maximum(0,np.sin(2*np.pi*12*tt)))
    rotor+=.25*rng.standard_normal(len(tt)).astype(np.float32)*(.4+.6*np.maximum(0,np.sin(2*np.pi*12*tt)))
    env=np.clip(tt/3,0,1)*np.clip((dur-tt)/3,0,1)
    pan=np.linspace(-.9,.9,len(tt),dtype=np.float32)
    a=start*SR;b=a+len(tt)
    mix[a:b,0]+=(.055*rotor*env*(1-pan)).astype(np.float32)
    mix[a:b,1]+=(.055*rotor*env*(1+pan)).astype(np.float32)
    # Running steps; stereo alternating by body weight / perspective.
    for i,at in enumerate(np.arange(45,57,.47)):add_tone(mix,float(at),.22,volume=.07,kind="step",panning=-.23 if i%2 else .24)
    for i,at in enumerate(np.arange(62,76,.41)):add_tone(mix,float(at),.22,volume=.09,kind="step",panning=-.20 if i%2 else .20)
    for i,at in enumerate(np.arange(100,109,.52)):add_tone(mix,float(at),.24,volume=.10,kind="step",panning=-.15 if i%2 else .15)
    for at in [113.4,114.1,114.8,117.4]:
        add_tone(mix,at,.8,volume=.27,kind="impact",panning=.60)
    # Simple muffled radio and faraway voices can be left to narrative, no synthetic mumbling.
    return mix

def decode_audio(src):
    proc=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(src),"-ar",str(SR),
          "-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True)
    return np.frombuffer(proc.stdout,dtype="<f4")

def mix_voices(mix):
    print("Mixing aligned spoken scenes",flush=True)
    for i in range(16):
        audio=decode_audio(OUT/"voice"/f"line_{i:02d}.mp3")
        # Each spoken segment is its own scene so it can be corrected independently.
        avail=int(7.15*SR)
        if len(audio)>avail:
            factor=len(audio)/avail
            cmd=["ffmpeg","-hide_banner","-loglevel","error","-i",str(OUT/"voice"/f"line_{i:02d}.mp3"),
                  "-filter:a",f"atempo={min(2,factor):.5f}","-ar",str(SR),"-ac","1","-f","f32le","pipe:1"]
            audio=np.frombuffer(subprocess.run(cmd,capture_output=True,check=True).stdout,dtype="<f4")
        audio=np.copy(audio[:avail])
        a=int((i*7.5+.21)*SR)
        b=min(N,a+len(audio))
        speech=audio[:b-a]
        if len(speech)==0:continue
        level=max(float(np.max(np.abs(speech))),.01)
        speech=np.clip(speech/level*.47,-.47,.47)
        # Duck all ambient layers beneath speech, then restore them in the gaps.
        duck=np.ones(len(speech),dtype=np.float32)
        ramp=min(int(.12*SR),len(speech)//3)
        if ramp:
            duck[:ramp]=np.linspace(1,.31,ramp)
            duck[-ramp:]=np.linspace(.31,1,ramp)
        duck[ramp:len(speech)-ramp]=.31
        mix[a:b]*=duck[:,None]
        mix[a:b,0]+=speech*.90
        mix[a:b,1]+=speech*.90
    mother=OUT/"voice"/"mother.mp3"
    if mother.exists():
        audio=decode_audio(mother)
        a=int(115.1*SR);b=min(N,a+len(audio))
        if b>a:
            audio=audio[:b-a];mx=max(.05,float(np.max(np.abs(audio))))
            audio=np.clip(audio/mx*.27,-.27,.27)
            mix[a:b]*=.30
            mix[a:b,0]+=audio*.58;mix[a:b,1]+=audio*.77
    return mix

def create_audio():
    OUT.mkdir(exist_ok=True)
    asyncio.run(narration())
    mix=base_soundscape()
    mix=mix_voices(mix)
    # Gently saturate then normalize peaks without breaking the subtle ambience dynamics.
    mix=np.tanh(mix*1.4)
    peak=float(np.max(np.abs(mix)))
    if peak>0:mix*=.87/peak
    sf.write(str(OUT/"dia_zero_sound_mix.wav"),mix,SR,subtype="PCM_16")
    print("Audio written",flush=True)

if __name__=="__main__":create_audio()
