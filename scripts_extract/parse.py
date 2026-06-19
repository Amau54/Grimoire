# -*- coding: utf-8 -*-
"""Parse blocs de recettes -> entrées au format compact RECETTES_SITE.
Ne fabrique aucune donnée : tout est tranché du texte source du blog."""
import re, sys, json, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

# ---------- helpers texte ----------
def deaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def slug(s):
    s = deaccent(s).lower()
    s = s.replace("'", ' ').replace('’', ' ').replace('"', ' ')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    s = re.sub(r'-+', '-', s)
    return s

NUM_WORDS = {
    'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6,
    'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10, 'onze': 11, 'douze': 12,
    'treize': 13, 'quatorze': 14, 'quinze': 15, 'seize': 16, 'vingt': 20,
    'trente': 30, 'quarante': 40, 'cinquante': 50, 'demi': 0.5, 'demie': 0.5,
}

# unité canonique -> (regex de détection)
UNIT_MAP = [
    ('L', r'litres?\b|^l$'),
    ('cl', r'cl\b|centilitres?'),
    ('ml', r'ml\b|millilitres?'),
    ('kg', r'kg\b|kilos?\b|kilogrammes?'),
    ('g', r'grammes?\b|gr?\b|g\b'),
    ('c. à s.', r'cuill[eè]re?s?\s+[àa]\s+soupe|c\.?\s*[àa]?\s*s\.?\b|cuill[eè]r[ée]es?\s+[àa]\s+soupe'),
    ('c. à café', r'cuill[eè]re?s?\s+[àa]\s+caf[ée]|c\.?\s*[àa]?\s*c\.?\b|cuill[eè]r[ée]es?\s+[àa]\s+caf[ée]'),
    ('gousses', r'gousses?'),
    ('clous', r'clous?\b'),
    ('pincées', r'pinc[ée]es?'),
    ('pointe', r'pointes?'),
    ('bâton', r'b[âa]tons?'),
    ('branches', r'branches?'),
    ('feuilles', r'feuilles?'),
    ('fleurs', r'fleurs?'),
    ('bouquet', r'bouquets?'),
    ('verre', r'verres?'),
    ('poignée', r'poign[ée]es?'),
    ('sachet', r'sachets?'),
    ('brins', r'brins?'),
    ('zeste', r'zestes?'),
    ('gouttes', r'gouttes?'),
    ('tranches', r'tranches?'),
    ('bouteille', r'bouteilles?'),
    ('tête', r't[êe]tes?'),
    ('morceau', r'morceaux?|morceau'),
    ('pinte', r'pintes?'),
    ('livre', r'livres?'),
    ('once', r'onces?'),
    ('gros', r'gros\b'),
    ('pied', r'pieds?'),
    ('grains', r'grains?\b'),
    ('graines', r'graines?\b'),
]
NON_SCALABLE_UNITS = {'pincées', 'pointe', 'gouttes', 'brins'}

def parse_qty(tok):
    tok = tok.replace(',', '.')
    m = re.match(r'^(\d+(?:\.\d+)?)/(\d+)$', tok)
    if m:
        return float(m.group(1)) / float(m.group(2))
    m = re.match(r'^(\d+)\.(\d{3})$', tok)  # 1.250 kg style (millier)
    if m:
        return float(m.group(1) + m.group(2)) / 1000 if False else float(tok)
    if re.match(r'^\d+(?:\.\d+)?$', tok):
        f = float(tok)
        return int(f) if f == int(f) else f
    w = deaccent(tok.lower())
    if w in {deaccent(k): v for k, v in NUM_WORDS.items()}:
        return {deaccent(k): v for k, v in NUM_WORDS.items()}[w]
    return None

def detect_unit(words):
    """words: liste de tokens restants. Retourne (unite, n_consommés) ou (None,0)."""
    if not words:
        return None, 0
    w1 = deaccent(words[0].lower()).strip('.')
    # deux mots (cuillère à soupe)
    joined3 = deaccent(' '.join(words[:3]).lower())
    for canon, pat in UNIT_MAP:
        if re.match(r'^(?:' + pat + r')$', joined3):
            return canon, 3
    joined2 = deaccent(' '.join(words[:2]).lower())
    for canon, pat in UNIT_MAP:
        if re.match(r'^(?:' + pat + r')$', joined2):
            return canon, 2
    for canon, pat in UNIT_MAP:
        if re.match(r'^(?:' + pat + r')$', w1):
            return canon, 1
    return None, 0

