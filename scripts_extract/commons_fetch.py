# -*- coding: utf-8 -*-
"""Récupère une image (photo de l'ingrédient principal) depuis Wikimedia Commons
pour les recettes sans spécimen. Domaine public / licences libres."""
import sys, json, urllib.parse, urllib.request, os, time
sys.stdout.reconfigure(encoding='utf-8')

UA = 'GrimoireHerbier/1.0 (recipe app; contact: amauryidel@gmail.com)'

# terme de recherche curaté par recette (ingrédient principal, photo)
TERMS = {
    'vin-orange': 'orange fruit', 'vin-de-peche': 'peach fruit halves',
    'troussepinette': 'Prunus spinosa sloe berries', 'ratafia-cerises': 'cherries fruit',
    'creme-mure': 'blackberry fruit', 'vespetro': 'Angelica archangelica plant',
    'guignolet': 'wild cherry Prunus avium', 'eau-melisse-carmes': 'Melissa officinalis lemon balm',
    'lq-abricots-secs': 'dried apricots', 'rh-couille-singe-tagada': 'strawberries bowl',
    'rh-ananas-piment': 'pineapple fruit', 'rh-cacahuete': 'peanuts shelled',
    'rh-banane-cannelle': 'banana cinnamon', 'rh-raisin-muscat': 'muscat grapes',
    'rh-cafe-vanille': 'coffee beans vanilla', 'rh-canneberge-framboise': 'cranberries fruit',
    'rh-cassis-groseille': 'blackcurrant redcurrant', 'rh-citron-gingembre': 'lemon ginger root',
    'rh-coco-gingembre': 'coconut ginger', 'rh-des-bois': 'wild strawberries Fragaria vesca',
    'rh-douceur': 'orange clove spices', 'rh-fraise-menthe': 'strawberry mint',
    'rh-fraise-basilic': 'strawberry basil', 'rh-banane-sechee': 'dried banana',
    'rh-dattes': 'dates fruit', 'lq-liqueur-douce-de-fraises-a-la-vanille': 'strawberries vanilla',
    'lq-liqueur-de-menthe-2': 'Mentha mint leaves', 'rt-hypocras-a-la-vanille': 'vanilla pods',
}

def search(term):
    q = urllib.parse.quote(term + ' filetype:bitmap')
    url = ('https://commons.wikimedia.org/w/api.php?action=query&format=json'
           '&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=' + q +
           '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=600')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    d = json.load(urllib.request.urlopen(req, timeout=25))
    pages = list(d.get('query', {}).get('pages', {}).values())
    pages.sort(key=lambda p: p.get('index', 99))
    for p in pages:
        ii = (p.get('imageinfo') or [{}])[0]
        mime = ii.get('mime', '')
        if mime in ('image/jpeg', 'image/png') and ii.get('thumburl'):
            t = p.get('title', '')
            if any(x in t.lower() for x in ('logo', 'icon', 'map', 'flag', 'diagram')):
                continue
            return ii['thumburl'], t
    return None, None

def main():
    todo = json.load(open('scripts_extract/_data/web_todo.json', encoding='utf-8'))
    os.makedirs('images/full', exist_ok=True)
    got = {}; fail = []
    for r in todo:
        term = TERMS.get(r['id'])
        if not term:
            fail.append(r['id'] + ' (pas de terme)'); continue
        try:
            thumb, title = search(term)
            if not thumb:
                fail.append(r['id'] + ' (aucun résultat)'); continue
            req = urllib.request.Request(thumb, headers={'User-Agent': UA})
            data = urllib.request.urlopen(req, timeout=30).read()
            open('images/full/' + r['id'] + '.jpg', 'wb').write(data)
            got[r['id']] = {'term': term, 'src': title, 'url': thumb}
            print('OK  %-34s <- %-26s (%s)' % (r['id'], term, title[:40]))
        except Exception as e:
            fail.append(r['id'] + ' : ' + str(e)[:50])
        time.sleep(0.4)
    json.dump(got, open('scripts_extract/_data/web_got.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\nrécupérées:', len(got), '/ 28 | échecs:', len(fail))
    for f in fail:
        print('  ✗', f)

if __name__ == '__main__':
    main()
