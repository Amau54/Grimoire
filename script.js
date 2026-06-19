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
  const n = (typeof NOTES_SITE !== 'undefined' && NOTES_SITE[o.id]) || null;
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
    histoire: o.histoire || (n && n.h) || null,
    proprietes: o.proprietes || (n && n.p) || null,
    conseils: o.conseils || (n && n.c) || null,
    dicton: o.dicton || (n && n.d) || null
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
    prep:["Broyer les épices au mortier.","Laver et découper les feijoas en tranches.","Réunir le tout en bocal avec le sirop et le rhum.","Macérer 8 semaines."] },

  /* --- Complement integral du blog hypocras.blog4ever.com : liqueurs (suite), cremes, ratafias, hypocras & vins apéritifs --- */

{ id:'lq-liqueur-de-cacao', nom:'Liqueur de Cacao', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:90, macTxt:'3 mois', lot:2.4,
    tags:['alcool', 'cacao', 'sucre', 'eau', 'cannelle', 'vanille'],
    ing:[[2,'L','alcool à 40°'],[30,'c. à s.','cacao en poudre de bonne qualité'],[500,'g','sucre en poudre'],[15,'cl','eau'],[1,'bâton','cannelle'],[1,'gousse','vanille']],
    prep:['Faire un sirop, le laisser refroidir et mélanger tous les ingrédients dans l’alcool Fendre la vanille et briser la cannelle.', 'Laisser bien macérer le tout pendant au moins 3 mois en remuant régulièrement, car le chocolat à tendance à faire pâte.', 'Filtrer la préparation, laisser décanter quelques jours, filtrer à nouveau et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cafe', nom:'Liqueur de Café', cat:'liqueurs', themes:[], gravure:'plante', degre:35, mac:30, macTxt:'1 mois', lot:2.4,
    tags:['café', 'alcool', 'sucre', 'eau'],
    ing:[[250,'g','café en grains'],[2,'L','alcool à 40°'],[400,'g','sucre'],[15,'cl','eau']],
    prep:['Placer les grains de café avec l’alcool dans un récipient hermétique.', 'Laisser macérer pendant 20 jours en mélangeant une fois par jour.', 'Au bout des 20 jours, préparer un sirop de sucre :.', 'Mélanger l’eau et le sucre dans une casserole.', 'Porter à ébullition et laisser réduire jusqu’à obtention d’un sirop.', 'Ajouter le sirop au mélange café et alcool.', 'Laisser à nouveau macérer pendant 10 jours.', 'Filtrer le mélange et embouteiller.', 'Attendre 1 mois avant de servir.'] },

  { id:'lq-liqueur-de-camomille', nom:'Liqueur de Camomille', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['alcool', 'eau', 'sucre', 'fleurs'],
    ing:[[1,'L','alcool à 40°'],[1,'verre','eau'],[400,'g','sucre'],[200,'g','fleurs de camomille']],
    prep:['Laisser macérer les fleurs 4 semaines dans l’alcool.', 'Préparer le sirop avec l’eau et le sucre puis l’ajouter froid à la macération.', 'Faire décanter une semaine puis filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cannelle-1', nom:'Liqueur de Cannelle 1', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:38, mac:60, macTxt:'2 mois', lot:2.3,
    tags:['cannelle', 'alcool', 'rhum', 'sucre', 'eau'],
    ing:[[10,'bâton','cannelle'],[1,'L','alcool de fruits'],[1,'L','rhum brun'],[500,'g','sucre'],[1,'verre','eau']],
    prep:['Mélanger les alcools et ajouter la cannelle finement broyée.', 'Dissoudre le sucre dans un verre d’eau et l’ajouter à la préparation.', 'Laisser doucement macérer au moins 2 mois.', 'Filtrer et mettre en bouteilles cet alcool très parfumé, qui se marie magnifiquement avec les salades de fruits et les pâtisseries.'] },

  { id:'lq-liqueur-de-cannelle-2', nom:'Liqueur de Cannelle 2', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:60, macTxt:'2 mois', lot:1.3,
    tags:['eau-de-vie', 'cannelle', 'pommes', 'vanille', 'sucre', 'eau'],
    ing:[[1,'L','eau de vie de fruit à 40°'],[10,'bâton','cannelle'],[5,'pièces','pommes golden douces'],[1,'gousse','vanille'],[350,'g','sucre'],[1,'verre','eau']],
    prep:['Broyer au mortier la cannelle, et la mettre dans une jarre.', 'Verser dessus l’alcool, puis Ajouter la vanille fendue.', 'Dissoudre le sucre dans le verre d’eau et l’ajouter à la préparation.', 'Peler les pommes, les débiter en petit quartiers et les mélanger dans la jarre.', 'Laisser reposer à l’ombre pendant 2 mois.', 'Passer ce temps passer et bien exprimer tout le jus.', 'Filtrer finement et mettre en bouteilles.', 'Cet alcool fin et parfumé accompagnera divinement le riz au lait par exemple.'] },

  { id:'lq-liqueur-de-carvi', nom:'Liqueur de Carvi', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:30, macTxt:'un mois', lot:2.4,
    tags:['graines', 'eau-de-vie', 'eau', 'sucre'],
    ing:[[30,'g','graines de carvi'],[2,'L','eau de vie à 40°'],[15,'cl','eau'],[600,'g','sucre']],
    prep:['Faire macérer les graine de carvi pendant un mois dans l’eau de vie dans un endroit tiède.', 'Ajouter le sirop préparé avec l’eau et le sucre candi.', 'Laisser reposer une semaine et filtrer la préparation.', 'Mettre en bouteilles.', 'Laisser reposer quelques semaines avant de consommer.'] },

  { id:'lq-liqueur-de-cassis-1', nom:'Liqueur de Cassis 1', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:90, macTxt:'3 mois', lot:2.4,
    tags:['cassis', 'eau', 'sucre', 'alcool'],
    ing:[[1,'kg','Cassis'],[15,'cl','eau'],[500,'g','sucre'],[2,'L','alcool à 40°']],
    prep:['Egrapper les cassis, les ébarber et les mettre dans un bocal fermant bien.', 'Préparer le sirop et le verser froid sur les fruits, Ecraser vigoureusement les baies puis verser l’alcool.', 'Fermer le bocal et laisser au moins 3 mois dans un endroit sombre.', 'Mélanger régulièrement la macération.', 'Filtrer le mélange et laisser reposer 2 ou 3 jours, filtrer de nouveau et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cassis-2', nom:'Liqueur de Cassis 2', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['cassis', 'bol', 'alcool', 'sucre', 'eau', 'girofle', 'macis'],
    ing:[[1.5,'kg','cassis'],[1,'pièce','bol de framboise'],[2,'L','alcool à 40°'],[600,'g','sucre en poudre'],[15,'cl','eau'],[4,'clous','girofle'],[1,'c. à café','macis']],
    prep:['Laver et égoutter les fruits et les verser dans un bocal contenant l’alcool.', 'Ajouter les épices le sirop refroidi et les épices.', 'Laisser macérer et remuant très souvent pendant au moins 2 mois.', 'Filtrer la préparation plusieurs fois pour bien clarifier le mélange.', 'Mettre en bouteilles et laisser reposer quelques semaines avant de consommer.'] },

  { id:'lq-liqueur-de-cerfeuil', nom:'Liqueur de Cerfeuil', cat:'liqueurs', themes:['plantes'], gravure:'plante', degre:20, mac:28, macTxt:'4 semaines', lot:2.3,
    tags:['alcool', 'eau', 'sucre', 'menthe', 'absinthe', 'cerfeuil'],
    ing:[[1,'L','alcool à 40°'],[1,'L','eau'],[500,'g','sucre'],[50,'g','menthe'],[20,'g','absinthe'],[200,'g','cerfeuil']],
    prep:['Faire macérer dans l’alcool, le cerfeuil, l’absinthe (ou de la badiane), la menthe.', 'Mettre le mélange 4 semaines dans une jarre à l’ombre.', 'Filtrer le mélange puis incorporer le sirop bien refroidi, laisser décanter quelques jours puis filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cerises-noires', nom:'Liqueur de Cerises Noires', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:30, macTxt:'un mois', lot:2.4,
    tags:['cerises', 'alcool', 'sucre', 'eau'],
    ing:[[2,'kg','cerises noires'],[2,'L','alcool à 40°'],[600,'g','sucre'],[15,'cl','eau']],
    prep:['Dénoyauter les cerises et les écraser dans un bocal fermant bien, concasser la moitié des noyaux.', 'Mettre les fruits et les noyaux concassés dans un bocal, couvrir d’eau de vie et laisser macérer un mois.', 'Passer le mélange en exprimant bien tout le jus, faire un sirop avec le sucre et l’eau et l’incorporer encore tiède à la préparation.', 'Laisser décanter quelques jours, filtrer et mettre en bouteilles.', 'Laisser reposer quelques semaines avant de consommer bien frais.'] },

  { id:'lq-liqueur-facon-chartreuse-jaune', nom:'Liqueur façon Chartreuse Jaune', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'racine', degre:38, mac:28, macTxt:'4 semaines', lot:2.4,
    tags:['alcool', 'badiane', 'graines', 'racine', 'safran', 'eau', 'sucre'],
    ing:[[2,'L','alcool à 40°'],[5,'g','badiane'],[5,'g','graines de fenouil'],[10,'g','graines de carvi'],[6,'g',"graines d'ambrette"],[5,'g',"racine d'angélique"],[2,'g','safran'],[15,'cl','eau'],[600,'g','sucre']],
    prep:['Laisser macérer tous les ingrédients dans l’alcool pendant 4 semaines dans une bonbonne fermant bien.', 'Ensuite filtrer la préparation puis ajouter le sirop de sucre froid.', 'Laisser décanter quelques jours filtrer de nouveau et mettre en bouteilles.', 'Faire vieillir au moins 6 mois avant de consommer.'] },

  { id:'lq-liqueur-facon-chartreuse-verte', nom:'Liqueur Façon Chartreuse Verte', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'epice', degre:38, mac:56, macTxt:'8 semaines', lot:2.4,
    tags:['faut', 'chaque', 'badiane', 'coriandre', 'feuille', 'sauge', 'mélisse', 'pétales', 'safran', 'angélique'],
    ing:[[null,'','il faut'],[10,'g','chaque produit suivant'],[null,'','badiane'],[null,'','coriandre fraîche'],[null,'','feuille de menthe fraîche'],[null,'','sauge fraîche'],[null,'','mélisse fraîche'],[null,'','pétales de tanaisie'],[2,'g','safran'],[2,'branches','angélique'],[2,'L','alcool à 40°'],[15,'cl','eau'],[300,'g','sucre']],
    prep:['Mettre tout les éléments dans l’alcool, dissoudre le sucre dans l’eau avec le safran et laisser refroidir.', 'Dans une jarre faire macérer différentes feuilles, les branches d’angélique tronçonnées et le sirop safrané.', 'Mettre au repos dans un endroit sombre pendant 8 semaines.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cherry-brandy', nom:'Liqueur de Cherry Brandy', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:37, mac:30, macTxt:'un mois', lot:1.8,
    tags:['alcool', 'kirsch', 'cerises', 'framboises', 'cannelle', 'girofle', 'sucre'],
    ing:[[1,'L','alcool pour fruits'],[50,'cl','kirsch'],[200,'g','cerises noires'],[200,'g','cerises aigres'],[125,'g','framboises'],[1,'bâton','cannelle'],[3,'clous','girofle'],[1,'kg','sucre']],
    prep:['Laver, sécher et équeuter les cerises ; écraser les grossièrement en brisant les noyaux.', 'Passer les framboises au mixer.', "Mettre ces fruits dans une casserole anti-adhérente avec l'eau de vie le bâton de cannelle et les clous de girofle.", 'Amener à ébullition sur feu moyen.', 'Après quelques bouillons, verser dans un grand bocal.', 'Laisser refroidir et boucher.', 'Laisser macérer au frais pendant un mois.', "Passé ce délai, faire un sirop avec le sucre et un litre d'eau.", 'Faire cuire 2 mn à gros bouillons sans cesser de remuer.', 'Laisser refroidir.', 'Filtrer le contenu du bocal, ajouter le sirop refroidi et le kirsch.', 'Filtrer et mettre en bouteilles.', 'Boucher soigneusement et attendre un bon mois avant de consommer.', "Garder à l'abri de la lumière.", 'Cette liqueur se bonifie en vieillissant.'] },

  { id:'lq-liqueur-de-chicoree', nom:'Liqueur de Chicorée', cat:'liqueurs', themes:['fleurs', 'epices', 'plantes'], gravure:'fleur', degre:38, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['fleur', 'alcool', 'eau', 'girofle', 'sucre'],
    ing:[[100,'g','fleur de chicorée'],[2,'L','alcool à 40°'],[15,'cl','eau'],[6,'clous','girofle'],[500,'g','sucre']],
    prep:['Faire sécher les tiges de chicorée et recueillir les fleurs.', 'Mettre dans un bocal l’alcool, les fleurs, les clous de girofle et le sucre dissous dans l’eau.', 'Laisser macérer 2 mois en remuant de temps en temps.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-citron', nom:'Liqueur de Citron', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:45, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['eau-de-vie', 'sucre', 'eau', 'citrons'],
    ing:[[2,'L','eau de vie à 40°'],[600,'g','sucre en poudre'],[15,'cl','eau'],[2,'kg','citrons non traités']],
    prep:['Rincer et essuyer les citrons.', "Prélever les zestes avec un épluche-légumes, en évitant d'entamer la peau blanche.", "Couper les zestes en fines lanières et les mettre dans une bonbonne avec l'alcool.", 'Couvrir et laisser macérer 2 mois.', "Mélanger l'eau et le sucre puis porter à ébullition, faire bouillir 1 min puis laisser refroidir ce sirop.", "Filtrer l'eau-de-vie et mélanger-la au sirop refroidi.", 'Mettre en bouteilles et fermer hermétiquement.', 'Le mélange obtenu titre alors 45°.', 'Laisser reposer 2 mois avant consommer.', 'Degré final de la préparation ≈ 38°.'] },

  { id:'lq-liqueur-de-clementines', nom:'Liqueur de Clémentines', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:38, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['clémentines', 'alcool', 'eau', 'sucre'],
    ing:[[1,'kg','clémentines non traitées'],[2,'L','alcool à 40°'],[15,'cl','eau'],[600,'g','sucre']],
    prep:['Laver les clémentines puis recueillir les zestes avec un économe.', 'Mettre dan un bocal hermétique les zestes et l’alcool.', 'Laisser macérer pendant 2 mois.', 'Faire le sirop avec l’eau et le sucre, le laisser refroidir et le mélanger à la macération.', 'Laisser de nouveau reposer 1 mois.', 'Filtrer et mettre en bouteilles.', 'Cette liqueur très fine se boit frappée.'] },

  { id:'lq-liqueur-de-coing', nom:'Liqueur de Coing', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:2, macTxt:'2 jours', lot:2.4,
    tags:['coings', 'sucre', 'alcool', 'eau', 'amandes'],
    ing:[[2,'kg','coings bien mûrs'],[400,'g','sucre'],[2,'L','alcool à 40°'],[15,'cl','eau'],[10,'pièces','amandes amères émondées']],
    prep:['Frotter les coings sans les peler, puis les râper.', 'Laisser reposer cette purée une nuit.', 'Le lendemain exprimer tout le jus, et le mettre à cuire 15 minutes.', 'Préparer le sirop et l’ajouter au jus.', 'Quand tout est bien refroidi, ajouter l’alcool et mettre la préparation dans un bocal fermant bien avec les amandes amères.', 'Placer dans un endroit tempéré pendant 2 mois.', 'Remuer régulièrement le mélange.', 'Filtrer et laisser décanter 2 jours.', 'Filtrer une seconde fois et mettre en bouteilles.', 'Ne consommer qu’après quelques semaines.'] },

  { id:'lq-liqueur-de-coquelicot', nom:'Liqueur de Coquelicot', cat:'liqueurs', themes:['fleurs', 'epices'], gravure:'fleur', degre:37, mac:28, macTxt:'4 semaines', lot:2.4,
    tags:['pétales', 'alcool', 'cannelle', 'sucre', 'eau'],
    ing:[[150,'g','pétales de coquelicots'],[2,'L','alcool à 40°'],[30,'g','cannelle'],[600,'g','sucre'],[15,'cl','eau']],
    prep:['Faire sécher les pétales au soleil, Dans une jarre mettre l’alcool et la cannelle, les pétales de coquelicot, puis laisser macérer 4 semaines.', 'Diluer le sucre dans le litre d’eau et laisser refroidir le sirop.', 'Ajouter le sirop dans la macération, faire reposer 2 jours.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-douce-de-coriandre', nom:'Liqueur douce de Coriandre', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:18, mac:60, macTxt:'2 mois', lot:2.6,
    tags:['faut', 'litre', 'graines', 'cuillère', 'étoiles', 'sucre', 'cannelle'],
    ing:[[null,'','Il faut ½ litre de vin blanc sec à 13°'],[null,'','½ litre d’eau de vie à 40°'],[15,'g','graines de coriandre'],[1,'pièce','petite cuillère à café de graines d’anis'],[2,'pièces','étoiles de badiane'],[250,'g','sucre et ½ gousse de vanille'],[1,'bâton','cannelle']],
    prep:['Mettre tous les ingrédients dans un bocal hermétique et laisser macérer à l’ombre pendant au moins 2 mois.', 'Faire fondre le sucre dans le vin blanc et laisser reposer une semaine.', 'Filtrer la macération et la mélanger avec le vin sucré.', 'Laisser reposer un mois, filtrer le tout et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-cumin', nom:'Liqueur de Cumin', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['graines', 'alcool', 'sucre', 'eau', 'citrons'],
    ing:[[25,'g','graines de cumin'],[1,'L','alcool à 40°'],[300,'g','sucre'],[1,'verre','eau'],[2,'pièces','citrons non traités'],[1,'verre','eau']],
    prep:['Broyer au mortier les graines de cumin, peler les citron pour recueillir les zestes.', 'Mettre le jus des citrons, les zestes et les graines broyées dans l’alcool.', 'Ajouter le sucre dilué dans le verre d’eau.', 'Faire macérer 4 semaines, puis filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-curacao', nom:'Liqueur de Curaçao', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:37, mac:30, macTxt:'1mois', lot:2.4,
    tags:['sucre', 'écorces', 'bâtons', 'bois', 'girofle', 'alcool', 'eau'],
    ing:[[500,'g','sucre'],[50,'g','écorces d’oranges amères (bigaradier)'],[3,'g','bâtons de cannelle'],[50,'g','bois de Pernambouc (pour donner une couleur orange clair)'],[1,'clou','girofle'],[2,'L','alcool à 40°'],[15,'cl','eau']],
    prep:['Dissoudre le sucre dans 1 litre d’eau, et faire macérer tous les ingrédients pendant 1mois.', 'Filtrer et mettre en bouteilles.', 'Si la préparation n’est pas assez colorée on le faire avec du caramel et un peu de carmin.'] },

  { id:'lq-liqueur-de-cynorrhodon-gratte-cul', nom:'Liqueur de Cynorrhodon (Gratte-cul)', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['alcool', 'cynorrhodons', 'sucre', 'vanille'],
    ing:[[1,'L','alcool de fruit ou de cognac ordinaire'],[500,'g','cynorrhodons bien mûrs'],[250,'g','sucre candi liquide'],[1,'gousse','vanille']],
    prep:['Le cynorrhodon doit être cueilli bien mûr après les premiers froids.', 'Couper les fruits en quartiers, les recouvrir d’alcool, ajouter le sucre candi et la vanille.', 'Agiter régulièrement le bocal et laisser macérer au moins 3 mois.', 'Filtrer et presser puis mettre en bouteilles, laisser reposer encore quelques mois à l’ombre d’une cave.'] },

  { id:'lq-liqueur-de-figues', nom:'Liqueur de Figues', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:36, mac:2, macTxt:'48 h', lot:2.4,
    tags:['alcool', 'eau', 'sucre', 'figues', 'vanille'],
    ing:[[2,'L','alcool à 40°'],[15,'cl','eau'],[500,'g','sucre'],[2,'kg','figues bien mûres'],[1,'bâton','vanille']],
    prep:['Couper la queue des fruits et les partager en deux.', 'Les laisser macérer 48 h dans un grand saladier avec la gousse de vanille coupée en 2.', 'Couvrir d’alcool et mettre la préparation dans un grand bocal hermétique pendant 6 semaines.', 'Après ce temps la liqueur s’et tintée d’un beau rose clair.', 'Flirter une première fois pour filtrer les fruits, laisser reposer quelques jours, puis filtrer finement une seconde fois et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-fraises', nom:'Liqueur de Fraises', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:50, macTxt:'50 jours', lot:2.3,
    tags:['eau-de-vie', 'fraises', 'sucre', 'vanille', 'cannelle', 'citron'],
    ing:[[2,'L','eau de vie à 40°'],[1,'kg','fraises'],[500,'g','sucre'],[1,'gousse','vanille'],[1,'bâton','cannelle'],[2,'zeste','citron']],
    prep:['Laver et équeuter les fraises et les couper en quarts.', 'Laisser bien sécher les fraises.', 'Placer les fraises dans un bocal qui peut se fermer hermétiquement.', 'Ajouter les zestes de citron, la vanille fendue et la cannelle.', 'Recouvrir le tout avec l’alcool.', 'Fermer le bocal et laisser macérer pendant 50 jours.', 'Remuer le mélanger tous les 3 jours.', 'Après 50 jours, écraser les fruits dans le bocal.', 'Laisser encore macérer 5 jours.', 'Au bout des 5 jours, ajouter tout le sucre dilué dans un verre d’eau et laisser encore macérer 2 jours.', 'Au bout des 2 jours, embouteiller le liquide en le filtrant finement au moins 3 fois.', 'Servir frais après 1 mois de bouteille.'] },

  { id:'lq-liqueur-de-fraises-a-la-cannelle', nom:'Liqueur de Fraises à la Cannelle', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:50, macTxt:'50 jours', lot:2.3,
    tags:['eau-de-vie', 'fraises', 'sucre', 'cannelle'],
    ing:[[2,'L','eau de vie à 40°'],[1,'kg','fraises des bois'],[500,'g','sucre'],[1,'bâton','cannelle']],
    prep:['Laver et équeuter les fraises et couper en quarts.', 'Laisser bien sécher les fraises.', 'Placer les fraises dans un bocal qui peut se fermer hermétiquement.', 'Ajouter la cannelle et recouvrir le tout avec l’alcool.', 'Fermer le bocal et laisser macérer pendant 50 jours.', 'Remuer le mélange tous les 3 jours.', 'Après 50 jours, écraser les fruits dans le bocal Laisser encore macérer 5 jours.', 'Au bout des 5 jours, ajouter tout le sucre et laisser encore macérer 2 jours.', 'Au bout des 2 jours, embouteiller le liquide en le filtrant 3 fois.', 'Servir au bout d’un mois d’embouteillage.'] },

  { id:'lq-liqueur-douce-de-fraises-a-la-vanille', nom:'Liqueur douce de Fraises à la Vanille', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:32, mac:21, macTxt:'3 semaines', lot:2.1,
    tags:['fraises', 'eau', 'alcool', 'sucre', 'vanille'],
    ing:[[1,'kg','fraises biens mûres'],[0.3,'L','eau'],[1.5,'L','alcool à 40°'],[600,'g','sucre'],[1,'gousse','vanille']],
    prep:['Laver et équeuter les fraises.', 'Sécher les fraises et couper les en petits morceaux.', 'Mélanger dans un récipient hermétique non transparent les fraises, l’alcool, l’eau, le sucre et la gousse de vanille fendue, il faut racler toutes les graines et les mettre dans la bonbonne.', 'Laisser macérer pendant 3 semaines en remuant le mélange 1 fois par jour.', 'Au bout des 3 semaines, embouteiller en filtrant le mélange.', 'Attendre à nouveau 3 semaines avant de servir.'] },

  { id:'lq-liqueur-de-framboises', nom:'Liqueur de Framboises', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:37, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['framboises', 'eau-de-vie', 'sucre', 'girofle', 'vanille', 'eau'],
    ing:[[1,'kg','framboises'],[2,'L','eau de vie de fruits à 40°'],[600,'g','sucre'],[5,'clous','girofle'],[2,'gousses','vanille'],[15,'cl','eau']],
    prep:['Ecraser les framboises à travers un tamis fin puis ensuite filtrer le jus dans une passoire très fine.', 'Verser le jus des framboises dans une jarre.', "Ajouter le sucre, l'eau de vie de fruits, les clous de girofle et la vanille fendue en deux.", 'Fermer le bocal et laisser reposer dans un endroit frais et obscur, pendant 20 jours minimum, en remuant de temps en temps.', "Laisser reposer encore 1 ou 2 mois dans l'obscurité avant de consommer."] },

  { id:'lq-liqueur-de-genievre', nom:'Liqueur De Genièvre', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:36, mac:56, macTxt:'8 semaines', lot:1.3,
    tags:['baies', 'alcool', 'eau', 'sucre'],
    ing:[[200,'pièces','baies de genièvre'],[1,'L','alcool à 45°'],[1,'verre','eau'],[300,'g','sucre']],
    prep:['Faire une décoction avec l’eau et le genièvre, puis dans le liquide encore chaud, dissoudre le sucre.', 'Laisser refroidir et ajouter l’alcool.', 'Laisser reposer dans une jarre au moins 8 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-girofle-frais', nom:'Liqueur de Girofle frais', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:36, mac:30, macTxt:'un mois', lot:1.3,
    tags:['oranges', 'girofle', 'alcool', 'eau', 'sucre'],
    ing:[[2,'pièces','oranges non traitées'],[50,'clous','girofle'],[1,'L','alcool à 40°'],[1,'verre','eau'],[200,'g','sucre']],
    prep:['Dissoudre le sucre dans le verre d’eau et laisser refroidir.', 'Broyer au mortier les clous de girofle.', 'Mettre à macérer l’alcool, le sirop, les clous de girofle et le zeste des oranges.', 'Faire reposer au frais la jarre au moins un mois.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-gingembre', nom:'Liqueur de Gingembre', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:36, mac:28, macTxt:'4 semaines', lot:2.4,
    tags:['alcool', 'gingembre', 'sucre', 'eau', 'dosette'],
    ing:[[2,'L','alcool de fruits'],[300,'g','gingembre frais'],[500,'g','sucre'],[15,'cl','eau'],[1,'pièce','dosette de safran']],
    prep:['Peler le gingembre et le couper en petits morceaux.', 'Le faire bouillir à petit feu pendant 30 minutes dans le ½ litre d’eau.', 'Faire dissoudre le sucre.', 'Laisser refroidir puis ajouter cette décoction dans l’alcool.', 'Laisser macérer 4 semaines.', 'Puis filtrer et mettre en bouteilles.', 'On peu ajouter une dose de safran pour bien colorer le mélange.'] },

  { id:'lq-liqueur-de-graines-de-fenouil-1', nom:'Liqueur de Graines de Fenouil 1', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:36, mac:30, macTxt:'un mois', lot:1.3,
    tags:['alcool', 'sucre', 'graines', 'cannelle', 'girofle', 'eau'],
    ing:[[1,'L','alcool à 40°'],[300,'g','sucre en poudre'],[2,'c. à s.','graines de fenouil'],[1,'bâton','cannelle'],[2,'clous','girofle'],[1,'verre','eau']],
    prep:['Broyer les épices puis les faire le sirop de sucre, laissez le refroidir et faire macérer tous les ingrédients pendant un mois.', 'Remuer régulièrement le mélange.', 'Passé ce délai filtrer la macération et mettre en bouteilles.', 'Laisser vieillir quelques semaines avant de déguster.'] },

  { id:'lq-liqueur-de-graines-de-fenouil-2', nom:'Liqueur de Graines de Fenouil 2', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:30, mac:28, macTxt:'4 semaines', lot:2.3,
    tags:['graines', 'alcool', 'sucre', 'eau'],
    ing:[[15,'g','graines de fenouil'],[10,'g','graines d’anis (ou de badiane)'],[1.5,'L','alcool de fruit à 40°'],[300,'g','sucre'],[50,'cl','eau']],
    prep:['Broyer au mortier les graines d’anis et de fenouil et les faire macérer 4 semaines dans l’alcool.', 'Dissoudre le sucre dans l’eau et l’ajouter à la préparation.', 'Bien mélanger et laisser reposer 4 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-groseilles', nom:'Liqueur de Groseilles', cat:'liqueurs', themes:['fruits', 'fleurs'], gravure:'fruit', degre:35, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['groseilles', 'alcool', 'eau', 'sucre'],
    ing:[[1,'kg','groseilles'],[2,'L','alcool à 40°'],[15,'cl','eau'],[500,'g','sucre']],
    prep:['Egrapper les groseilles, les laver et les sécher.', 'Les mettre dans un bocal et les recouvrir avec l’alcool.', 'Laisser macérer à l’ombre pendant 2 mois.', 'Filtrer la préparation et bien exprimer tout le jus à travers une mousseline.', 'Faire le sirop et le laisser bouillir 15 minutes pour le faire légèrement épaissir.', 'Après refroidissement complet mélanger le sirop à l’alcool, laisser décanter, filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-jasmin', nom:'Liqueur de Jasmin', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:6, macTxt:'6 jours', lot:2.4,
    tags:['fleurs', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[250,'g','fleurs de jasmin fraîches'],[2,'L','eau de vie à 40°'],[500,'g','sucre'],[15,'cl','eau']],
    prep:['Effeuiller les fleurs pour ne garder que les pétales, les mettre à macérer dans un bocal hermétique avec l’eau de vie. 6 heures après préparer le sirop avec l’eau et le sucre et le verser encore tiède sur la macération.', 'Laisser reposer 6 jours en remuant de temps en temps.', 'Passer la liqueur et la mettre en bouteilles.', 'Attendre quelques semaines avant de consommer cette liqueur très parfumée.'] },

  { id:'lq-liqueur-de-kaki', nom:'Liqueur de Kaki', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:36, mac:56, macTxt:'8 semaines', lot:1.3,
    tags:['kakis', 'alcool', 'sucre', 'vanille', 'eau'],
    ing:[[4,'pièces','Kakis de l’automne bien blet'],[1,'L','alcool à 40°'],[300,'g','sucre'],[1,'gousse','vanille'],[1,'verre','eau']],
    prep:['Ouvrir la gousse de vanille, peler les kakis et ne récupérer que la pulpe.', 'Faire dissoudre le sucre dans l’eau avec la gousse de vanille, puis laisser refroidir.', 'Mélanger dans une jarre, le sirop avec la vanille et les fruits.', 'Laisser macérer 8 semaines, puis filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-laitue', nom:'Liqueur De Laitue', cat:'liqueurs', themes:['plantes'], gravure:'racine', degre:36, mac:28, macTxt:'4 à 5 semaines', lot:1.3,
    tags:['belles', 'bonne', 'alcool', 'sucre'],
    ing:[[2,'pièces','ou 3 belles laitues'],[1,'pièce','bonne poignée de chicorée'],[1,'L','alcool à 40°'],[400,'g','sucre et un verre d’eau']],
    prep:['Laver et bien essorer les salades puis les mettre dans l’alcool.', 'Faire un sirop avec le sucre et l’eau et sitôt refroidi le mélanger à la macération.', 'Poser la jarre dans un placard sombre et agiter régulièrement le contenu.', 'Filtrer au bout de 4 à 5 semaines et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-laurier', nom:'Liqueur De Laurier', cat:'liqueurs', themes:['plantes'], gravure:'plante', degre:36, mac:56, macTxt:'8 semaines', lot:1.3,
    tags:['feuilles', 'alcool', 'sucre'],
    ing:[[150,'g','feuilles fraîches de laurier sauce'],[1,'L','alcool à 40°'],[400,'g','sucre et un verre d’eau']],
    prep:['Hacher grossièrement les feuilles et le mettre dans l’alcool.', 'Faire un sirop avec l’eau et le sucre et laisser refroidir.', 'Mélanger le tout dans une jarre, puis laisser reposer 8 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-lait', nom:'Liqueur de Lait', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:25, mac:15, macTxt:'15 jours', lot:3.8,
    tags:['lait', 'eau-de-vie', 'zestes', 'vanille', 'sucre'],
    ing:[[1,'L','lait entier'],[2,'L','eau de vie à 40°'],[null,'','les zestes d’un citron'],[1,'gousse','vanille'],[50,'cl','sucre de canne']],
    prep:['Faire bouillir le lait avec la gousse de vanille fendue, racler bien toutes les graines.', 'Laisser refroidir et ajouter l’alcool les zestes de citron et le sucre de canne.', 'Laisser macérer 15 jours, filtrer et mettre en bouteilles.', 'Se consomme très frais.'] },

  { id:'lq-liqueur-de-magnolia', nom:'Liqueur de Magnolia', cat:'liqueurs', themes:['fleurs', 'epices'], gravure:'fleur', degre:25, mac:28, macTxt:'4 semaines', lot:3.8,
    tags:['magnolia', 'vanille', 'sucre', 'bon', 'alcool'],
    ing:[[5,'fleurs','magnolia fraîchement cueillies'],[2,'gousses','vanille'],[500,'g','sucre en poudre'],[1.5,'L','bon vin rouge à 13°'],[2,'L','alcool à 40°']],
    prep:['Découper finement les pétales des fleurs de magnolia.', 'Les mettre dans un bocal hermétique avec la vanille fendue et le sucre.', 'Arroser avec le vin et ajouter l’eau de vie.', 'Remuer et fermer le bocal.', 'Laisser 4 semaines dans un endroit frais et à l’ombre.', 'Agiter régulièrement la préparation.', 'Passer en exprimant la macération, mettre en bouteilles, se consomme immédiatement.'] },

  { id:'lq-liqueur-de-caramel', nom:'Liqueur de caramel', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:10, macTxt:'10 jours', lot:1.3,
    tags:['caramels', 'eau', 'vanille', 'alcool'],
    ing:[[400,'g','caramels mous au naturel'],[1,'verre','eau'],[1,'gousse','vanille'],[1,'L','alcool à 40°'],[1,'verre','eau']],
    prep:['Faire doucement fondre le caramel dans l’eau avec la vanille fendue.', 'Laisser refroidir puis mettre ce sirop et l’alcool dans une jarre et bien dissoudre le tout.', 'Laisser reposer 10 jours et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-mandarine', nom:'Liqueur de Mandarine', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:42, mac:60, macTxt:'2 mois', lot:1.0,
    tags:['rhum', 'sucre', 'mandarines', 'eau'],
    ing:[[0.5,'L','rhum blanc agricole à 55°'],[125,'g','sucre'],[4,'pièces','mandarines'],[20,'cl','eau']],
    prep:['Laver les mandarines, prélever les zestes.', 'Presser leur jus.', 'Le verser dans un bocal avec les zestes et le rhum.', 'Laisser macérer 2 mois.', "Faire fondre le sucre dans un peu d'eau et mélanger à l'alcool de mandarines filtré.", 'Mettre en bouteilles et attendre 30 jours avant de déguster.'] },

  { id:'lq-liqueur-de-manzana', nom:'Liqueur de Manzana', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:20, mac:7, macTxt:'Une semaine', lot:2.3,
    tags:['eau-de-vie', 'jus', 'sucre'],
    ing:[[1,'L','eau de vie à 40°'],[1,'L','jus de pommes'],[300,'g','sucre en poudre']],
    prep:['Dissoudre le sucre dans le jus de pommes, chauffer le mélange autour de 60°C pour finir de dissoudre le sucre.', "Ensuite, mélanger avec l'eau de vie à parts égales.", "On peut mettre un peu plus de jus que d'eau de vie pour avoir une liqueur plus soft.", 'Une semaine plus tard, filtrer le jus pour en sortir les impuretés.', 'Le mettre en bouteille et filtrer finement plusieurs fois, puis laisser reposer de longs mois.', 'Six mois sont raisonnables.'] },

  { id:'lq-liqueur-de-melisse', nom:'Liqueur de Mélisse', cat:'liqueurs', themes:['fruits', 'epices', 'plantes'], gravure:'fruit', degre:38, mac:30, macTxt:'un mois', lot:2.3,
    tags:['alcool', 'feuilles', 'zestes', 'girofle', 'sucre', 'eau'],
    ing:[[2,'L','alcool à 40°'],[200,'g','feuilles de mélisse'],[null,'','les zestes de 2 citrons non traités'],[2,'clous','girofle'],[100,'g','feuilles de menthe'],[600,'g','sucre en poudre 1 cuillère à café de macis'],[1,'verre','eau']],
    prep:['Mettre à macérer pendant un mois tous les ingrédients sauf le sucre et l’eau.', 'Passé ce délai faire le sirop avec le sucre et l’eau et le mélanger tiède à la préparation.', 'Laisser reposer 15 jours, puis filtrer et mettre en bouteilles.', 'Pendant la macération laisser le bocal dans un endroit sombre.'] },

  { id:'lq-liqueur-de-melon', nom:'Liqueur de Melon', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:38, mac:60, macTxt:'2 mois', lot:2.3,
    tags:['beau', 'alcool', 'sucre', 'eau'],
    ing:[[1,'pièce','beau melon'],[2,'L','alcool à 40°'],[500,'g','sucre'],[1,'verre','eau']],
    prep:['Peler le melon et supprimer les pépins.', 'Couper la pulpe en petits cubes et mettre à macérer dans l’alcool pendant un mois.', 'Faire un sirop avec l’eau et le sucre et mélanger à la préparation.', 'Laisser confire pendant 2 mois.', 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-menthe-1', nom:'Liqueur de Menthe 1', cat:'liqueurs', themes:['fruits', 'epices', 'plantes'], gravure:'fruit', degre:38, mac:60, macTxt:'2 mois', lot:2.3,
    tags:['beau', 'eau-de-vie', 'sucre', 'citron', 'eau'],
    ing:[[1,'pièce','beau bouquet de menthe poivrée (50 branches)'],[2,'L','eau de vie à 40°'],[500,'g','sucre'],[0.5,'pièces','citron non traité'],[1,'verre','eau']],
    prep:['Effeuillez le bouquet de menthe en éliminant les tiges.', "Mettez les feuilles dans un bocal préalablement ébouillanté et séché, recouvrez d'eau de vie.", 'Fermez et laissez macérer 2 semaines.', "Au bout de ce temps, portez 12 cl d'eau à ébullition dans un faitout, avec le sucre.", 'Faites bouillir 1 minute puis laissez refroidir ce sirop.', 'Râpez finement le zeste du demi-citron, ajoutez-le dans le bocal, ainsi que le sirop refroidi.', 'Fermez à nouveau et laissez macérer 3 semaines à l’ombre.', "Filtrez à travers une passoire doublée d'une étamine, mettez en flacons, bouchez hermétiquement.", 'Laissez reposer 2 mois avant de consommer.'] },

  { id:'lq-liqueur-de-menthe-2', nom:'Liqueur de Menthe 2', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'epice', degre:27, mac:7, macTxt:'une semaine', lot:3.3,
    tags:['feuilles', 'alcool', 'sucre', 'eau', 'sirop'],
    ing:[[250,'g','feuilles fraîches de menthe poivrée'],[2,'L','alcool à 40°'],[600,'g','sucre'],[1,'L','eau'],[2,'c. à s.','sirop de menthe']],
    prep:['Lavez les feuilles de menthe, égouttez-les et séchez-les.', "Mettre les feuilles de menthe dans un bocal avec l'alcool, fermez hermétiquement et faire macérer pendant une semaine au soleil si possible.", "Faire un sirop de sucre léger (1 minute d'ébullition).", "Filtrez l'alcool et ajoutez le sirop de sucre.", 'Colorez avec le sirop de menthe et mettre en bouteille.'] },

  { id:'lq-liqueur-de-menthe-3', nom:'Liqueur de Menthe 3', cat:'liqueurs', themes:['fruits', 'fleurs', 'plantes'], gravure:'fruit', degre:35, mac:30, macTxt:'un mois', lot:2.5,
    tags:['poignées', 'sucre', 'alcool', 'eau', 'cuil.'],
    ing:[[2,'pièces','grosses poignées de menthe (feuilles et fleurs)'],[700,'g','sucre'],[2,'L','alcool à 40°'],[15,'cl','eau'],[2,'pièces','cuil. à soupe de sucre'],[8,'cl','eau 1 citron']],
    prep:['Lavez les feuilles de menthe, égouttez-les et séchez-les.', "Mettre les feuilles de menthe dans un bocal avec l'alcool, fermez hermétiquement et faire macérer pendant un mois au soleil si possible.", 'Préparez un sirop de sucre.', "Filtrez l'alcool et ajouter le sirop de sucre.", 'Préparez un caramel très brun et ajoutez quelques gouttes de citron.', 'Versez ce caramel dans la liqueur et mettez en bouteilles.'] },

  { id:'lq-liqueur-de-millepertuis', nom:'Liqueur de Millepertuis', cat:'liqueurs', themes:['fruits', 'fleurs', 'plantes'], gravure:'fruit', degre:38, mac:42, macTxt:'6 semaines', lot:2.3,
    tags:['alcool', 'fleurs', 'citrons', 'sucre', 'eau'],
    ing:[[2,'L','alcool à 40°'],[50,'g','fleurs sèches de millepertuis'],[2,'pièces','citrons non traités'],[600,'g','sucre'],[1,'verre','eau']],
    prep:['Mettre les fleurs et le citron coupé en tranches fines dans l’alcool.', 'Faire macérer au moins 6 semaines au soleil.', 'Filtrer la préparation et ajouter le sirop froid.', 'Laisser reposer quelques jours, filtrer à nouveau et mettre en bouteilles.', 'Il faut faire vieillir 2 à 3 mois avant de déguster cette liqueur rouge.'] },

  { id:'lq-liqueur-de-mirabelles-au-rhum', nom:'Liqueur de Mirabelles au Rhum', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:40, mac:60, macTxt:'2 mois', lot:3.1,
    tags:['mirabelles', 'rhum', 'sucre', 'eau'],
    ing:[[1,'kg','mirabelles'],[2,'L','rhum blanc agricole à 55°'],[600,'g','sucre'],[80,'cl','eau']],
    prep:['Laver et dénoyauter les mirabelles.', 'Plonger quelques secondes les mirabelles dans l’eau bouillante afin d’éviter une fermentation en bouteille.', 'Placer les mirabelles dans une bouteille et compléter avec le rhum.', 'Casser les noyaux des mirabelles et les ajouter à la préparation.', 'Laisser macérer 2 mois.', 'Au bout des 2 mois, filtrer finement et embouteiller.', 'Attendre encore 4 semaines avant de servir.'] },

  { id:'lq-liqueur-de-mure', nom:'Liqueur de Mûre', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:36, mac:42, macTxt:'6 semaines', lot:1.4,
    tags:['sucre', 'alcool', 'eau'],
    ing:[[1,'kg','mûres'],[300,'g','sucre semoule'],[1,'L','alcool à 40°'],[15,'cl','eau']],
    prep:["Faire mariner les mûres légèrement écrasées et l'alcool dans un bocal hermétique pendant 6 semaines.", 'Tamiser la préparation en la passant à travers un linge et presser les baies.', "Dans une casserole, porter l'eau à ébullition avec le sucre, et mélanger le sirop à l'alcool.", 'Mettre en bouteilles et à consommer après 4 mois.', 'Le goût du fruit est parfaitement conservé, se bois bien frais avec un glaçon ou après avoir mis la bouteille et les verres au congélateur.'] },

  { id:'lq-liqueur-de-myrte', nom:'Liqueur de Myrte', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'epice', degre:36, mac:21, macTxt:'3 semaines', lot:1.3,
    tags:['plante', 'eau-de-vie', 'cannelle', 'vanille', 'sucre', 'eau'],
    ing:[[100,'g','plante entière de myrte'],[1,'L','eau-de-vie 40°'],[1,'pincée','cannelle',false],[1,'pincée','vanille en poudre',false],[400,'g','Sucre'],[1,'verre','eau']],
    prep:["Faire macérer la plante, la cannelle et la vanille dans l'alcool pendant 3 semaines à 1 mois.", "Filtrer, ajouter le sucre mouillé avec le verre d'eau.", 'Mélanger et mettre en bouteilles.', 'Laisser vieillir au frais et à l’ombre.'] },

  { id:'lq-liqueur-de-myrtille', nom:'Liqueur de Myrtille', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:38, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['myrtilles', 'eau-de-vie', 'bâtonnet', 'sucre', 'eau'],
    ing:[[1,'kg','myrtilles'],[2,'L','eau-de-vie à 40°'],[1,'pièce','bâtonnet de cannelle'],[600,'g','sucre'],[15,'cl','eau']],
    prep:['Laver les myrtilles et les égoutter.', "Les faire macérer avec la cannelle dans l'eau-de-vie pendant 2 mois.", 'Passé ce temps faire un sirop de sucre.', "Filtrer l'alcool et mélanger avec le sirop laisser reposer quelques jours.", 'Re-filtrer finement et verser dans des bouteilles et bien boucher.'] },

  { id:'lq-liqueur-de-nefles', nom:'Liqueur de Nèfles', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:36, mac:30, macTxt:'1 mois', lot:1.3,
    tags:['noyaux', 'alcool', 'sucre', 'eau'],
    ing:[[2,'verre','noyaux de nèfles'],[1,'L','alcool pour fruits à 40°'],[300,'g','sucre en poudre'],[1,'verre','eau']],
    prep:["Mettre dans un bocal les noyaux de nèfles avec l'alcool.", 'Laisser macérer 1 mois.', "Préparer un sirop de sucre et mélanger à l'alcool.", 'Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-noisette-au-whisky', nom:'Liqueur de Noisette au Whisky', cat:'liqueurs', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:23, mac:30, macTxt:'un mois', lot:1.0,
    tags:['noisettes', 'whisky', 'eau', 'vanille', 'cuillerée', 'sucre'],
    ing:[[50,'pièces','noisettes vertes du mois de juillet'],[40,'cl','Whisky'],[30,'cl','eau bien pure'],[1,'gousse','vanille'],[1,'pièce','cuillerée de miel d’acacia'],[350,'g','sucre']],
    prep:["Martelez les noisettes pour les briser mais ne perdez pas le jus, mettre le tout dans un bocal avec l'eau et le whisky.", 'Fermez hermétiquement.', 'Laissez macérer 2 longs mois, voir plus.', 'Filtrer à travers une passoire et remettez le liquide dans un bocal avec le miel, la gousse de vanille et le sucre en sirop.', 'Laissez reposer encore un mois.', 'Retirer la gousse de vanille et laisser décanter.', 'Mettre en bouteilles.'] },

  { id:'lq-liqueur-de-noix', nom:'Liqueur de Noix', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:38, mac:42, macTxt:'6 semaines', lot:2.4,
    tags:['noix', 'zeste', 'girofle', 'eau-de-vie', 'sucre', 'cannelle', 'eau', 'vanille', 'bonne'],
    ing:[[50,'pièces','noix vertes cueillies à la St Jean'],[null,'','le zeste de 2 citrons'],[6,'clous','girofle'],[2,'L','eau-de-vie à 40°'],[600,'g','sucre candi'],[2,'bâton','cannelle'],[15,'cl','eau'],[1,'gousse','vanille'],[1,'pièce','bonne c. à c. de Macis (enveloppe de la noix muscade)']],
    prep:['Dans un bocal mettre les noix coupées en 4.', "Ajouter les autres ingrédients et les épices, sauf l'eau.", 'Fermer le bocal et laisser reposer 40 jours en agitant de temps en temps.', "Filtrer la préparation, ajouter l'eau bouillie et sucrée bien refroidie, laisser reposer quelques jours en remuant quelques fois, puis filtrer finement et mettre en bouteilles.", 'Attendre 6 semaines avant de déguster, voir plus.'] },

  { id:'lq-liqueur-de-noyaux-d-abricots', nom:"Liqueur de Noyaux d'Abricots", cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:38, mac:56, macTxt:'8 semaines', lot:2.3,
    tags:['noyaux', 'eau-de-vie', 'sucre', 'girofle', 'cannelle', 'eau'],
    ing:[[200,'g',"noyaux d'abricots"],[2,'L','eau-de-vie 40°'],[500,'g','sucre en poudre'],[5,'clous','girofle'],[1,'bâton','cannelle'],[1,'verre','eau']],
    prep:['Casser les noyaux afin de prélever les amandes.', 'Ebouillanter ces amandes, retirer la peau et hacher les.', 'Broyer les coques.', "Mettre amandes et coques dans un bocal avec l'eau-de-vie.", 'Les clous de girofle et la cannelle.', 'Laisser macérer 8 semaines.', 'Au bout de ce temps, préparer un sirop de sucre.', 'Filtrer et mélanger longuement avec le sirop de sucre.', 'Mettre en bouteilles et laisser reposer 8 semaines avant consommation.'] },

  { id:'lq-liqueur-de-noyaux-d-abricots-aux-epices', nom:'Liqueur De Noyaux D’abricots Aux Epices', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:38, mac:60, macTxt:'2 mois', lot:2.3,
    tags:['noyaux', 'alcool', 'sucre', 'eau', 'cannelle', 'macis', 'girofle', 'dosettes', 'vanille'],
    ing:[[200,'g','noyaux d’abricots'],[2,'L','alcool à 40°'],[400,'g','sucre'],[1,'verre','eau'],[2,'bâton','cannelle'],[1,'c. à café','macis'],[2,'clous','girofle'],[2,'pièces','dosettes de safran'],[1,'gousse','vanille']],
    prep:['Piler au mortier toutes les épices, fendre la vanille et la couper en tronçons.', 'Fondre le sucre dans l’eau et laisser refroidir.', 'Casser tous les noyaux et conserver la coque et les amendes.', 'Dans une jarre mettre les épices, le sirop, l’alcool et les noyaux concassés.', 'Faire macérer dans une jarre hermétique pendant 2 mois.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-noyaux-de-peches', nom:'Liqueur De Noyaux De Pêches', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:36, mac:0, macTxt:'—', lot:2.3,
    tags:['noyaux', 'alcool', 'eau', 'sucre', 'vanille'],
    ing:[[100,'pièces','noyaux de pêches'],[2,'L','alcool à 40 °'],[1,'verre','eau'],[500,'g','sucre'],[1,'gousse','vanille']],
    prep:['Pendant tout l’été.'] },

  { id:'lq-liqueur-de-pissenlit', nom:'Liqueur de Pissenlit', cat:'liqueurs', themes:['fruits', 'fleurs'], gravure:'fruit', degre:36, mac:14, macTxt:'deux semaines', lot:1.3,
    tags:['fleurs', 'orange', 'sucre', 'eau'],
    ing:[[100,'g','fleurs'],[1,'L',"d'eau-de-vie"],[1,'zeste','orange amère'],[300,'g','sucre'],[1,'verre','eau']],
    prep:["Faire macérer dans l'eau de vie pendant deux semaines les fleurs et le zeste.", "Filtrer, ajouter le sucre mouillé avec l'eau et mettre en bouteilles pour conserver au frais."] },

  { id:'lq-liqueur-de-poire', nom:'Liqueur de Poire', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:36, mac:90, macTxt:'3 mois', lot:1.4,
    tags:['poire', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[1,'pièce','grosse poire William bien mûre'],[1,'L','eau-de-vie à 40°'],[300,'g','sucre'],[10,'cl','eau']],
    prep:["Mettre la poire et l'eau-de-vie ordinaire dans un bocal.", 'Placer le bocal pendant 1 mois le plus souvent possible au soleil.', 'Ajouter le sucre dissous dans l’eau et laisser reposer environ 3 mois.', 'Mettre en bouteille.'] },

  { id:'lq-liqueur-de-primeveres', nom:'Liqueur De Primevères', cat:'liqueurs', themes:['fleurs', 'epices'], gravure:'fleur', degre:36, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['fleurs', 'alcool', 'sucre', 'vanille', 'eau'],
    ing:[[100,'g','fleurs de primevères'],[100,'g','fleurs de violettes'],[100,'g','fleurs d’acacia'],[1,'L','alcool à 40°'],[500,'g','sucre'],[2,'gousses','vanille'],[1,'verre','eau']],
    prep:['Faire chauffer l’eau et dissoudre le sucre, plonger les différentes fleurs, la gousse de vanille fendue, donner quelques bouillons et laisser refroidir.', 'Mettre le sirop et les fleurs dans une jarre, ajouter l’alcool et laisser macérer à l’ombre 4 semaines.', 'Filtrer et mettre en bouteilles après décantation.'] },

  { id:'lq-liqueur-de-prunelles', nom:'Liqueur de Prunelles', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:90, macTxt:'3 mois', lot:2.8,
    tags:['alcool', 'sucre', 'vin', 'prunelles', 'cannelle'],
    ing:[[2,'L','alcool à 40°'],[400,'g','sucre'],[0.5,'L','vin blanc sec à 13°'],[500,'g','prunelles'],[1,'bâton','cannelle']],
    prep:['Laver et essuyer les fruits ramassée après les premières gelées.', 'Écraser les dans une casserole sans les dénoyauter puis faites les bouillir dans le pendant 15 mn.', 'Laisser reposer avec la cannelle pendant 3 jours la purée dans un bocal hermétiquement fermé.', 'Filtrer le tout avec une passoire.', 'Verser le jus avec le sucre dans une casserole et faites bouillir à petit feu pendant 5 mn en remuant.', "Laisser refroidir puis ajouter l'alcool.", 'Remettre la préparation dans un bocal hermétiquement fermé et laisser reposer 1 semaine.', 'Filtrer avec un filtre en papier et mettre en bouteilles.', 'Laisser reposer dans un endroit frais et sombre pendant 3 mois.'] },

  { id:'lq-liqueur-de-prunes', nom:'Liqueur de Prunes', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:90, macTxt:'3 mois', lot:2.8,
    tags:['prunes', 'sucre', 'alcool', 'vin', 'cannelle'],
    ing:[[500,'g','prunes'],[400,'g','sucre'],[2,'L','alcool à 40°'],[0.5,'L','vin blanc sec à 13°'],[1,'bâton','cannelle']],
    prep:['Laver et essuyer les fruits.', 'Ecraser les fruits sans les dénoyauter.', 'Mettre les fruits dans une casserole, ajouter le vin et faire bouillir à tout petit bouillon pendant 15 min.', 'Mettre cette marmelade dans un bocal hermétique avec le bâton de cannelle.', 'Laisser reposer cette marmelade pendant 3 jours dans un endroit sombre.', 'Au bout de 3 jours, filtrer la marmelade avec une passoire pour récupérer le jus.', 'Faire réduire à petit feu le jus récupéré avec le sucre dans une casserole pendant 5 minutes.', 'Bien mélanger pendant la réduction.', 'Laisser refroidir, remettre ce jus dans un bocal hermétique et ajouter l’alcool.', 'Laisser reposer 1 semaine dans un endroit sombre.', 'Au bout d’une semaine, embouteiller le mélange en filtrant.', 'Laisser reposer 3 mois dans un endroit sombre avant de servir.'] },

  { id:'lq-liqueur-de-raisin', nom:'Liqueur de Raisin', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:36, mac:30, macTxt:'un mois', lot:2.3,
    tags:['alcool', 'sucre.', 'cannelle', 'girofle', 'eau'],
    ing:[[2,'L','alcool à 40°'],[400,'g','sucre. 1 Kg de raisin blancs bien sucré'],[1,'bâton','cannelle'],[5,'clous','girofle'],[1,'verre','eau']],
    prep:["Laver, sécher les raisins, puis les écraser et les mettre sur petit feu jusqu'à ébullition.", "Conserver l'ébullition à feu doux pendant 10 min.", 'Laisser refroidir et passer au tamis.', "Rajouter l'alcool, le sucre, les clous de girofle et le bâton de cannelle, mélanger.", 'Laisser macérer un mois.', 'Filtrer et mettre en bouteilles.', 'Se consomme bien frais.'] },

  { id:'lq-liqueur-de-reglisse', nom:'Liqueur De Réglisse', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'racine', degre:36, mac:60, macTxt:'2 mois', lot:1.3,
    tags:['bouquet', 'bâtons', 'alcool', 'sucre', 'eau', 'vanille'],
    ing:[[1,'pièce','petit bouquet de menthe fraîche'],[200,'g','bâtons de réglisse'],[1,'L','alcool à 40°'],[300,'g','sucre'],[1,'verre','eau'],[1,'gousse','vanille']],
    prep:['Couper en tronçons la réglisse et la mettre à macérer dans l’alcool avec la menthe.', 'Ajouter la vanille fendue et le sucre dissous dans le verre d’eau.', 'Mettre la jarre dans un passage et la remuer régulièrement.', 'Au de 2 mois, filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-rhubarbe', nom:'Liqueur de Rhubarbe', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:28, macTxt:'4 semaines', lot:2.4,
    tags:['alcool', 'sucre', 'tiges', 'cardamome', 'eau'],
    ing:[[2,'L','alcool à 40°'],[600,'g','sucre'],[1,'kg','tiges de rhubarbe'],[8,'gousses','cardamome'],[15,'cl','eau']],
    prep:['Laver les tiges de rhubarbe et les détailler en tronçons.', 'Mettre dans une jarre la rhubarbe, les gousses de cardamome écrasées recouvrir avec l’alcool.', 'Fermer hermétiquement le bocal et le laisser exposé au soleil 4 semaines.', 'Faire un sirop avec l’eau et le sucre puis l’incorporer froid à la macération.', 'Prolonger 2 semaines de plus au soleil, filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-rhum-au-cafe', nom:'Liqueur de Rhum au Café', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:50, mac:120, macTxt:'4 mois', lot:1.3,
    tags:['rhum', 'vanille', 'café', 'sucre'],
    ing:[[1,'L','rhum agricole blanc à 55°'],[2,'gousses','vanille'],[15,'grains','café'],[75,'g','sucre de canne']],
    prep:['Verser le rhum dans un grande bouteille ou une bonbonnière en verre.', 'Fendre les gousses de vanilles dans le sens de la longueur.', 'Ajouter les gousses de vanilles, le sucre de canne, les grains de café et bien mélanger le tout.', 'Conserver 4 mois à l’abri de la lumière et prenant soin de remuer le mélange toutes les semaines.', 'Filtrer avant de mettre en bouteille.'] },

  { id:'lq-liqueur-de-romarin', nom:'Liqueur de Romarin', cat:'liqueurs', themes:['fleurs', 'plantes'], gravure:'fleur', degre:38, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['eau-de-vie', 'eau', 'sucre', 'poignées'],
    ing:[[2,'L','eau de vie à 40°'],[15,'cl','eau'],[600,'g','sucre'],[2,'pièces','grosses poignées de fleurs de romarin']],
    prep:['Faire un sirop et le laisser refroidir.', 'Mélanger les fleurs, le sirop et l’alcool.', 'Faire macérer 2 mois à l’ombre.', 'Passé ce délai filtrer la préparation, laisser décanter quelques jours, filtrer à nouveau et mettre en bouteilles.', 'Laisser vieillir avant de consommer.'] },

  { id:'lq-liqueur-de-roses', nom:'Liqueur de Roses', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:20, mac:42, macTxt:'6 semaines', lot:2.6,
    tags:['pétales', 'sucre', 'eau-de-vie', 'eau'],
    ing:[[75,'g','pétales de roses (débarrassées de leur talon blanc)'],[350,'g','sucre'],[25,'cl','eau de vie à 40°'],[25,'cl','eau']],
    prep:['Dans un bocal, poser les pétales de roses en alternant avec le sucre.', 'Couvrir le bocal et laisser macérer une nuit.', "Verser l'eau sur la préparation pour faire dissoudre le sucre.", 'Agiter le bocal, laisser reposer une journée puis filtrer le jus.', "Mélanger celui-ci avec l'alcool.", 'Verser la liqueur parfumée dans le bocal qui a servi à la macération.', 'Fermer et laisser reposer 6 semaines avant de filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-sauge', nom:'Liqueur de Sauge', cat:'liqueurs', themes:['fruits', 'epices', 'plantes'], gravure:'fruit', degre:35, mac:30, macTxt:'un mois', lot:1.4,
    tags:['alcool', 'eau', 'sucre', 'sauge', 'citrons', 'girofle'],
    ing:[[1,'L','alcool à 40°'],[15,'cl','eau'],[500,'g','sucre'],[100,'feuilles','sauge'],[3,'pièces','citrons'],[3,'clous','girofle']],
    prep:['Mettre la sauge avec les 3 clous de girofle et les zestes des citrons dans un bocal.', "Ajouter l'alcool.", 'Laisser macérer pendant un mois en remuant de temps en temps.', "Préparer un sirop de sucre à froid, mélanger avec l'alcool.", 'Laisser reposer une semaine.', 'Filtrer et mettre en bouteilles.', 'Conserver au frais.'] },

  { id:'lq-liqueur-de-sommeil-xvie-siecle', nom:'Liqueur de sommeil (XVIe siècle)', cat:'liqueurs', themes:['fleurs', 'epices', 'plantes', 'historiques'], gravure:'fleur', degre:35, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['chaque', 'valériane', 'aubépine', 'passiflore', 'mélisse', 'bonne', 'miel', 'vanille', 'cannelle', 'safran'],
    ing:[[50,'g','chaque'],[null,'','valériane'],[null,'','aubépine'],[null,'','passiflore'],[null,'','mélisse'],[1,'L','bonne eau de vie'],[300,'g','miel'],[1,'gousse','vanille'],[1,'bâton','cannelle'],[1,'g','safran']],
    prep:['Dans une jarre mettre les plantes broyées au mortier à macérer dans l’alcool dans lequel aura dissous le miel.', 'Laisser agir à l’ombre durant 3 mois puis passer au clair plusieurs fois au besoin.', 'Mettre en bouteilles et laisser vieillir quelques mois.', 'Quelques gouttes versées dans une tisane de tilleul ou verveine vous assurera une nuit calme et paisible.'] },

  { id:'lq-liqueur-de-baies-de-sureau', nom:'Liqueur de Baies de Sureau', cat:'liqueurs', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:30, mac:60, macTxt:'2 mois', lot:1.4,
    tags:['baies', 'alcool', 'eau', 'sucre', 'vanille'],
    ing:[[1.5,'kg','baies bien mûres de sureau'],[1,'L','alcool à 40°'],[15,'cl','eau'],[300,'g','sucre'],[1,'gousse','vanille']],
    prep:['Mettre dans une casserole les baies de sureau mûres et bien noires après les avoir rincées, le sucre la vanille fendue et l’eau.', 'Cuire à petit bouillon pendant 15 minutes pour faire éclater les fruits.', 'Puis laisser complètement refroidir.', 'Dans une jarre mélanger la préparation de sureau avec l’alcool et laisser reposer à l’ombre au moins 2 mois.', 'Ecraser au chinois la macération puis filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-the', nom:'Liqueur de Thé', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:21, macTxt:'3 semaines', lot:1.3,
    tags:['thé', 'eau-de-vie', 'sucre', 'eau', 'cannelle'],
    ing:[[70,'g','thé noir de bonne qualité'],[1,'L','eau de vie à 40°'],[400,'g','sucre'],[1,'verre','eau bouillante'],[1,'bâton','cannelle']],
    prep:["Mettez le thé dans une théière, versez dessus l'eau bouillante, remuez, couvrez et laissez infuser 3 minutes.", "Après cela, filtrez le thé, faites le macérer avec le sucre, puis après refroidissement l'eau de vie et la cannelle.", 'Verser la macération dans un bocal pendant 3 semaines.', 'Filtrer soigneusement pour mettre en bouteilles.', 'Plus elle vieillira (5-6 mois au moins), meilleure elle sera.'] },

  { id:'lq-liqueur-de-the-aux-epices', nom:'Liqueur de Thé aux Epices', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:25, mac:28, macTxt:'4 semaines', lot:3.3,
    tags:['alcool', 'eau', 'sucre', 'thé', 'gingembre', 'girofle', 'cardamome', 'cannelle', 'vanille'],
    ing:[[2,'L','alcool à 40°'],[1,'L','eau'],[600,'g','sucre'],[30,'g','thé noir'],[50,'g','gingembre confit'],[5,'clous','girofle'],[10,'graines','cardamome'],[1,'bâton','cannelle'],[1,'gousse','vanille']],
    prep:['Infuser le thé dans de l’eau chaude, ajouter le sucre et laisser refroidir.', 'Mettre alors cette infusion avec les feuilles dans une jarre et ajouter tous les autres ingrédients et la vanille fendue.', 'Laisser au repos 4 semaines, puis filtrer et mettre en bouteilles.', 'C’est une liqueur très douce et bien parfumée.'] },

  { id:'lq-liqueur-de-thym', nom:'Liqueur de Thym', cat:'liqueurs', themes:['fleurs', 'plantes'], gravure:'fleur', degre:35, mac:14, macTxt:'2 semaines', lot:1.3,
    tags:['thym', 'fleurs', 'eau-de-vie', 'miel'],
    ing:[[100,'g','thym frais'],[100,'g','fleurs ramassée l’été'],[1,'L','eau-de-vie à 40°'],[300,'g','miel']],
    prep:["Faire macérer le thym et les fleurs dans l'eau-de-vie pendant 2 semaines.", 'Filtrer et ajouter le miel.', 'Bien mélanger laisser reposer et mettre en bouteilles.', 'Faire vieillir au frais pendant 3 mois avant de déguster.'] },

  { id:'lq-liqueur-de-tilleul', nom:'Liqueur de Tilleul', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:35, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['eau-de-vie', 'bouquet', 'sucre', 'eau'],
    ing:[[2,'L','eau de vie à 40°'],[1,'gros','bouquet de fleurs tilleul fraîches'],[600,'g','sucre'],[15,'cl','eau']],
    prep:['Faire macérer le tilleul pendant 2 mois dans l’alcool.', 'Filtrer puis faire le sirop et le mélanger à la macération.', 'Laisser reposer quelques jours puis filtrer et mettre en bouteilles.', 'Cet alcool sera meilleur après l’avoir laissé vieillir quelques mois.'] },

  { id:'lq-liqueur-de-tournesol', nom:'Liqueur De Tournesol', cat:'liqueurs', themes:['fleurs', 'epices'], gravure:'fleur', degre:36, mac:60, macTxt:'2 mois', lot:1.3,
    tags:['pétales', 'tournesol', 'sucre', 'eau', 'alcool', 'vanille'],
    ing:[[null,'','les pétales de'],[10,'fleurs','tournesol'],[300,'g','sucre'],[1,'verre','eau'],[1,'L','alcool à 40°'],[1,'gousse','vanille']],
    prep:['Effeuiller les pétales de tournesol au dessus de l’alcool.', 'Faire un sirop avec l’eau et le sucre.', 'Dans une jarre ajouter le sirop, l’alcool avec les pétales et la gousse de vanille fendue.', 'Laisser dans un coin sombre au moins 2 mois.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-vanille-au-rhum-blanc', nom:'Liqueur de Vanille au Rhum Blanc', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:37, mac:8, macTxt:'8 jours', lot:1.8,
    tags:['vanille', 'rhum', 'sirop'],
    ing:[[5,'gousses','vanille'],[1,'L','rhum blanc à 55°'],[50,'cl','sirop de canne']],
    prep:['Fendre les gousses de vanille dans le sens de la longueur, puis les couper en petits morceaux, en prenant soin de ne pas perdre les petites graines noires qui renferment tout le parfum.', 'Mettez la vanille dans un bocal préalablement ébouillanté et séché, recouvrez de rhum.', 'Fermez et laissez macérer 8 jours, en agitant le bocal chaque jour.', 'Filtrez le rhum parfumé, mélangez-y le sirop de canne.', 'Mettez en flacon, bouchez hermétiquement.', 'Patientez encore 8 jours avant de consommer.', 'Idéal un soir d’été avec une glace à la vanille.'] },

  { id:'lq-liqueur-de-vanille', nom:'Liqueur de Vanille', cat:'liqueurs', themes:['epices'], gravure:'epice', degre:35, mac:20, macTxt:'20 jours', lot:2.4,
    tags:['alcool', 'vanille', 'eau', 'sucre'],
    ing:[[2,'L','alcool à 40°'],[6,'gousses','vanille'],[15,'cl','eau'],[600,'g','sucre']],
    prep:['Faire macérer dans l’alcool à 40°, 6 gousses de vanille que vous aurez fendues.', 'Il faut bien racler les graines et le mettre également dans l’alcool.', 'Laissez infuser la vanille coupée par le milieu et en long pendant 20 jours.', 'Dissoudre le sucre dans l’eau et ajoutez ce sirop froid à la préparation.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-verte-de-citronnelle', nom:'Liqueur Verte De Citronnelle', cat:'liqueurs', themes:['fruits', 'plantes'], gravure:'fruit', degre:36, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['citron', 'alcool', 'citronnelle', 'menthe', 'sucre', 'eau'],
    ing:[[1,'pièce','citron non traité'],[1,'L','alcool à 40°'],[200,'feuilles','citronnelle'],[100,'g','menthe'],[500,'g','sucre'],[1,'verre','eau']],
    prep:['Dissoudre le sucre dans le verre d’eau en portant à ébullition.', 'Mettre à infuser dans le sirop, les herbes, le zeste et le jus du citron.', 'Arrêter au premier bouillon et laisser refroidir.', 'Ajouter l’alcool et laisser macérer 4 semaines à l’ombre.', 'Filtrer et mettre en bouteille.'] },

  { id:'lq-liqueur-de-venus-xvii-siecle', nom:'Liqueur de Vénus (XVII siècle)', cat:'liqueurs', themes:['epices', 'historiques'], gravure:'epice', degre:35, mac:28, macTxt:'4 semaines', lot:1.4,
    tags:['alcool', 'sucre', 'semences', 'cumin', 'cannelle', 'macis', 'safran', 'eau'],
    ing:[[1,'L','alcool à 40°'],[400,'g','sucre'],[25,'g','semences de carottes'],[15,'g','cumin en graines'],[10,'g','cannelle'],[3,'g','macis'],[1,'g','safran'],[15,'cl','eau']],
    prep:['Faire macérer les ingrédients pendant 4 semaines.', 'Filtrer.', 'Préparer le sirop de sucre avec les 400 g et ajouter-le à la préparation.', 'Filtrer et mettre en bouteille.', 'Ne pas consommer avant 3 mois.'] },

  { id:'lq-liqueur-de-verveine', nom:'Liqueur de Verveine', cat:'liqueurs', themes:['plantes'], gravure:'plante', degre:36, mac:56, macTxt:'8 semaines', lot:2.4,
    tags:['feuilles', 'sucre', 'eau-de-vie', 'eau'],
    ing:[[100,'g','feuilles de verveine fraîche'],[400,'g','sucre'],[2,'L','eau-de-vie à 40°'],[15,'cl','eau']],
    prep:['Lavez les feuilles et séchez-les dans un torchon.', "Les mettre dans un bocal et les recouvrir avec l'eau-de-vie.", 'Fermez hermétiquement et laissez macérer pendant 8 semaines.', 'Au bout de ce temps, passez puis reversez-le dans le bocal.', 'Laissez reposer pendant quelques heures.', 'Faire dissoudre le sucre dans l’eau puis laisser refroidir le sirop.', 'Ajoutez le sirop et mélanger.', "Laissez reposer, en remuant de temps en temps, jusqu'à ce que le sucre soit complètement dissous.", 'Filtrez finement et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-vespetro-xviii-siecle', nom:'Liqueur de Vespétro (XVIII siècle)', cat:'liqueurs', themes:['fruits', 'epices', 'plantes', 'historiques'], gravure:'fruit', degre:36, mac:60, macTxt:'deux mois', lot:4.8,
    tags:['graines', 'zestes', 'sucre', 'eau-de-vie', 'eau'],
    ing:[[15,'g','graines d’angélique'],[60,'g','graines de coriandre'],[2,'pincées','graines de fenouil et autant de graines d’anis',false],[null,'','zestes et jus de 2 citrons (sans les pépins)'],[1,'kg','sucre'],[4,'L','eau de vie à 40°'],[50,'cl','eau']],
    prep:['Mettre tous les ingrédients dans une gaze, faire fondre le sucre dans très peu d’eau.', 'Mélanger le sirop et l’alcool, laisser infuser les aromates deux mois dans la bonbonne, filtrer finement décanter et mettre en bouteilles.'] },

  { id:'lq-liqueur-de-vieux-garcon', nom:'Liqueur de Vieux Garçon', cat:'liqueurs', themes:['fruits', 'fleurs'], gravure:'fruit', degre:35, mac:30, macTxt:'1 mois', lot:2.6,
    tags:['assortiment', 'abricots', 'fraises', 'framboises', 'groseilles', 'cerises', 'pêches', 'melons', 'prunes', 'etc'],
    ing:[[1,'pièce','assortiment de fruits au fur et à mesure de leur maturité'],[null,'','abricots'],[null,'','fraises'],[null,'','framboises'],[null,'','groseilles'],[null,'','cerises'],[null,'','pêches'],[null,'','melons'],[null,'','prunes'],[null,'','etc'],[400,'g','sucre en poudre par kg de fruits'],[50,'cl','eau de vie par kg de fruits']],
    prep:['Mettre les fruits dans un grand pot en grès ou une jarre dans lequel laisser macérer le mélange.', 'Ce récipient devra pouvoir contenir plusieurs kilos de fruits.', 'Fermer le pot après chaque ajout de fruit, veiller à ce que l’alcool recouvre bien tout pour ne pas moisir.', 'Après l’ajout des derniers fruits laisser macérer 1 mois.', 'Passer finement le mélange et presser les fruits.', 'Mettre en bouteilles et laisser reposer quelques semaines.'] },

  { id:'lq-liqueur-de-violettes', nom:'Liqueur de Violettes', cat:'liqueurs', themes:['fleurs'], gravure:'fleur', degre:36, mac:10, macTxt:'10 jours', lot:1.3,
    tags:['violettes', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[200,'g','violettes odorantes fraîches'],[1,'L','eau-de-vie à 40°'],[375,'g','sucre'],[1,'verre','eau']],
    prep:["Faire un sirop avec l'eau et le sucre, le laisser refroidir.", "Enlever tiges et étamines des fleurs, il restera les pétales que l'on met à infuser dans L'alcool pendant 10 jours.", 'Filtrer et mélanger ce liquide parfumé au sirop.', 'Mettre en flacons et fermer.'] },

  { id:'lq-liqueur-de-zestes-d-agrumes', nom:"Liqueur de Zestes d'Agrumes", cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:60, macTxt:'60 jours', lot:1.4,
    tags:['eau-de-vie', 'zestes', 'zeste', 'sucre', 'eau'],
    ing:[[1,'L','eau-de-vie à 40°'],[null,'','les zestes de 2 oranges'],[null,'','les zestes de 2 clémentines'],[null,'',"le zeste d'1 citron"],[null,'',"le zeste d'1/2 pamplemousse"],[300,'g','sucre'],[15,'cl','eau']],
    prep:['Acheter des fruits non traités, les laver, les essuyer, les zester avec un couteau économe pour ne garder que la partie colorée.', "Mettre ces zestes à macérer dans l'eau-de-vie pendant 60 jours.", 'Faire un sirop de sucre et laisser tiédir.', 'Joindre au sirop la préparation passée et filtrée.', 'Mettre en bouteilles.', 'Attendre 2 mois avant de servir.'] },

  { id:'lq-liqueur-d-eau-de-fleur-d-oranger', nom:'Liqueur d’Eau de Fleur d’Oranger', cat:'liqueurs', themes:['fruits', 'fleurs'], gravure:'fruit', degre:35, mac:30, macTxt:'un mois', lot:1.4,
    tags:['eau-de-vie', 'litre', 'sucre'],
    ing:[[1,'L','eau-de-vie à 40°'],[15,'cl','litre d’eau de fleur d’oranger'],[300,'g','sucre']],
    prep:['Dissoudre le sucre dans l’eau de fleur d’oranger, puis y ajouter l’eau-de-vie, mettre en bouteilles, boucher et laisser reposer un mois avant de servir.', 'Cette liqueur très simple s’améliore en vieillissant quelques mois.'] },

  { id:'lq-liqueur-d-estragon', nom:"Liqueur d'Estragon", cat:'liqueurs', themes:['epices', 'plantes'], gravure:'epice', degre:35, mac:30, macTxt:'1 mois', lot:1.4,
    tags:['estragon', 'eau-de-vie', 'sucre', 'vanillé', 'eau'],
    ing:[[30,'pièces','à'],[40,'g','estragon en branches (cueilli en juin-juillet de préférence)'],[1,'L','eau de vie à 40°'],[500,'g','sucre'],[1,'gousse','vanillé fendue'],[15,'cl','eau']],
    prep:["Lavez les branches d'estragon et séchez-les parfaitement.", "Mettez-les dans un bocal avec l'eau de vie.", 'Bouchez hermétiquement.', "Laissez macérer 4 jours, retirez l'estragon et ajoutez le sirop de sucre.", "Faire macérer encore 1 mois, jusqu'à ce que le sucre soit fondu.", 'Filtrer finement laisser décanter et mettre en flacon.', 'Cette liqueur est prête à la dégustation.'] },

  { id:'lq-liqueur-d-eucalyptus', nom:'Liqueur d’Eucalyptus', cat:'liqueurs', themes:['epices', 'plantes'], gravure:'epice', degre:35, mac:30, macTxt:'1 mois', lot:2.4,
    tags:['alcool', 'eau', 'sucre', 'eucalyptus', 'cannelle'],
    ing:[[2,'L','alcool à 40°'],[15,'cl','eau'],[600,'g','sucre'],[100,'feuilles','eucalyptus'],[2,'bâton','cannelle']],
    prep:['Faire macérer pendant 1 mois dans l’alcool, les feuilles d’eucalyptus et la cannelle.', 'Remuer quelques fois la préparation, puis faire un sirop avec l’eau et le sucre, et l’ajouter dans la macération.', 'Laisser reposer 2 semaines, filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-d-hysope', nom:'Liqueur d’Hysope', cat:'liqueurs', themes:['fleurs', 'plantes'], gravure:'fleur', degre:35, mac:60, macTxt:'2 mois', lot:2.4,
    tags:['alcool', 'sucre', 'eau', 'poignée'],
    ing:[[2,'L','alcool à 40°'],[600,'g','sucre'],[15,'cl','eau'],[1,'pièce','très grosse poignée de sommités d’hysopes fleuries et fraîchement cueillies']],
    prep:['Faire un sirop avec l’eau et le sucre, mélanger l’alcool et l’hysope, ajouter le sirop froid et laisser macérer à l’ombre pendant au moins 2 mois.', 'Filtrer et laisser reposer quelques jours.', 'Filtrer de nouveau laisser décanter et mettre en bouteilles.', 'Faire vieillir quelques mois avant de consommer.'] },

  { id:'lq-liqueur-d-or', nom:'Liqueur d’Or', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:30, macTxt:'30 jours', lot:1.3,
    tags:['eau-de-vie', 'cannelle', 'grain', 'noix', 'macis', 'girofle', 'cardamome', 'citron', 'orange', 'poivre'],
    ing:[[1,'L','eau-de-vie à 40°'],[2,'bâton','cannelle'],[5,'g','grain coriandre'],[1,'g','noix muscade râpée'],[1,'g','macis'],[6,'clous','girofle'],[2,'graines','cardamome'],[2,'zeste','citron non traité'],[1,'zeste','orange non traité'],[2,'grains','poivre noir'],[300,'g','sucre'],[1,'verre','eau'],[1,'feuille','or']],
    prep:['Dans une jarre, mettre les épices concassés recouvrir avec l’eau-de-vie, fermer hermétiquement et laisser macérer 30 jours en remuant souvent.', 'Faire un sirop avec le sucre et le verre d’eau, l’ajouter froid à la macération.', 'Remuer, laisser reposer 24 heures.', 'Passer, décanter et filtrer, mettre en bouteille en verre blanc et froisser dedans la feuille d’or, pour la réduire en fragments.', 'Boucher et laisser reposer 30 jours.', 'Avant de servir, remuer le flacon, pour que les fragments d’or volent et scintillent, et que chacun puisse avoir de l’or dans son verre.'] },

  { id:'lq-liqueur-d-orange-ou-cointreau-maison', nom:'Liqueur d’Orange ou « Cointreau Maison»', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:90, macTxt:'3 mois', lot:2.4,
    tags:['belles', 'alcool', 'sucre', 'eau'],
    ing:[[2,'pièces','belles oranges non traitées'],[2,'L','alcool blanc à 40°'],[500,'g','sucre'],[15,'cl','eau']],
    prep:["Verser l'alcool dans un bocal.", "Passer une ficelle autour de l'orange pour faire une sorte de filet qui permettra de la suspendre.", 'Il suffit de faire une croix comme pour emballer un paquet.', "Suspendre l'orange de telle sorte qu'elle soit au dessus de l'alcool à 1 cm max et sans le toucher, puis nouer la ficelle autour du bocal.", "Piquer l’orange de quelques coups de pointe de couteau et faire un sirop avec le sucre et l'eau.", 'Porter à ébullition en tournant le mélange avec une cuillère de bois.', "Mélanger le sirop froid à l'alcool, et refermer hermétiquement le bocal.", "Oublier le bocal à l’ombre au moins 3 mois puis filtrer le tout et mettre l'alcool en bouteille."] },

  { id:'lq-liqueur-d-orange-au-sirop-d-erable', nom:'Liqueur d’Orange au Sirop d’Erable', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:32, mac:60, macTxt:'2 mois', lot:1.3,
    tags:['oranges', 'tasse', 'alcool', 'cannelle', 'girofle'],
    ing:[[6,'pièces','oranges'],[1,'pièce',"tasse (250 ml) de sirop d'érable"],[1,'L','alcool de fruits à 40°'],[1,'bâton','cannelle'],[2,'clous','girofle']],
    prep:['Prélever les zestes des oranges, en évitant au maximum de prélever le blanc, puis presser les oranges.', "Verser leur jus dans une carafe munie d'un bouchon et ajouter les zestes le sirop d'érable, la cannelle, les clous de girofle.", 'Laisser macérer 2 mois au frais.', 'Filtrer la liqueur et mettre en bouteille.', 'Conserver au réfrigérateur.'] },

  { id:'lq-liqueur-du-pendu-a-l-orange', nom:'Liqueur du Pendu à l’orange', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:40, mac:90, macTxt:'3 mois', lot:1.3,
    tags:['armagnac', 'orange', 'girofle', 'sucre'],
    ing:[[1,'L','armagnac'],[1,'pièce','orange non traitée'],[20,'clous','girofle'],[250,'g','sucre']],
    prep:['Piquer l’orange de clous de girofle sans trop les serrer, toute l’orange doit en être couverte.', 'L’envelopper dans une gaze pour faire comme un sac.', 'Verser l’alcool et le sucre en poudre dans un bocal suffisamment large pour laisser passer l’orange.', 'Suspendre l’orange à 1 cm au dessus de l’alcool, fermer hermétiquement, puis oublier le mélange au fond d’un placard au moins 3 mois.', 'Enlever l’orange puis Filtrer et mettre en bouteilles.'] },

  { id:'lq-liqueur-du-pendu-a-la-poire', nom:'Liqueur du Pendu à la Poire', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:70, macTxt:'10 semaines', lot:1.3,
    tags:['poire', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[1,'pièce','grosse poire bien mûre'],[1,'L','eau-de-vie à 40°'],[400,'g','sucre'],[1,'verre','eau']],
    prep:["Mettre le sucre, l'eau-de-vie dans un grand bocal et suspendre la poire au couvercle par un fil sans la plonger dans le liquide.", 'Dissoudre le sucre dans un verre d’eau et le mélanger refroidi dans l’alcool.', 'Attendre 10 semaines que la poire se ratatine pour filtrer et mettre en bouteilles.', 'Se bonifie grandement avec le temps.'] },

  { id:'lq-liqueur-noisetine', nom:'Liqueur Noisetine', cat:'liqueurs', themes:['fruits'], gravure:'fruit', degre:35, mac:60, macTxt:'deux mois', lot:1.4,
    tags:['noisette', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[500,'g','noisette'],[1,'L','eau de vie à 40°'],[300,'g','sucre'],[15,'cl','eau']],
    prep:['Casser les noisettes et écraser le fruit avec sa coque.', 'Mettre le tout dans un bocal fermant hermétiquement.', "Verser l'eau de vie.", 'Fermer et laisser macérer au moins deux mois.', "Filtrer l'infusion.", "Faire fondre le sucre dans l'eau et laisser refroidir et ajouter à l'infusion.", 'Mettre dans une jolie bouteille blanche.', 'Alcool idéal pour parfumer les crèmes et les gâteaux, son goût est très délicat.'] },

  { id:'lq-liqueur-persicot', nom:'Liqueur Persicot', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:35, mac:7, macTxt:'une semaine', lot:2.4,
    tags:['noyaux', 'cannelle', 'girofle', 'noix', 'safran', 'eau', 'alcool', 'sucre'],
    ing:[[80,'g',"noyaux d'abricot"],[10,'g','cannelle'],[2,'clous','girofle'],[2,'g','noix muscade'],[1,'g','safran'],[15,'cl','eau'],[2,'L','alcool à 40°'],[400,'g','sucre']],
    prep:['Briser les noyaux pour récupérer les amandes.', "Faire macérer les aromates avec les amandes dans l'alcool pendant une semaine.", 'Réaliser un sirop de sucre.', "Filtrer l'alcool et mélanger avec le sirop.", 'Mettre en bouteilles et laisser vieillir avant dégustation.'] },

  { id:'lq-liqueur-prunelline', nom:'Liqueur Prunelline', cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:37, mac:90, macTxt:'3 mois', lot:1.9,
    tags:['prunelles', 'eau-de-vie', 'amandes', 'sucre', 'girofle', 'coriandre', 'eau'],
    ing:[[750,'g','prunelles'],[1.5,'L','eau de vie à 40°'],[3,'c. à s.','amandes mondées'],[300,'g','sucre de canne'],[5,'clous','girofle'],[10,'grains','coriandre'],[15,'cl','eau']],
    prep:["lavez les prunelles, égouttez-les, retirer les queues et piquez les fruits à l'aide d'un ustensile que vous fabriquerez avec six épingles.", "Mettez les prunelles dans un grand bocal ; ajoutez le sucre, dissous, les amandes et l'alcool.", 'Fermez hermétiquement et agitez vigoureusement.', "Laissez macérer pendant 3 mois dans un endroit frais et à l'abri de la lumière ; remuez le bocal toutes les semaines.", 'Filtrez alors finement la liqueur laisser décanter et mettre en bouteilles.'] },

  { id:'lq-pippermint-maison', nom:'Pippermint Maison', cat:'liqueurs', themes:['plantes'], gravure:'plante', degre:18, mac:0, macTxt:'—', lot:3.3,
    tags:['sirop', 'alcool'],
    ing:[[1,'L','sirop de menthe verte 1 L de sirop de menthe glaciale'],[2,'L',"alcool a 40° 50 cl d'eau"]],
    prep:['Mélanger, menthe verte + menthe glaciale l’alcool à 40° et l’eau.', 'Mettre en bouteille.', 'Peut se consommer immédiatement et très frais.'] },

  { id:'lq-shrubb-a-la-clementine-et-a-l-orange', nom:"Shrubb à la Clémentine et à l'Orange", cat:'liqueurs', themes:['fruits', 'epices'], gravure:'fruit', degre:40, mac:30, macTxt:'1 mois', lot:1.3,
    tags:['oranges', 'clémentines', 'rhum', 'sirop', 'vanille', 'girofle', 'bâton'],
    ing:[[2,'pièces','oranges'],[3,'pièces','clémentines'],[75,'cl','rhum blanc agricole des Antilles à 55°'],[25,'cl','sirop de sucre de canne'],[1,'gousse','vanille'],[1,'clou','girofle'],[1,'pièce','petit bâton de cannelle']],
    prep:['Prélevez le zeste des oranges, pelez les clémentines puis ôtez la peau blanche amère Dans une jarre, introduisez les zestes des agrumes, ajoutez le rhum et la gousse de vanille fendue dans sa longueur complétez avec le sirop de sucre de canne ajoutez le clou de girofle et la cannelle.', 'Fermez et laissez macérer pendant 1 mois.', 'Filtrez la finement la préparation.'] },

  { id:'cr-creme-d-abricots', nom:'Crème d’Abricots', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:20, mac:30, macTxt:'30 jours', lot:4.3,
    tags:['abricots', 'alcool', 'cannelle', 'vin', 'sucre'],
    ing:[[2,'kg','abricots'],[1,'L','alcool à 40°'],[1,'bâton','cannelle'],[3,'L','vin blanc'],[800,'g','sucre']],
    prep:['Lavez les abricots bien mûrs, ôtez les noyaux.', "Faites les cuire peu d'eau, à feu doux pendant 5 minutes.", "Passez la pulpe à travers un tamis en l'écrasant avec une cuillère en bois.", "Mettez-la dans un bocal avec l'alcool et la cannelle.", 'Casser les noyaux et mettre également les amandes et le bois des noyaux.', 'Laissez macérer 30 jours.', 'Mettez dans une casserole le vin et le sucre.', "Faites tiédir à feu doux, en remuant sans arrêt, jusqu'à ce que le sucre soit fondu.", 'Laissez refroidir.', 'Ajoutez au vin sucré le contenu du bocal, laissez reposer 5 jours et filtrer finement.', 'Décanter et Mettre en bouteilles.'] },

  { id:'cr-creme-de-cacao', nom:'Crème de Cacao', cat:'cremes', themes:['epices'], gravure:'epice', degre:27, mac:28, macTxt:'4 semaine', lot:1.3,
    tags:['cacao', 'eau-de-vie', 'sucre', 'litre', 'vanille'],
    ing:[[150,'g','cacao amer non sucré de bonne qualité'],[1,'L','eau de vie à 40°'],[400,'g','sucre'],[null,'','½ litre de lait'],[1,'gousse','vanille']],
    prep:['dans un bocal hermétique, mélanger tous l’ingrédient avec la vanille fendue.', 'Laisser macérer pendant 4 semaine et remuant régulièrement pour ne pas que le cacao se fige.', 'Passé ce temps filtrer et mettre en bouteilles.'] },

  { id:'cr-creme-de-capucines', nom:'Crème De Capucines', cat:'cremes', themes:['fleurs'], gravure:'fleur', degre:25, mac:5, macTxt:'5 jours', lot:3.4,
    tags:['fleurs', 'feuilles', 'alcool', 'cidre', 'eau', 'miel', 'sucre'],
    ing:[[100,'g','fleurs de capucines et également'],[100,'g','feuilles'],[2,'L','alcool à 40°'],[1,'L','cidre doux'],[0.15,'L','eau'],[50,'g','miel'],[250,'g','sucre']],
    prep:['Rincer à l’eau courante les fleurs et les feuilles, puis les faire bouillir 10 mn à gros bouillon.', 'Laisser la décoction refroidir, puis passer le liquide dans une jarre et laisser reposer 5 jours au frais.', 'Filtrer finement le liquide et reporter à ébullition pour y faire dissoudre le miel, et le sucre.', 'Rajouter après refroidissement le cidre et l’alcool, bien remuer puis filtrer à nouveau, laisser refroidir et mettre en bouteilles.'] },

  { id:'cr-creme-de-cafe', nom:'Crème de café', cat:'cremes', themes:[], gravure:'plante', degre:27, mac:20, macTxt:'20 jours', lot:3.3,
    tags:['excellent', 'alcool', 'sucre', 'eau'],
    ing:[[350,'g','excellent café en poudre'],[2,'L','alcool à 40 °'],[650,'g','sucre en poudre'],[1,'L','eau']],
    prep:['Faire infuser dans l’alcool pendant 20 jours le café moulu.', 'Faire ensuite doucement réchauffer au bain marie pour obtenir une belle infusion de café.', 'Ajouter le sucre en poudre dissout dans 1 litre d’eau et laisser reposer 15 jours.', 'Passer la préparation au chinois et mettre en bouteilles.', 'Laisser vieillir quelques semaines avant de consommer.'] },

  { id:'cr-cremino-de-cafe', nom:'Crémino de café', cat:'cremes', themes:[], gravure:'plante', degre:27, mac:20, macTxt:'20 jours', lot:3.3,
    tags:['excellent', 'alcool', 'sucre', 'lait'],
    ing:[[350,'g','excellent café en poudre'],[2,'L','alcool à 40 °'],[650,'g','sucre en poudre'],[1,'L','lait entier']],
    prep:['Faire infuser dans l’alcool pendant 20 jours le café moulu.', 'Faire ensuite doucement réchauffer au bain marie pour obtenir une belle infusion de café.', 'Ajouter le sucre en poudre dans le litre de lait entier tiède et le laisser refroidir.', 'Laisser reposer 15 jours.', 'Passer la préparation au chinois et mettre en bouteilles.', 'Laisser vieillir quelques semaines avant de consommer.'] },

  { id:'cr-creme-de-cerises', nom:'Crème de Cerises', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:30, mac:60, macTxt:'2 mois', lot:1.4,
    tags:['cerise', 'eau-de-vie', 'vanille', 'eau', 'sucre'],
    ing:[[1,'kg','cerise bien noires et très mures'],[1,'L','eau-de-vie à 40°'],[1,'gousse','vanille'],[15,'cl','eau'],[600,'g','sucre']],
    prep:['Ecraser les fruits et les noyaux au mortier et les placer dans un bocal avec la vanille.', 'Recouvrir d’alcool.', 'Boucher le bocal et laisser macérer à température douce pendant 2 mois minimum.', 'Filtrer et ajouter le sirop.', 'Laisser reposer 8 à 10 jours filtrer à nouveau et mettre en bouteilles.'] },

  { id:'cr-creme-de-chataignes', nom:'Crème de Châtaignes', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:27, mac:35, macTxt:'5 semaines', lot:1.8,
    tags:['alcool', 'eau', 'sucre', 'une', 'châtaignes'],
    ing:[[1,'L','alcool à 40°'],[50,'cl','eau'],[400,'g','sucre'],[1,'pièce','une gousse de vanille'],[500,'g','châtaignes']],
    prep:['Une partie des châtaignes (environ 250 g) doivent être fraîches, épluchées en laissant la peau de couleur foncée et divisées en quatre.', 'L´autre portion de la quantité équivalente sera cuite et complètement épluchée avant d´être découpée en quatre.', 'La préparation se fait comme pour la recette de base en prenant soin de secouer le bocal de temps à autre.', 'Laisser reposer 5 semaines et passer au tamis.'] },

  { id:'cr-creme-de-fraises-des-bois', nom:'Crème de Fraises des Bois', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:19, mac:5, macTxt:'5 jours', lot:3.0,
    tags:['purée', 'bon', 'environ', 'sucre', 'alcool'],
    ing:[[1,'kg','purée de fruits congelée ou de fraises des bois'],[2,'bouteille','bon vin blanc'],[null,'','Environ'],[1,'kg','sucre'],[0.5,'L','alcool de fruits .à 40°']],
    prep:['Dans un grand faitout, mettre la purée de fruit et le vin, couvrir et laisser ainsi pendant 5 jours à température ambiante.', 'Ajouter le sucre et faire bouillir 3 min en remuant, le sucre doit être bien dissout.', "Il sera nécessaire d'écumer un peu.", 'Quand la crème est refroidie, ajouter l’alcool.', 'Filtrer à la passoire à cause de l’épaisseur du liquide et mettre en bouteilles.'] },

  { id:'cr-creme-de-framboises', nom:'Crème de Framboises', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:23, mac:28, macTxt:'4 semaines', lot:3.8,
    tags:['framboises', 'alcool', 'sucre', 'eau'],
    ing:[[2,'kg','framboises'],[2,'L','alcool à 40°'],[1.5,'kg','sucre'],[1.5,'L','eau']],
    prep:['Ecrasez et passez au tamis les framboises.', 'Mettez-les dans un récipient et laissez-les décanter une nuit au frais.', 'Ajoutez aux framboises les 2 litres d’alcool et le sirop de sucre préparé avec l’eau.', 'Mettre toute cette préparation dans une jarre bien bouchée, laisser reposer 4 semaines en remuant régulièrement, puis filtrez et mettez en bouteilles.', 'Attentez quelques semaines avant de consommer cette liqueur légère en alcool, qui vieillit admirablement.'] },

  { id:'cr-creme-de-menthe', nom:'Crème de Menthe', cat:'cremes', themes:['plantes'], gravure:'plante', degre:32, mac:42, macTxt:'6 semaines', lot:2.8,
    tags:['feuilles', 'eau-de-vie', 'eau', 'sucre'],
    ing:[[250,'g','feuilles de menthe'],[2,'L','eau-de-vie à 40°'],[50,'cl','eau'],[800,'g','sucre']],
    prep:["Immerger les feuilles de menthe lavées et séchées dans un bocal contenant l'eau-de-vie.", 'Fermer hermétiquement et laisser macérer 6 semaines.', "Porter à ébullition l'eau et le sucre, écumer et laisser refroidir.", "Mélanger le sirop et l'eau-de-vie de macération puis laisser reposer quelques jours.", 'Décanter, filtrer finement et mettre en bouteilles.'] },

  { id:'cr-creme-de-mures', nom:'Crème de Mûres', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:16, mac:5, macTxt:'5 jours', lot:1.3,
    tags:['bois', 'bon', 'sucre', 'litre', 'gousse'],
    ing:[[1,'kg','mûres des bois'],[1,'L','bon vin rouge'],[500,'g','sucre'],[null,'','¼ de litre d’alcool de fruit'],[null,'','½ gousse de vanille']],
    prep:["Mettre dans un grand saladier les mûre en les écrasant grossièrement, verser le vin rouge dessus, le verre d'alcool de fruit, la vanille, et couvrir avec un film.", 'Faire macérer durant 5 jours en remuant de temps en temps.', 'Ensuite filtrer la préparation et mettre dans une casserole avec le sucre, faire cuire en écumant et laisser bouillir 5 minutes, regardez si le sirop épaissit bien.', 'Laisser refroidir avant de mettre en bouteilles.'] },

  { id:'cr-creme-de-myrtilles', nom:'Crème de Myrtilles', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:20, mac:3, macTxt:'3 jours', lot:2.3,
    tags:['fruits', 'sucre', 'bon', 'alcool'],
    ing:[[600,'g','fruits'],[750,'g','sucre'],[1.5,'L','bon vin rouge'],[50,'cl','alcool à 40°']],
    prep:["Mettre les fruits dans une jatte en recouvrant d'un vin rouge assez épais.", 'Laissez macérer 3 jours en écrasant les fruits plusieurs fois.', 'Exprimer le jus et ajouter 750 g de sucre par litre de liquide ; faire bouillir 8 mn, refroidir et ajouter 1/2 du liquide en alcool.', 'On obtient 1,5 l de crème avec 600 gr de fruit ce qui est avantageux ; on doit attendre pour consommer bien sûr.'] },

  { id:'cr-creme-de-feuilles-de-pecher', nom:'Crème de feuilles de pêcher', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:27, mac:60, macTxt:'2 mois', lot:3.0,
    tags:['litre', 'sucre', 'pêcher'],
    ing:[[null,'','½ litre de bon vin rouge'],[null,'','½ litre d’alcool de fruit'],[300,'g','sucre'],[70,'feuilles','pêcher']],
    prep:['Dissoudre le sucre dans le vin, ajouter l’alcool et les feuilles.', 'Mettre le tout dans un bocal hermétique, qu’il faut exposer au soleil pendant 2 mois.', 'Puis filtrer et mettre en bouteilles et laisser reposer quelques semaines avant de consommer.'] },

  { id:'cr-creme-de-peches-de-vigne', nom:'Crème de Pêches de Vigne', cat:'cremes', themes:['fruits'], gravure:'fruit', degre:22, mac:2, macTxt:'2 à 3 jours', lot:3.3,
    tags:['pêches', 'bon', 'sucre', 'alcool'],
    ing:[[1,'kg','pêches de vigne'],[2,'L','bon blanc sec 13°'],[500,'g','sucre'],[1,'L','alcool à 40°']],
    prep:['Versez 1 kg de pêches des vignes dans un saladier en verre.', 'Utilisez des pêches bien mures, mais non abîmées.', 'Couvrez de vin blanc de bonne qualité et pas trop sec.', "Laissez reposer 2 à 3 jours, à l'abri de la poussière et des mouchettes, au frigo.", 'Passez le jus et pressez un peu pour en extraire tout le jus, mais pas trop.', 'Filtrez finement.', 'Faites cuire ce jus avec 250 gr de sucre blanc par litre.', 'Donnez juste un bouillon et laissez refroidir.', 'Ajouter l’alcool laissez reposer puis mettez dans des bouteilles bien claires.', "Passer finement et bouchez soigneusement, conservez dans l'obscurité."] },

  { id:'cr-creme-de-poires', nom:'Crème de Poires', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:19, mac:5, macTxt:'5 jours', lot:1.3,
    tags:['poires', 'bon', 'sucre', 'litre', 'gousse'],
    ing:[[1.5,'kg','poires mûres'],[1,'L','bon vin blanc 13°'],[600,'g','sucre'],[null,'','¼ de litre d’alcool de fruit 40°'],[null,'','½ gousse de vanille']],
    prep:['Mettre dans un grand saladier les poires épluchées en les écrasant grossièrement, verser le vin blanc dessus, l’alcool de fruit, la vanille, et couvrir avec un film.', 'Faire macérer durant 5 jours en remuant de temps en temps.', 'Ensuite filtrer la préparation et mettre dans une casserole avec le sucre, faire cuire en écumant et laisser bouillir 5 minutes, regarder si le sirop épaissit bien.', 'Laisser refroidir avant de mettre en bouteille.'] },

  { id:'cr-creme-de-pomme', nom:'Crème de Pomme', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:20, mac:14, macTxt:'Deux semaines', lot:2.3,
    tags:['eau-de-vie', 'jus', 'sucre', 'pommes', 'bâton'],
    ing:[[null,'','Pour'],[1,'L','eau de vie à 40°'],[1,'L','jus de pommes'],[300,'g','sucre'],[500,'g','pommes golden'],[null,'','½ bâton de vanille']],
    prep:['Dissoudre le sucre dans le jus de pommes, chauffer le mélange autour de 60°C pour finir de dissoudre le sucre et laisser refroidir.', "Ensuite, mélanger avec l'eau de vie à parts égales, les pommes pelées et écrasée grossièrement et la vanille fendue, mettre en attente dans un endroit sombre.", 'Deux semaines plus tard, filtrer le jus pour en sortir les impuretés.', 'Ensuite le mettre en bouteille, laisser reposer de longs mois.', 'Six mois sont parfaits.', 'Se boit frappé ! !.'] },

  { id:'cr-creme-de-prunes', nom:'Crème de Prunes', cat:'cremes', themes:['fruits', 'epices'], gravure:'fruit', degre:27, mac:60, macTxt:'2 mois', lot:1.8,
    tags:['prunes', 'eau-de-vie', 'vanille', 'eau', 'sucre'],
    ing:[[1,'kg','prunes'],[1,'L','eau-de-vie à 40°'],[1,'gousse','vanille'],[50,'cl','eau'],[600,'g','sucre']],
    prep:['Laisser sécher les prunes au soleil en les remuant fréquemment.', 'Ecraser les fruits et les noyaux au mortier et les placer dans un bocal avec la vanille.', 'Recouvrir d’alcool.', 'Boucher le bocal et laisser macérer à température douce pendant 2 mois minimum.', 'Filtrer et ajouter le sirop.', 'Laisser reposer 8 à 10 jours filtrer à nouveau et mettre en bouteilles.'] },

  { id:'cr-creme-de-vanille', nom:'Crème de vanille', cat:'cremes', themes:['epices'], gravure:'epice', degre:27, mac:60, macTxt:'2 mois', lot:3.3,
    tags:['vanille', 'alcool', 'safran', 'girofle', 'sucre', 'eau'],
    ing:[[6,'gousses','vanille'],[2,'L','alcool à 40°'],[1,'g','safran'],[5,'clous','girofle'],[2,'kg','sucre'],[1,'L','eau']],
    prep:['Ouvrir les gousses de vanille et les couper en petits tronçons.', 'Mettre dans une casserole les aromates, le sucre et l’eau, puis porter le tout à ébullition.', 'Retirer du feu et verser l’alcool sur la préparation.', 'Laisser refroidir et verser dans une jarre hermétique.', 'Laisser reposer 2 mois puis filtrer et mettre en bouteilles.'] },

  { id:'cr-creme-facon-baileys', nom:'Crème façon Baileys', cat:'cremes', themes:[], gravure:'plante', degre:16, mac:30, macTxt:'un mois', lot:1.1,
    tags:['boîte', 'whisky', 'crème', 'œufs', 'sirop'],
    ing:[[1,'pièce','boîte de 300 m de Lait concentré sucré'],[500,'ml','whisky'],[250,'ml','crème fraîche liquide 15% (légère)'],[3,'pièces','œufs entiers'],[15,'ml','sirop de chocolat']],
    prep:['Mélanger tous les ingrédients dans le robot pour que le mélange soit lisse.', 'On peut garder cette préparation un mois au réfrigérateur.'] },

  { id:'cr-creme-de-kummel', nom:'Crème de Kummel', cat:'cremes', themes:['epices'], gravure:'epice', degre:35, mac:60, macTxt:'deux mois', lot:1.3,
    tags:['graines', 'alcool', 'eau', 'sucre', 'quelques'],
    ing:[[50,'g','graines de cumin'],[1,'L','alcool à 40°'],[1,'verre','eau'],[400,'g','sucre'],[null,'','quelques pistils de safran']],
    prep:['Griller rapidement à sec les graines, puis les broyer grossièrement au pilon.', 'Dissoudre le sucre dans le verre d’eau tiède.', 'Laisser refroidir, puis mélanger tous les ingrédients et laisser reposer à l’ombre deux mois en remuant régulièrement.', 'Filtrer soigneusement la macération et mettre en bouteilles.', 'La crème de kummel sera d’autant meilleure qu’il aura vieillie quelques mois.'] },

  { id:'cr-ratafia-d-absinthe-1902', nom:'Ratafia d’absinthe (1902)', cat:'cremes', themes:['fruits', 'fleurs', 'epices', 'plantes', 'historiques'], gravure:'fruit', degre:40, mac:15, macTxt:'15 jours', lot:1.8,
    tags:['eau-de-vie', 'feuilles', 'baies', 'cannelle', 'tige', 'eau', 'sucre'],
    ing:[[1,'L','eau de vie à 60°'],[40,'g','feuilles d’absinthe'],[20,'g','baies de genièvre'],[5,'g','cannelle'],[1,'g','tige d’angélique fraiche'],[15,'cl','eau de fleur d’oranger'],[250,'g','sucre'],[30,'cl','eau']],
    prep:["il faut laisser macérer 15 jours dans 1 litre d'eau de vie toutes les herbes et feuilles.", "Après avoir filtré on ajoute le mélange de 1/3 litre d'eau 15 cl d'eau de fleur d'oranger et 250 gr de sucre que l’on aura fait dissoudre dans l’eau."] },

  { id:'rt-ratafia-d-angelique-1750', nom:'Ratafia d’Angélique (1750)', cat:'ratafias', themes:['plantes', 'historiques'], gravure:'plante', degre:24, mac:0, macTxt:'—', lot:2.6,
    tags:['crème', 'sucre', 'cacao', 'liqueur'],
    ing:[[4,'pièces','dl de crème liquide'],[75,'g','sucre semoule'],[20,'g','sucre glace'],[10,'g','cacao amer en poudre'],[1,'c. à s.','liqueur d’angélique']],
    prep:['Faire bouillir à feu doux 1,5 dl de crème liquide dans une casserole.', 'Retirer la casserole au premier bouillon.', 'Chauffer sur feu doux le sucre semoule dans une casserole, agiter légèrement cette dernière afin de bien répartir la chaleur, et laisser caraméliser, retirer la casserole, et incorporer petit à petit la crème bouillante en fouettant sans cesse.', 'Remettre ensuite ce caramel à cuire 2 à 3 minutes sur feu doux, puis le laisser refroidir à température ambiante.', 'Il est recommandé de réaliser ce caramel quelques heures à l’avance.', 'Fouetter énergiquement 2,5 dl de crème liquide bien froide, y incorporer petit à petit 20 g de sucre glace.', 'Parfumer cette crème fouettée avec 1 cuillère à soupe de liqueur d’angélique.', 'Verser la crème caramel dans des coupes, mettre délicatement au dessus la chantilly et saupoudrer de cacao amer.'] },

  { id:'rt-ratafia-de-noyaux-au-miel-1829', nom:'Ratafia de noyaux au miel (1829)', cat:'ratafias', themes:['fruits', 'historiques'], gravure:'fruit', degre:24, mac:90, macTxt:'trois mois', lot:2.6,
    tags:['eau-de-vie', 'sirop'],
    ing:[[4,'bouteilles','eau de vie'],[4,'livres','sirop de miel']],
    prep:['Voici une recette de ratafia de noyaux qui fera connaitre combien cette sorte de liqueur est facile à faire.', 'Dans le temps des abricots, mettez dans un bocal quatre bouteilles d’eau de vie ; à mesure que vous aurez des noyaux d’abricots, concassez-les sans les écraser ; mettez l’amande et le bois dans l’eau de vie.', 'Il faut cent noyaux par bouteille, laissez infuser ces noyaux pendant trois mois et plus.', 'Séparez alors l’eau de vie d’avec les noyaux en jetant le tout sur un tamis.', 'Mettez ensuite quatre livres de sirop de miel dans l’eau de vie et passez au papier gris, vous aurez un ratafia limpide et excellent.'] },

  { id:'rt-ratafia-de-brou-de-noix-1785', nom:'Ratafia de Brou de Noix (1785)', cat:'ratafias', themes:['fruits', 'epices', 'historiques'], gravure:'fruit', degre:24, mac:90, macTxt:'3 mois', lot:2.6,
    tags:['eau-de-vie', 'sucre', 'chaque', 'cannelle'],
    ing:[[4,'pintes','eau de vie'],[2,'livres','sucre'],[1,'gros','chaque'],[1,'gros','cannelle']],
    prep:['Prenez quatre-vingt noix vertes, quatre pintes d’eau de vie, deux livres de sucre, girofle et muscade ou macis, un gros de chaque, une gousse de vanille et un gros de cannelle.', 'Vous choisissez des noix vertes et assez peu avancées pour que l’épingle passe aisément au travers ; vous les pillez et les mettez avec les aromates ; infusez dans l’eau de vie pendant 2 mois.', 'Au bout de ce temps, vous mettez le mélange sur un tamis de soie pour l’égoutter.', 'Vous faites fondre le sucre dans la liqueur, que vous laissez reposer de nouveau pendant 3 mois ; ce temps écoulé ; vous la décantez et la filtrez avant la mise en bouteilles.'] },

  { id:'rt-ratafia-de-cassis-1820', nom:'Ratafia de Cassis (1820)', cat:'ratafias', themes:['fruits', 'fleurs', 'historiques'], gravure:'fruit', degre:24, mac:0, macTxt:'—', lot:1.1,
    tags:['quelques', 'sucre', 'eau', 'poires', 'agar', 'baie'],
    ing:[[null,'','Quelques fleurs séchées d’ibiscus'],[300,'g','sucre semoule'],[75,'cl','eau'],[2,'pièces','poires par personne'],[3,'pincées','agar agar',false],[500,'g','baie de cassis surgelées']],
    prep:['Pour la gelée, faire doucement éclater les baies dans une casserole avec 1 cuillère d’eau et ajouter ensuite 3 à 4 pincées d’agar agar et 100 gr de sucre.', 'Faire dissoudre, passer et laisser refroidir puis mettre au frais quelques heures.', 'Faire pocher les poires pelées et évidées (garder les chapeaux) dans la décoction de fleurs.', 'Ajouter les 200 gr de sucre et faire cuire à petit bouillon 20 minutes.', 'Egoutter les poires, les laisser refroidir, les farcir avec la gelée de cassis.', 'Au fond de chaque coupe, mettre deux poires remplie de gelée et remettre les chapeaux.', 'Mouiller le fond des coupes avec le sirop de fleur d’ibiscus.', 'Servir bien frais.'] },

  { id:'rt-ratafia-de-cedrat', nom:'Ratafia de Cédrat', cat:'ratafias', themes:['fruits'], gravure:'fruit', degre:24, mac:30, macTxt:'30 jours', lot:2.6,
    tags:['sucre', 'cédrats', 'oranges', 'eau-de-vie', 'eau'],
    ing:[[600,'g','sucre'],[4,'pièces','cédrats'],[4,'pièces','oranges'],[2,'pinte','eau de vie'],[1,'pinte','eau']],
    prep:['Couper les cédrats et les oranges en quartiers ; laisser infuser dans les liquides sucrés pendant 30 jours dans un bocal bien fermé.', 'Presser, filtrer et mettre en bouteille.', "Ancêtre du citron, le cédrat est un gros fruit ovale parfois verruqueux qui peut mesurer jusqu'à 25 cm de long et peser 4 kg.", 'Sa chair verte ou jaune est peu juteuse, le parfum de son zeste est très agréable.', 'Le zeste de cédrat est rarement utilisé frais.', 'Il est surtout confit et utilisé en pâtisserie, en confiserie ou à des fins décoratives.', 'Il est également transformé en confiture et en liqueurs.', "L'essence de cédrat est employée en parfumerie.", 'Gelée de Cédrat Cette gelée est du pur bonheur, étalée en plus sur des tranches de brioches grillées ! ! !.', 'On grimpe au nirvana.', 'Ingrédients par pot : 4 cédrats, 4 oranges et 2 citrons, 200 gr de sucre, 1 bâton de cannelle.', 'Préparation :.', 'Presser les fruits et au jus obtenu, ajouter l’équivalent de poids en sucre, un peu de zeste de cédrat, le bâton de cannelle, une gousse de vanille.', 'Cuire 30 mn à très petit bouillon et mettre en bocal.', 'Gelée de cédrat aux pignons Ingrédients : 1 kg de cédrats, 50 g de pignons, 500 gr de sucre Préparation : Torréfier les pignons à sec dans une poêle.', 'Eplucher les cédrats puis Faire cuire pendant 15 mn dans 30 cl d’eau les fruits épluchés et en quartiers.', 'Mixer le tout puis filtrer à travers un tamis quelques heures le temps que le jus s’écoule lentement.', 'Puis ajouter la même quantité de sucre.', 'Faire prendre pendant 30 minutes environ à feu moyen, en écumant et en remuant régulièrement pour atteindre le point de gélification.', 'Ajouter alors les pignons, bien remuer et mettre en bocaux.'] },

  { id:'rt-ratafia-cerises-et-framboises', nom:'Ratafia Cerises et Framboises', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:30, mac:56, macTxt:'8 semaines', lot:1.8,
    tags:['cerises', 'framboises', 'alcool', 'bouquet', 'cannelle', 'sucre', 'litre'],
    ing:[[1,'kg','cerises'],[1,'kg','framboises'],[1.5,'L','alcool 40°'],[null,'','½ bouquet de coriandre fraiche'],[2,'bâton','cannelle'],[600,'g','sucre'],[null,'','½ litre d’eau']],
    prep:['Faire fondre le sucre à chaud dans le ½ litre d’eau, Mettre les cerises et cuire à petit bouillon 15 mn.', 'Ecraser les cerises dans un chinois pour séparer la pulpe des noyaux.', 'Ecraser une grosse poignée de noyaux de cerises puis dans une jarre mélanger, le sirop, le jus des cerises, l’alcool et les framboises bien mûres et légèrement concassées.', 'Laisser reposer 8 semaines dans un endroit sombre en remuant régulièrement.', 'Passer une première fois à la passoire pour bien récupérer la macération.', 'Repasser finement pour bien supprimer la pulpe.', 'Mettre en bouteilles et laisser reposer quelques semaines avant de consommer.'] },

  { id:'rt-ratafia-de-citronnelle-xvii-siecle', nom:'Ratafia de Citronnelle (XVII siècle)', cat:'ratafias', themes:['fruits', 'epices', 'plantes', 'historiques'], gravure:'fruit', degre:24, mac:30, macTxt:'un mois', lot:2.6,
    tags:['eau-de-vie', 'cannelle', 'sucre'],
    ing:[[4,'pintes','eau-de-vie'],[12,'pièces','citrons (zestes)'],[2,'gros','cannelle concassée'],[1,'once','grains de coriandre'],[2,'livres','sucre'],[1.5,'pinte','eau (pour fondre le sucre)']],
    prep:['Pour quatre pintes d’eau de vie vous zesterez douze beaux citrons ; ajoutez-y deux gros de cannelle concassée et une once de grains de coriandre ; avec deux livres de sucre que l’on fera fondre dans une pinte et demie d’eau ; laissez le tout infuser un mois ; passez ensuite votre liqueur et mettez-la dans des bouteilles fermées et cirées.'] },

  { id:'rt-ratafia-de-clementines', nom:'Ratafia De Clémentines', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:56, macTxt:'8 semaines', lot:1.3,
    tags:['rhum', 'sucre', 'belles', 'cannelle', 'vanille', 'girofle', 'macis', 'eau'],
    ing:[[1,'L','rhum planteur'],[300,'g','sucre'],[10,'pièces','belles clémentines non traitées'],[2,'bâton','cannelle'],[1,'gousse','vanille'],[3,'clous','girofle'],[1,'c. à café','macis'],[1,'verre','eau']],
    prep:['Peler à l’économe les clémentines pour récupérer les zestes.', 'Passer les fruits au broyeur pour extraire le jus.', 'Broyer au mortier tous les épices.', 'Dans une jarre mélanger le rhum, le jus de fruit, les zestes et les épices.', 'Faire un sirop avec l’eau et le sucre et l’ajouter froid à la macération.', 'Laisser reposer 8 semaines à l’ombre, avant de filtrer finement, et de mettre en bouteilles.', 'Oh my darling Clementine !!.', 'On pense que "Clémentine" a été écrite par Percy Montrose vers 1883 Clementine In a cavern, in a canyon Excavating for a mine Lived a miner forty-niner And his daughter, Clementine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', 'Light she was and like a fairy And her shoes were number nine Herring boxes without topses Sandals were for Clementine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', 'Drove she ducklings to the water Every morning just at nine Hit her foot against a splinter Fell into the foaming brine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', 'Ruby lips above the water Blowing bubbles soft and fine But, alas, I was no swimmer, So I lost my Clementine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', 'In a churchyard near the canyon Where the myrtle doth entwine There grow roses and the posies Fertilized by Clementine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', "Then the miner, forty-niner Soon began to peak and pine Thought he oughter join his daughter Now he's with his Clementine.", 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', "In my dreams she still doth haunt me Robed in garments soaked in brine Though in life I used to hug her Now she's dead, I'll draw the line.", 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine.', 'How I missed her, how I missed her How I missed my Clementine Till I kissed her little sister And forgot my Clementine.', 'Oh, my darling, oh, my darling Oh, my darling Clementine You are lost and gone forever Dreadful sorry, Clementine Clementine Dans une caverne, dans un canyon Creusant une galerie Vivait un mineur de quarante-neuf ans Et sa fille Clémentine.', 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', 'Elle était légère et comme une fée Et elle chaussait du quarante-trois Des boîtes de harengs sans couvercle Étaient les sandales de Clémentine.', 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Elle conduisait les canetons à l'eau Tous les matins à neuf heures Elle se cogna le pied contre un bout de bois Et tomba dans la saumure écumante Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.", 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Ses lèvres de rubis au-dessus de l'eau Faisaient de jolies bulles délicates, Mais hélas, je ne savais pas nager Aussi je perdis ma Clémentine.", 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Dans le cimetière, près du canyon, Où le myrte s'entrelace Là poussent des roses et des bouquets Fertilisés par Clémentine.", 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Puis le mineur de quarante-neuf ans Commença bientôt à avoir des hauts et des bas Il pensa qu'il devrait rejoindre sa fille Maintenant il est avec Clémentine.", 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Dans mes rêves, elle me hante encore Vêtue d'habits trempés d'eau salée Quand elle vivait, je la serrais dans mes bras Maintenant qu'elle est morte, c'est terminé.", 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.', "Comme elle me manqua, comme elle me manqua Comme ma Clémentine me manqua, Jusqu'à ce que j'embrasse sa petite sœur Et que j'oublie ma Clémentine.", 'Oh, ma chérie, oh ma chérie, Oh, ma Clémentine chérie.', 'Tu es perdue et partie à jamais.', 'Je suis terriblement désolée, Clémentine.'] },

  { id:'rt-ratafia-de-coings', nom:'Ratafia de Coings', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:0, macTxt:'3 heures', lot:1.1,
    tags:['beaux', 'bon', 'sucre', 'c.à.c', 'quelques', 'noix', 'vanille'],
    ing:[[2,'pièces','beaux coings'],[75,'cl','bon vin rouge corsé Bordeaux ou Bourgogne'],[200,'g','sucre'],[2,'pièces','c.à.c de cannelle en poudre'],[null,'','quelques clous de girofle'],[1,'pincée','noix de muscade',false],[1,'gousse','vanille un zeste de citron ou d’orange non traité']],
    prep:['Eplucher les coings et les couper en fines tranches Les mettre dans un récipient, les couvrir de vin et les laisser mariner au moins 3 heures.', 'Ranger les coings et bien les étaler dans une marmite.', "Ajouter les épices, le sucre et le zeste d'agrume.", 'Cuire pendant 1h à 1h30 à petit bouillon le temps que les coings deviennent bien tendres et le vin un peu sirupeux.', 'Laisser reposer quelques heures au frais dans le sirop de cuisson.'] },

  { id:'rt-ratafia-de-fleurs-au-miel', nom:'Ratafia de fleurs au miel', cat:'ratafias', themes:['fleurs', 'epices'], gravure:'fleur', degre:24, mac:3, macTxt:'3 jours', lot:1.3,
    tags:['mélange', 'fleurs', 'violette', 'œillet', 'filtrez', 'miel', 'vanille', 'eau-de-vie'],
    ing:[[null,'','mélange'],[250,'g','fleurs odorante'],[null,'','violette'],[null,'','œillet'],[null,'','filtrez puis ajoutez 180 à'],[200,'g','miel liquide'],[1,'bâton','fendu de vanille'],[1,'L','eau de vie à 40°']],
    prep:["Macérez seulement pendant 3 jours dans un litre de bonne eau-de-vie : 250 grammes de pétales de rose odorante ou de fleurs de violettes et d'autres fleurs parfumées ; filtrez puis ajoutez 180 à 200 grammes de miel liquide par litre de préparation."] },

  { id:'rt-ratafia-de-fleurs-d-orangers', nom:'Ratafia de Fleurs d’Orangers', cat:'ratafias', themes:['fruits', 'fleurs'], gravure:'fruit', degre:24, mac:20, macTxt:'vingt jour', lot:2.6,
    tags:['eau-de-vie', 'sucre', 'eau'],
    ing:[[8,'pintes','eau-de-vie'],[4,'livres','sucre'],[1.5,'livre','fleurs d’oranger (les plus blanches possible)'],[null,'','eau (quantité nécessaire pour le sirop)',false]],
    prep:['Prenez huit pintes d’eau de vie, quatre livres de sucre et une livre et demie de fleur d‘orange, la plus blanche possible.', 'Vous faites fondre el sucre dans la quantité d‘eau nécessaire, et vous y mettez votre fleur d’orange épluchée ; lorsqu’elle à reçu un bouillon vous retirez le mélange du feu, vous le laissez refroidir, puis le mettez dans un vase de grés et y versez l’eau de vie, tenez hermétiquement fermé, et laissez infuser pendant dix-huit ou vingt jour ; après cela, vous filtrez le ratafia.', 'On nous a rapporté qu’il a été fait de ce ratafia, à partir d’eau de fleur d’oranger.', 'Dans ce cas il faut mettre 2 pintes d’eau de fleur d’oranger à la place des fleurs.'] },

  { id:'rt-ratafia-de-framboises', nom:'Ratafia de Framboises', cat:'ratafias', themes:['fruits'], gravure:'fruit', degre:24, mac:0, macTxt:'—', lot:2.6,
    tags:['eau-de-vie', 'sucre'],
    ing:[[8,'pintes','eau de vie'],[4,'livres','sucre']],
    prep:['Prenez huit pintes d’eau de vie, quatre de jus de framboise, une de jus de cerise et quatre livres de sucre.', 'Lorsque vous aurez fait fondre le sucre dans le jus des fruits, vous y ajoutez l’eau de vie, et laissez reposer le mélange un bon mois.', "Aussitôt que la liqueur est claire vous la décantez, la filtrez et la mettez en bouteilles Racontar n'a pas de fruit, fleur n'a pas de paille."] },

  { id:'rt-ratafia-de-genievre', nom:'Ratafia de Genièvre', cat:'ratafias', themes:['epices'], gravure:'epice', degre:24, mac:21, macTxt:'3 semaines', lot:2.6,
    tags:['eau-de-vie', 'sucre', 'eau', 'baies', 'chaque'],
    ing:[[4,'pintes','eau de vie'],[2,'livres','sucre'],[1,'livre','eau de rivière'],[12,'onces','baies de genièvre'],[1,'gros','chaque']],
    prep:['Prenez quatre pintes d’eau de vie, deux livres de sucre, une livre d’eau de rivière, douze onces de baies de genièvre, d’anis, de cannelle, de coriandre, et de girofle, un gros de chaque.', 'Concassez les graines et les aromates, et mettez les infuser dans l’eau de vie pendant 3 semaines.', 'Après ce temps, vous passez le mélange à travers un tamis ; vous y ajoutez le sucre que vous avez fait fondre dans l’eau de rivière, ensuite vous décantez puis vous filtrez le ratafia.', 'Liège pont des arches buveur de Gin Je ne bois jamais rien de plus fort que le gin avant le petit déjeuner.', 'W.C.', 'Fields.'] },

  { id:'rt-ratafia-de-grenade', nom:'Ratafia de Grenade', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:1, macTxt:'1 jour', lot:1.3,
    tags:['graines', 'alcool', 'sucre', 'cannelle', 'vanille', 'eau'],
    ing:[[1,'kg','graines de grenade bien mûres'],[1,'L','alcool de fruit'],[250,'g','sucre'],[1,'bâton','cannelle'],[1,'gousse','vanille'],[1,'verre','eau']],
    prep:['Egrainer les grenade et les mettre à macérer 1 jour au frais avec le sucre et le verre d’eau.', 'Bien remuer et verser le tout dans une jarre et recouvrir d’alcool.', 'Ajouter alors la vanille fendue et la cannelle broyée.', 'Oublier pendant 4 semaines dans un endroit sombre.', 'Filtrer au travers un drap pour bien récupérer tout le jus des grenades et mettre en bouteilles.', 'Cet alcool très parfumé vieillit très bien.', 'Méditation Tous les champignons sont comestibles.', "Certains ne le sont qu'une fois !.", 'Importance pour la médecine Plus de 250 études scientifiques montrent que la grenade pourrait avoir un effet positif en cas de maladies cardiovasculaires, cancers et arthrite.', 'Dans une étude in vitro, on a pu constater un effet protecteur du jus de grenade contre les cellules du cancer du sein ainsi que sur les cellules de la leucémie.', 'Dans une étude sur une culture cellulaire datant de 2008 on a pu montrer en outre que le jus de grenade peut avoir un effet positif même à un stade avancé du cancer de la prostate.', 'Salvador Dali Le tableau reprend la théorie de Sigmund Freud selon laquelle le rêve transforme les éléments extérieurs qui perturbent le lecteur en objets oniriques, et les amplifie.', "En effet, ce rêve traduit la crainte de Gala, d'une piqure d'abeille.", "Il est généré par le bourdonnement de l'insecte autour de la pomme-grenade (en bas, à droite).", 'De celle-ci jaillit un poisson, dont sort un tigre ; du tigre sort un deuxième tigre qui pointe un fusil à baillonette sur le bras de Gala.', "L'accumulation de ces éléments, de plus en plus agressifs, montrent qu'une menace pèse sur la femme.", "De plus, le pic de la baillonette peut renvoyer au dard de l'abeille, tout comme la couleur du pelage des tigres.", 'La menace de la piqure, qui dans la réalité semble minime, est ici amplifiée.', "Titre de l'oeuvre Rêve causé par le vol d'une abeille autour d'une grenade, une seconde avant l'éveil.", 'Salvatore Dali.'] },

  { id:'rt-ratafia-de-grenoble-ou-de-teissier', nom:'Ratafia de Grenoble, ou de Teissier', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:15, mac:35, macTxt:'5 à 6 semaines', lot:3.8,
    tags:['sucre', 'feuilles', 'cannelle', 'amandes', 'jus', 'alcool', 'cerise'],
    ing:[[6,'livre','sucre'],[2,'livres','feuilles de cerises'],[3,'gros','cannelle fine'],[1,'livre','amandes de cerises'],[2,'L','jus de cerise'],[1.5,'L','alcool'],[15,'g','cannelle broyée'],[1,'kg','cerise sans la']],
    prep:['Prenez quinze pintes (952 ml) de jus de merises, douze de bonne eau-de-vie, six livre de sucre, deux livres de feuilles de cerises, trois gros de cannelle fine et un gros de girofle, ou de chaque en plus grande quantité, pourvu que vous observiez les proportions.', 'Vous avez à part une suffisante quantité de merises, dont vous supprimez les queues ; vous séparez les noyaux que vous concassez et exprimez le jus à la presse.', 'Vous le mêlez avec votre sucre que vous avez fait fondre, et versez le tout dans un tonneau ; vous y ajoutez l’eau de vie, la cannelle, le girofle et les feuilles de cerises, et vous laissez déposer le mélange.', 'Lorsqu’il est clair, vous les soutirez et le collez ; au bout de 10 à 12 jours vous pouvez le mettre en bouteilles.', 'Si vous voulez donner plus de goût à votre liqueur, vous y ajoutez aux doses ci-dessus une livre d’amandes de cerises, d’abricots ou de pêches.', "Mais plus simplement aujourd'hui 2 litres de jus de cerise, 1,5 litre d’alcool à 40°, 50 feuilles de cerisier, 600 gr de sucre, 15 gr de cannelle broyée, un clou de girofle.", 'Broyer 1 kg de cerise sans la queue, puis concasser les noyaux.', 'Ajouter le jus et les noyaux cassés et les amandes à la préparation.', 'Laisser reposer dans une jarre 5 à 6 semaines en remuant de temps en temps.', 'Passer finement, laisser décanter et refiltrer.', 'Mettre en bouteille.'] },

  { id:'rt-ratafia-de-groseilles', nom:'Ratafia de Groseilles', cat:'ratafias', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:24, mac:30, macTxt:'un mois', lot:1.3,
    tags:['eau-de-vie', 'sucre', 'cannelle', 'girofle', 'eau'],
    ing:[[4,'pintes','eau de vie'],[2,'livres','sucre concassé'],[1,'gros','cannelle'],[1,'gros','girofle'],[1,'L','eau en décoction']],
    prep:['Prenez quatre pintes d’eau de vie, deux de jus de groseilles, deux livres de sucre concassé, un gros de cannelle aussi concassé, et un gros de girofle.', 'Vous avez égrené vos groseilles avant de la mettre à la presse pour en exprimer le jus, vous avez rectifié l’eau de vie en y ajoutant les aromates ; vous réunissez les liqueurs et les laissez reposer pendant un mois.', 'Après ce temps, vous décantez le mélange, y faites fondre le sucre et filtrez le ratafia.', 'Rions Au paradis on est assis à la droite de Dieu.', "C'est normal, c'est la place du mort.", "Groseillier et médecine, ce que l'on en pensait au XIX siècle Les feuilles de groseillier mélangées à la même quantité de réglisse (30 grammes) de chaque pour un litre d'eau en décoction), donnent une boisson très rafraîchissante et qui pousse aux urines.", "Nous la conseillons volontiers dans l’hydropisie (insuffisance cardiaque), la gravelle, les rétentions d'urine, la goutte, le rhumatisme et les inflammations de l'estomac et des intestins."] },

  { id:'rt-ratafia-de-guignolet-a-l-ancienne', nom:'Ratafia de Guignolet à l’Ancienne', cat:'ratafias', themes:['fruits', 'epices', 'historiques'], gravure:'fruit', degre:18, mac:180, macTxt:'6 mois', lot:4.3,
    tags:['cerises', 'guignes', 'griottes', 'framboises', 'eau-de-vie', 'eau', 'sucre', 'cannelle', 'macis'],
    ing:[[1,'kg','cerises bien noires'],[1,'kg','guignes'],[1,'kg','griottes'],[200,'g','framboises'],[2,'L','eau de vie à 40°'],[2,'L','eau'],[700,'g','sucre en poudre'],[1,'bâton','cannelle'],[1,'c. à café','macis']],
    prep:['Dénoyauter les cerises noires et les guignes.', 'Y mélanger les griottes et les framboises et écraser le tout.', 'Verser dans un récipient ouvert en ajoutant l’alcool, le sirop la cannelle et le macis.', 'Laisser à l’air libre une semaine.', 'Fermer alors le récipient et laisser macérer 2 mois.', 'Filtrer la préparation et la laisser décanter quelques jours.', 'Filtrer de nouveau et mettre en bouteilles.', 'Laisser vieillir 6 mois avant de consommer.'] },

  { id:'rt-ratafia-de-jonquilles', nom:'Ratafia de Jonquilles', cat:'ratafias', themes:['fleurs'], gravure:'fleur', degre:35, mac:30, macTxt:'30 jours', lot:1.3,
    tags:['eau-de-vie', 'fleurs', 'sucre', 'eau'],
    ing:[[1,'L','eau-de-vie à 40°'],[200,'g','fleurs de jonquilles fraîches'],[300,'g','sucre'],[1,'verre','eau']],
    prep:['Eplucher les fleurs, rejeter étamines et calices, les mettre à macérer dans l’eau-de-vie pendant 24 heures.', 'Faire un sirop en chauffant sucre et eau, le verser tiède dans l’eau-de-vie de macération.', 'Boucher et attendre 30 jours.', 'Filtrer, mettre en bouteilles, laisser reposer 1 mois avant de servir.'] },

  { id:'rt-ratafia-de-mures', nom:'Ratafia de Mûres', cat:'ratafias', themes:['fruits'], gravure:'fruit', degre:24, mac:8, macTxt:'huit jours', lot:2.6,
    tags:['eau-de-vie', 'sucre'],
    ing:[[8,'pintes','eau-de-vie'],[1,'pinte','eau de rivière'],[3.5,'livres','sucre'],[3,'livres','mûres'],[0.5,'livre','groseilles rouges'],[0.5,'livre','framboises'],[0.5,'gros','macis']],
    prep:['Prenez huit pintes d’eau de vie, une d’eau de rivière, trois livres et demie de sucre, trois livres de mûres, demie-livre de groseilles rouges, autant de framboises et demi gros de macis.', 'Après avoir égrené les groseilles, réunissez tous les fruits, écrasez-les tous ensemble, et mettez-en le jus, ainsi que le macis, infusez dans le macis pendant quinze à dix-huit jours.', 'Alors vous faites fondre le sucre dans la pinte d’eau, vous y décantez la liqueur, y mêlez l’eau de vie, la filtrez et la mettez en bouteilles.'] },

  { id:'rt-ratafia-de-noyaux', nom:'Ratafia de Noyaux', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:120, macTxt:'quatre mois', lot:2.6,
    tags:['eau-de-vie', 'sucre', 'eau', 'quart', 'cannelle'],
    ing:[[4,'pintes','eau de vie'],[2,'livres','sucre concassé'],[1,'livre','eau de rivière'],[1,'livre','et un quart d’amandes d’abricots ou de pê'],[1,'gros','cannelle']],
    prep:['Prenez quatre pintes d’eau de vie, deux livres de sucre concassé, une livre d’eau de rivière, une livre et un quart d’amandes d’abricots ou de pêches ; un gros de cannelle et ou de girofle.', 'Vous avez soin que vos amandes soient fraîches ; vous leur enlevez la peau, les concassez et les mettez dans un vase de grès, avec la cannelle infusez trois ou quatre mois ; alors vous passez le mélange au tamis, auquel vous ajoutez le sucre que vous avez fais fondre dans votre eau de rivière, ensuite vous filtrez la liqueur.'] },

  { id:'rt-ratafiat-de-noix-recette-du-vxii-siecle', nom:'Ratafiat de Noix (recette du VXII siècle)', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:28, macTxt:'4 à 5 semaines', lot:2.6,
    tags:['eau-de-vie', 'sucre'],
    ing:[[2,'pintes','eau-de-vie'],[16,'pièces','noix vertes (fendues en deux)'],[1.5,'livre','sucre'],[2,'clous','girofle'],[1,'bâton','cannelle'],[null,'','macis (très peu)',false]],
    prep:['Le ratafia de noix se fait vers le temps de la Magdeleine (fin juillet) que les noix sont formées ; pour deux pintes d’eau de vie que vous mettrez dans une cruche bien bouchée.', 'Vous y mettrez quinze à seize noix entières que vous fendrez par la moitié ; mettez votre cruche à la cave pour y laisserez infuser les noix avec l’eau de vie environ 4 à 5 semaines.', 'Vous aurez soin de bien remuer la cruche au moins 2 fois par semaine pour bien mêler les noix et l’eau de vie et lui en communique parfaitement le goût.', 'Ensuite vous filtrerez l’eau de vie et le remettrez dans la cruche avec une livre et demie de sucre deux clous de girofle, un petit bâton de cannelle et très peu de macis (noix de muscade).', 'Faites encore infuser le tout l’espace de trois semaines, ensuite vous filtrerez et mettrez en bouteille.', 'Plus vous garderez ce ratafia meilleur il deviendra.'] },

  { id:'rt-ratafia-de-peches', nom:'Ratafia de Pêches', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:56, macTxt:'8 semaines', lot:1.3,
    tags:['poires', 'alcool', 'eau', 'sucre', 'girofle', 'cannelle', 'vanille', 'macis'],
    ing:[[2,'kg','poires bien mûres'],[1,'L','alcool à 40°'],[1,'verre','eau'],[300,'g','sucre'],[3,'clous','girofle'],[1,'bâton','cannelle'],[1,'gousse','vanille'],[1,'c. à café','macis']],
    prep:['Laisser bien mûrir les poires puis les peler.', 'Concasser la pulpe des fruits et broyer au mortier les épices.', 'Dans une jarre mélanger, la peau et la purée de fruits, les épices, la vanille fendue.', 'Le sirop refroidi de sucre et d’eau.', 'Laisser reposer dans un endroit sombre pendant 8 semaines en remuant de temps en temps.', 'Filtrer finement pour supprimer la pulpe et mettre en bouteilles.'] },

  { id:'rt-ratafia-de-raisin-muscat', nom:'Ratafia de Raisin Muscat', cat:'ratafias', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:15, macTxt:'quinze jours', lot:2.6,
    tags:['jus', 'eau-de-vie', 'cannelle'],
    ing:[[3,'pintes','jus'],[3,'pinte','eau de vie'],[2,'gros','cannelle']],
    prep:['Vous prendrez du raisin muscat bien mûr, vous l’égrènerez ; écrasez-le et pressez –le pour en tirer le jus ; pour trois pintes de jus, vous mettrez trois pinte d’eau de vie dans une cruche bien bouchée ; vous ajouterez deux gros de cannelle et deux livres de sucre, que vous ferez fondre dans le jus de raisin ; laissez infuser le tout pendant quinze jours ; ensuite passez-le à la chausse, et le mettrez en bouteilles.', 'L’on peut également faire cette liqueur avec du muscat noir ; prenez-le toujours bien mûr, ayez soin de le bien éplucher, et qu’il ne s’y trouve point de grains gâtés.'] },

  { id:'rt-ratafia-de-rossoli-dit-populo', nom:'Ratafia de Rossoli (dit Populo)', cat:'ratafias', themes:['fleurs', 'epices'], gravure:'fleur', degre:24, mac:30, macTxt:'30 jours', lot:1.3,
    tags:['eau-de-vie', 'girofle', 'poivre', 'coriandre', 'poignée', 'sucre', 'eau', 'graines', 'drosea'],
    ing:[[1,'L','eau de vie à 40°'],[6,'clous','girofle'],[4,'grains','poivre noir'],[2,'grains','coriandre'],[1,'pièce','petite poignée de grains d’anis vert'],[300,'g','sucre'],[0.5,'verre','eau'],[null,'','les graines de'],[5,'fleurs','drosea rotondifolia']],
    prep:['Ecraser grossièrement les différentes épices dans un mortier, les mettre dans un bocal avec 1 litre d’eau-de –vie, remuer, boucher et laisser 30 jours.', 'Faire un sirop clarifié en chauffant le sucre et l’eau, laisser refroidir et y verser 1’alcool filtré.', 'Mélanger et mettre en bouteilles.', 'Avant de servir attendre quelques semaines.', 'La Citation Mal aux dents a carnivore.', "N'en devient par herbivore.", 'Charles de Leuss Drosea Rodontifolia : la petite histoire Elle affectionne les tourbières acides à sphaignes localement abondante.', "Ils colonisent souvent en grand nombre les « coussins » de sphaigne vivante ou morte lorsque l'exposition au soleil est abondante.", "Mais elle reste assez rare en France, se rencontre généralement entre 600 à 2000 m d'altitude, mais on peut en trouver à des altitudes inférieures à 400 m, comme dans la tourbière Saint-Jean située sur le territoire de la commune de Bertrichamps (Meuthe et Moselle).", "Elle se trouve également dans les régions tempérées de l'hémisphère nord (Amérique du Nord, Europe, Asie).", 'Catherine de Médicis (1515-1589) est une figure emblématique du xvie siècle.', 'Son nom est irrémédiablement attaché aux guerres de Religion opposant catholiques et protestants.', "Partisane d'une politique de conciliation, elle est l'instauratrice en France de la liberté de conscience pour les protestants, et a de nombreuses fois tenté de faire accepter le concept de tolérance civile.", 'Une légende noire persistante la dépeint comme une personne acariâtre, jalouse du pouvoir, ne reculant devant aucun crime pour conserver son influence.', "Aujourd'hui, la tendance historiographique la réhabilite, et reconnaît en elle une des plus grandes reines de France.", 'Néanmoins, son rôle dans le massacre de la Saint-Barthélemy contribue à en faire une figure controversée.'] },

  { id:'rt-ratafia-de-semences-chaudes-ou-eau-des-sept-graines-1730', nom:'Ratafia de Semences Chaudes ou Eau des Sept Graines (1730)', cat:'ratafias', themes:['epices', 'plantes', 'historiques'], gravure:'epice', degre:24, mac:42, macTxt:'six semaines', lot:8.3,
    tags:['anis', 'carvi', 'cumin', 'fenouil', 'ache', 'ammi', 'panais', 'amome', 'eau-de-vie', 'sucre'],
    ing:[[60,'g','anis'],[60,'g','carvi'],[60,'g','cumin'],[60,'g','fenouil'],[60,'g','ache (céleri) ou persil'],[60,'g','ammi'],[60,'g','panais sauvage'],[60,'g','amome'],[8,'L','eau-de-vie'],[180,'g',"sucre (par litre d'eau-de-vie)"]],
    prep:['Piler 60 g de chaque graine ou semence chaude, majeure et mineure.', "Les mettre à infuser six semaines dans huit litres d'eau-de-vie.", "Ajouter par litre 180 g de sucre cassé en gros morceaux, trempés dans l'eau avant d'être jetés dans l'eau-de-vie.", "L'infusion achevée, passer le ratafia à la chausse quelques jours plus tard.", 'Plus il est gardé, meilleur il devient.'] },

  { id:'rt-ratafia-de-vanille', nom:'Ratafia de Vanille', cat:'ratafias', themes:['epices'], gravure:'epice', degre:24, mac:7, macTxt:'1 semaine', lot:2.4,
    tags:['alcool', 'vanille', 'sucre', 'eau'],
    ing:[[2,'L','alcool à 40°'],[4,'gousses','vanille'],[400,'g','sucre'],[15,'cl','eau']],
    prep:['Faire macérer dans 2 litres d’alcool à 40°, 4 gousses de vanille que vous aurez fendues.', 'Il faut bien racler les graines et le mettre également dans l’alcool.', 'Laissez infuser la vanille coupée par le milieu et en long pendant 15 jours.', 'Dissoudre le sucre dans un peu d’eau et ajoutez ce sirop à la préparation.', 'Laisser poser 1 semaine, filtrer et mettre en bouteille Les plantes qui produisent la vanille portent elles-mêmes le nom de vanille, ou parfois de vanillier.', "Ce sont les seules orchidées cultivées pour des raisons autres qu'ornementales.", 'La culture et la préparation de la vanille nécessitent, pour obtenir une épice richement aromatique, des soins longs et attentifs.', "Cela en fait, rapporté au poids, l'un des produits agricoles les plus chers au monde.", 'Il se présente sous la forme de bâtonnets noirs et luisants, communément appelés « gousses de vanille ».', "Botaniquement, il s'agit cependant de capsules.", "Au Mexique pays d'origine de la vanille c'est une abeille se charge de la pollinisation naturelle de la fleur d'Orchidée.", 'Pour toutes les autres contrées ou la plante à été introduite par les Européens , il faut faire une pollinisation manuelle.', 'La petite Fleur de Vanille.'] },

  { id:'rt-ratafia-des-quatre-fruits-xviiie-siecle', nom:'Ratafia des Quatre Fruits (XVIIIe siècle)', cat:'ratafias', themes:['fruits', 'fleurs', 'historiques'], gravure:'fruit', degre:24, mac:0, macTxt:'—', lot:2.6,
    tags:['prenez', 'groseilles', 'framboise'],
    ing:[[null,'','Prenez trente livres de cerises'],[15,'livre','groseilles'],[8,'pièces','framboise et six de cassis']],
    prep:['Otez les queues de cerises, exprimez le jus de vos fruits réunis, et y mettez par pinte de jus cinq ou six onces de sucre fondu ; vous y ajoutez autant de pintes d’eau de vies que vous avez de jus de fruit, deux gros de girofle et un gros de macis ; lorsque la liqueur est bien reposée et éclaircie, vous la décantez et la mettez en bouteilles.', "A l'époque il fallait très certainement des tonneaux ou des comportes pour réaliser de tel assemblage !!.", "Pensée Pour connaître l'origine et la qualité d'un vin, il n'est pas nécessaire de boire le tonneau entier.", 'Oscar Wilde Du rhum des femmes - Soldat Louis.'] },

  { id:'rt-ratafia-d-illets-1', nom:'Ratafia d’Œillets 1', cat:'ratafias', themes:['fleurs', 'epices'], gravure:'fleur', degre:20, mac:28, macTxt:'4 semaines', lot:4.3,
    tags:['faut', 'pétales', 'cannelle', 'eau-de-vie', 'eau', 'sucre.'],
    ing:[[null,'','Il faut employer'],[250,'g','pétales fraîs d’œillets rouges'],[20,'g','cannelle'],[2,'L','eau de vie à 40°'],[2,'L','eau'],[800,'g','sucre. 10 Gr. de coriandre']],
    prep:['Enlever l’onglet aux pétales d’œillets ; verser dessus l’eau tiède et laisser infuser pendant 2 jours, presser et passer ce mélange ; ajouter le sucre, l’eau de vie, la cannelle et la coriandre.', 'Mélanger bien le tout et laisser infuser pendant 4 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'rt-ratafia-d-illets-2', nom:'Ratafia d’Œillets 2', cat:'ratafias', themes:['fleurs', 'epices'], gravure:'fleur', degre:24, mac:60, macTxt:'deux mois', lot:2.6,
    tags:['eau-de-vie', 'eau', 'sucre', 'pétales', 'girofle'],
    ing:[[6,'pintes','eau de vie'],[1,'pinte','eau de rivière'],[3,'livres','sucre'],[2,'livres','pétales d’œillets rouges'],[1,'gros','girofle']],
    prep:['Prenez six pintes d’eau de vie, une pinte d’eau de rivière, trois livres de sucre, deux livres de pétales d’œillets rouges, et un gros de girofle.', "Après avoir séparé les onglets de vos pétales, c'est-à-dire, la partie inférieure, et qui n’est pas de la même couleur, vous ne prenez que la partie rouge, que vous faites infuser dans l’eau de vie pendant deux mois.", 'Vous y avez mis votre girofle en même temps ; après cela, vous passez le mélange à travers un linge blanc que vous pressez ; vous versez dedans le sucre que vous avez fais fondre dans votre eau de rivière ; ensuite vous pressez la liqueur et la mettez en bouteilles.'] },

  { id:'rt-ratafia-d-oranges-du-portugal', nom:'Ratafia d’Oranges du Portugal', cat:'ratafias', themes:['fruits'], gravure:'fruit', degre:24, mac:60, macTxt:'deux mois', lot:2.6,
    tags:['eau-de-vie', 'sucre'],
    ing:[[4,'pintes','eau de vie'],[2,'livres','sucre']],
    prep:['Vous zesterez douze belles oranges non traitées, que vous choisissez les plus épaisses de peau ; vous les mettez à mesure dans quatre pintes d’eau de vie, que vous aurez mise dans une cruche ; vous ferez fondre deux livres de sucre dans le jus des oranges que vous aurez pressées ; mêlez le tout ; bouchez bien la cruche, et laissez là pendant deux mois en infusion ; après ce temps ; passez-la et mettez-la dans des bouteilles.'] },

  { id:'rt-hypocras-a-la-vanille', nom:'Hypocras à la Vanille', cat:'ratafias', themes:['epices'], gravure:'epice', degre:18, mac:10, macTxt:'dix jours', lot:2.3,
    tags:['sucre', 'bon'],
    ing:[[125,'g','sucre'],[2,'L','bon vin rouge']],
    prep:['Triturez 7 décigrammes de bonne vanille des îles avec 125 grammes de sucre, versez-y 2 litres de bon vin rouge et 125 grammes d’alcool à 85°, après dix jours de macération filtrez.'] },

  { id:'rt-hypocras-a-la-violette', nom:'Hypocras à la Violette', cat:'ratafias', themes:['fleurs'], gravure:'fleur', degre:24, mac:7, macTxt:'une semaine', lot:1.3,
    tags:['iris', 'vin'],
    ing:[[6,'g','iris de Florence'],[1,'L','vin rouge ou blanc']],
    prep:['Faites digérer pendant une semaine ou deux, 6 grammes d’iris de Florence et 7 décigrammes de girofle en poudre, avec un litre de vin rouge ou blanc, ajoutez le sucre et l’esprit, une goutte d’ambre et de musc.', 'Mais il est possible de remplacer le musc par des graines d’ambrette broyées.', 'Filtrez soigneusement la préparation.'] },

  { id:'hy-hypocras-a-l-angelique', nom:'Hypocras à l’Angélique', cat:'hypocras', themes:['plantes'], gravure:'plante', degre:24, mac:10, macTxt:'dix jours', lot:1.3,
    tags:['vin', 'angélique', 'même', 'esprit'],
    ing:[[1,'L','vin rouge ou blanc'],[8,'g','angélique fraîche'],[16,'g','la même plante confite'],[60,'g','esprit']],
    prep:['Faites infuser à froid, pendant dix jours, dans un litre de vin rouge ou blanc, 8 grammes d’angélique fraîche avec une pincée de muscade en poudre, ou 16 grammes de la même plante confite ; ajoutez le sucre et 60 grammes d’esprit, et filtrez.'] },

  { id:'hy-hypocras-a-l-orange', nom:'Hypocras à l’Orange', cat:'hypocras', themes:['fruits'], gravure:'fruit', degre:24, mac:7, macTxt:'une semaine', lot:1.3,
    tags:['bon', 'sucre'],
    ing:[[1,'L','bon vin'],[90,'g','sucre en poudre'],[60,'g','sucre en gros morceaux sur l’écorce d’une']],
    prep:['Versez sur les zestes de deux grosses oranges et 20 feuilles ; un litre de bon vin et 60 grammes d’alcool, après une semaine d’infusion, ajoutez 90 grammes de sucre en poudre, agitez de temps en temps et filtrez le lendemain.', 'Ou bien, frottez 60 grammes de sucre en gros morceaux sur l’écorce d’une orange, jusqu’à ce que le sucre soit bien imprégné de l’huile essentielle du fruit ; faites le fondre dans le vin et filtrez.'] },

  { id:'hy-hypocras-au-cedrat', nom:'Hypocras au Cédrat', cat:'hypocras', themes:['fruits'], gravure:'fruit', degre:24, mac:7, macTxt:'une semaine', lot:1.5,
    tags:['cédrat', 'sucre'],
    ing:[[1,'gros','cédrat un litre de bon vin'],[90,'g','sucre en poudre'],[60,'g','sucre en gros morceaux sur l’écorce d’un']],
    prep:['Versez sur les zestes d’un gros cédrat un litre de bon vin et 60 grammes d’alcool, après une semaine d’infusion, ajoutez 90 grammes de sucre en poudre, agitez de temps en temps et filtrez le lendemain.', 'Ou bien, frottez 60 grammes de sucre en gros morceaux sur l’écorce d’un cédrat, jusqu’à ce que le sucre soit bien imprégné de l’huile essentielle du fruit ; faites le fondre dans le vin et filtrez.'] },

  { id:'hy-hypocras-aux-cerises', nom:'Hypocras Aux Cerises', cat:'hypocras', themes:['fruits'], gravure:'fruit', degre:18, mac:14, macTxt:'2 semaines', lot:2.8,
    tags:['bon', 'eau-de-vie', 'sucre', 'cerises'],
    ing:[[2,'L','bon vin rouge à 13°'],[0.5,'L','eau de vie à 40°'],[400,'g','sucre'],[500,'g','cerises fraîches']],
    prep:['écraser les cerises pour faire éclater la pulpe.', 'Mélanger au vin rouge, ajouter le sucre et l’alcool.', 'Verser dans une bonbonne et laisser exposer au soleil 2 semaines.', 'Filtrer finement la préparation, laisser décanter et mettre en bouteilles.', 'Servir bien frais.'] },

  { id:'hy-hypocras-au-genievre', nom:'Hypocras au Genièvre', cat:'hypocras', themes:['epices'], gravure:'epice', degre:16, mac:2, macTxt:'48 heures', lot:1.3,
    tags:['baies', 'vin', 'sucre'],
    ing:[[30,'g','baies de genièvre concassées'],[1,'L','vin'],[90,'g','sucre en poudre']],
    prep:['Faites macérer à froid pendant 48 heures, 30 grammes de baies de genièvre concassées, bien mûres et bien fraîches, avec un litre de vin et 30 à 60 grammes d’esprit, ajoutez tant soit peu de vanille ou d’ambre, 60 à 90 grammes de sucre en poudre, et filtrez.'] },

  { id:'hy-hypocras-au-vin-d-absinthe', nom:'Hypocras au Vin d’Absinthe', cat:'hypocras', themes:['epices', 'plantes'], gravure:'epice', degre:16, mac:2, macTxt:'48 heures', lot:1.3,
    tags:['vin', 'absinthe', 'sucre', 'anis', 'alcool'],
    ing:[[1,'L','vin blanc'],[1,'poignée','absinthe fraîche'],[90,'g','sucre en morceaux'],[4,'g','anis concassé'],[60,'g','alcool']],
    prep:['Faites infuser pendant 48 heures, dans un litre de vin blanc, une poignée d’absinthe fraîche, 60 ou 90 grammes de sucre en morceaux, frotté sur l’écorce d’un citron ou d’un petit cédrat, 4 grammes d’anis concassé, cinq à six clous de girofle en poudre ; ajoutez 60 grammes d’alcool, passez avec expression et filtrez.'] },

  { id:'hy-hypocras-aux-epices-1', nom:'Hypocras aux Epices 1', cat:'hypocras', themes:['epices'], gravure:'epice', degre:16, mac:10, macTxt:'10 jours', lot:1.3,
    tags:['cannelle', 'muscade', 'alcool', 'vin', 'sucre'],
    ing:[[4,'g','cannelle de chine'],[15,'g','muscade'],[60,'g','alcool'],[1,'L','vin blanc ou rouge 13'],[90,'g','sucre en poudre']],
    prep:['Mettez dans une grande bouteille 4 grammes de cannelle de chine, deux ou trois clous de girofle, 15 grammes de muscade, une pincée de macis, le tout en poudre, et ajoutez 30 à 60 grammes d’alcool à 40°; après 10 jours de digestion, ajoutez un litre de vin blanc ou rouge 13°, deux ou trois gouttes d’essence d’ambre, et 60 à 90 grammes de sucre en poudre, agitez et filtrez le lendemain.'] },

  { id:'hy-hypocras-aux-epices-2', nom:'Hypocras aux Epices 2', cat:'hypocras', themes:['fleurs', 'epices'], gravure:'fleur', degre:16, mac:4, macTxt:'quelques jours, à froid', lot:1.1,
    tags:['vin', 'gingembre', 'cannelle', 'cardamome', 'girofle', 'sucre', 'eau', 'alcool'],
    ing:[[75,'cl','vin rouge (Bourgogne, peu tannique)'],[4,'g','gingembre à râper'],[20,'g','cannelle'],[0.25,'c. à café','cardamome grise'],[2,'clous','girofle'],[22,'morceaux','sucre (ou équivalent en miel)'],[1,'c. à s.','eau de rose'],[10,'cl','alcool à 40°']],
    prep:['Râper le gingembre et concasser les épices.', "Mélanger au vin avec le sucre (ou le miel), l'eau de rose et l'alcool.", 'Laisser infuser à froid quelques jours en remuant.', 'Filtrer soigneusement et mettre en bouteilles.'] },

  { id:'hy-hypocras-aux-epices-3', nom:'Hypocras aux Epices 3', cat:'hypocras', themes:['fruits', 'epices'], gravure:'fruit', degre:24, mac:30, macTxt:'30 jours', lot:12.3,
    tags:['cannelle', 'macis', 'muscade', 'amandes', 'vanille', 'alcool', 'vin', 'sucre'],
    ing:[[30,'g','cannelle de ceylan en poudre'],[15,'g','macis'],[15,'g','muscade'],[60,'g','amandes amères'],[100,'g','vanille pilée'],[10,'L','alcool'],[2,'L','vin de chablis'],[3,'g','cannelle en poudre'],[1,'kg','sucre fondu']],
    prep:['On fait infuser pendant 10 à 12 jours, dans du vin de chablis, 30 grammes de cannelle de ceylan en poudre, 15 grammes de macis, 15 grammes de muscade, 60 grammes d’amandes amères, 100 grammes de vanille pilée avec du sucre.', 'On tire au clair, on ajoute 20 kilo de sucre fondu dans un peu d’eau et 10 litres d’alcool à 85°.', 'Après quelques jours de repos, on colle, on filtre et on met en bouteilles.', 'Dans des proportions plus raisonables pour nous.', 'Faire infuser dans 2 litres de vin de chablis, 3 gr de cannelle en poudre, 2 gr de macis, 2 gr de muscade, 5 gr d’amandes amères, 1 gousse de vanille, 1 kg de sucre fondu dans 0,5 L d’eau et 2 litres d’alcool à 40°.', 'Laisser au repos pendant 30 jours, puis filtrer et laisser décanter.', 'Mettre alors en bouteille et de consommer qu’après quelques semaines.'] },

  { id:'hy-hypocras-au-miel', nom:'Hypocras Au Miel', cat:'hypocras', themes:['epices'], gravure:'epice', degre:16, mac:20, macTxt:'20 jours', lot:2.8,
    tags:['miel', 'vanille', 'alcool', 'bon', 'cannelle', 'girofle', 'rhizome', 'curcuma'],
    ing:[[1,'kg','miel liquide'],[1,'gousse','vanille'],[0.5,'L','alcool à 45°'],[2,'L','très bon vin blanc'],[2,'bâton','cannelle'],[5,'clous','girofle'],[null,'','½ rhizome de gingembre'],[null,'','½ rhizome de galanga (épice asiatique)'],[1,'c. à café','curcuma']],
    prep:['Faire dissoudre le miel avec le ½ litre d’eau, ouvrir la gousse de vanille et la tronçonner en tronçons.', 'Broyer les autres épices, puis tout mettre à macérer dans le vin pendant 12 heures.', 'Ajouter alors le miel dilué et l’alcool.', 'Mettre le tout dans une bonbonne hermétique et laisser reposer 20 jours.', 'Filtrer finement la préparation et mettre en bouteilles.', 'Consommer après quelques mois de cave.'] },

  { id:'hy-hypocras-aux-noyaux', nom:'Hypocras aux Noyaux', cat:'hypocras', themes:['fruits'], gravure:'fruit', degre:16, mac:10, macTxt:'10 jours', lot:1.3,
    tags:['vin', 'sucre'],
    ing:[[1,'L','vin blanc'],[60,'g','sucre']],
    prep:['Cassez douze noyaux d’abricots et six noyaux de pêches, sans endommager les amandes, faites infuser celles-ci avec leur bois, pendant 10 jours, dans un litre de vin blanc ; ajoutez 4 décigrammes de vanille triturée avec 60 grammes de sucre, un peu d’esprit, et filtrez.'] },

  { id:'hy-hypocras-de-la-marquise', nom:'Hypocras De La Marquise', cat:'hypocras', themes:['fruits', 'epices', 'plantes'], gravure:'fruit', degre:16, mac:5, macTxt:'5 jour', lot:2.8,
    tags:['alcool', 'bon', 'oranges', 'citrons', 'bonne', 'poivre', 'muscade', 'romarin', 'abricots', 'pommes'],
    ing:[[0.5,'L','alcool à 40°'],[2,'L','bon vin rouge'],[2,'pièces','oranges'],[2,'pièces','citrons non traités'],[1,'pièce','bonne cuillère à soupe de graine de coriandre'],[1,'c. à s.','poivre en grain'],[null,'','½ muscade râpée'],[1,'branche','romarin'],[200,'g','abricots frais'],[500,'g','pommes acides'],[300,'g','sucre'],[5,'clous','girofle']],
    prep:['Prélever finement les zestes des agrumes puis presser les fruits.', 'Couper les abricots et faire éclater les noyaux.', 'Débiter les pommes en lamelle fines.', 'Ajouter tous les autres ingrédients.', 'Faire macérer dans une jarre au frais pendant 5 journées en agitant régulièrement.', 'Filtrer la préparation puis mettre en bouteilles, Se sert bien frais.'] },

  { id:'hy-hypocras-framboise', nom:'Hypocras Framboisé', cat:'hypocras', themes:['fruits'], gravure:'fruit', degre:16, mac:0, macTxt:'—', lot:1.3,
    tags:['vin', 'esprit'],
    ing:[[1,'L','vin rouge'],[60,'g','esprit']],
    prep:['Remplissez un entonnoir à grille, de framboises fraichement cueillies et point écrasées ; faites filtrer à travers un litre de vin rouge ; ajoutez 60 grammes d’esprit, le sucre nécessaire et filtrez.', 'La grande quantité du principe mucilagineux contenu dans la framboise, ferait promptement tourner le vin, si on la laissait en digestion avec le fruit.', 'On peut préparer de la même manière un fort joli vin de fraise.'] },

  { id:'hy-hypocras-rouge-ou-blanc', nom:'Hypocras Rouge ou Blanc', cat:'hypocras', themes:['epices'], gravure:'epice', degre:16, mac:30, macTxt:'un mois', lot:6.3,
    tags:['boisson', 'vin', 'cannelle'],
    ing:[[3,'L','boisson'],[3,'L','vin rouge ou blanc'],[30,'g','cannelle râpée']],
    prep:["Pour 3 litres de boisson : 3 litres de vin rouge ou blanc ; 180g de sucre roux (que l'on peut remplacer par du miel) ; 3 cuillères à soupe de miel (que l'on peut remplacer par du sirop de fraise) ; 30 gr de cannelle râpée ; 2 cuillères à soupe de gingembre frais râpé ; 1 cuillère à café de noix de muscade râpée ; 1 cuillère à café de macis (l'arille, ou bogue, de la noix de muscade), de clou de girofle et de cardamome, le tout pilé ; 1 pincée de poivre noir ; Piler les différentes épices au mortier.", 'Mettre le tout dans un cul-de-poule ; Mouiller avec un peu de vin pour lier les épices.', 'Ajouter le sucre ou le miel liquéfié au bain-marie.', 'Faire chauffer le vin à feu très doux sans ébullition.', "Ajouter au vin chaud la soupe d'épices.", 'Mettre en bocaux et laisser reposer une semaine.', "Au bout d'une semaine, filtrer l'ensemble avec un linge puis mettre en bouteilles.", 'Laisser la boisson reposer un mois avant dégustation.', 'Les bouteilles peuvent se conserver plusieurs années, mais une fois ouverte son contenu doit être consommé dans la semaine.'] },

  { id:'hy-vin-d-amour-en-cage', nom:'Vin D’amour En Cage', cat:'hypocras', themes:[], gravure:'plante', degre:17, mac:15, macTxt:'15 jours', lot:1.4,
    tags:['fruits', 'miel', 'vin', 'alcool'],
    ing:[[400,'g','fruits d’amour en cage'],[100,'g','miel liquide'],[1,'L','vin blanc sec 13°'],[15,'cl','alcool à 40 °']],
    prep:['faire dissoudre le miel dans le vin, ajouter les fruits écrasés et l’alcool.', 'Bien boucher et laisser macérer 15 jours dans une jarre.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'hy-vin-d-artichaut', nom:'Vin D’artichaut', cat:'hypocras', themes:['plantes'], gravure:'plante', degre:17, mac:14, macTxt:'2 semaines', lot:1.5,
    tags:['sucre', 'bon', 'artichauts', 'alcool'],
    ing:[[150,'g','sucre'],[1,'bouteille','bon vin rouge 13°'],[50,'feuilles','artichauts'],[15,'cl','alcool à 40°']],
    prep:['couper finement les feuilles puis mélanger le sucre, le vin et l’alcool.', 'Laisser reposer 2 semaines puis filtrer et mettre en bouteilles.'] },

  { id:'vn-jus-d-andouille-blanc', nom:"Jus d'Andouille Blanc", cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:18, mac:21, macTxt:'3 semaines', lot:6.3,
    tags:['bon', 'eau-de-vie', 'sucre', 'oranges', 'citrons', 'bananes', 'extraits'],
    ing:[[5,'L','bon vin blanc à 13°'],[1,'L','eau de vie à 40 °'],[1,'kg','sucre'],[4,'pièces','oranges'],[4,'pièces','citrons'],[6,'pièces','bananes'],[2,'pièces','extraits "Noirot" parfum curaçao blanc']],
    prep:['Couper en morceaux les agrumes, peler les bananes.', 'Laisser macérer tous les ingrédients dans une grosse bonbonne pendant 3 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'vn-vermouth-blanc-a-la-camomille', nom:'Vermouth Blanc à la Camomille', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:18, mac:30, macTxt:'30 jours', lot:1.4,
    tags:['vin', 'eau-de-vie', 'fleurs', 'oranges', 'sucre'],
    ing:[[1,'L','vin blanc sec 13°'],[10,'cl','eau de vie de fruit'],[50,'g','fleurs de camomille'],[2,'pièces','oranges amères'],[40,'morceau','sucre']],
    prep:['Faire macérer une semaine au soleil dans le vin blanc, les fleurs de camomille et les zestes des deux oranges amères.', 'Ajouter le sucre et l’alcool.', 'Prolonger la macération 30 jours en remuant régulièrement pour faire fondre le sucre.', 'Filtrer et mettre en bouteilles.', 'Ce vermouth amer maison, est à boire très frais, mais après quelques mois de cave.'] },

  { id:'vn-vin-chaud-aux-epices', nom:'Vin Chaud aux Epices', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:17, mac:0, macTxt:'—', lot:1.1,
    tags:['bon', 'cannelle', 'girofle', 'poivre', 'étoile', 'sucre', 'zeste', 'noix', 'gingembre', 'alcool'],
    ing:[[75,'cl','bon vin rouge 13°'],[2,'bâton','cannelle'],[3,'clous','girofle'],[10,'grains','poivre noir'],[1,'pièce','étoile de badiane ou anis étoilée'],[125,'g','sucre'],[1,'c. à café','zeste de citron'],[1,'c. à café','zeste d’orange'],[1,'pincée','Noix de muscade',false],[1,'pincée','gingembre',false],[10,'cl','alcool (cognac, armagnac...)']],
    prep:["Verser le vin et l'alcool dans une casserole et faire bouillir, ajouter le sucre, les épices et les zestes.", 'Laisser chauffer à feu doux 20 mn, filtrer le vin et servir bien chaud.'] },

  { id:'vn-vin-chaud-traditionnel', nom:'Vin Chaud Traditionnel', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:12, mac:0, macTxt:'—', lot:1.3,
    tags:['orange', 'citron', 'bon', 'cannelle', 'anis', 'graines', 'cassonade'],
    ing:[[1,'pièce','orange'],[1,'pièce','citron'],[1,'L','bon vin rouge 13°'],[1,'bâton','cannelle'],[1,'pièce','anis étoilé'],[3,'pièces','ou 4 graines de cardamome'],[200,'g','cassonade']],
    prep:["Détailler l'orange et le citron en rondelles.", 'Les mettre dans une casserole.', 'Ajouter tous les autres ingrédients et faire chauffer.', "Juste avant l'ébullition, retirer du feu, couvrir et laisser infuser quelques minutes.", 'Servir chaud.'] },

  { id:'vn-vin-d-ecorce-de-bouleau', nom:'Vin D’écorce De Bouleau', cat:'vins', themes:[], gravure:'racine', degre:17, mac:15, macTxt:'15 jours', lot:4.5,
    tags:['écorce', 'bon', 'miel', 'alcool'],
    ing:[[100,'g','écorce de jeune bouleau'],[1,'bouteille','bon vin rouge 13°'],[150,'g','miel'],[15,'cl','alcool à 40°']],
    prep:["Sécher l’écorce et la réduire en petits bouts, Faire macérer dans une jarre l’écorce, le miel, le vin et l'alcool pendant 15 jours.", 'Filtrer finement et mettre en bouteille.'] },

  { id:'vn-vin-a-la-reine-des-pres', nom:'Vin à la reine des Prés', cat:'vins', themes:['fleurs', 'epices', 'plantes'], gravure:'fleur', degre:25, mac:15, macTxt:'15 jours', lot:3.8,
    tags:['fleurs', 'bon', 'cognac', 'cl)', 'miel', 'vanille'],
    ing:[[500,'g','fleurs fraîches de reine des prés ou'],[100,'g','fleurs séchées'],[2,'L','bon vin blanc 13°'],[1.5,'L','cognac ordinaire 40° (2 bouteilles de'],[0.75,'pièces','cl)'],[500,'g','miel'],[1,'gousse','vanille']],
    prep:['Mélanger tous les ingrédients dans le vin, dissoudre le miel et ajouter la gousse de vanille fendue.', 'Laisser macérer 15 jours et mettre en bouteilles pour faire vieillir quelques mois.', 'Cette préparation à des propriétés sédative et calmante, prendre un petit verre le soir au coucher.'] },

  { id:'vn-vin-a-l-angelique', nom:'Vin à l’angélique', cat:'vins', themes:['plantes'], gravure:'racine', degre:17, mac:14, macTxt:'2 semaines', lot:3.8,
    tags:['angélique', 'bon', 'sucre', 'alcool'],
    ing:[[500,'g','angélique (racines et feuilles)'],[3,'L','bon vin blanc sec 13°'],[300,'g','sucre roux'],[50,'cl','alcool à 40°']],
    prep:['Faire macérer dans une jarre l’angélique, lavée rapidement puis débitée en petits tronçons.', 'Faire dissoudre le sucre dans le vin et ajouter l’alcool.', 'Laisser reposer 2 semaines, filtrer et mettre en bouteilles.', 'Un petit verre de ce vin est un excellent remède en cas de digestion difficile ou d’état fébrile.'] },

  { id:'vn-vin-a-l-ananas', nom:"Vin à l'Ananas", cat:'vins', themes:['fruits'], gravure:'fruit', degre:18, mac:35, macTxt:'35 jours', lot:6.3,
    tags:['bon', 'eau-de-vie', 'ananas', 'sucre'],
    ing:[[5,'L','bon vin blanc 13°'],[1,'L','eau de vie à 40°'],[1,'pièce','ananas frais'],[750,'g','sucre']],
    prep:['Peler et couper l’ananas en morceaux.', 'Mettre tous les ingrédients dans une jarre et laisser macérer environ 35 jours, brasser régulièrement.', 'Filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-basilic', nom:'Vin De Basilic', cat:'vins', themes:['plantes'], gravure:'plante', degre:17, mac:15, macTxt:'15 jours', lot:1.3,
    tags:['feuilles', 'bon', 'miel', 'alcool'],
    ing:[[150,'g','feuilles de basilic'],[1,'L','bon vin rouge 13°'],[100,'g','miel'],[1,'verre','alcool à 40°']],
    prep:['Hacher finement le basilic puis mélanger dans une jarre, le vin, le sucre, l’alcool et le basilic.', 'Faire macérer 15 jours puis filtrer finement et mettre en bouteilles.'] },

  { id:'vn-vin-de-bleuet', nom:'Vin De Bleuet', cat:'vins', themes:['fleurs'], gravure:'fleur', degre:17, mac:30, macTxt:'un mois', lot:1.4,
    tags:['fleurs', 'bon', 'miel', 'alcool'],
    ing:[[50,'g','fleurs de bleuets'],[1,'L','bon vin rouge 13°'],[100,'g','miel'],[15,'cl','alcool à 40°']],
    prep:['Faire macérer les fleurs dans une jarre avec le vin, le miel et l’alcool pendant un mois.', 'Remuer de temps en temps puis filtrer finement et mettre en bouteilles.'] },

  { id:'vn-vin-au-cresson', nom:'Vin Au Cresson', cat:'vins', themes:['plantes'], gravure:'plante', degre:17, mac:15, macTxt:'15 jours', lot:4.5,
    tags:['botte', 'bonne', 'alcool', 'miel'],
    ing:[[1,'pièce','botte de cresson frais'],[1,'pièce','bonne bouteille de vin blanc sec 13°'],[15,'cl','alcool à 40°'],[100,'g','miel liquide']],
    prep:['Hacher grossièrement la botte de cresson, puis mettre à macérer tous les éléments dans une jarre.', 'Laisser reposer 15 jours, puis filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-a-l-orange-amere', nom:"Vin à l'Orange Amère", cat:'vins', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:18, mac:40, macTxt:'40 jours', lot:4.5,
    tags:['rosé', 'eau-de-vie', 'sucre', 'oranges', 'orange', 'citron', 'vanille', 'écorce'],
    ing:[[2,'bouteille','rosé de Provence environ'],[0.5,'L','eau de vie de fruit à 40°'],[300,'g','sucre en poudre'],[4,'pièces','oranges amères'],[1,'pièce','orange douce'],[0.5,'pièces','citron'],[1,'gousse','vanille'],[1,'morceau','écorce de cannelle']],
    prep:["Brosser les oranges non traitées sous l'eau chaude pour bien les nettoyer, Dans un grand bocal, vider les 2 bouteilles de vin.", "Ajouter l'alcool de fruits, le sucre, le jus de citron, la gousse de vanille fendue et la cannelle.", 'Ajouter les oranges coupées en quartier avec la peau.', 'Compléter au besoin avec le reste du vin pour que la bouteille soit bien pleine Fermer le bocal, puis agiter.', 'Conserver dans un endroit sombre et laisser macérer pendant 40 jours.', 'Penser à remuer le bocal environ 1 fois par semaine.', 'Filtrer le contenu du bocal à travers une passoire fine en pressant un peu les oranges ; mettre en bouteille.', 'Laisser au repos quelques semaines avant de consommer bien frais.'] },

  { id:'vn-vin-de-quinquina-blanc', nom:'Vin De Quinquina Blanc', cat:'vins', themes:['fruits', 'epices', 'plantes'], gravure:'fruit', degre:18, mac:5, macTxt:'5 jours', lot:3.8,
    tags:['bon', 'litre', 'sucre', 'écorce', '‘écorce', 'vanille', 'baies', 'amandes', 'alcool'],
    ing:[[3,'L','bon vin blanc'],[null,'','¼ de litre d’eau'],[800,'g','sucre'],[100,'g','écorce de quinquina'],[100,'g','‘écorce d’orange amère'],[2,'gousses','vanille'],[10,'g','baies de genièvre. 1 cuillère à café de macis'],[15,'g','amandes amères'],[0.5,'L','alcool à 40°']],
    prep:['On doit d’abord faire macérer l’écorce de quinquina dans l’eau pendant 5 jours au frais.', 'Puis dans une jarre on verse le vin, l’alcool, et tous les autres composants broyés.', 'Mettre dans un endroit sombre puis remuer régulièrement pendants 10 jours.', 'Filtrer finement et mettre en bouteille.'] },

  { id:'vn-vin-rose-au-quinquina', nom:'Vin Rosé au Quinquina', cat:'vins', themes:['fruits', 'fleurs', 'epices', 'plantes'], gravure:'fruit', degre:18, mac:30, macTxt:'30 jours', lot:1.3,
    tags:['vin', 'racine', 'écorce', 'citron', 'vanille', 'peu', 'sucre'],
    ing:[[1,'L','vin rosé de Provence 13°'],[10,'g','racine de gentiane'],[10,'g','écorce de quinquina'],[10,'g',"écorce sèche d'orange amère"],[1,'zeste','citron frais'],[1,'gousse','vanille'],[2,'pièces',"dl d'eau-de-vie 40°"],[1,'pièce','peu de noix de muscade râpée'],[100,'g','sucre roux']],
    prep:['Faire dabord dissoudre le sucre dans le vin et le verser dans un bocal.', 'Y mettre infuser tous les ingrédients.', "Après 30 jours de macération, filtrer et ajouter alors l'eau-de-vie.", 'Mettre en bouteille et laisser reposer quelques semaines avant de consommer frais.'] },

  { id:'vn-vin-blanc-de-fraises', nom:'Vin blanc de Fraises', cat:'vins', themes:['fruits'], gravure:'fruit', degre:15, mac:2, macTxt:'48 heures', lot:4.5,
    tags:['bon', 'fraises', 'alcool', 'sucre', 'grand'],
    ing:[[2,'bouteille','bon vin blanc 13°'],[600,'g','fraises bien mûres'],[15,'cl','alcool à 40°'],[125,'g','sucre semoule'],[1,'pièce','grand carré de gaze pour filtrer']],
    prep:['Lavez et équeutez les fraises, coupez-les en morceaux et mixez-les avec le sucre et un peu de vin blanc.', 'Versez le coulis dans un récipient pouvant être refermé, ajoutez le reste de vin blanc, mélangez bien et laissez macérer au frigo 48 heures.', "Prendre un grand récipient, posez une passoire dessus et le morceau de gaze dans la passoire, ensuite versez le vin petit à petit en pressant bien la pulpe avec le dos d'une cuillère et ajouter l'alcool.", 'Le vin de fraise se boit bien frais.'] },

  { id:'vn-vin-aux-fraises-et-au-vin-rouge', nom:'Vin aux Fraises et au Vin Rouge', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:18, mac:90, macTxt:'3 mois', lot:4.5,
    tags:['fraises', 'vanille', 'sucre', 'alcool', 'bon'],
    ing:[[800,'g','fraises'],[1,'gousse','vanille'],[400,'g','sucre en poudre'],[50,'cl','alcool de fruit à 40°'],[null,'','bon vin rouge à 13° (pour compléter à 2 litres)',false]],
    prep:['Ecraser les fraises, mélanger tous les autres ingrédients et la gousse de vanille fendue.', 'Laisser macérer 3 mois, puis filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-menthe-fraiche', nom:'Vin de Menthe Fraîche', cat:'vins', themes:['fleurs', 'plantes'], gravure:'fleur', degre:15, mac:0, macTxt:'—', lot:2.3,
    tags:['eau', 'menthe', 'vin', 'sucre', 'alcool'],
    ing:[[50,'cl','eau'],[50,'g','menthe fraîche'],[1,'L','vin sec blanc ou rosé à 13°'],[30,'cl','sucre de canne'],[20,'cl','alcool de fruit à 40°']],
    prep:['porter l’eau à ébullition et y jeter la menthe fraîche ; donner 5 minutes de bouillon et laisser refroidir la décoction.', 'Filtrer et ajouter le vin, le sucre de canne et l’alcool.', 'Mettre en bouteille et consommer bien frais.'] },

  { id:'vn-vin-de-myrtille', nom:'Vin De Myrtille', cat:'vins', themes:['fruits'], gravure:'fruit', degre:20, mac:28, macTxt:'4 semaines', lot:1.3,
    tags:['myrtilles', 'bon', 'alcool', 'miel'],
    ing:[[1,'kg','myrtilles bien mûres'],[1,'L','bon vin rouge 13°'],[2,'verre','alcool à 40°'],[100,'g','miel liquide']],
    prep:['Faire macérer dans une jarre les myrtilles, le vin, le miel et l’alcool pendant 4 semaines.', 'Passer la préparation au moulin manuel pour faire éclater toutes les baies.', 'Filtrer finement et mettre en bouteilles.'] },

  { id:'vn-vin-aux-pruneaux', nom:'Vin aux Pruneaux', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:18, mac:15, macTxt:'15 jours', lot:4.5,
    tags:['pruneaux', 'bon', 'cognac', 'sucre', 'vanille'],
    ing:[[250,'g','pruneaux (non dénoyautés)'],[1,'bouteille','bon vin rouge 14°'],[1,'verre','cognac ou d’armagnac à 40°'],[125,'g','sucre'],[1,'gousse','vanille fendue en deux']],
    prep:['Choisir des pruneaux de l’année, tendres et non desséchés.', 'Les piquer en plusieurs endroits avec une grosse aiguille.', 'Les mettre dans un bocal avec le sucre, la vanille et l’alcool.', 'Laisser macérer pendant 15 jours en agitant le bocal de temps en temps.', 'Ajouter le vin, laisser encore reposer 8 jours.', 'Retirer la vanille.', 'Presser les pruneaux dans un torchon pour en exprimer le jus.', 'Mélanger ce jus avec le vin, puis filtrer et mettre en bouteille.'] },

  { id:'vn-vin-de-sauge', nom:'Vin De Sauge', cat:'vins', themes:['fleurs', 'plantes'], gravure:'fleur', degre:18, mac:20, macTxt:'20 jours', lot:3.4,
    tags:['bon', 'eau', 'litre', 'sucre', 'feuilles'],
    ing:[[3,'L','bon vin rosé à 13°'],[15,'cl','eau'],[null,'','½ litre d’alcool à 40°'],[300,'g','sucre'],[300,'g','feuilles de sauge']],
    prep:['Faire le sirop avec l’eau et le sucre, puis hacher finement la sauge.', 'Mettre tous les composants dans une jarre et laisser macérer 20 jours.', 'Filtrer finement et mettre en bouteilles.', 'Se bois bien frais.'] },

  { id:'vn-vin-de-sureau', nom:'Vin De Sureau', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:17, mac:10, macTxt:'10 jours', lot:3.4,
    tags:['bon', 'eau', 'litre', 'sucre', 'baie'],
    ing:[[3,'L','bon vin rouge à 13°'],[15,'cl','eau'],[null,'','½ litre d’alcool à 45°'],[300,'g','sucre'],[1,'kg','baie de sureau bien mûres']],
    prep:['Dissoudre le sucre dans l’eau et y faire éclater les baies à petit feu.', 'Passer au tamis la compote obtenue.', 'Dans une jarre mettre tous les composants dans une jarre et laisser macérer 10 jours.', 'Filtrer finement et mettre en bouteilles.', 'Se bois bien frais.'] },

  { id:'vn-vin-blanc-aux-pamplemousses', nom:'Vin Blanc aux Pamplemousses', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:0, macTxt:'—', lot:1.4,
    tags:['pamplemousses', 'sucre', 'vin', 'alcool'],
    ing:[[2,'pièces','pamplemousses bien mûres'],[200,'g','sucre en poudre'],[1,'L','vin blanc sec 13°'],[15,'cl','alcool à 40°']],
    prep:['Mette le sucre dans une casserole et verser le vin.', "Faites chauffer à feu très doux, il ne faut pas que le mélange arrive à ébullition jusqu'à ce que le sucre soit complètement fondu.", 'Presser les 2 pamplemousses.', 'Laisser refroidir le vin sucré et ajouter le jus de pamplemousse.'] },

  { id:'vn-vin-d-abricots', nom:"Vin d'abricots", cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:17, mac:0, macTxt:'4 heure', lot:3.0,
    tags:['bon', 'vingtaine', 'sucre', 'bâton', 'alcool'],
    ing:[[2,'L','bon vin blanc sec 13°'],[1,'pièce',"vingtaine d'abricots frais ou secs"],[400,'g','sucre'],[1,'pièce','petit bâton de cannelle'],[0.75,'L','alcool de fruits à 40°']],
    prep:['Dans une grande casserole, mettre les abricots dénoyautés, ajouter le sucre et la cannelle et verser dessus le vin blanc.', 'Poser le tout sur le feu.', 'Aux premiers bouillons, baisser le feu et laisser frémir 1/4 heure à 20 min.', 'Laisser un peu refroidir avant de couvrir pour éviter la condensation sur le couvercle.', 'Le vin, pour prendre toute sa saveur, doit reposer ainsi plusieurs jours.', "Goûter et ajouter l'alcool de fruits.", 'Rajouter un petit peu de sucre si nécessaire.', 'Filtrer et mettre en bouteilles.', 'Servir très frais.'] },

  { id:'vn-vin-d-amande-amere', nom:"Vin d'Amande Amère", cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:18, mac:28, macTxt:'4 semaines', lot:6.3,
    tags:['bon', 'eau-de-vie', 'sucre', 'vanille', 'huile'],
    ing:[[5,'L','bon vin rouge 13°'],[1,'L','eau de vie 40°'],[400,'g','sucre'],[1,'gousse','vanille fendue en deux'],[15,'gouttes',"huile essentielle d'amande amère (achetée en pharmacie)",false]],
    prep:['Laisser macérer 3 ou 4 semaines tous les ingrédients.', 'Brasser et goûter régulièrement.', 'Rajouter du sucre si besoin.', 'Mettre en bouteille et consommer bien frais.'] },

  { id:'vn-vin-d-aneth', nom:'Vin d’Aneth', cat:'vins', themes:['epices', 'plantes'], gravure:'epice', degre:16, mac:14, macTxt:'2 semaines', lot:4.5,
    tags:['bon', 'alcool', 'sucres', 'graines'],
    ing:[[1,'bouteille','bon vin rouge 13°'],[10,'cl','alcool de fruit à 40°'],[20,'pièces','sucres'],[50,'g','graines d’aneth'],[50,'g','graines d’anis étoilé (ou de badiane)']],
    prep:['Broyer les graines et le sucre puis mélanger ces ingrédients dans le vin.', 'Ajouter l’alcool et laisser mariner au moins 2 semaines.', 'Filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-brugnons', nom:'Vin de Brugnons', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:17, mac:14, macTxt:'deux semaines', lot:1.6,
    tags:['brugnons', 'bon', 'vanille', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[1,'kg','brugnons'],[1,'L','bon vin blanc sec 14 °'],[1,'gousse','vanille'],[20,'cl','eau de vie de fruit 40°'],[250,'g','sucre en poudre'],[15,'cl','eau']],
    prep:['Peler et couper en morceaux ou en tranches les brugnons.', "Mettre dans une casserole les brugnons, le vin, et la vanille fendue, les noyaux éclatés des fruits, avec l'amande.", 'Laisser doucement mijoter 30 minutes et écrasant les fruits.', 'Filtrer la préparation et laisser refroidir.', 'Ajouter alors l’eau de vie et le sirop refroidi préparé avec l’eau et le sucre.', 'Laisser macérer deux semaines et remuant quelques fois puis filtrer et mettre en bouteilles.', 'Laisser vieillir quelques mois avant consommation.'] },

  { id:'vn-vin-de-bruyere', nom:'Vin de Bruyère', cat:'vins', themes:['fleurs', 'epices'], gravure:'fleur', degre:17, mac:0, macTxt:'—', lot:1.4,
    tags:['vin', 'fleurs', 'baies', 'sucre', 'alcool'],
    ing:[[1,'L','vin bon rouge 14°'],[30,'g','fleurs de bruyère'],[15,'g','baies de genièvre'],[200,'g','sucre en poudre'],[10,'cl','alcool de fruit à 40°']],
    prep:['Faire macérer les fleurs dans le vin avec les baies de genièvre hachées.', 'Filtrer et sucrer au goût, mettre en bouteilles et conserver au frais.'] },

  { id:'vn-vin-de-camomille-au-vin-blanc', nom:'Vin de Camomille au Vin Blanc', cat:'vins', themes:['fleurs', 'epices'], gravure:'fleur', degre:18, mac:15, macTxt:'15 jours', lot:1.4,
    tags:['vin', 'camomille', 'sucre', 'verre', 'rhum', 'vanille'],
    ing:[[1,'L','vin blanc sec 13°'],[40,'tête','camomille'],[40,'morceau','sucre'],[1,'pièce','petit verre de'],[15,'cl','rhum blanc agricole 55°'],[0.5,'gousses','vanille']],
    prep:['Mettre tous les ingrédients dans un bocal.', 'Fermer et laisser reposer 15 jours.', 'Filtrer le vin et le garder dans des bouteilles couchées.'] },

  { id:'vn-vin-de-camomille-au-vin-rouge', nom:'Vin de Camomille au Vin Rouge', cat:'vins', themes:['fleurs'], gravure:'fleur', degre:17, mac:15, macTxt:'15 jours', lot:1.3,
    tags:['vin', 'camomille', 'sucres', 'eau-de-vie'],
    ing:[[1,'L','vin rouge 12°'],[20,'tête','camomille'],[30,'morceau','sucres'],[1,'verre','eau de vie']],
    prep:['Mettre tous les ingrédients dans un bocal.', 'Fermer et laisser reposer 15 jours.', 'Filtrer le vin et le garder dans des bouteilles bouchées.'] },

  { id:'vn-vin-de-camomille-au-vin-rouge-et-aux-epices', nom:'Vin de Camomille au Vin Rouge et aux épices', cat:'vins', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:17, mac:30, macTxt:'30 jours', lot:1.4,
    tags:['vin', 'vanille', 'sucre', 'bâton', 'eau-de-vie', 'camomille', 'orange', 'macis'],
    ing:[[1,'L','vin rouge 13°'],[1,'gousse','vanille'],[40,'morceau','sucre'],[null,'','½ bâton de cannelle'],[15,'cl','eau-de-vie'],[40,'fleurs','camomille'],[1,'zeste','orange amère'],[1,'pincée','macis',false]],
    prep:["Prélever le zeste d'une orange non traitée et couper-le en petites lanières.", 'Mettre tous les ingrédients dans un bocal, fermer hermétiquement.', 'Laisser macérer pendant 30 jours dans un endroit frais et sec.', 'Filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-cannelle', nom:'Vin de Cannelle', cat:'vins', themes:['epices', 'plantes'], gravure:'racine', degre:13, mac:30, macTxt:'1 mois', lot:1.3,
    tags:['écorce', 'vin'],
    ing:[[50,'g','écorce de cannelle'],[20,'g','écorce de quinquina'],[1,'L','vin blanc doux 13°']],
    prep:['Faire macérer les écorces et le vin pendant 1 mois.', 'Filtrer et remettre en bouteille.'] },

  { id:'vn-vin-de-cartagene', nom:'Vin de Cartagène', cat:'vins', themes:['fruits'], gravure:'fruit', degre:16, mac:90, macTxt:'3 mois', lot:2.3,
    tags:['moût', 'alcool'],
    ing:[[10,'kg','moût de raisin'],[2,'L','alcool à 40°']],
    prep:['Mettre le moût dans une Jarre et ajouter l’alcool.', 'Le produit doit rester au moins 3 mois dans la jarre et il faut remuer quelque fois.', 'A la fin de la macération bien presser, puis laisser reposer et filtrer.', 'En fonction du type de raisin blanc ou noir la Cartagène est plus ou moins dorée.'] },

  { id:'vn-vin-de-cassis-1', nom:'Vin de Cassis 1', cat:'vins', themes:['fruits'], gravure:'fruit', degre:16, mac:2, macTxt:'2 jours', lot:1.4,
    tags:['cassis', 'bon', 'poids', 'alcool'],
    ing:[[750,'g','cassis'],[1,'L','bon vin rouge 13°'],[null,'','le poids en jus de sucre'],[15,'cl','alcool à 40°']],
    prep:['Ecraser les fruits, ajouter le vin rouge et laisser macérer pendant 2 jours.', 'Passez ensuite le mélange au tamis.', 'Ajouter le sucre et faire cuire à feu doux.', 'Porter à ébullition tout en remuant pendant 5 min.', 'Laisser refroidir la crème de cassis avant de mettre en bouteille.'] },

  { id:'vn-vin-de-cassis-2', nom:'Vin de Cassis 2', cat:'vins', themes:['fruits'], gravure:'fruit', degre:22, mac:2, macTxt:'48 heures', lot:1.8,
    tags:['fruits', 'vin', 'cognac', 'armagnac'],
    ing:[[1,'kg','fruits'],[1,'L','vin à 13°'],[0.5,'L','cognac'],[null,'','armagnac ou de bon alcool blanc par litre de jus']],
    prep:['Faire macérer pendant 48 heures les cassis écrasés avec le vin, passer et égoutter.', 'Faire un bouillon avec un kg de sucre pour un litre de jus.', 'Laisser bouillir 10 minutes, puis refroidir.', "Ajouter le cognac ou l'eau de vie.", 'Se conserve très longtemps.'] },

  { id:'vn-vin-de-cerises-1', nom:'Vin de Cerises 1', cat:'vins', themes:['fruits'], gravure:'fruit', degre:20, mac:30, macTxt:'1 mois', lot:1.6,
    tags:['vin', 'cerises', 'sucre', 'eau', 'kirsch'],
    ing:[[1,'L','vin rouge à 14°'],[44,'feuilles','cerises bien vertes'],[44,'morceau','sucre'],[15,'cl','eau'],[15,'cl','Kirsch']],
    prep:["Dissoudre le sucre dans l'eau tiède.", 'Mélanger tous les ingrédients et laisser macérer 1 mois, filtrer et mettre en bouteille.'] },

  { id:'vn-vin-de-cerises-2', nom:'Vin de Cerises 2', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:17, mac:15, macTxt:'15 jours', lot:3.8,
    tags:['bon', 'cerises', 'eau-de-vie', 'sucre'],
    ing:[[null,'','Pour'],[3,'L','bon vin rouge ou rosé à 14°'],[1,'kg','cerises noires'],[0.5,'L','eau de vie à 40°'],[500,'g','sucre']],
    prep:['Ecraser les cerises avec leurs noyaux.', 'Ce sont les noyaux qui donneront le goût.', 'Les mettre dans une dame-jeanne à gros goulot, ou un grand bocal.', "Y verser le vin, l'alcool et rajouter le sucre.", 'Remuer tous les jours pendant les 15 jours de macération.', 'Filtrer, mettre en bouteilles et laisser un peu vieillir.'] },

  { id:'vn-vin-de-feuilles-de-cerisier', nom:'Vin de feuilles de cerisier', cat:'vins', themes:['epices'], gravure:'epice', degre:17, mac:60, macTxt:'60 jours', lot:2.3,
    tags:['cerisier', 'bon', 'sucre', 'eau-de-vie', 'cannelle', 'vanille', 'macis'],
    ing:[[150,'feuilles','cerisier'],[1,'L','bon vin rouge à 14°'],[1,'L','bon blanc sec'],[300,'g','sucre'],[2,'verre','eau de vie à 40°'],[1,'bâton','cannelle'],[1,'gousse','vanille'],[1,'c. à café','macis']],
    prep:['Cueillir les feuilles après la récolte des cerises.', 'Bien les laver et les essuyer.', 'Dans une jarre ajouter les feuilles, les vins, la cannelle écrasée, la gousse de vanille fendue, le macis et le sucre.', 'Faire macérer 60 jours, puis filtrer et mettre en bouteilles.', 'Il est préférable de laisser vieillir quelques mois à l’ombre.'] },

  { id:'vn-vin-de-chicoree', nom:'Vin de Chicorée', cat:'vins', themes:['plantes'], gravure:'racine', degre:17, mac:5, macTxt:'5 jours', lot:1.4,
    tags:['vin', 'eau-de-vie', 'sucre', 'chicorée'],
    ing:[[1,'L','vin rouge à 14°'],[15,'cl','eau-de-vie à 40°'],[250,'g','sucre'],[100,'g','chicorée en grain']],
    prep:['Faire macérer la chicorée dans le vin pendant 5 jours.', 'Filtrer.', "Faire un sirop avec l'alcool et le sucre et l'ajouter au vin.", 'Filtrer et mettre en bouteille.'] },

  { id:'vn-vin-de-coing', nom:'Vin de Coing', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:17, mac:42, macTxt:'6 semaines', lot:7.3,
    tags:['bon', 'eau-de-vie', 'sucre', 'coings'],
    ing:[[5,'L','bon vin (blanc ou rosé) 14°'],[2,'L','eau de vie à 40°'],[1.4,'kg','sucre'],[2,'kg','coings bien mûrs']],
    prep:['Laver puis couper les coings en morceaux.', 'Tout mettre dans une jarre et laisser macérer le tout pendant 6 semaines, filtrer et mettre en bouteille.'] },

  { id:'vn-vin-de-lectoure', nom:'Vin de Lectoure', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:3, macTxt:'3 jours', lot:2.5,
    tags:['oranges', 'armagnac', 'vin', 'sucre'],
    ing:[[2,'pièces','oranges non traitées'],[25,'cl','armagnac'],[2,'L','vin blanc sec 14°'],[300,'g','sucre']],
    prep:['Faire macérer le zeste des oranges dans l’alcool pendant au moins 4 semaines dans un bocal.', 'Au bout de ce délai, mélanger avec le vin blanc et le sucre dans un grand récipient.', 'Remuer et laisser reposer 3 jours dans le récipient fermé.', 'Ensuite enlever les zestes en les pressant pour en extraire le jus, filtrer la préparation et mettre en bouteilles.'] },

  { id:'vn-vin-d-epines', nom:'Vin d’Epines', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:17, mac:30, macTxt:'un mois', lot:6.3,
    tags:['bon', 'eau-de-vie', 'sucre', 'pousses'],
    ing:[[5,'L','bon vin rosé 14°'],[1,'L','eau de vie 40°'],[1,'kg','sucre'],[500,'g','pousses vertes de prunellier']],
    prep:['Mélanger tous les ingrédients et laisser macérer un mois.', 'Puis filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-feuilles-de-cassis-au-vin-blanc', nom:'Vin de Feuilles de Cassis au Vin Blanc', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:20, macTxt:'20 jours', lot:1.3,
    tags:['vin', 'sucre', 'feuille', 'eau-de-vie'],
    ing:[[1,'L','vin blanc 14°'],[100,'g','sucre'],[2,'poignée','feuille de cassis'],[1,'verre','eau de vie 40°']],
    prep:['Mettre tout les ingrédients dans une jarre.', "Laisser macérer les feuilles dans le vin et l'alcool pendant 20 jours.", 'Filtrer et embouteiller.'] },

  { id:'vn-vin-de-feuilles-de-cassis-au-vin-rouge', nom:'Vin de Feuilles de Cassis au Vin Rouge', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:60, macTxt:'2 mois', lot:1.4,
    tags:['vin', 'cassis', 'eau-de-vie', 'sucre'],
    ing:[[1,'L','vin rouge (13°)'],[200,'feuilles','cassis'],[15,'cl','eau de vie à 40°'],[30,'morceau','sucre']],
    prep:['Laisser macérer le tout pendant 2 mois en remuant de temps en temps.', 'Filtrer en embouteillant.'] },

  { id:'vn-vin-de-feuilles-de-merisier', nom:'Vin de Feuilles de Merisier', cat:'vins', themes:[], gravure:'plante', degre:17, mac:2, macTxt:'48 h', lot:1.3,
    tags:['merisier', 'sucre', 'vin', 'kirsch'],
    ing:[[40,'feuilles','merisier'],[40,'morceau','sucre'],[1,'L','vin rouge'],[1,'verre','kirsch']],
    prep:['Laver les feuilles de merisier et les sécher dans un torchon.', 'Les faire macérer avec le sucre dans le vin pendant 48 h.', 'Passé ce temps, remuer la préparation, la filtrer et y ajouter le kirsch.', 'Embouteiller, boucher et laisser reposer avant consommation.', 'Ce vin se bonifie en vieillissant.'] },

  { id:'vn-vin-de-figues-1', nom:'Vin de Figues 1', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:8, macTxt:'8 jours', lot:6.3,
    tags:['figues', 'sucre', 'acide', 'levure', 'eau'],
    ing:[[2.5,'kg','figues sèches'],[200,'g','sucre semoule'],[5,'g','acide tartrique'],[3,'g','acide citrique'],[5,'g','levure de boulanger en sachet'],[6,'L','eau']],
    prep:['Ecraser les figues au pilon et les mettre dans une bassine émaillée ou un pot en grès.', "Verser dessus l'eau bouillante et remuer longuement pour diluer la pâte de fruits, puis placer au chaud.", 'Passer Faire dissoudre les acides et le sucre dans un peu de jus.', "Verser la dissolution dans la bonbonne avec le reste du jus, ajouter la levure diluée dans un peu d'eau tiède.", 'Mélanger, laisser fermenter 6-8 jours à découvert.', 'Passer et filtrer le vin.', 'Mettre en bouteilles.', 'Conserver couché à la cave 1 an.'] },

  { id:'vn-vin-de-figues-2', nom:'Vin de Figues 2', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:17, mac:4, macTxt:'4 à 5 jours', lot:1.8,
    tags:['vin', 'figues', 'alcool', 'sucre', 'bâton'],
    ing:[[1,'L','vin blanc'],[10,'pièces','figues sèches non traitées'],[50,'cl','alcool de fruits'],[150,'g','sucre ou moins selon le goût'],[1,'pièce','petit bâton de cannelle']],
    prep:['Couper les figues en 2 ou 3 morceaux.', 'Verser le vin dans une casserole.', 'Y ajouter les figues, le sucre et la cannelle.', 'Aux premiers bouillons, baisser le feu et laisser frémir ¼ heure.', "Ajouter l'alcool et laisser reposer 4 à 5 jours.", "Filtrer, il se peut qu'un léger dépôt apparaisse après le filtrage.", 'Laisser reposer et filtrer une seconde fois.', 'Mettre en bouteilles.', 'Se sert bien frais.'] },

  { id:'vn-vin-de-fleurs-d-acacia-robinier', nom:"Vin de Fleurs d'Acacia (Robinier)", cat:'vins', themes:['fleurs'], gravure:'fleur', degre:17, mac:15, macTxt:'15 jours', lot:1.3,
    tags:['fleur', 'vin', 'calvados'],
    ing:[[50,'g','fleur d’acacia'],[1,'L','vin blanc sec 13°'],[1,'verre','calvados et deux cuillères à soupe de miel d’acacia']],
    prep:["Mélanger les fleurs d'Acacia avec le litre de vin blanc.", "Rajouter le verre de calvados et le miel d'acacia.", 'Laisser macérer 15 jours, puis filtrer.', "Servir très frais à l'apéritif."] },

  { id:'vn-vin-rouge-de-framboises', nom:'Vin Rouge de Framboises', cat:'vins', themes:['fruits'], gravure:'fruit', degre:18, mac:15, macTxt:'15 jours', lot:2.4,
    tags:['framboise', 'vin', 'sucre', 'alcool'],
    ing:[[1,'kg','framboise'],[2,'L','vin rouge de Bordeaux à 14°'],[1,'kg','sucre'],[15,'cl','alcool à 40°']],
    prep:["Faire macérer les fruits écrasés dans le vin et l'alcool pendant 15 jours.", 'Retirer les fruits puis filtrer à travers une étamine dans un faitout.', 'Ajouter le sucre et faire chauffer, en remuant sans faire bouillir.', 'Laisser refroidir, remuer et mettre en bouteilles en filtrant de nouveau.'] },

  { id:'vn-vin-blanc-de-framboises', nom:'Vin Blanc de Framboises', cat:'vins', themes:['fruits'], gravure:'fruit', degre:18, mac:1, macTxt:'24 h', lot:3.3,
    tags:['framboises', 'vin', 'alcool', 'sucre'],
    ing:[[1,'kg','framboises bien mûres'],[2.5,'L','vin blanc 13°'],[50,'cl','alcool à 40°'],[1,'kg','sucre']],
    prep:['Dans un pot en terre faire macérer vin et framboises 24 h. presser les fruits sur un tamis.', 'Mettre cuire le jus recueilli avec le sucre, en remuant sans arrêt.', "Remplir jusqu'à ras bord des bouteilles préchauffées et les boucher tout de suite avec des capsules en caoutchouc."] },

  { id:'vn-vin-de-framboises-a-l-ancienne', nom:'Vin de Framboises à l’ancienne', cat:'vins', themes:['fruits', 'historiques'], gravure:'fruit', degre:17, mac:15, macTxt:'15 jours', lot:1.4,
    tags:['bon', 'grand', 'sucre', 'alcool'],
    ing:[[1,'L','bon vin rouge 13°'],[1,'pièce','grand de bol de framboises'],[30,'morceau','sucre'],[15,'cl','alcool à 40°']],
    prep:['Faire macérer les framboises dans le vin en ajoutant le sucre.', 'Laisser reposer 15 jours en remuant souvent pour faciliter la fonte du sucre.', 'Filtrer soigneusement sans écraser les fruits.', "Ajouter l'alcool.", 'Embouteiller et boucher.', 'Ne consommer que plusieurs mois plus tard (si possible ! !).'] },

  { id:'vn-vin-de-feuilles-de-framboisier', nom:'Vin de Feuilles de Framboisier', cat:'vins', themes:[], gravure:'plante', degre:18, mac:180, macTxt:'6 mois', lot:1.3,
    tags:['bon', 'framboisier', "/d'eau", 'sucre'],
    ing:[[null,'','Pour'],[1,'L','bon vin rouge à 13°'],[200,'feuilles','framboisier'],[1,'verre',"1/2 d'eau de vie de fruits"],[200,'g','sucre']],
    prep:['Cueillir les feuilles au printemps quand elles sont jeunes.', 'Faire macérer tous les ingrédients 15 à 20 jours en remuant de temps en temps pour faire fondre le sucre.', 'Retirer les feuilles, filtrer et laisser reposer.', 'Laisser vieillir au moins 6 mois avant de consommer.', 'La préparation donne un vin doux et très parfumé.'] },

  { id:'vn-vin-rouge-de-genievre', nom:'Vin Rouge de Genièvre', cat:'vins', themes:['epices'], gravure:'epice', degre:17, mac:15, macTxt:'15 jours', lot:2.0,
    tags:['baies', 'eau-de-vie', 'bon', 'sucre'],
    ing:[[3,'poignée','baies de genièvre'],[0.25,'L','eau de vie à 40°'],[1.5,'L','bon vin rouge 13°'],[30,'morceau','sucre']],
    prep:["Ecraser les baies de genièvre et les faire macérer dans l'eau-de-vie pendant une semaine.", "Chauffer le vin avec le sucre jusqu'à ébullition et l'ajouter à la macération précédente.", 'Mélanger Laisser reposer 15 jours puis filtrer.', 'Mettre en bouteilles et boucher.'] },

  { id:'vn-vin-blanc-de-genievre', nom:'Vin Blanc de Genièvre', cat:'vins', themes:['epices'], gravure:'epice', degre:17, mac:12, macTxt:'12 jours', lot:1.4,
    tags:['bol', 'bon', 'sucre', 'eau-de-vie'],
    ing:[[1,'pièce','bol de baies de genièvre'],[1,'L','bon vin blanc sec 13°'],[20,'morceau','sucre'],[15,'cl','eau de vie à 40°']],
    prep:['Broyer un peu les baies au mortier.', 'Verser dans un bocal.', 'Ajouter le vin et le sucre.', 'Laisser reposer 12 jours, agiter quelques fois.', "Mettre à cuire la macération le temps d'un bouillon.", 'Reverser dans le bocal le verre d’eau de vie.', 'Après 15 jours, presser sur un tamis, puis filtrer et verser dans des bouteilles.'] },

  { id:'vn-vin-blanc-de-gentiane', nom:'Vin Blanc de Gentiane', cat:'vins', themes:['plantes'], gravure:'racine', degre:17, mac:10, macTxt:'10 jours', lot:1.4,
    tags:['racine', 'bon', 'alcool', 'sucre'],
    ing:[[3,'g','racine de gentiane'],[1,'L','bon vin blanc sec 13°'],[15,'cl','alcool à 40°'],[25,'morceau','sucre']],
    prep:['Nettoyer et brosser la racine, la découper en petits morceaux.', "Mettre à macérer la gentiane dans l'eau de vie pendant 10 jours.", 'Ajouter le sucre dans le vin blanc et bien faire dissoudre.', 'Après 10 jours, filtrer, mettre en bouteilles, bien.'] },

  { id:'vn-vin-rouge-de-gentiane', nom:'Vin rouge de Gentiane', cat:'vins', themes:['plantes'], gravure:'racine', degre:17, mac:10, macTxt:'10 jours', lot:1.4,
    tags:['racine', 'bon', 'eau', 'sucre'],
    ing:[[4,'g','racine de gentiane'],[1,'L','bon vin rouge 14°'],[15,'cl','eau'],[25,'morceau','sucre']],
    prep:['Nettoyer, laver et brosser la racine, la découper en morceaux.', 'La faire infuser dans un bocal avec le vin pendant 10 jours.', 'Passé ce temps, filtrer.', "Faire bouillir l'eau et le sucre.", 'Retirer du feu au premier bouillon et ajouter le sirop refroidi au vin.', 'Mettre en bouteilles et fermer.', 'Laisser reposer quelques jours avant de déguster.'] },

  { id:'vn-vin-de-gingembre', nom:'Vin de Gingembre', cat:'vins', themes:['epices'], gravure:'epice', degre:17, mac:14, macTxt:'deux semaines', lot:1.3,
    tags:['bon', 'eau-de-vie', 'gingembre', 'girofle', 'sucres'],
    ing:[[1,'L','bon vin rouge 13°'],[1,'verre','eau-de-vie à 40°'],[10,'g','gingembre'],[2,'clous','girofle'],[20,'pièces','Sucres']],
    prep:['Casser en tout petits morceaux le gingembre, y ajouter les clous de girofle.', "Faire macérer dans le vin et l'alcool pendant deux semaines puis faire dissoudre le sucre.", 'Filtrer, mettre en bouteilles et laisser vieillir.'] },

  { id:'vn-vin-de-guignolet', nom:'Vin de Guignolet', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:19, mac:15, macTxt:'15 jours', lot:2.8,
    tags:['cerises', 'sucre', 'bon', 'eau-de-vie', 'vanille'],
    ing:[[1,'kg','cerises guigne dénoyautées'],[200,'g','sucre'],[2,'L','bon vin rouge 13°'],[0.5,'L','eau de vie à 40°'],[1,'bâton','vanille']],
    prep:['Faire cuire les cerises avec le sucre pendant 30 minutes.', "Prélever le jus, mettre 1/2 litre d'eau de vie pour 1/2 litre de jus de cerises.", 'Ajouter la vanille et laisser macérer 15 jours.', 'Filtrer et ajouter 2 litres de vin rouge.'] },

  { id:'vn-vin-de-kiwis', nom:'Vin de kiwis', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:120, macTxt:'4 mois', lot:1.6,
    tags:['kiwis', 'bon', 'orange', 'eau-de-vie', 'sucre', 'eau'],
    ing:[[1,'kg','Kiwis'],[1,'L','bon vin blanc sec 13°'],[1,'pièce','orange non traitée'],[20,'cl','eau de vie de fruit à 40°'],[250,'g','sucre en poudre'],[10,'cl','eau']],
    prep:['Peler et couper en morceaux ou en tranches les kiwis.', 'Préparer le sirop avec le sucre et l’eau puis laisser refroidir.', 'Mette dans une jarre les fruits, l’alcool, le sirop et le zeste de l’orange.', 'Fermer et laisser macérer 1 mois à l’ombre.', 'Passer et filtre la préparation, mettre en bouteilles et laisser gentiment vieillir 3 ou 4 mois avant de consommer.'] },

  { id:'vn-vin-de-litchis', nom:'Vin de Litchis', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:16, mac:60, macTxt:'2 mois', lot:2.7,
    tags:['litchis', 'bon', 'gousse', 'rhum', 'sirop'],
    ing:[[1,'kg','litchis'],[2,'L','bon vin blanc sec 13°'],[1,'pièce','belle gousse de vanille'],[30,'cl','rhum ambré 40°'],[10,'cl','sirop de canne']],
    prep:['Peler les litchis et ôter les noyaux, mettre les fruits dans une jarre avec la vanille fendue, le vin, le sirop, le rhum.', 'Fermer et laisser macérer 30 jours à l’ombre, en remuant régulièrement.', 'Passer et filtrer la préparation, mettre en bouteilles et laisser reposer 2 mois avant consommation.'] },

  { id:'vn-vin-de-mai', nom:'Vin de Mai', cat:'vins', themes:['fleurs', 'plantes'], gravure:'fleur', degre:16, mac:30, macTxt:'un mois', lot:1.4,
    tags:['vin', 'fleur', 'sucre', 'alcool'],
    ing:[[1,'L','vin blanc sec 13°'],[60,'g','fleur d’aspérule'],[80,'g','sucre'],[10,'cl','alcool à 45°']],
    prep:['Mettre à macérer les fleurs dans un litre de vin blanc bouillant.', 'Dissoudre le sucre et laisser refroidir le mélange.', "Ajouter l'alcool.", 'Passer finement et mettre en bouteilles, ne pas consommer avant un mois.', 'Le vin de mai devient légèrement pétillant.', 'Il est à boire comme apéritif.'] },

  { id:'vn-vin-blanc-de-mirabelle', nom:'Vin Blanc de Mirabelle', cat:'vins', themes:['fruits'], gravure:'fruit', degre:18, mac:28, macTxt:'4 semaines', lot:6.3,
    tags:['vin', 'bonne', 'mirabelles', 'sucre'],
    ing:[[5,'L','vin blanc sec 13°'],[1,'L','bonne eau de vie 40°'],[2,'kg','mirabelles'],[700,'g','sucre']],
    prep:['Ouvrir les fruits et casser une poignée de noyaux.', 'Mélanger tous les ingrédients puis laisser macérer 4 semaines dans une jarre.', 'Filtrer et mettre en bouteilles.', "Il s'améliore énormément en vieillissant."] },

  { id:'vn-vin-de-noyer', nom:'Vin de Noyer', cat:'vins', themes:[], gravure:'plante', degre:19, mac:10, macTxt:'10 jours', lot:5.3,
    tags:['bon', 'feuilles', 'eau-de-vie', 'sucre'],
    ing:[[4,'L','bon vin rouge 13°'],[400,'g','feuilles de noyer'],[1,'L','eau de vie'],[800,'g','sucre']],
    prep:['Laisser macérer les feuilles et le vin pendant 10 jours, Dissoudre le sucre dans le mélange puis ajouter l’eau de vie.', 'Laisser reposer 10 jours de plus, puis filtrer et mettre en bouteilles.'] },

  { id:'vn-vin-de-noix-aux-epices', nom:'Vin de Noix aux épices', cat:'vins', themes:['fruits'], gravure:'fruit', degre:17, mac:90, macTxt:'3 mois', lot:4.5,
    tags:['quarantaine'],
    ing:[[1,'pièce','quarantaine de noix vertes']],
    prep:["Cueillez les noix vertes juste formées à l'intérieur.", 'Coupez-les avec leur brou en deux ou quatre morceaux.', "Mettez-les dans un grand bocal avec le vin, la vanille, la cannelle, le macis et l'eau-de-vie.", 'Bouchez le bocal et laissez macérer pendant 3 mois, en remuant de temps en temps le mélange.', 'Une fois cette période écoulée, filtrez, ajoutez le sucre et laissez-le fondre pendant quelques heures.', 'Mettez en bouteilles et bouchez.', "Cette eau de noix s'améliore en vieillissant."] },

  { id:'vn-vin-de-noix-aux-clous-de-girofle', nom:'Vin de Noix aux Clous de Girofle', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:20, mac:60, macTxt:'2 mois', lot:2.8,
    tags:['noix', 'girofle', 'vin', 'eau-de-vie', 'sucre'],
    ing:[[20,'pièces','noix vertes'],[10,'clous','girofle'],[2,'L','vin rouge corsé 14°'],[0.5,'L','eau-de-vie à 40°'],[600,'g','sucre blanc']],
    prep:['Coupez les noix en plusieurs morceaux selon leur grosseur.', 'Les mettre dans un grand bocal.', "Ajoutez les clous de girofle broyés, puis versez l'eau-de vie.", 'Les noix doivent baigner complètement.', 'Fermez le bocal, le placer dans un endroit tempéré, laissez macérer 2 mois.', "Lorsque l'eau de vie a pris une teinte brun foncé, presque noire, ajoutez le vin rouge dans le bocal, puis le sucre.", 'Rebouchez et laissez macérer encore une semaine.', 'Filtrez alors le contenu du bocal.', 'Mettez le vin de noix en bouteilles et bouchez-les soigneusement.', "Entreposez-les dans un endroit frais, si possible dans l'obscurité.", 'Patientez 2 mois avant de consommer.'] },

  { id:'vn-vin-de-peches', nom:'Vin de Pêches', cat:'vins', themes:['fruits', 'fleurs'], gravure:'fruit', degre:17, mac:14, macTxt:'deux semaines', lot:1.4,
    tags:['pêcher', 'bon', 'eau-de-vie', 'sucre'],
    ing:[[50,'feuilles','pêcher non traité'],[1,'L','bon vin rosé 13°'],[15,'cl','eau-de-vie'],[250,'g','sucre en poudre']],
    prep:['Dans un récipient, mettre tous les ingrédients, fermer avec un film plastique ou un couvercle hermétique, laisser macérer.', 'Après deux semaines de macération, filtrer et mettre en bouteille.', "Cette recette donne un rosé apéritif très finement parfumé, c'est un délice servi bien frais."] },

  { id:'vn-vin-de-pissenlits', nom:'Vin de Pissenlits', cat:'vins', themes:['fruits', 'fleurs', 'epices'], gravure:'fruit', degre:18, mac:1, macTxt:'24 heures', lot:4.3,
    tags:['eau', 'poignée', 'sucre', 'raisins', 'oranges', 'girofle'],
    ing:[[4,'L','eau bouillante'],[1,'pièce','belle poignée de fleurs de pissenlits fraîches'],[1.5,'kg','sucre en poudre'],[500,'g','raisins secs'],[3,'pièces','oranges et 3 citrons non traités'],[9,'clous','girofle']],
    prep:["Verser l'eau bouillante sur les fleurs et laisser infuser 24 heures, ajouter le sucre, les raisins et les fruits coupés en morceaux, les clous de girofle.", 'Remuer le tout, tous les jours pendant 3 semaines.', 'Filtrer et mettre dans des bouteilles bouchées avec du coton.', 'Au bout de 40 jours, filtrer à nouveau.', 'Mettre en bouteilles bouchées Sans alcool.'] },

  { id:'vn-vin-de-pousses-d-epine', nom:"Vin de Pousses d'Epine", cat:'vins', themes:[], gravure:'plante', degre:19, mac:28, macTxt:'4 semaines', lot:5.3,
    tags:['eau-de-vie', 'bon', 'poignée', 'sucre'],
    ing:[[1,'L','eau-de-vie à 40°'],[4,'L','bon vin rouge 13°'],[1,'pièce',"très grosse poignée de jeune pousse d'épine noire"],[750,'g','sucre']],
    prep:["Préparez la recette du vin Pousse d'épine directement en bonbonne.", 'Mélanger tous les ingrédients et laisser macérer pendant 4 semaines en remuant régulièrement.', 'Filtrer et mettre en bouteilles.', 'Se déguste très frais.'] },

  { id:'vn-vin-de-prunelles', nom:'Vin de Prunelles', cat:'vins', themes:['fruits'], gravure:'fruit', degre:4, mac:365, macTxt:'1 à 2 an', lot:4.3,
    tags:['prunelles', 'sucre', 'cuil.', 'jus', 'raisins', 'eau'],
    ing:[[null,'','1.kg de prunelles'],[1,'kg','sucre'],[2,'pièces','cuil. à café de levure de bière'],[null,'','le jus de 1/2 citron'],[100,'g','raisins'],[4,'L','eau']],
    prep:['Mélanger tous ces ingrédients après avoir écrasé un peu les prunelles.', "Laisser vieillir le mélange au minimum 6 mois dans un tonnelet ou dans une grande bouteille en plastique d'eau minérale (de 5 litres).Prendre soin de laisser le bouchon entrouvert pour laisser les gaz de fermentation s'échapper.", "Filtrer à l'issue des 6 mois.", "Ce vin rosé légèrement pétillant devient encore meilleur si on a la patience d'attendre quelques mois voir si la bouteille es bien bouchée 1 à 2 ans."] },

  { id:'vn-vin-de-prele', nom:'Vin de Prêle', cat:'vins', themes:['plantes'], gravure:'plante', degre:20, mac:21, macTxt:'3 semaines', lot:5.8,
    tags:['feuilles', 'eau-de-vie', 'miel', 'bon'],
    ing:[[500,'g','feuilles de prêle fraîche ou'],[50,'g','feuilles sèches'],[1.5,'L','eau de vie à 40 °'],[1,'kg','miel'],[4,'L','bon vin blanc 13°']],
    prep:['Hacher les feuilles de prêle, puis faire macérer 3 semaines dans de l’eau de vie.', 'Dissoudre le miel dans le vin, tout mélanger et laisser 15 jours de plus.', 'Passer la préparation et mettre au repos dans une jarre quelques semaines.', 'Filtrer et mettre en bouteilles.', 'La plante a des propriétés reminéralisantes et diurétiques qui aident à soulager les articulations.'] },

  { id:'vn-vin-de-roses', nom:'Vin de Roses', cat:'vins', themes:['fleurs'], gravure:'fleur', degre:13, mac:20, macTxt:'20 jours', lot:1.3,
    tags:['bon', 'pétales', 'sucres'],
    ing:[[1,'L','bon vin rosé 13°'],[60,'pièces','pétales de roses rouges'],[20,'pièces','sucres']],
    prep:['Oter les pétales et les passer brièvement sous l’eau, il est nécessaire d’avoir des roses non traitées.', 'Couper la partie blanche des pétales et les mettre sur une surface plane pendant 1 semaine pour les faire sécher.', 'Mettre les pétales dans un bocal, ajouter le vin et le sucre.', 'Bien boucher et laisser au soleil 20 jours.', 'Filtrer et mettre en bouteille, laisser reposer 2 semaines avant de consommer bien frais.'] },

  { id:'vn-vin-de-trouspinette', nom:'Vin de Trouspinette', cat:'vins', themes:['fruits'], gravure:'fruit', degre:18, mac:42, macTxt:'6 semaines', lot:12.3,
    tags:['bon', 'eau-de-vie', 'sucre', 'poignées'],
    ing:[[10,'L','bon vin rouge 13°'],[2,'L','eau de vie 40°'],[2,'kg','sucre'],[10,'pièces','grosses poignées de feuilles de pêcher']],
    prep:['Laisser macérer tous les ingrédients pendants 6 semaines puis filtrer et mettre en bouteilles.', 'Laisser vieillir quelques mois avant de consommer bien frais.'] },

  { id:'vn-vin-d-eucalyptus', nom:'Vin d’Eucalyptus', cat:'vins', themes:['plantes'], gravure:'plante', degre:16, mac:20, macTxt:'20 jours', lot:1.3,
    tags:['bon', 'feuilles', 'sucres.'],
    ing:[[1,'L','bon vin rouge à 13°'],[50,'g','feuilles d’eucalyptus broyées'],[20,'pièces',"sucres. 10 cl d'alcool à 40°"]],
    prep:['Faire macérer les feuilles et le sucre dans le vin rouge pendant 20 jours.', 'Filtrer et mettre en bouteille, se boit bien frais.'] },

  { id:'vn-vin-d-hysope', nom:'Vin D’hysope', cat:'vins', themes:['epices', 'plantes'], gravure:'epice', degre:20, mac:7, macTxt:'une semaine', lot:6.8,
    tags:['feuilles', 'mélisse', 'menthe', 'impératoire', 'baies', 'eau-de-vie', 'bon', 'sucre', 'faut'],
    ing:[[100,'g','feuilles d’hysope'],[50,'g','mélisse'],[50,'g','menthe'],[50,'g','impératoire (benjoin)'],[100,'g','baies de genièvre'],[1.5,'L','eau de vie à 40°'],[4,'L','bon vin rouge ou blanc à 13°'],[1,'L','sucre de canne liquide'],[null,'','il faut alors diviser les quantités par 2']],
    prep:['Ciseler finement toutes les feuilles, concasser le genièvre et tout plonger dans l’alcool pendant 8 semaines.', 'Filtrer alors le mélange et l’ajouter au vin dans lequel on aura fait dilluer le sucre.', 'Laisser décanter une semaine, filtrer de nouveau et mettre en bouteilles.'] },

  { id:'vn-vin-rouge-d-orange', nom:"Vin Rouge d'Orange", cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:16, mac:20, macTxt:'20 jours', lot:1.3,
    tags:['vin', 'peaux', 'alcool', 'sucre', 'bâton'],
    ing:[[1,'L','vin rouge 14°'],[5,'pièces',"peaux d'oranges non traitées"],[1,'verre','alcool de fruits à 40°'],[20,'morceau','sucre'],[1,'pièce','petit bâton de cannelle']],
    prep:["Faire macérer les peaux d'orange dans le vin pendant 20 jours.", 'Puis retirer un peu de ce liquide pour y faire fondre le sucre.', "Mélanger le tout avec le verre d'alcool.", 'Ajouter la cannelle.', 'Filtrer et mettre en bouteille.', "S'améliore beaucoup avec un temps de repos.", 'On peut, avec cette même recette, remplacer les oranges par des pamplemousses, des clémentines ou des mandarines en adaptant le nombre de peaux.'] },

  { id:'vn-vin-blanc-d-orange', nom:"Vin Blanc d'Orange", cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:16, mac:30, macTxt:'30 jours', lot:4.5,
    tags:['blanc', 'sucre', 'zestes', 'cannelle', 'armagnac'],
    ing:[[1,'bouteille','blanc liquoreux 13°'],[100,'g','sucre en poudre'],[null,'','les zestes de 2 oranges non traitées'],[2,'bâton','cannelle'],[100,'ml','Armagnac ou de cognac']],
    prep:['Faire macérer 30 jours tous les ingrédients dans un bocal fermé.', 'Oter les zestes et la cannelle et remettre en bouteilles.'] },

  { id:'vn-vin-rouge-epice-chaud-glogi-finlande', nom:'Vin Rouge Epicé Chaud Glögi (Finlande)', cat:'vins', themes:['fruits', 'epices'], gravure:'fruit', degre:15, mac:0, macTxt:'—', lot:2.3,
    tags:['vin', 'amandes', 'raisins', 'girofle', 'cannelle', 'sucre', 'vodka'],
    ing:[[2,'L','vin rouge 13°'],[20,'g','amandes pelées'],[20,'g','raisins secs'],[6,'clous','girofle'],[2,'bâton','cannelle'],[30,'morceau','sucre'],[1,'verre','vodka']],
    prep:['Verser le vin rouge dans une casserole.', 'Ajouter cannelle, clous de girofle et sucre.', 'Chauffer le mélange et laisser sur le feu pendant 10 minutes sans faire bouillir.', 'Verser la vodka, filtrer et servir chaud avec quelques amandes et raisins au fond du verre.'] },

  { id:'vn-vin-fortifiant-au-persil', nom:'Vin Fortifiant au Persil', cat:'vins', themes:['fleurs', 'plantes'], gravure:'fleur', degre:15, mac:7, macTxt:'une semaine', lot:1.4,
    tags:['bon', 'vinaigre', 'miel', 'persil', 'alcool'],
    ing:[[1,'L','bon vin rouge 13°'],[2,'c. à s.','vinaigre balsamique'],[300,'g','miel d’acacia'],[1,'bouquet','persil frais (20 brins, tiges et feuilles)'],[10,'cl','alcool de fruits']],
    prep:['Cuire à petits bouillon le persil dans le vin et le vinaigre, Passer le mélange et laisser refroidir un peu.', 'Dissoudre le miel et ajouter l’alcool.', 'Laisser reposer et mettre en bouteilles.', 'Se prend en cure d’une semaine à raison d’un petit verre avant chaque repas.', 'C’est un fortifiant cardiaque.'] },

  { id:'vn-vin-tonique-du-pape', nom:'Vin Tonique du Pape', cat:'vins', themes:['fleurs', 'epices'], gravure:'fleur', degre:27, mac:42, macTxt:'6 semaines', lot:2.3,
    tags:['vin', 'eau-de-vie', 'girofle', 'cannelle', 'cuillère', 'cardamome', 'racine', 'baies', 'miel'],
    ing:[[1,'L','vin doux blanc ou rouge 13°'],[1,'L','eau de vie 40 °'],[20,'clous','girofle'],[4,'bâton','cannelle'],[1,'pièce','petite cuillère de macis'],[5,'graines','cardamome'],[1,'pièce','racine de gingembre frais'],[30,'pièces','baies de genièvre'],[500,'g','miel d’acacia']],
    prep:['Broyer au pilon les épices et tout mélanger dans l’alcool.', 'Laisser macérer 6 semaines.', 'Dissoudre le miel dans le vin et ajouter la macération filtrée.', 'Verser le tout dans une jarre en verre et exposer 1 mois au soleil.', 'Filtrer et mettre en bouteilles.', 'Laisser reposer quelques semaines avant de consommer.', 'Cette préparation est un fortifiant à prendre en début d’hiver, faire un cure de quelques jours, prendre un petit verre le matin.'] },
];
RECETTES_SITE.forEach(o => DATA.push(_recette(o)));
/* Spécimen photographié de chaque recette (image complète, affichée comme une
   photographie collée sur la page). */
DATA.forEach(r => {
  r.image = (typeof IMAGES_SITE !== 'undefined' && IMAGES_SITE[r.id]) || null;
});

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
const deacc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = s => deacc(s).toLowerCase();
/* mots-vides ignorés pour affiner la recherche par ingrédient */
const STOPWORDS = new Set(['de', 'd', 'des', 'du', 'la', 'le', 'les', 'l', 'a', 'au', 'aux',
  'en', 'et', 'ou', 'un', 'une', 'pour', 'par', 'sur', 'sans', 'avec']);

/* Recherche précise, pondérée, sensible aux ingrédients (ET strict sur les mots). */
function rechercher(query, filtres = {}) {
  const tokens = norm(query).split(/\s+/).filter(t => t && !STOPWORDS.has(t));
  const out = [];
  for (const r of DATA) {
    if (filtres.categorie && r.categorie !== filtres.categorie) continue;
    if (filtres.theme && !r.themes.includes(filtres.theme)) continue;
    if (filtres.alcool && bandeAlcool(r.degre).id !== filtres.alcool) continue;
    if (filtres.duree && bandeDuree(r.macerationJours).id !== filtres.duree) continue;
    if (!tokens.length) { out.push({ r, score: 0 }); continue; }
    const cn = norm(r.nom);
    const ci = norm(r.ingredients.map(i => i.nom).join(' '));
    const ct = norm((r.tags || []).join(' '));
    const cc = norm(catNom(r.categorie));
    const ce = norm((r.themes || []).map(t => (THEMES.find(x => x.id === t) || {}).nom || t).join(' '));
    let score = 0, ok = true;
    for (const tk of tokens) {
      let s = 0;
      if (cn.includes(tk)) s += cn.split(/\s+/).includes(tk) ? 12 : 8;
      if (ci.includes(tk)) s += 5;
      if (ct.includes(tk)) s += 3;
      if (cc.includes(tk)) s += 2;
      if (ce.includes(tk)) s += 2;
      if (!s) { ok = false; break; }   // chaque mot doit matcher quelque part
      score += s;
    }
    if (ok) out.push({ r, score });
  }
  out.sort((a, b) => b.score - a.score || a.r.nom.localeCompare(b.r.nom));
  return out.map(o => o.r);
}

/* ---------------------------------------------------------------------
   6 bis. RECALCUL DE LOT — mise à l'échelle « intelligente »
   Met à l'échelle la quantité structurée ET les quantités glissées dans
   les phrases (ex. « 400 g par litre » est un ratio : on n'y touche pas ;
   « à 40° » est un degré : on n'y touche pas non plus).
--------------------------------------------------------------------- */
const _RE_QTE_TXT = /(\d+(?:[.,]\d+)?)\s*(kg|g|mg|cl|ml|l)\b/gi;
function scaleNom(nom, f) {
  return String(nom).replace(_RE_QTE_TXT, (m, num, unit, off, str) => {
    const after = str.slice(off + m.length);
    if (/^\s*°/.test(after)) return m;                    // degré (40°)
    if (/^\s*(?:par\s+l|\/\s*l)/i.test(after)) return m;  // ratio « par litre »
    return fmt(parseFloat(num.replace(',', '.')) * f) + ' ' + unit;
  });
}
function scaleIngredient(ing, f) {
  const nom = scaleNom(ing.nom, f);
  let qte, adj = false;
  if (ing.qte == null) qte = '—';
  else if (ing.scalable) qte = fmt(ing.qte * f) + (ing.unite ? ' ' + ing.unite : '');
  else { qte = fmt(ing.qte) + (ing.unite ? ' ' + ing.unite : ''); adj = true; }
  return { qte, nom, adj };
}

/* ---------------------------------------------------------------------
   6 ter. ÉRUDITION (latin, numérotation) — aucun ornement vectoriel
--------------------------------------------------------------------- */
const _ROOT_LAT = {
  hypocras: 'Vinum hippocraticum', vins: 'Vinum aromaticum', liqueurs: 'Liquor spirituosus',
  cremes: 'Crema dulcis', ratafias: 'Ratafia domesticum', rhums: 'Saccharum spiritus'
};
function latinBinom(r) {
  const racine = _ROOT_LAT[r.categorie] || 'Liquor';
  const ba = bandeAlcool(r.degre).id;
  const epith = ba === 'fort' ? 'spiritus validus' : ba === 'faible' ? 'lenis' : 'ad mensam';
  return racine + ' · ' + epith;
}
function romain(n) {
  if (!n) return '';
  const u = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = ''; for (const [v, sym] of u) { while (n >= v) { s += sym; n -= v; } } return s;
}
function numPlanche(r) { return DATA.indexOf(r) + 1; }

/* ---------------------------------------------------------------------
   7. RENDU DES VUES
--------------------------------------------------------------------- */
const app = () => $('#app');

/** Carte de recette réutilisable. */
/** Légère rotation stable (déduite de l'id) : « posé à la main », non aléatoire au rendu. */
function _rot(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (((h % 13) - 6) * 0.12).toFixed(2);
}
function carteRecette(r) {
  const fav = STORE.isFavori(r.id) ? 'is-fav' : '';
  return `
    <a class="carte" href="#/recette/${r.id}" style="--rot:${_rot(r.id)}deg">
      <span class="carte__gravure${r.image ? ' carte__gravure--photo' : ''}" aria-hidden="true">${r.image
        ? `<img class="carte__photo" src="${r.image}" alt="" loading="lazy">`
        : '<span class="carte__nospec">❧</span>'}</span>
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
  const n = DATA.length;
  const cnt = id => DATA.filter(r => r.categorie === id).length;
  const cntT = id => DATA.filter(r => r.themes.includes(id)).length;
  const chapitres = CATEGORIES.map((c, i) =>
    `<a class="chapter-tab" href="#/categorie/${c.id}"><span class="n">${romain(i + 1)} · ${cnt(c.id)}</span>${c.nom}</a>`).join('');
  const rubriques = THEMES.map(t =>
    `<a class="chapter-tab" href="#/theme/${t.id}"><span class="n">${cntT(t.id)}</span>${t.nom}</a>`).join('');

  return `
    <header class="cover">
      <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>

      <div class="eyebrow">Boîte d'herbier · Recueil manuscrit</div>
      <h1>Codex<span class="amp">des Liqueurs &amp;</span>Hypocras</h1>
      <p class="sub">${n} recettes anciennes de cordiaux, ratafias, crèmes &amp; vins d'office, montées et annotées comme autant de planches d'un herbier.</p>

      <div class="divider"></div>

      <div class="plate-label">
        <span class="tape" style="left:50%; transform:translateX(-50%) rotate(-2deg);"></span>
        <div class="row"><span class="k">Collection</span><span>Liqueurs &amp; Hypocras d'office</span></div>
        <div class="row"><span class="k">Pièces inventoriées</span><span>${n} planches</span></div>
        <div class="row"><span class="k">Classement</span><span>Liqueurs · Crèmes · Ratafias · Hypocras · Vins · Rhums</span></div>
        <div class="row"><span class="k">Conservation</span><span>Carton ivoire, lieu sec &amp; sombre</span></div>
      </div>

      <form class="search" role="search" onsubmit="return false;">
        <input id="rechercheAccueil" type="search" placeholder="Chercher une planche… (cassis, noix, sureau)" aria-label="Recherche globale" autocomplete="off">
        <button type="submit">Feuilleter</button>
      </form>

      <nav class="chapters">${chapitres}</nav>
      <p class="marginalia">— ouvrir avec soin, le papier est fragile —</p>
    </header>

    <h2 class="titre-section">Rubriques</h2>
    <nav class="chapters chapters--rubriques">${rubriques}</nav>

    <h2 class="titre-section">Au fil des planches</h2>
    <div class="grille-recettes">${DATA.slice(0, 8).map(carteRecette).join('')}</div>
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

/** Vue : fiche recette — planche d'herbier. */
function vueRecette(r) {
  const escAttr = s => String(s).replace(/"/g, '&quot;');
  const np = numPlanche(r);
  const assoc = recettesAssociees(r);
  const fav = STORE.isFavori(r.id);
  const ba = bandeAlcool(r.degre);
  const macBig = r.macerationJours >= 60 ? fmt(Math.round(r.macerationJours / 30 * 10) / 10)
    : (r.macerationJours || '—');
  const macUnit = r.macerationJours >= 60 ? 'mois' : 'jours';
  const macTl = (r.timeline.find(t => /mac[ée]r/i.test(t.phase)) || {}).duree
    || (r.macerationJours ? r.macerationJours + ' jours' : '');

  const lignesIng = r.ingredients.map(i => {
    const d = scaleIngredient(i, 1);
    return `<tr data-q="${i.qte == null ? '' : i.qte}" data-u="${escAttr(i.unite || '')}" data-s="${i.scalable ? 1 : 0}" data-n="${escAttr(i.nom)}">`
      + `<td class="qte${d.adj ? ' adj' : ''}">${d.qte}</td><td class="nom">${i.nom}</td></tr>`;
  }).join('');

  const specimen = r.image
    ? `<div class="specimen-frame">
         <span class="tape t1"></span><span class="tape t2"></span><span class="tape t3"></span><span class="tape t4"></span>
         <img src="${r.image}" alt="Spécimen — ${escAttr(r.nom)}" loading="lazy">
       </div>`
    : `<div class="specimen-empty">— spécimen non relevé —</div>`;

  return `
    ${ariane([
      { label: 'Accueil', href: '#/' },
      { label: catNom(r.categorie), href: `#/categorie/${r.categorie}` },
      { label: r.nom }
    ])}

    <div class="sheet-head">
      <div class="codex">Planche extraite du Codex</div>
      <div class="rule"></div>
    </div>

    <article class="plate">
      <div class="stain s1"></div><div class="stain s2"></div><div class="stain s3"></div>

      <div class="plate-banner">
        <div class="left">
          <div class="institut">Codex des Liqueurs &amp; Hypocras · ${catNom(r.categorie)}</div>
          <div class="planche-no">Planche n&deg; ${romain(np)} — ${catNom(r.categorie)}</div>
        </div>
        <div class="right">Réf. ${r.id}<br>${ba.label}</div>
      </div>

      <div class="plate-body">
        <div class="specimen-mount">
          ${specimen}
          ${macTl ? `<div class="pen a">macération<br>${macTl} <span class="arrow">↘</span></div>` : ''}
        </div>

        <aside class="cartouche">
          <span class="tape ct"></span>
          <div class="genus">${latinBinom(r)}</div>
          <div class="vern">${r.nom}</div>
          <div class="id-rule"></div>
          <div class="specs">
            <div class="spec"><div class="v">${r.degre}&deg;</div><div class="l">Degré</div></div>
            <div class="spec"><div class="v">${macBig}&nbsp;${macUnit}</div><div class="l">Macération</div></div>
            <div class="spec"><div class="v"><input id="lotVol" class="lot-input" type="number" min="0.1" step="0.1" value="${fmt(r.lot)}" data-base="${r.lot}" aria-label="Volume du lot en litres"></div><div class="l">Lot · litres</div></div>
          </div>
          <dl>
            <div class="line"><dt>Catégorie</dt><dd>${catNom(r.categorie)}</dd></div>
            ${r.themes.length ? `<div class="line"><dt>Rubriques</dt><dd>${r.themes.map(t => (THEMES.find(x => x.id === t) || {}).nom || t).join(', ')}</dd></div>` : ''}
            <div class="line"><dt>Tenue</dt><dd>${ba.label}</dd></div>
            <div class="line"><dt>Réf.</dt><dd>${r.id}</dd></div>
          </dl>
          <span class="stamp">Vérifié · Codex</span>
          <div class="cartouche-actions no-print">
            <button class="btn btn-fav ${fav ? 'is-fav' : ''}" data-fav="${r.id}">✦ ${fav ? 'Favori' : 'Garder'}</button>
            <button class="btn btn--ghost" onclick="window.print()">Imprimer</button>
          </div>
        </aside>
      </div>

      <div class="recipe">
        ${r.histoire ? `<p class="lede">${r.histoire}</p>` : ''}

        <div class="recipe-grid">
          <div>
            <h2 class="section-title">Matière · <span id="lotCap">pour ${fmt(r.lot)} litre${r.lot > 1 ? 's' : ''}</span></h2>
            <table class="ingredients" id="ingrTable">
              <thead><tr><th class="q">Quantité</th><th>Ingrédient</th></tr></thead>
              <tbody>${lignesIng}</tbody>
            </table>

            <h2 class="section-title" style="margin-top:32px">Chronologie</h2>
            <div class="timeline">${r.timeline.map(t => `<div class="ph"><div class="p">${t.phase}</div><div class="d">${t.duree}</div></div>`).join('')}</div>
          </div>

          <div>
            <h2 class="section-title">Procédé</h2>
            <ol class="prep">${r.preparation.map(e => `<li>${e}</li>`).join('')}</ol>
            ${r.conseils ? `<p class="pen-note">${r.conseils}</p>` : ''}
          </div>
        </div>

        ${r.proprietes ? `<h2 class="section-title" style="margin-top:44px">Vertus &amp; observations</h2>
        <div class="lore"><p><span class="label">Propriétés</span>${r.proprietes}</p></div>` : ''}

        ${r.dicton ? `<p class="dicton">${r.dicton}<span class="src">Dicton du Codex</span></p>` : ''}
      </div>

      <div class="plate-foot">
        <span>Codex des Liqueurs &amp; Hypocras</span>
        <span>Planche n&deg; ${romain(np)} · folio ${np}</span>
      </div>
    </article>

    ${assoc.length ? `
    <section class="voisines no-print">
      <h2 class="section-title">Planches voisines</h2>
      <div class="grille-recettes">${assoc.map(carteRecette).join('')}</div>
    </section>` : ''}
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
  if (btn) btn.addEventListener('click', () => {
    const actif = STORE.toggleFavori(btn.dataset.fav);
    btn.classList.toggle('is-fav', actif);
    btn.innerHTML = `<span aria-hidden="true">✦</span> ${actif ? 'Favori' : 'Ajouter aux favoris'}`;
    majSidebar();
  });

  // Recalcul de lot EN DIRECT sur le tableau d'ingrédients
  const vol = $('#lotVol');
  const table = $('#ingrTable');
  if (vol && table) {
    const base = parseFloat(vol.dataset.base) || 1;
    const recalc = () => {
      const v = parseFloat(String(vol.value).replace(',', '.'));
      if (!v || v <= 0) return;
      const f = v / base;
      $$('tbody tr', table).forEach(tr => {
        if (!('n' in tr.dataset)) return;
        const q = tr.dataset.q, u = tr.dataset.u || '', s = tr.dataset.s === '1';
        const cq = $('.qte', tr), cn = $('.nom', tr);
        if (!cq) return;
        if (q === '') { cq.textContent = '—'; }
        else if (s) { cq.textContent = fmt(parseFloat(q) * f) + (u ? ' ' + u : ''); cq.classList.remove('adj'); }
        else { cq.textContent = fmt(parseFloat(q)) + (u ? ' ' + u : ''); cq.classList.add('adj'); }
        if (cn) cn.textContent = scaleNom(tr.dataset.n || cn.textContent, f);
      });
      const disc = $('#lotDisc'); if (disc) disc.textContent = fmt(v) + ' L';
      const cap = $('#lotCap'); if (cap) cap.textContent = 'pour ' + fmt(v) + ' litre' + (v > 1 ? 's' : '');
    };
    vol.addEventListener('input', recalc);
    vol.addEventListener('change', recalc);
  }
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
