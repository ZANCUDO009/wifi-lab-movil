/* ════════════════════════════════════════════════════════════════════
   HERRAMIENTAS · Laboratorio, Inspector (3 niveles), Informe ejecutivo,
   Ubicación óptima, Comparador A/B/C, mediciones y validación, exportaciones.
   ════════════════════════════════════════════════════════════════════ */
let MD = 'walls';
const measMode = () => MD === 'coh' ? 'coh' : 'inc';
const apMain = () => S.aps[0];
function simPt(x, y) {
  if (MD === 'fs') { const a = apMain(); return a.pt + a.gt + S.gr + S.off - Phys.fspl(Math.hypot(x - a.x, y - a.y), S.f, S.pln); }
  return calc({ x, y }, measMode()).tot;
}
const fmtN = (v, d = 1) => Number.isFinite(v) ? v.toFixed(d) : '—';

/* ── Mediciones agrupadas (repeticiones → media ± desviación) ── */
function measGroups() {
  const m = new Map();
  S.meas.forEach(r => { const k = r.x.toFixed(2) + ',' + r.y.toFixed(2); if (!m.has(k)) m.set(k, { x: r.x, y: r.y, v: [] }); m.get(k).v.push(r.m); });
  return [...m.values()].map(g => { const n = g.v.length, mu = g.v.reduce((a, b) => a + b, 0) / n, sd = n > 1 ? Math.sqrt(g.v.reduce((a, b) => a + (b - mu) ** 2, 0) / (n - 1)) : 0; return { x: g.x, y: g.y, n, m: mu, sd, s: simPt(g.x, g.y), d: hyp({ x: g.x, y: g.y }, apMain()) }; });
}
function measStats() {
  const R = measGroups(), n = R.length; if (!n) return null;
  const e = R.map(r => r.m - r.s), sq = e.reduce((a, b) => a + b * b, 0), bias = e.reduce((a, b) => a + b) / n, mae = e.reduce((a, b) => a + Math.abs(b), 0) / n, mm = R.reduce((a, r) => a + r.m, 0) / n, sst = R.reduce((a, r) => a + (r.m - mm) ** 2, 0);
  const rmse = Math.sqrt(sq / n), sdE = Math.sqrt(e.reduce((a, b) => a + (b - bias) ** 2, 0) / Math.max(1, n - 1));
  let fit = null; if (n >= 3 && new Set(R.map(r => r.d.toFixed(1))).size >= 3) fit = Phys.logDistanceFit(R.map(r => Math.max(r.d, .3)), R.map(r => r.m));
  return { R, n, bias, mae, rmse, r2: sst ? 1 - sq / sst : null, fit, out: R.filter((r, i) => sdE && Math.abs(e[i] - bias) > 2 * sdE) };
}

