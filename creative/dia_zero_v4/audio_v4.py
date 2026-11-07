"""Dia Zero V4 — documented Foley cues mapped to 16 script beats and the exact 60-shot cut sheet.
Environmental sounds are genuine recordings (Mixkit), and effects are only emitted for
the concrete actions in shot_manifest_v4.json. No generic trailer bangs, meme noises,
or endless synthetic siren loop.
"""
from pathlib import Path
import json,math,requests
import numpy as np
import soundfile as sf
from bs4 import BeautifulSoup
from scipy.signal import butter,sosfilt
from audio_v3 import merge_narration, normalized_asset,put_segment, RATE,N,OUT
from plan_v4 import shot_timeline

# Real recordings with matching descriptions; no arbitrary fuzzy choices.
SOUNDS={
 "office":("office","Office ambience"),
 "rain":("rain","Heavy rain ambience"),
 "traffic":("traffic","City traffic background ambience"),
 "typing":("keyboard","Keyboard typing"),
 "phone":("notification","Dry pop up notification alert"),
 "electric":("electrical","Electric buzz glitch"),
 "glass":("glass","Glass break with hammer thud"),
 "papers":("paper","Papers blowing in the windstorm"),
 "alarm":("alarm","Emergency alert alarm"),
 "boom":("explosion","Distant explosion"),
 "siren":("siren","Police siren"),
 "horn":("car","Car horn"),
 "splash":("splash","Water splash"),
 "wetsteps":("footsteps","Footsteps in a muddy puddle"),
 "crash":("crash","Truck crash with explosion"),
 "fire":("fire","Big fire burning"),
 "crowd":("crowd","Rioting Crowd"),
 "stairs":("footsteps","Footsteps in a tunnel loop"),
 "door":("door","Slamming a door"),
 "knock":("door","Knocking on a thick wooden door"),
 "helicopter":("helicopter","Helicopter flying in the sky"),
 "metro":("subway","Old subway train arrives"),
 "static":("static","Glitch static"),
 "keys":("keys","Door key in door lock"),
 "heartbeat":("heartbeat","Slow heartbeat"),
 "wind":("wind","Storm wind"),
 "zombie":("horror","Gasping zombie"),
}
# Each event = voice beat 0..15, offset in beat 0..7.5, relevant recorded sound,
# mix level (0..1), physical position left(-1) or right(+1).
SFX_EVENTS=[
 (0,.55,"typing",.10,-.08),
 (1,.45,"phone",.13,-.15),
 (1,2.7,"phone",.08,.10),
 (2,4.0,"boom",.11,.42),     # plume of smoke after distant road explosion
 (2,5.8,"siren",.035,-.56),
 (3,.22,"electric",.13,.20),  # lighting starts flickering
 (3,1.95,"glass",.12,.13),   # glass of fluorescent bulb shatters onscreen
 (3,3.8,"papers",.13,.05),   # papers fly under panic/wind
 (3,5.75,"alarm",.090,-.17),
 (4,.65,"horn",.12,-.3),
 (4,2.05,"crash",.15,.32),   # bus slams into the car on screen
 (4,3.65,"splash",.055,.33), # tire plows wet asphalt
 (4,5.6,"siren",.048,-.4),
 (5,.3,"splash",.083,.25),   # zombie lying in the flooded street
 (5,2.8,"zombie",.066,-.05), # infected struggles to stand
 (5,5.0,"wetsteps",.061,.12),
 (6,.85,"static",.096,.13),  # live TV broadcast breaks up
 (6,3.5,"alarm",.040,.35),
 (7,.6,"electric",.062,.16), # stuck elevator power
 (7,2.1,"stairs",.096,-.19),
 (7,4.5,"stairs",.080,.06),
 (7,5.95,"door",.090,.39),
 (8,.25,"door",.090,.20),    # exterior emergency exit opens
 (8,2.0,"fire",.115,.23),   # car burning under smoke
 (8,4.8,"horn",.045,-.3),
 (8,5.9,"splash",.064,-.20),
 (9,.35,"crowd",.088,.35),  # people running away
 (9,2.3,"siren",.040,-.48),
 (9,3.8,"wetsteps",.080,-.13),
 (9,5.9,"splash",.074,.10),  # boots striking puddle
 (10,.20,"zombie",.062,-.38),
 (10,1.85,"wetsteps",.072,.05),
 (10,4.5,"wind",.031,.32),  # exposed alley wind rather than trailer whoosh
 (11,1.9,"helicopter",.14,-.55),
 (12,.20,"phone",.095,-.13), # caller ID at 90.2 sec
 (12,3.7,"static",.025,.13), # almost silent bad connection; NO robotic voice
 (13,1.8,"metro",.072,-.21), # closed station in frame
 (13,5.0,"electric",.044,.0),# distant power grid dies
 (14,.30,"stairs",.075,-.13),
 (14,4.05,"keys",.095,.24),  # apartment key/lock close-up
 (14,4.5,"knock",.095,.58), # figure behind door
 (14,6.45,"door",.026,.36), # door shifts as she speaks
 (15,.22,"phone",.125,-.19),# final contradictory message
 (15,3.25,"heartbeat",.037,.0),
 (15,5.95,"door",.029,.36), # ominous door movement only
]
# Five physical soundspaces; no random panning jumps, no endless artificial tones.
BEDS=[
 ("office","office",0.0,57.5,.067,-.02,300,5200),
 ("window_rain","rain",0.0,59.0,.029,.15,140,1700),
 ("distant_city","traffic",14.0,54.0,.033,.23,180,3000),
 ("stairwell","office",52.0,61.0,.026,-.06,180,1050),
 ("street_rain","rain",59.0,99.0,.085,.0,190,6600),
 ("traffic_street","traffic",60.0,98.0,.069,-.04,110,5000),
 ("windy_alley","wind",75.0,91.0,.027,.20,160,2300),
 ("dark_hall","office",103.0,120.0,.013,-.04,130,1000),
 ("rain_through_window","rain",104.0,120.0,.018,.28,200,1500),
]
MAX_DURATION={
 "typing":3.2,"phone":.7,"electric":1.4,"glass":2.0,
 "papers":2.4,"alarm":3.6,"boom":3.3,"siren":6.5,"horn":1.6,
 "splash":1.5,"wetsteps":3.6,"crash":3.3,"fire":5.0,
 "crowd":4.5,"stairs":4.3,"door":1.3,"knock":2.2,
 "helicopter":9.0,"metro":3.5,"static":1.2,"keys":1.9,
 "heartbeat":2.8,"wind":3.2,"zombie":2.5,
}
CACHE=OUT/"sfx_v4"

