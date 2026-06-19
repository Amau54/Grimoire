# -*- coding: utf-8 -*-
import re, sys, json
sys.stdout.reconfigure(encoding='utf-8')
recs = json.load(open(sys.argv[1], encoding='utf-8'))

def find_ing(paras):
    for p in paras:
        if re.match(r'\s*ingr[ée]dients?\s*[:?]', p, re.I):
            return p
    return None

def find_degre(paras):
    for p in paras:
        m = re.search(r'(?:titre|degr[ée]|pr[ée]paration)\D{0,30}?[≈~=]?\s*(\d{1,2})\s*°', p, re.I)
        if m and ('degr' in p.lower() or 'titre' in p.lower()):
            return int(m.group(1))
    # fallback any X°
    for p in paras:
        m = re.search(r'[≈~]\s*(\d{1,2})\s*°', p)
        if m: return int(m.group(1))
    return None

n_ing = n_deg = 0
no_ing = []
for i, r in enumerate(recs[1:], start=1):  # skip Modération
    paras = r['paras']
    ing = find_ing(paras)
    deg = find_degre(paras)
    if ing: n_ing += 1
    else: no_ing.append((i, r['name']))
    if deg: n_deg += 1

print("total (excl. Moderation):", len(recs)-1)
print("with Ingredients label:", n_ing)
print("with degre:", n_deg)
print("\n--- WITHOUT Ingredients label (%d) ---" % len(no_ing))
for i, nm in no_ing:
    print(i, "|", nm)