def clean_name(name):
    name = name.strip(' .;')
    # couper à une frontière de phrase (point + majuscule) sans casser « c. à c. »
    name = re.split(r'(?<=[a-zàâäéèêëïîôöùûüç0-9°)])\.\s+(?=[A-ZÉÈÀ][a-zàâ])', name)[0]
    name = re.sub(r"^(?:de\s+la\s+|de\s+l['’]|du\s+|des\s+|de\s+|d['’]|à\s+|au\s+|aux\s+|en\s+)", '', name, flags=re.I)
    name = re.sub(r'\s+', ' ', name).strip(' .;,')
    return name

SINGULAR = {'gousses': 'gousse', 'clous': 'clou', 'feuilles': 'feuille', 'fleurs': 'fleur',
            'branches': 'branche', 'tranches': 'tranche', 'pincées': 'pincée', 'gouttes': 'goutte',
            'brins': 'brin', 'morceaux': 'morceau', 'graines': 'graine', 'grains': 'grain', 'pièces': 'pièce'}

def parse_ingredient(item):
    item = item.strip(' .;,')
    if not item:
        return None
    # décoller un nombre collé à une unité : 1L, 75cl, 1kg, 250g
    item = re.sub(r'\b(\d+(?:[.,]\d+)?)\s*(litres?|cl|ml|kg|gr|g|l)\b', r'\1 \2', item, flags=re.I)
    toks = item.split()
    qte = parse_qty(toks[0])
    if qte is None:
        # pas de quantité -> ingrédient non chiffré
        return {'qte': None, 'unite': '', 'nom': clean_name(item) or item}
    rest = toks[1:]
    unite, n = detect_unit(rest)
    if unite:
        nom = ' '.join(rest[n:])
        nom = clean_name(nom)
        scal = unite not in NON_SCALABLE_UNITS
        if qte == 1 and unite in SINGULAR:
            unite = SINGULAR[unite]
    else:
        # nombre + nom dénombrable -> pièces
        unite = 'pièces' if qte != 1 else 'pièce'
        nom = clean_name(' '.join(rest))
        scal = True
    if not nom:
        return None
    return {'qte': qte, 'unite': unite, 'nom': nom, 'scalable': scal}

EMB_UNITS = (r'litres?|cl|ml|kg|gr|grammes?|gousses?|clous?|b[âa]tons?|feuilles?|fleurs?|'
             r'pinc[ée]es?|cuiller\w*|verres?|bouquets?|poign[ée]es?|brins?|bouteilles?|'
             r'tranches?|sachets?|gouttes?|pintes?|livres?|onces?|g\b')
EMB_SPLIT = re.compile(r'(?<=[a-zàâäéèêëïîôöùûüç)])\s+(?=\d+(?:[.,]\d+)?\s+(?:' + EMB_UNITS + r')\b)', re.I)

def split_ingredients(text):
    # retirer label (: ? ;)
    text = re.sub(r'^\s*ingr[ée]dients?\s*[:?;]\s*', '', text, flags=re.I).strip()
    # le « : » sert souvent de séparateur d'ingrédients sur le blog
    text = re.sub(r'\s*:\s*', ', ', text)
    text = text.rstrip(' .,')
    # protéger parenthèses ; ne pas couper sur une virgule décimale (chiffre,chiffre)
    parts = []
    buf = ''
    depth = 0
    for k, ch in enumerate(text):
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth = max(0, depth - 1)
        prev = text[k-1] if k > 0 else ''
        nxt = text[k+1] if k+1 < len(text) else ''
        is_decimal = ch == ',' and prev.isdigit() and nxt.isdigit()
        if ch in ',;' and depth == 0 and not is_decimal:
            parts.append(buf); buf = ''
        else:
            buf += ch
    if buf.strip():
        parts.append(buf)
    # éclater " et <nombre+unité> " et les ingrédients collés sans virgule
    out = []
    for p in parts:
        p = p.strip()
        m = re.match(r'^(.*\S)\s+et\s+(\d.+)$', p)
        chunk = [m.group(1), m.group(2)] if m else [p]
        for c in chunk:
            for piece in EMB_SPLIT.split(c):
                if piece.strip():
                    out.append(piece.strip())
    return [x for x in out if x.strip()]

