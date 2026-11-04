/* ── Contornos (isolíneas) por «marching squares» (UX-04) ── */
function contourSegs(g, th) {
  const out = [], { nx, ny, st, tot } = g, v = (i, j) => tot[j * nx + i], P = (i, j) => [(i + .5) * st, (j + .5) * st];
  const lerp = (a, b, va, vb) => { const t = (th - va) / (vb - va || 1e-9); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1), pa = P(i, j), pb = P(i + 1, j), pc = P(i + 1, j + 1), pd = P(i, j + 1);
    const k = (a >= th ? 8 : 0) | (b >= th ? 4 : 0) | (c >= th ? 2 : 0) | (d >= th ? 1 : 0);
    if (k === 0 || k === 15) continue;
    const T = () => lerp(pa, pb, a, b), R = () => lerp(pb, pc, b, c), B = () => lerp(pd, pc, d, c), L = () => lerp(pa, pd, a, d);
    const seg = (p, q) => out.push([p[0], p[1], q[0], q[1]]);
    switch (k) {
      case 1: case 14: seg(L(), B()); break;
      case 2: case 13: seg(B(), R()); break;
      case 3: case 12: seg(L(), R()); break;
      case 4: case 11: seg(T(), R()); break;
      case 5: seg(T(), L()); seg(B(), R()); break;
      case 6: case 9: seg(T(), B()); break;
      case 7: case 8: seg(T(), L()); break;
      case 10: seg(T(), R()); seg(L(), B()); break;
    }
  }
  return out;
}

