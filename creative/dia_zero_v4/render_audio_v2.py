"""Dia Zero V2: real licensed SFX instead of sine waves and generated noise.
Source: Mixkit Free SFX https://mixkit.co/license/
The spoken take is kept intact because the user liked the V1 narration; voice stems
can also be replaced later with authorized VoiceStudio recordings without a recut.
"""
import re, math, subprocess, json, time
from pathlib import Path
import numpy as np
import requests
from bs4 import BeautifulSoup
import soundfile as sf
from scipy.signal import butter,sosfilt

ROOT=Path(__file__).parent
OUT=ROOT/"output"
SR=48000
N=120*SR
CONTINUOUS_SYNTH_TONE=False

# Changes only when a corresponding action or environment exists in the story.
EVENTS=[
    (0.0,"office",.075,0.0),
    (11.7,"alert",.19,-.24),
    (20.4,"electrical",.12,0.0),
    (29.0,"traffic",.075,.28),
    (31.7,"collision",.21,.25),
    (38.0,"siren",.070,-.60),
    (48.3,"crowd",.100,.10),
    (54.2,"stairs",.12,-.10),
    (60.7,"door",.12,.18),
    (65.0,"footsteps",.13,-.19),
    (73.8,"siren",.045,.43),
    (80.3,"footsteps",.11,.27),
    (83.0,"helicopter",.12,-.45),
    (90.8,"call",.15,-.16),
    (102.0,"metro",.10,.04),
    (106.0,"stairs",.12,-.05),
    (113.6,"door",.21,.57),
    (117.0,"heartbeat",.055,0.0),
]
# Official Mixkit asset listing pages; matching title is verified against the page.
ASSET_QUERIES={
 "office":("office",["office ambience","office background","working in office","office"]),
 "rain":("rain",["heavy rain ambience","long rain ambience","rain long loop"]),
 "traffic":("traffic",["city traffic background ambience","urban ambient sound","road traffic sound"]),
 "alert":("notification",["Dry pop up notification alert"]),
 "electrical":("electricity",["Electric buzz glitch"]),
 "collision":("crash",["Truck crash with explosion"]),
 "siren":("siren",["police siren","ambulance siren","siren"]),
 "crowd":("scream",["Rioting Crowd"]),
 "stairs":("footsteps",["Footsteps in a tunnel loop"]),
 "footsteps":("footsteps",["Crunchy road fast walking loop"]),
 "door":("door",["Knocking on a thick wooden door"]),
 "helicopter":("helicopter",["Helicopter flying in the sky"]),
 "call":("phone",["Marimba ringtone"]),
 "metro":("subway",["Old subway train arrives"]),
 "heartbeat":("heartbeat",["heartbeat sound","slow heartbeat","heart beating","heartbeat"]),
}
# Realistic event trim lengths, seconds.
MAX_DURATION={
 "alert":2.4,"electrical":2.4,"collision":4.8,"siren":11.0,
 "crowd":11.0,"stairs":8.0,"footsteps":10.0,"door":2.7,
 "helicopter":11.0,"call":3.1,"metro":7.0,"heartbeat":7.0,
}
SFX_DIR=OUT/"sfx"
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (compatible; FilmSoundDesign/1.0)"})

def catalogue(slug):
    r=session.get("https://mixkit.co/free-sound-effects/"+slug+"/",timeout=35)
    r.raise_for_status()
    soup=BeautifulSoup(r.text,"html.parser")
    found=[]
    for title in soup.select("h2.item-grid-card__title"):
        preview=title.find_previous(attrs={"data-audio-player-preview-url-value":True})
        if not preview:continue
        url=preview.get("data-audio-player-preview-url-value","")
        name=title.get_text(" ",strip=True)
        if url.startswith("https://assets.mixkit.co/active_storage/sfx/"):
            found.append((name,url))
    # Unique titles order-preserving.
    seen=set();out=[]
    for x in found:
        if x[1] not in seen:seen.add(x[1]);out.append(x)
    return out

