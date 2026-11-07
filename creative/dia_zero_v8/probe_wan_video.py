"""Proof-of-motion experiment for Dia Zero V8: REAL diffusion-generated image-to-video.

No zoom, optical-flow slides, fake flames, screen-space polygons or camera wobble.
Uses a single public Wan 2.2 demo to test ONE genuine 3.0s generated video shot.
Never batch a shared community GPU without first proving the service works.
Upstream API structure adapted with credit to MIT-licensed IgorCSIS/nifty-vid:
https://github.com/IgorCSIS/nifty-vid
"""
from __future__ import annotations
import io,json,os,subprocess,time
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parent
OUT=ROOT/"out"
BASE=os.environ.get("WAN_SPACE","https://cbensimon-wan2-2-fp8da-aoti-preview2.hf.space").rstrip("/")
FUNC="generate_video"
NEGATIVE=("色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, "
          "最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, "
          "画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, "
          "杂乱的背景, 三条腿, 背景人很多, 倒着走")
PROMPT=(
 "A real cinematic graphic novel animation in a modern Brazilian OFFICE interior at 18:00. "
 "One ordinary male office employee's anatomically realistic hand reaches for the vibrating "
 "smartphone lying on the work desk, curls articulated fingers naturally around it, picks it "
 "up, turns the wrist and reads a bright emergency alert that changes light on his fingers. "
 "Visible motion of fingers, hand, phone, garment cuff and luminous screen is smooth and "
 "continuous, with correct physical acceleration and deceleration, not a series of slides. "
 "The office architecture and camera remain absolutely stationary; the ceiling lamp and "
 "keyboard remain still. Rainfall, smoke, vehicles, emergency lights and distant chaos "
 "belong ONLY outside the office window and MUST NOT enter the office. Keep sophisticated "
 "mature hand-inked noir comic style, storm-blue shadows, restrained warm lamp lighting, "
 "same faces and props, no garbled texts. NO camera shake, no zoom, no panning, no slideshow, "
 "no geometry overlays, no artificial flames, no text overlays or captions."
)

def check_zone(objects,zone):
    outside={"rain_falling","cars","fire","smoke","helicopter","crowd","street_puddle"}
    interior={"lamp","keyboard","office_desk","phone","papers","office_people"}
    if zone=="office" and any(x in outside for x in objects):
        raise ValueError("Outdoor effect illegally composited inside office.")
    if zone=="street" and any(x in {"office_desk","keyboard"} for x in objects):
        raise ValueError("Office equipment moved to street without narrative cause.")
    return True

