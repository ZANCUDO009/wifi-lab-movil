/* ── Estado de escena: serialización, validación y compatibilidad (SW-11, SW-20) ── */
function scenarioObj() {
  return {
    v: SCHEMA, W: S.W, H: S.H,
    params: { f: S.f, bw: S.bw, nf: S.nf, gr: S.gr, off: S.off, bn: S.bn, coh: S.coh, obl: S.obl, fres: S.fres, pln: S.pln, client: S.client, region: S.region, floor: S.floor || 'auto' },
    aps: S.aps.map(a => ({ ...a })), rx: { ...S.rx },
    walls: S.walls.map(w => ({ x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2, m: w.m, th: w.th, op: (w.op || []).map(o => ({ a: o.a, b: o.b })) })),
    meas: S.meas.map(m => ({ ...m }))
  };
}
function applyScenario(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.walls) || o.walls.length > 300) throw new Error('formato');
  const W = clamp(num(o.W, 20), 5, 80), H = clamp(num(o.H, 14), 5, 80), cl = (v, a, b) => clamp(num(v), a, b);
  S.W = W; S.H = H;
  const p = o.params || {};
  if (BANDS[p.f]) S.f = p.f;
  if ([20, 40, 80, 160].includes(p.bw)) S.bw = p.bw;
  S.nf = cl(p.nf ?? 6, 3, 12); S.gr = cl(p.gr ?? 0, -3, 3); S.off = cl(p.off ?? 0, -40, 20); S.bn = cl(p.bn ?? 2, 0, 3);
  S.coh = p.coh ? 1 : 0; S.obl = p.obl === 0 ? 0 : 1; S.fres = p.fres ? 1 : 0; S.pln = cl(p.pln ?? 2, 1, 6);
  if (Phys.CLIENT[p.client]) S.client = p.client;
  if (eirpLim[p.region]) S.region = p.region;
  S.floor = (typeof FX !== 'undefined' && FX.FLOORS[p.floor]) ? p.floor : 'auto';
  S.walls = o.walls.filter(w => w && MAT[w.m]).map((w, i) => ({
    id: i + 1, x1: cl(w.x1, 0, W), y1: cl(w.y1, 0, H), x2: cl(w.x2, 0, W), y2: cl(w.y2, 0, H), m: w.m, th: cl(w.th ?? MAT[w.m].th, 1, 60),
    op: (Array.isArray(w.op) ? w.op : []).slice(0, 6).map(q => ({ a: cl(q.a, 0, 1), b: cl(q.b, 0, 1) })).filter(q => q.b > q.a)
  }));
  let aps = Array.isArray(o.aps) ? o.aps : null;
  if (!aps && o.tx) aps = [o.tx, ...(Array.isArray(o.ex) ? o.ex : [])];      // compatibilidad con formato v2
  if (!aps || !aps.length) throw new Error('aps');
  S.aps = aps.slice(0, 8).map((a, i) => apNew(cl(a.x, 0, W), cl(a.y, 0, H), {
    pt: cl(a.pt ?? 20, 5, 30), gt: cl(a.gt ?? 0, 0, 12), ch: num(a.ch, [1, 6, 11][i % 3]), on: a.on !== false, srv: a.srv !== false,
    ns: [1, 2, 3, 4].includes(a.ns) ? a.ns : 2, bh: Phys.BH[a.bh] ? a.bh : 'cable', eq: Phys.EQ[a.eq] ? a.eq : 'custom', bw: a.bw || null
  }));
  S.rx = { x: cl(o.rx && o.rx.x, 0, W), y: cl(o.rx && o.rx.y, 0, H) };
  S.meas = (Array.isArray(o.meas) ? o.meas : []).slice(0, 500).map(m => ({ x: cl(m.x, 0, W), y: cl(m.y, 0, H), m: num(m.m, -70), rep: num(m.rep, 1), ch: esc(m.ch ?? ''), t: esc(m.t ?? ''), eq: esc(m.eq ?? ''), note: esc(m.note ?? '') }));
  S.apSel = 0; S.sel = null; S.pi = 0; S.vz = 1; S.vx = W / 2; S.vy = H / 2;
}

