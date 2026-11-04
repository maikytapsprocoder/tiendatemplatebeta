/* ───────── Datos de ejemplo (marcas y precios ficticios) ─────────
   Se cargan solos en modo demo, o desde Panel > Ajustes > "Cargar productos de ejemplo". */

const DEFAULT_ZONES = [
  { name: 'Mercedes', km: 0, cost: 0 },
  { name: 'Fray Bentos', km: 35, cost: 70 },
  { name: 'Villa Soriano', km: 35, cost: 70 },
  { name: 'Dolores', km: 40, cost: 70 },
  { name: 'Palmitas', km: 40, cost: 70 },
  { name: 'José Enrique Rodó', km: 80, cost: 120 },
  { name: 'Young', km: 85, cost: 130 },
  { name: 'Nueva Palmira', km: 90, cost: 130 },
  { name: 'Carmelo', km: 95, cost: 140 },
  { name: 'Cardona', km: 105, cost: 150 },
  { name: 'Paysandú', km: 120, cost: 170 },
  { name: 'Trinidad', km: 125, cost: 170 },
  { name: 'Colonia del Sacramento', km: 155, cost: 210 },
  { name: 'Durazno', km: 160, cost: 220 },
  { name: 'San José de Mayo', km: 195, cost: 260 },
  { name: 'Florida', km: 220, cost: 290 },
  { name: 'Salto', km: 240, cost: 310 },
  { name: 'Montevideo', km: 290, cost: 370 },
  { name: 'Tacuarembó', km: 295, cost: 380 },
  { name: 'Rivera', km: 405, cost: 500 }
];

const DEFAULT_TERMS = `## Cómo comprar
Armás tu carrito, confirmás el pedido con tus datos y el local se comunica con vos por WhatsApp para confirmar disponibilidad, medio de pago y entrega.

## Precios y disponibilidad
Los precios están en pesos uruguayos y pueden cambiar sin aviso. La disponibilidad se confirma al contactarte.

## Entregas
- Retiro en el local: sin costo.
- Envío dentro de Mercedes: sin costo.
- Otras localidades: el costo depende de la distancia y se muestra al elegir la localidad en el pedido.

## Garantía, cambios y devoluciones
Las condiciones de garantía, cambio y devolución dependen de cada producto. Consultalas en el local o por WhatsApp antes de comprar.`;

const DEFAULT_PRIVACY = `## Qué datos pedimos
Al hacer un pedido te pedimos tu nombre, un teléfono de contacto y, si elegís envío, la dirección de entrega.

## Para qué los usamos
Solo para gestionar tu pedido y comunicarnos con vos. No vendemos ni cedemos tus datos a terceros.

## Dónde se guardan
Los pedidos se guardan en servicios de Google Firebase, con acceso restringido al personal del local.

## Tus derechos
Podés pedir ver, corregir o eliminar tus datos escribiéndonos por WhatsApp o al correo de contacto.`;

const DEFAULT_SERVICES = `## Servicios técnicos
- Reparación de PC y notebooks
- Armado de computadoras a medida
- Mantenimiento y limpieza
- Instalación de sistemas operativos y programas
- Asesoramiento para elegir tu equipo

Consultanos por WhatsApp para pedir un presupuesto.`;

const DEFAULT_SETTINGS = {
  brandColor: '#2347F5',
  logo: '',
  instagram: '',
  facebook: '',
  branches: [],
  storeName: 'Nodo Tecno',
  tagline: 'Tecnología y electrodomésticos para tu casa',
  perks: ['Hacé tu pedido online y coordinamos la entrega', 'Retiro en el local', 'Atención personalizada por WhatsApp'],
  payMethods: ['Efectivo', 'Transferencia bancaria', 'Tarjeta en el local'],
  footerInfo: '',
  linkFallback: false,
  waNumber: '',
  contactWhatsapp: '59898297449',
  contactEmail: '',
  address: 'Espinosa 182, Mercedes, Soriano',
  hours: ['Lunes a Viernes: 8:00 a 12:00 y 12:30 a 20:30'],
  shippingZones: DEFAULT_ZONES,
  maxPerProduct: 10,
  maxUnits: 30,
  pageTerms: DEFAULT_TERMS,
  pagePrivacy: DEFAULT_PRIVACY,
  pageServices: DEFAULT_SERVICES,
  ...(() => { const n = { ...(window.NEGOCIO || {}) }; delete n.categories; return n; })()
};