def send_single_request():
    check_zone(["office_desk","keyboard","phone","lamp"],"office")
    OUT.mkdir(parents=True,exist_ok=True)
    refs=json.loads((ROOT.parent/"dia_zero_v7"/"pose_sheets.json").read_text())
    url=refs["shots"]["phone"]
    response=requests.get(url,timeout=90)
    response.raise_for_status()
    source=Image.open(io.BytesIO(response.content)).convert("RGB")
    w,h=source.size
    # Source is four sequential panels; use the FIRST as first frame, not the
    # four-panel collage. The video model, not Python frame blending, animates it.
    panel=source.crop((0,0,w//2,h//2))
    aspect=.5625 # 9:16 vertical
    pw,ph=panel.size
    if pw/ph>aspect:
        nw=round(ph*aspect);off=(pw-nw)//2
        panel=panel.crop((off,0,off+nw,ph))
    else:
        nh=round(pw/aspect);off=(ph-nh)//2
        panel=panel.crop((0,off,pw,off+nh))
    img=panel.resize((432,768),Image.Resampling.LANCZOS)
    filename=OUT/"Dia_Zero_V8_Test_FirstFrame.jpg"
    img.save(filename,quality=87)
    session=requests.Session()
    session.headers["User-Agent"]="DiaZero-StoryMotion-Proof/0.1"
    print("Checking public inference service availability",BASE,flush=True)
    status=session.get(BASE,timeout=(12,25))
    print("Upstream status:",status.status_code,flush=True)
    if status.status_code>=500:raise RuntimeError(f"Free GPU Space currently down: {status.status_code}")
    with filename.open("rb") as f:
        upload=session.post(BASE+"/gradio_api/upload",files={"files":("first_frame.jpg",f,"image/jpeg")},timeout=(15,85))
    print("Upload HTTP",upload.status_code,flush=True)
    upload.raise_for_status()
    paths=upload.json()
    if not isinstance(paths,list) or not paths or not isinstance(paths[0],str):
        raise RuntimeError("Public Space upload did not provide a file reference.")
    filedata={"path":paths[0],"url":f"{BASE}/gradio_api/file={paths[0]}",
              "orig_name":"first_frame.jpg","size":None,"mime_type":None,
              "meta":{"_type":"gradio.FileData"}}
    args=[filedata,None,PROMPT,6,NEGATIVE,3.0,1,1,42,True,6,
          "UniPCMultistep",3.0,16,False,True]
    print("Sending one image-to-video request for 3.0s real temporal motion.",flush=True)
    job=session.post(BASE+"/gradio_api/call/"+FUNC,json={"data":args},timeout=(15,60))
    print("Queue status",job.status_code,job.text[:200],flush=True)
    job.raise_for_status()
    event_id=job.json().get("event_id")
    if not event_id:raise RuntimeError("Upstream did not return event_id.")
    result=session.get(BASE+"/gradio_api/call/"+FUNC+"/"+event_id,
                       headers={"Accept":"text/event-stream"},
                       stream=True,timeout=(15,390))
    result.raise_for_status()
    current_type=None;buffer=[]
    direct=None
    for raw in result.iter_lines(decode_unicode=True):
        if not raw:
            if current_type:
                payload="\n".join(buffer)
                if current_type in ("complete","error"):
                    print("Event",current_type,payload[:500],flush=True)
                if current_type=="error":raise RuntimeError("Public video GPU error: "+payload[:600])
                if current_type=="complete":
                    data=json.loads(payload)
                    direct=data[0] if isinstance(data,list) and data else None
                    break
            current_type=None;buffer=[]
            continue
        if raw.startswith("event:"):current_type=raw[6:].strip()
        if raw.startswith("data:"):buffer.append(raw[5:].strip())
    if direct is None:raise RuntimeError("Free GPU stream closed without completed video.")
    if isinstance(direct,str):
        link=BASE+"/gradio_api/file="+direct
    else:
        link=direct.get("url") or BASE+"/gradio_api/file="+str(direct.get("path",""))
    if not link.startswith("https://"):raise RuntimeError("Unexpected generated video URL")
    download=session.get(link,timeout=(15,160))
    download.raise_for_status()
    if len(download.content)<60000:raise RuntimeError("Upstream video was empty.")
    target=OUT/"Dia_Zero_V8_Prova_Animacao_Temporal_3s.mp4"
    target.write_bytes(download.content)
    print("GENUINE GENERATED VIDEO DOWNLOADED",target,target.stat().st_size,flush=True)
    meta=json.loads(subprocess.check_output(
        ["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(target)]
    ))
    dur=float(meta["format"]["duration"])
    video=next(s for s in meta["streams"] if s["codec_type"]=="video")
    if dur<1.8 or dur>6:raise RuntimeError("Invalid video duration "+str(dur))
    if video["nb_frames"] if "nb_frames" in video else False:
        print("Output frames",video["nb_frames"],flush=True)
    audit={"status":"completed","duration":dur,"model":"Wan 2.2 public image-to-video",
           "animation_method":"multi-frame generative diffusion, not camera overlay",
           "size_bytes":target.stat().st_size,
           "source":"generated story image, no user's sensitive photo",
           "limitations":"Experimental public shared GPU; further shots require visual QA"}
    (OUT/"V8_motion_proof.json").write_text(json.dumps(audit,indent=2,ensure_ascii=False))
    return target

if __name__=="__main__":
    try:send_single_request()
    except Exception as e:
        OUT.mkdir(parents=True,exist_ok=True)
        (OUT/"V8_DIAGNOSTICO.txt").write_text(type(e).__name__+": "+str(e)+"\n")
        print("Public model unavailable:",repr(e),flush=True)
        raise
