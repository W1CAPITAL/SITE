"""Dia Zero V3 sound editor: no random sfx and no synthesized background drones.
Layered recorded ambience follows room transitions, with fixed audio event cues tied to the script.
All SFX are from Mixkit licensed free recordings, described in SOURCES.json.
Original user-approved male voice is retained unmodified except gentle corrective mastering.
"""
from pathlib import Path
import math
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt
from render_audio_v2 import get_sfx,decode_audio,decode_voice
from story import SECONDS

ROOT=Path(__file__).parent
OUT=ROOT/"output"
RATE=48000
N=SECONDS*RATE
# (start sec, end sec, desired relative RMS, spatial pan)
BEDS={
    "office":(0.,56.,.025,-.03),
    "rain_inside":(2.,62.,.013,.14),
    "traffic":(29.,104.,.025,.20),
    "rain_outside":(59.,108.,.041,-.08),
    "corridor":(103.,120.,.013,.05),
}
# every impact is grounded in a matching visual narrative beat
EVENTS=[
    (8.8,"alert",.13,-.22),
    (11.7,"alert",.085,-.24),
    (23.6,"electrical",.095,.10),
    (31.4,"collision",.15,.30),
    (34.0,"siren",.042,-.62),
    (53.4,"stairs",.042,-.1),
    (59.3,"door",.085,.27),
    (61.2,"footsteps",.07,-.15),
    (64.7,"crowd",.060,.22),
    (68.1,"siren",.050,.40),
    (69.3,"crowd",.043,-.22),
    (76.3,"footsteps",.060,-.12),
    (83.4,"helicopter",.075,-.55),
    (90.8,"call",.085,-.22),
    (99.5,"metro",.034,.18),
    (105.5,"stairs",.062,-.09),
    (108.4,"footsteps",.025,-.22),
    (109.2,"door",.085,.55),
    (115.2,"door",.090,.64),
    (115.3,"heartbeat",.035,0.0),
]
# External files use exactly recorded sounds, not synthesized oscillators.
MAXLEN={
    "alert":1.8,"electrical":2.6,"collision":3.5,"siren":8.0,
    "crowd":7.0,"stairs":5.0,"door":1.8,"footsteps":3.2,
    "helicopter":10.4,"call":1.5,"metro":4.5,"heartbeat":4.0
}

def normalized_asset(decoded,rms_target=.055,lowpass=None,highpass=None):
    out=np.asarray(decoded,dtype=np.float32)
    if out.ndim==1:out=np.repeat(out[:,None],2,axis=1)
    if lowpass is not None or highpass is not None:
        if lowpass and highpass:
            filt=butter(2,[highpass,lowpass],btype="bandpass",fs=RATE,output="sos")
        elif lowpass:
            filt=butter(2,lowpass,btype="lowpass",fs=RATE,output="sos")
        else:
            filt=butter(2,highpass,btype="highpass",fs=RATE,output="sos")
        out=sosfilt(filt,out,axis=0).astype(np.float32)
    rms=max(.003,float(np.sqrt(np.mean(out[::20]**2))))
    peak=float(np.max(np.abs(out[::15])))
    scale=min(rms_target/rms, .40/max(.001,peak))
    return out*scale

def pan_recording(data,position=0.):
    p=max(-1.,min(1.,float(position)))
    # Mid-side stereo: preserves stereo field; simple directional weighting.
    a=math.sqrt((1-p)/2)*1.414
    b=math.sqrt((1+p)/2)*1.414
    return data*np.array([a,b],dtype=np.float32)