def authentic_recordings():
    CACHE.mkdir(exist_ok=True,parents=True)
    session=requests.Session()
    session.headers.update({"User-Agent":"Mozilla/5.0"})
    listings={}
    recordings={}
    credits={}
    for key,(slug,wanted) in SOUNDS.items():
        if slug not in listings:
            r=session.get("https://mixkit.co/free-sound-effects/"+slug+"/",timeout=32)
            r.raise_for_status()
            soup=BeautifulSoup(r.text,"html.parser")
            found={}
            for name in soup.select("h2.item-grid-card__title"):
                audio=name.find_previous(attrs={"data-audio-player-preview-url-value":True})
                if audio:
                    title=name.get_text(" ",strip=True)
                    source=audio.get("data-audio-player-preview-url-value","")
                    if source.startswith("https://assets.mixkit.co/active_storage/sfx/"):
                        found[title.lower()]=(title,source)
            listings[slug]=found
        found=listings[slug].get(wanted.lower())
        if found is None:raise RuntimeError("Exact source not found "+slug+" :: "+wanted)
        title,url=found
        path=CACHE/(key+".mp3")
        if not path.exists() or path.stat().st_size<3500:
            content=session.get(url,timeout=75)
            content.raise_for_status()
            if len(content.content)<3500:raise RuntimeError("Missing WAV asset "+key)
            path.write_bytes(content.content)
        recordings[key]=path
        credits[key]={"title":title,"url":url,"index":"https://mixkit.co/free-sound-effects/"+slug+"/"}
        print("VERIFIED LICENSED FOLEY",key,title,round(path.stat().st_size/1024),"KiB",flush=True)
    (OUT/"SFX_CREDITS_V4.json").write_text(json.dumps(credits,ensure_ascii=False,indent=2))
    return recordings

