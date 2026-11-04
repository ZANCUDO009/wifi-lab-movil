/* ════════════════════════════════════════════════════════════════════
   VIZ · visualización de datos del panel de resultados (Fase 4)
   · Medidor semicircular de señal con aguja animada
   · Tarjetas KPI con mini-barra, flecha de tendencia y conteo animado
   · Barra apilada de cobertura (Excelente … Sin señal)
   · Marcadores al pasar el ratón sobre los gráficos pequeños
   Los elementos se actualizan por atributos data-* desde Viz.tick() (cada cuadro),
   así la animación no se interrumpe cuando el panel se vuelve a escribir.
   ════════════════════════════════════════════════════════════════════ */
const Viz = (() => {
  'use strict';
  const ZONES = [[-90, -85, 'var(--rd)'], [-85, -75, '#fb923c'], [-75, -65, 'var(--am)'], [-65, -50, 'var(--tx)'], [-50, -30, 'var(--ok)']];
  const CAT = [['Excelente', 'var(--ok)', -50], ['Buena', 'var(--tx)', -65], ['Regular', 'var(--am)', -75], ['Débil', '#fb923c', -85], ['Sin señal', 'var(--rd)', -999]];
  const st = { g: { cur: -90, tgt: -90, init: false }, kp: {} };
  const ang = v => 180 - clamp((v + 90) / 60, 0, 1) * 180;                              // grados sobre el semicírculo (180 = −90 dBm)
  const pt = (a, r) => [100 + r * Math.cos(a * Math.PI / 180), 100 - r * Math.sin(a * Math.PI / 180)];
  const arc = (v1, v2, r) => { const a = pt(ang(v1), r), b = pt(ang(v2), r); return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}A${r} ${r} 0 0 1 ${b[0].toFixed(2)} ${b[1].toFixed(2)}`; };
  const rot = v => (clamp(v, -90, -30) + 60) / 30 * 90;                                 // rotación de la aguja (0° = vertical)
  const qIcon = tot => tot >= -50 ? 'sig4' : tot >= -65 ? 'sig3' : tot >= -75 ? 'sig2' : tot >= -85 ? 'sig1' : 'sig0';

  /** Medidor de −90 a −30 dBm con zonas de color, marcas y aguja. */
  function gaugeHTML(tot, q) {
    if (!st.g.init) { st.g.cur = tot; st.g.init = true; } st.g.tgt = tot;
    const cur = st.g.cur;
    const ticks = [-90, -75, -60, -45, -30].map(v => { const a = pt(ang(v), 74), b = pt(ang(v), 88), c = pt(ang(v), 99); return `<line class="tick" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/><text x="${c[0].toFixed(1)}" y="${(c[1] + 3).toFixed(1)}">${v}</text>`; }).join('');
    return `<svg class="gauge" viewBox="-8 -6 216 136" role="img" aria-label="Medidor de señal: ${tot.toFixed(1)} dBm, ${q[0]}">
      <path class="gt" d="${arc(-90, -30, 80)}"/>${ZONES.map(z => `<path class="gz" d="${arc(z[0] + .6, z[1] - .6, 80)}" style="stroke:${z[2]}"/>`).join('')}${ticks}
      <g class="nd" id="gnd" transform="rotate(${rot(cur).toFixed(1)} 100 100)"><line x1="100" y1="100" x2="100" y2="38"/><circle cx="100" cy="100" r="6"/></g>
      <text class="gval" id="gval" x="100" y="86" style="fill:${q[2]}">${cur.toFixed(1)}</text><text class="gunit" x="100" y="124">dBm</text></svg>`;
  }
  /** Tarjeta KPI: valor que «corre», barra de progreso y flecha de tendencia respecto al estado anterior. */
  function kpi(k, label, value, unit, dec, pct, color, thr) {
    const s = st.kp[k] || (st.kp[k] = { cur: value, tgt: value, ref: value, tr: 0, t: 0 }), now = performance.now();
    s.tgt = value; s.dec = dec;
    if (now - s.t > 700) { if (Math.abs(value - s.ref) > thr) { s.tr = Math.sign(value - s.ref); s.ref = value; } s.t = now; }
    const arrow = s.tr > 0 ? '<span class="trnd up" title="Mejoró respecto al estado anterior" aria-label="mejoró">▲</span>' : s.tr < 0 ? '<span class="trnd dn" title="Empeoró respecto al estado anterior" aria-label="empeoró">▼</span>' : '<span class="trnd eq" aria-hidden="true">•</span>';
    return `<div class="kcard" style="--c:${color}"><small><span>${label}</span>${arrow}</small><b><span data-kv="${k}">${s.cur.toFixed(dec)}</span><em>${unit}</em></b><div class="pb"><i data-kb="${k}" style="width:${(clamp(pct, 0, 1) * 100).toFixed(0)}%"></i></div></div>`;
  }
  /** Se llama en cada cuadro: aproxima aguja y cifras al valor objetivo (instantáneo con «reducir movimiento»). */
  function tick(dt) {
    const sm = FX.motion(), k = sm ? Math.min(1, dt * 9) : 1, g = st.g;
    if (Math.abs(g.tgt - g.cur) > .004) {
      g.cur += (g.tgt - g.cur) * k; const n = $('gnd'), v = $('gval');
      if (n) n.setAttribute('transform', `rotate(${rot(g.cur).toFixed(1)} 100 100)`); if (v) v.textContent = g.cur.toFixed(1);
    }
    for (const id in st.kp) {
      const s = st.kp[id]; if (Math.abs(s.tgt - s.cur) > Math.pow(10, -s.dec) / 2) { s.cur += (s.tgt - s.cur) * Math.min(1, dt * 12 * (sm ? 1 : 99)); const e = document.querySelector(`[data-kv="${id}"]`); if (e) e.textContent = s.cur.toFixed(s.dec); }
    }
  }
  /** Distribución de la cobertura por categoría de calidad (cacheada por cuadrícula). */
  let dc = { g: null, d: null };
  function dist(g) {
    if (!g) return null; if (dc.g === g) return dc.d;
    const n = [0, 0, 0, 0, 0], N = g.tot.length;
    for (let i = 0; i < N; i++) { const t = g.tot[i]; n[t >= -50 ? 0 : t >= -65 ? 1 : t >= -75 ? 2 : t >= -85 ? 3 : 4]++; }
    dc = { g, d: n.map(c => c / N * 100) }; return dc.d;
  }
  function covBar(withLegend) {
    const d = dist(S.grid); if (!d) return '';
    return `<div class="stack" role="img" aria-label="${CAT.map((c, i) => c[0] + ' ' + d[i].toFixed(0) + ' %').join(', ')}">${d.map((v, i) => `<i style="width:${v.toFixed(1)}%;background:${CAT[i][1]}" title="${CAT[i][0]} ${v.toFixed(0)} %"></i>`).join('')}</div>` +
      (withLegend ? `<div class="lg">${CAT.map((c, i) => `<span><b style="background:${c[1]}"></b>${c[0]} ${d[i].toFixed(0)} %</span>`).join('')}</div>` : '');
  }
  /** Marcadores al pasar el ratón sobre un gráfico: reg(canvas, [{x, y, t}]) con x,y en píxeles del lienzo. */
  const tip = () => $('cht'), dotEl = () => $('chd');
  function reg(c, pts) { if (c) c._hv = pts; }
  function onMove(e) {
    const c = e.target && e.target.closest ? e.target.closest('canvas.mini') : null, T = tip(), D = dotEl(); if (!T || !D) return;
    if (!c || !c._hv || !c._hv.length) { T.style.display = D.style.display = 'none'; return; }
    const r = c.getBoundingClientRect(), k = r.width / c.width, mx = (e.clientX - r.left) / k; let best = null, bd = 1e9;
    c._hv.forEach(p => { const d = Math.abs(p.x - mx); if (d < bd) { bd = d; best = p; } });
    if (!best || bd > 40) { T.style.display = D.style.display = 'none'; return; }
    D.style.display = 'block'; D.style.left = (r.left + best.x * k) + 'px'; D.style.top = (r.top + best.y * k) + 'px';
    T.textContent = best.t; T.style.display = 'block'; T.style.left = Math.min(innerWidth - T.offsetWidth - 8, r.left + best.x * k + 12) + 'px'; T.style.top = Math.max(4, r.top + best.y * k - 34) + 'px';
  }
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerleave', () => { const T = tip(), D = dotEl(); if (T) T.style.display = 'none'; if (D) D.style.display = 'none'; }, true);
  return { gaugeHTML, kpi, tick, covBar, dist, reg, qIcon, CAT };
})();
