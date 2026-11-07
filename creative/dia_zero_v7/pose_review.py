"""Contact-sheet proof: four distinct poses per action and high-level visual continuity."""
import json,io,requests
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
base=Path(__file__).parent
data=json.loads((base/"pose_sheets.json").read_text())["shots"]
W,H=160,280
canvas=Image.new("RGB",(W*4,(H+26)*len(data)),(13,17,24))
d=ImageDraw.Draw(canvas)
f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",16)
for row,(kind,url) in enumerate(data.items()):
    raw=requests.get(url,timeout=80,headers={"User-Agent":"Mozilla/5.0"})
    raw.raise_for_status()
    image=Image.open(io.BytesIO(raw.content)).convert("RGB")
    iw,ih=image.size
    for p in range(4):
        x=(p%2)*(iw//2);y=(p//2)*(ih//2)
        panel=image.crop((x,y,x+iw//2,y+ih//2))
        panel=panel.resize((W,H),Image.Resampling.LANCZOS)
        canvas.paste(panel,(p*W,row*(H+26)+26))
        d.text((p*W+4,row*(H+26)+3),f"{kind.upper()} - frame {p+1}",font=f,fill="white")
    print("Rendered four successive poses for",kind,flush=True)
out=base/"V7_Pose_Motion_Review.jpg";canvas.save(out,quality=88)
print(out,out.stat().st_size)
