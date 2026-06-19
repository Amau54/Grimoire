const fs = require('fs');
const vm = require('vm');
const notes = fs.existsSync('notes.js') ? fs.readFileSync('notes.js', 'utf8') : '';
const imgs = fs.existsSync('images.js') ? fs.readFileSync('images.js','utf8') : '';
let code = notes + '\n' + fs.readFileSync('script.js', 'utf8');
// ne garder que la portion de construction des données (sans le DOM)
const cut = code.indexOf('RECETTES_SITE.forEach(o => DATA.push(_recette(o)));');
if (cut === -1) { console.error('marqueur introuvable'); process.exit(1); }
const dataCode = code.slice(0, cut) + 'RECETTES_SITE.forEach(o => DATA.push(_recette(o)));\n;globalThis.__DATA=DATA;globalThis.__CATS=CATEGORIES;globalThis.__THEMES=THEMES;';
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
const DATA = sandbox.__DATA;
const CATS = new Set(sandbox.__CATS.map(c => c.id));
const THEMES = new Set(sandbox.__THEMES.map(t => t.id));
const GRAV = new Set(['fruit', 'fleur', 'epice', 'plante', 'racine']);

let errs = [];
const ids = new Set();
const byCat = {};
for (const r of DATA) {
  byCat[r.categorie] = (byCat[r.categorie] || 0) + 1;
  if (!r.id) errs.push('id manquant: ' + r.nom);
  if (ids.has(r.id)) errs.push('ID EN DOUBLE: ' + r.id);
  ids.add(r.id);
  if (!r.nom) errs.push('nom manquant: ' + r.id);
  if (!CATS.has(r.categorie)) errs.push('catégorie invalide ' + r.categorie + ' (' + r.id + ')');
  if (!GRAV.has(r.gravure)) errs.push('gravure invalide ' + r.gravure + ' (' + r.id + ')');
  for (const th of r.themes || []) if (!THEMES.has(th) && th !== 'plantes') errs.push('thème inconnu ' + th + ' (' + r.id + ')');
  if (typeof r.degre !== 'number') errs.push('degré non numérique (' + r.id + ')');
  if (typeof r.macerationJours !== 'number') errs.push('macerationJours non numérique (' + r.id + ')');
  if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) errs.push('ingrédients vides (' + r.id + ')');
  if (!Array.isArray(r.preparation) || r.preparation.length === 0) errs.push('préparation vide (' + r.id + ')');
  if (!Array.isArray(r.timeline) || r.timeline.length === 0) errs.push('timeline vide (' + r.id + ')');
  if (!r.histoire || !r.proprietes || !r.conseils || !r.dicton) errs.push('notes incomplètes (' + r.id + ')');
  for (const ing of r.ingredients || []) {
    if (typeof ing.nom !== 'string' || !ing.nom) errs.push('ing.nom invalide (' + r.id + ')');
    if (!('qte' in ing) || !('unite' in ing)) errs.push('ing structure (' + r.id + ')');
  }
}
console.log('TOTAL recettes:', DATA.length);
console.log('par catégorie:', JSON.stringify(byCat));
console.log('IDs uniques:', ids.size);
console.log('erreurs:', errs.length);
errs.slice(0, 40).forEach(e => console.log('  ✗', e));
process.exit(errs.length ? 1 : 0);
