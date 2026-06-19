# -*- coding: utf-8 -*-
"""Mappe chaque recette à sa photo (blog), en écartant les images décoratives répétées."""
import re, sys, json, html, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

SRC = sys.argv[1]
t = open(SRC, encoding='utf-8').read()

def textify(s):
    s = re.sub(r'<[^>]+>', '', s); s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

# 1) repérer les blocs-recettes (h3 avec <a id=...>)
heads = []
for m in re.finditer(r'<h3[^>]*>(.*?)</h3>', t, re.S | re.I):
    if re.search(r'<a\s+id=', m.group(1), re.I):
        nom = textify(m.group(1))
        if nom:
            heads.append((m.start(), m.end(), nom))

# 2) compter la fréquence de chaque image (pour écarter les décoratives)
from collections import Counter
allimg = re.findall(r'<img[^>]+src="([^"]+)"', t, re.I)
freq = Counter(allimg)

def is_decor(u):
    if freq[u] > 3: return True                      # répétée partout = décor
    if 'header-' in u or 'dizperso' in u: return True
    if not re.search(r'artfichier', u): return True   # vraies photos = artfichier
    return False

# 3) pour chaque bloc, première image-photo + version zoom
out = {}
for i, (s, e, nom) in enumerate(heads):
    end = heads[i + 1][0] if i + 1 < len(heads) else len(t)
    block = t[e:end]
    # paire <a class="zoomable" href="big"><img src="display">
    big = None
    mz = re.search(r'<a[^>]+class="zoomable"[^>]+href="([^"]+)"', block, re.I)
    if mz and 'artfichier' in mz.group(1):
        big = mz.group(1)
    disp = None
    for mu in re.finditer(r'<img[^>]+src="([^"]+)"', block, re.I):
        u = mu.group(1)
        if not is_decor(u):
            disp = u; break
    url = disp or big
    if url:
        # normaliser : enlever un éventuel ?queryparam
        out[nom] = {'img': url, 'big': big or url}

print('blocs:', len(heads), '| avec image:', len(out))
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# échantillon
for k in list(out)[:6]:
    print(' ', k, '->', out[k]['img'][-60:])
