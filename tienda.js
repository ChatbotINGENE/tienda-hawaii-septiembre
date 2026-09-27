/* ════════════════════════════════════════════════════════════════
   Hawaii — Preventa de Septiembre 2026 · modelo "tienda"

   Los datos (SECCIONES) vienen de datos.js, el mismo archivo que usa
   el catálogo hojeable; lo copia tienda_septiembre.py. Acá se pinta la
   tienda, se busca, se ordena y se arma el pedido por WhatsApp.
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
  ['Respecto a la reserva', ['Monto mínimo de compra de $100', 'Reserva de pedido válida hasta el 5 de octubre']],
  ['Respecto al pago', ['Pago contra entrega', 'Medios de pago autorizados: Transferencias y efectivo', 'No válido pago con tarjeta']],
  ['Para la entrega del pedido', ['Retiro puede ser en tienda o en centro de distribución Don Rua', 'Disponible entrega a domicilio']],
];

// Una línea por departamento, para el banner.
const BAJADAS = {
  'flores': 'Ramos, varas y botones que llenan de color una mesa, un altar o una vitrina.',
  'follajes-y-guias': 'El verde que completa todo: rellenos, enredaderas y paredes de follaje.',
  'macetas': 'De la copa clásica al barro de siempre: la base para lucir cada arreglo.',
  'coronas-y-disfraces': 'Para la reina de la fiesta, el ángel del acto y el vaquero de la temática.',
  'juguetes': 'Los clásicos que nunca fallan en piñatas, bolsitas y tardes de juego.',
  'detalles-y-manualidades': 'Los pequeños toques que hacen especial un regalo o una celebración.',
};

const LLAVE = 'hawaii-tienda-septiembre-2026';

/* ── Utilerías ─────────────────────────────────────────────────── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Number(n).toFixed(2);
const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

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
const PRODUCTOS = SECCIONES.flatMap((s, si) => s.productos.map((p, pi) =>
  ({ ...p, depto: s.nombre, deptoId: s.id, orden: si * 1000 + pi,
     // Sin los colores: buscar "rosa" traía todo lo que viene en rosado.
     busca: sinTildes(`${p.nombre} ${p.variantes[0].sku} ${s.nombre}`) })));
const POR_ID = new Map(PRODUCTOS.map(p => [p.id, p]));
const AHORRO_MAX = Math.max(...PRODUCTOS.map(p => p.ahorro));

const icoBolsa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

function card(p) {
  const v = p.variantes[0];
  const cs = p.variantes.filter(x => x.color);
  const puntos = cs.length > 1
    ? `${cs.slice(0, 5).map(x => `<i style="background:${fondoColor(x.color)}"></i>`).join('')}${cs.length > 5 ? `<small>+${cs.length - 5}</small>` : ''}`
    : '';
  return `<button class="card" data-id="${esc(p.id)}">
    <span class="card-foto">
      <img src="${esc(v.img)}" alt="${esc(p.nombre)}" loading="lazy"${v.llena ? ' class="llena"' : ''}>
      <span class="tag-desc">−${p.ahorro}%</span>
    </span>
    <span class="card-cuerpo">
      <span class="card-cod">Cód. ${esc(v.sku)}</span>
      <span class="card-nombre">${esc(p.nombre)}</span>
      <span class="card-precio"><span class="ahora">${money(v.preventa)}</span><span class="antes">${money(v.regular)}</span></span>
      <span class="card-pie">
        <span class="puntos">${puntos}</span>
        <span class="btn-agregar">${icoBolsa}<span>${p.variantes.length > 1 ? 'Elegir color' : 'Agregar'}</span></span>
      </span>
    </span>
  </button>`;
}

// En la versión de un solo archivo los banners viajan adentro (BANNERS);
// en la del link se bajan de img/banners/.
const bannerDe = id => (window.BANNERS && window.BANNERS[id]) || `img/banners/${id}.webp`;

function banner(s) {
  const piezas = (s.portada.piezas || []).slice(0, 2);
  // Las piezas del departamento a la derecha, una arriba y otra abajo.
  const sitios = [{ r: 4, t: 8, w: 24 }, { r: 24, t: 40, w: 22 }];
  const imgs = piezas.map((x, i) =>
    `<img class="pieza" src="${esc(x.img)}" alt="" loading="lazy"
      style="right:${sitios[i].r}%; top:${sitios[i].t}%; width:${sitios[i].w}%; max-height:${i ? 56 : 80}%">`).join('');
  const desde = Math.min(...s.productos.map(p => p.variantes[0].preventa));
  return `<div class="banner">
    <img class="fondo" src="${esc(bannerDe(s.id))}" alt="" loading="lazy">
    ${imgs}
    <div class="banner-texto">
      <p class="sobre">${s.productos.length} artículos · desde ${money(desde)}</p>
      <h2>${esc(s.nombre)}</h2>
      <p>${esc(BAJADAS[s.id] || '')}</p>
    </div>
  </div>`;
}

/* ── Pintar ────────────────────────────────────────────────────── */
function pintarDeptos() {
  $('#deptos').innerHTML = `<button data-ir="catalogo" class="activo">Todo</button>` +
    SECCIONES.map(s => `<button data-ir="d-${esc(s.id)}">${esc(s.nombre)}</button>`).join('');
}

