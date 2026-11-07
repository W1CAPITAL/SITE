"""Dia Zero V4 — story first. Exactly 60 unique original comic panels in 16 causal narrative beats.
Never random shuffle. Never use the 96 raw images in page order as if each were a slideshow.
Captions are the actual narration, not cut-based slogans. No opaque caption box.
"""
from pathlib import Path
import bisect, json, math, subprocess
import cv2
import numpy as np
from PIL import Image,ImageDraw
from plan_v4 import SHOT_PLAN,shot_timeline,FPS,TOTAL_SECONDS
from render_video_v3 import all_96,subtitle_overlay,W,H,OUTPUT

ROOT=Path(__file__).parent

def normalize_cues(cues):
    """Shorten earlier cues so two distinct phrases never overlap onscreen."""
    ordered=sorted((dict(x) for x in cues),key=lambda x:x["start"])
    for i,c in enumerate(ordered):
        if i+1<len(ordered):
            c["end"]=min(float(c["end"]),float(ordered[i+1]["start"])-.035)
        c["start"]=max(0.,float(c["start"]))
        c["end"]=max(c["start"]+.08,min(120.,float(c["end"])))
    return ordered

def stable_transform(cut,frame_in_cut):
    """Zero rotation and zero random shake. Only tiny slow purposeful pan and push."""
    duration=60 if len(SHOT_PLAN[shot_timeline()[cut]["beat"]])==3 else 45
    p=np.clip(frame_in_cut/max(1,duration-1),0.,1.)
    eased=p*p*(3-2*p)
    zoom=(1.020+.028*eased) if cut%2==0 else (1.048-.023*eased)
    x=17*(eased-.5)*(1 if cut%4<2 else -1)
    y=8*(eased-.5)*(1 if cut%3==0 else -1)
    return (float(zoom),float(x),float(y),0.0)

def shade_caption(frame,layer,fade):
    # A subtle 3px outline is part of letter drawing; image background stays untouched.
    top,bottom=H-500,H-150
    image=layer[top:bottom]
    alpha=image[:,:,3].astype(np.float32)/255.0*fade
    if np.max(alpha)<.01:return frame
    rgb=image[:,:,:3][:,:,::-1]
    roi=frame[top:bottom]
    roi[:]=(roi*(1-alpha[:,:,None])+rgb*alpha[:,:,None]).astype(np.uint8)
    return frame

def soft_rain(frame,sec,shotidx):
    if not (60<=sec<99):return frame
    # Only rain that is physically moving in the shot. Does not make camera wobble.
    rng=np.random.default_rng(1234+shotidx)
    for k in range(16):
        x=int((rng.integers(0,W)+k*53)%W)
        y=int((rng.integers(0,H)+sec*320+k*132)%H)
        cv2.line(frame,(x,y),(max(x-7,0),min(y+43,H-1)),(144,136,127),1,cv2.LINE_AA)
    return frame

def render():
    OUTPUT.mkdir(exist_ok=True,parents=True)
    allraw=all_96()
    timeline=shot_timeline()
    raws=[cv2.imread(str(allraw[x["source"]]),cv2.IMREAD_COLOR) for x in timeline]
    if any(img is None or img.shape[:2]!=(H,W) for img in raws):
        raise RuntimeError("Corrupt HQ source image")
    cap_file=OUTPUT/"captions_v3.json"
    cues=normalize_cues(json.loads(cap_file.read_text())["cues"])
    timestamps=[c["start"] for c in cues]
    cache={}
    manifest=[dict(x,summary=f"Voice scene {x['beat']+1}",panel_source=x["source"]) for x in timeline]
    (OUTPUT/"shot_manifest_v4.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
    (OUTPUT/"captions_synchronized_v4.json").write_text(json.dumps(cues,indent=2,ensure_ascii=False))
    out=OUTPUT/"dia_zero_v4_coherent_silent.mp4"
    cmd=["ffmpeg","-y","-hide_banner","-loglevel","error","-f","rawvideo",
         "-pixel_format","bgr24","-video_size",f"{W}x{H}",
         "-framerate",str(FPS),"-i","pipe:0","-an",
         "-c:v","libx264","-pix_fmt","yuv420p","-profile:v","high",
         "-level:v","4.2","-preset","veryfast","-crf","21",
         "-movflags","+faststart",str(out)]
    process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    tindex=0
    for frame_n in range(TOTAL_SECONDS*FPS):
        while tindex+1<len(timeline) and frame_n>=timeline[tindex]["end_frame"]:
            tindex+=1
        info=timeline[tindex]
        local=frame_n-info["start_frame"]
        zoom,pan_x,pan_y,rotation=stable_transform(tindex,local)
        M=cv2.getRotationMatrix2D((W/2,H/2),0,zoom)
        M[0,2]+=pan_x;M[1,2]+=pan_y
        image=cv2.warpAffine(raws[tindex],M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
        now=frame_n/FPS
        # The lamp flickers ONLY while the visual actually shows it.
        if info["beat"]==3 and info["source"] in (20,19) and int(now*10)%5==0:
            image=cv2.convertScaleAbs(image,alpha=1.055,beta=4)
        soft_rain(image,now,tindex)
        idx=bisect.bisect_right(timestamps,now)-1
        if idx>=0 and now<cues[idx]["end"]:
            c=cues[idx]
            if c["text"] not in cache:
                if len(cache)>=9:cache.pop(next(iter(cache)))
                cache[c["text"]]=np.asarray(subtitle_overlay(c["text"],W,H),dtype=np.uint8)
            alpha=max(0.,min(1.,(now-c["start"])/.11,(c["end"]-now)/.11))
            shade_caption(image,cache[c["text"]],alpha)
        try:process.stdin.write(image.tobytes())
        except BrokenPipeError:
            err=process.stderr.read().decode(errors="replace")
            raise RuntimeError("FFmpeg failed while rendering V4 "+err[-1800:])
        if frame_n%240==0:print("V4 story-accurate render",frame_n//FPS,"/ 120 seconds; scene",info["beat"]+1,flush=True)
    process.stdin.close()
    stderr=process.stderr.read().decode(errors="replace")
    if process.wait()!=0:raise RuntimeError("Encoder "+stderr[-2000:])
    print("Finished coherent film:",out,out.stat().st_size,flush=True)

if __name__=="__main__":render()
