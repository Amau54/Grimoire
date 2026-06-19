/* =====================================================================
   CODEX DES LIQUEURS & HYPOCRAS
   ---------------------------------------------------------------------
   Application monopage (vanilla JS, sans dépendance) :
   - base de recettes (constante DATA)
   - moteur de recherche & filtres instantanés
   - routage par ancre (#/...), fiches recettes, favoris, récents
   - calculateur de lot, mode clair / grimoire sombre, impression / PDF
   ===================================================================== */

'use strict';

/* ---------------------------------------------------------------------
   1. CATÉGORIES PRINCIPALES
   Chaque recette possède UNE catégorie principale (categorie) et des
   étiquettes thématiques (themes) permettant de la retrouver dans les
   rubriques transversales (historiques, médicinales, fruits, fleurs…).
--------------------------------------------------------------------- */
const CATEGORIES = [
  { id: 'liqueurs',   nom: 'Liqueurs',            icone: '🍶', desc: "Élixirs sucrés obtenus par macération ou infusion d'alcool." },
  { id: 'cremes',     nom: 'Crèmes',              icone: '🫖', desc: "Liqueurs onctueuses et très sucrées, riches en fruits." },
  { id: 'ratafias',   nom: 'Ratafias',            icone: '🍷', desc: "Macérations de fruits dans l'eau-de-vie, sucrées après coup." },
  { id: 'hypocras',   nom: 'Hypocras',            icone: '⚗️', desc: "Vins épicés et miellés hérités du Moyen Âge." },
  { id: 'vins',       nom: 'Vins apéritifs',      icone: '🍇', desc: "Vins aromatisés de fruits, feuilles ou épices." },
  { id: 'rhums',      nom: 'Rhums arrangés',      icone: '🥃', desc: "Rhums parfumés aux fruits et épices des îles." }
];

/* Rubriques transversales (thèmes) affichées comme catégories d'accès. */
const THEMES = [
  { id: 'historiques', nom: 'Recettes historiques', icone: '📜' },
  { id: 'medicinales', nom: 'Recettes médicinales', icone: '⚕️' },
  { id: 'fruits',      nom: 'Recettes aux fruits',  icone: '🍒' },
  { id: 'fleurs',      nom: 'Recettes aux fleurs',  icone: '🌸' },
  { id: 'epices',      nom: 'Recettes aux épices',  icone: '🌿' }
];

