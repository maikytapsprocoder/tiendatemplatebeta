// Cuando entra un pedido a Firestore, esta función lo verifica y manda el WhatsApp
// desde el servidor: el cliente nunca ve a qué número se envía ni cuándo.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret, defineString } = require('firebase-functions/params');
const { logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { verifyItems, buildMessage, sendWhatsApp } = require('./lib');

admin.initializeApp();

// IMPORTANTE: debe coincidir con la región de tu base Firestore
// (ej.: 'us-central1' para nam5, 'southamerica-east1' si la creaste en São Paulo).
const REGION = 'us-central1';

const WA_PROVIDER = defineString('WA_PROVIDER', { default: 'callmebot' }); // 'callmebot' | 'cloudapi'
const WA_PHONE = defineString('WA_PHONE', { default: '59898297449' });      // destino, con código de país y sin +
const WA_PHONE_ID = defineString('WA_PHONE_ID', { default: '' });           // solo cloudapi
const WA_TEMPLATE = defineString('WA_TEMPLATE', { default: '' });           // solo cloudapi, opcional
const WA_APIKEY = defineSecret('WA_APIKEY');                                // clave de CallMeBot o token de Cloud API

exports.notifyNewOrder = onDocumentCreated(
  { document: 'orders/{orderId}', region: REGION, secrets: [WA_APIKEY], maxInstances: 5 },
  async event => {
    const snap = event.data;
    if (!snap) return;
    const order = snap.data();
    const db = admin.firestore();

    try {
      // 1) Verificar precios contra el catálogo actual (las reglas no pueden hacerlo)
      const ids = [...new Set((order.items || []).map(i => i.id).filter(id => typeof id === 'string' && id && !id.includes('/')))];
      const docs = ids.length ? await db.getAll(...ids.map(id => db.collection('products').doc(id))) : [];
      const catalog = new Map(docs.filter(d => d.exists).map(d => [d.id, d.data()]));
      const v = verifyItems(order.items || [], catalog);

      // Envío: se recalcula con las zonas actuales de los ajustes
      const st0 = await db.collection('settings').doc('store').get();
      const zones = (st0.exists && st0.data().shippingZones) || [];
      const c = order.customer || {};
      const zone = c.delivery === 'envio' ? zones.find(z => z && z.name === c.zone) : null;
      const shipping = zone ? Math.max(0, Number(zone.cost) || 0) : 0;
      v.shipping = shipping;

      // Stock: se descuenta una sola vez por pedido (transacción)
      try {
        await db.runTransaction(async tx => {
          const o = await tx.get(snap.ref);
          if (!o.exists || o.data().stockApplied) return;
          const refs = ids.map(id => db.collection('products').doc(id));
          const ps = refs.length ? await tx.getAll(...refs) : [];
          for (const it of order.items || []) {
            const p = ps.find(d => d.id === it.id);
            if (p && p.exists && p.data().stock !== null && p.data().stock !== undefined) {
              const left = Math.max(0, Number(p.data().stock) - Number(it.qty || 0));
              tx.update(p.ref, { stock: left });
            }
          }
          tx.update(snap.ref, { stockApplied: true });
        });
      } catch (e) { logger.warn('No se pudo descontar el stock', { order: order.code, error: String(e && e.message) }); }

      // 2) Nombre de la tienda (opcional)
      const storeName = st0.exists ? st0.data().storeName : '';

      // 3) Armar y enviar el WhatsApp
      const text = buildMessage({ code: order.code, ...v, customer: order.customer || {}, storeName });
      await sendWhatsApp({
        provider: WA_PROVIDER.value(), phone: WA_PHONE.value(), apiKey: WA_APIKEY.value(),
        phoneId: WA_PHONE_ID.value(), template: WA_TEMPLATE.value()
      }, text);

      await snap.ref.update({
        verifiedTotal: v.verifiedTotal + shipping, priceMismatch: v.mismatch,
        whatsapp: { sent: true, provider: WA_PROVIDER.value(), at: admin.firestore.FieldValue.serverTimestamp() }
      });
      logger.info('Pedido notificado', { order: order.code });
    } catch (e) {
      // No lanzamos el error: así no se reintenta en bucle. Queda marcado en el panel de pedidos.
      logger.error('No se pudo enviar el WhatsApp', { order: order.code, error: String(e && e.message) });
      await snap.ref.update({ whatsapp: { sent: false, error: String((e && e.message) || e).slice(0, 200) } }).catch(() => {});
    }
  }
);
