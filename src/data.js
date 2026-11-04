/* ───────── Capa de datos: Firebase (real) o modo demo (localStorage) ─────────
   Si firebase-config.js tiene tus credenciales, usa Firestore + Auth en tiempo real.
   Si no, funciona en modo demo con datos guardados solo en este navegador. */

const FB_CFG = window.FIREBASE_CONFIG || {};
const HAS_FB = !!(FB_CFG.apiKey && FB_CFG.projectId && !/^TU_/i.test(FB_CFG.apiKey));
const ADMIN_DOMAIN = '@tienda-admin.local';
const userToEmail = u => { u = String(u || '').trim().toLowerCase(); return u.includes('@') ? u : u + ADMIN_DOMAIN; };

/* Almacenamiento tolerante a fallos (modo privado, iframes, cuota llena) */
const _mem = {};
function lsGet(k) {
  if (k in _mem) return _mem[k];
  try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch { return null; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); delete _mem[k]; } catch { _mem[k] = v; }
}

const newCode = () => 'P-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).toUpperCase().slice(2, 5);

/* ── Modo demo ── */
function createDemoDB() {
  const subs = { products: new Set(), banners: new Set(), settings: new Set(), orders: new Set() };
  const key = c => 'nodo_demo_' + c;
  const read = c => lsGet(key(c)) || [];
  const emit = c => (subs[c] || []).forEach(cb => cb(read(c)));

  if (!lsGet('nodo_demo_init')) {
    lsSet(key('products'), seedProducts());
    lsSet(key('banners'), SEED_BANNERS);
    lsSet(key('settings'), [{ id: 'store', ...DEFAULT_SETTINGS }]);
    lsSet(key('orders'), []);
    lsSet('nodo_demo_init', 1);
  }
  let admin = !!lsGet('nodo_demo_admin');
  const authSubs = new Set();
  const notifyAuth = () => authSubs.forEach(cb => cb(admin ? { email: 'user' + ADMIN_DOMAIN } : null));

  return {
    mode: 'demo',
    subscribe(col, cb) {
      (subs[col] = subs[col] || new Set()).add(cb);
      setTimeout(() => cb(read(col)), 0);
      return () => subs[col].delete(cb);
    },
    async save(col, id, data) {
      const list = read(col);
      const i = id ? list.findIndex(x => x.id === id) : -1;
      if (i >= 0) list[i] = { ...list[i], ...data };
      else { id = id || 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); list.push({ id, ...data }); }
      lsSet(key(col), list); emit(col);
      return id;
    },
    async remove(col, id) {
      lsSet(key(col), read(col).filter(x => x.id !== id)); emit(col);
    },
    async createOrder(order) {
      const code = newCode();
      const list = read('orders');
      list.unshift({ id: 'o' + Date.now().toString(36), code, status: 'nuevo', createdAt: Date.now(), stockApplied: true, ...order });
      const prods = read('products');
      for (const it of order.items || []) { const p = prods.find(x => x.id === it.id); if (p && p.stock !== null && p.stock !== undefined) p.stock = Math.max(0, Number(p.stock) - Number(it.qty || 0)); }
      lsSet(key('products'), prods); emit('products');
      lsSet(key('orders'), list); emit('orders');
      const st = read('orderStatus'); st.push({ id: code, status: 'nuevo', updatedAt: Date.now() }); lsSet(key('orderStatus'), st);
      return code;
    },
    async getOrderStatus(code) {
      const d = read('orderStatus').find(x => x.id === code);
      return d ? { status: d.status, updatedAt: d.updatedAt } : null;
    },
    auth: {
      onChange(cb) { authSubs.add(cb); setTimeout(() => cb(admin ? { email: 'user' + ADMIN_DOMAIN } : null), 0); },
      async login(u, p) {
        if (String(u).trim().toLowerCase() === 'user' && p === '123456') { admin = true; lsSet('nodo_demo_admin', 1); notifyAuth(); return; }
        throw new Error('Usuario o contraseña incorrectos.');
      },
      async logout() { admin = false; lsSet('nodo_demo_admin', 0); notifyAuth(); },
      async changePassword() { throw new Error('En modo demo no se puede cambiar la contraseña. Conectá Firebase para usar esta opción.'); }
    }
  };
}

/* ── Firebase ── */
async function createFirebaseDB() {
  const V = '10.12.2';
  const base = `https://www.gstatic.com/firebasejs/${V}/`;
  const [appM, fsM, authM] = await Promise.all([
    import(base + 'firebase-app.js'),
    import(base + 'firebase-firestore.js'),
    import(base + 'firebase-auth.js')
  ]);
  const app = appM.initializeApp(FB_CFG);
  const fs = fsM.getFirestore(app);
  const au = authM.getAuth(app);

  const norm = d => {
    const o = { id: d.id, ...d.data() };
    for (const k of ['createdAt', 'updatedAt']) if (o[k] && typeof o[k].toMillis === 'function') o[k] = o[k].toMillis();
    return o;
  };
  const authMsg = e => {
    const c = e && e.code || '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return 'Usuario o contraseña incorrectos.';
    if (/too-many-requests/.test(c)) return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
    if (/network/.test(c)) return 'No hay conexión. Revisá tu internet.';
    if (/requires-recent-login/.test(c)) return 'Por seguridad, salí y volvé a ingresar antes de cambiar la contraseña.';
    if (/weak-password/.test(c)) return 'La contraseña es muy corta (mínimo 6 caracteres).';
    return 'No se pudo completar la acción (' + (c || 'error') + ').';
  };

  return {
    mode: 'firebase',
    subscribe(col, cb, onErr) {
      const ref = fsM.collection(fs, col);
      const q = col === 'orders' ? fsM.query(ref, fsM.orderBy('createdAt', 'desc')) : ref;
      return fsM.onSnapshot(q, snap => cb(snap.docs.map(norm)), err => { console.error(col, err); onErr && onErr(err); });
    },
    async save(col, id, data) {
      if (id) { await fsM.setDoc(fsM.doc(fs, col, id), data, { merge: true }); return id; }
      const r = await fsM.addDoc(fsM.collection(fs, col), data);
      return r.id;
    },
    async remove(col, id) { await fsM.deleteDoc(fsM.doc(fs, col, id)); },
    async createOrder(order) {
      const code = newCode();
      await fsM.addDoc(fsM.collection(fs, 'orders'), { ...order, code, status: 'nuevo', createdAt: fsM.serverTimestamp() });
      // Estado público (sin datos personales) para que el cliente consulte su pedido con el código
      try { await fsM.setDoc(fsM.doc(fs, 'orderStatus', code), { status: 'nuevo', updatedAt: Date.now() }); } catch (e) { console.warn('orderStatus', e); }
      return code;
    },
    async getOrderStatus(code) {
      const d = await fsM.getDoc(fsM.doc(fs, 'orderStatus', code));
      return d.exists() ? d.data() : null;
    },
    auth: {
      onChange(cb) { authM.onAuthStateChanged(au, cb); },
      async login(u, p) {
        try { await authM.signInWithEmailAndPassword(au, userToEmail(u), p); } catch (e) { throw new Error(authMsg(e)); }
      },
      async logout() { await authM.signOut(au); },
      async changePassword(p) {
        try { await authM.updatePassword(au.currentUser, p); } catch (e) { throw new Error(authMsg(e)); }
      }
    }
  };
}

async function openDB() {
  if (!HAS_FB) return createDemoDB();
  return createFirebaseDB(); // si falla, app.js muestra un error (no se cae a datos de ejemplo en producción)
}
