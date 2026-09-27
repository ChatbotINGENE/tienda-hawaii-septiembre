/* ════════════════════════════════════════════════════════════════
   Hawaii — Catálogo Preventa Septiembre 2026 (estilo Simán + Vidrí)

   Los datos (SECCIONES, PORTADA_PIEZAS) vienen de datos.js, el mismo
   archivo del catálogo hojeable; lo copia tienda_septiembre.py.

   El catálogo son hojas en fila dentro de un visor que se desliza de
   lado. Todo salto —índice, flechas, teclado— es a un NÚMERO de hoja y se
   hace con scrollTo sobre el visor, que no depende del alto de nada: por
   eso cada botón llega siempre a su página.
   ════════════════════════════════════════════════════════════════ */
'use strict';

const TIENDA = {
  nombre:     'Almacén Hawaii',
  whatsapp:   '50379516056',
  telVisible: '+503 7951-6056',
  temporada:  'Preventa de Septiembre 2026',
  minimo:     100,                    // monto mínimo de compra, del PDF
  lugares: [
    { titulo: 'Tienda', lineas: ['Pasaje Montalvo', 'Edificio Byssa, Local #7', 'Centro Histórico, San Salvador'],
      maps: 'https://share.google/QvlfcP4zYmuUkCU0i',
      waze: 'Pasaje Montalvo, Edificio Byssa Local 7, Centro Histórico, San Salvador, El Salvador' },
    { titulo: 'Centro de distribución Don Rua', lineas: ['Edificio Moreno', '5 Avenida Nte. 1135', 'San Salvador'],
      maps: 'https://share.google/BGDx38qoRTvQgeZKC',
      waze: 'Edificio Moreno, 5a Avenida Norte 1135, San Salvador, El Salvador' },
  ],
};

// Las condiciones, tal cual la última hoja del PDF de marketing.
const CONDICIONES = [
  ['Respecto a la reserva', 'Monto mínimo de compra de $100 · Reserva de pedido válida hasta el 5 de octubre'],
  ['Respecto al pago', 'Pago contra entrega · Medios de pago autorizados: Transferencias y efectivo · No válido pago con tarjeta'],
  ['Para la entrega del pedido', 'Retiro puede ser en tienda o en centro de distribución Don Rua · Disponible entrega a domicilio'],
];

// Una línea por departamento, para su apertura.
const BAJADAS = {
  'flores': 'Ramos, varas y botones que llenan de color una mesa, un altar o una vitrina.',
  'follajes-y-guias': 'El verde que completa todo: rellenos, enredaderas y paredes de follaje.',
  'macetas': 'De la copa clásica al barro de siempre: la base para lucir cada arreglo.',
  'coronas-y-disfraces': 'Para la reina de la fiesta, el ángel del acto y el vaquero de la temática.',
  'juguetes': 'Los clásicos que nunca fallan en piñatas, bolsitas y tardes de juego.',
  'detalles-y-manualidades': 'Los pequeños toques que hacen especial un regalo o una celebración.',
};

const POR_HOJA = 4;
const LLAVE = 'hawaii-catalogo-septiembre-2026';

