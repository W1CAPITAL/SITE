"""Dia Zero V7: real drawable object/person movement, not a moving-camera filter.

Twelve sequences of four AI-drawn successive poses are converted to animated
in-between frames by bidirectional dense optical flow.  The other shots receive
per-object, world-anchored procedural animation (rain drops, water splashes,
smoke plumes, flame tongues, alarm lamps, electrical sparks, lit phone screens
and moving car lights).  No image-wide camera translation is used here.
"""
from __future__ import annotations
import math, json, io, time
from pathlib import Path
import numpy as np
import cv2
import requests
from PIL import Image

BASE=Path(__file__).parent
FPS=24
W,H=720,1280
REQUIRED_POSE_KINDS=(
 "office","phone","electric","crash","zombie","people",
 "fire","stairs","clouds","helicopter","door","end",
)
POSE_MAP={
 (0,0):"office",(1,0):"phone",(3,1):"electric",(4,2):"crash",
 (5,2):"zombie",(9,1):"people",(8,2):"fire",(7,2):"stairs",
 (13,2):"clouds",(11,1):"helicopter",(14,2):"door",(15,3):"end",
}
POSETIME={
 "office":(0.,.23,.64,1.),"phone":(0.,.11,.38,1.),
 "electric":(0.,.17,.36,1.),"crash":(0.,.10,.26,1.),
 "zombie":(0.,.17,.34,1.),"people":(0.,.31,.65,1.),
 "fire":(0.,.22,.57,1.),"stairs":(0.,.25,.62,1.),
 "clouds":(0.,.28,.69,1.),"helicopter":(0.,.21,.57,1.),
 "door":(0.,.18,.48,1.),"end":(0.,.29,.69,1.)
}

def scene_motion_types(shot):
    types=["scene_environment"]
    if (shot["beat"],shot["pos"]) in POSE_MAP:types.append("pose_sequence")
    acts=shot.get("visible",())
    for act in acts:
        if act in ("fire","crash","boom"):types.append("flames_smoke")
        if act in ("splash","wetsteps","rain_enter"):types.append("moving_water")
        if act in ("phone","alert","tv","static"):types.append("animated_screen")
        if act in ("electric","glass","papers","alarm"):types.append("breakage_lighting")
        if act in ("footsteps","stairs","zombie","crowd","helicopter"):types.append("people_or_machine")
    if len(types)==1:types.append("local_ambient")
    return tuple(sorted(set(types)))

def _gray(im):
    return cv2.cvtColor(im,cv2.COLOR_BGR2GRAY) if im.ndim==3 else im

def compute_flow(A,B):
    """Optical flow between actual different physical poses.
    Calculate at 1/3 size for fast 720p synthesis, then scale vectors.
    """
    h,w=A.shape[:2]
    short=max(1,int(min(300,max(h,w)*.42)))
    scale=min(1.,short/max(w,h))
    ww=max(28,int(round(w*scale)));hh=max(28,int(round(h*scale)))
    ga=cv2.resize(_gray(A),(ww,hh),interpolation=cv2.INTER_AREA)
    gb=cv2.resize(_gray(B),(ww,hh),interpolation=cv2.INTER_AREA)
    fw=cv2.calcOpticalFlowFarneback(ga,gb,None,.5,4,21,4,5,1.3,0)
    bw=cv2.calcOpticalFlowFarneback(gb,ga,None,.5,4,21,4,5,1.3,0)
    def big(flow):
        x=cv2.resize(flow,(w,h),interpolation=cv2.INTER_LINEAR)
        x[:,:,0]*=w/ww;x[:,:,1]*=h/hh
        return np.clip(x,-max(26,w*.13),max(26,h*.11)).astype(np.float32)
    return big(fw),big(bw)