/* ---------------------------------------------------------------------
   2. BASE DE RECETTES
   Champs :
   - id            : identifiant unique (slug)
   - nom           : intitulé
   - categorie     : id de catégorie principale
   - themes        : étiquettes transversales
   - gravure       : motif de gravure botanique (clé SVG : fruit/fleur/epice/plante/racine)
   - degre         : degré alcoolique final approximatif (°)
   - macerationJours : durée de macération en jours (pour le filtre)
   - lot           : volume de référence du lot fini (litres) -> calculateur
   - ingredients   : [{ qte, unite, nom, scalable }]  qte=null si non chiffré
   - tags          : mots-clés d'ingrédients (recherche & recettes associées)
   - preparation   : étapes numérotées
   - timeline      : [{ phase, duree }]
   - histoire / proprietes / conseils : encarts (texte libre, peut être null)
   - dicton        : proverbe ou dicton (peut être null)
--------------------------------------------------------------------- */
const DATA = [
  {
    id: 'hypocras-rouge',
    nom: 'Hypocras Rouge',
    categorie: 'hypocras',
    themes: ['historiques', 'epices'],
    gravure: 'epice',
    degre: 12,
    macerationJours: 2,
    lot: 1,
    tags: ['vin rouge', 'cannelle', 'gingembre', 'girofle', 'cardamome', 'muscade', 'miel', 'sucre', 'eau de rose'],
    ingredients: [
      { qte: 1,   unite: 'L',      nom: 'vin rouge corsé', scalable: true },
      { qte: 150, unite: 'g',      nom: 'sucre ou miel liquide', scalable: true },
      { qte: 10,  unite: 'g',      nom: 'cannelle en bâton', scalable: true },
      { qte: 10,  unite: 'g',      nom: 'gingembre entier', scalable: true },
      { qte: 4,   unite: 'clous',  nom: 'clous de girofle', scalable: true },
      { qte: 5,   unite: 'graines',nom: 'cardamome', scalable: true },
      { qte: 1,   unite: 'pointe', nom: 'noix de muscade râpée', scalable: false },
      { qte: 2,   unite: 'c. à s.',nom: "eau de rose (facultatif)", scalable: true }
    ],
    preparation: [
      "Concasser grossièrement les épices au mortier pour libérer leurs arômes.",
      "Verser le vin dans un grand bocal, ajouter le sucre ou le miel et remuer jusqu'à dissolution.",
      "Ajouter les épices et l'eau de rose, fermer le bocal.",
      "Laisser macérer à froid 24 à 48 heures, en remuant matin et soir.",
      "Filtrer soigneusement à l'étamine, puis au filtre à café, jusqu'à obtenir un vin limpide.",
      "Mettre en bouteille ; se déguste frais, en apéritif ou au dessert."
    ],
    timeline: [
      { phase: 'Préparation',  duree: '30 min' },
      { phase: 'Macération',   duree: '24 à 48 h, à froid' },
      { phase: 'Filtration',   duree: 'à l\'étamine puis filtre fin' },
      { phase: 'Vieillissement', duree: 'facultatif, quelques semaines' },
      { phase: 'Dégustation',  duree: 'frais' }
    ],
    histoire: "L'hypocras tire son nom du médecin grec Hippocrate, à qui l'on attribuait la « manche d'Hippocrate », un sac de tissu servant à filtrer le vin épicé. Servi à la fin des banquets médiévaux, il accompagnait les épices de chambre et les fruits confits. Sa préparation à froid, plus rare aujourd'hui, préserve la finesse des épices et évite l'évaporation de l'alcool.",
    proprietes: "Les épices royales (cannelle, gingembre, girofle, muscade) étaient réputées réchauffer le corps et faciliter la digestion ; on le buvait volontiers l'hiver.",
    conseils: "Choisir un vin rond et fruité plutôt qu'un vin trop tannique. Le miel apporte une rondeur plus médiévale que le sucre.",
    dicton: "« Qui boit hypocras au soir, dort comme un roi sans le savoir. »"
  },
  {
    id: 'hypocras-blanc',
    nom: 'Hypocras Blanc',
    categorie: 'hypocras',
    themes: ['historiques', 'epices'],
    gravure: 'epice',
    degre: 12,
    macerationJours: 2,
    lot: 1,
    tags: ['vin blanc', 'cannelle', 'gingembre', 'cardamome', 'girofle', 'amande', 'citron', 'miel', 'sucre'],
    ingredients: [
      { qte: 1,   unite: 'L',       nom: 'vin blanc moelleux ou sec', scalable: true },
      { qte: 120, unite: 'g',       nom: 'sucre ou miel', scalable: true },
      { qte: 8,   unite: 'g',       nom: 'cannelle en bâton', scalable: true },
      { qte: 8,   unite: 'g',       nom: 'gingembre entier', scalable: true },
      { qte: 4,   unite: 'graines', nom: 'cardamome', scalable: true },
      { qte: 3,   unite: 'clous',   nom: 'clous de girofle', scalable: true },
      { qte: 40,  unite: 'g',       nom: 'amandes effilées', scalable: true },
      { qte: 1,   unite: 'pièce',   nom: 'zeste de citron', scalable: true }
    ],
    preparation: [
      "Concasser les épices et les amandes au mortier.",
      "Mélanger le vin, le sucre ou le miel et le zeste de citron dans un bocal.",
      "Ajouter les épices et amandes, fermer hermétiquement.",
      "Macérer 24 à 48 heures à froid, en remuant deux fois par jour.",
      "Filtrer jusqu'à parfaite limpidité.",
      "Embouteiller et servir bien frais."
    ],
    timeline: [
      { phase: 'Préparation',  duree: '30 min' },
      { phase: 'Macération',   duree: '24 à 48 h, à froid' },
      { phase: 'Filtration',   duree: 'étamine + filtre fin' },
      { phase: 'Vieillissement', duree: 'facultatif' },
      { phase: 'Dégustation',  duree: 'frais' }
    ],
    histoire: "Variante claire et plus délicate de l'hypocras, le « vin blanc épicé » était prisé des cours raffinées. L'amande, fréquente dans les recettes médiévales, apporte un velouté caractéristique.",
    proprietes: "Réputé tonique et digestif, plus léger que son cousin rouge.",
    conseils: "Un vin blanc légèrement moelleux équilibre joliment l'amertume des épices.",
    dicton: "« Vin blanc d'épices, plaisir des nobles lices. »"
  },
  {
    id: 'vin-de-noix',
    nom: 'Vin de Noix',
    categorie: 'vins',
    themes: ['fruits', 'historiques', 'medicinales', 'epices'],
    gravure: 'fruit',
    degre: 18,
    macerationJours: 40,
    lot: 4.5,
    tags: ['noix verte', 'vin rouge', 'eau-de-vie', 'sucre', 'vanille', 'cannelle', 'orange'],
    ingredients: [
      { qte: 40,  unite: 'pièces', nom: 'noix vertes (cueillies vers la Saint-Jean)', scalable: true },
      { qte: 3,   unite: 'L',      nom: 'vin rouge', scalable: true },
      { qte: 1,   unite: 'L',      nom: 'eau-de-vie à 40°', scalable: true },
      { qte: 800, unite: 'g',      nom: 'sucre', scalable: true },
      { qte: 1,   unite: 'gousse', nom: 'vanille', scalable: true },
      { qte: 1,   unite: 'bâton',  nom: 'cannelle', scalable: true },
      { qte: 1,   unite: 'pièce',  nom: "zeste d'orange", scalable: true }
    ],
    preparation: [
      "Rincer et essuyer les noix vertes, puis les couper en quartiers (port de gants conseillé, le brou tache).",
      "Déposer les noix dans une grande bonbonne et verser le sucre par-dessus.",
      "Ajouter le vin rouge, puis l'eau-de-vie, la vanille fendue, la cannelle et le zeste d'orange.",
      "Fermer hermétiquement et placer à l'abri de la lumière.",
      "Macérer 40 jours, en remuant doucement tous les deux ou trois jours pour dissoudre le sucre.",
      "Filtrer, mettre en bouteille. Attendre Noël pour la première dégustation ; meilleur après un à deux ans."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'découpe des noix' },
      { phase: 'Macération',   duree: '40 jours, à l\'abri de la lumière' },
      { phase: 'Filtration',   duree: 'étamine' },
      { phase: 'Vieillissement', duree: 'jusqu\'à Noël, idéalement 1 à 2 ans' },
      { phase: 'Dégustation',  duree: 'frais, en apéritif' }
    ],
    histoire: "Le vin de noix se prépare traditionnellement avec des noix encore vertes cueillies autour du 24 juin, jour de la Saint-Jean. Présent dans toutes les campagnes de France, chaque famille en garde jalousement sa formule.",
    proprietes: "Le brou de noix vert, riche en tanins, donne un apéritif amer et tonique, réputé fortifiant et digestif.",
    conseils: "La découpe en quartiers augmente la surface de contact et accélère l'extraction des arômes et des tanins.",
    dicton: "« À la Saint-Jean, les noix sont au bon temps. »"
  },
  {
    id: 'vin-orange',
    nom: "Vin d'Orange",
    categorie: 'vins',
    themes: ['fruits', 'epices'],
    gravure: 'fruit',
    degre: 18,
    macerationJours: 45,
    lot: 6,
    tags: ['orange amère', 'orange', 'citron', 'vin rosé', 'vin blanc', 'eau-de-vie', 'sucre', 'vanille', 'cannelle'],
    ingredients: [
      { qte: 5,   unite: 'L',      nom: 'vin blanc ou rosé', scalable: true },
      { qte: 1,   unite: 'L',      nom: 'eau-de-vie à 40-50°', scalable: true },
      { qte: 750, unite: 'g',      nom: 'sucre', scalable: true },
      { qte: 4,   unite: 'pièces', nom: 'oranges amères', scalable: true },
      { qte: 2,   unite: 'pièces', nom: 'oranges douces', scalable: true },
      { qte: 1,   unite: 'pièce',  nom: 'citron', scalable: true },
      { qte: 1,   unite: 'gousse', nom: 'vanille', scalable: true },
      { qte: 1,   unite: 'bâton',  nom: 'cannelle', scalable: true }
    ],
    preparation: [
      "Brosser et couper les agrumes en quartiers (sans les éplucher).",
      "Réunir dans une bonbonne le vin, l'eau-de-vie, le sucre, les agrumes, la vanille fendue et la cannelle.",
      "Fermer et remuer pour amorcer la dissolution du sucre.",
      "Macérer 40 à 60 jours, à l'abri de la lumière, en remuant doucement une fois par semaine.",
      "Filtrer au chinois puis à l'étamine.",
      "Mettre en bouteille ; se conserve jusqu'à deux ans."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'découpe des agrumes' },
      { phase: 'Macération',   duree: '40 à 60 jours' },
      { phase: 'Filtration',   duree: 'chinois + étamine' },
      { phase: 'Vieillissement', duree: 'quelques semaines en bouteille' },
      { phase: 'Dégustation',  duree: 'frais, à l\'apéritif' }
    ],
    histoire: "Apéritif provençal par excellence, le vin d'orange se prépare l'hiver, à la saison des oranges amères (bigarades). Mélanger oranges amères et douces apporte complexité et amertume noble.",
    proprietes: "Tonique et apéritif, parfumé d'agrumes et d'épices douces.",
    conseils: "Zester finement sans entamer la peau blanche, trop amère, pour préserver l'équilibre.",
    dicton: "« Vin d'orange en hiver, soleil dans le verre. »"
  },
  {
    id: 'vin-de-peche',
    nom: 'Vin de Pêche (Rinquinquin)',
    categorie: 'vins',
    themes: ['historiques', 'fruits'],
    gravure: 'plante',
    degre: 16,
    macerationJours: 10,
    lot: 1.2,
    tags: ['feuilles de pêcher', 'vin rouge', 'eau-de-vie', 'sucre'],
    ingredients: [
      { qte: 100, unite: 'feuilles', nom: 'feuilles de pêcher', scalable: true },
      { qte: 1,   unite: 'L',        nom: 'vin rouge à 13°', scalable: true },
      { qte: 325, unite: 'g',        nom: 'sucre en poudre', scalable: true },
      { qte: 15,  unite: 'cl',       nom: 'eau-de-vie de fruits à 45°', scalable: true }
    ],
    preparation: [
      "Cueillir et rincer les feuilles de pêcher (idéalement après les vendanges, lorsqu'elles sont parfumées).",
      "Disposer les feuilles, le sucre et l'eau-de-vie dans un bocal.",
      "Ajouter le vin rouge et fermer hermétiquement.",
      "Macérer une dizaine de jours au frais, à l'abri de la lumière, en remuant tous les deux jours.",
      "Filtrer pour retirer les feuilles, puis embouteiller.",
      "Patienter 15 jours à 3 semaines avant de déguster."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'cueillette et rinçage' },
      { phase: 'Macération',   duree: '10 jours, au frais' },
      { phase: 'Filtration',   duree: 'passoire fine + linge' },
      { phase: 'Vieillissement', duree: '15 jours à 3 semaines' },
      { phase: 'Dégustation',  duree: 'frais' }
    ],
    histoire: "Le « rinquinquin » est un savoir-faire provençal : on fait macérer feuilles de pêcher et arômes dans le vin et l'alcool. Son nom évoque l'idée de « requinquer », redonner des forces.",
    proprietes: "Les feuilles de pêcher diffusent une délicate amertume d'amande ; l'apéritif est réputé revigorant.",
    conseils: "N'utiliser que des feuilles non traitées. Une variante express de 48 h existe avec sucre en morceaux.",
    dicton: "« Feuille de pêcher au verre, requinque le corps entier. »"
  },
  {
    id: 'troussepinette',
    nom: "Troussepinette (Vin d'Épine)",
    categorie: 'vins',
    themes: ['historiques', 'fruits'],
    gravure: 'plante',
    degre: 18,
    macerationJours: 30,
    lot: 5,
    tags: ['épine noire', 'prunellier', 'pousses', 'vin rouge', 'eau-de-vie', 'sucre'],
    ingredients: [
      { qte: 1,   unite: 'kg', nom: "pousses tendres d'épine noire (prunellier), cueillies en mai", scalable: true },
      { qte: 4,   unite: 'L',  nom: 'vin rouge (type Gamay)', scalable: true },
      { qte: 1,   unite: 'L',  nom: 'eau-de-vie', scalable: true },
      { qte: 800, unite: 'g',  nom: 'sucre', scalable: true }
    ],
    preparation: [
      "Cueillir les jeunes pousses de prunellier (15 à 20 cm) juste après la floraison, en mai-juin.",
      "Rincer puis déposer les pousses dans une bonbonne.",
      "Ajouter le vin, l'eau-de-vie et le sucre.",
      "Fermer et macérer de 48 heures à un mois selon l'intensité souhaitée, en remuant régulièrement.",
      "Filtrer soigneusement et mettre en bouteille.",
      "Attendre deux à trois mois avant la dégustation."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'cueillette en mai' },
      { phase: 'Macération',   duree: '48 h à 1 mois' },
      { phase: 'Filtration',   duree: 'étamine' },
      { phase: 'Vieillissement', duree: '2 à 3 mois' },
      { phase: 'Dégustation',  duree: 'frais, à l\'apéritif' }
    ],
    histoire: "Appelée troussepinette en Vendée, vin d'épine ailleurs, cette préparation régionale exploite les jeunes pousses du prunellier sauvage. Chaque foyer la prépare au printemps, à la cueillette.",
    proprietes: "Saveur singulière de noyau de cerise et d'amande amère ; apéritif tonique et printanier.",
    conseils: "Éviter les vins trop tanniques. Ne cueillir que les pousses tendres, d'un vert clair.",
    dicton: "« En mai, pousse d'épine, en hiver, bouteille fine. »"
  },
  {
    id: 'ratafia-cerises',
    nom: 'Ratafia de Cerises',
    categorie: 'ratafias',
    themes: ['fruits'],
    gravure: 'fruit',
    degre: 30,
    macerationJours: 15,
    lot: 1,
    tags: ['cerise', 'griotte', 'framboise', 'eau-de-vie', 'sucre', 'cannelle', 'girofle', 'noyaux'],
    ingredients: [
      { qte: 1,   unite: 'kg', nom: 'griottes (cerises aigres)', scalable: true },
      { qte: 250, unite: 'g',  nom: 'framboises', scalable: true },
      { qte: 1,   unite: 'L',  nom: 'eau-de-vie blanche', scalable: true },
      { qte: 200, unite: 'g',  nom: 'sucre en poudre', scalable: true },
      { qte: 1,   unite: 'bâton', nom: 'cannelle', scalable: true },
      { qte: 2,   unite: 'clous', nom: 'clous de girofle', scalable: true }
    ],
    preparation: [
      "Mettre les griottes (avec leurs noyaux) et les framboises dans un grand bocal.",
      "Ajouter la cannelle et les clous de girofle, puis verser l'eau-de-vie.",
      "Fermer et laisser macérer 15 jours à la lumière ambiante, en remuant de temps en temps.",
      "Filtrer à travers un chinois.",
      "Incorporer le sucre en remuant longuement à la cuillère de bois jusqu'à dissolution complète.",
      "Embouteiller et laisser reposer quelques semaines avant de déguster."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'mise en bocal' },
      { phase: 'Macération',   duree: '15 jours à la lumière' },
      { phase: 'Filtration',   duree: 'chinois' },
      { phase: 'Vieillissement', duree: 'quelques semaines' },
      { phase: 'Dégustation',  duree: 'apéritif ou digestif' }
    ],
    histoire: "Le mot « ratafia » viendrait de la formule latine « ut rata fiat » (« que l'affaire soit conclue »), liqueur que l'on buvait pour sceller un accord. Le ratafia de cerises est l'un des plus anciens et des plus répandus.",
    proprietes: "Les noyaux concassés diffusent une note d'amande amère ; digestif réputé.",
    conseils: "Concasser quelques noyaux renforce le goût d'amande. Une méthode ancienne fait d'abord cuire les cerises en sirop avant d'ajouter l'alcool.",
    dicton: "« Ratafia bien tiré scelle l'amitié. »"
  },
  {
    id: 'creme-cassis',
    nom: 'Crème de Cassis',
    categorie: 'cremes',
    themes: ['fruits'],
    gravure: 'fruit',
    degre: 18,
    macerationJours: 60,
    lot: 1.5,
    tags: ['cassis', 'eau-de-vie', 'alcool', 'sucre', 'baies'],
    ingredients: [
      { qte: 1.25, unite: 'kg', nom: 'cassis frais bien mûr', scalable: true },
      { qte: 1,    unite: 'L',  nom: "alcool de fruits ou eau-de-vie", scalable: true },
      { qte: 600,  unite: 'g',  nom: 'sucre (au moins 400 g par litre fini)', scalable: true },
      { qte: 20,   unite: 'cl', nom: 'eau (pour le sirop)', scalable: true }
    ],
    preparation: [
      "Laver et égrener les cassis, puis les placer dans un grand récipient en verre.",
      "Verser l'alcool par-dessus, fermer, et laisser macérer 2 à 3 mois dans un endroit sombre et frais.",
      "Écraser les baies pour en extraire le jus, puis filtrer à l'étamine en pressant bien.",
      "Préparer un sirop avec le sucre et l'eau, laisser refroidir.",
      "Mélanger le sirop à l'alcool filtré jusqu'à obtenir une crème sirupeuse.",
      "Embouteiller et laisser reposer 2 à 3 semaines avant de déguster."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'lavage et égrenage' },
      { phase: 'Macération',   duree: '2 à 3 mois, à l\'obscurité' },
      { phase: 'Filtration',   duree: 'étamine, en pressant' },
      { phase: 'Vieillissement', duree: '2 à 3 semaines' },
      { phase: 'Dégustation',  duree: 'nature ou en kir' }
    ],
    histoire: "Spécialité bourguignonne, la crème de cassis de Dijon connut son essor au XIXᵉ siècle. Associée au vin blanc aligoté, elle donne le célèbre « kir ».",
    proprietes: "Très riche en sucre (≥ 400 g/L), d'où sa texture épaisse et sirupeuse de « crème ».",
    conseils: "Plus la teneur en sucre est élevée, plus la texture est onctueuse. Le cassis bien mûr donne une couleur profonde.",
    dicton: "« Un trait de cassis, et le vin sourit. »"
  },
  {
    id: 'creme-mure',
    nom: 'Crème de Mûre',
    categorie: 'cremes',
    themes: ['fruits'],
    gravure: 'fruit',
    degre: 18,
    macerationJours: 45,
    lot: 1.5,
    tags: ['mûre', 'ronce', 'eau-de-vie', 'alcool', 'sucre', 'baies'],
    ingredients: [
      { qte: 1.2, unite: 'kg', nom: 'mûres sauvages bien mûres', scalable: true },
      { qte: 1,   unite: 'L',  nom: "alcool de fruits ou eau-de-vie", scalable: true },
      { qte: 550, unite: 'g',  nom: 'sucre', scalable: true },
      { qte: 20,  unite: 'cl', nom: 'eau (pour le sirop)', scalable: true }
    ],
    preparation: [
      "Trier et laver rapidement les mûres, puis les déposer dans un bocal.",
      "Couvrir d'alcool et laisser macérer 5 à 6 semaines à l'obscurité.",
      "Écraser et filtrer à l'étamine en pressant pour extraire tout le jus.",
      "Confectionner un sirop sucre + eau, laisser refroidir.",
      "Mélanger sirop et alcool filtré.",
      "Embouteiller et laisser reposer quelques semaines."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'tri et lavage' },
      { phase: 'Macération',   duree: '5 à 6 semaines' },
      { phase: 'Filtration',   duree: 'étamine' },
      { phase: 'Vieillissement', duree: '2 à 3 semaines' },
      { phase: 'Dégustation',  duree: 'nature ou en cocktail' }
    ],
    histoire: "Cousine de la crème de cassis, la crème de mûre exploite la cueillette sauvage de fin d'été le long des chemins et des haies.",
    proprietes: "Couleur sombre et goût intense de fruit des bois ; texture sirupeuse de crème.",
    conseils: "Cueillir les mûres bien noires et fermes, loin des bords de route.",
    dicton: "« Mûre de septembre, douceur de décembre. »"
  },
  {
    id: 'vespetro',
    nom: 'Vespétro',
    categorie: 'liqueurs',
    themes: ['historiques', 'medicinales', 'epices'],
    gravure: 'racine',
    degre: 30,
    macerationJours: 7,
    lot: 1.2,
    tags: ['angélique', 'coriandre', 'fenouil', 'badiane', 'anis', 'citron', 'sucre', 'alcool'],
    ingredients: [
      { qte: 1,   unite: 'L',       nom: 'alcool à 45°', scalable: true },
      { qte: 40,  unite: 'g',       nom: "graines d'angélique", scalable: true },
      { qte: 20,  unite: 'g',       nom: 'graines de coriandre', scalable: true },
      { qte: 1,   unite: 'c. à s.', nom: 'graines de fenouil', scalable: true },
      { qte: 1,   unite: 'c. à s.', nom: 'badiane (anis étoilé)', scalable: true },
      { qte: 2,   unite: 'pièces',  nom: 'zestes de citron', scalable: true },
      { qte: 500, unite: 'g',       nom: 'sucre', scalable: true },
      { qte: 20,  unite: 'cl',      nom: 'eau (pour le sirop)', scalable: true }
    ],
    preparation: [
      "Concasser grossièrement au mortier les graines d'angélique, de coriandre, de fenouil et la badiane.",
      "Mettre les graines et les zestes de citron à macérer dans l'alcool pendant une semaine, en remuant chaque jour.",
      "Filtrer au tamis fin.",
      "Préparer un sirop avec le sucre et l'eau, laisser refroidir.",
      "Mélanger le sirop à l'alcool aromatisé.",
      "Embouteiller et laisser reposer avant dégustation."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'concassage des graines' },
      { phase: 'Macération',   duree: '7 jours' },
      { phase: 'Filtration',   duree: 'tamis fin' },
      { phase: 'Vieillissement', duree: 'quelques semaines' },
      { phase: 'Dégustation',  duree: 'en digestif' }
    ],
    histoire: "Liqueur des Lumières originaire de Savoie et du Piémont, le vespétro doit son nom truculent à trois verbes — vesser, péter, roter — promesse des effets attendus sur un système digestif surchargé. On la trouvait du Val d'Aoste à la Vénétie.",
    proprietes: "Carminative et digestive : les graines d'angélique, de fenouil et de coriandre apaisent les ballonnements.",
    conseils: "Une recette du XVIIIᵉ siècle se contente d'angélique, coriandre, fenouil et jus de citron, infusés 4 à 5 jours.",
    dicton: "« Après ripaille, vespétro et l'on retaille. »"
  },
  {
    id: 'genepi',
    nom: 'Liqueur de Génépi',
    categorie: 'liqueurs',
    themes: ['medicinales', 'historiques'],
    gravure: 'plante',
    degre: 40,
    macerationJours: 40,
    lot: 1,
    tags: ['génépi', 'plante de montagne', 'sucre', 'alcool', 'armoise'],
    ingredients: [
      { qte: 40, unite: 'brins',    nom: 'génépi', scalable: true },
      { qte: 40, unite: 'morceaux', nom: 'sucre (≈ 160 g)', scalable: true },
      { qte: 1,  unite: 'L',        nom: "alcool neutre à 40° (ou vodka)", scalable: true }
    ],
    preparation: [
      "Verser l'alcool dans une grande bouteille en verre.",
      "Ajouter les 40 brins de génépi et les 40 morceaux de sucre.",
      "Fermer et laisser macérer 40 jours, à l'abri de la lumière.",
      "Filtrer puis mettre en jolies bouteilles.",
      "On peut laisser 3 ou 4 brins dans la bouteille pour la décoration."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'mise en bouteille' },
      { phase: 'Macération',   duree: '40 jours minimum' },
      { phase: 'Filtration',   duree: 'filtre fin' },
      { phase: 'Vieillissement', duree: 'facultatif' },
      { phase: 'Dégustation',  duree: 'en digestif, frais' }
    ],
    histoire: "Liqueur emblématique des Alpes, le génépi suit la « règle des 40 » : 40 brins, 40 morceaux de sucre, 40 jours de macération. Le génépi (armoise des glaciers) pousse en haute montagne et fut longtemps cueilli par les bergers.",
    proprietes: "Réputé tonique, digestif et fébrifuge ; remède traditionnel contre le froid et le mal des montagnes.",
    conseils: "À défaut d'alcool neutre à 40°, on peut utiliser de la vodka ou de l'alcool de fruits.",
    dicton: "« Quarante brins, quarante jours, le génépi tient ses amours. »"
  },
  {
    id: 'liqueur-sureau',
    nom: 'Liqueur de Fleurs de Sureau',
    categorie: 'liqueurs',
    themes: ['fleurs'],
    gravure: 'fleur',
    degre: 25,
    macerationJours: 21,
    lot: 1.5,
    tags: ['fleurs de sureau', 'sureau', 'citron', 'sucre', 'alcool'],
    ingredients: [
      { qte: 30,  unite: 'ombelles', nom: 'fleurs de sureau fraîches', scalable: true },
      { qte: 1,   unite: 'L',        nom: 'alcool à 40°', scalable: true },
      { qte: 1,   unite: 'pièce',    nom: 'citron (zeste + jus)', scalable: true },
      { qte: 500, unite: 'g',        nom: 'sucre', scalable: true },
      { qte: 50,  unite: 'cl',       nom: 'eau (pour le sirop)', scalable: true }
    ],
    preparation: [
      "Secouer les ombelles de sureau sans les laver, pour préserver le pollen parfumé.",
      "Mettre les fleurs, le zeste et le jus de citron à macérer dans l'alcool, 2 à 3 semaines à l'abri de la lumière.",
      "Filtrer à l'étamine.",
      "Préparer un sirop avec le sucre et l'eau, laisser refroidir.",
      "Mélanger le sirop à l'alcool aromatisé.",
      "Laisser reposer de 10 jours à 6 semaines avant de déguster."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'cueillette des ombelles' },
      { phase: 'Macération',   duree: '2 à 3 semaines' },
      { phase: 'Filtration',   duree: 'étamine' },
      { phase: 'Vieillissement', duree: '10 jours à 6 semaines' },
      { phase: 'Dégustation',  duree: 'frais, allongée d\'eau pétillante' }
    ],
    histoire: "Le sureau noir, arbre des haies et des lisières, fleurit en mai-juin. Ses ombelles crémeuses parfument depuis longtemps sirops et liqueurs champêtres.",
    proprietes: "Fleur réputée sudorifique et adoucissante ; arôme floral et muscaté caractéristique.",
    conseils: "Ne jamais rincer les fleurs à l'eau, sous peine de diluer les arômes. Cueillir par temps sec, en plein épanouissement.",
    dicton: "« Sureau en fleur, été en chaleur. »"
  },
  {
    id: 'liqueur-44',
    nom: 'Liqueur 44 (Orange & Café)',
    categorie: 'liqueurs',
    themes: ['fruits', 'epices'],
    gravure: 'fruit',
    degre: 35,
    macerationJours: 44,
    lot: 1,
    tags: ['orange', 'café', 'sucre', 'eau-de-vie', 'lambig'],
    ingredients: [
      { qte: 1,  unite: 'pièce',    nom: 'orange non traitée', scalable: true },
      { qte: 44, unite: 'grains',   nom: 'café', scalable: true },
      { qte: 44, unite: 'morceaux', nom: 'sucre (≈ 175 g)', scalable: true },
      { qte: 1,  unite: 'L',        nom: 'eau-de-vie (lambig ou alcool de fruits)', scalable: true }
    ],
    preparation: [
      "Laver l'orange et y percer 44 trous à l'aide d'un pique.",
      "Glisser un grain de café dans chacun des 44 trous.",
      "Déposer l'orange piquée dans un grand bocal avec le sucre.",
      "Verser l'eau-de-vie, fermer le bocal.",
      "Laisser macérer 44 jours, en remuant de temps en temps.",
      "Retirer l'orange, filtrer et embouteiller."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'piquage de l\'orange' },
      { phase: 'Macération',   duree: '44 jours' },
      { phase: 'Filtration',   duree: 'filtre fin' },
      { phase: 'Vieillissement', duree: 'facultatif' },
      { phase: 'Dégustation',  duree: 'en digestif' }
    ],
    histoire: "Recette bretonne facétieuse fondée sur le chiffre 44 : 44 grains de café, 44 morceaux de sucre, 44 jours de macération, traditionnellement faite au lambig (eau-de-vie de cidre).",
    proprietes: "Digestif corsé, mariage surprenant de l'orange et du café torréfié.",
    conseils: "Choisir une orange à peau fine non traitée. Le café apporte amertume et profondeur.",
    dicton: "« Quarante-quatre jours d'attente, liqueur qui contente. »"
  },
  {
    id: 'limoncello',
    nom: 'Limoncello',
    categorie: 'liqueurs',
    themes: ['fruits'],
    gravure: 'fruit',
    degre: 30,
    macerationJours: 8,
    lot: 2,
    tags: ['citron', 'zeste', 'sucre', 'alcool'],
    ingredients: [
      { qte: 8,   unite: 'pièces', nom: 'citrons non traités (zestes seulement)', scalable: true },
      { qte: 1,   unite: 'L',      nom: "alcool neutre à 95°", scalable: true },
      { qte: 1,   unite: 'L',      nom: 'eau', scalable: true },
      { qte: 700, unite: 'g',      nom: 'sucre', scalable: true }
    ],
    preparation: [
      "Prélever finement les zestes des citrons, sans la peau blanche amère.",
      "Faire macérer les zestes dans l'alcool une semaine, à l'abri de la lumière.",
      "Filtrer pour retirer les zestes.",
      "Préparer un sirop avec l'eau et le sucre, laisser refroidir.",
      "Mélanger le sirop à l'alcool citronné.",
      "Embouteiller et conserver au congélateur ; servir très frais."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'zestage des citrons' },
      { phase: 'Macération',   duree: '1 semaine' },
      { phase: 'Filtration',   duree: 'passoire' },
      { phase: 'Vieillissement', duree: 'quelques jours au froid' },
      { phase: 'Dégustation',  duree: 'glacé, en digestif' }
    ],
    histoire: "Digestif emblématique de la côte amalfitaine et de Sorrente, le limoncello se prépare avec les gros citrons parfumés du Sud de l'Italie. Chaque famille en garde sa recette.",
    proprietes: "Liqueur fraîche et intensément citronnée, servie glacée pour clore un repas.",
    conseils: "N'utiliser que la partie jaune du zeste ; la peau blanche rendrait la liqueur amère.",
    dicton: "« Limoncello ghiacciato, pranzo terminato. » (limoncello glacé, repas terminé)"
  },
  {
    id: 'guignolet',
    nom: "Guignolet d'Angers",
    categorie: 'liqueurs',
    themes: ['fruits', 'historiques'],
    gravure: 'fruit',
    degre: 22,
    macerationJours: 60,
    lot: 1.3,
    tags: ['guigne', 'cerise', 'noyaux', 'eau-de-vie', 'sucre'],
    ingredients: [
      { qte: 1,   unite: 'kg', nom: 'guignes (cerises noires) ou griottes', scalable: true },
      { qte: 1,   unite: 'L',  nom: 'eau-de-vie à 40°', scalable: true },
      { qte: 300, unite: 'g',  nom: 'sucre', scalable: true },
      { qte: 1,   unite: 'poignée', nom: 'noyaux concassés', scalable: true }
    ],
    preparation: [
      "Équeuter et laver les guignes, puis les déposer dans un bocal avec quelques noyaux concassés.",
      "Verser l'eau-de-vie et le sucre.",
      "Fermer et macérer environ 2 mois, en remuant pour dissoudre le sucre.",
      "Filtrer à l'étamine en pressant doucement les fruits.",
      "Mettre en bouteille et laisser vieillir quelques mois."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'équeutage et lavage' },
      { phase: 'Macération',   duree: '≈ 2 mois' },
      { phase: 'Filtration',   duree: 'étamine' },
      { phase: 'Vieillissement', duree: 'quelques mois' },
      { phase: 'Dégustation',  duree: 'en apéritif ou digestif' }
    ],
    histoire: "Spécialité angevine née au XVIIᵉ siècle, le guignolet est une liqueur de guignes, variété de cerises noires. Il fit la réputation des distilleries de l'Anjou.",
    proprietes: "Liqueur fruitée et parfumée, avec une pointe d'amande venue des noyaux.",
    conseils: "Quelques noyaux concassés apportent l'amertume caractéristique ; ne pas en abuser.",
    dicton: "« Guigne d'Anjou, douce à tous. »"
  },
  {
    id: 'rhum-ananas-vanille',
    nom: 'Rhum Arrangé Ananas-Vanille',
    categorie: 'rhums',
    themes: ['fruits', 'epices'],
    gravure: 'fruit',
    degre: 40,
    macerationJours: 75,
    lot: 0.7,
    tags: ['ananas', 'vanille', 'rhum', 'sucre de canne'],
    ingredients: [
      { qte: 70, unite: 'cl',     nom: 'rhum blanc agricole à 40-50°', scalable: true },
      { qte: 1,  unite: 'pièce',  nom: 'ananas Victoria bien mûr', scalable: true },
      { qte: 1,  unite: 'gousse', nom: 'vanille bourbon', scalable: true },
      { qte: 2,  unite: 'c. à s.',nom: 'sucre de canne roux ou miel', scalable: true }
    ],
    preparation: [
      "Éplucher l'ananas et le couper en morceaux.",
      "Fendre la gousse de vanille dans la longueur.",
      "Disposer l'ananas, la vanille et le sucre dans un bocal.",
      "Verser le rhum, fermer le bocal.",
      "Laisser macérer 2 à 3 mois dans un endroit sec et tempéré, à l'abri de la lumière, en agitant de temps en temps.",
      "Goûter, ajuster le sucre si besoin, puis filtrer (ou laisser les fruits selon le goût)."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'découpe des fruits' },
      { phase: 'Macération',   duree: '2 à 3 mois (min. 1 mois)' },
      { phase: 'Filtration',   duree: 'facultative' },
      { phase: 'Vieillissement', duree: 'plus c\'est long, plus c\'est rond' },
      { phase: 'Dégustation',  duree: 'en digestif' }
    ],
    histoire: "Né dans les îles de l'océan Indien (Réunion, Maurice) et des Antilles, le rhum arrangé consiste à faire macérer fruits et épices dans le rhum agricole. L'ananas-vanille en est la déclinaison la plus populaire.",
    proprietes: "Digestif puissant et parfumé ; le sucre s'ajuste au goût en fin de macération.",
    conseils: "Préférer un rhum agricole de qualité ; agiter le bocal régulièrement pour homogénéiser l'extraction.",
    dicton: "« Lontan dann boutey, lo rhum i vien méyèr. » (plus il reste en bouteille, meilleur est le rhum)"
  },
  {
    id: 'eau-melisse-carmes',
    nom: 'Eau de Mélisse des Carmes',
    categorie: 'liqueurs',
    themes: ['medicinales', 'historiques', 'epices', 'fleurs'],
    gravure: 'plante',
    degre: 80,
    macerationJours: 4,
    lot: 1,
    tags: ['mélisse', 'citron', 'cannelle', 'coriandre', 'girofle', 'muscade', 'angélique', 'alcool', 'cordial'],
    ingredients: [
      { qte: 1,   unite: 'L',      nom: 'alcool à 80°', scalable: true },
      { qte: 80,  unite: 'g',      nom: 'mélisse fraîche', scalable: true },
      { qte: 1,   unite: 'pièce',  nom: 'zeste de citron séché', scalable: true },
      { qte: 5,   unite: 'g',      nom: 'cannelle', scalable: true },
      { qte: 5,   unite: 'g',      nom: 'coriandre', scalable: true },
      { qte: 2,   unite: 'clous',  nom: 'clous de girofle', scalable: true },
      { qte: 1,   unite: 'pointe', nom: 'noix de muscade', scalable: false },
      { qte: 10,  unite: 'g',      nom: 'angélique', scalable: true }
    ],
    preparation: [
      "Hacher la mélisse et concasser les épices.",
      "Réunir mélisse, zeste de citron, épices et angélique dans l'alcool.",
      "Laisser macérer 4 jours (la recette véritable est ensuite distillée).",
      "À défaut d'alambic, faire bouillir 5 minutes dans un peu d'eau, puis prolonger la macération 15 à 21 jours au soleil dans un bocal fermé.",
      "Filtrer très finement.",
      "Conserver en flacon ; se prend par cuillerées ou en gouttes sur un sucre."
    ],
    timeline: [
      { phase: 'Préparation',  duree: 'hachage et concassage' },
      { phase: 'Macération',   duree: '4 jours (ou 15 à 21 jours sans distillation)' },
      { phase: 'Filtration',   duree: 'filtre très fin' },
      { phase: 'Vieillissement', duree: 'se conserve longtemps' },
      { phase: 'Dégustation',  duree: 'en cordial, à la cuillère' }
    ],
    histoire: "En 1611, un moine transmit oralement une recette d'eau de mélisse au frère Damien, du couvent des Carmes déchaussés de la rue de Vaugirard à Paris. Le plus ancien parchemin connu date de 1715. La recette véritable réunit 14 plantes et 9 épices, distillées dans un alcool à 80°. En 1838, la formule passa à la famille Boyer, qui la produit toujours.",
    proprietes: "Cordial réputé contre les maux de tête, vertiges, digestions difficiles et « vapeurs ». Se prend par cuillerées diluées ou en gouttes sur un sucre — jamais comme une boisson.",
    conseils: "C'est un alcool très fort (cordial médicinal), à consommer en très petites quantités. La mélisse domine toujours en proportion.",
    dicton: "« Eau de mélisse au matin, chasse les vapeurs et le chagrin. »"
  }
];

