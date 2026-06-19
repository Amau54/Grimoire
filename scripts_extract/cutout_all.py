# -*- coding: utf-8 -*-
"""Détoure le fond clair de toutes les planches -> WebP transparent (léger).
Le sujet (plante ou flacon) repose ainsi directement sur le vrai papier."""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
sys.stdout.reconfigure(encoding='utf-8')

SENT = (255, 0, 255)

def cutout(path, out, thresh=36, maxw=360):
    im = Image.open(path).convert('RGB')
    work = im.copy()
    w, h = work.size
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
             (w // 4, 0), (3 * w // 4, h - 1)]
    for s in seeds:
        try:
            ImageDraw.floodfill(work, s, SENT, thresh=thresh)
        except Exception:
            pass
    r, g, b = work.split()
    mr = r.point(lambda v: 255 if v == 255 else 0)
    mg = g.point(lambda v: 255 if v == 0 else 0)
    mb = b.point(lambda v: 255 if v == 255 else 0)
    sent = ImageChops.multiply(ImageChops.multiply(mr, mg), mb)  # 255 = fond
    alpha = ImageChops.invert(sent).filter(ImageFilter.GaussianBlur(0.6))
    res = im.convert('RGBA')
    res.putalpha(alpha)
    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
    cw, ch = res.size
    if cw > maxw:
        res = res.resize((maxw, round(ch * maxw / cw)), Image.LANCZOS)
    res.save(out, 'WEBP', quality=84, method=6)
    # fraction d'opaque (détecte un détourage raté : ~tout opaque = fond non blanc)
    a = res.split()[3]
    opq = sum(a.histogram()[200:]) / (res.size[0] * res.size[1])
    return round(os.path.getsize(out) / 1024), opq

def main():
    files = sorted(glob.glob('images/*.jpg'))
    files = [f for f in files if 'paper-' not in f]
    tot = 0; n = 0; suspects = []
    for f in files:
        out = f[:-4] + '.webp'
        try:
            kb, opq = cutout(f, out)
            tot += kb; n += 1
            if opq > 0.93:           # quasi tout opaque -> fond probablement non détouré
                suspects.append((os.path.basename(f), round(opq, 2)))
        except Exception as e:
            print('ERR', f, e)
    print(f'détourées: {n} | total ~{round(tot/1024,1)} Mo')
    print(f'suspects (fond peu détouré, {len(suspects)}):', suspects[:20])

if __name__ == '__main__':
    main()
