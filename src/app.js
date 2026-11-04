/* ───────── Utilidades ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 });
const money = n => '$ ' + nf.format(Math.round(Number(n) || 0));
const fmtDate = ms => ms ? new Date(ms).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : '';
const onOffer = p => Number(p.oldPrice) > Number(p.price) && Number(p.price) > 0;
const pct = p => Math.round((1 - p.price / p.oldPrice) * 100);
const stockOf = p => (p.stock === null || p.stock === undefined || p.stock === '') ? Infinity : Number(p.stock);
const catOf = p => CATS[p.category] || Object.values(CATS)[0] || { name: 'Otros', tint: '#EEF0F4', acc: '#2347F5', art: 'box' };
const lum = hex => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || ''); if (!m) return 0; const [r, g, b] = [1, 2, 3].map(i => parseInt(m[i], 16) / 255); return .2126 * r + .7152 * g + .0722 * b; };
const digits = s => String(s || '').replace(/\D/g, '');
const uyPhone = s => { const d = digits(s); if (d.startsWith('598')) return d; if (d.startsWith('0')) return '598' + d.slice(1); return d; };

const fmtPhone = d => { d = digits(d); return /^598\d{8}$/.test(d) ? `+598 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : (d ? '+' + d : ''); };

/* Texto simple -> HTML: "## Título", "- viñeta", párrafos separados por línea en blanco */
function richText(t) {
  let h = '', ul = false;
  const close = () => { if (ul) { h += '</ul>'; ul = false; } };
  for (const raw of String(t || '').split('\n')) {
    const l = raw.trim();
    if (!l) { close(); continue; }
    if (l.startsWith('## ')) { close(); h += `<h2>${esc(l.slice(3))}</h2>`; }
    else if (l.startsWith('- ')) { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${esc(l.slice(2))}</li>`; }
    else { close(); h += `<p>${esc(l)}</p>`; }
  }
  close(); return h;
}

/* ───────── Búsqueda: sin tildes, varias palabras, sinónimos y orden por relevancia ───────── */
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const SYN = [
  ['notebook', 'laptop', 'portatil', 'netbook'], ['celular', 'telefono', 'smartphone', 'movil', 'celu'],
  ['auricular', 'auriculares', 'auris', 'headset', 'cascos', 'audifonos'], ['heladera', 'refrigerador', 'nevera', 'frigorifico'],
  ['pc', 'computadora', 'compu', 'ordenador', 'desktop'], ['mouse', 'raton'], ['monitor', 'pantalla'], ['ram', 'memoria'],
  ['ssd', 'disco', 'almacenamiento'], ['lavarropas', 'lavadora'], ['microondas', 'microonda'], ['freidora', 'airfryer', 'fritadora'],
  ['aspiradora', 'robot'], ['cargador', 'cargadores'], ['teclado', 'keyboard'], ['procesador', 'cpu'],
  ['placa', 'gpu', 'grafica'], ['parlante', 'parlantes', 'altavoz', 'bocina']
];
const variantsOf = t => {
  const g = SYN.find(grp => grp.includes(t) || (t.length >= 3 && grp.some(w => w.startsWith(t))));
  return g ? [...new Set([t, ...g])] : [t];
};
/* Distancia de edición (con intercambio de letras vecinas) para tolerar errores de tipeo */
function lev(a, b) {
  const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}
function fuzzyHit(v, text) {
  if (v.length < 4) return false;
  const max = v.length >= 7 ? 2 : 1;
  return text.split(' ').some(w => w.length >= 3 && (lev(v, w) <= max || (w.length > v.length && lev(v, w.slice(0, v.length)) <= max)));
}
function searchProducts(q, list) {
  const groups = norm(q).split(' ').filter(Boolean).map(variantsOf);
  if (!groups.length) return [];
  const out = [];
  for (const p of list) {
    const f = { name: norm(p.name), brand: norm(p.brand), cat: norm(catOf(p).name + ' ' + (p.sub || '')), rest: norm((p.description || '') + ' ' + (p.specs || '')) };
    const flat = (f.name + f.brand + f.rest).replace(/ /g, '');
    let score = 0, ok = true;
    for (const g of groups) {
      let best = 0;
      for (const v of g) {
        const re = new RegExp('(^| )' + v);
        if (re.test(f.name)) best = Math.max(best, 6);
        if (re.test(f.brand) || re.test(f.cat)) best = Math.max(best, 4);
        if (re.test(f.rest)) best = Math.max(best, 1);
        if (v.length >= 3 && flat.includes(v)) best = Math.max(best, 2);
      }
      if (!best) for (const v of g) if (fuzzyHit(v, f.name + ' ' + f.brand + ' ' + f.cat)) { best = 3; break; }
      if (!best) { ok = false; break; }
      score += best;
    }
    if (ok) out.push({ p, score });
  }
  return out.sort((a, b) => b.score - a.score || (b.p.createdAt || 0) - (a.p.createdAt || 0)).map(x => x.p);
}

/* ───────── Estado ───────── */
const state = {
  products: [], banners: [], orders: [], settings: { ...DEFAULT_SETTINGS },
  loaded: { products: false, banners: false }, error: '',
  cart: lsGet('nodo_cart') || {}, cartStep: 'cart', doneCode: '', orderErr: '', sending: false,
  route: { name: 'home' }, q: '', sub: '', sort: 'rel', onlyOffers: false, inStock: false,
  hero: 0, fsError: false, user: null, authReady: false, loginErr: '',
  admin: { tab: 'products', q: '', cat: '' },
  track: { code: '', res: null, err: '', loading: false, auto: '' }, checkoutAt: 0, deepDone: '', prevHash: '#/'
};
let DB = null;
const app = $('#app');

/* Catálogo de ejemplo: se muestra solo si Firebase falla o todavía no tiene productos.
   Para desactivarlo: window.SAMPLE_FALLBACK = false en firebase-config.js */
const SAMPLE = seedProducts();
const useSample = () => window.SAMPLE_FALLBACK !== false && DB?.mode === 'firebase' && state.loaded.products && (state.fsError || state.products.length === 0);
const activeProducts = () => (useSample() ? SAMPLE : state.products).filter(p => p.active !== false);
const shownBanners = () => (useSample() && !state.banners.length ? SEED_BANNERS : state.banners);
const saveCart = () => lsSet('nodo_cart', state.cart);

const S = () => state.settings;
const contactNum = () => digits(S().contactWhatsapp);
const waLink = msg => `https://wa.me/${contactNum()}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
const zones = () => (Array.isArray(S().shippingZones) ? S().shippingZones : []).filter(z => z && z.name);
const maxPer = () => Math.max(1, Number(S().maxPerProduct) || 10);
const maxUnits = () => Math.max(1, Number(S().maxUnits) || 30);
const OTRA = '__otra';
/* Costo de envío según la localidad elegida (retiro = sin costo; "otra localidad" = a coordinar) */
function shippingFor(c) {
  if (c.delivery !== 'envio') return { cost: 0, label: 'Sin costo', known: true };
  const z = zones().find(x => x.name === c.zone);
  if (!z) return { cost: 0, label: 'A coordinar', known: false };
  const cost = Number(z.cost) || 0;
  return { cost, label: cost > 0 ? money(cost) : 'Sin costo', known: true };
}

/* ───────── Carrito ───────── */
function cartLines() {
  const out = [];
  for (const [id, q] of Object.entries(state.cart)) {
    const p = activeProducts().find(x => x.id === id);
    if (!p) continue;
    const qty = Math.min(Number(q) || 0, stockOf(p), maxPer());
    if (qty > 0) out.push({ p, qty, sub: p.price * qty });
  }
  return out;
}
const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
const cartTotal = () => cartLines().reduce((a, l) => a + l.sub, 0);

/* Cambia la cantidad respetando stock, tope por producto y tope de unidades por pedido. Devuelve el motivo si recortó. */
function setQty(id, qty) {
  const p = activeProducts().find(x => x.id === id);
  if (!p) return '';
  let reason = '';
  qty = Math.max(0, qty);
  if (qty > stockOf(p)) { qty = stockOf(p); reason = 'stock'; toast(`Solo quedan ${stockOf(p)} unidades de este producto.`, { bad: true }); }
  if (qty > maxPer()) { qty = maxPer(); reason = 'per'; toast(`Podés llevar hasta ${maxPer()} unidades de cada producto por pedido. Si necesitás más, escribinos por WhatsApp.`, { bad: true }); }
  const others = cartLines().filter(l => l.p.id !== id).reduce((a, l) => a + l.qty, 0);
  if (qty > Math.max(0, maxUnits() - others)) { qty = Math.max(0, maxUnits() - others); reason = 'units'; toast(`Cada pedido admite hasta ${maxUnits()} unidades en total. Para cantidades mayores, escribinos por WhatsApp.`, { bad: true }); }
  if (qty === 0) delete state.cart[id]; else state.cart[id] = qty;
  saveCart(); renderCartBadge(); if ($('#dlgCart').open) renderCart();
  return reason;
}
function addToCart(id, n = 1) {
  const p = activeProducts().find(x => x.id === id);
  if (!p) return;
  if (stockOf(p) <= 0) return toast('Este producto no tiene stock.', { bad: true });
  if (setQty(id, (state.cart[id] || 0) + n)) return;
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast('Agregado al carrito', { label: 'Ver carrito', fn: openCart });
}
function renderCartBadge() {
  $('#cartN').textContent = $('#cartFabN').textContent = cartCount();
  $('#cartT').textContent = money(cartTotal());
}

/* ───────── Toasts y confirmación ───────── */
function toast(msg, opt = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (opt.bad ? ' bad' : '');
  el.setAttribute('role', 'status');
  el.innerHTML = `<span>${esc(msg)}</span>` + (opt.label ? `<button type="button">${esc(opt.label)}</button>` : '');
  if (opt.label) el.querySelector('button').onclick = () => { opt.fn(); el.remove(); };
  const box = $('#toasts');
  box.replaceChildren(el); // un solo aviso a la vez
  try { box.hidePopover(); box.showPopover(); } catch { /* sin popover: queda sobre la página */ }
  setTimeout(() => el.remove(), opt.label ? 4500 : 3500);
}
function askConfirm(msg, okLabel = 'Eliminar') {
  return new Promise(res => {
    const d = $('#dlgConfirm');
    $('#confirmMsg', d).textContent = msg;
    $('#confirmOk', d).textContent = okLabel;
    const done = v => { d.close(); res(v); };
    $('#confirmOk', d).onclick = () => done(true);
    $('#confirmNo', d).onclick = () => done(false);
    d.oncancel = () => res(false);
    d.showModal();
  });
}

/* ───────── Ruteo ───────── */
function parseHash() {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (a === 'admin') return { name: 'admin' };
  if (a === 'c' && b) return { name: 'cat', cat: b };
  if (a === 'ofertas') return { name: 'offers' };
  if (a === 'p' && b) return { name: 'home', open: decodeURIComponent(b) };
  if (['contacto', 'servicios', 'condiciones', 'privacidad'].includes(a)) return { name: 'page', page: a };
  if (a === 'pedido') return { name: 'track', code: decodeURIComponent(b || '').toUpperCase() };
  return { name: 'home' };
}
window.addEventListener('hashchange', () => {
  state.route = parseHash(); state.sub = ''; state.q = ''; state.sort = 'rel'; state.onlyOffers = false; state.inStock = false; state.deepDone = ''; state.track.auto = null;
  $('#q').value = ''; hideSugg();
  if ($('#dlgProduct').open) $('#dlgProduct').close();
  render(); window.scrollTo(0, 0);
});

/* ───────── Piezas de la tienda ───────── */
function card(p) {
  const offer = onOffer(p), out = stockOf(p) <= 0, c = catOf(p);
  return `<article class="card ${out ? 'is-out' : ''}">
    <button type="button" class="card-img" data-act="open" data-id="${esc(p.id)}" style="--tint:${c.tint}" aria-label="Ver ${esc(p.name)}">
      <img loading="lazy" src="${esc(imgOf(p))}" alt="" class="${(p.images && p.images[0]) || p.image ? 'photo' : ''}">
      ${offer ? `<span class="tag">-${pct(p)}%</span>` : ''}${out ? '<span class="out">Sin stock</span>' : ''}
    </button>
    <div class="card-b">
      <p class="card-meta">${esc(p.brand || c.name)}</p>
      <h3 class="card-t"><button type="button" class="linkish" data-act="open" data-id="${esc(p.id)}">${esc(p.name)}</button></h3>
      <div class="price">${offer ? `<s>${money(p.oldPrice)}</s>` : ''}<strong>${money(p.price)}</strong></div>
      <button type="button" class="btn btn-primary" data-act="add" data-id="${esc(p.id)}" ${out ? 'disabled' : ''}>${out ? 'Sin stock' : 'Agregar al carrito'}</button>
    </div>
  </article>`;
}
const skeletons = n => `<div class="grid">${'<div class="skel"></div>'.repeat(n)}</div>`;

function sortList(list, keepRelevance) {
  if (keepRelevance && state.sort === 'rel') return [...list];
  const s = state.sort, byNew = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  const l = [...list];
  if (s === 'asc') l.sort((a, b) => a.price - b.price);
  else if (s === 'desc') l.sort((a, b) => b.price - a.price);
  else if (s === 'disc') l.sort((a, b) => (onOffer(b) ? pct(b) : 0) - (onOffer(a) ? pct(a) : 0));
  else if (s === 'az') l.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else l.sort(byNew);
  return l;
}

function heroHTML() {
  const bs = shownBanners().filter(b => b.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!bs.length) return '';
  if (state.hero >= bs.length) state.hero = 0;
  const slides = bs.map((b, i) => {
    const bg = b.color || '#0E1A2B', dark = lum(bg) > .6, fg = dark ? '#0E1A2B' : '#fff';
    const art = b.image ? `<img class="photo" src="${esc(b.image)}" alt="">` : `<img src="${esc(artUri(b.art || 'laptop', dark ? '#0E1A2B' : '#FFD21F'))}" alt="">`;
    const href = b.link === 'ofertas' ? '#/ofertas' : (CATS[b.link] ? '#/c/' + b.link : '#/');
    return `<div class="slide ${i === state.hero ? 'on' : ''}" style="--bg:${esc(bg)};--fg:${fg}" role="group" aria-label="Oferta ${i + 1} de ${bs.length}">
      <div><h2>${esc(b.title)}</h2>${b.subtitle ? `<p>${esc(b.subtitle)}</p>` : ''}${b.cta ? `<a class="btn ${dark ? 'btn-ink' : 'btn-tag'}" href="${href}">${esc(b.cta)}</a>` : ''}</div>
      <div class="slide-art">${art}</div></div>`;
  }).join('');
  const cur = bs[state.hero], darkDots = lum(cur.color || '#0E1A2B') > .6;
  const dots = bs.length > 1 ? `<div class="dots ${darkDots ? 'dark' : ''}">${bs.map((_, i) => `<button type="button" data-act="hero" data-i="${i}" aria-label="Ir a la oferta ${i + 1}" aria-current="${i === state.hero}"></button>`).join('')}</div>` : '';
  const arrows = bs.length > 1 ? `<button type="button" class="hero-nav prev" data-act="heroPrev" aria-label="Oferta anterior"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" class="hero-nav next" data-act="heroNext" aria-label="Oferta siguiente"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>` : '';
  return `<section class="hero wrap" aria-roledescription="carrusel" aria-label="Ofertas destacadas">${slides}${arrows}${dots}</section>`;
}
function setHero(i) {
  const bs = shownBanners().filter(b => b.active !== false);
  if (!bs.length) return;
  state.hero = (i + bs.length) % bs.length;
  $$('.slide').forEach((s, k) => s.classList.toggle('on', k === state.hero));
  const cur = [...bs].sort((a, b) => (a.order || 0) - (b.order || 0))[state.hero];
  const dots = $('.dots');
  if (dots) {
    dots.classList.toggle('dark', lum(cur.color || '#0E1A2B') > .6);
    $$('button', dots).forEach((b, k) => b.setAttribute('aria-current', k === state.hero));
  }
}
setInterval(() => {
  if (!['home', 'offers'].includes(state.route.name) || state.q || document.hidden || $('.hero:hover, .hero:focus-within')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setHero(state.hero + 1);
}, 6500);

function storeHome() {
  const ps = activeProducts();
  if (state.error) return errorBox();
  if (!state.loaded.products) return heroHTML() + `<section class="sec wrap">${skeletons(8)}</section>`;
  const offers = sortList(ps.filter(onOffer)).slice(0, 8);
  const tiles = Object.entries(CATS).map(([k, c]) => {
    const n = ps.filter(p => p.category === k).length;
    if (c.image) return `<a class="tile has-img" href="#/c/${esc(k)}" style="--tint:${c.tint}"><img src="${esc(c.image)}" alt="" loading="lazy"><h3>${esc(c.name)}</h3><span class="sr">${n} productos</span></a>`;
    return `<a class="tile" href="#/c/${esc(k)}" style="--tint:${c.tint}"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><img src="${esc(artUri(c.art, c.acc))}" alt=""><span class="sr">${n} productos</span></a>`;
  }).join('');
  let html = heroHTML() + `<section class="sec wrap"><div class="sec-h"><h2>Categorías destacadas</h2></div><div class="tiles">${tiles}</div></section>`;
  if (offers.length) html += `<section class="sec wrap"><div class="sec-h"><h2>Productos en oferta</h2><span class="rail-nav"><button type="button" class="btn btn-line btn-sm" data-act="railPrev" aria-label="Anteriores">‹</button><button type="button" class="btn btn-line btn-sm" data-act="railNext" aria-label="Siguientes">›</button><a href="#/ofertas">Ver todas</a></span></div><div class="grid rail" id="rail">${offers.map(card).join('')}</div></section>`;
  for (const [k, c] of Object.entries(CATS)) {
    const l = sortList(ps.filter(p => p.category === k)).slice(0, 4);
    if (l.length) html += `<section class="sec wrap"><div class="sec-h"><h2>${c.name}</h2><a href="#/c/${k}">Ver todo en ${c.name}</a></div><div class="grid">${l.map(card).join('')}</div></section>`;
  }
  const br = (state.settings.branches || []).filter(b => b && b.name);
  if (br.length) html += `<section class="sec wrap"><div class="sec-h"><h2>${br.length > 1 ? 'Sucursales' : 'Nuestro local'}</h2></div><div class="branches">${br.map(b => `<a class="branch" href="${/^https?:\/\//i.test(b.link || '') ? esc(b.link) : '#/contacto'}" ${/^https?:\/\//i.test(b.link || '') ? 'target="_blank" rel="noopener"' : ''}>${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy">` : ''}<span><b>${esc(b.name)}</b>${b.address ? `<small>${esc(b.address)}</small>` : ''}</span></a>`).join('')}</div></section>`;
  if (!ps.length) html += `<section class="sec wrap"><div class="empty"><h3>Estamos cargando el catálogo</h3><p>Todavía no hay productos publicados. Volvé en unos minutos.</p></div></section>`;
  return html;
}
function errorBox() {
  return `<section class="sec wrap"><div class="empty"><h3>No pudimos cargar la tienda</h3><p>${esc(state.error)}</p><button type="button" class="btn btn-primary" onclick="location.reload()">Reintentar</button></div></section>`;
}

const PAGE_SIZE = 12;
function listing({ title, crumb, list, subs, relevance }) {
  if (state.error) return errorBox();
  let l = list;
  if (state.sub) l = l.filter(p => p.sub === state.sub);
  if (state.onlyOffers) l = l.filter(onOffer);
  if (state.inStock) l = l.filter(p => stockOf(p) > 0);
  l = sortList(l, relevance);
  const sig = [state.route.name, state.route.cat || '', state.q, state.sub, state.onlyOffers, state.inStock, state.sort].join('|');
  if (state.pageSig !== sig) { state.pageSig = sig; state.page = 1; }
  const pages = Math.max(1, Math.ceil(l.length / PAGE_SIZE)); state.page = Math.min(Math.max(1, state.page || 1), pages);
  const shown = l.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
  const pager = pages > 1 ? `<nav class="pager" aria-label="Páginas">${Array.from({ length: pages }, (_, i) => `<button type="button" data-act="page" data-i="${i + 1}" ${state.page === i + 1 ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : '';
  const chips = subs && subs.length ? `<div class="chips" role="group" aria-label="Subcategorías"><button type="button" class="chip" data-act="sub" data-v="" aria-pressed="${!state.sub}">Todo</button>${subs.map(s => `<button type="button" class="chip" data-act="sub" data-v="${esc(s)}" aria-pressed="${state.sub === s}">${esc(s)}</button>`).join('')}</div>` : '';
  const tb = `<div class="toolbar"><span class="count" aria-live="polite">${l.length} ${l.length === 1 ? 'producto' : 'productos'}</span>
    <label><input type="checkbox" data-act="onlyOffers" ${state.onlyOffers ? 'checked' : ''}> Solo ofertas</label>
    <label><input type="checkbox" data-act="inStock" ${state.inStock ? 'checked' : ''}> Con stock</label>
    <label>Ordenar <select data-act="sort">${[['rel', 'Más nuevos'], ['asc', 'Menor precio'], ['desc', 'Mayor precio'], ['disc', 'Mayor descuento'], ['az', 'A a Z']].map(([v, t]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>`;
  const body = !state.loaded.products ? skeletons(8)
    : l.length ? `<div class="grid">${shown.map(card).join('')}</div>${pager}`
    : `<div class="empty"><h3>No encontramos productos</h3><p>Probá con otros filtros o buscá por otro nombre.</p><button type="button" class="btn btn-primary" data-act="clear">Quitar filtros</button></div>`;
  return `<div class="wrap"><p class="crumb"><a href="#/">Inicio</a>${crumb ? ' / ' + crumb : ''}</p>
    <div class="list-h"><h1>${title}</h1></div>${chips}${tb}${body}</div>`;
}

/* ── Páginas de información ── */
function pageHead(title) { return `<p class="crumb"><a href="#/">Inicio</a> / ${esc(title)}</p><h1>${esc(title)}</h1>`; }
function contactPage() {
  const s = S(), addr = s.address, hours = (s.hours || []).filter(Boolean), num = contactNum();
  return `<div class="wrap page">${pageHead('Contacto')}<div class="contact"><div class="contact-info">
    ${addr ? `<h2>Dónde estamos</h2><p>${esc(addr)}</p><p><a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}">Cómo llegar</a></p>` : ''}
    ${hours.length ? `<h2>Horarios</h2>${hours.map(h => `<p>${esc(h)}</p>`).join('')}` : ''}
    ${num ? `<h2>WhatsApp</h2><p>${esc(fmtPhone(num))}</p><p><a class="btn btn-primary" target="_blank" rel="noopener" href="${waLink('Hola, quiero hacer una consulta')}">Escribinos por WhatsApp</a></p>` : ''}
    ${s.contactEmail ? `<h2>Correo</h2><p><a href="mailto:${esc(s.contactEmail)}">${esc(s.contactEmail)}</a></p>` : ''}
  </div>${addr ? `<div class="contact-map"><iframe title="Mapa: ${esc(addr)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed"></iframe></div>` : ''}</div></div>`;
}
function textPage(page) {
  const s = S();
  const m = { servicios: ['Servicios', s.pageServices], condiciones: ['Condiciones de compra', s.pageTerms], privacidad: ['Política de privacidad', s.pagePrivacy] }[page];
  return `<div class="wrap page">${pageHead(m[0])}<div class="prose">${richText(m[1])}</div>${page === 'servicios' && contactNum() ? `<p style="margin-top:20px"><a class="btn btn-primary" target="_blank" rel="noopener" href="${waLink('Hola, quiero consultar por un servicio técnico')}">Consultar por WhatsApp</a></p>` : ''}</div>`;
}
const TRACK_STEPS = [['nuevo', 'Recibido'], ['atendido', 'Atendido'], ['entregado', 'Entregado']];
function trackPage() {
  const t = state.track, r = t.res;
  let body = '';
  if (r) {
    if (r.status === 'cancelado') body = `<p class="chipst bad" style="margin-top:18px">Pedido cancelado</p><p class="muted">Si tenés dudas, escribinos por WhatsApp.</p>`;
    else {
      const idx = Math.max(0, TRACK_STEPS.findIndex(x => x[0] === r.status));
      body = `<ol class="steps" aria-label="Estado del pedido">${TRACK_STEPS.map(([k, l], i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}" ${i === idx ? 'aria-current="step"' : ''}><span>${l}</span></li>`).join('')}</ol>${r.updatedAt ? `<p class="note">Última actualización: ${esc(fmtDate(r.updatedAt))}</p>` : ''}`;
    }
  }
  return `<div class="wrap page">${pageHead('Seguimiento de pedido')}<p class="muted">Ingresá el código que te dimos al confirmar tu pedido.</p>
    <form id="trackForm" class="trackform"><label class="sr" for="tc">Código del pedido</label><input class="in" id="tc" name="code" value="${esc(t.code)}" placeholder="Ej.: P-AB12CDE" autocomplete="off" autocapitalize="characters"><button class="btn btn-primary" type="submit" ${t.loading ? 'disabled' : ''}>${t.loading ? 'Buscando…' : 'Ver estado'}</button></form>
    ${t.err ? `<p class="err" role="alert">${esc(t.err)}</p>` : ''}${body}</div>`;
}
async function trackLookup(code) {
  const t = state.track;
  t.code = String(code || '').trim().toUpperCase(); t.res = null; t.err = '';
  if (!t.code) { t.err = 'Escribí el código de tu pedido.'; return render(); }
  t.loading = true; render();
  try {
    const r = await DB.getOrderStatus(t.code);
    if (r) t.res = r; else t.err = 'No encontramos ese código. Revisalo e intentá de nuevo.';
  } catch (e) { console.error(e); t.err = 'No pudimos consultar el pedido ahora. Intentá de nuevo en unos minutos.'; }
  t.loading = false; render();
}

function storeView() {
  const ps = activeProducts();
  if (state.q) {
    return listing({ title: `Resultados para “${esc(state.q)}”`, crumb: 'Búsqueda', list: searchProducts(state.q, ps), relevance: true });
  }
  const r = state.route;
  if (r.name === 'page') return r.page === 'contacto' ? contactPage() : textPage(r.page);
  if (r.name === 'track') return trackPage();
  if (r.name === 'cat') {
    const list = ps.filter(p => p.category === r.cat);
    const subs = [...new Set(list.map(p => p.sub).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    if (!CATS[r.cat]) return state.loaded.cats ? `<div class="wrap"><div class="empty"><h3>No encontramos esa sección</h3><p>Puede que ya no exista.</p><a class="btn btn-primary" href="#/">Ir al inicio</a></div></div>` : `<div class="wrap">${skeletons(8)}</div>`;
    return listing({ title: CATS[r.cat].name, crumb: CATS[r.cat].name, list, subs });
  }
  if (r.name === 'offers') return heroHTML() + listing({ title: 'Ofertas', crumb: 'Ofertas', list: ps.filter(onOffer) });
  return storeHome();
}

/* ── Sugerencias al escribir en el buscador ── */
function hideSugg() { const u = $('#sugg'); if (u) { u.hidden = true; u.innerHTML = ''; } }
function showSugg() {
  const u = $('#sugg'); if (!u) return;
  const q = $('#q').value.trim();
  if (!q || state.route.name === 'admin') return hideSugg();
  const res = searchProducts(q, activeProducts()).slice(0, 6);
  if (!res.length) { u.innerHTML = `<li class="sugg-none">No encontramos “${esc(q)}”. Probá con otra palabra.</li>`; u.hidden = false; return; }
  u.innerHTML = res.map(p => `<li><button type="button" data-act="sugg" data-id="${esc(p.id)}"><img src="${esc(imgOf(p))}" alt=""><span class="sg-t">${esc(p.name)}</span><span class="sg-p">${money(p.price)}</span></button></li>`).join('');
  u.hidden = false;
}

const HEX = /^#[0-9a-f]{6}$/i;
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }
function applyBrand(s) {
  const c = HEX.test(s.brandColor || '') ? s.brandColor : '#2347F5', st = document.documentElement.style;
  st.setProperty('--cobalt', c); st.setProperty('--cobalt-d', shade(c, .8));
  st.setProperty('--on-brand', lum(c) > .6 ? '#0E1A2B' : '#fff');
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', c);
}
function renderChrome() {
  const s = state.settings;
  document.title = `${s.storeName} · ${s.tagline || 'Tecnología y electrodomésticos'}`;
  $$('.js-name').forEach(e => e.textContent = s.storeName);
  const perks = (s.perks || []).filter(Boolean);
  $('#perks').hidden = !perks.length;
  $('#perks .wrap').innerHTML = perks.map(p => `<span>${esc(p)}</span>`).join('');
  applyBrand(s);
  const lg = $('#logoImg'); lg.hidden = !s.logo; if (s.logo) lg.src = s.logo;
  $('.top .logo-mark').hidden = $('.top .js-name').hidden = !!s.logo;
  const r = state.route, cur = state.q ? '' : (r.name === 'cat' ? r.cat : r.name === 'offers' ? 'ofertas' : r.name === 'page' ? r.page : 'home');
  const shop = cur === 'ofertas' || !!CATS[cur];
  $('#catNav ul').innerHTML =
    `<li><a href="#/" ${cur === 'home' ? 'aria-current="page"' : ''}>Inicio</a></li>` +
    `<li class="dd"><details><summary ${shop ? 'class="cur"' : ''}>Tienda</summary><ul>${Object.entries(CATS).map(([k, c]) => `<li><a href="#/c/${esc(k)}" ${cur === k ? 'aria-current="page"' : ''}>${esc(c.name)}</a></li>`).join('')}<li><a class="hot" href="#/ofertas" ${cur === 'ofertas' ? 'aria-current="page"' : ''}>Ofertas</a></li></ul></details></li>` +
    `<li><a href="#/servicios" ${cur === 'servicios' ? 'aria-current="page"' : ''}>Servicios</a></li>` +
    `<li><a href="#/contacto" ${cur === 'contacto' ? 'aria-current="page"' : ''}>Contacto</a></li>`;
  const sv = (id, url) => { const a = $(id); const ok = /^https?:\/\//i.test(url || ''); a.hidden = !ok; if (ok) a.href = url; };
  sv('#icIg', s.instagram); sv('#icFb', s.facebook);
  const wnum = contactNum(); $('#icWa').hidden = !wnum; if (wnum) $('#icWa').href = waLink('Hola, quiero hacer una consulta');
  const hrs = (s.hours || []).filter(Boolean), num = contactNum();
  $('#footLocal').innerHTML = `<h4>Contacto</h4><ul>${s.address ? `<li>${esc(s.address)}</li>` : ''}${hrs.map(h => `<li>${esc(h)}</li>`).join('')}${num ? `<li><a target="_blank" rel="noopener" href="${waLink('Hola, quiero hacer una consulta')}">WhatsApp ${esc(fmtPhone(num))}</a></li>` : ''}${s.contactEmail ? `<li><a href="mailto:${esc(s.contactEmail)}">${esc(s.contactEmail)}</a></li>` : ''}</ul>${s.footerInfo ? `<p>${esc(s.footerInfo)}</p>` : ''}`;
  const fab = $('#waFab'); fab.hidden = !num; if (num) fab.href = waLink('Hola, quiero hacer una consulta');
  $('#footTag').textContent = s.tagline || '';
  $('#footCats').innerHTML = Object.entries(CATS).map(([k, c]) => `<li><a href="#/c/${k}">${c.name}</a></li>`).join('') + '<li><a href="#/ofertas">Ofertas</a></li>';
  $('#demoBar').hidden = DB?.mode !== 'demo';
  renderCartBadge();
}

function render() {
  const admin = state.route.name === 'admin';
  document.body.classList.toggle('is-admin', admin);
  renderChrome();
  app.innerHTML = admin ? adminView() : storeView();
  if (admin) renderAdminBody();
  const r = state.route;
  if (r.name === 'track' && DB && r.code && state.track.auto !== r.code) { state.track.auto = r.code; trackLookup(r.code); }
  if (r.open && state.loaded.products && state.deepDone !== r.open) {
    state.deepDone = r.open;
    if (activeProducts().some(p => p.id === r.open)) openProduct(r.open); else toast('Ese producto ya no está disponible.', { bad: true });
  }
}

/* ───────── Producto ───────── */
let pdQty = 1;
const productImages = p => { const l = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []); return l.length ? l : [imgOf(p)]; };
function openProduct(id) {
  const p = activeProducts().find(x => x.id === id);
  if (!p) return;
  pdQty = 1;
  const c = catOf(p), st = stockOf(p), offer = onOffer(p), imgs = productImages(p);
  const stock = st <= 0 ? '<p class="stock none">Sin stock</p>' : st <= 5 ? `<p class="stock low">Quedan ${st} unidades</p>` : '<p class="stock">Disponible</p>';
  const specs = String(p.specs || '').split('\n').map(s => s.trim()).filter(Boolean);
  $('#dlgProduct').innerHTML = `<button type="button" class="dlg-x" data-act="closeDlg" aria-label="Cerrar">×</button>
    <div class="pd"><div class="pd-img" style="--tint:${c.tint}"><img id="pdMain" src="${esc(imgs[0])}" alt="${esc(p.name)}">${offer ? `<span class="tag">-${pct(p)}%</span>` : ''}
      ${imgs.length > 1 ? `<div class="thumbs" role="group" aria-label="Fotos del producto">${imgs.map((u, i) => `<button type="button" data-act="gal" data-id="${esc(p.id)}" data-i="${i}" aria-label="Ver foto ${i + 1}" aria-current="${i === 0}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>` : ''}</div>
    <div class="pd-b"><p class="card-meta">${esc([p.brand, p.sub].filter(Boolean).join(' · ') || c.name)}</p><h2>${esc(p.name)}</h2>
      <div class="pd-price"><strong>${money(p.price)}</strong>${offer ? `<s>${money(p.oldPrice)}</s>` : ''}</div>${stock}
      ${p.description ? `<p class="muted">${esc(p.description)}</p>` : ''}
      ${specs.length ? `<ul class="specs">${specs.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <div class="buy"><div class="qty" role="group" aria-label="Cantidad"><button type="button" data-act="pdMinus" aria-label="Menos">−</button><output id="pdQ" aria-live="polite">1</output><button type="button" data-act="pdPlus" aria-label="Más">+</button></div>
      <button type="button" class="btn btn-primary" data-act="pdAdd" data-id="${esc(p.id)}" ${st <= 0 ? 'disabled' : ''}>Agregar al carrito</button></div>
      <button type="button" class="btn btn-line btn-sm share" data-act="share" data-id="${esc(p.id)}">Compartir este producto</button></div></div>`;
  const d = $('#dlgProduct');
  if (!d.open) d.showModal();
  d.scrollTop = 0;
  document.title = `${p.name} · ${S().storeName}`;
  if (!location.hash.startsWith('#/p/')) state.prevHash = location.hash || '#/';
  try { history.replaceState(null, '', '#/p/' + encodeURIComponent(p.id)); } catch { /* file:// o iframe */ }
}
$('#dlgProduct').addEventListener('close', () => {
  if (location.hash.startsWith('#/p/')) { try { history.replaceState(null, '', state.prevHash || '#/'); } catch { /* nada */ } }
  document.title = `${S().storeName} · ${S().tagline || 'Tecnología y electrodomésticos'}`;
});
async function shareProduct(id) {
  const p = state.products.concat(SAMPLE).find(x => x.id === id); if (!p) return;
  const url = location.href.split('#')[0] + '#/p/' + encodeURIComponent(id);
  try { if (navigator.share) { await navigator.share({ title: p.name, text: `${p.name} · ${S().storeName}`, url }); return; } }
  catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } catch { toast(url); }
}

/* ───────── Carrito (panel lateral) ───────── */
function openCart() { state.cartStep = 'cart'; state.orderErr = ''; renderCart(); const d = $('#dlgCart'); if (!d.open) d.showModal(); }
function renderCart() {
  const d = $('#dlgCart'), lines = cartLines(), total = cartTotal();
  const head = (t, back) => `<div class="dr-h">${back ? `<button type="button" class="btn btn-line btn-sm" data-act="cartBack">Volver</button>` : `<h2>${t}</h2>`}<button type="button" class="dlg-x x" data-act="closeDlg" aria-label="Cerrar">×</button></div>`;
  if (state.cartStep === 'done') {
    d.innerHTML = head('Pedido') + `<div class="dr-body"><div class="done"><div class="ok" aria-hidden="true">✓</div><h3>¡Recibimos tu pedido!</h3><p>Te escribimos por WhatsApp para coordinar el pago y la entrega.</p><span class="code">${esc(state.doneCode)}</span><p class="note" style="margin-top:14px">Guardá este código: con él podés ver el estado de tu pedido.</p><p><a class="btn btn-line btn-sm" href="#/pedido/${esc(state.doneCode)}" data-act="closeDlg">Seguir mi pedido</a></p>${state.dupNote ? '<p class="note">Ya habíamos recibido este pedido, no hace falta enviarlo de nuevo.</p>' : ''}</div></div><div class="dr-f"><button type="button" class="btn btn-primary" data-act="closeDlg">Seguir mirando productos</button></div>`;
    return;
  }
  if (!lines.length) {
    d.innerHTML = head(`Tu carrito`) + `<div class="dr-body"><div class="empty" style="margin-top:16px"><h3>Tu carrito está vacío</h3><p>Agregá productos y los vas a ver acá con el total.</p><button type="button" class="btn btn-primary" data-act="closeDlg">Ver productos</button></div></div>`;
    return;
  }
  if (state.cartStep === 'checkout') {
    const v = state.form || {};
    d.innerHTML = head('', true) + `<form id="checkoutForm" class="dr-body" style="padding-top:18px" novalidate>
      <h2 style="font:800 22px var(--font-d);margin-bottom:14px">Tus datos</h2>
      <div class="field"><label for="f-name">Nombre y apellido</label><input class="in" id="f-name" name="name" autocomplete="name" required value="${esc(v.name)}"></div>
      <div class="field"><label for="f-phone">Teléfono o WhatsApp</label><input class="in" id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required value="${esc(v.phone)}"><small>Te contactamos a este número para confirmar el pedido.</small></div>
      <div class="field"><span>¿Cómo lo recibís?</span><div class="radios"><label><input type="radio" name="delivery" value="retiro" ${v.delivery !== 'envio' ? 'checked' : ''}> Retiro en el local</label><label><input type="radio" name="delivery" value="envio" ${v.delivery === 'envio' ? 'checked' : ''}> Envío a domicilio</label></div></div>
      ${payList().length ? `<div class="field"><span>¿Cómo querés pagar?</span><div class="radios" role="radiogroup">${payList().map(m => `<label><input type="radio" name="payment" value="${esc(m)}" ${v.payment === m ? 'checked' : ''}> ${esc(m)}</label>`).join('')}</div></div>` : ''}
      <div class="field" id="zoneField" ${v.delivery === 'envio' ? '' : 'hidden'}><label for="f-zone">Localidad</label><select class="in" id="f-zone" name="zone">${zones().map(z => `<option value="${esc(z.name)}" ${(v.zone || zones()[0]?.name) === z.name ? 'selected' : ''}>${esc(z.name)} — ${Number(z.cost) > 0 ? money(z.cost) : 'sin costo de envío'}</option>`).join('')}<option value="${OTRA}" ${v.zone === OTRA ? 'selected' : ''}>Otra localidad (costo a coordinar)</option></select></div>
      <div class="field" id="addrField" ${v.delivery === 'envio' ? '' : 'hidden'}><label for="f-addr">Dirección de entrega</label><input class="in" id="f-addr" name="address" autocomplete="street-address" value="${esc(v.address)}"></div>
      <div class="hp" aria-hidden="true"><label>No completar este campo<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="field"><label for="f-note">Comentarios (opcional)</label><textarea class="in" id="f-note" name="note" rows="2">${esc(v.note)}</textarea></div>
      <p class="err" id="orderErr" role="alert" ${state.orderErr ? '' : 'hidden'}>${esc(state.orderErr)}</p>
    </form>
    <div class="dr-f"><div id="ckTotals">${ckTotals(v)}</div>
    <button type="submit" form="checkoutForm" class="btn btn-primary" ${state.sending ? 'disabled' : ''}>${state.sending ? 'Enviando pedido…' : 'Confirmar pedido'}</button>
    <p class="note">Te confirmamos el pedido por WhatsApp y coordinamos el pago y la entrega.</p></div>`;
    return;
  }
  d.innerHTML = head(`Tu carrito (${cartCount()})`) + `<div class="dr-body">${lines.map(({ p, qty, sub }) => `<div class="line">
      <img src="${esc(imgOf(p))}" alt="" style="--tint:${catOf(p).tint}">
      <div><p class="line-t">${esc(p.name)}</p><p class="line-u">${money(p.price)} c/u</p>
      <div class="line-r"><div class="qty sm" role="group" aria-label="Cantidad de ${esc(p.name)}"><button type="button" data-act="lineMinus" data-id="${esc(p.id)}" aria-label="Menos">−</button><output>${qty}</output><button type="button" data-act="linePlus" data-id="${esc(p.id)}" aria-label="Más">+</button></div><span class="line-sub">${money(sub)}</span></div>
      <button type="button" class="rm" data-act="lineRm" data-id="${esc(p.id)}">Quitar</button></div></div>`).join('')}</div>
    <div class="dr-f"><div class="total"><span>Total</span><strong>${money(total)}</strong></div>
    <button type="button" class="btn btn-primary" data-act="checkout">Finalizar compra</button>
    <button type="button" class="rm" data-act="clearCart">Vaciar carrito</button></div>`;
}

function ckTotals(c) {
  const sh = shippingFor({ delivery: c.delivery, zone: c.zone || zones()[0]?.name }), items = cartTotal();
  return `<div class="rowt"><span>Productos</span><span>${money(items)}</span></div><div class="rowt"><span>Envío</span><span>${sh.label}</span></div><div class="total"><span>Total a pagar</span><strong>${money(items + sh.cost)}</strong></div>${sh.known ? '' : '<p class="note">El costo de envío a esa localidad lo coordinamos con vos por WhatsApp.</p>'}`;
}
function updateCheckout(form) {
  const c = readCheckout(form); state.form = { ...(state.form || {}), ...c };
  $('#addrField').hidden = $('#zoneField').hidden = c.delivery !== 'envio';
  $('#ckTotals').innerHTML = ckTotals(c);
}
const payList = () => (state.settings.payMethods || []).map(x => String(x).trim()).filter(Boolean);
function readCheckout(form) {
  const f = new FormData(form);
  return { name: String(f.get('name') || '').trim(), phone: String(f.get('phone') || '').trim(), delivery: f.get('delivery') === 'envio' ? 'envio' : 'retiro', address: String(f.get('address') || '').trim(), zone: String(f.get('zone') || ''), hp: String(f.get('website') || ''), payment: String(f.get('payment') || '').trim(), note: String(f.get('note') || '').trim() };
}
function waText(order, code) {
  const l = order.items.map(i => `• ${i.qty} x ${i.name} — ${money(i.price * i.qty)}`).join('\n');
  const c = order.customer;
  return `Hola, quiero hacer este pedido (${code}):\n${l}\n${order.shipping ? 'Envío: ' + money(order.shipping) + '\n' : ''}Total: ${money(order.total)}\n\nNombre: ${c.name}\nTeléfono: ${c.phone}\n${c.payment ? 'Pago: ' + c.payment + '\n' : ''}${c.delivery === 'envio' ? 'Envío a: ' + c.address + (c.zone ? ' (' + c.zone + ')' : '') : 'Retiro en el local'}${c.note ? '\nComentarios: ' + c.note : ''}`;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function submitOrder(form) {
  if (state.sending) return;
  const c = readCheckout(form), hp = c.hp; delete c.hp; state.form = { ...c };
  const fail = m => { state.orderErr = m; renderCart(); $('#orderErr')?.focus?.(); };
  if (!c.name) return fail('Escribí tu nombre.');
  if (digits(c.phone).length < 7) return fail('Escribí un teléfono válido para poder contactarte.');
  if (c.delivery === 'envio' && !c.address) return fail('Escribí la dirección de entrega.');
  if (payList().length && !c.payment) return fail('Elegí cómo querés pagar.');
  if (!payList().length) delete c.payment;
  const lines = cartLines();
  if (!lines.length) return fail('Tu carrito está vacío.');
  if (lines.reduce((a, l) => a + l.qty, 0) > maxUnits()) return fail(`Cada pedido admite hasta ${maxUnits()} unidades. Quitá algunas o escribinos por WhatsApp.`);

  // Envío: localidad y costo
  if (c.delivery === 'envio') { if (c.zone === OTRA || !zones().some(z => z.name === c.zone)) c.zone = c.zone === OTRA || !zones().length ? 'Otra localidad (a coordinar)' : zones()[0].name; } else delete c.zone;
  const sh = shippingFor({ delivery: c.delivery, zone: c.zone });
  const order = {
    customer: c,
    items: lines.map(({ p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty })),
    itemCount: lines.reduce((a, l) => a + l.qty, 0),
    shipping: sh.cost,
    total: cartTotal() + sh.cost
  };

  // Pedido repetido (por ejemplo, tocar dos veces): no se vuelve a enviar
  const sig = JSON.stringify([order.items.map(i => i.id + ':' + i.qty).sort(), digits(c.phone)]);
  const last = lsGet('nodo_last');
  const finish = (code, dup) => { state.sending = false; state.cart = {}; saveCart(); state.form = null; state.doneCode = code; state.dupNote = !!dup; state.cartStep = 'done'; renderCartBadge(); renderCart(); };
  if (last && last.sig === sig && Date.now() - last.at < 180000) return finish(last.code, true);
  // Campo trampa que las personas no ven: si viene completo es un robot
  if (hp) { state.sending = true; renderCart(); await sleep(800); return finish('P-' + Math.random().toString(36).toUpperCase().slice(2, 9)); }

  let win = null;
  if (state.settings.linkFallback && digits(state.settings.waNumber)) win = window.open('', '_blank');
  state.sending = true; state.orderErr = ''; renderCart();
  try {
    await sleep(Math.max(0, 1500 - (Date.now() - state.checkoutAt))); // evita envíos instantáneos de robots
    const code = await DB.createOrder(order);
    lsSet('nodo_last', { sig, code, at: Date.now() });
    finish(code, false);
    if (win) win.location.href = `https://wa.me/${digits(state.settings.waNumber)}?text=${encodeURIComponent(waText(order, code))}`;
  } catch (e) {
    console.error(e); if (win) win.close();
    state.sending = false;
    fail('No pudimos enviar el pedido. Revisá tu conexión e intentá de nuevo.');
  }
}

/* ───────── Eventos ───────── */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (t) {
    const id = t.dataset.id, a = t.dataset.act;
    if (a === 'open') openProduct(id);
    else if (a === 'add') addToCart(id);
    else if (a === 'hero') setHero(+t.dataset.i);
    else if (a === 'page') { state.page = +t.dataset.i; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'railPrev' || a === 'railNext') { const r = $('#rail'); if (r) r.scrollBy({ left: (a === 'railNext' ? 1 : -1) * r.clientWidth * .8, behavior: 'smooth' }); }
    else if (a === 'heroPrev') setHero(state.hero - 1);
    else if (a === 'heroNext') setHero(state.hero + 1);
    else if (a === 'gal') { const p = activeProducts().find(x => x.id === id); if (p) { $('#pdMain').src = productImages(p)[+t.dataset.i]; $$('.thumbs button').forEach(b => b.setAttribute('aria-current', b === t)); } }
    else if (a === 'share') shareProduct(id);
    else if (a === 'sugg') { hideSugg(); $('#q').value = ''; state.q = ''; render(); openProduct(id); }
    else if (a === 'sub') { state.sub = t.dataset.v; render(); }
    else if (a === 'clear') { state.sub = ''; state.onlyOffers = false; state.inStock = false; state.q = ''; $('#q').value = ''; render(); }
    else if (a === 'closeDlg') t.closest('dialog').close();
    else if (a === 'pdMinus') { pdQty = Math.max(1, pdQty - 1); $('#pdQ').textContent = pdQty; }
    else if (a === 'pdPlus') { const p = state.products.find(x => x.id === $('[data-act=pdAdd]').dataset.id); pdQty = Math.min(pdQty + 1, Math.min(stockOf(p), 99)); $('#pdQ').textContent = pdQty; }
    else if (a === 'pdAdd') { addToCart(id, pdQty); $('#dlgProduct').close(); }
    else if (a === 'lineMinus') setQty(id, (state.cart[id] || 0) - 1);
    else if (a === 'linePlus') setQty(id, (state.cart[id] || 0) + 1);
    else if (a === 'lineRm') setQty(id, 0);
    else if (a === 'clearCart') askConfirm('¿Vaciar el carrito?', 'Vaciar').then(ok => { if (ok) { state.cart = {}; saveCart(); renderCartBadge(); renderCart(); } });
    else if (a === 'checkout') { state.cartStep = 'checkout'; state.checkoutAt = Date.now(); renderCart(); }
    else if (a === 'cartBack') { state.cartStep = 'cart'; renderCart(); }
    else if (a.startsWith('adm')) adminClick(a, t, e);
    return;
  }
  if (e.target.tagName === 'DIALOG') e.target.close(); // clic en el fondo
});
$('#cartBtn').addEventListener('click', openCart);
$('#cartFab').addEventListener('click', openCart);
document.addEventListener('click', e => { if (!e.target.closest('.dd')) $$('.dd details[open]').forEach(d => d.open = false); });
document.addEventListener('change', e => {
  const t = e.target, a = t.dataset?.act;
  if (a === 'sort') { state.sort = t.value; render(); }
  else if (a === 'onlyOffers') { state.onlyOffers = t.checked; render(); }
  else if (a === 'inStock') { state.inStock = t.checked; render(); }
  else if ((t.name === 'delivery' || t.name === 'zone') && t.closest('#checkoutForm')) updateCheckout(t.closest('form'));
  else if (a?.startsWith('adm')) adminChange(a, t);
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'checkoutForm') { e.preventDefault(); submitOrder(f); }
  else if (f.dataset?.form) { e.preventDefault(); adminSubmit(f); }
  else if (f.id === 'loginForm') { e.preventDefault(); doLogin(f); }
  else if (f.id === 'searchForm') { e.preventDefault(); hideSugg(); }
  else if (f.id === 'trackForm') { e.preventDefault(); state.track.auto = f.code.value.trim().toUpperCase(); trackLookup(f.code.value); }
});
$('#q').addEventListener('input', e => {
  state.q = e.target.value.trim();
  if (state.route.name === 'admin') { location.hash = '#/'; return; }
  state.sub = ''; render(); showSugg();
});
$('#q').addEventListener('focus', showSugg);
$('#q').addEventListener('blur', () => setTimeout(hideSugg, 150));
$('#q').addEventListener('keydown', e => { if (e.key === 'Escape') hideSugg(); });
$('#sugg').addEventListener('mousedown', e => e.preventDefault());

/* ───────── Arranque ───────── */
function loadPublic() {
  const bad = err => { state.fsError = true; state.loaded.products = true; softRender(); };
  DB.subscribe('products', l => { state.products = l; state.loaded.products = true; state.fsError = false; softRender(); }, bad);
  DB.subscribe('categories', l => { state.catDocs = l; applyCats(l); state.loaded.cats = true; softRender(); }, () => { state.loaded.cats = true; });
  DB.subscribe('banners', l => { state.banners = l; state.loaded.banners = true; softRender(); });
  DB.subscribe('settings', l => {
    const s = l.find(x => x.id === 'store');
    state.settings = { ...DEFAULT_SETTINGS, ...(s || {}) };
    if (typeof state.settings.perks === 'string') state.settings.perks = state.settings.perks.split('\n');
    if (typeof state.settings.payMethods === 'string') state.settings.payMethods = state.settings.payMethods.split('\n');
    if (!Array.isArray(state.settings.branches)) state.settings.branches = [];
    if (typeof state.settings.hours === 'string') state.settings.hours = state.settings.hours.split('\n');
    softRender();
  });
}
let adminListeners = false;
function loadOrders() {
  if (state.ordersUnsub) return;
  let first = true;
  state.ordersUnsub = DB.subscribe('orders', l => {
    if (!first && l.length > state.orders.length) toast('Llegó un pedido nuevo', { label: 'Ver', fn: () => { state.admin.tab = 'orders'; location.hash = '#/admin'; render(); } });
    first = false; state.orders = l; softRender();
  });
}
/* Re-render que no interrumpe a quien está escribiendo en el panel */
let pendingRender = false;
function softRender() {
  if (state.route.name === 'admin') {
    renderChrome();
    if (document.activeElement?.closest?.('#adminBody input, #adminBody select')) { pendingRender = true; return; }
    $('#adminShell') && renderAdminBody();
    if (!$('#adminShell')) render();
    renderCartBadge();
    return;
  }
  // En la tienda, no tocar la pantalla si hay un diálogo con foco en un formulario
  render();
  if ($('#dlgCart').open) renderCart();
}
document.addEventListener('focusout', () => { if (pendingRender) setTimeout(() => { if (!document.activeElement?.closest?.('#adminBody input, #adminBody select')) { pendingRender = false; renderAdminBody(); } }, 50); });

(async function init() {
  state.route = parseHash();
  render();
  try { DB = await openDB(); }
  catch (e) {
    console.error(e);
    state.error = 'No se pudo cargar la tienda. Revisá tu conexión e intentá de nuevo.'; state.loaded.products = true; render(); return;
  }
  render();
  loadPublic();
  DB.auth.onChange(u => {
    state.user = u; state.authReady = true;
    if (u) loadOrders(); else { state.ordersUnsub && state.ordersUnsub(); state.ordersUnsub = null; state.orders = []; }
    if (state.route.name === 'admin') render();
  });
})();
