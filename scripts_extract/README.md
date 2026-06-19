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

## Notes du grimoire (encarts narratifs)

Les encarts `histoire / proprietes / conseils / dicton` des recettes du site ont
été rédigés en éventail (un agent par tranche de recettes), ancrés dans la culture
botanique/historique réelle de l'ingrédient principal, avec mises en garde pour les
plantes toxiques. Résultat fusionné dans `../notes.js` (`const NOTES_SITE`), chargé
avant `script.js` et injecté par `_recette` via `NOTES_SITE[o.id]`.

- `dump_for_notes.js` : liste les recettes sans notes -> `_data/notes_todo.json`.
- `_data/notes_out/` : lots JSON produits (gitignoré) ; fusionnés dans `notes.js`.

## Fonctionnalités & design

- `feature_logic.js` : prototype + tests des deux moteurs (recalcul de lot « intelligent »
  qui met aussi à l'échelle les quantités glissées dans les phrases ; recherche pondérée
  par ingrédient, insensible aux accents, ET strict). Intégrés dans `script.js`.
- Design « planche d'herbier enluminé » : exploration de 5 directions + jury, gagnant
  `_data/design_candidates/cand_2_planche-herbier.html`. Système repris dans `../styles.css`
  (+ `../styles-extra.css` pour le frontispice et les extras de fiche).

## Planches botaniques (images du blog)

Le blog illustre la plupart des recettes par d'authentiques **planches botaniques
anciennes** (style Redouté, fond ivoire, binôme latin) — parfaitement raccord avec
l'esthétique herbier. Elles sont récupérées, recadrées (max 360 px) et optimisées
(JPEG q82, 35 → 7 Mo) dans `../images/<id>.jpg`, mappées dans `../images.js`
(`IMAGES_SITE`). `script.js` attache `r.image` à chaque recette.

- `images.py` : mappe nom de recette → URL d'image (écarte les images décoratives
  répétées) -> `_data/img_liq.json`, puis jointure noms→ids.
- Rendu : planche en héros de fiche + vignette sur les cartes, fondues au parchemin
  par `mix-blend-mode: multiply` + léger sépia (cf. `../styles-extra.css`).
- Couverture : 291/368 (liqueurs, crèmes, ratafias, hypocras, vins). Les rhums et
  quelques recettes hors-blog gardent la gravure SVG en repli (la page rhum n'expose
  pas de mapping image fiable en HTML statique).

## Spécimens complétés & « photos collées »

Toutes les recettes (368/368) ont désormais un spécimen photographique, affiché
COMPLET (non détouré) comme une photographie collée sur la page (marge blanche de
tirage + bandelettes + ombre + légère rotation), via `images/<id>.jpg`.

- Images existantes : tirage complet réutilisé.
- Rhums : 49 vraies photos des préparations extraites de la page rhum du blog
  (segmentation par recette, `commons_fetch.py` non concerné) ; appariement exact.
- Compléments web (28) : Wikimedia Commons (photos d'ingrédients, licences libres),
  `commons_fetch.py` + termes curatés ; planche-contact pour contrôle visuel.