def pose_interpolate(A,B,t,flow_ab=None,flow_ba=None):
    """Blend corresponding real body/object poses by forward and backward warping.
    Use a differential motion region; static background remains locked.
    """
    if t<=.001:return A.copy()
    if t>=.999:return B.copy()
    if A.shape!=B.shape:raise ValueError("Pose frame sizes differ")
    if flow_ab is None or flow_ba is None:flow_ab,flow_ba=compute_flow(A,B)
    h,w=A.shape[:2]
    x,y=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
    wa=cv2.remap(A,x-flow_ab[:,:,0]*t,y-flow_ab[:,:,1]*t,
                 cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT101)
    wb=cv2.remap(B,x-flow_ba[:,:,0]*(1-t),y-flow_ba[:,:,1]*(1-t),
                 cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT101)
    interp=cv2.addWeighted(wa,1-t,wb,t,0)
    diff=cv2.absdiff(A,B)
    mask=cv2.cvtColor(diff,cv2.COLOR_BGR2GRAY)
    _,mask=cv2.threshold(mask,16,255,cv2.THRESH_BINARY)
    kr=max(3,(min(w,h)//72)|1)
    mask=cv2.dilate(mask,np.ones((kr,kr),np.uint8))
    mask=cv2.GaussianBlur(mask,(0,0),max(2,w/180)).astype(np.float32)/255.
    # Preserve stationary architecture even if the image generator repaints it slightly.
    return (interp.astype(np.float32)*mask[:,:,None]+
            A.astype(np.float32)*(1-mask[:,:,None])).clip(0,255).astype(np.uint8)

def _draw_alpha(img,overlay,opacity):
    cv2.addWeighted(img,1-opacity,overlay,opacity,0,dst=img)

def _rain(img,shot,sec):
    h,w=img.shape[:2]
    scene=shot["location"]
    if scene not in ("street","metro") and not (scene=="office" and shot["beat"]<=5):
        return
    n=(75 if scene=="street" else 39) if h>=600 else 25
    seed=1337+shot["beat"]*100+shot["pos"]*29
    r=np.random.default_rng(seed)
    x=r.uniform(0,w,n)
    initial_y=r.uniform(0,h,n)
    speed=r.uniform(h*.64,h*1.4,n)
    drift=r.uniform(-w*.08,-w*.018,n)
    lens=(8 if scene=="office" else 17)*h/1280
    for i in range(n):
        px=int((x[i]+sec*drift[i])%w)
        py=int((initial_y[i]+sec*speed[i])%h)
        l=max(4,int(lens*(.6+(i%5)*.14)))
        # Rain is an animated foreground particle; paths move frame to frame.
        cv2.line(img,(px,py),(max(0,px-int(l*.38)),min(h-1,py+l)),
                 (161,157,146) if scene!="office" else (100,102,111),
                 max(1,int(h/1000)),cv2.LINE_AA)

def _fire(img,shot,sec):
    h,w=img.shape[:2]
    # Object flame tongues move and bend, separate from original painting.
    cx=int(w*(.66 if shot["beat"] in (8,9) else .60))
    cy=int(h*(.69 if shot["beat"]==8 else .58))
    size=max(15,int(min(w,h)*.10))
    layer=np.zeros_like(img)
    for n in range(11):
        phase=n*1.57+sec*8.2
        drift=math.sin(phase)*size*.35
        x=cx+int((n-5)*size*.14+drift)
        tall=int(size*(.45+abs(math.sin(phase*.7))*1.25))
        ww=max(2,int(size*.08))
        pts=np.array([[x-ww,cy],[x+ww,cy],
                      [x+int(drift*.1),max(0,cy-tall)],
                      [x-int(ww*.45),cy-int(tall*.48)]],np.int32)
        cv2.fillConvexPoly(layer,pts,(14,112+int(40*abs(math.sin(phase))),230),cv2.LINE_AA)
    _draw_alpha(img,layer,.41)
    # Cinders rise and drift independent of flames.
    for k in range(12):
        xx=int(cx+(k-6)*size*.23+math.sin(sec*2+k)*size*.4)
        yy=int(cy-(sec*size*(.8+k*.12)+k*size*.2)%(size*2.4))
        if 0<=xx<w and 0<=yy<h:cv2.circle(img,(xx,yy),max(1,h//950),(20,135,239),-1,cv2.LINE_AA)

def _smoke(img,shot,sec):
    h,w=img.shape[:2]
    canvas=np.zeros_like(img)
    cx=int(w*(.70 if shot["beat"] in (2,8) else .52))
    cy=int(h*.49)
    for i in range(9):
        s=sec*.40+i*.35
        x=int(cx+math.sin(s*1.85+i)*w*.11)
        y=int(cy-((sec*45+i*40)%(h*.43)))
        axes=(max(9,int(w*(.045+i*.008))),max(7,int(h*(.025+i*.005))))
        cv2.ellipse(canvas,(x,y),axes,0,0,360,(63,66,70),-1,cv2.LINE_AA)
    canvas=cv2.GaussianBlur(canvas,(0,0),6 if w<400 else 11)
    _draw_alpha(img,canvas,.16)

def _water(img,shot,sec):
    h,w=img.shape[:2]
    # Wave rings move away from point of splash and fade; never a full-scene filter.
    cx=int(w*(.46 if "splash" in shot["visible"] else .55));cy=int(h*.86)
    for i in range(3):
        period=.75
        p=((sec+i*period/3)%period)/period
        radius=int(max(4,w*(.015+.19*p)))
        color=(112+int(38*(1-p)),123+int(40*(1-p)),127+int(31*(1-p)))
        cv2.ellipse(img,(cx,cy),(radius,max(2,int(radius*.18))),
                    0,0,360,color,1 if w<500 else 2,cv2.LINE_AA)
    for j in range(11):
        age=((sec*.95+j*.21)%1.0)
        vx=(j-5)*w*.012
        x=int(cx+vx*age)
        y=int(cy-h*.22*age*(1-age)-age*h*.09)
        if 0<=x<w and 0<=y<h:cv2.circle(img,(x,y),1 if w<500 else 2,(146,164,168),-1,cv2.LINE_AA)

def _papers(img,shot,sec):
    h,w=img.shape[:2]
    for k in range(9):
        x=int((w*.12+k*w*.16+sec*w*(.16+.025*k))%(w+55)-26)
        y=int((h*.15+k*h*.09+sec*46*math.sin(k))%(h*.76))
        theta=sec*1.7+k*1.9
        dx=int(7*math.cos(theta)*w/720);dy=int(10*math.sin(theta)*h/1280)
        wh=max(3,int(w*.018))
        quad=np.array([[x+dx,y],[x+wh,y+dy],[x+wh-dx,y+wh],[x-wh,y+wh-dy]],np.int32)
        cv2.fillPoly(img,[quad],(200,210,218),cv2.LINE_AA)
        cv2.polylines(img,[quad],True,(51,65,82),1,cv2.LINE_AA)

def _glass(img,shot,sec):
    h,w=img.shape[:2]
    if sec<.2:return
    r=np.random.default_rng(774+shot["beat"]*11+shot["pos"])
    cx=w*.53;cy=h*.22
    for j in range(30):
        vx=r.uniform(-w*.22,w*.22)
        vy=r.uniform(-h*.21,-h*.02)
        t=sec-.2
        x=int(cx+vx*t)
        y=int(cy+vy*t+h*.14*t*t)
        if x<0 or y<0 or x>=w or y>=h:continue
        length=max(2,int(h*.008))
        cv2.line(img,(x,y),(x+length,y+int(length*.42)),(205,222,232),1,cv2.LINE_AA)

def _lamp(img,shot,sec):
    h,w=img.shape[:2]
    # Beacon visible pulse and projected red cone are physically localized.
    cx=int(w*.72);cy=int(h*.13)
    phase=.5+.5*math.sin(sec*9.4)
    rad=max(8,int(w*(.05+.026*phase)))
    layer=np.zeros_like(img)
    cv2.circle(layer,(cx,cy),rad,(6,45,230),-1,cv2.LINE_AA)
    pts=np.array([[cx,cy],[min(w-1,cx+rad*3),min(h-1,cy+rad*4)],
                  [max(0,cx-rad*2),min(h-1,cy+rad*4)]],np.int32)
    cv2.fillPoly(layer,[pts],(9,20,146),cv2.LINE_AA)
    _draw_alpha(img,layer,.08+.16*phase)

def _phone(img,shot,sec):
    h,w=img.shape[:2]
    cx=int(w*(.61 if shot["beat"]<13 else .54))
    cy=int(h*.64)
    phase=.5+.5*math.sin(sec*11.5)
    # Screen glow and vibrating screen content only within the held-phone area.
    layer=np.zeros_like(img)
    box_w=max(8,int(w*.12));box_h=max(14,int(h*.095))
    x0=max(0,cx-box_w//2);y0=max(0,cy-box_h//2)
    x1=min(w,cx+box_w//2);y1=min(h,cy+box_h//2)
    cv2.rectangle(layer,(x0,y0),(x1,y1),(181,96,50),-1,cv2.LINE_AA)
    _draw_alpha(img,layer,.07+.14*phase)
    line=(255,210,197)
    if phase>.55:
        cv2.line(img,(x0+3,y0+4),(min(w-1,x0+box_w//2),y0+4),line,1,cv2.LINE_AA)

def _cars(img,shot,sec):
    h,w=img.shape[:2]
    # Actual moving foreground car silhouette when traffic appears.  On image
    # pose shots the drawn bus/sedan already moves and this layer is omitted.
    if shot["location"] not in ("street","metro"):return
    if "traffic" not in shot["visible"] and "horn" not in shot["visible"]:return
    v=(sec*.24+shot["beat"]*.07)%1.3
    x=int((v-.22)*w);y=int(h*.79)
    ww=max(18,int(w*.27));hh=max(11,int(h*.038))
    if x+ww<0 or x>=w:return
    sprite=np.zeros_like(img)
    body=np.array([[x,y],[x+ww,y],[x+ww+7,y+hh//2],[x-7,y+hh//2]],np.int32)
    cv2.fillConvexPoly(sprite,body,(33,35,40),cv2.LINE_AA)
    cv2.line(sprite,(x+5,y+3),(x+ww-6,y+3),(110,116,124),1,cv2.LINE_AA)
    for wheel in (int(x+ww*.25),int(x+ww*.78)):
        cv2.circle(sprite,(wheel,y+hh//2),max(3,hh//3),(14,15,18),-1,cv2.LINE_AA)
    cv2.circle(sprite,(x+ww,y+hh//4),max(2,ww//44),(114,170,242),-1,cv2.LINE_AA)
    mask=(cv2.cvtColor(sprite,cv2.COLOR_BGR2GRAY)>0)[:,:,None]
    img[:]=(np.where(mask,sprite,img)).astype(np.uint8)

def _clouds(img,shot,sec):
    h,w=img.shape[:2]
    canvas=np.zeros_like(img)
    # Individual cloud banks advect in the sky; structures are not the camera.
    for i in range(6):
        cx=int((w*.20+i*w*.27+sec*w*.09)%(w*1.65)-w*.3)
        cy=int(h*(.08+i%3*.08)+math.sin(sec*.7+i)*h*.012)
        axes=(max(8,int(w*(.16+i*.018))),max(5,int(h*(.027+i*.008))))
        cv2.ellipse(canvas,(cx,cy),axes,0,0,360,(74,79,88),-1,cv2.LINE_AA)
    canvas=cv2.GaussianBlur(canvas,(0,0),5 if w<400 else 10)
    _draw_alpha(img,canvas,.075)

def _rotor(img,sec):
    h,w=img.shape[:2]
    cx=int(w*.48);cy=int(h*.20)
    span=int(w*.19)
    for i in range(3):
        angle=sec*27+i*math.pi*2/3
        x=int(cx+span*math.cos(angle))
        y=int(cy+span*.26*math.sin(angle))
        cv2.line(img,(cx,cy),(x,y),(30,42,54),max(1,w//600),cv2.LINE_AA)

def physical_effects(frame,shot,sec):
    """Every effect animates an object/prop or region, never the camera."""
    out=frame.copy()
    acts=set(shot.get("visible",()))
    _rain(out,shot,sec)
    if any(x in acts for x in ("fire","boom","crash")):_fire(out,shot,sec)
    if any(x in acts for x in ("fire","boom","window","electric")):_smoke(out,shot,sec)
    if any(x in acts for x in ("splash","wetsteps","rain_enter")):_water(out,shot,sec)
    if "papers" in acts:_papers(out,shot,sec)
    if "glass" in acts:_glass(out,shot,sec)
    if any(x in acts for x in ("alarm","electric","alert","siren")):_lamp(out,shot,sec)
    if any(x in acts for x in ("phone","alert","tv","static")):_phone(out,shot,sec)
    if "traffic" in acts or "horn" in acts:_cars(out,shot,sec)
    if shot["beat"] in (2,8,13) or "boom" in acts:_clouds(out,shot,sec)
    if "helicopter" in acts:_rotor(out,sec)
    return out

def _cover_crop(panel,size):
    w,h=panel.size;target_w,target_h=size
    if w/h>target_w/target_h:
        cw=round(h*target_w/target_h);offset=(w-cw)//2
        panel=panel.crop((offset,0,offset+cw,h))
    else:
        ch=round(w*target_h/target_w);offset=(h-ch)//2
        panel=panel.crop((0,offset,w,offset+ch))
    return np.ascontiguousarray(np.asarray(panel.resize(size,Image.Resampling.LANCZOS))[:,:,::-1])

def download_pose_frames(size=(W,H)):
    manifest=json.loads((BASE/"pose_sheets.json").read_text())["shots"]
    folder=BASE/"poses"
    folder.mkdir(parents=True,exist_ok=True)
    session=requests.Session()
    session.headers["User-Agent"]="Mozilla/5.0"
    result={}
    for kind in REQUIRED_POSE_KINDS:
        url=manifest[kind]
        path=folder/f"{kind}_4poses.jpg"
        if not path.exists():
            for attempt in range(4):
                try:
                    res=session.get(url,timeout=100);res.raise_for_status()
                    if len(res.content)<10000:raise RuntimeError("empty pose art")
                    Image.open(io.BytesIO(res.content)).convert("RGB").save(path,quality=94)
                    break
                except Exception as e:
                    if attempt==3:raise
                    time.sleep((attempt+1)*3)
        sheet=Image.open(path).convert("RGB")
        ww,hh=sheet.size
        if ww<500 or hh<700:raise RuntimeError("Pose source too small: "+kind)
        arr=[]
        for i in range(4):
            cx=(i%2)*(ww//2);cy=(i//2)*(hh//2)
            dx=int((ww//2)*.006);dy=int((hh//2)*.006)
            panel=sheet.crop((cx+dx,cy+dy,cx+ww//2-dx,cy+hh//2-dy))
            arr.append(_cover_crop(panel,size))
        result[kind]=arr
        print("Four genuine consecutive keyframes loaded:",kind,"shape",arr[0].shape,flush=True)
    return result
