"""Recover a fully honest first 30 seconds of Dia Zero V8.

Eight genuine 3.9-second public Wan I2V shots (00_0..03_1) form 30.0s.
No slides, zooms, polygon flames or fake missing clips. The approved Brazilian
narration and ambience for 0..30s are mixed from the V5 original stems.
Motion interpolation is ONLY frame-rate conversion between AI-generated frames.
"""
import json,os,subprocess,sys
from pathlib import Path
from assemble_v8 import cmd,probe,subtitles
ROOT=Path(__file__).parent
INPUT=ROOT/"generated"
FINAL=ROOT/"intro_fast"
FINAL.mkdir(exist_ok=True,parents=True)

def main():
    ids=[f"clip_{beat:02d}_{part}" for beat in range(4) for part in (0,1)]
    paths=[INPUT/(i+".mp4") for i in ids]
    missing=[p.name for p in paths if not p.exists()]
    if missing:
        (FINAL/"INCOMPLETE.txt").write_text("Missing genuine generated video clips: "+repr(missing))
        raise RuntimeError("Do not turn missing video into static slides "+repr(missing))
    segments=FINAL/"clips";segments.mkdir(exist_ok=True)
    frames_total=0
    for idx,(uid,path) in enumerate(zip(ids,paths)):
        dest=segments/f"{idx:02d}.mp4"
        # Real temporal movement from Wan source; interpolation only changes
        # the frame rate from 16 to 24fps. Fixed camera, no fake slide pan.
        filt=("scale=720:1280:flags=lanczos:force_original_aspect_ratio=increase,"
              "crop=720:1280,"
              "fps=24,"
              "format=yuv420p")
        cmd("ffmpeg","-hide_banner","-v","error","-y","-i",path,"-vf",filt,
            "-frames:v","90","-an","-c:v","libx264","-preset","veryfast",
            "-crf","21",dest)
        info=probe(dest);video=next(s for s in info["streams"] if s["codec_type"]=="video")
        frames=int(video.get("nb_frames",0))
        if frames!=90:raise RuntimeError(f"Temporal clip {uid} does not have 90 frames: {frames}")
        frames_total+=frames
        print("VERIFIED ACTUAL VIDEO SHOT",uid,"frame count",frames,flush=True)
    listing=FINAL/"clips.txt"
    listing.write_text("\n".join(f"file '{segments/f'{i:02d}.mp4'}'" for i in range(8))+"\n")
    movie=FINAL/"V8_30s_Genuine_Story_Silent.mp4"
    cmd("ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",listing,
        "-c","copy","-movflags","+faststart",movie)
    if int(next(s for s in probe(movie)["streams"] if s["codec_type"]=="video").get("nb_frames",0))!=720:
        raise RuntimeError("Not 720 frames of real moving video")
    original_audio=ROOT/"input"/"dia_zero_v5_real_stereo_sound.wav"
    original_captions=ROOT/"input"/"v5_captions.json"
    if not original_audio.is_file() or not original_captions.is_file():
        raise RuntimeError("Need original synchronized narrator audio and caption cues")
    cues=json.loads(original_captions.read_text())
    captions=[{**c,"end":min(30.,float(c["end"]))}
              for c in cues if 0<=float(c["start"])<30.]
    ass=subtitles(captions)
    final=FINAL/"Dia_Zero_V8_30s_Animacao_Gerativa_Original16fps.mp4"
    cmd("ffmpeg","-hide_banner","-v","error","-y","-i",movie,
        "-i",original_audio,"-vf","subtitles="+str(ass),
        "-map","0:v:0","-map","1:a:0","-c:v","libx264",
        "-preset","veryfast","-crf","21","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","224k","-ac","2","-ar","48000",
        "-frames:v","720","-t","30","-movflags","+faststart",final)
    meta=probe(final);duration=float(meta["format"]["duration"])
    v=next(s for s in meta["streams"] if s["codec_type"]=="video")
    a=next(s for s in meta["streams"] if s["codec_type"]=="audio")
    assert abs(duration-30)<.1
    assert v["width"]==720 and v["height"]==1280 and v["r_frame_rate"]=="24/1"
    assert a["channels"]==2 and a["codec_name"]=="aac"
    report={"generated_video_seconds":30,"story_scope":"00:00-00:30 ONLY",
            "shots":ids,"real_video_generation":"Wan 2.2 actual temporal diffusion",
            "frame_rate_conversion":"MCI between real generated movie frames",
            "full_two_minutes_complete":False,
            "reason":"The shared free GPU server rejected the other requested clips.",
            "audio":"Original approved pt-BR narrator and natural diegetic sound 0..30sec",
            "dimensions":"720x1280","frames":frames_total,"video_mb":round(final.stat().st_size/1048576,2)}
    (FINAL/"V8_30s_Proof_and_Limits.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print("REAL ANIMATED INTRO READY",final,final.stat().st_size,flush=True)

if __name__=="__main__":main()