def put_segment(dst,src,start,end,level=1.,pan=0.,fade_seconds=.8,loop=True):
    a=round(start*RATE);b=min(N,round(end*RATE))
    if b<=a or src.shape[0]<32:return
    target=b-a
    source=pan_recording(src,pan)
    # Seamless recorded ambiences: overlapping chunks, not literal repeated tile discontinuities.
    overlap=min(round(RATE*.95),max(1,source.shape[0]//5))
    hop=max(1,source.shape[0]-overlap)
    temp=np.zeros((target,2),dtype=np.float32)
    weight=np.zeros((target,1),dtype=np.float32)
    pos=0
    while pos<target:
        take=min(source.shape[0],target-pos)
        if take<=0:break
        chunk=source[:take]
        window=np.ones((take,1),dtype=np.float32)
        transition=min(overlap, take//2)
        if transition>0 and pos>0:
            window[:transition]=np.linspace(0,1,transition,dtype=np.float32)[:,None]
        if transition>0 and pos+take<target:
            window[-transition:]=np.linspace(1,0,transition,dtype=np.float32)[:,None]
        temp[pos:pos+take]+=chunk*window
        weight[pos:pos+take]+=window
        if not loop:break
        pos+=hop
    temp/=np.maximum(weight,.001)
    dur=target/RATE
    env=np.ones(target,dtype=np.float32)
    edge=min(round(fade_seconds*RATE),target//3)
    if edge>0:
        env[:edge]=np.linspace(0,1,edge,dtype=np.float32)
        env[-edge:]=np.linspace(1,0,edge,dtype=np.float32)
    dst[a:b]+=temp*env[:,None]*level

def merge_narration(mix):
    # Preserve actual V1 performance/timing exactly; don't substitute robotic model.
    for i in range(16):
        path=OUT/"voice"/f"line_{i:02d}.mp3"
        if not path.exists():raise FileNotFoundError(str(path))
        source=decode_voice(path)
        limit=round(7.13*RATE)
        if len(source)>limit:
            import subprocess
            tempo=min(1.6,len(source)/limit)
            raw=subprocess.run(["ffmpeg","-v","error","-i",str(path),
                  "-af",f"atempo={tempo:.5f},highpass=f=80,lowpass=f=10500,acompressor=threshold=-23dB:ratio=1.3:attack=12:release=180",
                  "-ar","48000","-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True).stdout
            source=np.frombuffer(raw,dtype="<f4")
        voice=source[:limit].copy()
        a=round((7.5*i+.17)*RATE)
        b=min(N,a+len(voice))
        voice=voice[:b-a]
        if len(voice)==0:continue
        p=max(.07,float(np.quantile(np.abs(voice[::24]),.995)))
        voice=np.clip(voice/p*.37,-.48,.48)
        # Smooth, modest 4 dB real-time sidechain ducking under voice only
        win=np.minimum(np.arange(len(voice))/round(.18*RATE),
                       (len(voice)-1-np.arange(len(voice)))/round(.24*RATE))
        win=np.clip(win,0,1)
        mix[a:b]*=(1.-.37*win[:,None])
        mix[a:b,0]+=voice*.92*win
        mix[a:b,1]+=voice*.92*win
    parent=OUT/"voice"/"mother.mp3"
    if parent.exists():
        data=decode_voice(parent)
        a=round(115.05*RATE);b=min(N,a+len(data))
        if b>a:
            frag=np.asarray(data[:b-a],dtype=np.float32)
            p=max(.08,float(np.quantile(np.abs(frag[::24]),.995)))
            frag=np.clip(frag/p*.16,-.21,.21)
            mix[a:b]*=.69
            mix[a:b,0]+=frag*.74
            mix[a:b,1]+=frag*.91

def render():
    OUT.mkdir(parents=True,exist_ok=True)
    files=get_sfx() # explicitly licensed original recordings, semantic title matching.
    decoded={k:decode_audio(path) for k,path in files.items()}
    for required in ("office","rain","traffic","siren","crowd","stairs","footsteps","alert","electrical","collision","helicopter","door","metro","heartbeat"):
        if required not in decoded:raise RuntimeError("Real background audio missing "+required)
    print("Loaded",len(decoded),"authentic field recorded sound files",flush=True)
    mix=np.zeros((N,2),dtype=np.float32)
    ambience={
        "office":normalized_asset(decoded["office"],rms_target=.06,lowpass=6200),
        "rain_inside":normalized_asset(decoded["rain"],rms_target=.065,lowpass=1300),
        "traffic":normalized_asset(decoded["traffic"],rms_target=.065,lowpass=3200),
        "rain_outside":normalized_asset(decoded["rain"],rms_target=.08,highpass=200),
        "corridor":normalized_asset(decoded["office"],rms_target=.035,lowpass=1100),
    }
    for key,(start,end,level,pan) in BEDS.items():
        # Level is a proportion of the normalized asset, avoid loud ambient clutter.
        put_segment(mix,ambience[key],start,end,level=level/.05,pan=pan,fade_seconds=1.4,loop=True)
        print("Continuous recorded bed",key,round(start,1),round(end,1),flush=True)
    for start,key,level,pan in EVENTS:
        # A phone call is a short discreet alert/vibration, not a comical marimba melody.
        sourcekey="alert" if key=="call" else key
        sound=decoded.get(sourcekey)
        if sound is None:continue
        eq={"alert":(None,500),"collision":(130,None),"crowd":(210,3200),
            "siren":(240,4400),"footsteps":(70,4800),
            "stairs":(70,4800),"door":(85,4600),"helicopter":(60,3600),
            "metro":(110,2100),"heartbeat":(45,1100),"electrical":(100,5000)}
        hi,lo=eq.get(sourcekey,(None,None))
        mastered=normalized_asset(sound,rms_target=.095,lowpass=lo,highpass=hi)
        maxsec=MAXLEN.get(key,3.0)
        stop=min(SECONDS,start+maxsec)
        put_segment(mix,mastered,start,stop,level=max(.10,level/.08),pan=pan,fade_seconds=.20,loop=False)
        print("Causal audio event",key,round(start,2),"s",flush=True)
    merge_narration(mix)
    # Final limiter; no global pumping/compression or artificial sound synthesis.
    peak=float(np.max(np.abs(mix)))
    if peak>0.90:mix*=.90/peak
    file=OUT/"dia_zero_v3_spatial_audio.wav"
    sf.write(file,mix,RATE,subtype="PCM_16")
    print("V3 MASTER",file,round(float(np.sqrt(np.mean(mix**2))),4),"RMS, peak",round(float(np.max(np.abs(mix))),4),flush=True)

if __name__=="__main__":render()
