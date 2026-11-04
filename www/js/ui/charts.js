/* ── Gráficos pequeños: PDP, constelación IQ, franjas y H(f) ── */
function pdpDraw(P) {
  const c = $('pdp'), g = c.getContext('2d'), w = c.width, h = c.height, x0 = 34, y0 = h - 24, tm = Math.max(60, ...P.map(p => p.t)) * 1.1, lo = -100, hi = Math.max(-40, ...P.map(p => p.pr)) + 5;
  const X = t => x0 + (w - x0 - 8) * t / tm, Y = v => y0 - (y0 - 10) * (v - lo) / (hi - lo);
  g.clearRect(0, 0, w, h); g.strokeStyle = TH.bd; g.strokeRect(x0, 10, w - x0 - 8, y0 - 10); g.fillStyle = TH.mut; g.font = '10px Segoe UI';
  g.fillText(hi.toFixed(0), 2, 16); g.fillText(lo, 2, y0); g.fillText('0', x0, h - 12); g.fillText(tm.toFixed(0) + ' ns', w - 46, h - 12); g.fillText('retardo (ns) vs potencia (dBm)', x0 + 30, h - 2);
  for (let i = 1; i < 4; i++) { const yy = 10 + (y0 - 10) * i / 4; g.strokeStyle = TH.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, yy); g.lineTo(w - 8, yy); g.stroke(); }
  const hv = [];
  P.forEach((p, i) => {
    const col = i == S.pi ? TH.am : i ? TH.pu : TH.tx, xx = X(p.t), yy = Y(p.pr), gr = g.createLinearGradient(0, yy, 0, y0); gr.addColorStop(0, col); gr.addColorStop(1, FX.rgba(col, .15));
    g.fillStyle = gr; FX.rr(g, xx - 3, yy, 6, Math.max(1, y0 - yy), 3); g.fill(); g.beginPath(); g.arc(xx, yy, 4.5, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = TH.cw; g.lineWidth = 1.5; g.stroke();
    hv.push({ x: xx, y: yy, t: (i ? 'Reflejada #' + i : 'Directa') + ': ' + p.t.toFixed(1) + ' ns · ' + p.pr.toFixed(1) + ' dBm' });
  });
  Viz.reg(c, hv);
  const d = Phys.delaySpread(P);
  $('pdpt').innerHTML = `<small>τ<sub>rms</sub> = ${d.rms_ns.toFixed(1)} ns · B<sub>c</sub> ≈ ${isFinite(d.Bc_MHz) ? d.Bc_MHz.toFixed(0) + ' MHz' : '—'} · intervalo de guarda Wi-Fi 800 ns: los ecos de interiores (&lt; 100 ns) caen dentro.</small>`;
}
function iqDraw(lk) {
  const c = $('iq'), g = c.getContext('2d'), w = c.width, h = c.height, nm = lk.mn, q = /(\d+)-QAM/.exec(nm), M = q ? +q[1] : nm == 'BPSK 1/2' ? 2 : 4, snr = Math.max(Math.pow(10, lk.snr / 10), 1e-3);
  g.fillStyle = TH.bg; g.fillRect(0, 0, w, h);
  let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, gs = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2832 * rnd());
  const L = M == 2 ? 2 : Math.sqrt(M), pts = [];
  if (M == 2) pts.push([-1, 0], [1, 0]); else for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) pts.push([2 * i + 1 - L, 2 * j + 1 - L]);
  const pwr = pts.reduce((a, p) => a + p[0] * p[0] + p[1] * p[1], 0) / pts.length, sgm = Math.sqrt(pwr / (2 * snr)), k = (h / 2 - 8) / (Math.max(L - 1, 1) + 1.5);
  g.fillStyle = TH.rx; g.globalAlpha = .6;
  for (let n = 0; n < 450; n++) { const p = pts[Math.floor(rnd() * pts.length)]; g.fillRect(w / 2 + (p[0] + gs() * sgm) * k, h / 2 - (p[1] + gs() * sgm) * k, 2, 2); }
  g.globalAlpha = 1; g.strokeStyle = TH.cw; pts.forEach(p => g.strokeRect(w / 2 + p[0] * k - 2, h / 2 - p[1] * k - 2, 4, 4));
  $('iqt').textContent = lk.m < 0 ? 'Sin enlace: la nube de ruido tapa los puntos.' : `${nm} · EVM ≈ ${(100 / Math.sqrt(snr)).toFixed(1)} % · si los puntos se mezclan hay errores y el equipo baja de MCS.`;
}
/** Gráfico de líneas genérico: varias series, ejes con marcas, rejilla, escalón opcional (C-08). */
function chart2(id, series, o = {}) {
  const c = $(id), g = c.getContext('2d'), w = c.width, h = c.height, x0 = 52, y0 = h - 34, x1 = w - 12;
  const all = series.flatMap(s => s.y), xs = series.flatMap(s => s.x);
  let mn = o.ymin ?? Math.min(...all), mx = o.ymax ?? Math.max(...all); if (mx - mn < 1) { mx += .5; mn -= .5; }
  const xa = Math.min(...xs), xb = Math.max(...xs), X = v => x0 + (x1 - x0) * (v - xa) / ((xb - xa) || 1), Y = v => y0 - (y0 - 14) * (v - mn) / (mx - mn);
  g.fillStyle = TH.bg; g.fillRect(0, 0, w, h); g.font = '12px Segoe UI'; g.textAlign = 'right'; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4; g.strokeStyle = TH.grid; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); g.fillStyle = TH.mut; g.fillText(v.toFixed(Math.abs(mx - mn) < 10 ? 1 : 0), x0 - 5, Y(v) + 4); }
  g.textAlign = 'center'; for (let i = 0; i <= 5; i++) { const v = xa + (xb - xa) * i / 5; g.strokeStyle = TH.grid; g.beginPath(); g.moveTo(X(v), 14); g.lineTo(X(v), y0); g.stroke(); g.fillStyle = TH.mut; g.fillText(v.toFixed(Math.abs(xb - xa) < 5 ? 2 : 0), X(v), y0 + 15); }
  g.strokeStyle = TH.bd; g.strokeRect(x0, 14, x1 - x0, y0 - 14); g.fillStyle = TH.txt; g.fillText(o.xl || '', (x0 + x1) / 2, h - 5);
  g.save(); g.translate(13, (14 + y0) / 2); g.rotate(-Math.PI / 2); g.fillText(o.yl || '', 0, 0); g.restore();
  series.forEach((s, k) => {
    g.beginPath(); g.setLineDash(s.dash || []); g.strokeStyle = s.color || TH.rx; g.lineWidth = 2;
    s.y.forEach((v, i) => { if (o.step && i) g.lineTo(X(s.x[i]), Y(s.y[i - 1])); i ? g.lineTo(X(s.x[i]), Y(v)) : g.moveTo(X(s.x[i]), Y(v)); }); g.stroke(); g.setLineDash([]);
    if (!s.dash && !s.pts && s.x.length > 2) { g.lineTo(X(s.x[s.x.length - 1]), y0); g.lineTo(X(s.x[0]), y0); g.closePath(); const gr = g.createLinearGradient(0, 14, 0, y0); gr.addColorStop(0, FX.rgba(s.color || TH.rx, .26)); gr.addColorStop(1, FX.rgba(s.color || TH.rx, 0)); g.fillStyle = gr; g.fill(); }
    if (s.pts) s.x.forEach((xv, i) => { g.fillStyle = s.color; g.beginPath(); g.arc(X(xv), Y(s.y[i]), 4, 0, 7); g.fill(); if (s.err && s.err[i]) { g.beginPath(); g.moveTo(X(xv), Y(s.y[i] - s.err[i])); g.lineTo(X(xv), Y(s.y[i] + s.err[i])); g.stroke(); } });
  });
  g.textAlign = 'left'; series.forEach((s, k) => { if (!s.label) return; g.fillStyle = s.color; g.fillText((s.dash ? '┄ ' : '━ ') + s.label, x0 + 8 + k * 190, 28); });
  const dp = Math.abs(xb - xa) < 5 ? 2 : 0;
  Viz.reg(c, series[0].x.map((xv, i) => ({ x: X(xv), y: Y(series[0].y[i]), t: xv.toFixed(dp) + ' → ' + series.map(s => (s.y[i] ?? NaN).toFixed(1)).join(' · ') + ' ' + (o.yl || '') })));
  return { X, Y };
}
function fadeDraw() {
  const on = S.coh; $('dFad').style.display = on ? '' : 'none'; if (!on) return;
  const xs = [], ys = [];
  for (let c = -30; c <= 30; c++) { xs.push(c); ys.push(calc({ x: clamp(S.rx.x + c / 100, 0, S.W), y: S.rx.y }, 'coh').tot); }
  chart2('fad', [{ x: xs, y: ys, color: TH.rx }], { xl: 'desplazamiento del Rx (cm)', yl: 'dBm' });
  $('fadt').textContent = `Variación: ${(Math.max(...ys) - Math.min(...ys)).toFixed(1)} dB en 60 cm. Mínimos separados ≈ λ/2 = ${(lam() * 50).toFixed(1)} cm.`;
  const H = Phys.freqResp(S.paths.P, S.f, S.bw, 96);
  chart2('hf', [{ x: H.xs, y: H.ys, color: TH.am }], { xl: 'frecuencia respecto de la portadora (MHz)', yl: '|H(f)| dB' });
  const sp = Math.max(...H.ys) - Math.min(...H.ys); $('hft').textContent = `Variación dentro del canal de ${S.bw} MHz: ${sp.toFixed(1)} dB${sp > 6 ? ' · desvanecimiento selectivo en frecuencia (algunas subportadoras se anulan)' : ' · canal casi plano'}.`;
}

