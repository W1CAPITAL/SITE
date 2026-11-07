"""Dia Zero V5: edit the original 2-minute film as one coherent 59-shot graphic novel.
No random scene order, no footage reuse, no camera shake or rotation. New drawings
are devoted to continuous geography, and dialogue-only captions are timecoded.
"""
import bisect,io,json,math,subprocess,time
from pathlib import Path
import cv2,numpy as np,requests
from PIL import Image,ImageDraw,ImageFont
from edit_plan_v5 import shots,FPS,TOTAL_FRAMES,SCENES
from render_video_v3 import all_96,subtitle_overlay,extract_panels_from_image,W,H,OUTPUT
from render_v4 import normalize_cues
cleaned_cues=normalize_cues

ROOT=Path(__file__).parent
TOTAL_SECONDS=120
V5_EXTRA=ROOT/"assets_v5.json"

def camera_transform(shot_idx,t,seconds):
    """Editorial camera holds with no sway, no shake, no rotation."""
    u=max(0.,min(1.,t/max(seconds,.1)))
    smooth=u*u*(3.-2.*u)
    z=(1.022+.021*smooth) if shot_idx%2 else (1.044-.018*smooth)
    dx=18.*(smooth-.5)*(-1 if shot_idx%4==0 else 1)
    dy=8.*(smooth-.5)*(-1 if shot_idx%3 else 1)
    return z,dx,dy,0.

def download_new():
    sources=json.loads(V5_EXTRA.read_text())["sources"]
    if len(sources)!=4:raise ValueError("Need four new four-panel bridge scenes")
    directory=OUTPUT/"v5_bridge"
    directory.mkdir(parents=True,exist_ok=True)
    urls={}
    for p,url in enumerate(sources):
        for attempt in range(4):
            try:
                resp=requests.get(url,headers={"User-Agent":"Mozilla/5.0"},timeout=100)
                resp.raise_for_status()
                sheet=Image.open(io.BytesIO(resp.content)).convert("RGB")
                if sheet.width<500 or sheet.height<800:raise ValueError("Artwork incomplete")
                sheet.save(directory/f"v5_page_{p}.jpg",quality=95)
                break
            except Exception as exc:
                print("Retry bridge page",p,attempt,repr(exc)[:140],flush=True)
                if attempt==3:raise
                time.sleep(3*(attempt+1))
        panel_width,panel_height=sheet.width/2,sheet.height/2
        print("New sequential comic page",p+1,":",sheet.size,flush=True)
        for j,im in enumerate(extract_panels_from_image(sheet,margin=.002)):
            pw,ph=im.size
            if pw/ph>W/H:
                new_width=round(ph*W/H);offset=(pw-new_width)//2
                im=im.crop((offset,0,offset+new_width,ph))
            else:
                new_height=round(pw*H/W);offset=(ph-new_height)//2
                im=im.crop((0,offset,pw,offset+new_height))
            file=directory/f"v5_insert_{p*4+j:02d}.jpg"
            im.resize((W,H),Image.Resampling.LANCZOS).save(file,quality=93)
            urls[("new",p*4+j)]=file
    return urls

def prepare_art():
    all_old=all_96()
    if len(all_old)!=96:raise RuntimeError("Missing original 96 clean images")
    bridge=download_new()
    selection=shots()
    images=[]
    for item in selection:
        src=all_old[item["asset"][1]] if item["asset"][0]=="orig" else bridge[item["asset"]]
        im=cv2.imread(str(src),cv2.IMREAD_COLOR)
        if im is None or im.shape[:2]!=(H,W):raise RuntimeError("Bad frame "+str(src))
        images.append(im)
    return selection,images

