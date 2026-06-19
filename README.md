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

L'intention initiale était de reprendre verbatim le contenu de
`hypocras.blog4ever.com/recettes-de-liqueurs-et-macerations`. Dans l'environnement
d'exécution utilisé, l'accès réseau à ce site (et à ses miroirs/archives) est bloqué
par la politique d'« allowlist » ; il n'a donc pas pu être copié intégralement.

Le grimoire a été constitué avec un corpus de recettes traditionnelles authentiques
(hypocras, vin de noix, ratafia de cerises, vespétro, génépi, crème de cassis,
troussepinette, eau de mélisse des Carmes, etc.) couvrant toutes les catégories
demandées. La structure de données est prévue pour intégrer facilement le contenu
exact du site une fois celui-ci accessible (ajout du domaine à l'allowlist, ou
copie du texte).