def choose(title_list,needles):
    for needle in needles:
        for name,url in title_list:
            if needle.strip().lower() == name.strip().lower():return name,url
    return None

def get_sfx():
    SFX_DIR.mkdir(parents=True,exist_ok=True)
    catalogue_cache={}
    files={};provenance={}
    for k,(page,needles) in ASSET_QUERIES.items():
        if page not in catalogue_cache:
            catalogue_cache[page]=catalogue(page)
        match=choose(catalogue_cache[page],needles)
        if not match:
            print("No suitable authentic file for",k,"from",page,"— skipping; never substitute random effect",flush=True)
            continue
        title,url=match
        dest=SFX_DIR/f"{k}.mp3"
        if not dest.exists() or dest.stat().st_size<3000:
            try:
                reply=session.get(url,timeout=65)
                reply.raise_for_status()
                if len(reply.content)<3000:raise RuntimeError("Empty SFX")
                dest.write_bytes(reply.content)
            except Exception as e:
                print("SFX download not available",k,str(e)[:200],flush=True)
                continue
        files[k]=dest
        provenance[k]={"title":title,"url":url,"listing":"https://mixkit.co/free-sound-effects/"+page+"/"}
        print("AUTHENTIC SFX",k,":",title,round(dest.stat().st_size/1024),"KiB",flush=True)
    if len(files)!=len(ASSET_QUERIES):
        raise RuntimeError("Insufficient genuine environment recordings: "+str(list(files)))
    (SFX_DIR/"SOURCES.json").write_text(json.dumps(provenance,indent=2,ensure_ascii=False))
    return files

def decode_audio(path):
    result=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
        "-ar",str(SR),"-ac","2","-f","f32le","pipe:1"],capture_output=True,check=True)
    data=np.frombuffer(result.stdout,dtype="<f4")
    if not len(data) or len(data)%2:raise RuntimeError("Bad audio input "+str(path))
    return data.reshape(-1,2).copy()

def decode_voice(path):
    result=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
        "-af","highpass=f=80,lowpass=f=10500,acompressor=threshold=-22dB:ratio=1.45:attack=8:release=150",
        "-ar",str(SR),"-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True)
    return np.frombuffer(result.stdout,dtype="<f4")

def equal_power_pan(stereo,pan):
    # Keep true-stereo width while moving sources to a plausible direction.
    pan=np.clip(pan,-1,1)
    left=math.sqrt((1-pan)/2)
    right=math.sqrt((1+pan)/2)
    mono=stereo.mean(axis=1)
    return np.column_stack((mono*left,mono*right))

def add_recording(mix,rec,start,volume,pan=0.0,max_sec=None,fade=.4,loop=False,stop=None):
    start_frame=round(start*SR)
    end_frame=min(N,round((stop if stop is not None else 120)*SR))
    if start_frame>=end_frame:return
    if rec.shape[0]<100:return
    target_frames=end_frame-start_frame if loop else min(rec.shape[0],end_frame-start_frame)
    if max_sec is not None:target_frames=min(target_frames,round(max_sec*SR))
    if target_frames<10:return
    # offset in long recordings is deterministic and prevents repeatedly matching same waveform point.
    if loop:
        repeat=int(np.ceil(target_frames/rec.shape[0]))
        snippet=np.tile(rec,(repeat,1))[:target_frames]
    else:
        snippet=rec[:target_frames].copy()
    snippet=np.asarray(snippet,dtype=np.float32)
    peak=float(np.quantile(np.abs(snippet[::20]),.997))
    if peak<.001:peak=.001
    snippet/=max(.65,peak)
    samples=np.arange(target_frames,dtype=np.float32)
    attack=np.clip(samples/max(.15*SR,fade*SR),0,1)
    release=np.clip((target_frames-samples)/max(.25*SR,fade*SR),0,1)
    envelope=np.minimum(attack,release)*volume
    pan_audio=equal_power_pan(snippet,pan)
    # Everything is volume managed relative to voice and scene.
    mix[start_frame:start_frame+target_frames]+=pan_audio*envelope[:,None]