/* ---------------------------------------------------------------------
   2 bis. RECETTES AUTHENTIQUES DU SITE hypocras.blog4ever.com
   Données fonctionnelles (ingrédients, quantités, méthode, durées,
   degrés) relevées sur le blog d'origine, puis normalisées dans le
   schéma de l'application. Les encarts narratifs (histoire, propriétés,
   conseils, dicton) sont rédigés de façon synthétique et restent
   facultatifs (null).

   Format compact :
   - ing   : [qte, unité, nom, scalable?]   (scalable true par défaut)
   - prep  : étapes (tableau de chaînes)
   - mac   : durée de macération en jours (filtre) ; macTxt : libellé
--------------------------------------------------------------------- */
function _ing(a) { return { qte: a[0], unite: a[1], nom: a[2], scalable: a[3] !== false }; }
function _recette(o) {
  const mj = o.mac || 0;
  return {
    id: o.id,
    nom: o.nom,
    categorie: o.cat,
    themes: o.themes || [],
    gravure: o.gravure || 'plante',
    degre: o.degre,
    macerationJours: mj,
    lot: o.lot || 2.4,
    tags: o.tags || [],
    ingredients: (o.ing || []).map(_ing),
    preparation: o.prep || [],
    timeline: o.timeline || [
      { phase: 'Préparation',   duree: o.prepTxt || 'préparation des ingrédients' },
      { phase: 'Macération',    duree: o.macTxt || (mj ? mj + ' jours' : '—') },
      { phase: 'Filtration',    duree: 'étamine puis filtre fin' },
      { phase: 'Vieillissement', duree: o.vieil || 'facultatif' },
      { phase: 'Dégustation',   duree: o.degust || 'frais, en apéritif ou en digestif' }
    ],
    histoire: o.histoire || null,
    proprietes: o.proprietes || null,
    conseils: o.conseils || null,
    dicton: o.dicton || null
  };
}

