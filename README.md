# Nodo Tecno · tienda de tecnología con Firebase

Tienda web con secciones de **Periféricos, Teléfonos, Electrodomésticos y PCs/componentes**, carrito con totales automáticos, pedidos guardados en Firebase, **aviso por WhatsApp sin que el cliente vea el número** y panel de administración para editar productos, precios, ofertas e imágenes.

Todo el sitio es un solo archivo (`docs/index.html`) más `docs/firebase-config.js`. Sin build obligatorio.

## Probarla ya (modo demo)

Abrí `docs/index.html` en el navegador. Mientras `firebase-config.js` tenga los valores `TU_...`, la tienda corre en **modo demo**: datos de ejemplo guardados solo en tu navegador. Para entrar al panel: pie de página > "Acceso administradores" (usuario `user`, contraseña `123456`).

## Publicarla en GitHub Pages

1. Subí todo el contenido de esta carpeta a tu repositorio.
2. En GitHub: Settings > Pages > Source: *Deploy from a branch*, rama `main`, carpeta `/docs`.
3. La tienda queda en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.
4. En Firebase > Authentication > Configuración > Dominios autorizados, agregá `TU_USUARIO.github.io`.

Las reglas y la función de WhatsApp igual se despliegan con la CLI de Firebase (pasos 5 y 7 de abajo).

## Publicarla con Firebase

Necesitás Node.js y `npm i -g firebase-tools`.

1. **Proyecto**: en https://console.firebase.google.com creá un proyecto. Agregá una **app web** (`</>`) y copiá la configuración en `docs/firebase-config.js`.
2. **Firestore**: Build > Firestore Database > Crear base de datos. Elegí la región y anotala (se usa en el paso 7).
3. **Usuario administrador** (hacelo *antes* de publicar el sitio):
   - Build > Authentication > Comenzar > Método de acceso > activá **Correo electrónico/contraseña**.
   - Pestaña Users > Agregar usuario: correo `user@tienda-admin.local`, contraseña `123456`.
   - Authentication > Configuración > Acciones del usuario: **desactivá "Habilitar creación (registro)"**, para que nadie más pueda crear cuentas.
   - En el panel se escribe solo `user`; la tienda le agrega `@tienda-admin.local`.
4. **Iniciá sesión en la CLI y vinculá el proyecto** (en esta carpeta): `firebase login` y `firebase use --add`.
5. **Reglas y sitio**: `firebase deploy --only firestore:rules,hosting`.
6. **Primer ingreso**: abrí tu sitio, "Acceso administradores", entrá, andá a **Ajustes** y **cambiá la contraseña**. Después cargá tus productos (o usá "Cargar productos de ejemplo" para ver cómo queda).
7. **WhatsApp automático** (ver más abajo): `firebase deploy --only functions`.

> **Contraseña `123456`**: es la que pediste, pero es muy fácil de adivinar y el usuario `user` también. Cambiala desde Ajustes apenas entres. Quien entre como admin puede cambiar precios y ver los datos de los clientes.

## Cómo se manda el WhatsApp (sin que el cliente lo vea)

Un enlace `wa.me` siempre abre WhatsApp en el celular del cliente, con el número a la vista. Para que **no vea nada**, el envío se hace desde el servidor:

1. El cliente toca **Confirmar pedido** y la tienda guarda el pedido en Firestore. El cliente solo ve "¡Recibimos tu pedido!".
2. La Cloud Function `notifyNewOrder` (`functions/index.js`) se dispara sola, **recalcula el total con los precios reales** del catálogo y manda el mensaje a **+598 98 297 449**. Ese número vive solo en el servidor.
3. En el panel > Pedidos ves cada pedido con su estado de WhatsApp (enviado, pendiente o falló), y un botón para escribirle al cliente.

Las funciones salientes a internet requieren el **plan Blaze** de Firebase (pago por uso; con pocos pedidos el costo es mínimo o cero, pero pide tarjeta).

### Opción A: CallMeBot (gratis, la más simple)
Sirve para recibir mensajes en **tu propio número**. Seguí las instrucciones actuales de https://www.callmebot.com para autorizar tu número y obtener una `apikey`. Luego:

```
firebase functions:secrets:set WA_APIKEY      # pegá la apikey
cp functions/.env.example functions/.env      # revisá WA_PHONE=59898297449
firebase deploy --only functions
```

