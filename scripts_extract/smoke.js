const fs = require('fs'), vm = require('vm');
const notes = fs.existsSync('notes.js') ? fs.readFileSync('notes.js', 'utf8') : '';
const code = notes + '\n' + fs.readFileSync('script.js', 'utf8');

function mkEl() {
  const el = {
    style: {}, dataset: {}, children: [],
    _html: '',
    set innerHTML(v) { this._html = String(v); },
    get innerHTML() { return this._html; },
    set textContent(v) { this._text = String(v); },
    get textContent() { return this._text || ''; },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    querySelector() { return mkEl(); }, querySelectorAll() { return []; },
    closest() { return null; }, focus() {}, scrollIntoView() {}, click() {},
    insertAdjacentHTML() {}, remove() {},
  };
  return el;
}
const doc = {
  _els: {},
  getElementById(id) { return this._els[id] || (this._els[id] = mkEl()); },
  querySelector() { return mkEl(); }, querySelectorAll() { return []; },
  createElement() { return mkEl(); },
  createDocumentFragment() { return mkEl(); },
  addEventListener(ev, cb) { if (ev === 'DOMContentLoaded') this._ready = cb; },
  body: mkEl(), documentElement: mkEl(), title: '',
};
const win = {
  addEventListener() {}, removeEventListener() {},
  matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; },
  location: { hash: '', href: '' }, scrollTo() {}, print() {},
  localStorage: { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
};
const sandbox = {
  console, document: doc, window: win, location: win.location,
  localStorage: win.localStorage,
  sessionStorage: { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
  navigator: { userAgent: 'node' },
  setTimeout, clearTimeout, requestAnimationFrame: (f) => setTimeout(f, 0),
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox);
  // déclencher l'init comme le navigateur
  if (doc._ready) doc._ready();
  console.log('init() OK — pas d\'exception');
  // exercer quelques routes (accueil + fiches générées)
  const routes = ['', '#/categorie/vins', '#/categorie/ratafias',
    '#/recette/vn-vin-de-trouspinette', '#/recette/rt-ratafia-de-semences-chaudes-ou-eau-des-sept-graines-1730',
    '#/recette/hy-hypocras-aux-epices-2', '#/recette/lq-liqueur-de-cacao'];
  const router = sandbox.router;
  let ok = 0;
  for (const r of routes) {
    win.location.hash = r;
    if (typeof router === 'function') { router(); ok++; }
  }
  console.log('routes exercées sans erreur:', ok, '/', routes.length);
  console.log('SMOKE OK');
} catch (e) {
  console.error('SMOKE ÉCHEC:', e && e.stack || e);
  process.exit(1);
}