def add_voice(mix,dirpath):
    for i in range(16):
        path=dirpath/f"line_{i:02d}.mp3"
        if not path.is_file():raise RuntimeError("Missing original narration stem "+path.name)
        audio=decode_voice(path)
        if len(audio)>round(7.13*SR):
            ratio=len(audio)/(7.13*SR)
            # atempo adjustment only if necessary to protect the next scene.
            process=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
                "-af",f"atempo={max(1.0,min(ratio,1.6)):.4f},highpass=f=80,lowpass=f=10500",
                "-ar",str(SR),"-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True)
            audio=np.frombuffer(process.stdout,dtype="<f4")
        audio=audio[:round(7.13*SR)].copy()
        a=round((i*7.5+.17)*SR);b=min(N,a+len(audio));audio=audio[:b-a]
        if len(audio)==0:continue
        peak=max(.06,float(np.quantile(np.abs(audio[::23]),.997)))
        audio=np.clip(audio/peak*.34,-.4,.4)
        # Gentle sidechain ducking (under 4 dB) rather than dropping ambience to silence.
        voice_env=np.minimum(np.minimum(np.arange(len(audio))/.12/SR, (len(audio)-np.arange(len(audio)))/.17/SR),1.0)
        voice_env=np.clip(voice_env,0,1).astype(np.float32)
        mix[a:b]*=(1-.25*voice_env[:,None])
        mix[a:b,0]+=audio*.94*voice_env
        mix[a:b,1]+=audio*.94*voice_env
    mother=dirpath/"mother.mp3"
    if mother.exists():
        audio=decode_voice(mother)
        a=round(115.0*SR);b=min(N,a+len(audio))
        if b>a:
            s=np.copy(audio[:b-a])
            s=s/max(.05,float(np.quantile(np.abs(s[::23]),.997)))
            # Distant ominous voice, not a loud comedic jump scare.
            mix[a:b]*=.75
            mix[a:b,0]+=.135*s
            mix[a:b,1]+=.195*s

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    sources=get_sfx()
    decoded={name:decode_audio(path) for name,path in sources.items()}
    print("Mixing photographic audio: genuine recorded room tone, traffic, rain and grounded events",flush=True)
    mix=np.zeros((N,2),dtype=np.float32)
    # Never synthesize drone, fake white-noise rain, sine-wave sirens, or random bangs.
    # Scene beds: office until blackout, city traffic behind windows, wet city when outside, interior hush near the ending.
    if "office" in decoded:add_recording(mix,decoded["office"],0,.09,stop=42,fade=2,loop=True)
    if "rain" in decoded:
        add_recording(mix,decoded["rain"],10,.026,pan=.10,stop=60,fade=4,loop=True)
        add_recording(mix,decoded["rain"],59,.074,pan=-.07,stop=103,fade=2,loop=True)
        add_recording(mix,decoded["rain"],102,.017,pan=.22,stop=120,fade=3,loop=True)
    if "traffic" in decoded:
        add_recording(mix,decoded["traffic"],26,.055,pan=.22,stop=60,fade=4,loop=True)
        add_recording(mix,decoded["traffic"],59,.083,pan=-.22,stop=97,fade=3,loop=True)
    for at,kind,gain,pan in EVENTS:
        if kind in ("office","traffic","rain"):continue
        sound=decoded.get(kind)
        if sound is None:continue
        duration=MAX_DURATION.get(kind,7)
        # Occasional key events only; avoids unrelated bangs and siren cacophony.
        add_recording(mix,sound,at,gain,pan=pan,max_sec=duration,fade=.18,loop=False)
    # Spoken narration from V1 (approved by user), individually mastered as dry stems.
    add_voice(mix,OUT/"voice")
    # Peaks at -1.3 dBFS; no global clipping or pumping.
    peak=float(np.max(np.abs(mix)))
    if peak>0.86:mix*=.86/peak
    sf.write(OUT/"dia_zero_v2_real_audio.wav",mix,SR,subtype="PCM_16")
    print("SFX chosen:",list(decoded),"; 120s recorded soundscape mixed.",flush=True)

if __name__=="__main__":main()