def decode_recording(path):
    import subprocess
    result=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),
      "-ar","48000","-ac","2","-f","f32le","pipe:1"],capture_output=True,check=True)
    raw=np.frombuffer(result.stdout,dtype="<f4")
    if len(raw)%2 or len(raw)<400:raise RuntimeError("Corrupt SFX "+str(path))
    return raw.reshape(-1,2).copy()

def render():
    OUT.mkdir(exist_ok=True)
    files=authentic_recordings()
    recordings={key:decode_recording(path) for key,path in files.items()}
    mix=np.zeros((N,2),dtype=np.float32)
    for label,key,start,end,volume,pan,hi,lo in BEDS:
        prepared=normalized_asset(recordings[key],rms_target=.085,highpass=hi,lowpass=lo)
        # volume is fraction of reference record, not an automated pumping compressor.
        put_segment(mix,prepared,start,end,level=volume/.10,pan=pan,fade_seconds=2.0,loop=True)
        print("CONTINUOUS BED",label,start,end,flush=True)
    realized=[]
    for beat,offset,key,level,pan in SFX_EVENTS:
        sec=round(beat*7.5+offset,3)
        shot=next((x for x in shot_timeline() if x["start"]<=sec<x["end"]),None)
        if shot is None or shot["beat"]!=beat:raise RuntimeError("SFX outside visual beat: "+str((beat,key,sec)))
        # Distinguish doors, splashes, broken fluorescent lights, flying paper, alarms.
        high,low={
          "phone":(280,7500),"electric":(130,8000),"glass":(175,9500),
          "papers":(200,5800),"alarm":(200,5500),"boom":(65,3000),
          "crash":(85,5000),"fire":(190,6500),"splash":(145,5600),
          "zombie":(120,3000),"crowd":(200,5000),"door":(90,5000),
          "knock":(100,3600),"helicopter":(70,3700),
          "stairs":(90,4200),"wetsteps":(130,4600)
        }.get(key,(120,6000))
        prepared=normalized_asset(recordings[key],rms_target=.10,highpass=high,lowpass=low)
        end=min(120.,sec+MAX_DURATION.get(key,2.0))
        put_segment(mix,prepared,sec,end,level=min(.82,level/.20),pan=pan,fade_seconds=.14,loop=False)
        realized.append({"beat":beat,"second":sec,"visual_source_index":shot["source"],
                         "sound":key,"recording":SOUNDS[key][1],"pan":pan,"level":level})
        print("SYNCHRONIZED FOLEY",sec,key,"shot",shot["source"],flush=True)
    (OUT/"sound_cues_v4.json").write_text(json.dumps(realized,indent=2,ensure_ascii=False))
    merge_narration(mix)
    peak=float(np.max(np.abs(mix)))
    if peak>.87:mix*=.87/peak
    result=OUT/"dia_zero_v4_story_sound.wav"
    sf.write(result,mix,RATE,subtype="PCM_16")
    print("FINAL SOUND FILE",result,round(float(np.sqrt(np.mean(mix**2))),4),"RMS",round(float(np.max(np.abs(mix))),4),"peak",flush=True)

if __name__=="__main__":render()
