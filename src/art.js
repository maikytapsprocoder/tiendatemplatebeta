/* ───────── Categorías e ilustraciones de producto ─────────
   Las ilustraciones se usan cuando un producto no tiene foto propia. */

const BUILTIN_CATS = [
  { id: 'perifericos',       name: 'Periféricos',       tint: '#E7ECFF', acc: '#2347F5', art: 'headset', blurb: 'Mouse, teclados, auriculares, monitores y más', image: '', order: 1 },
  { id: 'telefonos',         name: 'Teléfonos',         tint: '#FFEBDD', acc: '#F26B3A', art: 'phone',   blurb: 'Smartphones, cargadores y accesorios', image: '', order: 2 },
  { id: 'electrodomesticos', name: 'Electrodomésticos', tint: '#DFF4EA', acc: '#0FA37F', art: 'fridge',  blurb: 'Heladeras, lavarropas, cocina y hogar', image: '', order: 3 },
  { id: 'computacion',       name: 'PCs y componentes', tint: '#ECE8FF', acc: '#6B4DF0', art: 'laptop',  blurb: 'Laptops, PCs armadas y componentes', image: '', order: 4 }
];
/* Categorías iniciales: las de negocio.config.js si existen, si no las de la tienda de ejemplo */
const DEFAULT_CATS = (window.NEGOCIO && Array.isArray(window.NEGOCIO.categories) && window.NEGOCIO.categories.length)
  ? window.NEGOCIO.categories.map((c, i) => ({ tint: '#EEF0F4', acc: '#2347F5', art: 'box', blurb: '', image: '', order: i + 1, ...c }))
  : BUILTIN_CATS;

/* CATS se rellena con las categorías guardadas (colección "categories"); el admin puede crear, editar y borrar */
const CATS = {};
function applyCats(list) {
  const l = (Array.isArray(list) && list.length ? list : DEFAULT_CATS).filter(c => c && c.id && c.name).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  for (const k of Object.keys(CATS)) delete CATS[k];
  for (const c of l) CATS[c.id] = { tint: '#EEF0F4', acc: '#2347F5', art: 'box', blurb: '', image: '', ...c };
}
applyCats();

const ART_LABELS = {
  mouse: 'Mouse', keyboard: 'Teclado', headset: 'Auriculares', monitor: 'Monitor', speaker: 'Parlante',
  phone: 'Celular', charger: 'Cargador', case: 'Funda', fridge: 'Heladera', washer: 'Lavarropas',
  microwave: 'Microondas', airfryer: 'Freidora de aire', robovac: 'Aspiradora robot', fan: 'Ventilador',
  box: 'Caja / genérico', shirt: 'Prenda de ropa', laptop: 'Laptop', tower: 'PC / gabinete', gpu: 'Placa de video', cpu: 'Procesador', ram: 'Memoria RAM', ssd: 'Disco SSD'
};

const _D = '#1B2433', _D2 = '#2C384D', _L = '#CFD7E3', _G = '#E2B33E', _S = '#E9EEF5';

