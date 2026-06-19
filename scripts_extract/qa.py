# -*- coding: utf-8 -*-
import sys, json, re, unicodedata
sys.stdout.reconfigure(encoding='utf-8')
parsed = json.load(open("scripts_extract/_data/liq_parsed.json", encoding='utf-8'))
ex = json.load(open("scripts_extract/_data/existing.json", encoding='utf-8'))

def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def norm(s):
    return re.sub(r'\s+', ' ', deaccent(s).lower().replace('’', "'")).strip()

existing = set(ex['norm_existing'])
new = [o for o in parsed if norm(o['name']) not in existing]
skip = [o for o in parsed if norm(o['name']) in existing]
print("parsed:", len(parsed), "| NEW:", len(new), "| skip (déjà présents):", len(skip))
print("skip names:", [o['name'] for o in skip][:60])

print("\n--- anomalies sur NEW ---")
flag = 0
for o in new:
    issues = []
    if o['n_ing'] == 0:
        issues.append("0 ingrédient")
    if o['n_steps'] == 0:
        issues.append("0 étape")
    for ing in o['ingredients']:
        q = ing['qte']
        if isinstance(q, (int, float)):
            if q > 1900 and q < 2100:
                issues.append(f"qte=année? {q} ({ing['nom'][:20]})")
            if q > 5000:
                issues.append(f"qte énorme {q} ({ing['nom'][:20]})")
        if len(ing['nom']) > 45:
            issues.append(f"nom long: {ing['nom'][:50]}")
        if ing['unite'] == '' and q is not None:
            issues.append(f"unité vide qte={q} ({ing['nom'][:20]})")
    if issues:
        flag += 1
        print(f"[{o['idx']}] {o['name']}: " + "; ".join(issues))
print("\nNEW avec anomalies:", flag, "/", len(new))

# distribution catégories des NEW
from collections import Counter
print("NEW by cat:", dict(Counter(o['cat'] for o in new)))
# slug collisions
ids = [o['cat'][:2] for o in new]
slugs = Counter(o['id'] for o in new)
dups = {k: v for k, v in slugs.items() if v > 1}
print("slug collisions:", dups)
json.dump({'new_idx': [o['idx'] for o in new]}, open("scripts_extract/_data/new_idx.json", "w", encoding='utf-8'))