/* ── Utilerías ─────────────────────────────────────────────────── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Number(n).toFixed(2);
const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// En la versión de un solo archivo las fotos de apertura y el logo viajan
// adentro (window.APERTURAS, window.LOGOS); en la del link se bajan.
const fotoApertura = id => (window.APERTURAS && window.APERTURAS[id]) || `img/aperturas/${id}.webp`;
const logo = blanco => {
  const n = blanco ? 'logo-hawaii-blanco' : 'logo-hawaii';
  return (window.LOGOS && window.LOGOS[n]) || `img/marca/${n}.png`;
};

const TONOS = {
  'amarillo': '#F2C230', 'amarillo mostaza': '#C9A233', 'azul': '#2E5F9E', 'blanco': '#F5F2EA',
  'cafe': '#7A4A2E', 'cafe oscuro': '#4A2D1C', 'celeste': '#8CC7E8', 'dorado': '#C9A227',
  'fucsia': '#E5197B', 'melocoton': '#F4B08A', 'morado': '#7B3F9E', 'naranja': '#EE7A2B',
  'negro': '#222222', 'perla': '#F1EADB', 'plateado': '#BFC5CA', 'rojo': '#C0392B',
  'rosado': '#F2A7C3', 'rosado intenso': '#E0508E', 'salmon': '#F2A283', 'verde': '#1E6B45',
  'verde claro': '#8CC66B', 'verde oscuro': '#1F4D2E',
};
const ARCOIRIS = 'conic-gradient(#E5197B, #F2C230, #1E6B45, #2E5F9E, #7B3F9E, #E5197B)';
function fondoColor(nombre) {
  const n = sinTildes(nombre);
  if (n === 'multicolor') return ARCOIRIS;
  const c = n.split(/[-\/]/).map(p => TONOS[p.trim()] || '#C9BFAE');
  if (c.length === 1) return c[0];
  return `linear-gradient(135deg, ${c.map((h, i) => `${h} ${i * 100 / c.length}% ${(i + 1) * 100 / c.length}%`).join(', ')})`;
}

/* ── Los productos ─────────────────────────────────────────────── */
const PRODUCTOS = SECCIONES.flatMap(s => s.productos.map(p => ({ ...p, depto: s.nombre })));
const POR_ID = new Map(PRODUCTOS.map(p => [p.id, p]));
const POR_SKU = new Map(PRODUCTOS.map(p => [p.variantes[0].sku, p]));
const AHORRO_MAX = Math.max(...PRODUCTOS.map(p => p.ahorro));

/* ════════════════════════════════════════════════════════════════
   Las hojas
   ════════════════════════════════════════════════════════════════ */

function flotantes(piezas) {
  return (piezas || []).map(x => {
    const p = POR_SKU.get(x.sku);
    return `<button class="flota" data-id="${p ? esc(p.id) : ''}" aria-label="${p ? 'Ver ' + esc(p.nombre) : ''}"
      style="left:${x.izq}%; top:${x.arriba}%; width:${x.ancho}%; height:${x.alto}%;
             --seg:${x.seg}s; --demora:${x.demora}s; --giro:${x.giro}deg">
      <img src="${esc(x.img)}" alt="" loading="lazy"></button>`;
  }).join('');
}

const cab = derecha => `<div class="cab"><img src="${logo(false)}" alt="Hawaii"><span>${derecha}</span></div>`;
const pie = n => `<div class="pie-hoja"><span>Precios de preventa por unidad · Reserva hasta el 5 de octubre</span><b>${n}</b></div>`;

function hojaPortada() {
  return `<article class="hoja a-sangre portada">
    <img class="fondo" src="${fotoApertura('portada')}" alt="">
    ${flotantes((typeof PORTADA_PIEZAS !== 'undefined' ? PORTADA_PIEZAS : []).slice(0, 2))}
    <img class="p-logo" src="${logo(true)}" alt="Hawaii — Imagina, crea, comparte">
    <div class="p-texto">
      <p class="sobre">Catálogo · Nuevo producto</p>
      <h1>Preventa<br><em>de septiembre</em></h1>
      <p class="bajada">Flores, follajes, macetas y todo para tu próxima celebración, a precio de preventa.</p>
      <span class="cinta">Hasta <b>${AHORRO_MAX}%</b> de ahorro</span>
      <div class="p-pie"><span>${PRODUCTOS.length} PRODUCTOS · 2026</span><span>DESLIZÁ PARA VER →</span></div>
    </div>
  </article>`;
}

