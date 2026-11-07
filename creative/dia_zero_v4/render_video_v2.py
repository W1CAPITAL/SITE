"""Dia Zero V2 — 64 different HQ cuts, 1.875 s each, lightweight transparent captions.
Retains original artwork and adds 32 supplementary drawings, no reused cut.
"""
import io, json, math, os, subprocess, time
from pathlib import Path
import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from story import FPS, SECONDS, CAPTIONS, TIMECODE

ROOT=Path(__file__).parent
OUTPUT=ROOT/"output"
W,H=1080,1920
SHOTS=64
CUT_DURATION=SECONDS/SHOTS

def shot_schedule():
    return [item
        for page in range(8)
        for panel in range(4)
        for item in (("old",page,panel),("new",page,panel))]

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

def get_font(size, bold=True):
    names=("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
           "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf")
    for name in names:
        if os.path.exists(name):return ImageFont.truetype(name,size)
    return ImageFont.load_default()

def download_one(url,path):
    for attempt in range(4):
        try:
            resp=requests.get(url,timeout=105,headers={"User-Agent":"Mozilla/5.0"})
            resp.raise_for_status()
            image=Image.open(io.BytesIO(resp.content)).convert("RGB")
            if image.width<500 or image.height<700:
                raise ValueError("Sheet resolution low")
            image.save(path,quality=92)
            return image
        except Exception as exc:
            print("retry artwork",path.name,attempt,str(exc)[:160],flush=True)
            time.sleep(3*(attempt+1))
    raise RuntimeError("Could not download comic art "+path.name)

def download_art():
    old=json.loads((ROOT/"assets.json").read_text())["sources"]
    new=json.loads((ROOT/"assets_v2.json").read_text())["sources"]
    if len(old)!=8 or len(new)!=8:
        raise ValueError("Need eight four-frame pages of each type")
    sheets={}
    (OUTPUT/"sheets").mkdir(parents=True,exist_ok=True)
    (OUTPUT/"panels_v2").mkdir(parents=True,exist_ok=True)
    for typ,urls in (("old",old),("new",new)):
        for i,url in enumerate(urls):
            sheet=download_one(url,OUTPUT/"sheets"/f"{typ}_{i:02d}.jpg")
            sheets[(typ,i)]=extract_panels_from_image(sheet)
            print("Original artwork retrieved",typ,i+1,flush=True)
    paths=[]
    for k,(typ,i,j) in enumerate(shot_schedule()):
        panel=sheets[(typ,i)][j]
        pw,ph=panel.size
        aspect=W/H
        if pw/ph>aspect:
            target=round(ph*aspect);left=(pw-target)//2
            panel=panel.crop((left,0,left+target,ph))
        else:
            target=round(pw/aspect);top=(ph-target)//2
            panel=panel.crop((0,top,pw,top+target))
        dest=OUTPUT/"panels_v2"/f"shot_{k:02d}.jpg"
        panel.resize((W,H),Image.Resampling.LANCZOS).save(dest,quality=91,subsampling=0)
        paths.append(dest)
    assert len(paths)==64
    return paths

