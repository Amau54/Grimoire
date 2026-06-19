# -*- coding: utf-8 -*-
"""Génère les entrées compactes RECETTES_SITE pour les recettes nouvelles."""
import sys, json, re, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

parsed = json.load(open("scripts_extract/_data/liq_parsed.json", encoding='utf-8'))
ex = json.load(open("scripts_extract/_data/existing.json", encoding='utf-8'))

def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def norm(s):
    return re.sub(r'\s+', ' ', deaccent(s).lower().replace('’', "'")).strip()
def mkey(s):
    s = re.sub(r'\([^)]*\)', '', s)  # ignorer les parenthèses pour le rapprochement
    return norm(s)

existing = set(mkey(x) for x in ex['data_noms'] + ex['site_noms'])

# --- overrides manuels (recettes anciennes au texte mêlé) ---
OVERRIDES = {
    206: {  # Hypocras aux Épices 2
        'ingredients': [
            {'qte': 75, 'unite': 'cl', 'nom': 'vin rouge (Bourgogne, peu tannique)', 'scalable': True},
            {'qte': 4, 'unite': 'g', 'nom': 'gingembre à râper', 'scalable': True},
            {'qte': 20, 'unite': 'g', 'nom': 'cannelle', 'scalable': True},
            {'qte': 0.25, 'unite': 'c. à café', 'nom': 'cardamome grise', 'scalable': True},
            {'qte': 2, 'unite': 'clous', 'nom': 'girofle', 'scalable': True},
            {'qte': 22, 'unite': 'morceaux', 'nom': 'sucre (ou équivalent en miel)', 'scalable': True},
            {'qte': 1, 'unite': 'c. à s.', 'nom': 'eau de rose', 'scalable': True},
            {'qte': 10, 'unite': 'cl', 'nom': 'alcool à 40°', 'scalable': True},
        ],
        'steps': [
            "Râper le gingembre et concasser les épices.",
            "Mélanger au vin avec le sucre (ou le miel), l'eau de rose et l'alcool.",
            "Laisser infuser à froid quelques jours en remuant.",
            "Filtrer soigneusement et mettre en bouteilles.",
        ],
        'mac': 4, 'mactxt': 'quelques jours, à froid',
    },
    232: {  # Vin aux Fraises et au Vin Rouge
        'ingredients': [
            {'qte': 800, 'unite': 'g', 'nom': 'fraises', 'scalable': True},
            {'qte': 1, 'unite': 'gousse', 'nom': 'vanille', 'scalable': True},
            {'qte': 400, 'unite': 'g', 'nom': 'sucre en poudre', 'scalable': True},
            {'qte': 50, 'unite': 'cl', 'nom': 'alcool de fruit à 40°', 'scalable': True},
            {'qte': None, 'unite': '', 'nom': 'bon vin rouge à 13° (pour compléter à 2 litres)', 'scalable': False},
        ],
    },
    191: {  # Ratafia de Semences Chaudes (1730)
        'ingredients': [
            {'qte': 60, 'unite': 'g', 'nom': 'anis', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'carvi', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'cumin', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'fenouil', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'ache (céleri) ou persil', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'ammi', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'panais sauvage', 'scalable': True},
            {'qte': 60, 'unite': 'g', 'nom': 'amome', 'scalable': True},
            {'qte': 8, 'unite': 'L', 'nom': 'eau-de-vie', 'scalable': True},
            {'qte': 180, 'unite': 'g', 'nom': "sucre (par litre d'eau-de-vie)", 'scalable': True},
        ],
        'steps': [
            "Piler 60 g de chaque graine ou semence chaude, majeure et mineure.",
            "Les mettre à infuser six semaines dans huit litres d'eau-de-vie.",
            "Ajouter par litre 180 g de sucre cassé en gros morceaux, trempés dans l'eau avant d'être jetés dans l'eau-de-vie.",
            "L'infusion achevée, passer le ratafia à la chausse quelques jours plus tard.",
            "Plus il est gardé, meilleur il devient.",
        ],
        'mac': 42, 'mactxt': 'six semaines',
    },
}

