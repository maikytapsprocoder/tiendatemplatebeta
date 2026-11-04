/* ─────────────────────────────────────────────────────────────
   Configuración del negocio (lo único que se cambia para vender el template a otro cliente)
   Todo esto son valores INICIALES: lo que el dueño cambie después en el panel de administración
   (Ajustes, Categorías) tiene prioridad. Dejá un campo vacío ('') para no usarlo.
   ───────────────────────────────────────────────────────────── */
window.NEGOCIO = {
  storeName: 'Nodo Tecno',
  tagline: 'Tecnología y electrodomésticos para tu casa',
  brandColor: '#2347F5',          // color principal (barra superior, botones, precios)
  logo: '',                       // enlace a la imagen del logo (vacío = se usa el nombre en texto)
  instagram: '',                  // https://instagram.com/tu_negocio
  facebook: '',                   // https://facebook.com/tu_negocio
  contactWhatsapp: '59898297449', // WhatsApp que ve el público (código de país, sin +)
  address: 'Espinosa 182, Mercedes, Soriano',
  hours: ['Lunes a Viernes: 8:00 a 12:00 y 12:30 a 20:30'],

  /* Categorías iniciales. Campos: id (sin espacios), name, blurb (frase corta), image (foto para el mosaico, opcional),
     art (ilustración si el producto no tiene foto: box, shirt, phone, laptop, fridge, ...), acc (color), order.
     Después se editan desde el panel > Categorías. Ejemplos listos para copiar al final del archivo. */
  categories: [
    { id: 'perifericos',       name: 'Periféricos',       blurb: 'Mouse, teclados, auriculares, monitores y más', art: 'headset', acc: '#2347F5', tint: '#E7ECFF' },
    { id: 'telefonos',         name: 'Teléfonos',         blurb: 'Smartphones, cargadores y accesorios',          art: 'phone',   acc: '#F26B3A', tint: '#FFEBDD' },
    { id: 'electrodomesticos', name: 'Electrodomésticos', blurb: 'Heladeras, lavarropas, cocina y hogar',         art: 'fridge',  acc: '#0FA37F', tint: '#DFF4EA' },
    { id: 'computacion',       name: 'PCs y componentes', blurb: 'Laptops, PCs armadas y componentes',            art: 'laptop',  acc: '#6B4DF0', tint: '#ECE8FF' }
  ],
  branches: []  // sucursales: [{ name: 'Sucursal Centro', address: 'Calle 123', image: 'https://…', link: 'https://maps…' }]
};

/* EJEMPLOS DE RUBROS (copiá el bloque que quieras dentro de categories):
   Ropa:   { id:'hombre', name:'Hombre', art:'shirt', acc:'#222222' }, { id:'mujer', name:'Mujer', art:'shirt', acc:'#C2185B' }, { id:'calzado', name:'Calzado', art:'box' }
   Caza y pesca (solo catálogo y consultas): { id:'camping', name:'Camping', art:'box' }, { id:'pesca', name:'Pesca', art:'box' }, { id:'indumentaria', name:'Indumentaria', art:'shirt' }
*/
