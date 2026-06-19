# -*- coding: utf-8 -*-
import re, sys, json, unicodedata
sys.stdout.reconfigure(encoding='utf-8')
t = open("script.js", encoding='utf-8').read()

def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def norm(s):
    s = deaccent(s).lower()
    s = s.replace('’', "'")
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# noms dans DATA (17 patrimoniales) : champ nom: '...'
data_seg = t[t.index('const DATA'):t.index('const RECETTES_SITE')]
site_seg = t[t.index('const RECETTES_SITE'):t.index('RECETTES_SITE.forEach')]

def grab(seg):
    out = []
    for m in re.finditer(r"\bid:\s*'[^']+'\s*,\s*nom:\s*(?:'([^']*)'|\"([^\"]*)\")", seg):
        out.append(m.group(1) or m.group(2))
    return out

data_noms = grab(data_seg)
site_noms = grab(site_seg)
ids = re.findall(r"\bid:\s*'([^']+)'", site_seg)
print("DATA noms:", len(data_noms))
print("SITE noms:", len(site_noms))
res = {
    'data_noms': data_noms,
    'site_noms': site_noms,
    'site_ids': ids,
    'norm_existing': sorted(set(norm(x) for x in data_noms + site_noms)),
}
json.dump(res, open("scripts_extract/_data/existing.json", "w", encoding='utf-8'), ensure_ascii=False, indent=1)
for n in data_noms: print("  DATA:", n)