def draw_contact(plan,images):
    cols=6;rows=math.ceil(len(plan)/cols)
    w,h=152,302
    out=Image.new("RGB",(cols*w,rows*h),(12,15,21))
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",13)
    for idx,(shot,src) in enumerate(zip(plan,images)):
        rgb=cv2.cvtColor(src,cv2.COLOR_BGR2RGB)
        th=Image.fromarray(cv2.resize(rgb,(w,270)))
        x=(idx%cols)*w;y=(idx//cols)*h
        out.paste(th,(x,y+28))
        d=ImageDraw.Draw(out)
        d.text((x+6,y+5),f"{idx:02d} | {shot['beat']+1:02d} | {shot['asset']}",font=font,fill=(234,238,247))
    out.save(OUTPUT/"dia_zero_v5_storyboard_contact.jpg",quality=91)
    print("Contact sheet:",OUTPUT/"dia_zero_v5_storyboard_contact.jpg",flush=True)

def transparency_caption(frame,layer,fade):
    top,bottom=H-530,H-145
    a=layer[top:bottom,:,3].astype(np.float32)/255.*max(0.,fade)
    if float(np.max(a))<.01:return frame
    src=layer[top:bottom,:,:3][:,:,::-1]
    roi=frame[top:bottom]
    roi[:]=(roi*(1-a[:,:,None])+src*a[:,:,None]).astype(np.uint8)
    return frame

def localized_motion(frame,shot,local,seconds):
    """Motion belongs to visible events: never generic camera shake."""
    beat,pos=shot["beat"],shot["pos"]
    progress=max(0.,min(1.,local/seconds))
    if beat==3 and pos==0:
        # Office ceiling bulbs fail at the same point they audibly crackle.
        if (.1<progress<.35) or (.53<progress<.64):
            frame=cv2.convertScaleAbs(frame,alpha=.79,beta=-7)
    elif beat==3 and pos==1:
        # Scattered glass: brief light flashes around broken fluorescent tube.
        if progress<.32:frame=cv2.convertScaleAbs(frame,alpha=1.08,beta=8)
        count=11
        for k in range(count):
            x=int(W*.15+((k*79+local*220)%int(W*.7)))
            y=int(H*.10+progress*H*.19+(k%4)*25)
            cv2.line(frame,(x,y),(min(W-1,x+9),min(H-1,y+17)),(203,217,235),1,cv2.LINE_AA)
    elif beat==3 and pos==2:
        # Papers fly only on the shot that actually shows them.
        for k in range(7):
            x=int((k*223+local*87)%W)
            y=int(((k*373+local*160)%int(H*.65)))
            pts=np.array([[x,y],[x+14,y+5],[x+8,y+17],[x-4,y+13]],np.int32)
            cv2.fillConvexPoly(frame,pts,(185,205,213),cv2.LINE_AA)
    elif (beat,pos) in ((4,3),(5,1),(5,2),(9,0),(9,3)):
        # Small concentric rings only when a visible body/wheel disturbs a flooded road.
        cx=int(W*(.51+.12*math.sin(shot["start"]*.1)))
        cy=int(H*.80)
        for k in range(2):
            rad=int(10+((local*.8+k*.4)%1)*48)
            cv2.ellipse(frame,(cx,cy),(rad,max(3,rad//4)),0,0,360,(162,151,139),1,cv2.LINE_AA)
    elif beat==8 and pos==2:
        # The fire flickers on the frame containing the overturned burning van.
        glow=.02+.025*math.sin(local*13.1)**2
        warm=np.zeros_like(frame);warm[:]=[15,72,165]
        frame=cv2.addWeighted(frame,1-glow,warm,glow,0)
    elif beat==11 and pos in (1,2):
        # Moving searchlight at the same moment as helicopter audio.
        o=np.zeros_like(frame)
        cx=int((.25+.4*progress)*W)
        cv2.ellipse(o,(cx,int(H*.60)),(int(W*.13),int(H*.20)),0,0,360,(188,188,207),-1)
        frame=cv2.addWeighted(frame,.97,cv2.GaussianBlur(o,(0,0),85),.03,0)
    return frame

def render():
    OUTPUT.mkdir(parents=True,exist_ok=True)
    timeline,images=prepare_art()
    draw_contact(timeline,images)
    cues=normalize_cues(json.loads((OUTPUT/"captions_v3.json").read_text())["cues"])
    cues=[c for c in cues if c.get("text")]
    start_times=[float(c["start"]) for c in cues]
    (OUTPUT/"v5_visual_manifest.json").write_text(json.dumps(timeline,indent=2,ensure_ascii=False))
    (OUTPUT/"v5_captions.json").write_text(json.dumps(cues,indent=2,ensure_ascii=False))
    layer_cache={}
    out=OUTPUT/"dia_zero_v5_1080p_silent.mp4"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","rawvideo","-pixel_format","bgr24","-video_size",f"{W}x{H}",
         "-framerate",str(FPS),"-i","pipe:0","-an",
         "-c:v","libx264","-profile:v","high","-level:v","4.2",
         "-pix_fmt","yuv420p","-preset","veryfast","-crf","21",
         "-movflags","+faststart",str(out)]
    writer=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    shot_index=0
    for f in range(TOTAL_FRAMES):
        while shot_index+1<len(timeline) and f>=timeline[shot_index]["end_frame"]:
            shot_index+=1
        shot=timeline[shot_index]
        time_here=(f-shot["start_frame"])/FPS
        duration=(shot["end_frame"]-shot["start_frame"])/FPS
        scale,x,y,angle=camera_transform(shot_index,time_here,duration)
        M=cv2.getRotationMatrix2D((W/2,H/2),0,scale)
        M[0,2]+=x;M[1,2]+=y
        frame=cv2.warpAffine(images[shot_index],M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
        frame=localized_motion(frame,shot,time_here,duration)
        now=f/FPS
        j=bisect.bisect_right(start_times,now)-1
        if j>=0 and now<float(cues[j]["end"]):
            cue=cues[j]
            text=cue["text"]
            if text not in layer_cache:
                if len(layer_cache)>12:layer_cache.pop(next(iter(layer_cache)))
                layer_cache[text]=np.asarray(subtitle_overlay(text,W,H),dtype=np.uint8)
            fade=min(1.,(now-float(cue["start"]))/.105,(float(cue["end"])-now)/.12)
            transparency_caption(frame,layer_cache[text],fade)
        try:writer.stdin.write(frame.tobytes())
        except BrokenPipeError:
            err=writer.stderr.read().decode(errors="replace")
            raise RuntimeError("Video encoder interrupted "+err[-2200:])
        if f%240==0:print("V5 sequential frame",f,"/",TOTAL_FRAMES,"(sec",f//FPS,")",flush=True)
    writer.stdin.close()
    error=writer.stderr.read().decode(errors="replace")
    if writer.wait()!=0:raise RuntimeError(error[-2400:])
    print("RENDERED FINAL SILENT HQ",out,out.stat().st_size,flush=True)

if __name__=="__main__":render()
