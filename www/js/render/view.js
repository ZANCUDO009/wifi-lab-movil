/* ════════════════════════════════════════════════════════════════════
   RENDER · dibujo del escenario (2D con zoom/desplazamiento y 3D),
   mapa de calor, contornos, rayos, frente de onda, minimapa, leyenda.
   ════════════════════════════════════════════════════════════════════ */
let cv, cx, W0 = 0, H0 = 0;
const hmc = document.createElement('canvas');
const fp = n => Math.round(n * S.fscale * (document.body.classList.contains('feria') ? 1.2 : 1));
const qc = pr => pr >= -65 ? TH.tx : pr >= -80 ? TH.am : TH.rd;

function size() {
  const d = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  cx.setTransform(d, 0, 0, d, 0, 0); W0 = w; H0 = h;
}
function viewXform() {
  const sc0 = Math.min((W0 - 30) / S.W, (H0 - 30) / S.H) || 1, sc = sc0 * S.vz;
  S.sc0 = sc0; S.sc = sc; S.ox = W0 / 2 - S.vx * sc; S.oy = H0 / 2 - S.vy * sc;
}
const X = x => S.ox + x * S.sc, Y = y => S.oy + y * S.sc;
/** Trozos sólidos de una pared (sin las aperturas de puertas/ventanas). */
function wallPieces(w) {
  const ops = (w.op || []).slice().sort((a, b) => a.a - b.a), out = [], pt = t => [w.x1 + (w.x2 - w.x1) * t, w.y1 + (w.y2 - w.y1) * t];
  let t0 = 0;
  ops.forEach(o => { if (o.a > t0) out.push([...pt(t0), ...pt(o.a)]); t0 = Math.max(t0, o.b); });
  if (t0 < 1) out.push([...pt(t0), ...pt(1)]);
  return out;
}

