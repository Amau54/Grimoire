# -*- coding: utf-8 -*-
"""Détoure les meilleurs candidats (dossier best/) en EMBLÈMES PNG transparents,
couleur/ton naturel conservé, pour se poser sur le papier en thème clair ET sombre."""
import os, glob
from PIL import Image, ImageDraw, ImageChops, ImageFilter, ImageOps
SENT = (255, 0, 255)
BEST = 'scripts_extract/_data/best'
OUT = 'images/emblems'

# asset -> (crop_bottom_frac, box_fractionnaire (l,t,r,b) ou None, thresh, taille_px)
SEL = {
    'cat-liqueurs':      (0.05, None, 82, 150),
    'cat-cremes':        (0.06, None, 60, 150),
    'cat-ratafias':      (0.10, None, 74, 160),
    'cat-hypocras':      (0.12, None, 58, 160),
    'cat-vins':          (0.12, None, 55, 170),
    'cat-rhums':         (0.12, None, 58, 170),
    'theme-fleurs':      (0.12, None, 60, 160),
    'theme-epices':      (0.06, None, 60, 160),
    'theme-fruits':      (0.12, None, 60, 160),
    'theme-medicinales': (0.12, None, 60, 160),
    'theme-historiques': (0.0, (0.18, 0.12, 0.72, 0.50), 70, 150),
    'seal-codex':        (0.0, (0.44, 0.03, 0.66, 0.40), 46, 140),
}

def cutout_alpha(im, thresh):
    w, h = im.size
    work = im.convert('RGB').copy()
    seeds = [(1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2),
             (w // 2, 1), (w // 2, h - 2), (1, h // 2), (w - 2, h // 2),
             (w // 4, 1), (3 * w // 4, 1), (w // 4, h - 2), (3 * w // 4, h - 2)]
    for s in seeds:
        try: ImageDraw.floodfill(work, s, SENT, thresh=thresh)
        except Exception: pass
    r, g, b = work.split()
    sent = ImageChops.multiply(ImageChops.multiply(
        r.point(lambda v: 255 if v == 255 else 0),
        g.point(lambda v: 255 if v == 0 else 0)),
        b.point(lambda v: 255 if v == 255 else 0))
    a = ImageChops.invert(sent)
    return a.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))

def src_for(asset):
    for ext in ('.jpg', '.png', '.jpeg'):
        p = os.path.join(BEST, asset + ext)
        if os.path.exists(p): return p
    raise FileNotFoundError(asset)

def process(asset, cb, box, thresh, size):
    im = Image.open(src_for(asset)).convert('RGB')
    w, h = im.size
    if box:
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        w, h = im.size
    if cb:
        im = im.crop((0, 0, w, int(h * (1 - cb))))
    im = ImageOps.autocontrast(im, cutoff=0.4)
    alpha = cutout_alpha(im, thresh)
    res = im.convert('RGBA'); res.putalpha(alpha)
    bbox = res.getbbox()
    if bbox: res = res.crop(bbox)
    w, h = res.size
    s = size / max(w, h)
    res = res.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    res.save(os.path.join(OUT, asset + '.png'), 'PNG', optimize=True)
    cover = sum(res.split()[3].histogram()[160:]) / (res.size[0] * res.size[1])
    return res.size, round(os.path.getsize(os.path.join(OUT, asset + '.png')) / 1024), round(cover, 2)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for asset, (cb, box, th, size) in SEL.items():
        try:
            print('OK  %-20s %s' % (asset, process(asset, cb, box, th, size)))
        except Exception as e:
            print('ERR %-20s %s' % (asset, str(e)[:60]))