const ART = {
  box: c => `<path d="M100 36 164 66v66l-64 30-64-30V66Z" fill="${_S}" stroke="${_D}" stroke-width="5" stroke-linejoin="round"/><path d="M36 66l64 30 64-30M100 96v66" stroke="${_D}" stroke-width="5" fill="none"/><path d="M68 51l64 30v28" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  shirt: c => `<path d="M72 36 36 56l14 34 18-8v80h64V82l18 8 14-34-36-20c-4 12-14 18-28 18s-24-6-28-18Z" fill="${c}" stroke="${_D}" stroke-width="5" stroke-linejoin="round"/>`,
  mouse: c => `<rect x="66" y="28" width="68" height="140" rx="34" fill="${_D}"/><path d="M66 92h68M100 28v64" stroke="${_D2}" stroke-width="3"/><rect x="94" y="46" width="12" height="26" rx="6" fill="${c}"/>`,
  keyboard: c => {
    let k = '';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) {
      k += `<rect x="${33 + i * 11.2}" y="${76 + r * 15}" width="9" height="11" rx="2" fill="${r === 0 && i > 8 ? c : _L}"/>`;
    }
    return `<rect x="22" y="66" width="156" height="82" rx="10" fill="${_D}"/>${k}<rect x="58" y="121" width="84" height="12" rx="2" fill="${_L}"/>`;
  },
  headset: c => `<path d="M52 118V98a48 48 0 0 1 96 0v20" fill="none" stroke="${_D}" stroke-width="10" stroke-linecap="round"/><rect x="38" y="104" width="30" height="52" rx="14" fill="${c}"/><rect x="132" y="104" width="30" height="52" rx="14" fill="${c}"/><rect x="45" y="114" width="10" height="32" rx="5" fill="${_D}" opacity=".25"/><rect x="145" y="114" width="10" height="32" rx="5" fill="${_D}" opacity=".25"/><path d="M50 156q2 20 28 20" fill="none" stroke="${_D}" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="176" r="5" fill="${_D}"/>`,
  monitor: c => `<rect x="26" y="40" width="148" height="94" rx="8" fill="${_D}"/><rect x="33" y="47" width="134" height="80" rx="3" fill="${c}"/><path d="M33 100l36-30 30 22 26-18 42 30v23H33z" fill="#fff" opacity=".22"/><rect x="92" y="134" width="16" height="22" fill="${_D2}"/><rect x="68" y="154" width="64" height="8" rx="4" fill="${_D}"/>`,
  speaker: c => `<rect x="62" y="24" width="76" height="144" rx="12" fill="${_D}"/><circle cx="100" cy="64" r="14" fill="${_D2}"/><circle cx="100" cy="64" r="6" fill="${_L}"/><circle cx="100" cy="124" r="28" fill="${_D2}"/><circle cx="100" cy="124" r="16" fill="${c}"/><circle cx="100" cy="124" r="5" fill="${_D}"/>`,
  phone: c => `<rect x="62" y="16" width="76" height="160" rx="16" fill="${_D}"/><rect x="68" y="22" width="64" height="148" rx="11" fill="${c}"/><path d="M68 120l24-26 20 14 20-18v70a11 11 0 0 1-11 11H79a11 11 0 0 1-11-11z" fill="#fff" opacity=".22"/><rect x="88" y="26" width="24" height="6" rx="3" fill="${_D}"/>`,
  charger: c => `<rect x="66" y="52" width="68" height="76" rx="12" fill="${c}"/><rect x="82" y="30" width="8" height="22" fill="${_L}"/><rect x="110" y="30" width="8" height="22" fill="${_L}"/><rect x="92" y="128" width="16" height="10" fill="${_D2}"/><path d="M100 138v16q0 18 24 18h20" fill="none" stroke="${_D}" stroke-width="6" stroke-linecap="round"/><path d="M104 68l-14 22h10l-4 20 16-24h-10z" fill="#fff" opacity=".9"/>`,
  case: c => `<rect x="58" y="14" width="84" height="168" rx="22" fill="${c}"/><rect x="68" y="24" width="64" height="148" rx="14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/><rect x="70" y="28" width="34" height="36" rx="9" fill="${_D}"/><circle cx="80" cy="39" r="6" fill="${_D2}"/><circle cx="94" cy="39" r="6" fill="${_D2}"/><circle cx="87" cy="53" r="6" fill="${_D2}"/>`,
  fridge: c => `<rect x="52" y="14" width="96" height="170" rx="10" fill="${_S}" stroke="${_L}" stroke-width="2"/><path d="M52 68h96" stroke="${_L}" stroke-width="3"/><rect x="62" y="30" width="6" height="26" rx="3" fill="${_D2}"/><rect x="62" y="84" width="6" height="40" rx="3" fill="${_D2}"/><rect x="108" y="26" width="30" height="8" rx="4" fill="${c}"/>`,
  washer: c => `<rect x="42" y="16" width="116" height="168" rx="12" fill="${_S}" stroke="${_L}" stroke-width="2"/><path d="M42 46h116" stroke="${_L}" stroke-width="3"/><circle cx="62" cy="31" r="5" fill="${c}"/><rect x="78" y="26" width="40" height="10" rx="5" fill="${_D2}"/><circle cx="100" cy="118" r="42" fill="${_D}"/><circle cx="100" cy="118" r="33" fill="${c}" opacity=".85"/><path d="M76 118q12-12 24 0t24 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`,
  microwave: c => `<rect x="22" y="56" width="156" height="94" rx="12" fill="${_S}" stroke="${_L}" stroke-width="2"/><rect x="34" y="68" width="96" height="70" rx="8" fill="${_D}"/><rect x="40" y="74" width="84" height="58" rx="5" fill="${c}" opacity=".35"/><circle cx="152" cy="82" r="9" fill="${_D2}"/><rect x="142" y="102" width="20" height="6" rx="3" fill="${_L}"/><rect x="142" y="114" width="20" height="6" rx="3" fill="${_L}"/><rect x="142" y="126" width="20" height="6" rx="3" fill="${c}"/>`,
  airfryer: c => `<path d="M56 44q0-22 44-22t44 22v92q0 24-44 24t-44-24z" fill="${_D}"/><ellipse cx="100" cy="44" rx="44" ry="14" fill="${_D2}"/><rect x="72" y="88" width="56" height="36" rx="8" fill="${c}"/><circle cx="100" cy="106" r="8" fill="#fff" opacity=".8"/><rect x="140" y="92" width="26" height="12" rx="6" fill="${_D2}"/>`,
  robovac: c => `<circle cx="100" cy="100" r="64" fill="${_D}"/><circle cx="100" cy="100" r="50" fill="${_D2}"/><circle cx="100" cy="100" r="20" fill="${c}"/><circle cx="100" cy="100" r="8" fill="#fff"/><rect x="82" y="42" width="36" height="6" rx="3" fill="${_L}"/>`,
  fan: c => `<circle cx="100" cy="74" r="52" fill="none" stroke="${_D}" stroke-width="6"/><circle cx="100" cy="74" r="38" fill="${_L}" opacity=".4"/><g fill="${c}"><path d="M100 74c-4-30 16-38 22-26-2 14-12 22-22 26z"/><path d="M100 74c26-16 42 0 32 10-14 2-26-2-32-10z"/><path d="M100 74c-8 28-30 28-30 14 8-8 18-12 30-14z"/></g><circle cx="100" cy="74" r="8" fill="${_D}"/><rect x="96" y="126" width="8" height="42" fill="${_D2}"/><rect x="66" y="166" width="68" height="10" rx="5" fill="${_D}"/>`,
  laptop: c => `<rect x="44" y="40" width="112" height="82" rx="8" fill="${_D}"/><rect x="50" y="46" width="100" height="70" rx="3" fill="${c}"/><path d="M50 98l28-24 24 18 20-14 28 20v18H50z" fill="#fff" opacity=".22"/><path d="M26 126h148l-10 18a8 8 0 0 1-7 4H43a8 8 0 0 1-7-4z" fill="${_L}"/><rect x="84" y="128" width="32" height="5" rx="2.5" fill="#fff" opacity=".7"/>`,
  tower: c => `<rect x="56" y="16" width="88" height="160" rx="10" fill="${_D}"/><rect x="64" y="26" width="52" height="116" rx="5" fill="${_D2}"/><circle cx="90" cy="56" r="16" fill="none" stroke="${c}" stroke-width="4"/><circle cx="90" cy="56" r="4" fill="${c}"/><circle cx="90" cy="108" r="16" fill="none" stroke="${c}" stroke-width="4"/><circle cx="90" cy="108" r="4" fill="${c}"/><rect x="124" y="30" width="12" height="6" rx="3" fill="${_L}"/><rect x="124" y="42" width="12" height="6" rx="3" fill="${_L}"/><circle cx="130" cy="158" r="5" fill="${c}"/><rect x="64" y="154" width="40" height="6" rx="3" fill="${_D2}"/>`,
  gpu: c => `<rect x="20" y="70" width="160" height="62" rx="8" fill="${_D}"/><circle cx="64" cy="101" r="22" fill="${_D2}"/><circle cx="64" cy="101" r="14" fill="none" stroke="${c}" stroke-width="4"/><circle cx="64" cy="101" r="3" fill="${c}"/><circle cx="124" cy="101" r="22" fill="${_D2}"/><circle cx="124" cy="101" r="14" fill="none" stroke="${c}" stroke-width="4"/><circle cx="124" cy="101" r="3" fill="${c}"/><rect x="26" y="132" width="110" height="8" fill="${_G}"/><rect x="162" y="78" width="12" height="46" rx="3" fill="${_L}"/>`,
  cpu: c => {
    let p = '';
    for (let i = 0; i < 6; i++) {
      const o = 66 + i * 14;
      p += `<rect x="${o}" y="44" width="6" height="12" fill="${_G}"/><rect x="${o}" y="144" width="6" height="12" fill="${_G}"/><rect x="44" y="${o}" width="12" height="6" fill="${_G}"/><rect x="144" y="${o}" width="12" height="6" fill="${_G}"/>`;
    }
    return `${p}<rect x="56" y="56" width="88" height="88" rx="10" fill="${_L}"/><rect x="70" y="70" width="60" height="60" rx="6" fill="${_D}"/><rect x="82" y="82" width="36" height="36" rx="4" fill="${c}"/>`;
  },
  ram: c => {
    let ch = '';
    for (let i = 0; i < 4; i++) ch += `<rect x="${30 + i * 34}" y="84" width="28" height="30" rx="3" fill="${_D2}"/><circle cx="${44 + i * 34}" cy="99" r="3" fill="${_L}"/>`;
    return `<rect x="18" y="70" width="164" height="54" rx="5" fill="${_D}"/><rect x="18" y="70" width="164" height="8" rx="3" fill="${c}"/>${ch}<rect x="18" y="124" width="164" height="10" fill="${_G}"/><rect x="96" y="124" width="6" height="10" fill="#F3F5F8"/>`;
  },
  ssd: c => `<rect x="48" y="44" width="104" height="112" rx="10" fill="${_D}"/><rect x="60" y="58" width="80" height="48" rx="5" fill="${c}"/><path d="M72 82h40M72 92h24" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/><rect x="60" y="116" width="80" height="28" rx="4" fill="${_D2}"/><circle cx="66" cy="150" r="2.5" fill="${_L}"/><circle cx="134" cy="150" r="2.5" fill="${_L}"/>`
};

const _artCache = new Map();
function artUri(key, accent) {
  const k = key + '|' + accent;
  if (_artCache.has(k)) return _artCache.get(k);
  const body = (ART[key] || ART.laptop)(accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><ellipse cx="100" cy="184" rx="58" ry="6" fill="#0E1A2B" opacity=".09"/>${body}</svg>`;
  const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  _artCache.set(k, uri);
  return uri;
}

/* Imagen de un producto: foto propia (URL o subida) o ilustración según categoría */
function imgOf(p) {
  const first = (Array.isArray(p.images) && p.images[0]) || p.image;
  if (first) return first;
  const c = CATS[p.category] || CATS.perifericos;
  return artUri(p.art || c.art, c.acc);
}
