# -*- coding: utf-8 -*-
"""Fabrique des tuiles de papier SANS COUTURE à partir d'un vrai scan,
tonalité calée sur une cible. Méthode offset + cicatrisation de la croix de couture."""
import sys
import numpy as np
from PIL import Image, ImageFilter

def even_region(im, size):
    """crop central carré (évite vignettage/plis des bords)."""
    w, h = im.size
    s = int(min(w, h) * 0.62)
    l, t = (w - s) // 2, (h - s) // 2
    return im.crop((l, t, l + s, t + s)).resize((size, size), Image.LANCZOS)

def seamless(im, size, heal=70, blur=26):
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    n = size
    rolled = np.roll(np.roll(a, n // 2, axis=0), n // 2, axis=1)
    healed = np.asarray(Image.fromarray(rolled.astype('uint8')).filter(
        ImageFilter.GaussianBlur(blur)), dtype=np.float32)
    # masque : bandes feutrées le long des coutures (croix au milieu)
    idx = np.arange(n)
    dx = np.minimum(np.abs(idx - n // 2), heal) / heal      # 0 sur la couture -> 1 au loin
    line_x = 1.0 - dx                                       # 1 sur la couture verticale
    line_y = line_x.copy()
    mask = np.maximum(line_x[None, :], line_y[:, None])     # croix
    mask = np.asarray(Image.fromarray((mask * 255).astype('uint8')).filter(
        ImageFilter.GaussianBlur(12)), dtype=np.float32)[..., None] / 255.0
    out = rolled * (1 - mask) + healed * mask
    return Image.fromarray(np.clip(out, 0, 255).astype('uint8'))

def grade_to(im, target_rgb, strength=0.55):
    """déplace la couleur moyenne vers la cible (calage tonal) sans aplatir le grain."""
    a = np.asarray(im, dtype=np.float32)
    mean = a.reshape(-1, 3).mean(0)
    shift = (np.array(target_rgb, dtype=np.float32) - mean) * strength
    return Image.fromarray(np.clip(a + shift, 0, 255).astype('uint8'))

def build(src, out, target, size=512, strength=0.5, contrast=1.0):
    im = Image.open(src)
    reg = even_region(im, size)
    seam = seamless(reg, size)
    seam = grade_to(seam, target, strength)
    if contrast != 1.0:
        a = np.asarray(seam, np.float32)
        m = a.reshape(-1, 3).mean(0)
        a = np.clip((a - m) * contrast + m, 0, 255)
        seam = Image.fromarray(a.astype('uint8'))
    seam.save(out, 'JPEG', quality=88)
    a = np.asarray(seam).reshape(-1, 3).mean(0)
    print('%s  taille=%dpx  moy=(%d,%d,%d)' % (out, size, *a.astype(int)))

if __name__ == '__main__':
    # cibles tonales = ivoire chaud (clair) / brun-noir patiné (sombre), accordées au design
    # clair = Pergament (homogène, sans pli) ; sombre = reliure Walters (CC0)
    build('scripts_extract/_data/bgcand/bg-light__1.jpg', 'scripts_extract/_data/paper-light-new.jpg',
          target=(231, 222, 201), size=512, strength=0.5)
    build('scripts_extract/_data/best/bg-dark.jpg', 'scripts_extract/_data/paper-dark-new.jpg',
          target=(38, 32, 27), size=512, strength=0.45, contrast=0.9)
