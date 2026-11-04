// Prueba local de la lógica de mensajes y envío (con fetch simulado). Uso: node test.js
const assert = require('assert');
const { verifyItems, buildMessage, sendWhatsApp } = require('./lib');

const catalog = new Map([['a', { price: 890 }], ['b', { price: 2490 }]]);

// Precios correctos
let v = verifyItems([{ id: 'a', name: 'Mouse', price: 890, qty: 2 }, { id: 'b', name: 'Teclado', price: 2490, qty: 1 }], catalog);
assert.strictEqual(v.mismatch, false);
assert.strictEqual(v.verifiedTotal, 4270);

// Precio manipulado o producto inexistente → se detecta y se usa el precio real
v = verifyItems([{ id: 'a', name: 'Mouse', price: 1, qty: 2 }], catalog);
assert.strictEqual(v.mismatch, true);
assert.strictEqual(v.verifiedTotal, 1780);
assert.strictEqual(verifyItems([{ id: 'zzz', name: 'X', price: 5, qty: 1 }], catalog).mismatch, true);

const msg = buildMessage({ code: 'P-1', ...v, customer: { name: 'Ana', phone: '099123456', delivery: 'envio', address: 'Calle 1', zone: 'Dolores', payment: 'Efectivo', note: 'Tocar timbre' }, storeName: 'Nodo', shipping: 100 });
assert.ok(msg.includes('Nuevo pedido P-1') && msg.includes('Envío a: Calle 1 (Dolores)') && msg.includes('Envío: $ 100') && msg.includes('Total: $ 1.880') && msg.includes('Pago: Efectivo') && msg.includes('⚠️'));

(async () => {
  // CallMeBot
  let seen;
  await sendWhatsApp({ provider: 'callmebot', phone: '59898297449', apiKey: 'K' }, 'hola\nmundo', async url => { seen = url; return { ok: true, status: 200, text: async () => 'Message queued' }; });
  assert.ok(seen.startsWith('https://api.callmebot.com/whatsapp.php?phone=%2B59898297449&text=hola%0Amundo&apikey=K'));
  await assert.rejects(sendWhatsApp({ provider: 'callmebot', phone: '59898297449', apiKey: 'K' }, 'x', async () => ({ ok: true, status: 200, text: async () => 'ERROR: apikey invalid' })), /CallMeBot/);

  // Cloud API (texto y plantilla)
  let call;
  const fake = async (url, opt) => { call = { url, opt }; return { ok: true, status: 200, text: async () => '{}' }; };
  await sendWhatsApp({ provider: 'cloudapi', phone: '+598 98 297 449', apiKey: 'T', phoneId: '123' }, 'a\nb', fake);
  assert.strictEqual(JSON.parse(call.opt.body).to, '59898297449');
  assert.strictEqual(JSON.parse(call.opt.body).type, 'text');
  await sendWhatsApp({ provider: 'cloudapi', phone: '59898297449', apiKey: 'T', phoneId: '123', template: 'pedido_nuevo' }, 'a\nb', fake);
  assert.strictEqual(JSON.parse(call.opt.body).template.components[0].parameters[0].text, 'a | b');

  // Errores de configuración
  await assert.rejects(sendWhatsApp({ provider: 'callmebot', phone: '', apiKey: 'K' }, 'x', fake), /WA_PHONE/);
  await assert.rejects(sendWhatsApp({ provider: 'callmebot', phone: '598', apiKey: '' }, 'x', fake), /WA_APIKEY/);
  console.log('OK: todas las pruebas pasaron');
})().catch(e => { console.error('FALLÓ', e); process.exit(1); });