function pintarCatalogo() {
  const q = sinTildes($('#buscar').value);
  const orden = $('#orden').value;
  let lista = PRODUCTOS.filter(p => !q || q.split(/\s+/).every(t => p.busca.includes(t)));

  const cmp = {
    ahorro: (a, b) => b.ahorro - a.ahorro || a.orden - b.orden,
    menor:  (a, b) => a.variantes[0].preventa - b.variantes[0].preventa,
    mayor:  (a, b) => b.variantes[0].preventa - a.variantes[0].preventa,
  }[orden];

  $('#resultado').textContent = q
    ? `${lista.length} resultado${lista.length === 1 ? '' : 's'} para “${$('#buscar').value.trim()}”`
    : `${lista.length} productos en preventa`;

  // Por departamento y sin buscar: la vitrina completa, con sus banners.
  // Buscando u ordenando por precio: una sola cuadrícula, que es lo que
  // sirve para comparar.
  if (orden === 'depto' && !q) {
    $('#departamentos').innerHTML = SECCIONES.map(s => `
      <section class="depto" id="d-${esc(s.id)}">
        ${banner(s)}
        <div class="depto-grid">${s.productos.map(p => card(POR_ID.get(p.id))).join('')}</div>
      </section>`).join('');
  } else if (lista.length) {
    if (cmp) lista = [...lista].sort(cmp);
    $('#departamentos').innerHTML = `<div class="depto-grid">${lista.map(card).join('')}</div>`;
  } else {
    $('#departamentos').innerHTML = `<p class="vacio-busqueda">No encontramos productos con esa búsqueda. Probá con otra palabra o con el código.</p>`;
  }
}

function pintarFavoritos() {
  const top = [...PRODUCTOS].sort((a, b) => b.ahorro - a.ahorro || b.variantes[0].regular - a.variantes[0].regular).slice(0, 8);
  $('#carrusel').innerHTML = top.map(card).join('');
  $('#hero-ahorro').innerHTML = `Hasta <b>${AHORRO_MAX}%</b> de ahorro`;
}

function pintarPie() {
  $('#pie-tel').textContent = TIENDA.telVisible;
  $('#pie-tel').href = `https://wa.me/${TIENDA.whatsapp}`;
  $('#pie-condiciones').innerHTML = CONDICIONES.map(([t, ps]) =>
    `<h4>${esc(t)}</h4><ul>${ps.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`).join('');
  $('#pie-lugares').innerHTML = TIENDA.lugares.map(l => `
    <div class="lugar"><b>${esc(l.titulo)}</b><span>${l.lineas.map(esc).join('<br>')}</span>
      <div class="ir">
        <a href="${esc(l.maps)}" target="_blank" rel="noopener">Google Maps</a>
        <a href="https://waze.com/ul?q=${encodeURIComponent(l.waze)}&navigate=yes" target="_blank" rel="noopener">Waze</a>
      </div>
    </div>`).join('');
}

/* ── Navegación por departamento ──────────────────────────────── */
$('#deptos').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if ($('#buscar').value || $('#orden').value !== 'depto') {
    $('#buscar').value = ''; $('#orden').value = 'depto'; pintarCatalogo();
  }
  irA(b.dataset.ir);
});

/* Bajar hasta un departamento. Con scrollTo y no scrollIntoView: el
   chip activo se centra solo mientras la página baja, y un segundo
   scrollIntoView cancelaba el primero: tocabas "Macetas" y se frenaba
   en Flores. */
