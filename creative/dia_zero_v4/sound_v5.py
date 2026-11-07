"""Dia Zero V5 audio: Foley attached to exact illustrated action frames.
Original approved narrator remains; complete spatial field recording beds are continuous,
with gentle ducking. No meme/random movie impacts and no synthesized ambient drone.
"""
import json,math,subprocess,requests
from pathlib import Path
import numpy as np,soundfile as sf
from bs4 import BeautifulSoup
from audio_v4 import SOUNDS as ORIGINAL,decode_recording
from audio_v3 import normalized_asset,put_segment,RATE,N,OUT
from edit_plan_v5 import SHOT_ACTIONS,shots

SFX_SOURCES={
 **ORIGINAL,
 "keyboard":("keyboard","Keyboard typing"),
 "click":("keyboard","Single key press in a laptop"),
 "alert":("alarm","Emergency alert alarm"),
 "tv":("static","Broken radio frequency signal"),
 "footsteps":("footsteps","Footsteps in a tunnel loop"),
 "elevator":("electrical","Electric buzz glitch"),
 "gate":("door","Heavy sliding door"),
 "metal":("door","Heavy sliding door"),
 "breath":("breathe","Male sleep breathe"),
 "floor":("door","Wooden floorboard creak"),
}
# beat, shot position, sound key, fraction of that shot where sound begins, volume, pan
CUES=[
 (0,0,"keyboard",.10,.11,-.10),(0,2,"click",.35,.11,.16),
 (1,0,"phone",.12,.26,-.22),(1,1,"alert",.18,.12,-.24),
 (2,1,"boom",.35,.21,.35),(2,2,"siren",.20,.07,-.52),
 (3,0,"electric",.10,.19,.12),(3,1,"glass",.20,.22,.18),
 (3,2,"papers",.12,.16,-.12),(3,3,"alarm",.08,.12,.08),
 (4,1,"horn",.10,.17,-.31),(4,2,"crash",.18,.28,.32),(4,3,"splash",.23,.11,.20),
 (5,1,"splash",.12,.15,.22),(5,2,"zombie",.18,.13,.23),(5,2,"wetsteps",.62,.08,.22),
 (6,0,"tv",.27,.035,.04),(6,2,"static",.10,.16,.0),
 (7,0,"footsteps",.14,.11,-.12),(7,1,"elevator",.25,.10,.02),
 (7,2,"stairs",.13,.15,-.11),(7,3,"stairs",.17,.10,.18),
 (8,0,"door",.22,.18,.20),(8,2,"fire",.20,.18,.37),
 (9,0,"splash",.10,.13,-.21),(9,1,"crowd",.10,.16,.16),
 (9,2,"footsteps",.21,.15,-.12),(9,3,"splash",.28,.13,-.06),
 (10,0,"zombie",.18,.15,.35),(10,0,"crowd",.50,.07,-.20),
 (10,1,"footsteps",.22,.15,.12),(10,2,"gate",.38,.11,.05),
 (11,0,"footsteps",.15,.04,-.22),(11,1,"helicopter",.02,.17,-.4),
 (12,0,"phone",.12,.17,-.18),(12,2,"breath",.18,.095,-.02),
 (13,0,"metal",.24,.085,.12),(13,1,"metal",.35,.065,.22),
 (13,2,"electric",.13,.10,-.22),(13,3,"footsteps",.25,.08,.07),
 (14,0,"door",.23,.15,.23),(14,1,"stairs",.18,.12,-.10),
 (14,2,"keys",.22,.20,.20),(14,3,"door",.14,.10,.16),
 (14,4,"knock",.10,.15,.56),
 (15,0,"phone",.12,.14,-.20),(15,1,"heartbeat",.22,.025,.0),
 (15,3,"floor",.43,.075,.22),
]
# Distinct authentic acoustic environments: soft inside, wide saturated street,
# the station, then very quiet residential corridor, no abrupt random silence.
BEDS=[
 ("office","office",0.,52.,.033,-.10,100,4800),
 ("rain_behind_window","rain",0.,59.,.012,.22,180,1550),
 ("city_behind_window","traffic",16.,52.,.018,.13,150,2600),
 ("facility_alarm","alarm",28.,58.5,.008,.02,250,2600),
 ("stairwell","office",52.,60.,.012,-.16,180,1250),
 ("street_rain","rain",59.,98.,.058,.04,170,7000),
 ("street_traffic","traffic",59.,92.,.023,-.12,180,4500),
 ("crowd_in_distance","crowd",67.,82.,.012,.27,270,3300),
 ("alley_wind","wind",74.,88.,.011,.20,120,2500),
 ("metro_entrance_rain","rain",97.,105.,.032,.14,200,3900),
 ("residential_corridor","office",105.,114.,.008,-.08,220,940),
 ("rain_through_apartment","rain",113.,120.,.008,.26,250,1100),
]
MAX_DURATION={"keyboard":1.7,"click":.35,"phone":1.15,"alert":2.2,"boom":2.7,"siren":5.,
 "electric":1.55,"glass":1.35,"papers":2.3,"alarm":3.4,"horn":1.6,"crash":2.7,
 "splash":1.35,"zombie":1.5,"wetsteps":2.1,"tv":2.1,"static":1.8,
 "footsteps":3.0,"elevator":.9,"stairs":2.6,"door":1.5,"fire":5.0,"crowd":3.2,
 "gate":2.0,"helicopter":6.0,"breath":2.6,"metal":1.1,"keys":1.45,
 "knock":2.0,"heartbeat":2.2,"floor":1.7}
