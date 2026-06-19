# -*- coding: utf-8 -*-
"""Détoure le fond clair (blanc/ivoire) des planches -> PNG transparent.
Remplissage par diffusion depuis les bords (ne mange pas l'intérieur du sujet)."""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFilter
sys.stdout.reconfigure(encoding='utf-8')

def bg_color(im):
    w, h = im.size
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3),
           (w // 2, 2), (w // 2, h - 3), (2, h // 2), (w - 3, h // 2)]
    px = [im.getpixel(p)[:3] for p in pts]
    return tuple(sum(c[i] for c in px) // len(px) for i in range(3))

def whiteness(im):
    """fraction de pixels quasi-blancs (>238) — distingue photo produit vs planche."""
    small = im.convert('RGB').resize((60, 80))
    d = small.getdata()
    n = sum(1 for p in d if p[0] > 238 and p[1] > 238 and p[2] > 238)
    return n / len(d)

def cutout(path, out, thresh=36):
    im = Image.open(path).convert('RGB')
    bg = bg_color(im)
    # marqueur improbable
    SENT = (255, 0, 255)
    work = im.copy()
    w, h = work.size
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        try:
            ImageDraw.floodfill(work, s, SENT, thresh=thresh)
        except Exception:
            pass
    # alpha = 0 là où marqueur
    px = work.load()
    alpha = Image.new('L', (w, h), 255)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == SENT:
                ap[x, y] = 0
    # adoucir le bord (anti-aliasing léger)
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    res = im.convert('RGBA')
    res.putalpha(alpha)
    # recadrer sur le contenu
    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
    res.save(out, 'PNG', optimize=True)
    return bg, round(os.path.getsize(out) / 1024)

if __name__ == '__main__':
    os.makedirs('scripts_extract/_data/cutsample', exist_ok=True)
    for src in ('images/lq-amaretto.jpg', 'images/lq-liqueur-de-cassis-1.jpg', 'images/cr-creme-de-menthe.jpg'):
        if not os.path.exists(src):
            print('absent', src); continue
        im = Image.open(src).convert('RGB')
        wf = whiteness(im)
        out = 'scripts_extract/_data/cutsample/' + os.path.basename(src).replace('.jpg', '.png')
        bg, kb = cutout(src, out)
        kind = 'PRODUIT(blanc)' if wf > 0.45 else 'planche(ivoire)'
        print(f'{os.path.basename(src):34} blancheur={wf:.2f} {kind:18} bg={bg} -> {kb} Ko')