const RECETTES_SITE = [
  { id:'lq-amaretto', nom:'Amaretto', cat:'liqueurs', themes:['fruits','epices'], gravure:'fruit', degre:30, mac:60, macTxt:'60 jours', lot:2.6,
    tags:['amande','vanille','citron','safran','sucre','eau-de-vie'],
    ing:[[2,'L','eau-de-vie à 40°'],[15,'cl','eau'],[2,'gousses','vanille'],[1,'pièce','citron en tranches'],[30,'pièces','amandes amères écrasées'],[2,'pincées','safran',false],[500,'g','sucre']],
    prep:["Préparer un sirop avec le sucre et l'eau, puis le laisser refroidir.","Réunir dans un bocal l'eau-de-vie, la vanille fendue, le citron, les amandes écrasées, le safran et le sirop.","Macérer 60 jours au frais et à l'obscurité en remuant régulièrement.","Filtrer et mettre en bouteilles."] },

  { id:'lq-amaretto-cremino', nom:'Amaretto Crémino', cat:'cremes', themes:['fruits','epices'], gravure:'fruit', degre:27, mac:60, macTxt:'60 jours', lot:3.2,
    tags:['amande','vanille','citron','safran','lait','sucre'],
    ing:[[1,'L','lait entier'],[2,'L','eau-de-vie à 40°'],[2,'gousses','vanille'],[1,'pièce','citron en tranches'],[20,'pièces','amandes amères écrasées'],[2,'pincées','safran',false],[500,'g','sucre']],
    prep:["Préparer un sirop avec le sucre et l'eau, laisser refroidir.","Réunir dans un bocal l'eau-de-vie, le lait, la vanille fendue, le citron, les amandes et le safran avec le sirop.","Macérer 60 jours au frais et à l'obscurité en remuant régulièrement.","Filtrer et mettre en bouteilles."] },

  { id:'lq-arancello', nom:'Arancello', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:30, mac:60, macTxt:'2 mois (zestes)', lot:2.7,
    tags:['orange','zeste','sucre','alcool'],
    ing:[[500,'g','oranges non traitées (zestes)'],[2,'L','alcool à 40°'],[300,'g','sucre'],[75,'cl','eau']],
    prep:["Prélever les zestes d'orange à l'économe et les faire macérer dans l'alcool 2 mois.","Chauffer l'eau pour y dissoudre le sucre.","Filtrer l'alcool pour retirer les zestes, puis y verser le sirop encore chaud.","Mettre en bouteilles."], vieil:'aucun vieillissement nécessaire' },

  { id:'lq-arancello-cremino', nom:'Arancello Mezzo Crémino', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:30, mac:60, macTxt:'2 mois (zestes)', lot:2.9,
    tags:['orange','zeste','lait','sucre','alcool'],
    ing:[[500,'g','oranges non traitées (zestes)'],[2,'L','alcool à 40°'],[500,'g','sucre'],[75,'cl','lait entier']],
    prep:["Prélever les zestes d'orange à l'économe et les faire macérer dans l'alcool 2 mois.","Chauffer le lait pour y dissoudre le sucre.","Filtrer l'alcool, puis y verser la préparation lactée encore chaude.","Mettre en bouteilles."] },

  { id:'lq-limoncello-cremino', nom:'Limoncello Mezzo Crémino', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:30, mac:60, macTxt:'2 mois (zestes)', lot:2.9,
    tags:['citron','zeste','lait','sucre','alcool'],
    ing:[[1,'kg','citrons non traités (zestes)'],[2,'L','alcool à 40°'],[400,'g','sucre'],[75,'cl','lait entier']],
    prep:["Prélever les zestes de citron à l'économe et les faire macérer dans l'alcool 2 mois.","Chauffer le lait pour y dissoudre le sucre.","Filtrer l'alcool, puis y verser la préparation lactée encore chaude.","Mettre en bouteilles."] },

  { id:'lq-anisette', nom:'Liqueur Anisette', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['anis','coriandre','cannelle','macis','sucre','alcool'],
    ing:[[30,'g','anis vert'],[15,'g','coriandre'],[1,'g','cannelle'],[0.5,'g','macis'],[500,'g','sucre'],[2,'L','alcool à 40°'],[15,'cl','eau']],
    prep:["Dissoudre le sucre dans un peu d'eau tiède, laisser refroidir.","Réunir l'anis, la coriandre, la cannelle et le macis dans l'alcool avec le sirop.","Macérer 2 mois en remuant régulièrement.","Filtrer et mettre en bouteilles."] },

  { id:'lq-amere-feuilles', nom:'Liqueur Amère de Feuilles', cat:'liqueurs', themes:['medicinales'], gravure:'plante', degre:35, mac:56, macTxt:'8 semaines minimum', lot:1.3,
    tags:['romarin','citronnelle','laurier','sauge','camomille','sucre'],
    ing:[[1,'branche','romarin'],[10,'feuilles','citronnelle'],[10,'feuilles','citronnier'],[5,'feuilles','laurier frais'],[10,'feuilles','sauge'],[10,'fleurs','camomille'],[1,'L','alcool à 40°'],[300,'g','sucre'],[15,'cl','eau']],
    prep:["Dissoudre le sucre dans l'eau tiède, laisser refroidir.","Réunir toutes les feuilles et fleurs dans l'alcool, ajouter le sirop.","Macérer au minimum 8 semaines.","Filtrer et mettre en bouteilles."] },

  { id:'lq-anis-brizard', nom:"Liqueur à l'Anis Façon M. Brizard", cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['anis','badiane','fenouil','vanille','citron','sucre'],
    ing:[[20,'gouttes','essence d\'anis',false],[1,'pièce','jus d\'un demi-citron'],[10,'fleurs','badiane'],[1,'c. à café','graine de fenouil'],[0.5,'gousse','vanille'],[250,'g','sucre'],[15,'cl','eau'],[1,'L','alcool à 40°']],
    prep:["Broyer les aromates au mortier et les mélanger à l'alcool avec l'essence d'anis et le jus de citron.","Dissoudre le sucre dans l'eau tiède, laisser refroidir, puis l'ajouter à la préparation.","Macérer 4 semaines.","Filtrer ; laisser vieillir quelques mois avant de déguster."], vieil:'quelques mois' },

  { id:'lq-ecorce-chene', nom:"Liqueur à l'Écorce de Chêne", cat:'liqueurs', themes:['medicinales'], gravure:'racine', degre:37, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['écorce de chêne','sucre','eau-de-vie'],
    ing:[[2,'L','eau-de-vie à 40°'],[15,'cl','eau'],[500,'g','sucre'],[30,'g','écorce de chêne blanc']],
    prep:["Broyer finement l'écorce de chêne.","Dissoudre le sucre dans l'eau chaude, ajouter la poudre de chêne, donner quelques bouillons et laisser refroidir.","Ajouter l'alcool.","Macérer 2 mois en agitant de temps en temps, puis filtrer."] },

  { id:'lq-bourgeons-sapin', nom:'Liqueur aux Bourgeons de Sapin', cat:'liqueurs', themes:['plantes','medicinales'], gravure:'plante', degre:37, mac:1, macTxt:'12 heures', lot:2.6,
    tags:['sapin','bourgeons','sucre','eau-de-vie'],
    ing:[[200,'g','bourgeons de sapin'],[2,'L','eau-de-vie à 40°'],[600,'g','sucre'],[15,'cl','eau']],
    prep:["Verser l'eau-de-vie sur les bourgeons et laisser macérer 12 heures, puis filtrer.","Faire fondre le sucre dans l'eau et cuire le sirop jusqu'à la perle.","Mélanger le sirop refroidi à la macération.","Mettre en bouteilles."] },

  { id:'lq-douce-miel', nom:'Liqueur Douce au Miel', cat:'liqueurs', themes:['medicinales'], gravure:'plante', degre:30, mac:90, macTxt:'3 mois de repos', lot:2.6,
    tags:['miel','vanille','alcool'],
    ing:[[1,'kg','miel'],[2,'gousses','vanille'],[2,'L','alcool à 40°'],[15,'cl','eau']],
    prep:["Diluer le miel et l'eau, ajouter la vanille fendue.","Chauffer doucement 30 minutes sans bouillir, puis laisser refroidir.","Ajouter l'alcool et mettre en bocal.","Laisser reposer au minimum 3 mois avant de déguster."], vieil:'3 mois minimum' },

  { id:'lq-abricots', nom:"Liqueur d'Abricots", cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:37, mac:60, macTxt:'plusieurs semaines', lot:2.6,
    tags:['abricot','noyau','amande','sucre','alcool'],
    ing:[[2,'L','alcool à 40°'],[1,'kg','abricots bien mûrs'],[400,'g','sucre'],[15,'cl','eau']],
    prep:["Dénoyauter et découper les abricots en morceaux ; casser quelques noyaux pour en récupérer les amandes.","Dissoudre le sucre dans l'eau chaude, laisser refroidir.","Réunir les fruits, les amandes des noyaux et le sirop dans l'alcool.","Macérer plusieurs semaines, puis filtrer."] },

  { id:'lq-abricots-secs', nom:"Liqueur d'Abricots Secs", cat:'liqueurs', themes:['fruits','epices'], gravure:'fruit', degre:37, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['abricot','orange','badiane','sucre','alcool'],
    ing:[[300,'g','abricots secs'],[2,'L','alcool à 40°'],[300,'g','sucre'],[15,'cl','eau'],[2,'pièces','oranges non traitées'],[6,'fleurs','badiane']],
    prep:["Dissoudre le sucre dans l'eau chaude, laisser refroidir.","Couper les abricots en quartiers.","Réunir dans l'alcool les abricots, le sirop, la badiane, le zeste et le jus des oranges.","Macérer 2 mois, puis filtrer."] },

  { id:'lq-achillee', nom:"Liqueur d'Achillée Millefeuille", cat:'liqueurs', themes:['fleurs','medicinales'], gravure:'fleur', degre:37, mac:30, macTxt:'30 jours', lot:2.6,
    tags:['achillée','citron','sucre','alcool'],
    ing:[[2,'L','alcool à 40°'],[5,'bouquets','fleurs d\'achillée'],[400,'g','sucre'],[15,'cl','eau'],[1,'pièce','citron non traité']],
    prep:["Dissoudre le sucre dans l'eau chaude, laisser refroidir.","Réunir dans une jarre les fleurs d'achillée, le zeste et le jus du citron, et le sirop dans l'alcool.","Macérer 30 jours.","Filtrer et mettre en bouteilles."] },

  { id:'lq-amandes', nom:"Liqueur d'Amandes", cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:37, mac:60, macTxt:'2 mois', lot:2.7,
    tags:['amande','fleur d\'oranger','sucre','alcool'],
    ing:[[2,'L','alcool à 40°'],[300,'g','poudre d\'amande douce'],[50,'g','poudre d\'amande amère'],[1,'verre','eau de fleur d\'oranger'],[500,'g','sucre en poudre'],[15,'cl','eau']],
    prep:["Dissoudre le sucre dans l'eau à ébullition lente, ajouter les poudres d'amande et l'eau de fleur d'oranger.","Donner quelques bouillons, laisser reposer un jour, puis refroidir.","Ajouter l'alcool dans une jarre hermétique.","Macérer 2 mois, puis filtrer."] },

  { id:'lq-aneth', nom:"Liqueur d'Aneth", cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:30, macTxt:'1 mois', lot:2.6,
    tags:['aneth','sucre','alcool'],
    ing:[[100,'g','graines d\'aneth'],[2,'L','alcool à 40°'],[15,'cl','eau'],[300,'g','sucre']],
    prep:["Dissoudre le sucre dans l'eau chaude, laisser refroidir.","Réunir les graines d'aneth, le sirop et l'alcool dans une jarre.","Macérer 1 mois.","Filtrer et mettre en bouteilles."] },

  { id:'lq-artichauts', nom:"Liqueur Amère d'Artichauts", cat:'liqueurs', themes:['medicinales'], gravure:'plante', degre:37, mac:30, macTxt:'1 mois + 5 jours', lot:2.6,
    tags:['artichaut','sucre','alcool'],
    ing:[[1,'kg','tiges d\'artichauts'],[200,'g','feuilles d\'artichauts'],[400,'g','sucre'],[15,'cl','eau'],[2,'L','alcool à 40°']],
    prep:["Couper les tiges en tronçons d'un centimètre.","Faire macérer tiges et feuilles un mois dans l'alcool.","Préparer un sirop avec l'eau et le sucre et l'ajouter à la macération.","Laisser reposer 5 jours, puis filtrer."] },

  { id:'lq-bananes', nom:'Liqueur de Bananes', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:30, macTxt:'1 mois + 5 jours', lot:2.6,
    tags:['banane','vanille','sucre','alcool'],
    ing:[[2,'L','alcool à 40°'],[300,'g','sucre'],[15,'cl','eau'],[500,'g','bananes fraîches peu mûres'],[1,'gousse','vanille']],
    prep:["Peler et écraser les bananes, les couvrir d'alcool et ajouter la vanille fendue et ses graines.","Macérer 1 mois.","Ajouter le sirop (sucre + eau) refroidi et prolonger 5 jours.","Passer au chinois, filtrer et mettre en bouteilles."] },

  { id:'lq-celeri', nom:'Liqueur de Céleri', cat:'liqueurs', themes:['epices'], gravure:'plante', degre:35, mac:20, macTxt:'20 jours', lot:1.6,
    tags:['céleri','coriandre','badiane','sucre','alcool'],
    ing:[[1,'kg','tiges de céleri frais'],[10,'g','coriandre fraîche'],[5,'étoiles','badiane'],[1,'L','alcool à 40°'],[1,'verre','eau'],[500,'g','sucre']],
    prep:["Laver et couper les tiges de céleri en petits tronçons.","Préparer un sirop avec l'eau et le sucre.","Réunir dans une jarre le céleri, l'alcool, le sirop, la coriandre ciselée et la badiane.","Macérer 20 jours, puis filtrer."] },

  { id:'lq-chataignes', nom:'Liqueur de Châtaignes', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:37, mac:90, macTxt:'plusieurs mois', lot:2.6,
    tags:['châtaigne','vanille','sucre','alcool'],
    ing:[[2,'kg','châtaignes fraîches'],[2,'L','alcool à 40°'],[1,'gousse','vanille'],[400,'g','sucre'],[1,'verre','eau']],
    prep:["Laisser sécher les châtaignes une à deux semaines, les décortiquer et broyer la chair.","Réunir dans une jarre la chair, l'alcool, la vanille fendue et le sirop (sucre + eau).","Macérer plusieurs mois dans un coin sombre.","Filtrer et mettre en bouteilles."] },

  { id:'lq-chevrefeuille', nom:'Liqueur de Chèvrefeuille', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['chèvrefeuille','fleurs','sucre','alcool'],
    ing:[[500,'g','fleurs de chèvrefeuille'],[400,'g','sucre'],[2,'L','alcool à 40°'],[15,'cl','eau']],
    prep:["Préparer un sirop avec l'eau et le sucre.","Immerger les fleurs dans le liquide chaud quelques heures.","Ajouter l'alcool et mettre en jarre.","Macérer 2 mois, puis filtrer."] },

  { id:'lq-coco', nom:'Liqueur de Coco', cat:'cremes', themes:['fruits','epices'], gravure:'fruit', degre:25, mac:90, macTxt:'3 mois minimum', lot:2.8,
    tags:['coco','vanille','amande','cannelle','citron vert','rhum'],
    ing:[[1,'L','rhum planteur blanc à 55°'],[1,'L','lait de coco'],[600,'g','sucre'],[2,'gousses','vanille'],[1,'c. à s.','extrait d\'amande amère'],[1,'c. à s.','cannelle râpée'],[1,'pièce','zeste et jus d\'un citron vert'],[1,'pincée','macis',false]],
    prep:["Dissoudre le sucre dans le lait de coco tiède, laisser refroidir.","Ajouter le rhum, puis la vanille, l'amande amère, la cannelle, le zeste et le jus de citron vert et le macis.","Verser en jarre.","Macérer au minimum 3 mois."], vieil:'3 mois minimum' },

  { id:'lq-epices', nom:'Liqueur aux Épices', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:90, macTxt:'3 mois', lot:2.7,
    tags:['anis','badiane','coriandre','cumin','carvi','fenouil','genièvre','sucre'],
    ing:[[10,'g','graines d\'anis'],[10,'g','graines de badiane'],[10,'g','graines de coriandre'],[10,'g','graines de cumin'],[10,'g','graines de carvi'],[10,'g','graines de fenouil'],[10,'g','graines de genièvre'],[1,'bouquet','aneth frais'],[2,'L','alcool à 40°'],[600,'g','sucre'],[15,'cl','eau']],
    prep:["Broyer les épices au mortier.","Dissoudre le sucre dans l'eau chaude, laisser refroidir.","Réunir les épices, l'aneth et le sirop dans une bonbonne, ajouter l'alcool.","Macérer 3 mois en remuant régulièrement, puis filtrer."] },

  { id:'lq-fenouil-sauvage', nom:'Liqueur de Fleurs de Fenouil Sauvage', cat:'liqueurs', themes:['fleurs','epices'], gravure:'fleur', degre:37, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['fenouil','fleurs','sucre','alcool'],
    ing:[[50,'fleurs','fenouil sauvage'],[2,'L','alcool à 40°'],[600,'g','sucre'],[1,'verre','eau']],
    prep:["Mettre les sommités de fenouil dans l'alcool.","Préparer un sirop avec le sucre et l'eau, laisser refroidir.","Mélanger le sirop à l'alcool.","Macérer 2 mois, puis filtrer."] },

  { id:'lq-fraises-tagada', nom:'Liqueur de Fraises Tagada', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:37, mac:10, macTxt:'10 jours', lot:2.4,
    tags:['fraise tagada','bonbon','alcool'],
    ing:[[15,'cl','eau'],[500,'g','fraises Tagada'],[2,'L','alcool à 40°']],
    prep:["Faire dissoudre doucement les fraises Tagada dans l'eau à petit bouillon, laisser refroidir.","Incorporer doucement l'alcool en remuant.","Macérer 10 jours.","Filtrer et mettre en bouteilles."] },

  { id:'lq-fleur-oranger', nom:"Liqueur à la Fleur d'Oranger", cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:37, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['fleur d\'oranger','sucre','alcool'],
    ing:[[100,'g','fleurs sèches d\'oranger'],[2,'L','alcool à 40°'],[400,'g','sucre'],[15,'cl','eau'],[1,'verre','eau de fleurs d\'oranger']],
    prep:["Chauffer l'eau pour dissoudre le sucre, laisser refroidir complètement.","Réunir toutes les fleurs, le sirop et l'eau de fleur d'oranger dans l'alcool.","Mettre en jarre.","Macérer 2 mois, puis filtrer."] },

  { id:'lq-acacias', nom:"Liqueur aux Fleurs d'Acacias", cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:14, macTxt:'2 semaines au soleil', lot:2.6,
    tags:['acacia','fleurs','cannelle','girofle','sucre'],
    ing:[[300,'g','sucre en poudre'],[15,'cl','eau'],[500,'g','fleurs d\'acacias'],[2,'L','eau-de-vie à 40°'],[2,'bâtons','cannelle'],[4,'clous','girofle']],
    prep:["Faire une décoction des fleurs 15 minutes avec le sucre et l'eau, laisser reposer 12 heures.","Ajouter l'alcool, la cannelle et le girofle.","Macérer 2 semaines au soleil.","Filtrer ; laisser vieillir au minimum 2 mois."], vieil:'2 mois minimum' },

  { id:'lq-alise', nom:"Liqueur d'Alise", cat:'liqueurs', themes:['fruits','epices'], gravure:'fruit', degre:35, mac:56, macTxt:'8 semaines', lot:1.6,
    tags:['alise','alisier','cannelle','vanille','sucre'],
    ing:[[1,'kg','fruits d\'alisier'],[1,'L','eau-de-vie de fruits à 40°'],[300,'g','sucre'],[1,'bâton','cannelle'],[1,'gousse','vanille'],[1,'verre','eau']],
    prep:["Faire macérer 8 semaines les fruits, la cannelle, la vanille fendue et le sucre dilué dans l'eau.","Filtrer.","Laisser reposer une semaine après l'ajout du sirop.","Filtrer une dernière fois ; vieillir au minimum 2 mois."], vieil:'2 mois minimum' },

  { id:'lq-alkermes', nom:"Liqueur d'Alkermes (1460)", cat:'liqueurs', themes:['historiques','epices'], gravure:'epice', degre:35, mac:14, macTxt:'2 semaines au soleil', lot:2.7,
    tags:['cannelle','girofle','coriandre','cardamome','badiane','vanille','eau de rose'],
    ing:[[1,'bâton','vanille'],[3,'g','clous de girofle'],[12,'g','cannelle'],[12,'g','coriandre'],[3.5,'g','cardamome'],[3,'g','badiane'],[2,'L','alcool à 40°'],[600,'g','sucre'],[15,'cl','eau bouillie'],[80,'g','eau de rose'],[6,'g','cochenille (facultatif)',false]],
    prep:["Broyer les épices.","Réunir épices et alcool, exposer 2 semaines au soleil en agitant chaque jour.","Ajouter un sirop de sucre et d'eau, laisser reposer un jour, puis filtrer.","Parfumer à l'eau de rose (et colorer à la cochenille si désiré)."],
    histoire:"Recette d'inspiration médiévale (datée 1460) : l'alkermes, liqueur épicée et parfumée à l'eau de rose, tirait jadis sa couleur écarlate de la cochenille." },

  { id:'lq-noyaux-peches', nom:"Liqueur d'Amandes de Noyaux de Pêches", cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:60, macTxt:'2 mois au soleil', lot:1.6,
    tags:['noyau','pêche','abricot','amande','vanille','sucre'],
    ing:[[40,'pièces','noyaux d\'abricots'],[30,'pièces','noyaux de pêches'],[1,'L','eau-de-vie à 40°'],[1,'gousse','vanille'],[300,'g','sucre'],[1,'verre','eau']],
    prep:["Mettre les noyaux entiers, plus 5 noyaux de pêches et 10 d'abricots concassés, en bocal avec la vanille.","Macérer 2 mois à l'extérieur, au soleil, puis filtrer.","Ajouter le sirop tiède et laisser reposer une semaine.","Filtrer une dernière fois."], vieil:'2 mois minimum' },

  { id:'lq-ananas', nom:"Liqueur d'Ananas", cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:30, mac:30, macTxt:'1 mois', lot:1.4,
    tags:['ananas','sucre de canne','eau-de-vie'],
    ing:[[1,'pièce','ananas mûr'],[1,'L','eau-de-vie à 40°'],[25,'cl','sirop de sucre de canne']],
    prep:["Éplucher l'ananas et le couper en dés.","Macérer un mois dans l'eau-de-vie.","Filtrer en pressant pour extraire le jus, puis ajouter le sucre de canne.","Laisser reposer une semaine, filtrer et servir frais."], vieil:'1 mois minimum' },

  { id:'lq-angelique', nom:"Liqueur d'Angélique", cat:'liqueurs', themes:['medicinales','epices'], gravure:'plante', degre:35, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['angélique','vanille','girofle','cannelle','sucre'],
    ing:[[600,'g','tiges d\'angélique'],[200,'g','graines d\'angélique'],[1,'gousse','vanille'],[2,'clous','girofle'],[1,'bâton','cannelle'],[2,'L','eau-de-vie à 40°'],[500,'g','sucre'],[15,'cl','eau']],
    prep:["Faire macérer 2 mois l'angélique, les graines et les épices dans l'eau-de-vie.","Filtrer en pressant.","Ajouter le sirop tiède et laisser reposer une semaine.","Filtrer ; vieillir quelques semaines."], vieil:'quelques semaines' },

  { id:'lq-angleterre', nom:"Liqueur d'Angleterre", cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:30, macTxt:'30 jours', lot:1.4,
    tags:['amande','citron','angélique','coriandre','sucre'],
    ing:[[1,'L','eau-de-vie à 45°'],[12,'pièces','amandes amères'],[6,'g','zestes de citron'],[3,'g','graines d\'angélique'],[3,'g','cachou'],[3,'g','graines de coriandre'],[300,'g','sucre'],[1,'verre','eau']],
    prep:["Monder les amandes, zester finement le citron, broyer les aromates au mortier.","Réunir le tout dans l'alcool et macérer 30 jours en agitant régulièrement.","Ajouter le sirop de sucre et d'eau, laisser reposer quelques jours en remuant.","Filtrer."] },

  { id:'lq-anis', nom:"Liqueur d'Anis", cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['anis','macis','girofle','vanille','sucre'],
    ing:[[30,'g','anis en grain'],[2,'L','eau-de-vie à 40°'],[2,'c. à café','macis'],[5,'clous','girofle'],[1,'gousse','vanille'],[500,'g','sucre'],[15,'cl','eau']],
    prep:["Préparer un sirop avec l'eau et le sucre.","Réunir tous les ingrédients dans l'alcool avec le sirop.","Macérer 2 mois en agitant régulièrement.","Filtrer, laisser reposer quelques jours, puis filtrer fin."] },

  { id:'lq-asperule', nom:"Liqueur d'Aspérule", cat:'liqueurs', themes:['fleurs','medicinales'], gravure:'fleur', degre:37, mac:60, macTxt:'2 mois à l\'obscurité', lot:2.2,
    tags:['aspérule','fleurs','sucre'],
    ing:[[2,'poignées','fleurs d\'aspérule'],[500,'g','sucre'],[1,'L','eau-de-vie à 90°'],[1,'L','eau']],
    prep:["Cueillir les fleurs en début de floraison (mai) et les laver.","Préparer un sirop avec le sucre et l'eau, laisser refroidir.","Réunir l'alcool, les fleurs et le sirop.","Macérer 2 mois à l'obscurité, puis filtrer."] },

  { id:'lq-aubepine', nom:"Liqueur d'Aubépine", cat:'liqueurs', themes:['fleurs','medicinales'], gravure:'fleur', degre:35, mac:28, macTxt:'4 semaines', lot:1.4,
    tags:['aubépine','amande','sucre','alcool'],
    ing:[[2,'kg','aubépine'],[100,'g','amandes'],[1,'L','alcool de fruits à 40°'],[300,'g','sucre'],[1,'verre','eau']],
    prep:["Écraser l'aubépine et la mélanger aux amandes broyées.","Ajouter l'alcool et le sucre dilué dans le verre d'eau.","Macérer 4 semaines.","Filtrer et mettre en bouteilles."] },

  { id:'lq-basilic', nom:'Liqueur de Basilic', cat:'liqueurs', themes:['plantes'], gravure:'plante', degre:35, mac:60, macTxt:'2 mois à l\'obscurité', lot:2.6,
    tags:['basilic','sucre','alcool'],
    ing:[[2,'L','eau-de-vie à 40°'],[200,'feuilles','basilic'],[500,'g','sucre'],[15,'cl','eau']],
    prep:["Faire macérer les feuilles dans l'alcool 2 mois (bocal fermé, à l'obscurité).","Préparer un sirop, le laisser refroidir et le mélanger.","Laisser reposer au moins 8 jours.","Filtrer et mettre en bouteilles."], vieil:'8 jours minimum' },

  { id:'lq-betterave', nom:'Liqueur de Betterave', cat:'liqueurs', themes:['plantes'], gravure:'racine', degre:35, mac:15, macTxt:'15 jours', lot:1.4,
    tags:['betterave','sucre','alcool'],
    ing:[[1,'L','eau-de-vie à 40°'],[300,'g','sucre'],[1,'verre','eau'],[500,'g','betterave']],
    prep:["Découper la betterave crue en cubes.","Réunir avec l'alcool et le sucre dilué dans l'eau.","Macérer 15 jours.","Filtrer et mettre en bouteilles."] },

  { id:'lq-bissap', nom:'Liqueur de Bissap', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:28, macTxt:'4 semaines à l\'ombre', lot:2.6,
    tags:['hibiscus','bissap','sucre','alcool'],
    ing:[[500,'g','fleurs séchées d\'hibiscus'],[2,'L','alcool à 40°'],[500,'g','sucre'],[15,'cl','eau']],
    prep:["Faire une décoction des fleurs d'hibiscus 30 minutes, dissoudre le sucre.","Laisser refroidir, puis ajouter l'alcool.","Macérer 4 semaines à l'ombre.","Filtrer et mettre en bouteilles."] },

  { id:'lq-bouillon-blanc', nom:'Liqueur de Bouillon Blanc', cat:'liqueurs', themes:['fleurs','medicinales'], gravure:'fleur', degre:35, mac:30, macTxt:'1 mois', lot:2.6,
    tags:['bouillon blanc','fleurs','sucre','eau-de-vie'],
    ing:[[2,'L','eau-de-vie à 40°'],[1,'bouquet','fleurs de bouillon blanc'],[500,'g','sucre en poudre'],[15,'cl','eau']],
    prep:["Remplir un bocal d'alcool et y ajouter les fleurs en pressant.","Macérer un mois, puis filtrer.","Ajouter le sirop froid et laisser reposer quelques jours.","Filtrer une dernière fois."], vieil:'quelques jours' },

  { id:'rh-44', nom:'Rhum 44', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:44, macTxt:'44 jours', lot:1.2,
    tags:['orange','café','vanille','sucre de canne','rhum ambré'],
    ing:[[1,'L','rhum ambré à 50°'],[1,'pièce','orange non traitée'],[44,'grains','café'],[22,'cl','sucre de canne'],[1,'gousse','vanille']],
    prep:["Percer l'orange et y insérer les 44 grains de café.","Verser le rhum dans un bocal, ajouter la vanille fendue et le sucre de canne.","Suspendre l'orange au-dessus du rhum avec une gaze et une ficelle.","Macérer 44 jours."] },

  { id:'rh-vanille-macadamia', nom:'Rhum Vanille et Noix de Macadamia', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['vanille','macadamia','noix','sucre de canne'],
    ing:[[1,'L','rhum blanc à 50°'],[4,'gousses','vanille'],[125,'g','noix de Macadamia'],[20,'cl','sucre de canne']],
    prep:["Fendre les gousses de vanille et récupérer les graines.","Réunir en bocal la vanille, ses graines, les noix de Macadamia, le sucre et le rhum.","Macérer 3 mois en secouant régulièrement."] },

  { id:'rh-ananas', nom:"Rhum à l'Ananas", cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.2,
    tags:['ananas','sucre de canne','rhum agricole'],
    ing:[[1,'pièce','ananas mûr'],[20,'cl','sirop de sucre de canne'],[1,'L','rhum agricole à 50°']],
    prep:["Éplucher l'ananas (retirer les yeux) et le couper en morceaux adaptés au goulot.","Placer en bocal avec le sucre de canne et le rhum.","Fermer hermétiquement et macérer 8 semaines."] },

  { id:'rh-vaudou', nom:'Rhum Vaudou', cat:'rhums', themes:['fruits','epices'], gravure:'epice', degre:40, mac:120, macTxt:'4 mois', lot:1.2,
    tags:['banane','mangue','papaye','datte','gingembre','piment','cannelle','muscade','citronnelle'],
    ing:[[250,'g','sirop de cassonade'],[75,'g','banane mûre'],[75,'g','mangue'],[3,'pièces','dattes'],[70,'g','papaye'],[4,'clous','girofle'],[15,'g','gingembre'],[2,'pièces','piments oiseaux'],[2,'bâtons','cannelle'],[2,'pincées','noix de muscade',false],[10,'g','citronnelle'],[4,'grains','poivre noir'],[1,'L','rhum blanc à 40°']],
    prep:["Couper les fruits finement et broyer les épices sèches.","Réunir tous les ingrédients en bocal avec le rhum.","Retirer les piments après un mois.","Poursuivre la macération jusqu'à 4 mois au total."] },

  { id:'rh-banane', nom:'Rhum à la Banane', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['banane','sucre de canne','rhum agricole'],
    ing:[[1,'kg','bananes'],[1,'L','rhum blanc agricole à 50°'],[10,'cl','sirop de sucre de canne']],
    prep:["Couper les bananes en morceaux et les mettre en bocal.","Ajouter le rhum agricole et le sirop de canne.","Macérer 3 mois."] },

  { id:'rh-abricots-antilles', nom:'Rhum aux Abricots des Antilles', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['abricot','vanille','noyau','rhum blanc'],
    ing:[[500,'g','abricots des Antilles'],[15,'cl','sucre de canne'],[1,'gousse','vanille Bourbon'],[1,'L','rhum blanc à 50°']],
    prep:["Détailler la chair des abricots et casser les noyaux.","Ajouter la vanille fendue et ses graines grattées.","Réunir le tout en bocal avec le rhum et le sucre.","Macérer 3 mois."] },

  { id:'rh-cerise-citronnee', nom:'Rhum à la Cerise Citronnée', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:40, mac:90, macTxt:'90 jours', lot:1.2,
    tags:['cerise','citron vert','vanille','noyau','sucre de canne'],
    ing:[[1,'L','rhum blanc à 40°'],[40,'pièces','cerises'],[1,'pièce','citron vert'],[1,'gousse','vanille'],[250,'g','sucre de canne']],
    prep:["Éplucher le citron (retirer le blanc) et le couper en tranches avec son zeste.","Couper les cerises en deux en conservant quelques noyaux écrasés.","Réunir en bocal avec la vanille fendue et le sucre.","Retirer le citron après un mois ; macérer 90 jours au total."] },

  { id:'rh-acai', nom:'Rhum Açaï', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.7,
    tags:['açaï','baies','cannelle','poivre','sucre de canne'],
    ing:[[200,'g','baies d\'açaï'],[1.5,'L','rhum à 50°'],[15,'cl','sirop de canne'],[1,'bâton','cannelle'],[15,'grains','poivre noir']],
    prep:["Réduire grossièrement le poivre et la cannelle en poudre.","Légèrement broyer les baies d'açaï.","Réunir épices, baies, sirop et rhum en bocal.","Macérer 2 mois."] },

  { id:'rh-couille-singe-tagada', nom:'Rhum Couille de Singe et Fraises Tagada', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:30, macTxt:'jusqu\'à dissolution des bonbons', lot:1.1,
    tags:['fraise tagada','bonbon','rhum'],
    ing:[[30,'pièces','fraises Tagada'],[20,'pièces','bonbons « couilles de singe »'],[1,'L','rhum à 50°']],
    prep:["Mettre les bonbons et les fraises Tagada en bocal.","Verser le rhum.","Remuer et laisser macérer en secouant régulièrement jusqu'à dissolution."] },

  { id:'rh-acerola', nom:'Rhum Acérola', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.7,
    tags:['acérola','sucre de canne','rhum blanc'],
    ing:[[1,'kg','acérola'],[1.5,'L','rhum blanc à 50°'],[15,'cl','sirop de canne']],
    prep:["Laver les fruits et les couper en tronçons.","Réunir en bocal le sirop, les fruits et le rhum.","Macérer 2 mois, puis filtrer et mettre en bouteille."] },

  { id:'rh-hibiscus', nom:"Rhum à la Fleur d'Hibiscus", cat:'rhums', themes:['fleurs'], gravure:'fleur', degre:40, mac:90, macTxt:'3 mois minimum', lot:1.2,
    tags:['hibiscus','fleurs','sucre de canne','rhum blanc'],
    ing:[[75,'g','fleurs d\'hibiscus'],[25,'cl','sucre de canne'],[1,'L','rhum blanc à 40°']],
    prep:["Verser le rhum en bocal en laissant un peu d'espace.","Ajouter les fleurs d'hibiscus et le sucre de canne, remuer doucement.","Fermer hermétiquement et macérer 3 mois minimum."], vieil:'3 mois minimum' },

  { id:'rh-ananas-piment', nom:"Rhum à l'Ananas et Piment", cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois à l\'ombre', lot:1.2,
    tags:['ananas','piment','sucre de canne','rhum agricole'],
    ing:[[1,'pièce','ananas mûr'],[20,'cl','sucre de canne'],[1,'L','rhum agricole à 50°'],[10,'pièces','piments oiseaux']],
    prep:["Découper et peler l'ananas, broyer légèrement les piments.","Réunir le tout en bocal avec le sucre et le rhum.","Macérer 2 mois à l'ombre."] },

  { id:'rh-fraise', nom:'Rhum à la Fraise', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.8,
    tags:['fraise','sucre de canne','rhum agricole'],
    ing:[[1.5,'L','rhum agricole à 50°'],[1.5,'kg','fraises fraîches'],[15,'cl','sirop de canne']],
    prep:["Équeuter les fraises et les couper en quartiers.","Les placer dans un grand bocal avec le rhum et le sucre de canne.","Macérer 3 mois en remuant régulièrement."] },

  { id:'rh-arbouses', nom:'Rhum aux Arbouses', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:45, mac:42, macTxt:'6 semaines', lot:1.7,
    tags:['arbouse','thym','sucre de canne','rhum blanc'],
    ing:[[1,'kg','arbouses des garrigues'],[1,'bouquet','thym'],[15,'cl','sucre de canne'],[1.5,'L','rhum blanc']],
    prep:["Laver les arbouses et les couper en quartiers.","Réunir en bocal avec le thym, le sucre et le rhum.","Macérer 6 semaines."] },

  { id:'rh-cacahuete', nom:'Rhum Liqueur de Cacahuète', cat:'cremes', themes:['fruits','epices'], gravure:'fruit', degre:25, mac:6, macTxt:'5 à 6 jours de repos', lot:1.2,
    tags:['cacahuète','lait','muscade','cannelle','rhum'],
    ing:[[250,'g','cacahuètes'],[200,'ml','rhum à 50°'],[400,'ml','lait concentré sucré'],[400,'ml','lait demi-écrémé'],[1,'c. à café','noix de muscade'],[1,'c. à café','cannelle']],
    prep:["Mixer les cacahuètes, les deux laits et les épices jusqu'à texture lisse.","Chauffer à feu moyen 5 minutes en remuant.","Ajouter le rhum, laisser refroidir.","Mettre en bouteille ; reposer 5 à 6 jours."] },

  { id:'rh-mangue-betterave', nom:'Rhum à la Mangue et à la Betterave', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['mangue','betterave','sucre roux','rhum agricole'],
    ing:[[2,'pièces','mangues'],[300,'g','betterave'],[1,'L','rhum blanc agricole à 50°'],[50,'g','sucre roux']],
    prep:["Éplucher et couper la mangue et la betterave en petits morceaux.","Réunir en bocal avec le rhum agricole et le sucre.","Bien mélanger et macérer 3 mois."] },

  { id:'rh-banane-cannelle', nom:'Rhum Banane et Cannelle', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.2,
    tags:['banane séchée','vanille','cannelle','sucre de canne'],
    ing:[[1,'L','rhum agricole à 50°'],[300,'g','bananes sèches'],[15,'cl','sirop de canne'],[1,'bâton','vanille'],[1,'bâton','cannelle']],
    prep:["Faire un caramel léger avec le sirop, y ajouter la vanille fendue et ses graines.","Laisser refroidir et dissoudre dans le rhum.","Ajouter la cannelle et les bananes sèches.","Macérer 8 semaines."] },

  { id:'rh-menthe-sauvage', nom:'Rhum à la Menthe Sauvage', cat:'rhums', themes:['plantes'], gravure:'plante', degre:50, mac:60, macTxt:'2 mois à l\'ombre', lot:3.2,
    tags:['menthe','sucre de canne','rhum blanc'],
    ing:[[200,'g','menthe sauvage'],[3,'L','rhum blanc des Antilles'],[30,'cl','sucre de canne']],
    prep:["Mettre le rhum en bocal, ajouter la menthe et le sucre de canne.","Remuer régulièrement.","Macérer 2 mois à l'ombre et au sec."] },

  { id:'rh-poire', nom:'Rhum à la Poire', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['poire','sucre de canne','rhum agricole'],
    ing:[[1,'kg','poires mûres de saison'],[1,'L','rhum blanc agricole à 50°'],[25,'cl','sirop de canne']],
    prep:["Éplucher les poires, retirer les pépins et les couper en petits morceaux.","Réunir en bocal avec le rhum et le sucre de canne.","Bien mélanger et macérer 3 mois."] },

  { id:'rh-bounty', nom:'Rhum au Bounty', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['bounty','coco','chocolat','rhum agricole'],
    ing:[[20,'pièces','Bounty'],[1,'L','rhum agricole à 50°']],
    prep:["Couper les Bounty en deux.","Les ajouter au rhum en bouteille.","Conserver en endroit sombre et sec ; macérer 2 mois."] },

  { id:'rh-coco-vanille', nom:'Rhum au Coco', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:0.3,
    tags:['coco','vanille','rhum blanc'],
    ing:[[20,'cl','rhum blanc à 50°'],[1,'pièce','noix de coco'],[1,'gousse','vanille']],
    prep:["Percer la noix de coco (22 mm) et en vider l'eau.","Glisser la gousse de vanille à l'intérieur et la remplir de rhum.","Macérer 3 mois."] },

  { id:'rh-tonka', nom:'Rhum aux Fèves de Tonka', cat:'rhums', themes:['epices'], gravure:'epice', degre:50, mac:30, macTxt:'1 mois minimum', lot:1.2,
    tags:['tonka','sucre de canne','rhum ambré'],
    ing:[[3,'pièces','fèves de tonka'],[50,'g','sucre de canne'],[1,'L','rhum ambré à 50°']],
    prep:["Broyer les fèves de tonka au mortier.","Réunir tous les ingrédients en bocal.","Macérer un mois minimum."], vieil:'1 mois minimum' },

  { id:'rh-gingembre', nom:'Rhum au Gingembre', cat:'rhums', themes:['epices'], gravure:'racine', degre:55, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['gingembre','vanille','cannelle','sucre de canne'],
    ing:[[1,'L','rhum blanc agricole à 55°'],[2,'gousses','vanille'],[500,'g','gingembre'],[1,'bâton','cannelle'],[2,'c. à s.','sucre de canne']],
    prep:["Rompre la cannelle, fendre la vanille et récupérer les graines.","Laver le gingembre et le couper en petits morceaux.","Réunir le tout dans le rhum.","Macérer 3 mois en remuant une fois par semaine."] },

  { id:'rh-raisin-muscat', nom:'Rhum au Raisin Muscat', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:42, macTxt:'6 semaines', lot:1.8,
    tags:['raisin','muscat','figue','cannelle','sucre de canne'],
    ing:[[1,'kg','raisin muscat bien sucré'],[10,'cl','sirop de canne'],[1.5,'L','rhum blanc à 50°'],[3,'pièces','figues sèches'],[1,'bâton','cannelle']],
    prep:["Écraser les raisins en conservant pulpe, peaux et pépins.","Ajouter le sirop de canne, la cannelle et les figues.","Couvrir de rhum blanc.","Macérer 6 semaines."] },

  { id:'rh-figues-fraiches', nom:'Rhum aux Figues Fraîches', cat:'rhums', themes:['fruits','fleurs'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.8,
    tags:['figue','lavande','cannelle','sucre de canne'],
    ing:[[500,'g','figues fraîches'],[1,'bâton','cannelle'],[50,'g','fleurs de lavande'],[15,'cl','sirop de canne'],[1.5,'L','rhum blanc à 50°']],
    prep:["Broyer finement les épices au mortier.","Réunir tous les éléments en bocal.","Macérer 8 semaines en remuant chaque semaine."] },

  { id:'rh-abricots', nom:'Rhum aux Abricots', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.1,
    tags:['abricot','noyau','sucre de canne','rhum agricole'],
    ing:[[10,'pièces','abricots'],[90,'cl','rhum blanc agricole à 50°'],[10,'cl','sucre de canne']],
    prep:["Couper les abricots et les mettre en bocal avec leurs noyaux broyés.","Ajouter le rhum et le sucre, bien remuer.","Conserver à l'ombre et au sec ; macérer 2 mois."] },

  { id:'rh-epices', nom:'Rhum aux Épices', cat:'rhums', themes:['epices'], gravure:'epice', degre:50, mac:90, macTxt:'3 mois', lot:2.2,
    tags:['cannelle','poivre','girofle','cumin','muscade','vanille','gingembre','piment'],
    ing:[[2,'L','rhum blanc à 50°'],[5,'bâtons','cannelle'],[10,'grains','poivre noir'],[10,'clous','girofle'],[1,'pincée','cumin',false],[0.25,'c. à s.','noix de muscade'],[2,'gousses','vanille'],[1,'pièce','piment oiseau'],[10,'c. à café','sucre roux'],[1,'pièce','gros pouce de gingembre']],
    prep:["Laver et peler le gingembre, fendre la vanille et récupérer les graines.","Réunir tous les ingrédients en bocal avec le rhum.","Macérer 3 mois."] },

  { id:'rh-fraises-tagada', nom:'Rhum aux Fraises Tagada', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:30, macTxt:'1 mois', lot:0.8,
    tags:['fraise tagada','bonbon','rhum blanc'],
    ing:[[70,'cl','rhum blanc à 50°'],[60,'pièces','fraises Tagada']],
    prep:["Couper les fraises Tagada en morceaux.","Les laisser fondre et macérer dans le rhum 1 mois.","Filtrer et mettre en bouteille."] },

  { id:'rh-kiwis-jaunes', nom:'Rhum aux Kiwis Jaunes', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['kiwi','cassonade','rhum agricole'],
    ing:[[100,'g','sirop de cassonade'],[6,'pièces','kiwis jaunes'],[1,'L','rhum blanc agricole à 50°']],
    prep:["Laver les kiwis et les couper en fines tranches.","Réunir en bocal avec le sirop et le rhum.","Macérer 2 mois."] },

  { id:'rh-pommes-tatin', nom:'Rhum aux Pommes Façon Tatin', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:55, mac:60, macTxt:'2 mois', lot:1.3,
    tags:['pomme','vanille','sucre de canne','rhum ambré'],
    ing:[[1,'L','rhum ambré à 55°'],[5,'pièces','pommes'],[1,'gousse','vanille'],[3,'c. à s.','sirop de canne']],
    prep:["Couper les pommes en quartiers et les faire revenir à sec.","Réunir en bocal pommes, vanille fendue, sirop et rhum.","Filtrer le dépôt après deux semaines.","Macérer 2 mois à l'ombre."] },

  { id:'rh-brulant', nom:'Rhum Brûlant', cat:'rhums', themes:['epices'], gravure:'epice', degre:40, mac:30, macTxt:'30 jours et plus', lot:1.2,
    tags:['piment','cannelle','sucre de canne','rhum blanc'],
    ing:[[15,'pièces','piments oiseaux'],[100,'g','sucre de canne'],[1,'L','rhum blanc à 40°'],[0.5,'bâton','cannelle']],
    prep:["Mettre les piments en bocal et les ramollir dans le rhum.","Macérer environ 30 jours.","Ajouter ensuite la cannelle et le sucre de canne."] },

  { id:'rh-cafe-vanille', nom:'Rhum Café et Vanille', cat:'rhums', themes:['epices'], gravure:'epice', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['café','vanille','rhum blanc'],
    ing:[[40,'g','café'],[1,'gousse','vanille'],[1,'L','rhum blanc à 50°']],
    prep:["Broyer grossièrement les grains de café au mortier.","Fendre la vanille et récupérer les graines.","Réunir café, vanille et rhum en bocal.","Macérer 2 mois."] },

  { id:'rh-canneberge-framboise', nom:'Rhum Canneberge et Framboise à la Vanille', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['canneberge','framboise','vanille','cassonade','rhum agricole'],
    ing:[[150,'g','sirop de cassonade'],[50,'g','canneberges'],[200,'g','framboises'],[2,'gousses','vanille'],[1,'L','rhum blanc agricole à 50°']],
    prep:["Broyer légèrement les canneberges et couper les framboises.","Fendre la vanille et récupérer les graines.","Réunir tous les ingrédients dans un grand bocal.","Macérer 3 mois."] },

  { id:'rh-caramel', nom:'Rhum Caramel', cat:'rhums', themes:['epices'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois minimum', lot:1.3,
    tags:['carambar','caramel','sucre de canne','rhum ambré'],
    ing:[[1,'L','rhum ambré agricole à 50°'],[25,'pièces','Carambars caramel'],[30,'cl','sirop de canne']],
    prep:["Verser le sirop de canne en bocal, ajouter les Carambars en tronçons puis le rhum.","Secouer tous les 2-3 jours jusqu'à dissolution.","Macérer 2 mois à l'ombre."], vieil:'2 mois minimum' },

  { id:'rh-cassis-groseille', nom:'Rhum Cassis et Groseille', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'60 + 30 jours', lot:1.2,
    tags:['cassis','groseille','cannelle','cassonade','rhum blanc'],
    ing:[[100,'g','sirop de cassonade'],[250,'g','cassis'],[250,'g','groseilles'],[1,'L','rhum blanc à 50°'],[1,'bâton','cannelle']],
    prep:["Broyer légèrement le cassis et la groseille au mortier.","Réunir en bocal avec le rhum et le sirop ; macérer 60 jours.","Ajouter la cannelle broyée et macérer 30 jours de plus."] },

  { id:'rh-citron-gingembre', nom:'Rhum Citron et Gingembre', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:55, mac:30, macTxt:'30 jours', lot:1.2,
    tags:['citron','gingembre','sucre de canne','rhum blanc'],
    ing:[[2,'pièces','citrons verts'],[2,'pièces','citrons jaunes'],[1,'racine','gingembre moyenne'],[1,'L','rhum blanc à 55°'],[20,'cl','sirop de canne']],
    prep:["Couper les citrons et émincer le gingembre.","Réunir en bocal avec le rhum et le sirop.","Macérer 30 jours."] },

  { id:'rh-citron-gingembre-piment', nom:'Rhum Citron, Gingembre et Piment', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:40, mac:45, macTxt:'45 jours et plus', lot:1.2,
    tags:['citron vert','gingembre','piment','cassonade','rhum blanc'],
    ing:[[2,'pièces','citrons verts'],[200,'g','gingembre'],[2,'pièces','piments oiseaux séchés'],[200,'g','sirop de cassonade'],[1,'L','rhum blanc à 40°']],
    prep:["Couper le gingembre en fines tranches.","Réunir en bocal le rhum, le sirop, le gingembre et les écorces de citron vert.","Retirer le piment après 30 jours.","Ajouter le zeste de citron vert 15 jours avant dégustation."] },

  { id:'rh-coco-gingembre', nom:'Rhum Coco et Gingembre', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['coco','gingembre','cassonade','rhum blanc'],
    ing:[[1,'pièce','noix de coco'],[20,'g','gingembre'],[100,'g','cassonade'],[1,'L','rhum blanc à 50°']],
    prep:["Ouvrir la noix de coco, recueillir le jus et couper la chair en dés.","Réunir tous les ingrédients en bocal.","Macérer 3 mois."] },

  { id:'rh-des-bois', nom:'Rhum des Bois', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.8,
    tags:['fraise','framboise','cannelle','vanille','menthe','sucre de canne'],
    ing:[[1.5,'L','rhum blanc'],[600,'g','fraises Gariguettes'],[200,'g','framboises'],[3,'bâtons','cannelle'],[3,'gousses','vanille'],[35,'cl','sirop de canne'],[50,'g','menthe']],
    prep:["Laver et préparer les fruits et la menthe ; fendre la vanille.","Chauffer la cannelle légèrement broyée à sec 5 minutes.","Réunir tous les ingrédients en bocal, arroser de sirop puis de rhum.","Macérer 8 semaines en remuant une fois par semaine."] },

  { id:'rh-douceur', nom:'Rhum Douceur', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['orange','girofle','cannelle','rhum ambré'],
    ing:[[3,'pièces','oranges'],[3,'clous','girofle'],[1,'c. à café','cannelle'],[1,'L','rhum ambré à 50°']],
    prep:["Couper les oranges et les mettre en bocal.","Broyer la cannelle et le girofle au mortier.","Réunir le tout et recouvrir de rhum.","Macérer 2 mois."] },

  { id:'rh-violette', nom:'Rhum aux Bonbons à la Violette', cat:'rhums', themes:['fleurs'], gravure:'fleur', degre:50, mac:30, macTxt:'jusqu\'à dissolution', lot:1.2,
    tags:['violette','bonbon','rhum'],
    ing:[[270,'g','bonbons à la violette'],[1,'L','rhum à 50°'],[10,'cl','eau']],
    prep:["Casser les bonbons à la violette.","Les mettre dans le rhum avec l'eau.","Laisser fondre et macérer jusqu'à dissolution complète."] },

  { id:'rh-fraise-menthe', nom:'Rhum Fraise Menthe', cat:'rhums', themes:['fruits','plantes'], gravure:'fruit', degre:55, mac:120, macTxt:'4 mois minimum', lot:1.2,
    tags:['fraise','menthe','cassonade','rhum agricole'],
    ing:[[200,'g','sirop de cassonade'],[150,'g','fraises'],[10,'g','menthe fraîche'],[1,'L','rhum agricole à 55°']],
    prep:["Broyer légèrement les fraises.","Réunir tous les ingrédients en bocal.","Macérer 4 mois minimum."], vieil:'4 mois minimum' },

  { id:'rh-fraise-basilic', nom:'Rhum Fraise, Basilic, Citron Vert et Vanille', cat:'rhums', themes:['fruits','plantes'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['fraise','basilic','citron vert','vanille','sucre de canne'],
    ing:[[1,'L','rhum blanc à 50°'],[20,'pièces','fraises fraîches'],[1,'poignée','fraises séchées'],[2,'écorces','citron vert'],[2,'gousses','vanille'],[2,'c. à s.','sucre de canne'],[1,'poignée','basilic']],
    prep:["Découper les fraises fraîches et séchées, rincer le basilic.","Fendre la vanille et prélever de gros zestes de citron vert.","Réunir le tout en bocal avec le rhum et le sucre.","Macérer 3 mois."] },

  { id:'rh-kiwi-banane', nom:'Rhum Kiwi et Banane', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['kiwi','banane','vanille','miel','sucre'],
    ing:[[1,'L','rhum agricole à 50°'],[6,'pièces','kiwis'],[2,'pièces','bananes'],[2,'c. à s.','sucre blanc'],[2,'c. à s.','sucre roux'],[1,'gousse','vanille'],[2,'c. à s.','miel']],
    prep:["Éplucher et couper les kiwis et la banane.","Réunir en bocal avec les sucres, la vanille et le miel.","Verser le rhum et macérer 2 mois."] },

  { id:'rh-kiwi-poire-noisette', nom:'Rhum Kiwi, Poire et Noisette', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:40, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['kiwi','poire','noisette','sucre de canne','rhum blanc'],
    ing:[[100,'g','kiwi'],[250,'g','noisettes'],[100,'g','poire'],[100,'g','sirop de canne'],[1,'L','rhum blanc à 40°']],
    prep:["Couper le kiwi et la poire en fines tranches.","Réunir en récipient avec les noisettes.","Verser le sirop de canne et le rhum, bien remuer.","Macérer 3 mois."] },

  { id:'rh-mangues-bananes-flambees', nom:'Rhum Mangues et Bananes Flambées', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:120, macTxt:'4 mois minimum', lot:1.3,
    tags:['mangue','banane','vanille','caramel','sucre de canne'],
    ing:[[4,'pièces','bananes pas trop mûres'],[1,'pièce','mangue mûre'],[1,'gousse','vanille'],[1,'L','rhum blanc à 50°'],[6,'c. à s.','sucre de canne']],
    prep:["Caraméliser le sucre, dorer les bananes coupées en deux puis les flamber au rhum.","Laisser refroidir, couper la mangue, fendre la vanille.","Réunir le tout en bocal et ajouter le rhum à 50°.","Macérer 4 mois minimum."], vieil:'4 mois minimum' },

  { id:'rh-mangues-framboises', nom:'Rhum Mangues et Framboises', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['mangue','framboise','sucre de canne','rhum agricole'],
    ing:[[1,'pièce','mangue bien mûre'],[375,'g','framboises'],[150,'g','sirop de canne'],[1,'L','rhum blanc agricole à 50°']],
    prep:["Couper la mangue en petits morceaux.","Alterner en bocal des couches de mangue et de framboises, en nappant de sirop de canne.","Verser le rhum.","Macérer 3 mois."] },

  { id:'rh-mangues-passion', nom:'Rhum Mangues et Fruits de la Passion', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['mangue','fruit de la passion','vanille','cannelle','sucre roux'],
    ing:[[1,'L','rhum agricole blanc à 50°'],[2,'pièces','mangues mûres'],[3,'pièces','fruits de la passion'],[2,'gousses','vanille'],[1,'bâton','cannelle'],[5,'c. à café','sucre roux']],
    prep:["Éplucher les mangues et les couper en petits morceaux.","Ajouter l'intérieur des fruits de la passion, la cannelle, la vanille et le sucre.","Verser le rhum.","Macérer 2 mois."] },

  { id:'rh-myrtilles-miel', nom:'Rhum Myrtilles et Miel', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['myrtille','miel','vanille','rhum blanc'],
    ing:[[250,'g','myrtilles'],[6,'c. à s.','miel'],[1,'gousse','vanille'],[1,'L','rhum blanc à 50°']],
    prep:["Fendre la vanille et retirer les graines.","Réunir tous les ingrédients en bocal et bien remuer.","Macérer 2 mois en remuant jusqu'à dissolution du miel."] },

  { id:'rh-noisettes', nom:'Rhum aux Noisettes', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:180, macTxt:'6 mois minimum', lot:1.2,
    tags:['noisette','vanille','sucre de canne','rhum blanc'],
    ing:[[150,'g','noisettes'],[1,'L','rhum blanc à 50°'],[1,'gousse','vanille'],[20,'cl','sirop de canne']],
    prep:["Émonder et éplucher les noisettes (eau bouillante 1 minute, puis refroidir).","Réunir noisettes et vanille fendue en bocal, arroser de rhum.","Macérer 6 mois minimum."], vieil:'6 mois minimum' },

  { id:'rh-orange-cannelle-vanille', nom:'Rhum Orange, Cannelle et Vanille', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois minimum', lot:1.2,
    tags:['orange','cannelle','vanille','sucre de canne'],
    ing:[[1,'L','rhum agricole à 50°'],[3,'pièces','oranges bio'],[2,'bâtons','cannelle'],[2,'gousses','vanille'],[10,'cl','sucre de canne']],
    prep:["Prélever finement les peaux d'orange à l'économe (sans blanc).","Fendre la vanille et prélever les graines.","Réunir en bocal le rhum, le sucre, la vanille et les peaux d'orange.","Macérer 3 mois minimum à l'ombre."], vieil:'3 mois minimum' },

  { id:'rh-pamplemousse-menthe', nom:'Rhum Pamplemousses et Menthe', cat:'rhums', themes:['fruits','plantes'], gravure:'fruit', degre:50, mac:60, macTxt:'60 jours', lot:1.2,
    tags:['pamplemousse','menthe','cassonade','rhum blanc'],
    ing:[[1,'L','rhum blanc à 50°'],[3,'pièces','pamplemousses roses'],[25,'g','menthe verte fraîche'],[100,'g','cassonade']],
    prep:["Éplucher les pamplemousses, retirer le blanc et couper en quartiers.","Réunir en bocal avec la menthe, la cassonade et le rhum.","Retirer la menthe après 3-4 jours.","Macérer 60 jours."] },

  { id:'rh-peches-citrons-verts', nom:'Rhum Pêches et Citrons Verts', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois et plus', lot:1.2,
    tags:['pêche','citron vert','cassonade','rhum agricole'],
    ing:[[100,'g','cassonade'],[1,'kg','pêches'],[2,'pièces','citrons verts'],[1,'L','rhum blanc agricole à 50°']],
    prep:["Dénoyauter les pêches et concasser les noyaux, couper la chair en petits dés.","Réunir tous les ingrédients en bocal et macérer une semaine.","Ajouter le sirop de cassonade et prolonger 2 mois."] },

  { id:'rh-peches-poires-framboises', nom:'Rhum Pêches, Poires et Framboises', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:60, macTxt:'2 mois', lot:1.2,
    tags:['pêche','poire','framboise','sucre de canne','rhum blanc'],
    ing:[[1,'L','rhum blanc à 50°'],[3,'pièces','pêches'],[3,'pièces','poires'],[200,'g','framboises'],[200,'g','sucre de canne']],
    prep:["Laver, éplucher, dénoyauter et épépiner les pêches et les poires, couper en quartiers.","Disposer les fruits en bocal.","Ajouter le sucre de canne puis le rhum.","Macérer 2 mois."] },

  { id:'rh-vanille-cafe', nom:'Rhum Vanille et Café', cat:'rhums', themes:['epices'], gravure:'epice', degre:40, mac:90, macTxt:'3 mois minimum', lot:1.2,
    tags:['vanille','café','sucre de canne','rhum blanc'],
    ing:[[40,'grains','café'],[2,'gousses','vanille'],[1,'L','rhum blanc à 40°'],[15,'cl','sucre de canne']],
    prep:["Fendre la vanille et gratter les graines.","Concasser légèrement le café au mortier.","Réunir en bocal vanille, café, sucre et rhum.","Macérer 3 mois minimum à l'ombre."], vieil:'3 mois minimum' },

  { id:'rh-vanille-citrons-verts', nom:'Rhum Vanille et Citrons Verts', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:90, macTxt:'3 mois', lot:1.2,
    tags:['vanille','citron vert','sucre de canne','rhum blanc'],
    ing:[[7,'cl','sirop de canne'],[4,'gousses','vanille'],[10,'cl','jus de citron vert'],[1,'L','rhum blanc à 50°']],
    prep:["Fendre la vanille et récupérer les graines.","Réunir en bocal le citron vert, le sirop, la vanille et le rhum.","Macérer 3 mois, puis filtrer et mettre en bouteille."] },

  { id:'rh-atemoya', nom:'Rhum Atémoya', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:42, macTxt:'6 semaines minimum', lot:1.8,
    tags:['atémoya','banane','cannelle','sucre de canne'],
    ing:[[1,'kg','atémoyas mûrs'],[15,'cl','sucre de canne'],[1.5,'L','rhum blanc à 50°'],[2,'pièces','bananes'],[1,'bâton','cannelle']],
    prep:["Extraire la pulpe des atémoyas et retirer les graines noires.","Peler les bananes et les couper en tronçons.","Réunir fruits, cannelle et sirop en bocal, couvrir de rhum.","Macérer 6 semaines minimum."], vieil:'6 semaines minimum' },

  { id:'rh-banane-sechee', nom:'Rhum Banane Séchée', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.7,
    tags:['banane séchée','vanille','cannelle','sucre de canne'],
    ing:[[300,'g','bananes sèches'],[15,'cl','sirop de canne'],[1,'bâton','vanille'],[1.5,'L','rhum blanc à 50°'],[1,'bâton','cannelle']],
    prep:["Faire un caramel léger avec le sirop, y ajouter la vanille fendue et ses graines.","Laisser refroidir et dissoudre dans le rhum.","Ajouter la cannelle et les bananes sèches.","Macérer 8 semaines."] },

  { id:'rh-carambole', nom:'Rhum Carambole', cat:'rhums', themes:['fruits'], gravure:'fruit', degre:50, mac:42, macTxt:'6 semaines', lot:1.8,
    tags:['carambole','rhubarbe','sucre de canne','rhum blanc'],
    ing:[[500,'g','caramboles'],[20,'cl','sucre de canne'],[1.5,'L','rhum blanc à 50°'],[2,'branches','rhubarbe']],
    prep:["Laver les caramboles et les débiter en fines tranches, découper la rhubarbe.","Réunir tous les ingrédients dans le rhum.","Macérer 6 semaines."] },

  { id:'rh-casse-fistula', nom:'Rhum Casse Fistula', cat:'rhums', themes:['epices'], gravure:'epice', degre:50, mac:42, macTxt:'6 semaines minimum', lot:1.7,
    tags:['casse fistula','réglisse','sucre de canne','rhum blanc'],
    ing:[[3,'bâtons','casse fistula'],[15,'cl','sirop de canne'],[1.5,'L','rhum blanc à 50°'],[2,'bâtons','réglisse']],
    prep:["Extraire les pastilles des cosses de casse fistula.","Réunir tous les ingrédients dans le rhum.","Macérer 6 semaines minimum."], vieil:'6 semaines minimum' },

  { id:'rh-cempedak', nom:'Rhum Cempedak', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:40, macTxt:'5 à 6 semaines', lot:1.7,
    tags:['cempedak','citronnelle','cannelle','sucre de canne'],
    ing:[[1,'pièce','cempedak'],[2,'tiges','citronnelle'],[15,'cl','sirop de canne'],[1,'bâton','cannelle'],[1.5,'L','rhum blanc à 50°']],
    prep:["Ouvrir le cempedak et peler les fruits intérieurs.","Écraser la citronnelle et la cannelle.","Réunir en bocal et recouvrir de rhum.","Macérer 5 à 6 semaines en remuant régulièrement."] },

  { id:'rh-corossol', nom:'Rhum Corossol', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:42, macTxt:'6 semaines', lot:1.7,
    tags:['corossol','muscade','macis','piment','sucre de canne'],
    ing:[[5,'pièces','corossols'],[15,'cl','sirop de canne'],[1.5,'L','rhum blanc à 50°'],[5,'enveloppes','macis'],[3,'pièces','piments oiseaux']],
    prep:["Peler les fruits et récupérer la chair sans pépins.","Broyer finement les épices.","Réunir en bocal et couvrir de rhum.","Macérer 6 semaines, puis filtrer."] },

  { id:'rh-dattes', nom:'Rhum Dattes', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:42, macTxt:'6 semaines', lot:1.7,
    tags:['datte','cannelle','anis','rhum blanc'],
    ing:[[200,'g','dattes bien mûres'],[1,'bâton','cannelle'],[1,'c. à café','graines d\'anis'],[1.5,'L','rhum blanc à 50°']],
    prep:["Ouvrir les dattes et retirer les noyaux.","Broyer les épices.","Réunir en bocal avec le rhum.","Macérer 6 semaines à l'abri de la lumière."] },

  { id:'rh-feijoa', nom:'Rhum Feijoa', cat:'rhums', themes:['fruits','epices'], gravure:'fruit', degre:50, mac:56, macTxt:'8 semaines', lot:1.8,
    tags:['feijoa','genièvre','cardamome','sucre de canne'],
    ing:[[1,'kg','feijoas'],[20,'cl','sirop de canne'],[10,'baies','genièvre'],[5,'gousses','cardamome'],[1.5,'L','rhum blanc à 50°']],
    prep:["Broyer les épices au mortier.","Laver et découper les feijoas en tranches.","Réunir le tout en bocal avec le sirop et le rhum.","Macérer 8 semaines."] }
];
RECETTES_SITE.forEach(o => DATA.push(_recette(o)));

/* ---------------------------------------------------------------------
   3. GRAVURES BOTANIQUES (SVG en ligne, monochromes sépia)
   Une clé -> un motif décoratif servant d'illustration de fiche.
--------------------------------------------------------------------- */
const GRAVURES = {
  fruit: `<svg viewBox="0 0 100 100" role="img" aria-label="gravure de fruit">
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M50 28 C50 18 58 12 64 14 C60 18 60 24 56 28"/>
      <circle cx="44" cy="58" r="20"/>
      <circle cx="58" cy="62" r="16"/>
      <path d="M50 28 C46 36 44 44 44 52" />
      <path d="M44 40 l-10 -6 M44 46 l-12 0" stroke-width="1"/>
    </g></svg>`,
  fleur: `<svg viewBox="0 0 100 100" role="img" aria-label="gravure de fleur">
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <circle cx="50" cy="42" r="6"/>
      <ellipse cx="50" cy="24" rx="6" ry="12"/>
      <ellipse cx="68" cy="36" rx="12" ry="6"/>
      <ellipse cx="32" cy="36" rx="12" ry="6"/>
      <ellipse cx="61" cy="56" rx="10" ry="6" transform="rotate(45 61 56)"/>
      <ellipse cx="39" cy="56" rx="10" ry="6" transform="rotate(-45 39 56)"/>
      <path d="M50 48 C50 64 50 76 50 86 M50 70 C58 66 64 70 66 76 M50 64 C42 60 36 64 34 70"/>
    </g></svg>`,
  epice: `<svg viewBox="0 0 100 100" role="img" aria-label="gravure d'épice">
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M38 20 C34 40 34 60 38 80 C46 74 54 74 62 80 C66 60 66 40 62 20 C54 26 46 26 38 20 Z"/>
      <path d="M50 24 L50 78 M44 34 C48 40 52 40 56 34 M44 50 C48 56 52 56 56 50 M44 66 C48 72 52 72 56 66"/>
    </g></svg>`,
  plante: `<svg viewBox="0 0 100 100" role="img" aria-label="gravure de plante">
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M50 86 L50 24"/>
      <path d="M50 40 C40 36 32 28 30 18 C40 20 48 28 50 38"/>
      <path d="M50 52 C60 48 68 40 70 30 C60 32 52 40 50 50"/>
      <path d="M50 64 C42 60 36 54 34 46 C42 48 48 54 50 62"/>
      <path d="M50 24 C48 18 52 14 56 12 C54 16 54 20 52 24"/>
    </g></svg>`,
  racine: `<svg viewBox="0 0 100 100" role="img" aria-label="gravure de racine">
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M50 14 C46 26 46 36 50 46 C54 36 54 26 50 14 Z"/>
      <path d="M50 46 C44 54 40 64 42 78 M50 46 C56 54 60 64 58 78 M50 50 L50 84"/>
      <path d="M50 60 C44 62 40 66 38 72 M50 66 C56 68 60 72 62 78"/>
    </g></svg>`
};

/* ---------------------------------------------------------------------
   4. ÉTAT & STOCKAGE LOCAL
--------------------------------------------------------------------- */
const STORE = {
  favKey: 'codex_favoris',
  recentKey: 'codex_recents',
  themeKey: 'codex_theme',

  getFavoris()  { return JSON.parse(localStorage.getItem(this.favKey) || '[]'); },
  setFavoris(a) { localStorage.setItem(this.favKey, JSON.stringify(a)); },
  isFavori(id)  { return this.getFavoris().includes(id); },
  toggleFavori(id) {
    const f = this.getFavoris();
    const i = f.indexOf(id);
    if (i === -1) f.push(id); else f.splice(i, 1);
    this.setFavoris(f);
    return this.isFavori(id);
  },

  getRecents()  { return JSON.parse(localStorage.getItem(this.recentKey) || '[]'); },
  pushRecent(id) {
    let r = this.getRecents().filter(x => x !== id);
    r.unshift(id);
    r = r.slice(0, 8);
    localStorage.setItem(this.recentKey, JSON.stringify(r));
  },

  getTheme()  { return localStorage.getItem(this.themeKey) || 'clair'; },
  setTheme(t) { localStorage.setItem(this.themeKey, t); }
};

/* ---------------------------------------------------------------------
   5. UTILITAIRES
--------------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getRecette(id) { return DATA.find(r => r.id === id); }
function catNom(id) { const c = CATEGORIES.find(c => c.id === id); return c ? c.nom : id; }

/** Bande d'alcool d'après le degré. */
function bandeAlcool(d) {
  if (d < 20) return { id: 'faible', label: 'Faible (< 20°)' };
  if (d <= 35) return { id: 'moyen', label: 'Moyen (20-35°)' };
  return { id: 'fort', label: 'Fort (> 35°)' };
}

/** Bande de durée d'après les jours de macération. */
function bandeDuree(j) {
  if (j < 30) return { id: 'court', label: 'Moins d\'1 mois' };
  if (j <= 90) return { id: 'moyen', label: '1 à 3 mois' };
  return { id: 'long', label: 'Plus de 3 mois' };
}

/** Recettes partageant au moins un ingrédient (recettes associées). */
function recettesAssociees(recette, max = 4) {
  const tags = new Set(recette.tags);
  return DATA
    .filter(r => r.id !== recette.id)
    .map(r => ({ r, score: r.tags.filter(t => tags.has(t)).length }))
    .filter(o => o.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(o => o.r);
}

/** Formate un nombre proprement (sans décimales inutiles). */
function fmt(n) {
  if (!isFinite(n)) return '';
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r).replace('.', ',');
}

/* ---------------------------------------------------------------------
   6. RECHERCHE & FILTRES
--------------------------------------------------------------------- */
function rechercher(query, filtres = {}) {
  const q = (query || '').trim().toLowerCase();
  return DATA.filter(r => {
    // Filtre catégorie principale
    if (filtres.categorie && r.categorie !== filtres.categorie) return false;
    // Filtre thème transversal
    if (filtres.theme && !r.themes.includes(filtres.theme)) return false;
    // Filtre alcool
    if (filtres.alcool && bandeAlcool(r.degre).id !== filtres.alcool) return false;
    // Filtre durée
    if (filtres.duree && bandeDuree(r.macerationJours).id !== filtres.duree) return false;
    // Texte libre : nom, catégorie, tags, ingrédients
    if (q) {
      const hay = [
        r.nom, catNom(r.categorie),
        r.tags.join(' '),
        r.ingredients.map(i => i.nom).join(' '),
        r.themes.join(' ')
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------------
   7. RENDU DES VUES
--------------------------------------------------------------------- */
const app = () => $('#app');

/** Carte de recette réutilisable. */
function carteRecette(r) {
  const fav = STORE.isFavori(r.id) ? 'is-fav' : '';
  return `
    <a class="carte" href="#/recette/${r.id}">
      <span class="carte__gravure" aria-hidden="true">${GRAVURES[r.gravure] || ''}</span>
      <span class="carte__corps">
        <span class="carte__cat">${catNom(r.categorie)}</span>
        <span class="carte__nom">${r.nom}</span>
        <span class="carte__meta">
          <span class="puce puce--${bandeAlcool(r.degre).id}">${r.degre}°</span>
          <span class="puce">${bandeDuree(r.macerationJours).label}</span>
        </span>
      </span>
      <span class="carte__fav ${fav}" aria-hidden="true">✦</span>
    </a>`;
}

/** Fil d'Ariane. */
function ariane(parts) {
  return `<nav class="ariane" aria-label="Fil d'Ariane">
    ${parts.map((p, i) =>
      p.href && i < parts.length - 1
        ? `<a href="${p.href}">${p.label}</a><span class="ariane__sep">›</span>`
        : `<span aria-current="page">${p.label}</span>`
    ).join('')}
  </nav>`;
}

/** Vue : Accueil. */
function vueAccueil() {
  const nbRecettes = DATA.length;
  const compteTags = (mots) => {
    const set = new Set();
    DATA.forEach(r => r.tags.forEach(t => { if (mots.some(m => t.includes(m))) set.add(t); }));
    return set.size;
  };
  const nbFruits  = compteTags(['cerise','griotte','framboise','cassis','mûre','orange','citron','noix','ananas','guigne','baies','pêcher','prune','agrume']);
  const nbEpices  = compteTags(['cannelle','gingembre','girofle','cardamome','muscade','vanille','badiane','anis','coriandre','fenouil','café']);
  const nbPlantes = compteTags(['génépi','mélisse','angélique','sureau','épine','prunellier','armoise','feuilles','fleurs','plante']);

  return `
    <section class="couverture">
      <div class="couverture__cadre">
        <p class="couverture__sur">Codex des</p>
        <h1 class="couverture__titre">Liqueurs &amp; Hypocras</h1>
        <p class="couverture__sous">Grimoire des macérations, ratafias, crèmes &amp; vins d'apothicaire</p>
        <div class="couverture__filet" aria-hidden="true">❦</div>
        <form class="recherche-globale" role="search" onsubmit="return false;">
          <input id="rechercheAccueil" type="search" placeholder="Rechercher une recette, un fruit, une plante, une épice…" aria-label="Recherche globale" autocomplete="off">
        </form>
      </div>
    </section>

    <section class="stats" aria-label="Statistiques du grimoire">
      <div class="stat"><span class="stat__nb">${nbRecettes}</span><span class="stat__lbl">Recettes</span></div>
      <div class="stat"><span class="stat__nb">${nbFruits}</span><span class="stat__lbl">Fruits</span></div>
      <div class="stat"><span class="stat__nb">${nbEpices}</span><span class="stat__lbl">Épices</span></div>
      <div class="stat"><span class="stat__nb">${nbPlantes}</span><span class="stat__lbl">Plantes</span></div>
    </section>

    <h2 class="titre-section">Les grands chapitres</h2>
    <div class="grille-cat">
      ${CATEGORIES.map(c => `
        <a class="tuile-cat" href="#/categorie/${c.id}">
          <span class="tuile-cat__ico" aria-hidden="true">${c.icone}</span>
          <span class="tuile-cat__nom">${c.nom}</span>
          <span class="tuile-cat__nb">${DATA.filter(r => r.categorie === c.id).length} recette(s)</span>
          <span class="tuile-cat__desc">${c.desc}</span>
        </a>`).join('')}
    </div>

    <h2 class="titre-section">Rubriques thématiques</h2>
    <div class="grille-theme">
      ${THEMES.map(t => `
        <a class="tuile-theme" href="#/theme/${t.id}">
          <span aria-hidden="true">${t.icone}</span> ${t.nom}
          <em>${DATA.filter(r => r.themes.includes(t.id)).length}</em>
        </a>`).join('')}
    </div>

    <h2 class="titre-section">Au fil des pages</h2>
    <div class="grille-recettes">
      ${DATA.slice(0, 6).map(carteRecette).join('')}
    </div>
  `;
}

/** Vue : liste filtrée (catégorie, thème ou recherche). */
function vueListe({ titre, recettes, ariane: fil, filtresActifs }) {
  return `
    ${ariane(fil)}
    <h1 class="titre-page">${titre}</h1>

    <div class="barre-filtres">
      <input id="rechercheListe" type="search" placeholder="Affiner…" aria-label="Recherche" value="${filtresActifs.q || ''}" autocomplete="off">
      <div class="filtres-puces" id="filtresPuces"></div>
    </div>

    <p class="compte" id="compteResultats">${recettes.length} recette(s)</p>
    <div class="grille-recettes" id="resultats">
      ${recettes.length ? recettes.map(carteRecette).join('') : '<p class="vide">Aucune recette ne correspond à cette quête.</p>'}
    </div>
  `;
}

/** Vue : fiche recette. */
function vueRecette(r) {
  const ba = bandeAlcool(r.degre);
  const assoc = recettesAssociees(r);
  const fav = STORE.isFavori(r.id);

  const encart = (titre, contenu, cls) => contenu
    ? `<div class="encart encart--${cls}"><h3>${titre}</h3><p>${contenu}</p></div>` : '';

  return `
    ${ariane([
      { label: 'Accueil', href: '#/' },
      { label: catNom(r.categorie), href: `#/categorie/${r.categorie}` },
      { label: r.nom }
    ])}

    <article class="fiche" id="fiche">
      <header class="fiche__entete">
        <div class="fiche__gravure" aria-hidden="true">${GRAVURES[r.gravure] || ''}</div>
        <div class="fiche__titres">
          <p class="fiche__cat">${catNom(r.categorie)}</p>
          <h1 class="fiche__nom">${r.nom}</h1>
          <div class="fiche__badges">
            <span class="puce puce--${ba.id}">${r.degre}° · ${ba.label}</span>
            <span class="puce">Macération : ${bandeDuree(r.macerationJours).label}</span>
            ${r.themes.map(t => `<span class="puce puce--theme">${THEMES.find(x=>x.id===t)?.nom || t}</span>`).join('')}
          </div>
        </div>
        <div class="fiche__actions">
          <button class="btn btn-fav ${fav ? 'is-fav' : ''}" data-fav="${r.id}">
            <span aria-hidden="true">✦</span> ${fav ? 'Favori' : 'Ajouter aux favoris'}
          </button>
          <button class="btn" onclick="window.print()"><span aria-hidden="true">🖨</span> Imprimer / PDF</button>
        </div>
      </header>

      <section class="bloc">
        <h2 class="bloc__titre">Ingrédients</h2>
        <p class="bloc__note">Proportions pour un lot d'environ <strong>${fmt(r.lot)} L</strong> de produit fini.</p>
        <table class="tableau-ingredients">
          <thead><tr><th>Quantité</th><th>Ingrédient</th></tr></thead>
          <tbody>
            ${r.ingredients.map(i => `
              <tr>
                <td class="qte">${i.qte != null ? fmt(i.qte) + ' ' + i.unite : '—'}</td>
                <td>${i.nom}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <a class="lien-calc" href="#/calculateur/${r.id}">⚖ Recalculer les quantités pour un autre volume</a>
      </section>

      <section class="bloc">
        <h2 class="bloc__titre">Préparation</h2>
        <ol class="etapes">
          ${r.preparation.map(e => `<li>${e}</li>`).join('')}
        </ol>
      </section>

      <section class="bloc">
        <h2 class="bloc__titre">Chronologie</h2>
        <ol class="timeline">
          ${r.timeline.map(t => `
            <li class="timeline__etape">
              <span class="timeline__pic" aria-hidden="true"></span>
              <span class="timeline__phase">${t.phase}</span>
              <span class="timeline__duree">${t.duree}</span>
            </li>`).join('')}
        </ol>
      </section>

      <section class="bloc bloc--encarts">
        <h2 class="bloc__titre">Notes du grimoire</h2>
        <div class="encarts">
          ${encart('Histoire &amp; anecdotes', r.histoire, 'histoire')}
          ${encart('Propriétés', r.proprietes, 'propriete')}
          ${encart('Conseils d\'apothicaire', r.conseils, 'conseil')}
          ${r.dicton ? `<div class="encart encart--dicton"><h3>Dicton</h3><p class="dicton">${r.dicton}</p></div>` : ''}
        </div>
      </section>

      ${assoc.length ? `
      <section class="bloc no-print">
        <h2 class="bloc__titre">Recettes associées</h2>
        <p class="bloc__note">Elles partagent des ingrédients avec celle-ci.</p>
        <div class="grille-recettes">${assoc.map(carteRecette).join('')}</div>
      </section>` : ''}
    </article>
  `;
}

/** Vue : favoris. */
function vueFavoris() {
  const recettes = STORE.getFavoris().map(getRecette).filter(Boolean);
  return `
    ${ariane([{ label: 'Accueil', href: '#/' }, { label: 'Mes favoris' }])}
    <h1 class="titre-page">Mes favoris</h1>
    <div class="grille-recettes">
      ${recettes.length ? recettes.map(carteRecette).join('')
        : '<p class="vide">Aucun favori pour l\'instant. Touchez l\'étoile ✦ d\'une recette pour la conserver ici.</p>'}
    </div>
  `;
}

/** Vue : calculateur. */
function vueCalculateur(id) {
  const r = id ? getRecette(id) : DATA[0];
  const options = DATA.map(x => `<option value="${x.id}" ${x.id === r.id ? 'selected' : ''}>${x.nom}</option>`).join('');
  return `
    ${ariane([{ label: 'Accueil', href: '#/' }, { label: 'Calculateur de lot' }])}
    <h1 class="titre-page">Calculateur de lot</h1>
    <p class="intro">Recalculez automatiquement quantités, sucre et alcool pour n'importe quelle taille de lot.</p>

    <div class="calc">
      <div class="calc__controles">
        <label>Recette
          <select id="calcRecette">${options}</select>
        </label>
        <label>Volume désiré (litres)
          <input id="calcVolume" type="number" min="0.1" step="0.1" value="${fmt(r.lot)}">
        </label>
        <p class="calc__base">Lot de référence : <strong id="calcBase">${fmt(r.lot)} L</strong></p>
      </div>
      <div id="calcResultat"></div>
    </div>
  `;
}

/** Rendu du tableau du calculateur. */
function rendreCalcul() {
  const r = getRecette($('#calcRecette').value);
  const vol = parseFloat($('#calcVolume').value);
  $('#calcBase').textContent = fmt(r.lot) + ' L';
  if (!r || !vol || vol <= 0) { $('#calcResultat').innerHTML = '<p class="vide">Indiquez un volume valide.</p>'; return; }
  const facteur = vol / r.lot;
  $('#calcResultat').innerHTML = `
    <p class="calc__facteur">Facteur d'échelle : <strong>×${fmt(facteur)}</strong></p>
    <table class="tableau-ingredients">
      <thead><tr><th>Quantité recalculée</th><th>Ingrédient</th></tr></thead>
      <tbody>
        ${r.ingredients.map(i => {
          const q = (i.scalable && i.qte != null) ? fmt(i.qte * facteur) + ' ' + i.unite
                  : (i.qte != null ? fmt(i.qte) + ' ' + i.unite + ' (à ajuster)' : '—');
          return `<tr><td class="qte">${q}</td><td>${i.nom}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="bloc__note">Les ingrédients « à ajuster » (pincées, pointes de muscade) se dosent au goût.</p>
  `;
}

/* ---------------------------------------------------------------------
   8. ROUTAGE (par ancre)
--------------------------------------------------------------------- */
function router() {
  const hash = location.hash || '#/';
  const seg = hash.replace(/^#\//, '').split('/');
  const cont = app();
  window.scrollTo(0, 0);

  if (seg[0] === '' || seg[0] === undefined) {
    cont.innerHTML = vueAccueil();
    brancherRechercheAccueil();
  }
  else if (seg[0] === 'categorie') {
    const cat = CATEGORIES.find(c => c.id === seg[1]);
    const recettes = DATA.filter(r => r.categorie === seg[1]);
    cont.innerHTML = vueListe({
      titre: cat ? cat.nom : 'Catégorie',
      recettes,
      ariane: [{ label: 'Accueil', href: '#/' }, { label: cat ? cat.nom : 'Catégorie' }],
      filtresActifs: { categorie: seg[1] }
    });
    brancherFiltres({ categorie: seg[1] });
  }
  else if (seg[0] === 'theme') {
    const th = THEMES.find(t => t.id === seg[1]);
    const recettes = DATA.filter(r => r.themes.includes(seg[1]));
    cont.innerHTML = vueListe({
      titre: th ? th.nom : 'Rubrique',
      recettes,
      ariane: [{ label: 'Accueil', href: '#/' }, { label: th ? th.nom : 'Rubrique' }],
      filtresActifs: { theme: seg[1] }
    });
    brancherFiltres({ theme: seg[1] });
  }
  else if (seg[0] === 'recherche') {
    const recettes = DATA;
    cont.innerHTML = vueListe({
      titre: 'Recherche',
      recettes,
      ariane: [{ label: 'Accueil', href: '#/' }, { label: 'Recherche' }],
      filtresActifs: {}
    });
    brancherFiltres({});
    $('#rechercheListe').focus();
  }
  else if (seg[0] === 'recette') {
    const r = getRecette(seg[1]);
    if (r) { cont.innerHTML = vueRecette(r); STORE.pushRecent(r.id); brancherFiche(); }
    else cont.innerHTML = '<p class="vide">Cette page du grimoire est introuvable.</p>';
  }
  else if (seg[0] === 'favoris') {
    cont.innerHTML = vueFavoris();
  }
  else if (seg[0] === 'calculateur') {
    cont.innerHTML = vueCalculateur(seg[1]);
    brancherCalculateur();
  }
  else {
    cont.innerHTML = '<p class="vide">Page inconnue.</p>';
  }

  majSidebar();
}

/* ---------------------------------------------------------------------
   9. BRANCHEMENTS D'ÉVÉNEMENTS PAR VUE
--------------------------------------------------------------------- */
function brancherRechercheAccueil() {
  const champ = $('#rechercheAccueil');
  if (!champ) return;
  champ.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sessionStorage.setItem('q_initiale', champ.value);
      location.hash = '#/recherche';
    }
  });
}

function brancherFiltres(base) {
  const champ = $('#rechercheListe');
  const zonePuces = $('#filtresPuces');
  const resultats = $('#resultats');
  const compte = $('#compteResultats');

  // état local des filtres
  const etat = Object.assign({ q: '', alcool: '', duree: '' }, base);

  // restauration éventuelle d'une recherche initiale
  const qInit = sessionStorage.getItem('q_initiale');
  if (qInit && champ) { etat.q = qInit; champ.value = qInit; sessionStorage.removeItem('q_initiale'); }

  // puces de filtres alcool & durée
  const groupes = [
    { cle: 'alcool', titre: 'Degré', opts: [['faible','Faible < 20°'],['moyen','Moyen 20-35°'],['fort','Fort > 35°']] },
    { cle: 'duree',  titre: 'Durée', opts: [['court','< 1 mois'],['moyen','1 à 3 mois'],['long','> 3 mois']] }
  ];
  zonePuces.innerHTML = groupes.map(g => `
    <div class="filtre-groupe">
      <span class="filtre-groupe__titre">${g.titre}</span>
      ${g.opts.map(([v, l]) => `<button class="puce-filtre" data-cle="${g.cle}" data-val="${v}">${l}</button>`).join('')}
    </div>`).join('');

  function rerender() {
    const res = rechercher(etat.q, {
      categorie: base.categorie, theme: base.theme,
      alcool: etat.alcool, duree: etat.duree
    });
    resultats.innerHTML = res.length ? res.map(carteRecette).join('')
      : '<p class="vide">Aucune recette ne correspond à cette quête.</p>';
    compte.textContent = `${res.length} recette(s)`;
  }

  if (champ) champ.addEventListener('input', () => { etat.q = champ.value; rerender(); });
  $$('.puce-filtre', zonePuces).forEach(btn => {
    btn.addEventListener('click', () => {
      const { cle, val } = btn.dataset;
      etat[cle] = etat[cle] === val ? '' : val;             // bascule
      $$(`.puce-filtre[data-cle="${cle}"]`, zonePuces).forEach(b => b.classList.remove('actif'));
      if (etat[cle]) btn.classList.add('actif');
      rerender();
    });
  });

  if (etat.q) rerender();
}

function brancherFiche() {
  const btn = $('.btn-fav');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const actif = STORE.toggleFavori(btn.dataset.fav);
    btn.classList.toggle('is-fav', actif);
    btn.innerHTML = `<span aria-hidden="true">✦</span> ${actif ? 'Favori' : 'Ajouter aux favoris'}`;
    majSidebar();
  });
}

function brancherCalculateur() {
  $('#calcRecette').addEventListener('change', () => {
    const r = getRecette($('#calcRecette').value);
    $('#calcVolume').value = fmt(r.lot);
    rendreCalcul();
  });
  $('#calcVolume').addEventListener('input', rendreCalcul);
  rendreCalcul();
}

/* ---------------------------------------------------------------------
   10. SIDEBAR : sommaire, favoris, récents
--------------------------------------------------------------------- */
function majSidebar() {
  // Sommaire des catégories
  const som = $('#sommaire');
  if (som) {
    const courant = location.hash;
    som.innerHTML = CATEGORIES.map(c =>
      `<li><a href="#/categorie/${c.id}" class="${courant === '#/categorie/'+c.id ? 'actif':''}">
        <span aria-hidden="true">${c.icone}</span> ${c.nom}</a></li>`).join('')
      + THEMES.map(t =>
      `<li><a href="#/theme/${t.id}" class="lien-theme ${courant === '#/theme/'+t.id ? 'actif':''}">
        <span aria-hidden="true">${t.icone}</span> ${t.nom}</a></li>`).join('');
  }
  // Récents
  const rec = $('#recents');
  if (rec) {
    const recents = STORE.getRecents().map(getRecette).filter(Boolean);
    rec.innerHTML = recents.length
      ? recents.map(r => `<li><a href="#/recette/${r.id}">${r.nom}</a></li>`).join('')
      : '<li class="muet">Aucune consultation récente.</li>';
  }
  // Compteur favoris
  const cf = $('#compteFav');
  if (cf) cf.textContent = STORE.getFavoris().length;
}

/* ---------------------------------------------------------------------
   11. THÈME (clair / grimoire sombre) & barre globale
--------------------------------------------------------------------- */
function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  STORE.setTheme(t);
  const btn = $('#toggleTheme');
  if (btn) btn.innerHTML = t === 'sombre'
    ? '<span aria-hidden="true">☀</span> Mode clair'
    : '<span aria-hidden="true">🌙</span> Mode grimoire';
}

function brancherChrome() {
  // recherche de la barre supérieure
  const champ = $('#rechercheTop');
  champ.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sessionStorage.setItem('q_initiale', champ.value);
      location.hash = '#/recherche';
      champ.value = '';
    }
  });
  // bascule de thème
  $('#toggleTheme').addEventListener('click', () => {
    appliquerTheme(document.documentElement.dataset.theme === 'sombre' ? 'clair' : 'sombre');
  });
  // menu latéral mobile
  $('#burger').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-ouverte');
  });
  // fermeture du menu mobile au clic sur un lien
  $('#sidebar').addEventListener('click', e => {
    if (e.target.closest('a')) document.body.classList.remove('sidebar-ouverte');
  });
}

/* ---------------------------------------------------------------------
   12. INITIALISATION
--------------------------------------------------------------------- */
function init() {
  appliquerTheme(STORE.getTheme());
  brancherChrome();
  window.addEventListener('hashchange', router);
  router();
}

document.addEventListener('DOMContentLoaded', init);
