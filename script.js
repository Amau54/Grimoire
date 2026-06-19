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
