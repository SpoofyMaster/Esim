# Make web-sized WebP copies of Higgsfield originals into apps/web/public/media
import sys, os
from PIL import Image
SRC="/mnt/project-files/bleusim/higgsfield"; DST="/home/user/bleusim/apps/web/public/media"
os.makedirs(DST, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith(".png"): continue
    base=f[:-4]
    for w in (2400, 1200):
        out=f"{DST}/{base}-{w}.webp"
        if os.path.exists(out): continue
        im=Image.open(f"{SRC}/{f}").convert("RGB")
        if im.width>w: im=im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
        im.save(out, "WEBP", quality=80, method=6)
        print(out, os.path.getsize(out)//1024, "KB")