### Opción B: WhatsApp Cloud API (oficial de Meta)
Más robusta, con más trámite (cuenta de Meta Business). En `functions/.env` poné `WA_PROVIDER=cloudapi` y `WA_PHONE_ID=<id del número>`, y guardá el token con `firebase functions:secrets:set WA_APIKEY`. Meta solo permite texto libre dentro de las 24 h posteriores a que el destinatario te escribió; fuera de esa ventana hace falta una plantilla aprobada (`WA_TEMPLATE`, con un único parámetro de cuerpo).

### Región
En `functions/index.js`, `REGION` debe coincidir con la región de tu Firestore (por defecto `us-central1`).

### Respaldo sin servidor
Si no querés usar Functions todavía: Panel > Ajustes > "Respaldo". Al comprar, se abre el WhatsApp del cliente con el mensaje armado y el cliente lo envía. **En ese modo el cliente sí ve el número.** Está desactivado por defecto.

## Qué hace el panel de administración (`#/admin`)

- **Productos**: editar precio, precio anterior (con valor mayor al precio se muestra como oferta con etiqueta de descuento) y stock directamente en la lista; mostrar/ocultar; crear, editar y eliminar con descripción, características e imagen.
- **Imágenes**: pegar un enlace o subir una foto (se achica y se guarda en Firestore, sin Firebase Storage). Sin foto se usa una ilustración.
- **Ofertas y banners**: los banners de la portada (título, texto, botón, destino, color, imagen, orden).
- **Pedidos**: en tiempo real, con aviso de pedido nuevo, estados y detalle.
- **Ajustes**: nombre, frase, beneficios, medios de pago que aceptás, pie de página, cambio de contraseña, carga de datos de ejemplo.

Los cambios llegan a los clientes en segundos: la tienda escucha Firestore en tiempo real.

## Seguridad

`firestore.rules` permite a cualquiera **leer** catálogo, banners y ajustes, y **crear** pedidos (con validación de forma y tamaño). Solo los administradores listados en `isAdmin()` pueden escribir o ver pedidos. Para sumar otro administrador: creá el usuario en Authentication y agregá su correo a esa lista; luego `firebase deploy --only firestore:rules`.

## Estructura

```
docs/index.html        sitio completo (generado)
docs/firebase-config.js  tu configuración de Firebase
src/                     fuentes del sitio; `node scripts/build.js` regenera docs/index.html
functions/               Cloud Function de WhatsApp (index.js, lib.js) y su prueba (node test.js)
firestore.rules          reglas de seguridad
firebase.json            hosting + reglas + functions
```

Los productos de ejemplo tienen marcas y precios ficticios: reemplazalos por los tuyos.

## Novedades de esta versión

- **Envíos por localidad**: Mercedes sin costo; el resto de $ 50 a $ 500 según distancia (valores estimados, editables en Ajustes > Envíos). Localidades no listadas: se coordina por WhatsApp.
- **Stock automático**: se descuenta al confirmar el pedido (Cloud Function; si no está activa, el panel lo aplica al abrirse).
- **Seguimiento**: `#/pedido/CÓDIGO`. Requiere publicar `firestore.rules` (colección `orderStatus`).
- **Límites**: unidades por pedido y por producto (Ajustes), más protección anti-robot y anti-duplicados.
- **Enlace por producto** (`#/p/ID`), varias fotos por producto, buscador tolerante a errores, flechas en banners.
- **Redes**: `docs/og.png` es la imagen al compartir. Para que funcione, poné en `index.template.html` la URL absoluta de tu sitio en `og:image`. Con hosting estático la vista previa es la misma para todo el sitio (no por producto).
- Páginas: Contacto/mapa/horarios, Servicios, Condiciones, Privacidad (textos de ejemplo, editables en Ajustes).

## Template para varios negocios (etapa 1)

- **`docs/negocio.config.js`** es lo único que se cambia por cliente: nombre, logo, color de marca, redes, WhatsApp, dirección, horarios, categorías iniciales y sucursales. Trae ejemplos de rubros (ropa, caza y pesca).
- **Categorías editables** desde el panel (pestaña Categorías): crear, renombrar, ordenar, cambiar foto y color. No se puede borrar una que tenga productos. Requiere publicar `firestore.rules` (colección `categories`).
- **Color de marca, logo y sucursales** también se editan en Ajustes.
- Rediseño: barra superior con buscador, menú Tienda, mosaico de categorías con foto, carrusel de ofertas, sucursales, paginación y carrito flotante.
- Para armar la tienda de un cliente nuevo: copiá el proyecto, editá `negocio.config.js` y `firebase-config.js`, `node scripts/build.js`, y publicá reglas.
