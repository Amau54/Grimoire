# Pipeline d'extraction — hypocras.blog4ever.com

Outils ayant servi à récupérer **intégralement** les recettes du blog d'origine et à
les intégrer dans `RECETTES_SITE` (script.js), sans troncature.

Le blocage précédent venait du convertisseur texte de l'environnement réseau, qui
tronquait la page « Liqueurs et Macérations » (~150 recettes) au début de l'alphabet.
En local, on télécharge le **HTML brut** (`curl`) — aucune troncature — puis on parse.

## Étapes

```bash
# 1) Télécharger le HTML brut (déjà fait ; pages dans _data/, non versionnées)
#    curl -L https://hypocras.blog4ever.com/articles/liqueurs-et-macerations -o _data/liq.html

# 2) Segmenter en blocs-recettes (titre + paragraphes)
python3 seg.py _data/liq.html _data/liq_blocks.json

# 3) Parser : ingrédients structurés, étapes, macération, degré, thèmes, gravure
python3 parse.py _data/liq_blocks.json - _data/liq_parsed.json

# 4) Lister les recettes déjà présentes (DATA + RECETTES_SITE) pour dédoublonner
python3 existing.py

# 5) Auditer la qualité d'extraction (anomalies)
python3 qa.py

# 6) Générer les entrées compactes au format RECETTES_SITE (overrides manuels inclus)
python3 generate.py            # -> _data/generated.js

# 7) Intégration dans script.js : insertion avant la fermeture du tableau
#    (réalisée une fois ; voir l'historique git)

# 8) Validation
node validate.js               # comptes, IDs uniques, champs valides
node smoke.js                  # init() + rendu des routes sans erreur
```

## Principe de fidélité

Le parser **tranche** uniquement le texte source (ingrédients, quantités, méthode,
durées, degré). Il n'invente aucune donnée chiffrée. Les encarts narratifs
(histoire/propriétés/conseils/dicton) restent `null` — ils sont rédigés à part par
l'app, comme pour le premier lot de recettes du site.

Le dossier `_data/` (HTML brut + JSON intermédiaires) n'est pas versionné.
