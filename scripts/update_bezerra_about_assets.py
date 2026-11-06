"""Extract three visually distinct reference photography regions from user-supplied approved about-page artwork."""
from pathlib import Path
from urllib.request import urlopen, Request
from io import BytesIO
from PIL import Image
URL = "https://d2jqrm6oza8nb6.cloudfront.net/datasets/f39b1478-3c6b-4def-929d-ede0205e71f3.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYWE5MjIwNzE1MjJlMjZiNSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDE0NDg4MX0.XxogYC0KZmnQKXgvLPJdoEfkxstOL7WeG9OJtxSzTxY"
ROOT = Path("sites/demo-bezerra-menezes/assets")
ROOT.mkdir(parents=True, exist_ok=True)
with urlopen(Request(URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as resp:
    data = resp.read()
with Image.open(BytesIO(data)) as src:
    original = src.convert("RGB")
    assert original.size == (1122, 1402), f"Unexpected artwork size: {original.size}"
    # Editorial images only: all interface text is rendered as HTML.
    rectangles = {
       "hero-sobre.webp": (440, 137, 1122, 410),    # office, library, BM on marble wall
       "manifesto-sobre.webp": (0, 413, 342, 531),  # justice scales, not the portrait
       "portrait-sobre.webp": (72, 545, 495, 781), # fictional female editorial portrait
    }
    for filename, rect in rectangles.items():
        art = original.crop(rect)
        art.save(ROOT / filename, "WEBP", quality=93, method=5)
        assert (ROOT / filename).stat().st_size > 2000, filename
        print(f"{filename}: {art.width}×{art.height}, {(ROOT / filename).stat().st_size} bytes")