/* ── Deshacer / rehacer y autoguardado (UX-09, UX-10) ── */
const HIST = { u: [], r: [] };
const snapState = () => JSON.stringify(scenarioObj());
let lastSnap = '', ctimer = 0, dirty = 1;
function touch() {
  dirty = 1; hmD = 1; clearTimeout(ctimer); ctimer = setTimeout(commit, 450);
}
function commit() {
  const s = snapState();
  if (!lastSnap) { lastSnap = s; return; }
  if (s === lastSnap) return;
  HIST.u.push(lastSnap); if (HIST.u.length > 60) HIST.u.shift(); HIST.r = []; lastSnap = s;
  Store.set('auto', { t: Date.now(), s: scenarioObj() });
}
function restoreSnap(s) { applyScenario(JSON.parse(s)); lastSnap = s; dirty = 1; hmD = 1; panelsRefresh(); }
function undo() { commit(); if (!HIST.u.length) return hint('No hay nada que deshacer'); HIST.r.push(lastSnap); restoreSnap(HIST.u.pop()); hint('Deshecho'); }
function redo() { if (!HIST.r.length) return hint('No hay nada que rehacer'); HIST.u.push(lastSnap); restoreSnap(HIST.r.pop()); hint('Rehecho'); }
let hintT = 0;
function hint(t, ms = 2200) {
  const h = $('hint'); h.textContent = t; h.style.display = 'block'; clearTimeout(hintT); hintT = setTimeout(() => h.style.display = 'none', ms);
  $('live').textContent = t;
}

/* ── Versiones nombradas del escenario (EJ-25) y enlace compartible ── */
function versions() { return Store.get('versions', []); }
function saveVersion(name) {
  const v = versions(); v.unshift({ name: name || 'Versión ' + (v.length + 1), t: Date.now(), s: scenarioObj() });
  if (!Store.set('versions', v.slice(0, 12))) hint('No se pudo guardar: el navegador bloquea el almacenamiento'); else hint('Versión guardada');
}
function shareLink() {
  const o = scenarioObj(); delete o.meas;
  const s = btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  if (s.length > 6000) { hint('El escenario es demasiado grande para un enlace; usa «Guardar»'); return; }
  const url = location.href.split('#')[0] + '#s=' + s;
  try { navigator.clipboard.writeText(url); hint('Enlace copiado al portapapeles'); } catch (e) { prompt('Copia este enlace:', url); }
}
function loadFromHash() {
  const m = /#s=([A-Za-z0-9+/=]+)/.exec(location.hash);
  if (!m || m[1].length > 8000) return false;
  try { applyScenario(JSON.parse(decodeURIComponent(escape(atob(m[1]))))); S.enterT = performance.now(); return true; } catch (e) { return false; }
}

/* ── Bitácora (DI-08) ── */
const LOG = [];
function logEv(t) { LOG.push({ t: new Date().toLocaleTimeString('es'), e: t }); if (LOG.length > 200) LOG.shift(); }

/* ── Paleta viridis (apta para daltónicos) ── */
const HC = [[-90, [68, 1, 84]], [-75, [59, 82, 139]], [-65, [33, 145, 140]], [-55, [94, 201, 98]], [-40, [253, 231, 37]]];
function hcol(v) {
  if (v <= HC[0][0]) return HC[0][1];
  for (let i = 1; i < HC.length; i++) if (v <= HC[i][0]) { const a = HC[i - 1], b = HC[i], t = (v - a[0]) / (b[0] - a[0]); return a[1].map((c, j) => Math.round(c + (b[1][j] - c) * t)); }
  return HC[HC.length - 1][1];
}