function hojaIndice(n, entradas) {
  const filas = entradas.map(e => `
    <li><button class="ir-depto" data-ir="${e.n}">
      <img src="${esc(e.foto)}" alt="" loading="lazy">
      <span><b>${esc(e.nombre)}</b><small>${e.cuantos} artículos · desde ${money(e.desde)}</small></span>
      <span class="pg">Pág. ${e.n + 1}<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span>
    </button></li>`).join('');
  const conds = CONDICIONES.map(([t, d]) => `<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('');
  return `<article class="hoja papel">
    ${cab('Preventa septiembre 2026')}
    <h2 class="titulo">En este <em>catálogo</em></h2>
    <ol class="indice-hoja">${filas}</ol>
    <div class="condiciones-hoja"><h3>Condiciones</h3>${conds}</div>
    ${pie(n + 1)}
  </article>`;
}

function hojaApertura(s, i) {
  const desde = Math.min(...s.productos.map(p => p.variantes[0].preventa));
  const max = Math.max(...s.productos.map(p => p.ahorro));
  return `<article class="hoja a-sangre apertura">
    <img class="fondo" src="${fotoApertura(s.id)}" alt="" loading="lazy">
    ${flotantes(s.portada.piezas)}
    <div class="a-texto">
      <span class="a-num">${String(i + 1).padStart(2, '0')}</span>
      <h2>${esc(s.nombre)}</h2>
      <p class="bajada">${esc(BAJADAS[s.id] || '')}</p>
      <div class="a-datos"><span>${s.productos.length} artículos</span><span>Desde ${money(desde)}</span><span class="rojo">Hasta ${max}% menos</span></div>
    </div>
  </article>`;
}

function card(p) {
  const v = p.variantes[0];
  const cs = p.variantes.filter(x => x.color);
  const puntos = cs.length > 1
    ? `${cs.slice(0, 5).map(x => `<i style="background:${fondoColor(x.color)}"></i>`).join('')}${cs.length > 5 ? `<small>+${cs.length - 5}</small>` : ''}`
    : '';
  return `<button class="card" data-id="${esc(p.id)}">
    <span class="card-foto">
      <img src="${esc(v.img)}" alt="${esc(p.nombre)}" loading="lazy"${v.llena ? ' class="llena"' : ''}>
      <span class="tag">−${p.ahorro}%</span>
    </span>
    <span class="card-cuerpo">
      <span class="card-nombre">${esc(p.nombre)}</span>
      <span class="card-cod">Cód. ${esc(v.sku)}${p.medida ? ' · ' + esc(p.medida) : ''}</span>
      <span class="card-precio"><span class="ahora">${money(v.preventa)}</span><span class="antes">Antes <s>${money(v.regular)}</s></span></span>
      <span class="card-pie">
        <span class="puntos">${puntos}</span>
        <span class="btn-agregar">${cs.length > 1 ? 'Elegir color' : 'Agregar +'}</span>
      </span>
    </span>
  </button>`;
}

function hojaProductos(s, lote, n, cual, cuantas) {
  return `<article class="hoja papel">
    ${cab(`${esc(s.nombre)}${cuantas > 1 ? ` · ${cual}/${cuantas}` : ''}`)}
    <div class="grilla">${lote.map(card).join('')}</div>
    ${pie(n + 1)}
  </article>`;
}

function hojaContra(n) {
  const lugares = TIENDA.lugares.map(l => `<div><b>${esc(l.titulo)}</b><span>${l.lineas.map(esc).join('<br>')}</span>
    <div class="ir"><a href="${esc(l.maps)}" target="_blank" rel="noopener">Maps</a>
    <a href="https://waze.com/ul?q=${encodeURIComponent(l.waze)}&navigate=yes" target="_blank" rel="noopener">Waze</a></div></div>`).join('');
  return `<article class="hoja papel contra">
    <img class="c-logo" src="${logo(false)}" alt="Hawaii — Imagina, crea, comparte">
    <h2>Cómo hacer <em>tu pedido</em></h2>
    <ol class="pasos-pedido">
      <li>Tocá cualquier producto para ver sus colores y detalles.</li>
      <li>Agregalo a tu pedido con la cantidad que necesités.</li>
      <li>Abrí “Pedido” arriba a la derecha y envialo por WhatsApp.</li>
    </ol>
    <a class="wa-grande" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">WhatsApp ${esc(TIENDA.telVisible)}</a>
    <div class="lugares">${lugares}</div>
    ${pie(n + 1)}
  </article>`;
}

/* El orden: portada, índice, y por cada departamento su apertura y sus
   hojas de cuatro. Al final, cómo pedir. */
function armar() {
  const html = [], indice = [], entradas = [];
  const meter = (h, etiqueta) => { html.push(h); indice.push(etiqueta); };

  meter(hojaPortada(), 'Portada');
  meter('', 'Índice y condiciones');           // se llena al final, cuando se saben las páginas
  SECCIONES.forEach((s, i) => {
    entradas.push({ n: html.length, nombre: s.nombre, cuantos: s.productos.length,
                    desde: Math.min(...s.productos.map(p => p.variantes[0].preventa)),
                    foto: fotoApertura(s.id) });
    meter(hojaApertura(s, i), s.nombre);
    const hojas = Math.ceil(s.productos.length / POR_HOJA);
    for (let h = 0; h < hojas; h++) {
      meter(hojaProductos(s, s.productos.slice(h * POR_HOJA, (h + 1) * POR_HOJA), html.length, h + 1, hojas), null);
    }
  });
  meter(hojaContra(html.length), 'Cómo pedir y contacto');
  html[1] = hojaIndice(1, entradas);
  return { html, indice };
}

const { html: HOJAS, indice: ETIQUETAS } = armar();
const visor = $('#visor');
visor.innerHTML = '<div class="margen"></div>' + HOJAS.map((h, i) => `<section class="pag" data-n="${i}">${h}</section>`).join('') + '<div class="margen"></div>';
const TOTAL = HOJAS.length;

/* ════════════════════════════════════════════════════════════════
   Pasar hoja
   ════════════════════════════════════════════════════════════════ */
let pw = 0, porVista = 1;

// En teléfono se ve una hoja; en pantalla ancha, dos, como un catálogo
// abierto. El ancho de la hoja sale del alto disponible.
function medir() {
  const aqui = actual();
  const W = visor.clientWidth, H = visor.clientHeight;
  porVista = W >= 900 ? 2 : 1;
  pw = Math.floor(Math.min(W / porVista, (H - 18) / 1.414 + 14));
  const margen = Math.max(0, (W - porVista * pw) / 2);
  // En el teléfono la hoja se estira hacia abajo hasta llenar la pantalla
  // (hasta 1 : 1.65): con la proporción de revista quedaba media pantalla
  // vacía. En computadora, dos hojas de revista lado a lado.
  const ancho = pw - 14;
  const alto = porVista === 1 ? Math.min(H - 18, ancho * 1.65) : ancho * 1.414;
  document.documentElement.style.setProperty('--pw', pw + 'px');
  document.documentElement.style.setProperty('--hh', Math.floor(alto) + 'px');
  $$('.margen', visor).forEach(m => { m.style.flex = `0 0 ${margen}px`; });
  visor.style.scrollPaddingLeft = margen + 'px';
  ir(aqui, false);
}

function actual() { return pw ? Math.round(visor.scrollLeft / pw) : 0; }

function ir(n, suave = true) {
  n = Math.max(0, Math.min(n, TOTAL - porVista));
  visor.scrollTo({ left: n * pw, behavior: suave ? 'smooth' : 'auto' });
  pintarFolio(n);
}

function pintarFolio(n = actual()) {
  const ultima = Math.min(TOTAL, n + porVista);
  $('#folio-texto').textContent = porVista > 1 && ultima > n + 1 ? `${n + 1}–${ultima} / ${TOTAL}` : `${n + 1} / ${TOTAL}`;
  $('#regla').style.width = (ultima / TOTAL * 100) + '%';
  $('#anterior').disabled = n <= 0;
  $('#siguiente').disabled = ultima >= TOTAL;
  $$('.i-lista button').forEach(b => b.classList.toggle('aqui', Number(b.dataset.ir) === n));
  // Las hojas que no están abiertas se atenúan: en pantalla ancha asoman
  // a los costados y distraían de las dos que se están viendo.
  $$('.pag', visor).forEach((p, i) => p.classList.toggle('fuera', i < n || i >= n + porVista));
}

$('#anterior').addEventListener('click', () => ir(actual() - porVista));
$('#siguiente').addEventListener('click', () => ir(actual() + porVista));
$('#ir-portada').addEventListener('click', () => ir(0));

let marco;
visor.addEventListener('scroll', () => { cancelAnimationFrame(marco); marco = requestAnimationFrame(() => pintarFolio()); });

// Rueda del ratón: hacia abajo pasa hoja, como en el hojeable.
let ultimaRueda = 0;
visor.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || Math.abs(e.deltaY) < 12) return;
  e.preventDefault();
  const ahora = Date.now();
  if (ahora - ultimaRueda < 550) return;
  ultimaRueda = ahora;
  ir(actual() + (e.deltaY > 0 ? porVista : -porVista));
}, { passive: false });

document.addEventListener('keydown', e => {
  if (!$$('.telon').every(t => t.hidden)) { if (e.key === 'Escape') cerrarTodo(); return; }
  if (e.key === 'ArrowRight') ir(actual() + porVista);
  if (e.key === 'ArrowLeft') ir(actual() - porVista);
});

let esperaMedir;
window.addEventListener('resize', () => { clearTimeout(esperaMedir); esperaMedir = setTimeout(medir, 120); });

/* ── Índice: el de la hoja 2 y el del botón de arriba ─────────── */
$('#i-lista').innerHTML = ETIQUETAS.map((t, n) => t
  ? `<li><button data-ir="${n}"><span>${esc(t)}</span><small>Pág. ${n + 1}</small></button></li>` : '').join('');

document.addEventListener('click', e => {
  const b = e.target.closest('[data-ir]');
  if (!b) return;
  cerrarTodo();
  ir(Number(b.dataset.ir));
});
$('#abrir-indice').addEventListener('click', () => abrir('indice'));

/* ════════════════════════════════════════════════════════════════
   Ficha
   ════════════════════════════════════════════════════════════════ */
let ficha = null;   // { p, i }

function abrirFicha(id) {
  const p = POR_ID.get(id);
  if (!p) return;
  ficha = { p, i: 0 };
  $('#f-depto').textContent = p.depto;
  $('#f-nombre').textContent = p.nombre;
  const specs = [];
  if (p.medida) specs.push(['Medida', p.medida]);
  const cs = p.variantes.filter(v => v.color);
  if (cs.length) specs.push([cs.length > 1 ? 'Colores' : 'Color', cs.length > 1 ? `${cs.length} disponibles` : cs[0].color]);
  specs.push(['Precio', 'Por unidad']);
  $('#f-specs').innerHTML = specs.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('');
  $('#f-colores-caja').hidden = cs.length < 2;
  $('#f-colores').innerHTML = p.variantes.map((v, k) =>
    `<button class="muestra" role="radio" data-k="${k}" title="${esc(v.color)}" aria-label="${esc(v.color)}"><span style="background:${fondoColor(v.color)}"></span></button>`).join('');
  $('#f-cant').value = 1;
  pintarVariante();
  abrir('ficha');
}

function pintarVariante() {
  const { p, i } = ficha;
  const v = p.variantes[i];
  $('#f-img').src = v.img;
  $('#f-img').alt = `${p.nombre}${v.color ? ' — ' + v.color : ''}`;
  $('#f-cod').textContent = `Código ${v.sku}`;
  $('#f-antes').textContent = 'Antes ' + money(v.regular);
  $('#f-ahora').textContent = money(v.preventa);
  $('#f-ahorras').textContent = `Ahorrás ${money(v.regular - v.preventa)}`;
  $('#f-tag').textContent = `−${v.ahorro}%`;
  $('#f-color').textContent = v.color;
  $$('#f-colores .muestra').forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.k) === i)));
}

$('#f-colores').addEventListener('click', e => {
  const b = e.target.closest('.muestra');
  if (!b) return;
  ficha.i = Number(b.dataset.k);
  pintarVariante();
});
$$('[data-cant]').forEach(b => b.addEventListener('click', () => {
  const inp = $('#f-cant');
  inp.value = Math.min(99, Math.max(1, (Number(inp.value) || 1) + Number(b.dataset.cant)));
}));
$('#f-agregar').addEventListener('click', () => {
  const { p, i } = ficha;
  const v = p.variantes[i];
  const cant = Math.min(99, Math.max(1, Number($('#f-cant').value) || 1));
  agregar(p, v, cant);
  cerrarTodo();
  brindis(`${cant} × ${p.nombre}${v.color ? ` (${v.color})` : ''} agregado`);
});

// Tocar la tarjeta abre la ficha. "Agregar +" agrega directo cuando el
// producto trae un solo color; "Elegir color" abre la ficha.
visor.addEventListener('click', e => {
  const c = e.target.closest('.card, .flota');
  if (!c || !c.dataset.id) return;
  const p = POR_ID.get(c.dataset.id);
  if (p && e.target.closest('.btn-agregar') && p.variantes.length === 1) {
    agregar(p, p.variantes[0], 1);
    brindis(`${p.nombre} agregado a tu pedido`);
    return;
  }
  abrirFicha(c.dataset.id);
});

/* ════════════════════════════════════════════════════════════════
   El pedido
   ════════════════════════════════════════════════════════════════ */
// Un mismo código trae varios colores (la gerbera: nueve), así que el
// renglón se distingue por código y color.
let pedido = [];
try { pedido = JSON.parse(localStorage.getItem(LLAVE)) || []; } catch (_) { pedido = []; }
const guardar = () => { try { localStorage.setItem(LLAVE, JSON.stringify(pedido)); } catch (_) {} };
const claveDe = v => `${v.sku}|${v.color}`;

// La foto del renglón se busca en el catálogo abierto y no en lo guardado:
// en la versión de un solo archivo las fotos van adentro.
const fotoDe = x => {
  for (const p of PRODUCTOS) for (const v of p.variantes)
    if (v.sku === x.sku && v.color === x.color) return v.img;
  return x.img;
};

function agregar(p, v, cant) {
  const clave = claveDe(v);
  const ya = pedido.find(x => x.clave === clave);
  if (ya) ya.cant = Math.min(99, ya.cant + cant);
  else pedido.push({ clave, sku: v.sku, nombre: p.nombre, color: v.color, medida: p.medida || '',
                     regular: v.regular, preventa: v.preventa, img: v.img, cant });
  guardar(); pintarPedido();
  const g = $('#contador'); g.classList.remove('late'); void g.offsetWidth; g.classList.add('late');
}

const totales = () => pedido.reduce((a, x) => ({
  piezas: a.piezas + x.cant, regular: a.regular + x.regular * x.cant, preventa: a.preventa + x.preventa * x.cant,
}), { piezas: 0, regular: 0, preventa: 0 });

function pintarPedido() {
  const t = totales();
  $('#contador').textContent = t.piezas;
  $('#contador').hidden = !t.piezas;
  if (!pedido.length) {
    $('#c-cuerpo').innerHTML = `<p class="c-vacio">Tu pedido está vacío.<br>Tocá cualquier producto del catálogo para agregarlo.</p>`;
    $('#c-pie').hidden = true;
    return;
  }
  $('#c-cuerpo').innerHTML = pedido.map(x => `<div class="renglon">
    <img src="${esc(fotoDe(x))}" alt="">
    <div><b>${esc(x.nombre)}</b><small>${[x.color, x.medida, 'Cód. ' + x.sku].filter(Boolean).map(esc).join(' · ')}</small>
      <span class="precio">${money(x.preventa * x.cant)}</span></div>
    <div class="mini">
      <div class="mini-cant"><button data-menos="${esc(x.clave)}" aria-label="Quitar uno">−</button><span>${x.cant}</span><button data-mas="${esc(x.clave)}" aria-label="Agregar uno">+</button></div>
      <button class="quitar" data-quitar="${esc(x.clave)}">Quitar</button>
    </div>
  </div>`).join('');
  $('#c-pie').hidden = false;
  $('#t-normal').textContent = money(t.regular);
  $('#t-ahorro').textContent = '−' + money(t.regular - t.preventa);
  $('#t-total').textContent = money(t.preventa);
  // El mínimo es condición de la preventa: se avisa, pero no se bloquea
  // el envío; lo resuelve la tienda al confirmar.
  const falta = TIENDA.minimo - t.preventa;
  $('#c-minimo').hidden = falta <= 0;
  $('#c-minimo').textContent = `El monto mínimo de compra es de $${TIENDA.minimo}. Te faltan ${money(falta)}.`;
}

$('#c-cuerpo').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const clave = b.dataset.menos || b.dataset.mas || b.dataset.quitar;
  const it = pedido.find(x => x.clave === clave);
  if (!it) return;
  if (b.dataset.quitar) pedido = pedido.filter(x => x !== it);
  else { it.cant += b.dataset.mas ? 1 : -1; if (it.cant < 1) pedido = pedido.filter(x => x !== it); }
  guardar(); pintarPedido();
});

function armarMensaje(nombre, tel) {
  const t = totales();
  return [
    `¡Hola ${TIENDA.nombre}! Quiero realizar la siguiente reserva de ${TIENDA.temporada}:`, '',
    ...pedido.map(x => {
      const d = [x.color && `Color: ${x.color}`, x.medida && `Tamaño: ${x.medida}`].filter(Boolean).join(', ');
      return `- ${x.cant}x [${x.sku}] ${x.nombre}${d ? ` (${d})` : ''} - ${money(x.preventa * x.cant)}`;
    }), '',
    `Total de la compra: ${money(t.preventa)}`,
    `Cliente: ${nombre} | Teléfono: ${tel}`,
  ].join('\n');
}

// Es un enlace de verdad: el destino se arma en el clic, justo antes de
// que el navegador lo siga (los navegadores de las apps bloquean pop-ups).
$('#enviar').addEventListener('click', e => {
  const nombre = $('#cli-nombre').value.trim();
  const tel = $('#cli-tel').value.trim();
  const telOk = tel.replace(/\D/g, '').length >= 8;
  $('#cli-nombre').classList.toggle('mal', !nombre);
  $('#cli-tel').classList.toggle('mal', !telOk);
  if (!pedido.length || !nombre || !telOk) {
    e.preventDefault();
    $('#c-aviso').textContent = !pedido.length ? 'Tu pedido está vacío.'
      : !nombre ? 'Escribí tu nombre para saber de quién es el pedido.' : 'El teléfono necesita al menos 8 dígitos.';
    $('#c-aviso').hidden = false;
    return;
  }
  $('#c-aviso').hidden = true;
  e.currentTarget.href = `https://wa.me/${TIENDA.whatsapp}?text=` + encodeURIComponent(armarMensaje(nombre, tel));
});

/* ── Telones ───────────────────────────────────────────────────── */
function abrir(cual) { cerrarTodo(); $('#telon-' + cual).hidden = false; }
function cerrarTodo() { $$('.telon').forEach(t => t.hidden = true); }
$('#abrir-carrito').addEventListener('click', () => abrir('carrito'));
$$('[data-cerrar]').forEach(b => b.addEventListener('click', cerrarTodo));
$$('.telon').forEach(t => t.addEventListener('click', e => { if (e.target === t) cerrarTodo(); }));

let brindisT;
function brindis(txt) {
  const b = $('#brindis');
  b.textContent = txt; b.hidden = false;
  requestAnimationFrame(() => b.classList.add('visible'));
  clearTimeout(brindisT);
  brindisT = setTimeout(() => { b.classList.remove('visible'); setTimeout(() => { b.hidden = true; }, 220); }, 2400);
}

/* ── Arranque ──────────────────────────────────────────────────── */
medir();
pintarPedido();
