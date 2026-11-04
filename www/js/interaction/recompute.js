/* ── Cálculo por cambio ── */
function recompute() {
  const t0 = performance.now();
  S.paths = calc();
  const act = S.aps.map((a, i) => i).filter(i => S.aps[i].on !== false), q = QUAL[S.quality === 'auto' ? (S.autoQ || 'high') : S.quality];
  const nr = Math.min(S.rays, q.rays), per = Math.max(8, Math.floor(nr / Math.max(1, act.length)));
  S.rv = [];
  if (nr) act.forEach(i => Phys.traceRays(S, S.aps[i], per, 3500).forEach(s => { s.ap = i; S.rv.push(s); }));
  S.fv = [];
  if (S.layers.front) act.forEach(i => Phys.traceRays(S, S.aps[i], Math.max(60, Math.round(150 / act.length)), 2500).forEach(s => { s.ap = i; S.fv.push(s); }));
  S.calcMs = performance.now() - t0;
  uiFast();
}

