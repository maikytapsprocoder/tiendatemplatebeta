/* ─────────────────────────────────────────────────────────────
   PLANTILLA EN BLANCO para un cliente nuevo.
   1) Copiá este archivo encima de negocio.config.js   2) Completá lo de abajo   3) Cargá tu firebase-config.js
   La tienda arranca SIN productos, banners ni categorías: el dueño las crea desde el panel (#/admin).
   ───────────────────────────────────────────────────────────── */
window.NEGOCIO = {
  sampleData: false,                 // false = sin datos de ejemplo
  storeName: 'Mi Tienda',
  tagline: 'Escribí acá la frase del negocio',
  brandColor: '#C00000',             // color principal (barra superior, botones, precios)
  logo: '',                          // enlace a la imagen del logo (vacío = nombre en texto)
  instagram: '',
  facebook: '',
  contactWhatsapp: '',               // WhatsApp público, con código de país y sin + (ej.: 59899123456)
  address: '',
  hours: [],                         // ej.: ['Lunes a Viernes: 9 a 18']
  categories: [],                    // vacío: se crean desde el panel. Ejemplos de rubros al final.
  branches: []
};
/* Ejemplos de categorías (opcional, copiá dentro de categories):
   Ropa:  { id:'hombre', name:'Hombre', art:'shirt', acc:'#222222' }, { id:'mujer', name:'Mujer', art:'shirt', acc:'#C2185B' }
   Caza y pesca: { id:'camping', name:'Camping', art:'box' }, { id:'pesca', name:'Pesca', art:'box' }
*/
