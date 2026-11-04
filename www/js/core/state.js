/* ════════════════════════════════════════════════════════════════════
   NÚCLEO · estado único, utilidades, persistencia versionada, deshacer
   y motor de mapas de calor (Web Worker con refinamiento progresivo).
   ════════════════════════════════════════════════════════════════════ */
const $ = i => document.getElementById(i);
const { MAT, C, pw, hyp, dseg, clamp, BANDS } = Phys;
const SCHEMA = 3;                      // versión del formato guardado (SW-11)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sg = n => (n < 0 ? '−' : '+') + Math.abs(n).toFixed(1);
const row = (a, b, c) => `<div class="row"><span>${a}</span><span${c ? ` style="color:${c}"` : ''}>${b}</span></div>`;
const num = (v, d = 0) => Number.isFinite(+v) ? +v : d;
const lam = () => C / (S.f * 1e9);

/** Estado único del simulador. Phys lee directamente este objeto como «escena». */
const S = {
  mode: '2d', f: 2.4, bw: 20, nf: 6, ns: 2, nsC: 2, gr: 0, off: 0, bn: 2, rays: 32, spd: .2, spdMul: 1,
  coh: 0, obl: 1, fres: 0, pln: 2, client: 'laptop', region: 'US',
  W: 20, H: 14, aps: [], apSel: 0, rx: { x: 16, y: 10 }, walls: [], sel: null, drag: null, pi: 0,
  yaw: .6, pit: .95, zoom: 1, vz: 1, vx: 10, vy: 7,
  dist: 0, d0: 0, paused: 0, paths: { P: [], tot: -99 }, rv: [],
  layers: { heat: 0, cont: 0, rays: 1, ref: 1, front: 1, labels: 0, grid: 1, fresnel: 0, meas: 1, plan: 1, floor: 1, rooms: 1, rings: 0, glow: 1, part: 1, trail: 1 },
  floor: 'auto', wallMat: 'brick', hmPal: 'viridis', reduceMotion: 0, surf: 0, exag: 1, zoomT: 1, enterT: 0,
  hmMode: 'rssi', hmModel: 'auto', quality: 'auto', level: 'i', theme: 'dark', fscale: 1,
  tool: '', snap: 1, ruler: null, meas: [], grid: null, gridBusy: 0, preset: 'dept2',
  get tx() { return this.aps[0]; }
};
const apNew = (x, y, o = {}) => ({ x, y, pt: 20, gt: 0, ch: 1, on: true, srv: true, ns: 2, bh: 'cable', eq: 'custom', bw: null, ...o });
const wallNew = (id, x1, y1, x2, y2, m, th, op) => ({ id, x1, y1, x2, y2, m, th: th || MAT[m].th, op: op || [] });
const nextWallId = () => Math.max(0, ...S.walls.map(w => w.id)) + 1;
const calc = (rx = S.rx, mode) => Phys.calc(S, rx, mode);
const eirpLim = { US: 36, EU: 20, OTRO: 20 };

/** Enlace del mejor servidor para un resultado de calc(). */
function linkOf(r) {
  const ap = S.aps[r.best] || S.aps[0], c = Phys.CLIENT[S.client] || Phys.CLIENT.laptop;
  return Phys.link({ bw: S.bw, nf: S.nf, ns: ap ? ap.ns || S.ns : S.ns, nsC: c.ns }, r.tot, r.sinr, Phys.BH[ap && ap.bh || 'cable']);
}
const qual = tot => tot >= -50 ? ['Excelente', '●', 'var(--ok)'] : tot >= -65 ? ['Buena', '◆', 'var(--tx)'] : tot >= -75 ? ['Regular', '▲', 'var(--am)'] : tot >= -85 ? ['Débil', '▼', '#fb923c'] : ['Sin señal útil', '✖', 'var(--rd)'];

/* ── Ajustes persistentes (con try/catch: el navegador puede bloquearlos) ── */
const Store = {
  get(k, d) { try { const v = localStorage.getItem('wifilab.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('wifilab.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};

/* ── Tema y colores del lienzo ── */
let TH = {};
function readTheme() {
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  TH = { bg: g('--cv'), grid: g('--cg'), txt: g('--t'), mut: g('--m'), tx: g('--tx'), rx: g('--rx'), am: g('--am'), pu: g('--pu'), rd: g('--rd'), cw: g('--cw'), panel: g('--p'), bd: g('--b'), ok: g('--ok'),
    floor: g('--floor'), floorA: parseFloat(g('--floorA')) || .5, roomA: parseFloat(g('--roomA')) || .1, glow: parseFloat(g('--glow')) || 0, wallTint: g('--wallTint'), wallTintA: parseFloat(g('--wallTintA')) || 0 };
  if (typeof Textures !== 'undefined') Textures.setTint(TH.wallTint, TH.wallTintA);          // el tema tiñe las paredes (neón, blueprint)
}
function applyTheme(t) {
  S.theme = t; document.documentElement.dataset.theme = t === 'dark' ? '' : t; readTheme(); Store.set('theme', t);
  if (typeof hmPaint === 'function') hmPaint(true);
}
function applyMotion(on) { S.reduceMotion = on ? 1 : 0; document.body.classList.toggle('nomotion', !!(on || (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches))); Store.set('nomotion', S.reduceMotion); }
function applyFont(n) {
  S.fscale = clamp(n, .85, 1.5); document.documentElement.style.setProperty('--fs', S.fscale); Store.set('fscale', S.fscale);
  document.body.classList.toggle('lg', S.fscale > 1.1);
}