STEP_VERBS = (r'Laisser|Laissez|Ajouter|Ajoutez|Filtrer|Filtrez|Mettre|Mettez|Verser|Versez|'
              r'Remuer|Remuez|Attendre|Attendez|Passer|Passez|Pr[ée]parer|Préparez|Faire|Faites|'
              r'Couper|Coupez|M[ée]langer|Mélangez|Fendre|Briser|[ÉE]goutter|Embouteiller|Patienter|'
              r'Patientez|Rebouch\w+|Fermer|Fermez|Placer|Placez|Entreposer|Entreposez|Au bout|'
              r'Boucher|Bouchez|Presser|Pressez|Broyer|Broyez|Chauffer|Servir|Dissoudre|Concasser|'
              r'Conserver|D[ée]canter|Recouvrir|Incorporer|Secouer|Secouez|Cuire|Porter')

def split_steps(text):
    text = re.sub(r'^\s*pr[ée]paration\s*[.:?;]?\s*', '', text, flags=re.I).strip()
    text = text.replace('?', '.')
    raw = re.split(r'(?<=[.!])\s+(?=[A-ZÉÀÇ])', text)
    steps = []
    for s in raw:
        s = re.sub(r'\s*:\s*$', '', s.strip(' .;'))
        if len(s) <= 2:
            continue
        # 2e passe : re-découper les run-ons (source sans ponctuation)
        if len(s) > 150:
            parts = re.split(r'\s+(?=(?:' + STEP_VERBS + r')\b)', s)
            for p in parts:
                p = p.strip(' .;')
                if len(p) > 2:
                    steps.append(p + ('.' if not p.endswith('.') else ''))
        else:
            steps.append(s + ('.' if not s.endswith('.') else ''))
    return steps

DUR_RE = re.compile(r'(\d+(?:[.,]\d+)?|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|douze|quinze|vingt|trente|quarante)\s*(?:à\s*\d+\s*)?(ans?|mois|semaines?|jours?|heures?|h\b|nuits?)', re.I)
DUR_DAYS = {'an': 365, 'ans': 365, 'mois': 30, 'semaine': 7, 'semaines': 7, 'jour': 1, 'jours': 1, 'heure': 1/24, 'heures': 1/24, 'h': 1/24, 'nuit': 1, 'nuits': 1}

def parse_maceration(prep_text):
    """cherche la plus longue durée associée à macér/infus/repos."""
    best = None; besttxt = None
    for m in re.finditer(r'(mac[ée]r\w*|infus\w*|repos\w*|laisser?\w*|attendre)[^.]{0,60}', prep_text, re.I):
        seg = m.group(0)
        dm = DUR_RE.search(seg)
        if dm:
            q = parse_qty(dm.group(1)) or 0
            unit = deaccent(dm.group(2).lower())
            days = q * DUR_DAYS.get(unit, 1)
            if best is None or days > best:
                best = days; besttxt = dm.group(0).strip()
    if best is None:
        # toute durée dans le texte
        dm = DUR_RE.search(prep_text)
        if dm:
            q = parse_qty(dm.group(1)) or 0
            unit = deaccent(dm.group(2).lower())
            best = q * DUR_DAYS.get(unit, 1); besttxt = dm.group(0).strip()
    if best is None:
        return 0, None
    return int(round(best)), besttxt

STRONG_NARR = re.compile(
    r'^\s*(?:'
    r'(?:une\s+|la\s+)?petite\s+histoire|quelques?\s+(?:id[ée]es?|recettes?)|id[ée]es?\s+recette|'
    r'propri[ée]t[ée]s?\b|les?\s+propri[ée]t[ée]s?|citation|proverbe|dicton|anecdote|'
    r'ce\s+qu[e\']|le\s+saviez|retour\s+haut\s+de\s+page|retour\s+en\s+haut|aller\s+directement|'
    r'les\s+liqueurs\s+et\s+mac[ée]rations|histoire\b|le\s+(?:cassis|caf[ée]|cacao|miel|sureau|coing|'
    r'geni[èe]vre|noyau|romarin|thym|laurier)\b'
    r')', re.I)
NAV_JUNK = re.compile(r'^\s*(?:retour\s+(?:haut|en\s+haut)|aller\s+directement|les\s+liqueurs\s+et\s+mac|inscription|connexion)', re.I)

# unités acceptées dans la prose ancienne
PROSE_UNIT = r'litres?|pintes?|livres?|onces?|gros|grammes?|gr|kg|cl|ml|chopines?|verres?|cuiller[ée]es?|poign[ée]es?|bouteilles?|setiers?'
PROSE_NUM = r'\d+(?:[.,]\d+)?|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|quinze|vingt|trente'
PROSE_ING_RE = re.compile(r'\b(' + PROSE_NUM + r')\s+(' + PROSE_UNIT + r')\b(?:\s+et\s+demie?)?\s+(?:de\s+|d[\'’]|du\s+|des\s+)?([a-zàâäéèêëïîôöùûüç][\w\'’àâäéèêëïîôöùûüç -]{2,40})', re.I)

