// Prototype + tests des deux fonctionnalités, validés sur les vraies données.
const fs = require('fs'), vm = require('vm');
let code = fs.readFileSync('script.js', 'utf8');
const cut = code.indexOf('RECETTES_SITE.forEach(o => DATA.push(_recette(o)));');
const dc = code.slice(0, cut) + 'RECETTES_SITE.forEach(o => DATA.push(_recette(o)));\n;globalThis.__D=DATA;globalThis.__C=CATEGORIES;globalThis.__T=THEMES;';
const sb = { console }; sb.globalThis = sb; vm.createContext(sb); vm.runInContext(dc, sb);
const DATA = sb.__D, CATEGORIES = sb.__C, THEMES = sb.__T;

// ---------- utilitaires ----------
const deacc = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = s => deacc(String(s || '')).toLowerCase();
function fmt(n) { const r = Math.round(n * 1000) / 1000; return Number.isInteger(r) ? String(r) : String(r).replace('.', ','); }

// ---------- 1) RECALCUL : mise à l'échelle d'une quantité textuelle dans un nom ----------
// scinde aussi les nombres « intégrés » aux phrases (sauf degrés ° et ratios « par litre »).
const UNIT_SCALE = /(\d+(?:[.,]\d+)?)\s*(kg|g|mg|cl|ml|l)\b/gi;
function scaleNom(nom, f) {
  return nom.replace(UNIT_SCALE, (m, num, unit, off, str) => {
    // ne pas toucher un degré : « 40° »
    const after = str.slice(off + m.length);
    if (/^\s*°/.test(after)) return m;
    // ne pas toucher un ratio « 400 g par litre / par L / /l »
    if (/^\s*(?:par\s+l|\/\s*l)/i.test(after)) return m;
    const v = parseFloat(num.replace(',', '.')) * f;
    return fmt(v) + ' ' + unit;
  });
}
// rendu d'une ligne d'ingrédient recalculée
function scaleIngredient(ing, f) {
  const nom = scaleNom(ing.nom, f);
  let qte;
  if (ing.qte == null) qte = '—';
  else if (ing.scalable) qte = fmt(ing.qte * f) + ' ' + ing.unite;
  else qte = fmt(ing.qte) + ' ' + ing.unite + ' (à doser au goût)';
  return { qte, nom };
}

// ---------- 2) RECHERCHE précise, pondérée, par ingrédient ----------
function rechercher(query, filtres = {}) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  const bandeA = d => d < 20 ? 'faible' : d <= 35 ? 'moyen' : 'fort';
  const bandeD = j => j < 30 ? 'court' : j <= 90 ? 'moyen' : 'long';
  const catNom = id => (CATEGORIES.find(c => c.id === id) || {}).nom || id;
  const out = [];
  for (const r of DATA) {
    if (filtres.categorie && r.categorie !== filtres.categorie) continue;
    if (filtres.theme && !r.themes.includes(filtres.theme)) continue;
    if (filtres.alcool && bandeA(r.degre) !== filtres.alcool) continue;
    if (filtres.duree && bandeD(r.macerationJours) !== filtres.duree) continue;
    if (!tokens.length) { out.push({ r, score: 0 }); continue; }
    const champs = {
      nom: norm(r.nom),
      ing: norm(r.ingredients.map(i => i.nom).join(' ')),
      tags: norm((r.tags || []).join(' ')),
      cat: norm(catNom(r.categorie)),
      themes: norm((r.themes || []).map(t => (THEMES.find(x => x.id === t) || {}).nom || t).join(' ')),
    };
    let score = 0, tousTrouves = true;
    for (const tk of tokens) {
      let s = 0;
      if (champs.nom.includes(tk)) s += champs.nom.split(/\s+/).includes(tk) ? 12 : 8;
      if (champs.ing.includes(tk)) s += 5;
      if (champs.tags.includes(tk)) s += 3;
      if (champs.cat.includes(tk)) s += 2;
      if (champs.themes.includes(tk)) s += 2;
      if (s === 0) { tousTrouves = false; break; } // ET strict : chaque mot doit matcher
      score += s;
    }
    if (tousTrouves) out.push({ r, score });
  }
  out.sort((a, b) => b.score - a.score || a.r.nom.localeCompare(b.r.nom));
  return out.map(o => o.r);
}

// ================= TESTS =================
function t(label, got, expect) { console.log((got === expect ? 'OK  ' : 'FAIL ') + label + ' => ' + got + (got === expect ? '' : ' (attendu ' + expect + ')')); }

console.log('--- RECALCUL ---');
t('400 g par litre fini reste inchangé', scaleNom('sucre (au moins 400 g par litre fini)', 2), 'sucre (au moins 400 g par litre fini)');
t('alcool à 40° non scalé', scaleNom('eau-de-vie à 40°', 2), 'eau-de-vie à 40°');
t('100 g feuilles x2', scaleNom('100 g de feuilles de pêcher', 2), '200 g de feuilles de pêcher');
t('1,5 L x2 (virgule)', scaleNom('1,5 L de rhum', 2), '3 L de rhum');
t('vin à 13° non scalé', scaleNom('vin rouge à 13°', 3), 'vin rouge à 13°');
const ig = { qte: 1.25, unite: 'kg', nom: 'cassis frais bien mûr', scalable: true };
console.log('  scaleIngredient x2:', JSON.stringify(scaleIngredient(ig, 2)));
const igNonScal = { qte: 1, unite: 'pointe', nom: 'muscade', scalable: false };
console.log('  non-scalable x2:', JSON.stringify(scaleIngredient(igNonScal, 2)));

console.log('\n--- RECHERCHE ---');
const r1 = rechercher('cassis');
console.log('« cassis » :', r1.length, 'résultats ; top3:', r1.slice(0, 3).map(r => r.nom));
const r2 = rechercher('cassis cannelle');
console.log('« cassis cannelle » (ET) :', r2.length, '; top3:', r2.slice(0, 3).map(r => r.nom));
const r3 = rechercher('genepi');
console.log('« genepi » (sans accent) :', r3.length, '; top3:', r3.slice(0, 3).map(r => r.nom));
const r4 = rechercher('noix de muscade');
console.log('« noix de muscade » :', r4.length, '; top3:', r4.slice(0, 3).map(r => r.nom));
const r5 = rechercher('xyzqklmw');
console.log('inexistant :', r5.length, '(attendu 0)');
