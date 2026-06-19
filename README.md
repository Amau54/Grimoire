# Codex des Liqueurs & Hypocras

Encyclopédie web (HTML/CSS/JavaScript, sans dépendance) des recettes de liqueurs,
crèmes, ratafias, hypocras, vins apéritifs et rhums arrangés, présentée à la
manière d'un grimoire d'apothicaire ancien.

## Ouvrir

Ouvrir simplement `index.html` dans un navigateur (aucun serveur requis).

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Structure : barre supérieure, menu latéral fixe, conteneur d'application |
| `styles.css` | Direction artistique (parchemin, cuir, cuivre, or, sauge), 2 thèmes, responsive, impression |
| `script.js`  | Données des recettes + logique (recherche, filtres, fiches, favoris, calculateur, routage) |

## Fonctionnalités

- **Accueil** : couverture, recherche globale, statistiques (recettes / fruits / épices / plantes), accès aux catégories et rubriques.
- **Catégories** : Liqueurs, Crèmes, Ratafias, Hypocras, Vins apéritifs, Rhums arrangés.
- **Rubriques transversales** : historiques, médicinales, aux fruits, aux fleurs, aux épices.
- **Recherche instantanée** par nom, ingrédient, fruit, plante, épice, catégorie.
- **Filtres** par degré d'alcool (faible < 20° / moyen 20-35° / fort > 35°) et durée de macération (< 1 mois / 1-3 mois / > 3 mois).
- **Fiche recette** : en-tête + gravure, tableau d'ingrédients, étapes numérotées, chronologie (Préparation → Macération → Filtration → Vieillissement → Dégustation), encarts (histoire, propriétés, conseils, dictons), recettes associées (par ingrédients communs).
- **Calculateur de lot** : recalcule quantités, sucre et alcool pour n'importe quel volume.
- **Navigation** : menu latéral fixe, sommaire, fil d'Ariane, favoris (localStorage), recettes récemment consultées.
- **Ergonomie** : mode clair / mode grimoire sombre, responsive mobile, impression / export PDF d'une fiche.

## Ajouter ou modifier une recette

Toutes les données vivent dans le tableau `DATA` de `script.js`. Chaque entrée est
auto-documentée (voir le bloc de commentaire au-dessus de `DATA`). Ajouter un objet
au tableau suffit : la recherche, les filtres, les statistiques, les catégories et
les recettes associées se mettent à jour automatiquement.

## Note sur la source

Les recettes proviennent de `hypocras.blog4ever.com`. Les **données fonctionnelles**
de chaque recette — listes d'ingrédients, quantités, mode opératoire, durées de
macération/vieillissement et degré d'alcool — ont été relevées sur le blog d'origine,
puis normalisées dans le schéma de l'application. Les encarts narratifs (histoire,
propriétés, conseils, dictons) sont, eux, rédigés de façon synthétique et propre à
l'application.

Deux ensembles cohabitent dans `script.js` :

- le tableau `DATA` initial : une quinzaine de recettes patrimoniales détaillées
  (hypocras, vin de noix, ratafia de cerises, vespétro, génépi, crème de cassis,
  troussepinette, eau de mélisse des Carmes, etc.) ;
- le tableau `RECETTES_SITE` (format compact, étendu par `_recette()`) : les recettes
  relevées sur le blog — ~40 liqueurs/crèmes et ~64 rhums arrangés — soit **121
  recettes** au total.

### Limite connue

La page « Liqueurs et Macérations » du blog est une **page unique très longue**
(plus de 150 entrées). L'outil de récupération réseau de l'environnement convertit la
page en texte et la **tronque** : seules les liqueurs du **début de l'alphabet**
(jusqu'à « Bouillon Blanc » environ) ont pu être lues. Les liqueurs situées au-delà
ne sont, pour l'instant, pas récupérables par ce biais. La page des rhums arrangés,
plus courte, a en revanche pu être lue presque intégralement.

Pour compléter le reste des liqueurs : me coller le texte des sections manquantes, et
je les ajouterai au même format dans `RECETTES_SITE`.
