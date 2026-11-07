"""Original 2-minute comic motion video. Creates 32 moving panel shots, not reused video footage."""
import io, json, math, os, subprocess, time
from pathlib import Path
import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont
from story import FPS,SECONDS,SCENE_DURATION,CAPTIONS,TIMECODE

ROOT=Path(__file__).parent
OUTPUT=ROOT/"output"
W,H=1080,1920

def extract_panels_from_image(im,margin=.008):
    im=im.convert("RGB")
    w,h=im.size
    result=[]
    for i in range(4):
        x=(i%2)*(w//2); y=(i//2)*(h//2)
        cw=w//2; ch=h//2
        dx=int(cw*margin);dy=int(ch*margin)
        result.append(im.crop((x+dx,y+dy,x+cw-dx,y+ch-dy)))
    return result

def get_font(size,bold=True):
    names=("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
           "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf")
    for n in names:
        if os.path.exists(n): return ImageFont.truetype(n,size)
    return ImageFont.load_default()

def get_sheet(url, dest):
    for attempt in range(4):
        try:
            r=requests.get(url,timeout=110,headers={"User-Agent":"Mozilla/5.0"})
            r.raise_for_status()
            im=Image.open(io.BytesIO(r.content)).convert("RGB")
            if im.width<500 or im.height<700: raise ValueError("Artwork too small")
            im.save(dest,quality=95)
            print("Downloaded",dest.name,im.size,flush=True)
            return im
        except Exception as exc:
            print("download retry",dest,attempt,str(exc)[:200],flush=True)
            time.sleep(3*(attempt+1))
    raise RuntimeError("Unable to download "+str(dest))

def download_art():
    manifest=json.loads((ROOT/"assets.json").read_text())
    sources=manifest["sources"]
    assert len(sources)==8, "need eight independent four-panel comic sheets"
    sheet_dir=OUTPUT/"sheets";sheet_dir.mkdir(parents=True,exist_ok=True)
    shot_dir=OUTPUT/"panels";shot_dir.mkdir(parents=True,exist_ok=True)
    paths=[]
    for n,url in enumerate(sources):
        im=get_sheet(url,sheet_dir/f"sheet_{n:02d}.jpg")
        for j,panel in enumerate(extract_panels_from_image(im)):
            k=n*4+j
            # Cover crop into native vertical aspect.
            pw,ph=panel.size
            aspect=W/H
            if pw/ph>aspect:
                target=int(ph*aspect);left=(pw-target)//2
                panel=panel.crop((left,0,left+target,ph))
            else:
                target=int(pw/aspect);top=(ph-target)//2
                panel=panel.crop((0,top,pw,top+target))
            p=shot_dir/f"panel_{k:02d}.jpg"
            panel.resize((W,H),Image.Resampling.LANCZOS).save(p,quality=94,subsampling=0)
            paths.append(p)
    assert len(paths)==32
    return paths

def caption_layer(i):
    # Composed independently from illustrations so image text never garbles Portuguese.
    text=CAPTIONS[i]
    rgba=Image.new("RGBA",(W,H),(0,0,0,0))
    dr=ImageDraw.Draw(rgba)
    top_font=get_font(30)
    cap_font=get_font(53)
    headline="DIA ZERO  |  "+TIMECODE[i]
    dr.rounded_rectangle((58,90,495,157),radius=19,fill=(5,10,23,183))
    dr.text((86,106),headline,font=top_font,fill=(245,245,245,255))
    # no text is placed over subject faces; bottom safe area.
    y=1460
    words=text.split()
    lines=[]; line=""
    for word in words:
        probe=(line+" "+word).strip()
        if dr.textbbox((0,0),probe,font=cap_font)[2]>W-150 and line:
            lines.append(line);line=word
        else:line=probe
    if line:lines.append(line)
    h=80+len(lines)*78
    dr.rounded_rectangle((45,y,W-45,y+h),radius=23,fill=(0,0,0,198),outline=(130,158,178,100),width=2)
    for j,part in enumerate(lines):
        dr.text((78,y+37+j*76),part,font=cap_font,fill=(251,252,253,255),stroke_width=1,stroke_fill=(0,0,0,255))
    if i==31:
        font=get_font(102)
        dr.rounded_rectangle((72,495,W-72,690),radius=18,fill=(0,0,0,200))
        dr.text((104,520),"DIA ZERO",font=font,fill=(245,245,245,255),stroke_width=2,stroke_fill=(65,0,0,255))
    a=np.asarray(rgba) # RGBA
    bgr=np.ascontiguousarray(a[:,:,:3][:,:,::-1])
    alpha=a[:,:,3].astype(np.float32)/255.0
    return bgr,alpha

def overlay_ink(frame, overlay, opacity):
    color,alpha=overlay
    if opacity<=.01:return frame
    # Limit blends to on-screen caption regions.
    for y0,y1 in [(85,710),(1455,1740)]:
        a=alpha[y0:y1,:]*opacity
        if a.max()<.01:continue
        roi=frame[y0:y1,:,:]
        src=color[y0:y1,:,:]
        aa=a[:,:,None]
        # clip prevents oversaturation
        roi[:]=(roi*(1-aa)+src*aa).astype(np.uint8)
    return frame

def render():
    OUTPUT.mkdir(exist_ok=True)
    scenes=download_art()
    videos=[cv2.imread(str(p),cv2.IMREAD_COLOR) for p in scenes]
    for i,frame in enumerate(videos):
        if frame is None or frame.shape[:2]!=(H,W):raise RuntimeError("Invalid panel "+str(i))
    layers=[caption_layer(i) for i in range(32)]
    cmd=["ffmpeg","-y","-hide_banner","-loglevel","error",
        "-f","rawvideo","-pixel_format","bgr24","-video_size",f"{W}x{H}","-framerate",str(FPS),"-i","pipe:0",
        "-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","21",
        "-profile:v","high","-level:v","4.2","-movflags","+faststart",
        str(OUTPUT/"dia_zero_video_silent.mp4")]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    total=int(SECONDS*FPS)
    for f in range(total):
        i=min(31,int(f/(SCENE_DURATION*FPS)))
        local=f-i*SCENE_DURATION*FPS
        progress=local/(SCENE_DURATION*FPS)
        # Camera action changes with beats, timed to narrative.
        eased=progress*progress*(3-2*progress)
        push=1.035+.082*eased if i%2==0 else 1.128-.075*eased
        rotation=.38*math.sin(progress*math.pi*1.5+i*1.3) if i>=13 else .14*math.sin(progress*math.pi*1.8)
        shake=(1.7 if i<10 else (4.8 if i<24 else 2.1))
        jitter_x=shake*math.sin(local*1.91+i)
        jitter_y=shake*.55*math.sin(local*1.23+i*.7)
        pan=22*math.sin(eased*math.pi/2+i*.77)
        M=cv2.getRotationMatrix2D((W/2,H/2),rotation,push)
        M[0,2]+=(eased-.5)*pan+jitter_x
        M[1,2]+=(eased-.5)*15+jitter_y
        frame=cv2.warpAffine(videos[i],M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
        # True changing frames: foreground particles + independent red-blue light pulses.
        if 8<=i<=27:
            rain=np.zeros_like(frame,dtype=np.uint8)
            rng=np.random.default_rng(231+i*900+int(f//3))
            for k in range(40):
                x=int(rng.integers(0,W))
                y=int((rng.integers(0,H)+f*(17+(i%4)*2)+k*211)%H)
                sl=int(rng.integers(24,75))
                cv2.line(rain,(x,y),(max(0,x-10),min(H-1,y+sl)),(210,182,160),1,cv2.LINE_AA)
            frame=cv2.addWeighted(frame,.89,rain,.36,0)
        if i in [6,7,12,13,14,15,16,17]:
            if (f//7)%4==0:frame=cv2.convertScaleAbs(frame,alpha=1.09,beta=10)
        if i in [9,10,11,16,17,18,19,20,21,22,23,24] and (f//10)%3==0:
            # Emergency lights pass in reflection; not blinding.
            tint=np.zeros_like(frame);cv2.rectangle(tint,(0,0),(W,H),(12,14,58),-1)
            frame=cv2.addWeighted(frame,.93,tint,.07,0)
        # Rapid punch-in transition over first two frames without repeated shots.
        if local<2:
            frame=cv2.convertScaleAbs(frame,alpha=1.04,beta=12)
        opacity=min(1.0,max(0.0,local/7),max(0.0,(SCENE_DURATION*FPS-local)/6))
        frame=overlay_ink(frame,layers[i],opacity)
        if f==0 or f==total-1:frame=cv2.addWeighted(frame,.85,np.zeros_like(frame),.15,0)
        try:p.stdin.write(frame.tobytes())
        except BrokenPipeError:
            err=p.stderr.read().decode(errors="replace")
            raise RuntimeError("Video encoder failed: "+err)
        if f%240==0:print(f"Encoding {f//FPS:>3}s / 120s",flush=True)
    p.stdin.close()
    err=p.stderr.read().decode(errors="replace")
    code=p.wait()
    if code!=0:raise RuntimeError("ffmpeg "+err[-2000:])
    print("Video generated",OUTPUT/"dia_zero_video_silent.mp4",flush=True)

if __name__=="__main__":render()