const _P = (id, category, sub, name, brand, price, oldPrice, stock, art, description, specs) =>
  ({ id, category, sub, name, brand, price, oldPrice, stock, art, description, specs, image: '', active: true });

const SEED_PRODUCTS = [
  // Periféricos
  _P('mouse-glide-x', 'perifericos', 'Mouse', 'Mouse inalámbrico Glide X', 'Voltra', 890, 1190, 24, 'mouse', 'Mouse inalámbrico silencioso para la oficina y el estudio. Se conecta por receptor USB y dura meses con una sola pila.', 'Conexión: 2.4 GHz\nSensor: 1600 DPI\nBatería: hasta 12 meses\nColor: negro'),
  _P('mouse-striker-16k', 'perifericos', 'Mouse', 'Mouse gamer Striker 16K', 'Kairo', 1490, 0, 12, 'mouse', 'Sensor óptico de alta precisión, 7 botones programables e iluminación RGB.', 'Sensor: hasta 16.000 DPI\nBotones: 7 programables\nConexión: USB con cable trenzado\nIluminación: RGB'),
  _P('teclado-clack-tkl', 'perifericos', 'Teclados', 'Teclado mecánico TKL Clack', 'Kairo', 2490, 2990, 9, 'keyboard', 'Formato compacto sin teclado numérico, switches mecánicos y retroiluminación.', 'Formato: TKL (87 teclas)\nSwitches: mecánicos rojos\nConexión: USB-C desmontable\nLayout: español'),
  _P('teclado-slim-bt', 'perifericos', 'Teclados', 'Teclado inalámbrico Slim', 'Voltra', 990, 0, 30, 'keyboard', 'Teclado delgado y silencioso, con conexión Bluetooth o receptor USB.', 'Conexión: Bluetooth 5.0 + USB\nBatería: recargable\nLayout: español\nCompatible: Windows, Android, iOS'),
  _P('aur-orbit-71', 'perifericos', 'Auriculares', 'Auriculares gamer Orbit 7.1', 'Kairo', 2190, 2690, 14, 'headset', 'Sonido envolvente virtual 7.1, almohadillas de espuma y micrófono con cancelación de ruido.', 'Sonido: 7.1 virtual\nMicrófono: desmontable\nConexión: USB\nCompatible: PC, PS5'),
  _P('aur-air-bt', 'perifericos', 'Auriculares', 'Auriculares Bluetooth Air', 'Voltra', 1590, 0, 18, 'headset', 'Livianos, plegables y con hasta 30 horas de batería.', 'Conexión: Bluetooth 5.3\nBatería: hasta 30 h\nCarga: USB-C\nMicrófono integrado'),
  _P('monitor-27-qhd', 'perifericos', 'Monitores', 'Monitor 27" QHD 165 Hz', 'Lumia', 12990, 14990, 6, 'monitor', 'Panel IPS QHD con 165 Hz para jugar y trabajar con colores precisos.', 'Tamaño: 27 pulgadas\nResolución: 2560 x 1440\nFrecuencia: 165 Hz\nPuertos: HDMI x2, DisplayPort'),
  _P('parlantes-boom-21', 'perifericos', 'Parlantes', 'Parlantes 2.1 Boom', 'Voltra', 1890, 0, 11, 'speaker', 'Sistema 2.1 con subwoofer para la PC o la tele.', 'Potencia: 40 W RMS\nEntradas: 3.5 mm y Bluetooth\nControl de volumen en el frente'),

  // Teléfonos
  _P('nova-12-128', 'telefonos', 'Smartphones', 'Smartphone Nova 12 128 GB', 'Nova', 11990, 13990, 15, 'phone', 'Pantalla AMOLED de 6,6", cámara de 50 MP y batería para todo el día.', 'Pantalla: 6,6" AMOLED 120 Hz\nMemoria: 8 GB RAM / 128 GB\nCámara: 50 MP\nBatería: 5000 mAh'),
  _P('nova-12-pro-256', 'telefonos', 'Smartphones', 'Smartphone Nova 12 Pro 256 GB', 'Nova', 18990, 0, 7, 'phone', 'La versión más completa: más memoria, triple cámara y carga ultrarrápida.', 'Pantalla: 6,7" AMOLED 120 Hz\nMemoria: 12 GB RAM / 256 GB\nCámara: triple 108 MP\nCarga: 67 W'),
  _P('lite-a5-64', 'telefonos', 'Smartphones', 'Smartphone Lite A5 64 GB', 'Nova', 5990, 6990, 20, 'phone', 'Un celular simple y confiable para el día a día.', 'Pantalla: 6,5" HD+\nMemoria: 4 GB RAM / 64 GB\nCámara: 13 MP\nBatería: 5000 mAh'),
  _P('cargador-gan-65', 'telefonos', 'Cargadores', 'Cargador rápido 65 W GaN', 'Voltra', 1190, 0, 40, 'charger', 'Carga celulares, tablets y notebooks con un solo cargador compacto.', 'Potencia: 65 W\nPuertos: 2 x USB-C + 1 x USB-A\nTecnología: GaN'),
  _P('power-bank-20k', 'telefonos', 'Cargadores', 'Power bank 20.000 mAh', 'Voltra', 1390, 1690, 22, 'charger', 'Batería externa de gran capacidad con carga rápida.', 'Capacidad: 20.000 mAh\nSalida: 22,5 W\nPuertos: USB-C + 2 x USB-A'),
  _P('funda-antigolpes', 'telefonos', 'Fundas', 'Funda antigolpes', 'Nova', 390, 0, 60, 'case', 'Protección en las esquinas y borde elevado para la cámara y la pantalla.', 'Material: TPU reforzado\nDisponible para línea Nova'),

  // Electrodomésticos
  _P('heladera-380', 'electrodomesticos', 'Heladeras', 'Heladera No Frost 380 L', 'Hogar+', 32990, 36990, 4, 'fridge', 'Freezer superior, tecnología No Frost y estantes de vidrio templado.', 'Capacidad: 380 L\nTecnología: No Frost\nEficiencia: clase A\nColor: gris acero'),
  _P('lavarropas-8kg', 'electrodomesticos', 'Lavarropas', 'Lavarropas carga frontal 8 kg', 'Hogar+', 27990, 0, 5, 'washer', '16 programas de lavado, centrifugado de 1200 rpm y motor inverter.', 'Capacidad: 8 kg\nCentrifugado: 1200 rpm\nProgramas: 16\nMotor: inverter'),
  _P('microondas-25', 'electrodomesticos', 'Cocina', 'Microondas 25 L digital', 'Hogar+', 5490, 6290, 13, 'microwave', 'Panel digital, 10 niveles de potencia y menús automáticos.', 'Capacidad: 25 L\nPotencia: 900 W\nPlato giratorio de 27 cm'),
  _P('freidora-5l', 'electrodomesticos', 'Cocina', 'Freidora de aire 5 L', 'Hogar+', 3990, 0, 17, 'airfryer', 'Cocinás con muy poco aceite. Canasto antiadherente apto lavavajillas.', 'Capacidad: 5 L\nPotencia: 1500 W\nTemperatura: hasta 200 °C\nTemporizador: 60 min'),
  _P('robot-roby', 'electrodomesticos', 'Hogar', 'Aspiradora robot Roby', 'Roby', 11990, 14990, 8, 'robovac', 'Aspira y pasa mopa solita. Vuelve a la base cuando se queda sin batería.', 'Autonomía: 120 min\nSucción: 3000 Pa\nSensores anticaída\nControl por app'),
  _P('ventilador-pie-18', 'electrodomesticos', 'Hogar', 'Ventilador de pie 18"', 'Hogar+', 2290, 0, 25, 'fan', 'Tres velocidades, oscilación e inclinación regulable.', 'Aspas: 18 pulgadas\nPotencia: 90 W\nAltura regulable'),

  // PCs y componentes
  _P('laptop-atlas-15', 'computacion', 'Laptops', 'Laptop Atlas 15 · Ryzen 5 · 16 GB · 512 GB', 'Atlas', 27990, 31990, 8, 'laptop', 'Potencia para estudiar, trabajar y jugar. Pantalla Full HD antirreflejo.', 'Procesador: Ryzen 5 de 6 núcleos\nMemoria: 16 GB DDR4\nAlmacenamiento: 512 GB SSD NVMe\nPantalla: 15,6" Full HD'),
  _P('laptop-atlas-14', 'computacion', 'Laptops', 'Laptop Atlas 14 · Core i5 · 8 GB · 256 GB', 'Atlas', 21990, 0, 10, 'laptop', 'Liviana y portátil, ideal para la facultad y la oficina.', 'Procesador: Core i5\nMemoria: 8 GB\nAlmacenamiento: 256 GB SSD\nPantalla: 14" Full HD\nPeso: 1,4 kg'),
  _P('pc-titan-r5', 'computacion', 'PCs armadas', 'PC Gamer Titan · Ryzen 5 · 16 GB · 1 TB', 'Titan', 36990, 41990, 3, 'tower', 'Equipo armado y probado, listo para jugar en Full HD. Incluye gabinete con vidrio y 3 coolers.', 'Procesador: Ryzen 5\nPlaca de video: 8 GB GDDR6\nMemoria: 16 GB DDR4\nAlmacenamiento: 1 TB NVMe\nFuente: 600 W'),
  _P('cpu-6-nucleos', 'computacion', 'Procesadores', 'Procesador 6 núcleos 4,5 GHz', 'Core-X', 8990, 0, 9, 'cpu', 'Procesador de 6 núcleos y 12 hilos para escritorio.', 'Núcleos / hilos: 6 / 12\nFrecuencia máxima: 4,5 GHz\nSocket: AM4\nIncluye cooler'),
  _P('gpu-8gb-gddr6', 'computacion', 'Placas de video', 'Placa de video 8 GB GDDR6', 'Kairo', 21990, 24990, 5, 'gpu', 'Para jugar en Full HD y QHD con trazado de rayos.', 'Memoria: 8 GB GDDR6\nVentiladores: 2\nSalidas: HDMI + 3 x DisplayPort\nConsumo: 160 W'),
  _P('ram-16-3200', 'computacion', 'Memorias RAM', 'Memoria RAM 16 GB DDR4 3200 MHz', 'Core-X', 1690, 0, 35, 'ram', 'Un módulo de 16 GB para renovar tu PC de escritorio.', 'Capacidad: 16 GB\nTipo: DDR4\nFrecuencia: 3200 MHz'),
  _P('ssd-nvme-1tb', 'computacion', 'Almacenamiento', 'Disco SSD NVMe 1 TB', 'Core-X', 3490, 3990, 19, 'ssd', 'Arranque en segundos y velocidades de lectura de hasta 3500 MB/s.', 'Capacidad: 1 TB\nInterfaz: NVMe M.2\nLectura: hasta 3500 MB/s'),
  _P('gabinete-atx-vidrio', 'computacion', 'Gabinetes', 'Gabinete ATX vidrio templado · 3 fans', 'Titan', 3290, 0, 12, 'tower', 'Panel lateral de vidrio y 3 ventiladores RGB incluidos.', 'Formato: ATX / mATX\nVentiladores: 3 x 120 mm RGB\nPanel: vidrio templado')
];

