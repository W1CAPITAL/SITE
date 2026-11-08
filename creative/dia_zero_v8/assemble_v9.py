"""DIA ZERO V9: complete 120 seconds from thirty-two ACTUAL diffusion MP4s.

No still-frame fallback, geometric flames, camera zoom or slideshow animation.
First 8 shots were generated in V8; other 24 by the V9 two-shot runners.
NARRATOR is offscreen; scene prompts explicitly prohibit lip-sync movement.
After export, a separate image-space mouth cleanup stabilizes the eight old
shots only, without modifying the immersive sound track.
"""
from __future__ import annotations
import json,subprocess,os,shutil
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from assemble_v8 import subtitles

ROOT=Path(__file__).parent
FRAMES=ROOT/"generated"
OUT=ROOT/"final_v9"
IN=ROOT/"input"

def run(*args):
    cp=subprocess.run([str(a) for a in args],capture_output=True,text=True)
    if cp.returncode:
        raise RuntimeError(f"ffmpeg command failed: {cp.stderr[-2000:]}")
    return cp.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))

def verify_sources():
    allshots=json.loads((IN/"shot_manifest_v8.json").read_text())
    assert len(allshots)==32
    names=[f"{item['id']}.mp4" for item in allshots]
    assert len(set(names))==32
    missing=[name for name in names if not (FRAMES/name).is_file()]
    status={"required_real_clips":32,"found":32-len(missing),"missing":missing}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"AUDITORIA_DE_CLIPES_V9.json").write_text(json.dumps(status,ensure_ascii=False,indent=2))
    if missing:
        raise RuntimeError("Real video unavailable for "+repr(missing)+". Refusing to generate slides.")
    for item in allshots:
        path=FRAMES/(item["id"]+".mp4")
        p=info(path)
        if float(p["format"]["duration"])<3.5:
            raise RuntimeError("Generated video duration too short: "+str(path))
    return allshots

def assemble():
    data=verify_sources()
    norm=OUT/"normalized"
    norm.mkdir(exist_ok=True)
    print("Starting actual 32-shot temporal montage",flush=True)
    for idx,shot in enumerate(data):
        source=FRAMES/(shot["id"]+".mp4")
        target=norm/f"{idx:02d}.mp4"
        # The source video is generated temporal motion at ~16fps. MCI at the
        # native model aspect creates 24fps continuous motion, and only then
        # upscales to target size. No artificial subject motion is introduced.
        vf=("scale=432:768:flags=lanczos:force_original_aspect_ratio=increase,"
            "crop=432:768,setpts=1.075*PTS,"
            "minterpolate=fps=24:mi_mode=mci:mc_mode=obmc:me_mode=bidir:vsbmc=0,"
            "scale=720:1280:flags=lanczos,format=yuv420p")
        run("ffmpeg","-v","error","-y","-i",source,
            "-vf",vf,"-frames:v","90","-an",
            "-c:v","libx264","-preset","veryfast","-crf","21",
            "-pix_fmt","yuv420p",target)
        meta=info(target);v=next(s for s in meta["streams"] if s["codec_type"]=="video")
        count=int(v.get("nb_frames") or 0)
        if count!=90:raise RuntimeError(f"Clip {shot['id']} produced only {count} frames, expected 90")
        print(f"Motion scene {idx+1}/32 OK: {shot['id']}",flush=True)
    playlist=OUT/"concat.txt"
    playlist.write_text("\n".join(f"file '{(norm/f'{i:02d}.mp4')}'" for i in range(32))+"\n")
    silent=OUT/"Dia_Zero_V9_120s_Only_Generated_Motion.mp4"
    run("ffmpeg","-v","error","-y","-f","concat","-safe","0",
        "-i",playlist,"-c","copy","-movflags","+faststart",silent)
    n=int(next(s for s in info(silent)["streams"] if s["codec_type"]=="video").get("nb_frames",0))
    if n!=2880:raise RuntimeError("Wrong actual frame count: "+str(n))
    captions=json.loads((IN/"v5_captions.json").read_text())
    ass=subtitles(captions)
    audio=IN/"dia_zero_v5_real_stereo_sound.wav"
    if not audio.exists():raise RuntimeError("Missing original recorded Foley and narration")
    master=OUT/"Dia_Zero_V9_Filme_Completo_120s_Animado_720p.mp4"
    run("ffmpeg","-v","error","-y","-i",silent,"-i",audio,
        "-map","0:v:0","-map","1:a:0","-vf","subtitles="+str(ass),
        "-c:v","libx264","-crf","20","-preset","veryfast",
        "-pix_fmt","yuv420p","-c:a","aac","-b:a","224k",
        "-ac","2","-ar","48000","-t","120",
        "-movflags","+faststart",master)
    p=info(master)
    v=next(s for s in p["streams"] if s["codec_type"]=="video")
    a=next(s for s in p["streams"] if s["codec_type"]=="audio")
    if abs(float(p["format"]["duration"])-120)>.10:raise RuntimeError("Not exactly 120s")
    assert v["width"]==720 and v["height"]==1280 and v["r_frame_rate"]=="24/1"
    assert a["codec_name"]=="aac" and a["channels"]==2
    # Visual review sheet: real decoded middle frames of EVERY rendered video shot.
    canvas=Image.new("RGB",(8*160,4*285),(12,14,22))
    draw=ImageDraw.Draw(canvas)
    for idx,shot in enumerate(data):
        cap=cv2.VideoCapture(str(norm/f"{idx:02d}.mp4"))
        cap.set(cv2.CAP_PROP_POS_FRAMES,44)
        good,frame=cap.read();cap.release()
        if not good:raise RuntimeError("Cannot inspect real generated frame "+shot["id"])
        thumb=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).resize((160,260))
        x=(idx%8)*160;y=(idx//8)*285
        canvas.paste(thumb,(x,y+25))
        draw.text((x+6,y+5),shot["id"],fill=(255,255,255))
    contact=OUT/"Dia_Zero_V9_32_Tomadas_Visual.jpg"
    canvas.save(contact,quality=91)
    report={"complete":True,"duration":120,"genuine_video_clips":32,
            "animation":"Wan2.2 image-to-video and 24fps MCI between true video frames",
            "narration":"Original pt-BR recording, offscreen",
            "warning":"First eight original clips had lip motion artifacts and require local mouth stabilization inspection",
            "source_resolution":"model native 16fps, converted to 720x1280 24fps"}
    (OUT/"V9_Resumo_Geracao.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print("V9 GENERATED STORY READY:",master,round(master.stat().st_size/1048576,1),"MiB",flush=True)

if __name__=="__main__":assemble()
