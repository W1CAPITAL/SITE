"""Render actual object/character animation throughout Dia Zero in 720p, 24fps, 120s.

On 12 selected coherent narrative shots, FOUR successive AI-rendered object poses
are motion-interpolated with bidirectional optical flow. For the other 47 shots
the drawn illustration remains a stable camera backdrop while distinct scene
objects animate: water, rain, sparks, fire, smoke, clocks/phones, headlights,
alarms, papers and searchlight rotors. Retains original approved narration cues.
"""
from pathlib import Path
import bisect, gc, json, math, os, subprocess
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont

from edit_plan_v5 import shots
from render_v5 import prepare_art
from motion_v7 import (
 W,H,FPS,POSE_MAP,POSETIME,REQUIRED_POSE_KINDS,
 download_pose_frames,compute_flow,pose_interpolate,physical_effects
)
ROOT=Path(__file__).parent
OUTPUT=ROOT/"output"
TOTAL_FRAMES=120*FPS

def caption_image(text):
    image=Image.new("RGBA",(W,H),(0,0,0,0))
    dr=ImageDraw.Draw(image)
    font_file="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font=ImageFont.truetype(font_file,34)
    terms=text.split()
    lines=[];line=""
    for word in terms:
        candidate=(line+" "+word).strip()
        if line and dr.textbbox((0,0),candidate,font=font,stroke_width=2)[2]>W-100:
            lines.append(line);line=word
        else:line=candidate
    if line:lines.append(line)
    y=H-224-(len(lines)-1)*45
    for s in lines:
        bbox=dr.textbbox((0,0),s,font=font,stroke_width=2)
        x=int((W-(bbox[2]-bbox[0]))/2)
        dr.text((x,y),s,font=font,fill=(255,255,255,245),
                stroke_width=3,stroke_fill=(3,7,15,240))
        y+=45
    img=np.asarray(image)
    return img[:,:,:3][:,:,::-1].copy(),img[:,:,3].astype(np.float32)/255.

def composite_caption(frame,text,opacity,layers):
    if not text or opacity<.02:return frame
    if text not in layers:
        if len(layers)>10:layers.pop(next(iter(layers)))
        layers[text]=caption_image(text)
    rgb,a=layers[text]
    top=H-355;bottom=H-98
    alpha=a[top:bottom,:,None]*opacity
    roi=frame[top:bottom]
    roi[:]=np.clip(roi*(1-alpha)+rgb[top:bottom]*alpha,0,255).astype(np.uint8)
    return frame

def _sample_pose(frames,flows,knots,phase):
    if phase<=0:return frames[0].copy()
    if phase>=1:return frames[-1].copy()
    seg=max(0,min(2,bisect.bisect_right(knots,phase)-1))
    t=(phase-knots[seg])/(knots[seg+1]-knots[seg])
    fw,bw=flows[seg]
    return pose_interpolate(frames[seg],frames[seg+1],t,fw,bw)

def _load_cues(folder):
    filename=folder/"v5_captions.json"
    if not filename.is_file():raise RuntimeError("Original V5 captions missing")
    cues=json.loads(filename.read_text())
    cues=sorted(cues,key=lambda x:x["start"])
    return cues,[x["start"] for x in cues]