const SEED_BANNERS = [
  { id: 'b-compu', order: 1, active: true, title: 'Semana de la computación', subtitle: 'Laptops, PCs y componentes con precios rebajados.', cta: 'Ver ofertas en PCs', link: 'computacion', color: '#2347F5', art: 'laptop', image: '' },
  { id: 'b-cel', order: 2, active: true, title: 'Tu próximo celular está acá', subtitle: 'Smartphones desde $ 5.990 y accesorios para cuidarlo.', cta: 'Ver teléfonos', link: 'telefonos', color: '#E8552B', art: 'phone', image: '' },
  { id: 'b-cocina', order: 3, active: true, title: 'Renová tu cocina', subtitle: 'Heladeras, microondas y freidoras de aire.', cta: 'Ver electrodomésticos', link: 'electrodomesticos', color: '#0B8F6C', art: 'fridge', image: '' },
  { id: 'b-ofertas', order: 4, active: true, title: 'Todas las ofertas en un solo lugar', subtitle: 'Productos con precio rebajado por tiempo limitado.', cta: 'Ver todas las ofertas', link: 'ofertas', color: '#0E1A2B', art: 'headset', image: '' }
];

/* Fechas de creación escalonadas para que el orden por defecto sea estable */
function seedProducts() {
  const base = Date.now();
  return SEED_PRODUCTS.map((p, i) => ({ ...p, createdAt: base - i * 1000 }));
}