# --- helpers de mise en forme ---
STOP_TAG = re.compile(r'\b(à|au|aux|de|du|des|en|d|l|le|la|les|ou|et|pour|par|bien|tr[èe]s|gros|grosse|grosses|belle|petit|petite|frais|fra[îi]che|fra[îi]ches|sec|secs|m[ûu]rs?|m[ûu]re|m[ûu]res|non|trait[ée]s?|poudre|morceaux|fendue?|écras[ée]es?|concass[ée]es?)\b', re.I)
def make_tag(nom):
    s = nom.lower()
    s = re.sub(r'\([^)]*\)', '', s)            # retirer parenthèses
    s = re.sub(r'\b\d+[.,]?\d*\s*°?\b', '', s) # retirer nombres / degrés
    s = re.sub(r'\bà\s*\d+.*$', '', s)
    s = s.replace('’', "'")
    # garder le mot-clé principal (premier nom significatif)
    words = [w for w in re.split(r'[\s,]+', s) if w and not STOP_TAG.match(w) and len(w) > 2]
    if not words:
        return ''
    # eau-de-vie : recoller
    if words[0] in ('eau', 'eaux') and len(words) > 1 and words[1].startswith('vie'):
        return 'eau-de-vie'
    return words[0].strip("-'")

def derive_tags(ings):
    tags = []
    seen = set()
    for ing in ings:
        tg = make_tag(ing['nom'])
        for piece in [tg] if tg else []:
            k = norm(piece)
            if piece and k not in seen and len(k) > 2:
                seen.add(k); tags.append(piece)
    return tags[:10]

CAT_LOT = {'liqueurs': 2.6, 'cremes': 3.0, 'ratafias': 2.6, 'hypocras': 1.5, 'vins': 4.5}
def estimate_lot(ings, cat):
    vol = 0.0
    for ing in ings:
        q = ing['qte']
        if not isinstance(q, (int, float)):
            continue
        u = ing['unite']
        if u == 'L': vol += q
        elif u == 'cl': vol += q / 100
        elif u == 'ml': vol += q / 1000
    vol = round(vol + 0.3, 1)  # +sirop/sucre dissous
    return vol if vol >= 1 else CAT_LOT[cat]

def add_hist_theme(name, themes):
    if re.search(r'\b1[0-9]{3}\b|XV|XVI|XVII|XVIII|XIX|ancien|antan|moyen', name, re.I):
        if 'historiques' not in themes:
            themes = themes + ['historiques']
    return themes

# --- sélection ---
new = [o for o in parsed if mkey(o['name']) not in existing]
for o in new:
    ov = OVERRIDES.get(o['idx'])
    if ov:
        o.update(ov)

# --- sérialisation JS ---
def js(s):
    s = str(s)
    if "'" not in s:
        return "'" + s + "'"
    if '"' not in s:
        return '"' + s + '"'
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

def emit(o):
    name = o['name']
    cat = o['cat']
    ings = o['ingredients']
    themes = add_hist_theme(name, o['themes'])
    tags = derive_tags(ings)
    lot = estimate_lot(ings, cat)
    L = []
    L.append("  { id:%s, nom:%s, cat:%s, themes:[%s], gravure:%s, degre:%d, mac:%d, macTxt:%s, lot:%s," % (
        js(o['id']), js(name), js(cat), ', '.join(js(t) for t in themes), js(o['gravure']),
        o['degre'], o['mac'], js(o['mactxt'] or (str(o['mac']) + ' jours' if o['mac'] else '—')), lot))
    L.append("    tags:[%s]," % ', '.join(js(t) for t in tags))
    ing_strs = []
    for ing in ings:
        q = ing['qte']
        qv = 'null' if q is None else (str(int(q)) if isinstance(q, float) and q == int(q) else str(q))
        parts = [qv, js(ing['unite']), js(ing['nom'])]
        if ing.get('scalable') is False:
            parts.append('false')
        ing_strs.append('[' + ',' .join(parts) + ']')
    L.append("    ing:[%s]," % ','.join(ing_strs))
    steps = ', '.join(js(s) for s in o['steps'])
    L.append("    prep:[%s] }," % steps)
    return '\n'.join(L)

out = '\n\n'.join(emit(o) for o in new)
open("scripts_extract/_data/generated.js", "w", encoding='utf-8').write(out)
print("généré:", len(new), "recettes ->", "scripts_extract/_data/generated.js")
from collections import Counter
print("by cat:", dict(Counter(o['cat'] for o in new)))
