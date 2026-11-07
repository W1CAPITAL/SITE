"""Dia Zero V3: 96 completely distinct comic frames / 120 sec / zero camera shake.
Cue text is timed directly to approved narrator stems, not to image cuts.
"""
import bisect, io, json, math, subprocess, time
from pathlib import Path

import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont
from story import FPS,SECONDS
from render_video_v2 import download_art as download_original_64, extract_panels_from_image, get_font, OUTPUT, W, H

ROOT=Path(__file__).parent
TOTAL_SECONDS=SECONDS
CUTS=96
CUT_FRAMES=30
assert 96*30==SECONDS*FPS

# Editorial timeline: six shots per 7.5-second spoken line. Panels are ordered
# by what is happening in the narration, never merely by the order of drawings.
CHAPTER_SHOT_ORDER=[
    [("old",0),("new",0),("extra",0),("old",1),("new",1),("new",3),
     ("old",2),("new",2),("extra",1),("extra",2),("old",3),("extra",3)],
    [("old",2),("new",2),("extra",0),("extra",1),("old",3),("new",3),
     ("old",0),("new",0),("extra",2),("old",1),("new",1),("extra",3)],
    [("old",0),("new",0),("extra",0),("new",1),("extra",1),("old",2),
     ("old",1),("new",2),("extra",2),("old",3),("new",3),("extra",3)],
    [("extra",0),("old",0),("new",0),("new",1),("extra",2),("old",1),
     ("extra",1),("old",2),("new",2),("old",3),("new",3),("extra",3)],
    [("old",0),("new",0),("extra",0),("new",2),("old",2),("extra",1),
     ("new",1),("old",1),("extra",2),("old",3),("new",3),("extra",3)],
    [("extra",0),("extra",3),("extra",2),("old",2),("new",2),("extra",1),
     ("old",0),("new",0),("old",1),("new",1),("old",3),("new",3)],
    [("extra",0),("extra",1),("old",1),("old",3),("new",2),("extra",3),
     ("old",0),("new",1),("extra",2),("old",2),("new",0),("new",3)],
    [("old",0),("new",0),("extra",2),("old",2),("extra",0),("new",2),
     ("old",1),("new",1),("extra",1),("old",3),("new",3),("extra",3)],
]

def schedule():
    order=[(source,page,part)
           for page,items in enumerate(CHAPTER_SHOT_ORDER)
           for source,part in items]
    assert len(order)==96 and len(set(order))==96
    return order

def get_camera_transform(cut, time_in_shot):
    # Smooth, stabilized editorial pan; zero shaking / rocking / rotation.
    p=max(0.,min(1.,time_in_shot/(CUT_FRAMES/FPS)))
    eased=p*p*(3.-2.*p)
    zoom=(1.012+.034*eased) if cut%4<2 else (1.052-.032*eased)
    pan_x=(eased-.5)*40.*(1 if cut%2==0 else -1)
    pan_y=(eased-.5)*17.*(1 if cut%3!=2 else -1)
    return (zoom,pan_x,pan_y,0.0)

def download_extra_pages():
    data=json.loads((ROOT/"assets_v3.json").read_text())
    urls=data["sources"]
    assert len(urls)==8
    out=OUTPUT/"extra_v3"
    out.mkdir(parents=True,exist_ok=True)
    pieces=[]
    for i,url in enumerate(urls):
        dest=out/f"page_{i:02d}.jpg"
        for k in range(4):
            try:
                reply=requests.get(url,timeout=110,headers={"User-Agent":"Mozilla/5.0"})
                reply.raise_for_status()
                sheet=Image.open(io.BytesIO(reply.content)).convert("RGB")
                if sheet.width<500 or sheet.height<700:raise ValueError("Incomplete art")
                sheet.save(dest,quality=94)
                break
            except Exception as err:
                if k==3:raise
                print("Retry additional HQ",i,k,repr(err)[:110],flush=True)
                time.sleep((k+1)*4)
        panels=extract_panels_from_image(sheet)
        for j,panel in enumerate(panels):
            w,h=panel.size
            ratio=W/H
            if w/h>ratio:
                nw=int(h*ratio);left=(w-nw)//2
                panel=panel.crop((left,0,left+nw,h))
            else:
                nh=int(w/ratio);top=(h-nh)//2
                panel=panel.crop((0,top,w,top+nh))
            cropped=out/f"extra_{i*4+j:02d}.jpg"
            panel.resize((W,H),Image.Resampling.LANCZOS).save(cropped,quality=91,subsampling=0)
            pieces.append(cropped)
        print("Extra original story page",i+1,"of 8",flush=True)
    return pieces

def all_96():
    originals=download_original_64()
    extra=download_extra_pages()
    assert len(originals)==64 and len(extra)==32
    originals_by_key={}
    for page in range(8):
        for j in range(4):
            idx=page*4+j
            originals_by_key[("old",page,j)]=originals[2*idx]
            originals_by_key[("new",page,j)]=originals[2*idx+1]
            originals_by_key[("extra",page,j)]=extra[idx]
    final=[originals_by_key[key] for key in schedule()]
    assert len(final)==96 and len(set(map(str,final)))==96
    return final