function irA(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const tope = $('.cabecera').offsetHeight + $('#deptos').offsetHeight + 8;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - tope, behavior: 'smooth' });
}
function centrarChip(b) {
  const nav = $('#deptos');
  nav.scrollTo({ left: b.offsetLeft - (nav.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
}

// El chip activo sigue al departamento que se está viendo.
const espia = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    if (!en.isIntersecting) return;
    $$('#deptos button').forEach(b => b.classList.toggle('activo', b.dataset.ir === en.target.id));
    const chip = $(`#deptos button[data-ir="${en.target.id}"]`);
    if (chip) centrarChip(chip);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
function espiar() { $$('.depto').forEach(d => espia.observe(d)); }

let esperaBusqueda;
$('#buscar').addEventListener('input', () => {
  clearTimeout(esperaBusqueda);
  esperaBusqueda = setTimeout(() => {
    pintarCatalogo(); espiar();
    if ($('#buscar').value) irA('catalogo');
  }, 180);
});
$('#orden').addEventListener('change', () => { pintarCatalogo(); espiar(); });

/* ── Ficha ─────────────────────────────────────────────────────── */
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

// Tocar la tarjeta abre la ficha. Tocar "Agregar" agrega directo si el
// producto trae un solo color; si trae varios, abre la ficha para elegir.
document.addEventListener('click', e => {
  const c = e.target.closest('.card');
  if (!c) return;
  const p = POR_ID.get(c.dataset.id);
  if (p && e.target.closest('.btn-agregar') && p.variantes.length === 1) {
    agregar(p, p.variantes[0], 1);
    brindis(`${p.nombre} agregado a tu pedido`);
    return;
  }
  abrirFicha(c.dataset.id);
});

/* ── Pedido ────────────────────────────────────────────────────── */
// Un mismo código trae varios colores (la gerbera: nueve), así que el
// renglón se distingue por código y color.
let pedido = [];
try { pedido = JSON.parse(localStorage.getItem(LLAVE)) || []; } catch (_) { pedido = []; }
const guardar = () => { try { localStorage.setItem(LLAVE, JSON.stringify(pedido)); } catch (_) {} };
const claveDe = v => `${v.sku}|${v.color}`;

function agregar(p, v, cant) {
  const clave = claveDe(v);
  const ya = pedido.find(x => x.clave === clave);
  if (ya) ya.cant = Math.min(99, ya.cant + cant);
  else pedido.push({ clave, sku: v.sku, nombre: p.nombre, color: v.color, medida: p.medida || '',
                     regular: v.regular, preventa: v.preventa, img: v.img, cant });
  guardar(); pintarPedido();
  const g = $('#contador'); g.classList.remove('late'); void g.offsetWidth; g.classList.add('late');
}

// La foto del renglón se busca en el catálogo abierto y no en lo guardado:
// en la versión de un solo archivo las fotos van adentro y la ruta
// guardada por la versión del link no existe.
const fotoDe = x => {
  for (const p of PRODUCTOS) for (const v of p.variantes)
    if (v.sku === x.sku && v.color === x.color) return v.img;
  return x.img;
};

const totales = () => pedido.reduce((a, x) => ({
  piezas: a.piezas + x.cant, regular: a.regular + x.regular * x.cant, preventa: a.preventa + x.preventa * x.cant,
}), { piezas: 0, regular: 0, preventa: 0 });

function pintarPedido() {
  const t = totales();
  $('#contador').textContent = t.piezas;
  $('#contador').hidden = !t.piezas;
  if (!pedido.length) {
    $('#c-cuerpo').innerHTML = `<p class="c-vacio">Tu pedido está vacío.<br>Tocá cualquier producto para agregarlo.</p>`;
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
function abrir(cual) { cerrarTodo(); $('#telon-' + cual).hidden = false; document.body.style.overflow = 'hidden'; }
function cerrarTodo() { $$('.telon').forEach(t => t.hidden = true); document.body.style.overflow = ''; }
$('#abrir-carrito').addEventListener('click', () => abrir('carrito'));
$$('[data-cerrar]').forEach(b => b.addEventListener('click', cerrarTodo));
$$('.telon').forEach(t => t.addEventListener('click', e => { if (e.target === t) cerrarTodo(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarTodo(); });

let brindisT;
function brindis(txt) {
  const b = $('#brindis');
  b.textContent = txt; b.hidden = false;
  requestAnimationFrame(() => b.classList.add('visible'));
  clearTimeout(brindisT);
  brindisT = setTimeout(() => { b.classList.remove('visible'); setTimeout(() => { b.hidden = true; }, 220); }, 2400);
}

/* La barra de departamentos se pega justo debajo de la cabecera, que
   cambia de alto entre teléfono y computadora. */
function pegarDeptos() { $('#deptos').style.top = $('.cabecera').offsetHeight + 'px'; }
window.addEventListener('resize', pegarDeptos);

/* ── Arranque ──────────────────────────────────────────────────── */
pegarDeptos();
pintarDeptos();
pintarFavoritos();
pintarCatalogo();
pintarPie();
pintarPedido();
espiar();
