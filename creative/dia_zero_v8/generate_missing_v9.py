"""V9: Finish the remaining twenty-four genuine Wan video shots, two per runner.

The free public Hugging Face GPU accepted two videos per ephemeral GitHub
Actions runner, then refused additional requests. We therefore schedule one
small job per narrative beat (12 jobs total), with a courteous concurrency
limit. Any rejected shot remains a known failure, never a Ken Burns fallback.

Voiceover is OFFSCREEN. The protagonist NEVER mouths narration.
"""
from __future__ import annotations
import json, os, sys, time
from pathlib import Path
import requests
from video_shots_v8 import SHOTS
from generate_v8_full import generate_one,OUT,IN

NO_MOUTH_MOTION=(
 "CRITICAL FACIAL CONTINUITY: The Portuguese narration is an OFFSCREEN VOICEOVER, "
 "NOT dialogue spoken by characters. ALL characters hold their mouths CLOSED and "
 "lips stable throughout the shot, unless a specifically visible action requires "
 "a tiny silent breath or swallowing. No random mouth opening, lip wobbling, "
 "mouth flapping, teeth appearing, invented speech or lip-sync; subtle natural "
 "eye blinks, gaze, eyebrows and body reactions instead. "
)

def select_two_shots(beat):
    if not isinstance(beat,int) or beat not in range(4,16):
        raise ValueError("V9 handles only the 24 missing scenes in beats 4..15.")
    result=[]
    for item in SHOTS:
        if item["beat"]!=beat:
            continue
        prompt=item["prompt"] if "prompt" in item else ""
        if not prompt:
            from video_shots_v8 import build_prompt
            prompt=build_prompt(item)
        result.append({**item,"prompt":prompt+NO_MOUTH_MOTION})
    assert [x["half"] for x in result]==[0,1]
    return result

def main():
    beat=int(os.environ["V9_BEAT"])
    candidates=select_two_shots(beat)
    OUT.mkdir(exist_ok=True,parents=True)
    src=IN/"shot_manifest_v8.json"
    if not src.is_file():raise RuntimeError("All 32 chronology frames not downloaded")
    allowed={x["id"] for x in json.loads(src.read_text())}
    assert all(x["id"] in allowed for x in candidates)
    sess=requests.Session()
    sess.headers["User-Agent"]="DiaZero-Real-Object-Motion-V9/1.0"
    results=[]
    for item in candidates:
        started=time.monotonic()
        try:
            result=generate_one(item,sess)
            result["mouth_instruction"]="voiceover, no lipsync, lips closed"
            result["elapsed_seconds"]=round(time.monotonic()-started,1)
            print("SUCCESS truly generated video",item["id"],result["duration"],"s",result["bytes"],"bytes",flush=True)
        except Exception as e:
            result={"id":item["id"],"status":"failed","error":f"{type(e).__name__}: {e}"[:850]}
            print("GENUINE VIDEO UNAVAILABLE",item["id"],result["error"],flush=True)
        results.append(result)
        (OUT/f"v9_beat_{beat:02d}_status.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
        if result["status"]=="failed":
            break
        time.sleep(0.7)
    successes=sum(r["status"]=="generated" for r in results)
    print(f"V9 Beat {beat:02d}: {successes}/2 clips genuinely animated.",flush=True)
    if successes!=2:sys.exit(1)

if __name__=="__main__":
    main()
