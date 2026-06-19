# -*- coding: utf-8 -*-
"""Re-télécharge les images en haute définition (versions zoom du blog / Commons 1200px)
puis retraite : max 680px, q88, accentuation (unsharp) pour une meilleure netteté."""
import sys, json, os, urllib.request, io
from PIL import Image, ImageFilter
sys.stdout.reconfigure(encoding='utf-8')

UA = 'GrimoireHerbier/1.0 (recipe app)'
hd = json.load(open('scripts_extract/_data/sources_hd.json', encoding='utf-8'))

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    data = urllib.request.urlopen(req, timeout=30).read()
    if len(data) < 3000:
        raise ValueError('trop petit (%d)' % len(data))
    im = Image.open(io.BytesIO(data))
    im.load()
    return im

n = 0; bigger = 0; fails = []
for id, src in hd.items():
    cands = [src] if isinstance(src, str) else [src.get('try'), src.get('fb')]
    cands = [c for c in cands if c]
    im = None
    for u in cands:
        try:
            im = fetch(u); break
        except Exception:
            im = None
    if im is None:
        fails.append(id); continue
    try:
        im = im.convert('RGB')
        w, h = im.size
        old = os.path.getsize('images/%s.jpg' % id) if os.path.exists('images/%s.jpg' % id) else 0
        if w > 680:
            im = im.resize((680, round(h * 680 / w)), Image.LANCZOS)
        # accentuation douce pour compenser les sources molles
        im = im.filter(ImageFilter.UnsharpMask(radius=1.3, percent=85, threshold=2))
        im.save('images/%s.jpg' % id, 'JPEG', quality=88, optimize=True, progressive=True)
        if im.size[0] >= 600:
            bigger += 1
        n += 1
    except Exception as e:
        fails.append(id + ':' + str(e)[:40])

print('retraitées:', n, '| en >=600px:', bigger, '| échecs:', len(fails))
for f in fails[:20]:
    print('  ✗', f)
