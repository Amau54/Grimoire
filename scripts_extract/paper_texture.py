# -*- coding: utf-8 -*-
"""Génère de vraies textures de papier vieilli (raster, sans vecteur)."""
import sys, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
sys.stdout.reconfigure(encoding='utf-8')

W, H = 1400, 1900

def clamp(v): return max(0, min(255, int(v)))

def make_paper(base, fox_color, fox_n, vignette, grain, out):
    random.seed(hash(out) & 0xffffffff)
    img = Image.new('RGB', (W, H), base)

    # 1) grain fin (bruit gaussien) en superposition douce
    noise = Image.effect_noise((W, H), grain).convert('L')
    noise = noise.filter(ImageFilter.GaussianBlur(0.4))
    noise_rgb = Image.merge('RGB', (noise, noise, noise))
    img = ImageChops.overlay(img, noise_rgb)
    # ramener vers la teinte de base (l'overlay assombrit/éclaircit trop)
    img = Image.blend(Image.new('RGB', (W, H), base), img, 0.55)

    # 2) fibres : fines stries claires/sombres aléatoires
    fib = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(fib)
    for _ in range(900):
        x = random.randint(0, W); y = random.randint(0, H)
        ln = random.randint(8, 60); ang = random.uniform(-0.5, 0.5)
        x2 = x + int(ln); y2 = y + int(ln * ang)
        d.line([(x, y), (x2, y2)], fill=random.randint(20, 60), width=1)
    fib = fib.filter(ImageFilter.GaussianBlur(0.6))
    fib_rgb = Image.merge('RGB', (fib, fib, fib))
    img = ImageChops.screen(img, ImageChops.multiply(fib_rgb, Image.new('RGB', (W, H), (40, 34, 24))))

    # 3) taches de rousseur (foxing) : ellipses brunes diffuses
    stains = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stains)
    for _ in range(fox_n):
        cx = random.randint(0, W); cy = random.randint(0, H)
        r = random.randint(8, 46); a = random.randint(10, 34)
        col = tuple(clamp(c + random.randint(-12, 12)) for c in fox_color)
        sd.ellipse([cx - r, cy - r, cx + r, cy + int(r * random.uniform(.6, 1.1))], fill=col + (a,))
    stains = stains.filter(ImageFilter.GaussianBlur(7))
    img = Image.alpha_composite(img.convert('RGBA'), stains).convert('RGB')

    # 4) légère variation de teinte (nuages doux)
    cloud = Image.effect_noise((W // 6, H // 6), 22).resize((W, H)).filter(ImageFilter.GaussianBlur(28))
    cloud_rgb = Image.merge('RGB', (cloud, cloud, cloud))
    img = Image.blend(img, ImageChops.overlay(img, cloud_rgb), 0.18)

    # 5) vignette (bords plus sombres, comme un papier manipulé)
    if vignette:
        vg = Image.new('L', (W, H), 0)
        vd = ImageDraw.Draw(vg)
        m = 120
        vd.rectangle([m, m, W - m, H - m], fill=255)
        vg = vg.filter(ImageFilter.GaussianBlur(160))
        dark = ImageEnhance.Brightness(img).enhance(1 - vignette)
        img = Image.composite(img, dark, vg)

    img.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    import os
    print(out, '->', round(os.path.getsize(out) / 1024), 'Ko', img.size)

# papier ivoire vieilli (thème clair)
make_paper(base=(241, 233, 211), fox_color=(150, 116, 70), fox_n=70,
           vignette=0.10, grain=26, out='images/paper-light.jpg')
# carton / cuir patiné sombre (thème grimoire)
make_paper(base=(34, 29, 22), fox_color=(70, 54, 33), fox_n=46,
           vignette=0.16, grain=20, out='images/paper-dark.jpg')
