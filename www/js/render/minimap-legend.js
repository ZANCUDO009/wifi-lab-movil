/* ── Minimapa (marco redondeado por CSS; el rectángulo de vista tiene borde animado) ── */
function drawMini() {
  const m = $('mm'), show = S.mode === '2d' && S.vz > 1.05; m.style.display = show ? 'block' : 'none'; if (!show) return;
  const g = m.getContext('2d'), w = m.width, h = m.height, k = Math.min((w - 8) / S.W, (h - 8) / S.H), ox = (w - S.W * k) / 2, oy = (h - S.H * k) / 2;
  g.clearRect(0, 0, w, h); g.fillStyle = TH.floor || TH.panel; g.fillRect(ox, oy, S.W * k, S.H * k);
  if (S.layers.heat && hmS.width) { g.globalAlpha = .75; g.imageSmoothingEnabled = true; g.drawImage(hmS, ox, oy, S.W * k, S.H * k); g.globalAlpha = 1; }
  g.lineWidth = 2; g.lineCap = 'round'; S.walls.forEach(wl => { g.strokeStyle = MAT[wl.m].c; g.beginPath(); g.moveTo(ox + wl.x1 * k, oy + wl.y1 * k); g.lineTo(ox + wl.x2 * k, oy + wl.y2 * k); g.stroke(); });
  S.aps.forEach(a => { g.fillStyle = a.srv === false ? TH.rd : '#2f7fe0'; g.beginPath(); g.arc(ox + a.x * k, oy + a.y * k, 3, 0, 7); g.fill(); });
  g.fillStyle = TH.rx; g.beginPath(); g.arc(ox + S.rx.x * k, oy + S.rx.y * k, 3, 0, 7); g.fill();
  const vw = W0 / S.sc, vh = H0 / S.sc, t = FX.motion() ? performance.now() / 60 : 0;
  g.strokeStyle = TH.am; g.fillStyle = FX.rgba(TH.am, .12); g.lineWidth = 1.8; g.setLineDash([5, 3]); g.lineDashOffset = -t;
  g.fillRect(ox + (S.vx - vw / 2) * k, oy + (S.vy - vh / 2) * k, vw * k, vh * k); g.strokeRect(ox + (S.vx - vw / 2) * k, oy + (S.vy - vh / 2) * k, vw * k, vh * k); g.setLineDash([]);
  m._k = { k, ox, oy };
}

/* ── Leyenda (C-13): estilo de línea + color + símbolo, nunca solo color. Barra de degradado continua con marcas (2.6) ── */
function legT(mode, v) { return mode === 'rssi' ? (v + 90) / 50 : mode === 'sinr' ? v / 45 : v; }
function legHTML() {
  const ln = (c, d, t) => `<span><i style="border-color:${c};border-top-style:${d}"></i>${t}</span>`;
  let h = ln('var(--tx)', 'dashed', 'directa (color según calidad)') + ' · ' + ln('var(--am)', 'solid', 'reflejada') + '<br>' +
    `<span style="color:var(--tx)">━</span> rayo directo · ${ln('var(--am)', 'dashed', 'rayo reflejado')} · ${ln('var(--rx)', 'dotted', 'rayo transmitido')}<br>` +
    `<span style="color:var(--pu)">●</span> reflexión · <span style="color:var(--rd)">●</span> pared atravesada · <span style="color:var(--tx)">╌</span> frente de onda<br>` +
    `<span style="color:var(--am)">★</span> router principal · <span style="color:var(--rd)">ϟ</span> interferente · <span style="color:var(--m)">⁄</span> apagado`;
  if (S.layers.heat && S.grid) {
    const m = HMODES[S.hmMode];
    h += `<br><b>${m.n}</b>`;
    if (S.hmMode === 'qual') h += '<br>' + [['≥−67 voz/video', 4], ['≥−70 datos', 3], ['≥−75 mínimo', 2], ['≥−82 borde', 1], ['sin servicio', 0]].map(([t, i]) => `<span class="chipsq"><i style="background:rgb(${QUALC[i]})"></i>${t}</span>`).join('');
    else if (S.hmMode === 'cnt') h += '<br>' + [0, 1, 2, 3].map(i => `<span class="chipsq"><i style="background:rgb(${CNTC[i]})"></i>${i === 3 ? '3+' : i} AP</span>`).join('');
    else {
      const marks = S.hmMode === 'mbps' ? [[0, '0'], [1, 'máx.']] : m.marks;
      h += `<div class="gbar" style="background:${FX.palCss(10)}"><div class="garrow" id="garrow"></div>${marks.map(([v, t]) => `<span style="left:${(clamp(legT(S.hmMode, v), 0, 1) * 100).toFixed(1)}%">${t}</span>`).join('')}</div>`;
    }
  }
  if (S.layers.cont) h += '<br>Isolíneas: ─ −50 · ╌ −67 · ┄ −75 · ··· −82 dBm';
  if (S.layers.rings) h += '<br><span style="color:var(--ok)">◯</span> hasta dónde llega −67 dBm · <span style="color:var(--am)">◌</span> −75 dBm (según el mapa, con paredes)';
  $('leg').innerHTML = h;
}
/** Flecha de la leyenda que sigue al valor bajo el cursor. */
function legMark(c, l) {
  const a = $('garrow'); if (!a) return;
  const v = S.hmMode === 'rssi' ? c.tot : S.hmMode === 'sinr' ? l.snr : S.hmMode === 'mbps' ? l.use / (S._maxM || 1) : null;
  if (v == null) { a.style.display = 'none'; return; }
  a.style.display = 'block'; a.style.left = (clamp(legT(S.hmMode, v), 0, 1) * 100).toFixed(1) + '%';
}