def caption_layer(cut):
    """Small text directly over artwork, with stroked letters, no opaque boxes."""
    text=CAPTIONS[cut//2]
    rgba=Image.new("RGBA",(W,H),(0,0,0,0))
    dr=ImageDraw.Draw(rgba)
    small=get_font(27,True)
    font=get_font(46,True)
    top=f"DIA ZERO  ·  {TIMECODE[cut//2]}"
    dr.text((78,74),top,font=small,fill=(246,246,249,220),
            stroke_width=2,stroke_fill=(0,0,0,170))
    words=text.split()
    lines=[];line=""
    for word in words:
        maybe=(line+" "+word).strip()
        if line and dr.textbbox((0,0),maybe,font=font)[2]>W-180:
            lines.append(line);line=word
        else:line=maybe
    if line:lines.append(line)
    y=1655-(len(lines)-1)*44
    for j,s in enumerate(lines):
        # Stroke is limited to glyph bounds, leaving background visible.
        dr.text((94,y+j*62),s,font=font,fill=(255,255,255,236),
                stroke_width=4,stroke_fill=(0,0,0,235))
    if cut==63:
        big=get_font(95,True)
        dr.text((113,600),"DIA ZERO",font=big,fill=(255,255,255,245),
                stroke_width=8,stroke_fill=(9,9,16,245))
    return rgba

def overlay_type(frame,layer,alpha_mul):
    if alpha_mul<=.01:return frame
    color,alpha=layer
    for y0,y1 in [(65,160),(1600,1810),(575,765)]:
        a=alpha[y0:y1,:]*alpha_mul
        if np.max(a)<.01:continue
        roi=frame[y0:y1,:,:]
        aa=a[:,:,None]
        roi[:]=(roi*(1.0-aa)+color[y0:y1,:,:]*aa).astype(np.uint8)
    return frame

def render():
    OUTPUT.mkdir(exist_ok=True)
    sources=download_art()
    images=[]
    for i,path in enumerate(sources):
        im=cv2.imread(str(path))
        if im is None or im.shape[:2]!=(H,W):
            raise ValueError(f"Invalid storyboard panel {i}")
        images.append(im)
    # Cache only unique subtitle pairs, cut=63 has distinct end title.
    layers={}
    for i in range(0,64,2):
        img=np.asarray(caption_layer(i))
        layers[i]=(np.ascontiguousarray(img[:,:,:3][:,:,::-1]),img[:,:,3].astype(np.float32)/255)
    img=np.asarray(caption_layer(63))
    layers[63]=(np.ascontiguousarray(img[:,:,:3][:,:,::-1]),img[:,:,3].astype(np.float32)/255)
    cutframes=round(FPS*CUT_DURATION)
    assert cutframes==45 and cutframes*64==SECONDS*FPS
    out=OUTPUT/"dia_zero_v2_silent.mp4"
    command=["ffmpeg","-y","-hide_banner","-loglevel","error",
        "-f","rawvideo","-pixel_format","bgr24","-video_size",f"{W}x{H}",
        "-framerate",str(FPS),"-i","pipe:0",
        "-an","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast",
        "-crf","21","-profile:v","high","-level:v","4.2",
        "-movflags","+faststart",str(out)]
    process=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for frame_number in range(SECONDS*FPS):
        cut=frame_number//cutframes
        local=frame_number%cutframes
        phase=local/cutframes
        smooth=phase*phase*(3-2*phase)
        # Camera speed is fast and purposeful, not slow-motion.
        zoom=(1.03+.105*smooth) if cut%3!=1 else (1.135-.092*smooth)
        shift=64*(smooth-.5)
        pan_x=shift if cut%2==0 else -shift
        pan_y=19*math.sin(phase*math.pi+cut*.41)
        # Larger hand-held motion for chase only.
        shake=1.0 if cut<18 else (3.1 if cut<48 else 1.8)
        pan_x+=shake*math.sin(local*1.71+cut*.9)
        pan_y+=shake*math.sin(local*1.22+cut*.6)
        angle=.18*math.sin(phase*math.pi+cut*.5)
        matrix=cv2.getRotationMatrix2D((W/2,H/2),angle,zoom)
        matrix[0,2]+=pan_x
        matrix[1,2]+=pan_y
        frame=cv2.warpAffine(images[cut],matrix,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
        # Environmental movement is anchored to weather visible in outdoor shots.
        if 24<=cut<=56:
            rng=np.random.default_rng(cut*10000+frame_number//2)
            for _ in range(34):
                x=int(rng.integers(1,W-1))
                y=int(rng.integers(1,H-62))
                dx=int(rng.integers(4,11));dy=int(rng.integers(24,65))
                cv2.line(frame,(x,y),(x-dx,y+dy),(183,162,142),1,cv2.LINE_AA)
        if cut in {10,11,13,14,15,46,47} and (local//6)%4==0:
            frame=cv2.convertScaleAbs(frame,alpha=1.08,beta=5)
        if 33<=cut<=49 and (local//8)%4==0:
            frame=cv2.addWeighted(frame,.95,np.full_like(frame,(15,18,70)),.05,0)
        # Avoid a solid caption background: just stroked letters.
        layer=layers[63] if cut==63 else layers[cut-(cut%2)]
        opacity=min(1.0,local/4,(cutframes-local)/4)
        frame=overlay_type(frame,layer,opacity)
        try:
            process.stdin.write(frame.tobytes())
        except BrokenPipeError:
            err=process.stderr.read().decode(errors="replace")
            raise RuntimeError("Encoder failed "+err[-3000:])
        if frame_number%240==0:
            print("V2 progress",frame_number//FPS,"/",SECONDS,"seconds",flush=True)
    process.stdin.close()
    err=process.stderr.read().decode(errors="replace")
    if process.wait()!=0:raise RuntimeError("ffmpeg "+err[-2000:])
    print("Wrote",out,out.stat().st_size,"bytes",flush=True)

if __name__=="__main__":render()
