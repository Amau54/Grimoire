# -*- coding: utf-8 -*-
"""Traite une gravure téléchargée en EMBLÈME d'encre sépia détouré (PNG transparent).
Usage: python emblem_process.py <src.jpg> <out.png> [taille=120] [sepia=1]
Détoure le fond clair (flood-fill depuis les bords), désature, vire en encre sépia,
recadre, redimensionne. -> marque cohérente qui se pose sur le papier."""
import sys, os
from PIL import Image, ImageDraw, ImageChops, ImageFilter, ImageOps
SENT = (255, 0, 255)

def cutout_alpha(im, thresh=40):
    w, h = im.size
    work = im.convert('RGB').copy()
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        try: ImageDraw.floodfill(work, s, SENT, thresh=thresh)
        except Exception: pass
    r, g, b = work.split()
    mr = r.point(lambda v: 255 if v == 255 else 0)
    mg = g.point(lambda v: 255 if v == 0 else 0)
    mb = b.point(lambda v: 255 if v == 255 else 0)
    sent = ImageChops.multiply(ImageChops.multiply(mr, mg), mb)
    return ImageChops.invert(sent).filter(ImageFilter.GaussianBlur(0.5))

def sepia(gray):
    # mappe les gris vers une rampe d'encre sépia (clair ivoire -> brun foncé)
    lut_r, lut_g, lut_b = [], [], []
    for i in range(256):
        t = i / 255.0
        lut_r.append(int(70 + t * (245 - 70)))
        lut_g.append(int(54 + t * (236 - 54)))
        lut_b.append(int(33 + t * (214 - 33)))
    rgb = Image.merge('RGB', (gray.point(lut_r), gray.point(lut_g), gray.point(lut_b)))
    return rgb

def process(src, out, size=120, do_sepia=True):
    im = Image.open(src).convert('RGB')
    alpha = cutout_alpha(im)
    gray = ImageOps.grayscale(im)
    gray = ImageOps.autocontrast(gray, cutoff=1)
    body = sepia(gray) if do_sepia else im
    res = body.convert('RGBA')
    res.putalpha(alpha)
    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
    w, h = res.size
    s = size / max(w, h)
    res = res.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    res.save(out, 'PNG', optimize=True)
    opq = sum(res.split()[3].histogram()[200:]) / (res.size[0] * res.size[1])
    return res.size, round(os.path.getsize(out) / 1024), round(opq, 2)

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 120
    sep = (sys.argv[4] != '0') if len(sys.argv) > 4 else True
    print(process(src, out, size, sep))