def extract_prose_ingredients(text):
    seen = set(); out = []
    for m in PROSE_ING_RE.finditer(text):
        q = parse_qty(m.group(1).replace(',', '.')) or m.group(1)
        unit = m.group(2).lower()
        unit = {'litre': 'L', 'litres': 'L', 'gramme': 'g', 'grammes': 'g', 'gr': 'g'}.get(unit, unit)
        name = clean_name(re.sub(r'\s+(avec|que|pour|dans|et|puis|ensuite|à|au|que vous).*$', '', m.group(3), flags=re.I))
        key = name.lower()
        if not name or key in seen or len(name) < 3:
            continue
        seen.add(key)
        out.append({'qte': q if isinstance(q, (int, float)) else None, 'unite': unit, 'nom': name, 'scalable': True})
        if len(out) >= 10:
            break
    return out

def find_para(paras, *prefixes):
    for p in paras:
        for pre in prefixes:
            if re.match(r'\s*' + pre, p, re.I):
                return p
    return None

def parse_degre(paras):
    for p in paras:
        if re.search(r'degr[ée]|titre', p, re.I):
            m = re.search(r'[≈~=]?\s*(\d{1,2})\s*°', p)
            if m:
                return int(m.group(1))
    for p in paras:
        m = re.search(r'[≈~]\s*(\d{1,2})\s*°', p)
        if m: return int(m.group(1))
    return None

# ---------- thèmes & gravure ----------
FRUITS = ['abricot','ananas','banane','cassis','cerise','citron','orange','pomme','poire','prune','prunelle','raisin','framboise','fraise','mûre','myrtille','groseille','figue','coing','pêche','kaki','melon','mandarine','clémentine','noix','noisette','châtaigne','amande','noyau','coco','kiwi','litchi','grenade','nèfle','cynorrhodon','mirabelle','brugnon','mangue','pamplemousse','arbouse','datte','cédrat','guigne']
FLEURS = ['fleur','rose','violette','acacia','sureau','aubépine','primevère','coquelicot','jasmin','magnolia','tournesol','œillet','oeillet','jonquille','capucine','tilleul','chèvrefeuille','bleuet','genêt','camomille','pissenlit','bruyère']
EPICES = ['cannelle','vanille','girofle','muscade','cardamome','safran','anis','badiane','genièvre','poivre','gingembre','carvi','cumin','coriandre','réglisse','curaçao','macis','fenouil']
PLANTES = ['menthe','mélisse','romarin','sauge','thym','laurier','basilic','verveine','estragon','hysope','angélique','absinthe','génépi','millepertuis','achillée','aspérule','eucalyptus','citronnelle','céleri','artichaut','laitue','cerfeuil','aneth','chicorée','quinquina','gentiane','prêle','cresson','persil','impératoire','sapin','bourgeon','myrte','reine des prés','bouillon blanc']
RACINES = ['racine','chêne','écorce','betterave','chicorée','bouleau','réglisse','gentiane']
MEDIC = ['médicinal','digest','cordial','tonique','fébrile','vapeurs','remède','sommeil','vertu','propriété','fortifiant','stomac']

def infer(name, tags_txt, cat):
    low = deaccent((name + ' ' + tags_txt).lower())
    themes = []
    def has(words):
        return any(deaccent(w) in low for w in words)
    is_fruit = has(FRUITS); is_fleur = has(FLEURS); is_epice = has(EPICES); is_plante = has(PLANTES); is_racine = has(RACINES)
    if is_fruit: themes.append('fruits')
    if is_fleur: themes.append('fleurs')
    if is_epice: themes.append('epices')
    if is_plante and 'plantes' not in themes: themes.append('plantes')
    # gravure
    if is_fruit: grav = 'fruit'
    elif is_fleur: grav = 'fleur'
    elif is_racine: grav = 'racine'
    elif is_epice: grav = 'epice'
    else: grav = 'plante'
    return themes, grav

CAT_DEFAULT_DEG = {'liqueurs': 35, 'cremes': 25, 'ratafias': 24, 'hypocras': 16, 'vins': 18}
CAT_PREFIX = {'liqueurs': 'lq', 'cremes': 'cr', 'ratafias': 'rt', 'hypocras': 'hy', 'vins': 'vn'}

