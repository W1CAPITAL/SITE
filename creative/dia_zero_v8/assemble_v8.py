"""Assemble ONLY 32 genuine AI video clips, 3.75s each, 120sec exact.

If even one generative shot is unavailable, refuse to silently swap in a static
image, slideshow, camera-zoom, or procedural polygons. The user's original
male pt-BR narration, ambient tracks and word-time captions are preserved.
"""
import json,math,os,re,shutil,subprocess,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

BASE=Path(__file__).resolve().parent
INPUT=BASE/"generated"
OUTPUT=BASE/"final"
INPUT.mkdir(parents=True,exist_ok=True)
OUTPUT.mkdir(parents=True,exist_ok=True)

def cmd(*args):
    p=subprocess.run([str(x) for x in args],stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,text=True)
    if p.returncode:
        raise RuntimeError("Error in "+str(args[0])+": "+p.stderr[-2500:])
    return p.stdout

def probe(path):
    return json.loads(cmd("ffprobe","-v","error","-show_streams",
                         "-show_format","-of","json",path))

def t_ass(t):
    cs=round(float(t)*100)
    h=cs//360000
    m=(cs//6000)%60
    s=(cs//100)%60
    return f"{h}:{m:02d}:{s:02d}.{cs%100:02d}"

def subtitles(cues):
    ass=["[Script Info]","ScriptType: v4.00+","PlayResX: 720",
         "PlayResY: 1280","WrapStyle: 2","ScaledBorderAndShadow: yes",
         "","[V4+ Styles]",
         "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         "Style: Subtitle,DejaVu Sans,37,&H00FFFFFF,&H00FFFFFF,&H9A04080D,&H00000000,1,0,0,0,100,100,0,0,1,3,1,2,56,56,140,1",
         "","[Events]",
         "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for cue in cues:
        a=float(cue["start"]);b=float(cue["end"])
        if b<=a:continue
        txt=str(cue["text"]).replace("{","(").replace("}",")").replace("\n"," ")
        txt=txt.replace("\\","")
        ass.append(f"Dialogue: 0,{t_ass(a)},{t_ass(b)},Subtitle,,0,0,0,,{txt}")
    path=OUTPUT/"legendas_v8.ass"
    path.write_text("\n".join(ass)+"\n",encoding="utf-8")
    return path

def check_source_files():
    import json
    manifest=json.loads((BASE/"input"/"shot_manifest_v8.json").read_text())
    required=[INPUT/(x["id"]+".mp4") for x in manifest]
    missing=[p.name for p in required if not p.exists()]
    if missing:
        report={"success":False,"requested":len(required),"generated":len(required)-len(missing),
                "missing":missing,"note":"No fake stills inserted."}
        (OUTPUT/"V8_SEM_FALSA_ANIMACAO.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
        raise RuntimeError("Cannot export full 2 minutes: genuine generated shots missing "+repr(missing))
    return manifest,required

def generate_contact(manifest):
    import cv2
    cols=8;rows=4
    cw,ch=114,210
    sheet=Image.new("RGB",(cw*cols,ch*rows),(12,16,23))
    dr=ImageDraw.Draw(sheet)
    for i,x in enumerate(manifest):
        path=INPUT/(x["id"]+".mp4")
        cap=cv2.VideoCapture(str(path))
        if not cap.isOpened():raise RuntimeError("Cannot decode "+str(path))
        cap.set(cv2.CAP_PROP_POS_MSEC,1600)
        ok,frame=cap.read();cap.release()
        if not ok:raise RuntimeError("Cannot extract actual video frame "+str(path))
        im=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
        thumb=Image.fromarray(im).resize((cw,ch-27),Image.Resampling.LANCZOS)
        x0=(i%cols)*cw;y0=(i//cols)*ch
        sheet.paste(thumb,(x0,y0+27))
        dr.text((x0+4,y0+5),f"{i+1:02d} {x['zone'][:4]}",fill="white")
    sheet.save(OUTPUT/"V8_32_Clipes_Animados_Inspecao.jpg",quality=90)

def main():
    manifest,files=check_source_files()
    print("Verified 32 distinct true generative video clips",flush=True)
    normalized=OUTPUT/"normalized"
    normalized.mkdir(exist_ok=True)
    for i,(entry,source) in enumerate(zip(manifest,files)):
        info=probe(source)
        if not any(s["codec_type"]=="video" for s in info["streams"]):
            raise RuntimeError("No generated motion file "+source.name)
        output=normalized/f"{i:02d}.mp4"
        # Each shot 3.75sec -> exactly 90 output frames, 24fps.
        # No image-global zoom, fake motion, static-pose replacement.
        filtergraph=("scale=720:1280:flags=lanczos:force_original_aspect_ratio=increase,"
                     "crop=720:1280,fps=24,format=yuv420p")
        cmd("ffmpeg","-v","error","-y","-i",source,"-vf",filtergraph,
            "-an","-frames:v","90","-r","24","-c:v","libx264",
            "-preset","veryfast","-crf","21",output)
        meta=probe(output)
        vi=next(s for s in meta["streams"] if s["codec_type"]=="video")
        count=int(vi.get("nb_frames",0))
        if count!=90:raise RuntimeError(f"Invalid frame count {count} for {entry['id']}")
        if i%4==0:print("Normalized real moving video clips",i+1,"/32",flush=True)
    playlist=OUTPUT/"concat.txt"
    playlist.write_text("\n".join("file '"+str(normalized/f"{i:02d}.mp4")+"'"
                                     for i in range(len(manifest)))+"\n")
    raw=OUTPUT/"Dia_Zero_V8_So_Movimento_720p.mp4"
    cmd("ffmpeg","-v","error","-y","-f","concat","-safe","0",
        "-i",playlist,"-c","copy","-movflags","+faststart",raw)
    data=probe(raw)
    video=next(s for s in data["streams"] if s["codec_type"]=="video")
    n=int(video.get("nb_frames",0))
    if n!=2880:raise RuntimeError(f"Not exactly 2880 real motion frames: {n}")
    captions_source=Path(os.environ.get("V8_CAPTIONS_FILE",str(BASE/"input"/"v5_captions.json")))
    sound=Path(os.environ.get("V8_SOUND_FILE",str(BASE/"input"/"dia_zero_v5_real_stereo_sound.wav")))
    if not captions_source.is_file() or not sound.is_file():
        raise RuntimeError("Original real narrator/field Foley/subtitles missing")
    ass=subtitles(json.loads(captions_source.read_text()))
    master=OUTPUT/"Dia_Zero_V8_120s_Animacao_Generativa_720p.mp4"
    cmd("ffmpeg","-v","error","-y","-i",raw,"-i",sound,
        "-vf","subtitles="+str(ass),
        "-map","0:v:0","-map","1:a:0","-c:v","libx264",
        "-preset","veryfast","-crf","21","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","224k","-ar","48000","-ac","2",
        "-frames:v","2880","-t","120","-movflags","+faststart",master)
    finalinfo=probe(master)
    duration=float(finalinfo["format"]["duration"])
    a=next(s for s in finalinfo["streams"] if s["codec_type"]=="audio")
    v=next(s for s in finalinfo["streams"] if s["codec_type"]=="video")
    assert 119.94<=duration<=120.08
    assert v["width"]==720 and v["height"]==1280 and v["r_frame_rate"]=="24/1"
    assert a["codec_name"]=="aac" and a["channels"]==2
    generate_contact(manifest)
    audit={"complete":True,"generated_clips":32,"model":"Wan2.2 public image-to-video",
           "original_still_motion_filters_used":False,"duration":duration,
           "frames":2880,"fps":24,"resolution":"720x1280",
           "story_blocks":16,"genuine_motion_seconds":120,
           "qa_warning":"Automated checks cannot guarantee realistic movement or exact Foley relevance; visual editorial review still needed"}
    (OUTPUT/"V8_Animacao_Generativa_Relatorio.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2))
    print("TRUE-TEMPORAL-FILM READY",master,round(master.stat().st_size/1048576,2),"MiB",flush=True)

if __name__=="__main__":main()