CACHE=OUT/"v5_sound_recordings"

def catalogued_recordings():
    CACHE.mkdir(parents=True,exist_ok=True)
    needed=set([s for _,_,s,_,_,_ in CUES]+[s for _,s,*_ in BEDS])
    req=requests.Session();req.headers.update({"User-Agent":"Mozilla/5.0"})
    catalog={};recordings={};credits={}
    for sound in sorted(needed):
        slug,title=SFX_SOURCES[sound]
        if slug not in catalog:
            r=req.get("https://mixkit.co/free-sound-effects/"+slug+"/",timeout=45)
            r.raise_for_status()
            soup=BeautifulSoup(r.text,"html.parser")
            items={}
            for entry in soup.select("h2.item-grid-card__title"):
                player=entry.find_previous(attrs={"data-audio-player-preview-url-value":True})
                if not player:continue
                actual=entry.get_text(" ",strip=True)
                url=player.get("data-audio-player-preview-url-value","")
                if url.startswith("https://assets.mixkit.co/active_storage/sfx/"):
                    items[actual.casefold()]=(actual,url)
            catalog[slug]=items
        selected=catalog[slug].get(title.casefold())
        if not selected:raise RuntimeError(f"Sound not found in Mixkit listing: {sound} {title!r}")
        real_title,url=selected
        dest=CACHE/f"{sound}.mp3"
        if not dest.exists() or dest.stat().st_size<2000:
            raw=req.get(url,timeout=80);raw.raise_for_status()
            if len(raw.content)<2000:raise RuntimeError("Empty field audio "+sound)
            dest.write_bytes(raw.content)
        recordings[sound]=decode_recording(dest)
        credits[sound]={"recording":real_title,"url":url,"catalog":"https://mixkit.co/free-sound-effects/"+slug+"/"}
        print("LICENSED REAL SOUND",sound,real_title,flush=True)
    (OUT/"v5_sound_credits.json").write_text(json.dumps(credits,indent=2,ensure_ascii=False))
    return recordings

