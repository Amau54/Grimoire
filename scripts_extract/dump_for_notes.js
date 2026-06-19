const fs = require('fs'), vm = require('vm');
let code = fs.readFileSync('script.js', 'utf8');
const cut = code.indexOf('RECETTES_SITE.forEach(o => DATA.push(_recette(o)));');
const dataCode = code.slice(0, cut) + 'RECETTES_SITE.forEach(o => DATA.push(_recette(o)));\n;globalThis.__DATA=DATA;';
const sb = { console }; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(dataCode, sb);
const DATA = sb.__DATA;
const need = DATA.filter(r => !r.histoire).map(r => ({
  id: r.id, nom: r.nom, categorie: r.categorie, themes: r.themes,
  gravure: r.gravure, degre: r.degre, macerationJours: r.macerationJours,
  ingredients: r.ingredients.map(i => i.nom),
}));
fs.writeFileSync('scripts_extract/_data/notes_todo.json', JSON.stringify(need, null, 1));
// un exemple de note existante (recette DATA) pour le ton
const ex = DATA.find(r => r.histoire && r.dicton);
fs.writeFileSync('scripts_extract/_data/notes_example.json', JSON.stringify({
  nom: ex.nom, histoire: ex.histoire, proprietes: ex.proprietes, conseils: ex.conseils, dicton: ex.dicton
}, null, 1));
console.log('recettes sans notes:', need.length, '/', DATA.length);
const byCat = {}; need.forEach(r => byCat[r.categorie] = (byCat[r.categorie] || 0) + 1);
console.log('par catégorie:', JSON.stringify(byCat));
