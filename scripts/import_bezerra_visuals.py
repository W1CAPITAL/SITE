from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

BASE = Path("sites/demo-bezerra-menezes/assets")
BASE.mkdir(parents=True, exist_ok=True)
SRC = {
    "inicio": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/6d6291fd-deae-4833-9a24-76d14c6e46c5.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDI2YjA0ZjhmZjEzMmI1MyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEwNzM4NH0.UsKkyMC-n7cdiaA8arcwnbD-RfoeI6WEsvOkG36qTQw",
    "sobre": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/fd09d498-d190-4bc0-8e2a-6d2130d5719a.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYThkNTRiZjA4MmMzNTFhYiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEwOTI5Nn0.wfT_OtorTH1F8jYfwq5YJS1QaHoNHY2D10rOdUYGnok",
    "atuacao": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/318ac658-98d3-4553-aca5-c18e6d926c5b.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjk3ZThhNWU3Y2Q1NjVhMiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEzMDAxNH0.i344jVxfBV00QccGmZb-6ZlEq7_kWQAvVLFRq8iRKo4",
    "diferenciais": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/92c94478-45c8-41e3-adc6-4ddcd3947ed2.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiN2Q3MTNkMjhmM2ZjNGM4ZCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDEzODAyNH0.9oAGVDICQRlRd_RLyW1tDQZhPBjBO8Dv-mKvEZyH_oI",
    "como-funciona": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/9bfa7f9b-a8fb-49ff-b665-dc029a421e77.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjc5MDAwOWZhOTNmYzFmYSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDA4MjU5MX0.uMSrTjEw2YoTpbkNVOGLscPjys8mdj8RjcvFZZdGV7g",
    "contato": "https://d2jqrm6oza8nb6.cloudfront.net/datasets/1071fd3a-e088-4c45-8086-f3e41933e8d8.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzkxODI4ZTc3MDMwMDExNSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDExMjg3MX0.VDoAAUA_j3GObaxm13wljdn45szX6x5a58eAL--2Fo0",
}
BANDS = {
    "inicio": (0, 494, 295, 617),
    "sobre": (0, 405, 235, 522),
    "atuacao": (0, 756, 310, 944),
    "diferenciais": (0, 1120, 290, 1287),
    "como-funciona": (0, 991, 278, 1120),
    "contato": (0, 1158, 320, 1278),
}
for page, url in SRC.items():
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=45) as res:
        img = Image.open(BytesIO(res.read())).convert("RGB")
    if img.size != (1122, 1402):
        raise RuntimeError(f"Unexpected source dimensions for {page}: {img.size}")
    bottom = 415 if page == "diferenciais" else 445 if page == "atuacao" else 423
    img.crop((580, 132, 1122, bottom)).save(BASE / f"hero-{page}.webp", "WEBP", quality=90, method=5)
    img.crop(BANDS[page]).save(BASE / f"band-{page}.webp", "WEBP", quality=90, method=5)
    print("Imported", page)