def original_male_narrator(mix):
    # dry original approved spoken takes, no synthesized "mother" spoken message
    import subprocess
    for i in range(16):
        path=OUT/"voice"/f"line_{i:02d}.mp3"
        if not path.is_file():raise FileNotFoundError(path)
        proc=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
          "-af","highpass=f=85,lowpass=f=9500,acompressor=threshold=-23dB:ratio=1.4:attack=12:release=170",
          "-ar",str(RATE),"-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True)
        mono=np.frombuffer(proc.stdout,dtype="<f4")
        limit=round(7.13*RATE)
        if len(mono)>limit:
            speed=min(1.65,len(mono)/limit)
            proc=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
             "-af",f"atempo={speed:.4f},highpass=f=85,lowpass=f=9500",
             "-ar",str(RATE),"-ac","1","-f","f32le","pipe:1"],capture_output=True,check=True)
            mono=np.frombuffer(proc.stdout,dtype="<f4")
        speech=mono[:limit].copy()
        a=round((i*7.5+.17)*RATE)
        b=min(N,a+len(speech));speech=speech[:b-a]
        if b<=a:continue
        loud=max(.06,float(np.quantile(np.abs(speech[::20]),.995)))
        speech=np.clip(speech/loud*.34,-.46,.46)
        fade=np.ones(len(speech),dtype=np.float32)
        nfade=min(round(.13*RATE),len(speech)//3)
        if nfade:
            fade[:nfade]=np.linspace(0,1,nfade)
            fade[-nfade:]=np.linspace(1,0,nfade)
        # only moderate sidechain ambience suppression during natural speech
        mix[a:b]*=(1-.28*fade[:,None])
        mix[a:b,0]+=speech*.93*fade
        mix[a:b,1]+=speech*.93*fade

def create_audio():
    OUT.mkdir(parents=True,exist_ok=True)
    recorded=catalogued_recordings()
    mix=np.zeros((N,2),dtype=np.float32)
    selected=shots()
    manifest=[]
    for label,key,start,end,level,pan,hi,lo in BEDS:
        sound=normalized_asset(recorded[key],rms_target=.075,highpass=hi,lowpass=lo)
        put_segment(mix,sound,start,end,level=level/.075,pan=pan,fade_seconds=1.7,loop=True)
        print("REAL ENVIRONMENT",label,round(start,1),round(end,1),flush=True)
    for beat,pos,key,fraction,volume,pan in CUES:
        shot=next((s for s in selected if s["beat"]==beat and s["pos"]==pos),None)
        if shot is None or key not in shot["visible"]:
            raise RuntimeError(f"Unmotivated Foley {key} on beat {beat}, shot {pos}")
        duration=shot["end"]-shot["start"]
        when=shot["start"]+duration*fraction
        maxlen=MAX_DURATION.get(key,2.)
        end=min(N/RATE,when+maxlen)
        if key=="helicopter":end=min(end,90.)
        if key=="breath":end=min(end,97.4)
        lowpass=1600 if key=="breath" else (1800 if key=="boom" else 7200)
        highpass=180 if key in ("splash","rain","crash","papers") else 85
        clean=normalized_asset(recorded[key],rms_target=.09,highpass=highpass,lowpass=lowpass)
        put_segment(mix,clean,when,end,level=volume/.15,pan=pan,fade_seconds=.16,loop=False)
        manifest.append({"beat":beat,"shot":pos,"asset":list(shot["asset"]),"event":key,
          "time_seconds":round(when,3),"start_frame":round(when*RATE),"source":SFX_SOURCES[key][1],
          "pan":pan,"gain":volume,"duration":round(end-when,3)})
        print("CAUSAL FOLEY",round(when,2),key,"shot",beat,pos,flush=True)
    original_male_narrator(mix)
    peak=float(np.max(np.abs(mix)))
    if peak>.87:mix*=.87/peak
    dest=OUT/"dia_zero_v5_real_stereo_sound.wav"
    sf.write(dest,mix,RATE,subtype="PCM_16")
    (OUT/"v5_sound_cues.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
    print("COMPLETED STEREO FOLEY",dest,round(float(np.sqrt(np.mean(mix**2))),4),"RMS peak",round(float(np.max(np.abs(mix))),4),flush=True)

if __name__=="__main__":create_audio()