def subtitle_overlay(text,width=W,height=H):
    """Letter-only captions (stroked white glyphs); entirely transparent elsewhere."""
    surface=Image.new("RGBA",(width,height),(0,0,0,0))
    if not text:return surface
    pen=ImageDraw.Draw(surface)
    font=get_font(50)
    maxwidth=width-145
    words=text.split()
    lines=[];line=""
    for word in words:
        test=(line+" "+word).strip()
        if line and pen.textbbox((0,0),test,font=font,stroke_width=3)[2]>maxwidth:
            lines.append(line);line=word
        else:line=test
    if line:lines.append(line)
    # Dialogue lives just above the interface footer, with no opaque box.
    y=height-320-(len(lines)-1)*66
    for phrase in lines:
        bounds=pen.textbbox((0,0),phrase,font=font,stroke_width=3)
        x=int((width-(bounds[2]-bounds[0]))/2)
        pen.text((x,y),phrase,font=font,fill=(250,250,252,245),
                 stroke_width=3,stroke_fill=(7,13,20,235))
        y+=67
    return surface

def blend_overlay(frame,rgba,fade=1.):
    # Avoid blending every pixel of a 1080x1920 overlay.
    top=H-520;bottom=H-155
    ar=np.asarray(rgba)[top:bottom,:,:]
    alpha=(ar[:,:,3:4].astype(np.float32)/255.)*fade
    if np.max(alpha)<.001:return frame
    rgb=ar[:,:,:3][:,:,::-1]
    frame[top:bottom]=(frame[top:bottom]*(1-alpha)+rgb*alpha).astype(np.uint8)
    return frame

def frame_rain(frame,cut,frame_number):
    # Only exterior/rain contexts; stationary camera, descending particle motion.
    t=frame_number/FPS
    if not (59<=t<=104):return frame
    rng=np.random.default_rng(20261107+cut)
    for k in range(24):
        x=int((rng.integers(10,W-20)+11*k)%W)
        y=int((rng.integers(0,H)+round(t*480)+k*147)%H)
        cv2.line(frame,(x,y),(max(0,x-9),min(H-1,y+44)),(159,147,132),1,cv2.LINE_AA)
    return frame

def render():
    OUTPUT.mkdir(parents=True,exist_ok=True)
    paths=all_96()
    sources=[cv2.imread(str(p)) for p in paths]
    if any(x is None or x.shape[:2]!=(H,W) for x in sources):
        raise RuntimeError("Invalid source panel")
    cues=json.loads((OUTPUT/"captions_v3.json").read_text())["cues"]
    cue_starts=[float(c["start"]) for c in cues]
    overlays={}
    def layer_for(text):
        if text not in overlays:
            if len(overlays)>=12:
                # Bound VRAM/CPU memory, and subtitle surfaces can be re-created cheaply.
                overlays.pop(next(iter(overlays)))
            overlays[text]=subtitle_overlay(text)
        return overlays[text]
    dest=OUTPUT/"dia_zero_v3_96_shots_silent.mp4"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","rawvideo","-pixel_format","bgr24","-video_size",f"{W}x{H}",
         "-framerate",str(FPS),"-i","pipe:0","-an","-c:v","libx264",
         "-pix_fmt","yuv420p","-profile:v","high","-level:v","4.2",
         "-preset","veryfast","-crf","21","-movflags","+faststart",str(dest)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for f in range(TOTAL_SECONDS*FPS):
        cut=f//CUT_FRAMES
        local=(f%CUT_FRAMES)/FPS
        zoom,pan_x,pan_y,rotate=get_camera_transform(cut,local)
        M=cv2.getRotationMatrix2D((W/2,H/2),rotate,zoom)
        M[0,2]+=pan_x;M[1,2]+=pan_y
        shot=cv2.warpAffine(sources[cut],M,(W,H),flags=cv2.INTER_LINEAR,
                           borderMode=cv2.BORDER_REFLECT_101)
        frame_rain(shot,cut,f)
        absolute_time=f/FPS
        cue_index=bisect.bisect_right(cue_starts,absolute_time)-1
        if cue_index>=0 and absolute_time<cues[cue_index]["end"]:
            cue=cues[cue_index]
            fade=min(1.,(absolute_time-cue["start"])/.10,(cue["end"]-absolute_time)/.12)
            blend_overlay(shot,layer_for(cue["text"]),max(0.,fade))
        try:proc.stdin.write(shot.tobytes())
        except BrokenPipeError:
            detail=proc.stderr.read().decode(errors="replace")
            raise RuntimeError("Failed video encode: "+detail[-1800:])
        if f%240==0:print("V3 visually rendered",f//FPS,"of",TOTAL_SECONDS,"seconds",flush=True)
    proc.stdin.close()
    stderr=proc.stderr.read().decode(errors="replace")
    if proc.wait():raise RuntimeError("ffmpeg failed "+stderr[-1800:])
    print("Video output",dest,dest.stat().st_size,flush=True)

if __name__=="__main__":render()
