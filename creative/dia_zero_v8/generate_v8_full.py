"""Generate ACTUAL diffusion-animated MP4 files for all 32 Dia Zero V8 shots.

This is NOT a Ken Burns, optical-flow 4-pose, polygons or camera-filter technique:
each still serves only as a starting frame for Wan 2.2 I2V that synthesizes
entirely new intermediate video frames on an independent GPU.

The public Hugging Face ZeroGPU Space is a shared experiment; one sequential
request at a time PER job, 2 jobs maximum. Respect 429 limits and fail honestly
on daily quota. Never silently fall back to slides.
"""
from __future__ import annotations
import json,os,subprocess,sys,time
from pathlib import Path
from urllib.parse import urlparse
import requests
from probe_wan_video import BASE,NEGATIVE
from video_shots_v8 import SHOTS

HERE=Path(__file__).resolve().parent
IN=HERE/"input"
OUT=HERE/"generated"
DURATION_SECONDS=3.9
INFERENCE_STEPS=6

def parse_result(stream):
    typ=None;lines=[]
    for raw in stream.iter_lines(decode_unicode=True):
        if not raw:
            if typ=="error":
                raise RuntimeError("WAN public GPU error: "+ "\n".join(lines)[:600])
            if typ=="complete":
                result=json.loads("\n".join(lines))
                if not result or not result[0]:
                    raise RuntimeError("GPU finished without a playable output video.")
                first=result[0]
                return first["url"] if isinstance(first,dict) else BASE+"/gradio_api/file="+str(first)
            typ=None;lines=[]
            continue
        if raw.startswith("event:"):
            typ=raw[6:].strip()
        if raw.startswith("data:"):
            lines.append(raw[5:].strip())
    raise RuntimeError("Public GPU SSE ended without a complete event.")

def generate_one(item,session):
    image=IN/(item["id"]+".jpg")
    if not image.is_file():raise RuntimeError("Missing storyboard image: "+str(image))
    with image.open("rb") as f:
        upload=session.post(BASE+"/gradio_api/upload",
                           files={"files":(image.name,f,"image/jpeg")},timeout=(15,70))
    if upload.status_code==429:raise RuntimeError("PUBLIC_QUOTA_EXCEEDED (upload 429)")
    upload.raise_for_status()
    payload=upload.json()
    if not isinstance(payload,list) or not payload:raise RuntimeError("Gradio upload did not return a path")
    path=payload[0]
    imagedata={"path":path,"url":BASE+"/gradio_api/file="+path,
               "orig_name":image.name,"size":None,"mime_type":None,
               "meta":{"_type":"gradio.FileData"}}
    data=[imagedata,None,item["prompt"],INFERENCE_STEPS,NEGATIVE,
          DURATION_SECONDS,1,1,42,False,6,
          "UniPCMultistep",3.0,16,False,True]
    request=session.post(BASE+"/gradio_api/call/generate_video",
                         json={"data":data},timeout=(15,60))
    if request.status_code==429:raise RuntimeError("PUBLIC_QUOTA_EXCEEDED (submit 429)")
    request.raise_for_status()
    event_id=request.json().get("event_id")
    if not event_id:raise RuntimeError("GPU did not return an event id")
    stream=session.get(BASE+"/gradio_api/call/generate_video/"+event_id,
                       headers={"Accept":"text/event-stream"},
                       stream=True,timeout=(20,480))
    if stream.status_code==429:raise RuntimeError("PUBLIC_QUOTA_EXCEEDED (result 429)")
    stream.raise_for_status()
    link=parse_result(stream)
    target=urlparse(link)
    if not target.hostname or not target.hostname.endswith(".hf.space"):
        raise RuntimeError("Unexpected third party output host: "+str(target.hostname))
    video=session.get(link,timeout=(20,150))
    video.raise_for_status()
    if len(video.content)<55000:raise RuntimeError("Generated MP4 was empty")
    result=OUT/(item["id"]+".mp4")
    result.write_bytes(video.content)
    info=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams",
                                            "-show_format","-of","json",str(result)]))
    duration=float(info["format"]["duration"])
    vs=[s for s in info["streams"] if s["codec_type"]=="video"]
    if not vs or duration<3.68 or duration>4.6:
        result.unlink(missing_ok=True)
        raise RuntimeError("Invalid temporal model output duration "+str(duration))
    return {"id":item["id"],"beat":item["beat"],"half":item["half"],
            "zone":item["zone"],"status":"generated",
            "duration":duration,"bytes":result.stat().st_size,
            "fps":vs[0].get("r_frame_rate","?"),
            "source":"real public Wan 2.2 GPU diffusion"}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    batch=int(os.environ.get("V8_BATCH_INDEX","0"))
    batches=int(os.environ.get("V8_BATCH_COUNT","4"))
    if batch<0 or batches<1 or batch>=batches:raise ValueError("Invalid batch")
    allitems=json.loads((IN/"shot_manifest_v8.json").read_text())
    assert len(allitems)==len(SHOTS)==32
    todo=[x for i,x in enumerate(allitems) if i%batches==batch]
    print("Batch",batch,"processing",len(todo),"real GPU animations",flush=True)
    s=requests.Session();s.headers["User-Agent"]="DiaZeroV8-I2V/1.0"
    report=[]
    quota_exceeded=False
    try:
        for i,item in enumerate(todo):
            start=time.monotonic()
            try:
                result=generate_one(item,s)
                print("GENUINE VIDEO SUCCESS",item["id"],
                      round(time.monotonic()-start,1),"seconds",
                      result["duration"],"s",result["bytes"],"bytes",flush=True)
            except Exception as error:
                msg=type(error).__name__+": "+str(error)
                result={"id":item["id"],"beat":item["beat"],"half":item["half"],
                        "status":"failed","reason":msg[:700]}
                print("REAL VIDEO NOT GENERATED",item["id"],msg[:650],flush=True)
                if ("QUOTA" in msg.upper() or "429" in msg or
                    "GPU quota" in msg or "rate limit" in msg.lower()):
                    quota_exceeded=True
            report.append(result)
            (OUT/f"manifest_batch_{batch}.json").write_text(
                json.dumps(report,ensure_ascii=False,indent=2))
            if quota_exceeded:
                print("Shared free GPU quota exhausted, stop rather than abuse public service",flush=True)
                break
            time.sleep(.4)
    finally:
        (OUT/f"manifest_batch_{batch}.json").write_text(
            json.dumps(report,ensure_ascii=False,indent=2))
    good=sum(x["status"]=="generated" for x in report)
    print("Batch",batch,"generated",good,"of",len(todo),
          "No slideshow fallback",flush=True)
    if good<len(todo):
        sys.exit(1)

if __name__=="__main__":main()
