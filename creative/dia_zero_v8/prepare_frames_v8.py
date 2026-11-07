"""Prepare 32 exact visual continuity anchors from the existing 59-shot V5 HQ.
No slide assembly. Every output is one first frame for true public GPU I2V.
"""
import gc, json
from pathlib import Path
import cv2
from edit_plan_v5 import shots as original_shots
from render_v5 import prepare_art
from video_shots_v8 import SHOTS,build_prompt

ROOT=Path(__file__).resolve().parent
DEST=ROOT/"input"

def prepare():
    DEST.mkdir(parents=True,exist_ok=True)
    plan,images=prepare_art()
    assert len(plan)==59==len(images)
    lookup={(s["beat"],s["pos"]):i for i,s in enumerate(plan)}
    manifest=[]
    for item in SHOTS:
        idx=lookup[(item["beat"],item["pos"])]
        image=images[idx]
        # True I2V model input is 9:16, compact enough for the public GPU.
        height,width=image.shape[:2]
        crop_ratio=9/16
        if width/height>crop_ratio:
            newwidth=round(height*crop_ratio);dx=(width-newwidth)//2
            image=image[:,dx:dx+newwidth]
        else:
            newheight=round(width/crop_ratio);dy=(height-newheight)//2
            image=image[dy:dy+newheight,:]
        scaled=cv2.resize(image,(432,768),interpolation=cv2.INTER_AREA)
        filename=item["id"]+".jpg"
        path=DEST/filename
        ok=cv2.imwrite(str(path),scaled,[cv2.IMWRITE_JPEG_QUALITY,90])
        if not ok:raise RuntimeError("JPEG export failed")
        manifest.append({**item,"file":filename,"prompt":build_prompt(item)})
        print("I2V STORY FRAME",item["id"],item["title"],item["zone"],path.stat().st_size,flush=True)
    (DEST/"shot_manifest_v8.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    del images;gc.collect()
    print("Prepared",len(manifest),"distinct real drawing frames, one per actual video clip",flush=True)

if __name__=="__main__":prepare()