def categorize(idx, name):
    # bornes d'après l'ordre du sommaire de la page
    if 146 <= idx <= 166 or name.lower().startswith(('crème','cremino','crémino')):
        return 'cremes'
    if 167 <= idx <= 198 or name.lower().startswith('ratafia'):
        return 'ratafias'
    if 199 <= idx <= 216 or name.lower().startswith('hypocras'):
        return 'hypocras'
    if idx >= 217 or re.match(r'^(vin|vermouth|jus)\b', name, re.I):
        return 'vins'
    return 'liqueurs'

def main():
    recs = json.load(open(sys.argv[1], encoding='utf-8'))
    existing = set(json.load(open(sys.argv[2], encoding='utf-8'))) if len(sys.argv) > 2 and sys.argv[2] not in ('-','') else set()
    out = []
    for idx, r in enumerate(recs):
        name = r['name']
        if idx == 0 or name.lower() in ('modération','moderation','inscription au blog','connexion au blog'):
            continue
        paras = r['paras']
        cat = categorize(idx, name)
        # indices repères
        ing_idx = preplabel_idx = degre_idx = None
        for k, p in enumerate(paras):
            if ing_idx is None and re.match(r'\s*ingr[ée]dients?\s*[:?;]', p, re.I):
                ing_idx = k
            if preplabel_idx is None and re.match(r'\s*pr[ée]par(?:ation|er|ez)\b', p, re.I):
                preplabel_idx = k
            if degre_idx is None and re.search(r'(degr[ée]|titre)\D{0,30}\d{1,2}\s*°', p, re.I):
                degre_idx = k
        degre = parse_degre(paras) or CAT_DEFAULT_DEG[cat]
        ingredients = []
        if ing_idx is not None:
            # étendue du texte d'ingrédients : du label jusqu'à prép / degré / narratif
            end_ing = len(paras)
            for cand in (preplabel_idx, degre_idx):
                if cand is not None and cand > ing_idx:
                    end_ing = min(end_ing, cand)
            for k in range(ing_idx + 1, end_ing):
                if STRONG_NARR.match(paras[k]):
                    end_ing = k; break
            ing_text = ' '.join(paras[ing_idx:end_ing])
            # couper si la préparation est collée inline (« … eau. Préparation Faire … »)
            ing_text = re.split(r'\bpr[ée]paration\b', ing_text, maxsplit=1, flags=re.I)[0]
            for it in split_ingredients(ing_text):
                pi = parse_ingredient(it)
                if pi: ingredients.append(pi)
        # début du bloc préparation
        if ing_idx is not None:
            pstart = preplabel_idx if (preplabel_idx is not None and preplabel_idx > ing_idx) else ing_idx + 1
        else:  # recette en prose : démarrer au label Préparation explicite, sinon au 1er paragraphe
            pstart = preplabel_idx if preplabel_idx is not None else 0
        # premier marqueur narratif fort >= pstart
        narr_idx = None
        for k in range(pstart, len(paras)):
            if STRONG_NARR.match(paras[k]):
                narr_idx = k; break
        stop = min([x for x in (degre_idx, narr_idx) if x is not None and x > pstart], default=len(paras))
        prep_block = ' '.join(paras[pstart:stop]).strip()
        steps = [s for s in split_steps(prep_block) if not NAV_JUNK.match(s)]
        mac, mactxt = parse_maceration(prep_block)
        # ingrédients depuis la prose si aucun label
        if not ingredients and prep_block:
            ingredients = extract_prose_ingredients(prep_block)
        tags_txt = ' '.join(i['nom'] for i in ingredients)
        themes, grav = infer(name, tags_txt, cat)
        out.append({
            'idx': idx, 'name': name, 'cat': cat, 'id': CAT_PREFIX[cat] + '-' + slug(name),
            'degre': degre, 'mac': mac, 'mactxt': mactxt,
            'themes': themes, 'gravure': grav,
            'ingredients': ingredients, 'steps': steps,
            'has_ing_label': ing_idx is not None, 'n_ing': len(ingredients), 'n_steps': len(steps),
        })
    json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # rapport
    from collections import Counter
    print('parsed:', len(out))
    print('by cat:', dict(Counter(o['cat'] for o in out)))
    print('empty ingredients:', sum(1 for o in out if o['n_ing'] == 0))
    print('empty steps:', sum(1 for o in out if o['n_steps'] == 0))

if __name__ == '__main__':
    main()