def render():
    OUTPUT.mkdir(parents=True,exist_ok=True)
    plan=shots()
    assert len(plan)==59 and plan[-1]["end_frame"]==2880
    print("Prepare 59 chronological original art frames",flush=True)
    story,source_images=prepare_art()
    assert len(source_images)==len(plan)
    sources=[cv2.resize(im,(W,H),interpolation=cv2.INTER_AREA) for im in source_images]
    del source_images;gc.collect()
    print("Prepare four real physical action poses for 12 clips",flush=True)
    poses=download_pose_frames(size=(W,H))
    cues,cue_starts=_load_cues(OUTPUT)
    cues_layers={}
    silent=OUTPUT/"Dia_Zero_V7_True_Object_Motion_Silent.mp4"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","rawvideo","-pixel_format","bgr24","-video_size",f"{W}x{H}",
         "-framerate",str(FPS),"-i","pipe:0","-an",
         "-c:v","libx264","-pix_fmt","yuv420p",
         "-preset","veryfast","-crf","20","-movflags","+faststart",str(silent)]
    encoder=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    timecaps=[]
    motion_report=[]
    for index,shot in enumerate(plan):
        kind=POSE_MAP.get((shot["beat"],shot["pos"]))
        src=sources[index]
        nframes=shot["end_frame"]-shot["start_frame"]
        dur=nframes/FPS
        if kind:
            current=poses[kind]
            # Real optical flow between genuinely different character/object poses.
            flows=[compute_flow(current[j],current[j+1]) for j in range(3)]
            knots=POSETIME[kind]
        else:
            current=None;flows=None;knots=None
        snapshot_first=None;snapshot_last=None
        for f in range(nframes):
            abs_frame=shot["start_frame"]+f
            now=abs_frame/FPS
            local=f/FPS
            progress=f/max(1,nframes-1)
            if kind:
                image=_sample_pose(current,flows,knots,progress)
            else:
                # Original art is STATIONARY; physical objects independently move.
                image=src.copy()
            # Draw physically time-changing objects (not global image filters).
            image=physical_effects(image,shot,local)
            if f==min(5,nframes-1):snapshot_first=image.copy()
            if f==max(0,nframes-6):snapshot_last=image.copy()
            c=bisect.bisect_right(cue_starts,now)-1
            if c>=0 and now<float(cues[c]["end"]):
                cue=cues[c]
                a=max(0.,min(1.,(now-float(cue["start"]))/.11,
                                (float(cue["end"])-now)/.12))
                composite_caption(image,cue["text"],a,cues_layers)
            try:encoder.stdin.write(image.tobytes())
            except BrokenPipeError:
                problem=encoder.stderr.read().decode(errors="replace")
                raise RuntimeError("ffmpeg failed: "+problem[-2500:])
        pixel_delta=float(np.mean(np.abs(
            snapshot_first.astype(np.float32)-snapshot_last.astype(np.float32)
        ))) if snapshot_first is not None else 0.
        motion_report.append({
            "shot_index":index,"beat":shot["beat"],"position":shot["pos"],
            "type":"actual interpolated four-POSE keyframe animation" if kind else "independent animated props/environment",
            "pose_kind":kind,"frame_count":nframes,"object_change_mean":round(pixel_delta,3),
            "visible_actions":list(shot["visible"])
        })
        print(f"ANIMATED shot {index+1:02d}/59, {nframes} frames, "
              f"pose={kind or '-':11s}, pixel change={pixel_delta:.2f}",flush=True)
        flows=None
        if index%8==0:gc.collect()
    encoder.stdin.close()
    stderr=encoder.stderr.read().decode(errors="replace")
    if encoder.wait()!=0:raise RuntimeError("Final video encoder: "+stderr[-2000:])
    report=OUTPUT/"motion_v7_audit.json"
    report.write_text(json.dumps({
        "frames":TOTAL_FRAMES,"total_seconds":120,
        "real_pose_sequences":len(POSE_MAP),"fully_independent_character_animation":False,
        "note":"12 image-to-image in-between sequences plus 47 animated object/foley layers. Not a full generative video for every shot.",
        "shots":motion_report
    },ensure_ascii=False,indent=2))
    if len(motion_report)!=59:raise RuntimeError("Missing shot")
    if any(x["object_change_mean"]<.01 for x in motion_report):
        bad=[x["shot_index"] for x in motion_report if x["object_change_mean"]<.01]
        raise RuntimeError("Static shot(s) remain: "+str(bad))
    print("RENDERED",silent,silent.stat().st_size,"bytes; 2880 frames, 12 physically posed keyframe sequences",flush=True)

if __name__=="__main__":render()
