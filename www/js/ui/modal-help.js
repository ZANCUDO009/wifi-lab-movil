/* ════════════════════════════════════════════════════════════════════
   UI · paneles por tareas, menús (Simular / Laboratorio / Física / Informe),
   modales accesibles, despacho de acciones sin manejadores en línea.
   ════════════════════════════════════════════════════════════════════ */
const ACT = {};
let lastFocus = null;

/* ── Modal accesible con trampa de foco ── */
function open_(h, wide) {
  const m = $('mi'), b = $('mib');
  if (!m.classList.contains('on')) lastFocus = document.activeElement;
  b.className = 'box' + (wide ? ' wide' : '');
  b.innerHTML = h; m.classList.add('on'); b.scrollTop = 0;
  const t = b.querySelector('h2'); if (t) t.id = 'mit';
  b.insertAdjacentHTML('afterbegin', '<div class="top" style="justify-content:flex-end;margin-bottom:-.2rem"><button data-a="closeM" aria-label="Cerrar ventana">✕ Cerrar</button></div>');
  b.focus();
}
function closeM() { $('mi').classList.remove('on'); WID = (typeof WID === 'number') ? WID + 1 : 0; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
ACT.closeM = closeM;
const modalOn = () => $('mi').classList.contains('on');

/* ── Ayudas contextuales (?) (UX-17) ── */
const HELP = {
  pt: 'Potencia que entrega el transmisor al aire (dBm). 20 dBm = 100 mW. Más potencia llega más lejos, pero está limitada por normativa (EIRP).',
  gt: 'Ganancia de la antena del router (dBi): concentra la energía en ciertas direcciones; no crea potencia nueva.',
  gr: 'Ganancia de la antena del dispositivo. Un teléfono real ronda 0 dBi o menos.',
  off: 'Corrección en dB para que el modelo coincida con tus mediciones (se calcula en Laboratorio → Simulación vs. medición).',
  nf: 'Figura de ruido: cuánto ruido propio añade el receptor. Sube el piso de ruido y baja la SNR.',
  bn: 'Reflexiones máximas que considera el método de imágenes. Más reflexiones = más trayectorias y más cálculo.',
  pln: 'Exponente de pérdida n: 2 en espacio libre, 2.5–4 en interiores con obstáculos. Se ajusta con mediciones.',
  coh: 'Suma los campos con su fase: aparece la interferencia (desvanecimiento). Si no, suma potencias (promedio).',
  obl: 'Un rayo oblicuo atraviesa más material: pérdida ∝ espesor / cos θ.',
  fres: 'Usa los coeficientes de Fresnel (TE/TM): la reflexión depende del ángulo; a incidencia rasante casi todo se refleja.',
  ch: 'Canal. En 2.4 GHz solo 1, 6 y 11 no se solapan. Dos AP en el mismo canal se interfieren.',
  bh: 'Cómo se conecta el AP a la red: cable (sin pérdida), mesh dedicado (~10 %) o repetidor en la misma banda (~50 %).',
  bw: 'Ancho del canal. Más ancho = más velocidad máxima, pero más ruido (−3 dB por cada duplicación) y menos alcance.'
};
const hb = k => HELP[k] ? `<button class="help" data-a="helpk" data-p="${k}" aria-label="Ayuda: ${k}" title="${esc(HELP[k])}">?</button>` : '';
ACT.helpk = k => hint(HELP[k], 7000);

