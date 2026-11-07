"""Narration-aligned on-screen dialogue cues, not generic per-shot text."""
import json, re, subprocess, math
from pathlib import Path
from story import LINES
BASE=Path(__file__).parent
FPS=24
SCENE_SECONDS=7.5
VOICE_OFFSET=.17
TOTAL=120

def groups_of_spoken_words(tokens):
    groups=[];cur=[];start=0
    for i,token in enumerate(tokens):
        cur.append(i)
        # short 3-5 word captions that can follow naturally spoken clauses
        stop=(len(cur)>=4 and token.endswith((",",";",".","!","?",":","…"))) or len(cur)>=5
        if stop:
            groups.append(cur);cur=[]
    if cur:
        if len(cur)<2 and groups and len(groups[-1])<5:
            groups[-1].extend(cur)
        else:groups.append(cur)
    return groups

def create_caption_cues(lines,word_timings=None,durations=None):
    """Create cues synced to the exact 16 approved voice stems.
    word_timings[i] is optional ASR alignment with relative start and end (seconds).
    Fallback uses real voice duration; content always taken from original script.
    """
    if len(lines)!=16:raise ValueError("Expected sixteen original narrative takes")
    durations=durations if durations is not None else [6.2]*len(lines)
    if len(durations)!=16:raise ValueError("Need duration per voice take")
    cues=[]
    for i,line in enumerate(lines):
        tokens=line.split()
        if not tokens:continue
        stem_dur=float(durations[i])
        # Existing mix uses atempo if longer than 7.13 s.
        speed=max(1.0,stem_dur/7.13)
        live_end=min(7.12,stem_dur/speed)
        local_align=word_timings[i] if word_timings and i<len(word_timings) else None
        exact=local_align if local_align and len(local_align)==len(tokens) else None
        for positions in groups_of_spoken_words(tokens):
            first=positions[0];last=positions[-1]
            if exact:
                t0=max(0.,float(exact[first]["start"])/speed)
                t1=min(live_end,float(exact[last]["end"])/speed+.13)
            else:
                t0=live_end*first/len(tokens)
                t1=live_end*(last+1)/len(tokens)+.08
            start=i*SCENE_SECONDS+VOICE_OFFSET+t0
            end=min(i*SCENE_SECONDS+SCENE_SECONDS-.12,i*SCENE_SECONDS+VOICE_OFFSET+t1)
            if end<=start:end=start+.12
            if end-start>2.75:
                end=start+2.75
            text=" ".join(tokens[first:last+1]).strip()
            cues.append({"start":round(start,3),"end":round(end,3),"text":text,"line":i})
    return cues

def _normalize(w):
    return re.sub(r"[^a-z0-9]+","",w.lower().replace("ã","a").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ç","c"))

def align_word_times(reference,recognized,raw_duration):
    """Anchor to aligned recognitions but preserve the approved source wording."""
    from difflib import SequenceMatcher
    ref=reference.split()
    if not ref or not recognized:return None
    obs=[{"text":str(item.get("word","")).strip(),"start":float(item["start"]),"end":float(item["end"])} for item in recognized if item.get("start") is not None and item.get("end") is not None]
    if not obs:return None
    seq=SequenceMatcher(None,[_normalize(w) for w in ref],[_normalize(w["text"]) for w in obs],autojunk=False)
    starts=[None]*len(ref);ends=[None]*len(ref)
    anchors=0
    for tag,a,b,c,d in seq.get_opcodes():
        if tag=="equal":
            for j,k in zip(range(a,b),range(c,d)):
                starts[j]=obs[k]["start"];ends[j]=obs[k]["end"];anchors+=1
    # If recognizer diverges badly, do not trust guessed timestamps.
    if anchors/max(1,len(ref))<.50:return None
    for j in range(len(ref)):
        if starts[j] is not None:continue
        before=next((k for k in range(j-1,-1,-1) if starts[k] is not None),None)
        after=next((k for k in range(j+1,len(ref)) if starts[k] is not None),None)
        if before is None and after is None:continue
        if before is None:
            starts[j]=max(0.,starts[after]*(j+.5)/(after+1))
            ends[j]=min(starts[after],starts[j]+.18)
        elif after is None:
            starts[j]=ends[before]+(raw_duration-ends[before])*(j-before-1)/max(1,len(ref)-before)
            ends[j]=min(raw_duration,starts[j]+.24)
        else:
            fraction=(j-before)/(after-before)
            starts[j]=ends[before]+fraction*(starts[after]-ends[before])
            ends[j]=min(starts[after],starts[j]+.20)
    result=[]
    prev=0.
    for j in range(len(ref)):
        a=max(prev,float(starts[j] or 0.));b=max(a+.02,float(ends[j] or a+.1))
        result.append({"start":a,"end":b})
        prev=a
    return result

def probe_duration(path):
    raw=subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)])
    return float(raw.decode().strip())

def create_file():
    root=BASE/"output"
    voice_dir=root/"voice"
    durs=[probe_duration(voice_dir/f"line_{i:02d}.mp3") for i in range(16)]
    align=[None]*16
    try:
        from faster_whisper import WhisperModel
        model=WhisperModel("base",device="cpu",compute_type="int8",cpu_threads=4,num_workers=1)
        for i,line in enumerate(LINES):
            path=voice_dir/f"line_{i:02d}.mp3"
            segments,info=model.transcribe(str(path),language="pt",beam_size=2,word_timestamps=True,condition_on_previous_text=False,vad_filter=False)
            obs=[{"word":w.word,"start":w.start,"end":w.end} for seg in segments for w in (seg.words or [])]
            align[i]=align_word_times(line,obs,durs[i])
            print("Aligned original words",i,sum(x is not None for x in [align[i]]),len(obs),flush=True)
    except Exception as e:
        print("Word alignment unavailable; fallback to timecoded real narration duration",repr(e),flush=True)
    cues=create_caption_cues(LINES,align,durs)
    root.mkdir(exist_ok=True)
    out=root/"captions_v3.json"
    out.write_text(json.dumps({"cues":cues,"source":"original approved dry narration", "durations":durs,"alignment":"whisper base word-time where reliable, duration-aware fallback elsewhere"},ensure_ascii=False,indent=2))
    print("Subtitle cues",len(cues),"range",cues[0]["start"],cues[-1]["end"],"saved",out,flush=True)

if __name__=="__main__":create_file()
