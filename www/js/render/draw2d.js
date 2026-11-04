/* ════════════════════════════════════════════════════════════════════
   DIBUJO 2D · plano con suelo, habitaciones, paredes con grosor y sombra,
   puertas/ventanas como símbolos de arquitectura, dispositivos con halo y
   insignias, ondas con brillo, mapa de calor suavizado, sonda y herramientas.
   Los efectos se apagan solos con calidad Baja o «Reducir movimiento» (FX.q / FX.motion).
   ════════════════════════════════════════════════════════════════════ */
function dot(x, y, r, c, l, lc, ring) {
  cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fillStyle = c; cx.fill(); cx.strokeStyle = TH.cw; cx.lineWidth = 2; cx.stroke();
  if (ring) { cx.beginPath(); cx.arc(x, y, r + 5, 0, 7); cx.strokeStyle = lc; cx.lineWidth = 1.5; cx.setLineDash([3, 3]); cx.stroke(); cx.setLineDash([]); }
  if (l) FX.pill(cx, x, y + r + fp(12), l, { fg: lc, bold: 1, px: fp(12) });
}
/* ── Dispositivos con icono (assets/icons/devices): círculo de color + glifo blanco ── */
const DEV_ICON = { basic: 'router', dual: 'router', w6: 'router', ap: 'ap_ceiling', mesh: 'mesh', rep: 'repeater', custom: 'router' };   // equipo → icono
const deviceIcon = a => { if (a.srv === false) return 'interferer'; const n = DEV_ICON[a.eq] || 'router'; return Icons.has('devices', n + '_v2') ? n + '_v2' : Icons.has('devices', n) ? n : 'router'; };
const clientIcon = () => Icons.has('devices', S.client) ? S.client : 'laptop';                                                  // perfil de cliente → icono
/** Insignia pequeña en la esquina de un dispositivo: estrella (principal), rayo (interferente) o raya (apagado). */
function corner(x, y, kind) {
  cx.save(); cx.beginPath(); cx.arc(x, y, 7, 0, 7);
  cx.fillStyle = kind === 'star' ? '#ffc53d' : kind === 'bolt' ? '#ff4d6a' : '#7b8494'; cx.fill(); cx.strokeStyle = TH.cw; cx.lineWidth = 1.5; cx.stroke();
  cx.strokeStyle = kind === 'star' ? '#5a3b00' : '#fff'; cx.fillStyle = cx.strokeStyle; cx.lineWidth = 1.4; cx.lineJoin = 'round';
  if (kind === 'star') { cx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2 : 4.6; cx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } cx.closePath(); cx.fill(); }
  else if (kind === 'bolt') { cx.beginPath(); cx.moveTo(x + 1.5, y - 4.5); cx.lineTo(x - 2.5, y + .5); cx.lineTo(x, y + .5); cx.lineTo(x - 1.5, y + 4.5); cx.lineTo(x + 2.5, y - .5); cx.lineTo(x, y - .5); cx.closePath(); cx.fill(); }
  else { cx.beginPath(); cx.moveTo(x - 3.8, y + 3.8); cx.lineTo(x + 3.8, y - 3.8); cx.stroke(); }
  cx.restore();
}
/** o = { halo: 0..1 (potencia Tx), off, star, intf, bounce: 0..1 }  */
function badge(x, y, r, c, icon, l, lc, ring, o = {}) {
  const ga = cx.globalAlpha, k = o.bounce == null ? 1 : Math.max(.01, FX.easeBack(o.bounce)); r *= k;
  if (o.halo != null) {                                                       // halo pulsante: más grande y brillante cuanto más potencia Tx
    const t = FX.now(), pulse = FX.motion() ? .5 + .5 * Math.sin(t * 2.4 + x * .01) : .5, hr = r + 5 + (6 + 14 * o.halo) * pulse;
    cx.globalAlpha = ga * (.10 + .22 * o.halo) * (1 - .35 * pulse); cx.beginPath(); cx.arc(x, y, hr, 0, 7); cx.fillStyle = c; cx.fill(); cx.globalAlpha = ga;
  }
  cx.beginPath(); cx.arc(x, y, r + 4, 0, 7); cx.fillStyle = c; cx.globalAlpha = ga * .22; cx.fill(); cx.globalAlpha = ga;      // halo fijo
  const g = cx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); g.addColorStop(0, '#fff6'); g.addColorStop(.35, c); g.addColorStop(1, c);
  cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fillStyle = o.off ? '#5d6678' : c; cx.fill(); cx.fillStyle = g; cx.globalAlpha = ga * (o.off ? .3 : 1); cx.fill(); cx.globalAlpha = ga; cx.strokeStyle = TH.cw; cx.lineWidth = 2; cx.stroke();
  Icons.draw(cx, 'devices', icon, x, y, r * 1.35, '#ffffff');
  if (o.off) { cx.beginPath(); cx.moveTo(x - r * .7, y + r * .7); cx.lineTo(x + r * .7, y - r * .7); cx.strokeStyle = '#fff'; cx.lineWidth = 2.6; cx.stroke(); }
  if (o.star) corner(x + r * .78, y - r * .78, 'star'); if (o.intf) corner(x + r * .78, y - r * .78, 'bolt'); if (o.off && !o.intf) corner(x + r * .78, y - r * .78, 'off');
  if (ring) { cx.beginPath(); cx.arc(x, y, r + 7, 0, 7); cx.strokeStyle = lc; cx.lineWidth = 1.5; cx.setLineDash([3, 3]); cx.stroke(); cx.setLineDash([]); }
  if (l) FX.pill(cx, x, y + r + fp(13), l, { fg: lc, bold: 1, px: fp(12) });
}
const poly = (pts, close) => { cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); if (close) cx.closePath(); };
let planImg = null;

/** Frente de onda real: une los extremos de rayos vecinos que siguieron la misma historia de reflexión/transmisión (C-02). Con brillo: trazo ancho translúcido + trazo fino. */
function drawFront(D) {
  const g = new Map();
  (S.fv || []).forEach(s => {
    if (s.s0 > D || D >= s.s0 + s.l) return;
    const f = (D - s.s0) / s.l, k = s.ap + ':' + s.key;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push({ i: s.i, n: s.n, x: s.a.x + (s.b.x - s.a.x) * f, y: s.a.y + (s.b.y - s.a.y) * f, k: s.k });
  });
  const q = FX.q(), glow = q > 0 && S.layers.glow !== 0, add = glow && FX.dark() && !S.layers.heat;
  const col = k => k === 'd' ? TH.tx : k === 'r' ? TH.am : TH.rx;
  const runs = [];
  g.forEach(arr => {
    arr.sort((a, b) => a.i - b.i);
    let run = [];
    const flush = () => { if (run.length) runs.push(run); run = []; };
    arr.forEach(p => { if (run.length && p.i - run[run.length - 1].i > 1) flush(); run.push(p); });
    flush();
  });
  cx.save(); cx.lineJoin = 'round'; cx.lineCap = 'round';
  if (add) cx.globalCompositeOperation = 'lighter';
  runs.forEach(run => {
    if (run.length < 2) { cx.beginPath(); cx.arc(X(run[0].x), Y(run[0].y), 2, 0, 7); cx.fillStyle = TH.tx; cx.fill(); return; }
    const pts = run.map(p => [X(p.x), Y(p.y)]), c = col(run[0].k);
    const direct = run[0].k === 'd';
    if (glow && direct) { poly(pts); cx.strokeStyle = c; cx.globalAlpha = (add ? .15 : .12) * Math.max(.6, TH.glow || 1); cx.lineWidth = 6; cx.stroke(); }
    poly(pts); cx.strokeStyle = c; cx.globalAlpha = direct ? (glow ? .95 : .8) : .5; cx.lineWidth = direct ? (glow ? 1.8 : 2.2) : 1.3; cx.stroke();
  });
  cx.restore();
}

/** Puertas, ventanas y pasos como símbolos de arquitectura sobre el hueco de la pared. */
function drawOpening(w, o, lw, grow) {
  const ax = X(w.x1 + (w.x2 - w.x1) * o.a), ay = Y(w.y1 + (w.y2 - w.y1) * o.a), bx = X(w.x1 + (w.x2 - w.x1) * o.b), by = Y(w.y1 + (w.y2 - w.y1) * o.b);
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); if (L < 2) return;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, type = FX.openType(w, o), ink = TH.txt, hl = lw / 2;
  cx.save(); cx.globalAlpha = grow; cx.lineCap = 'butt';
  cx.strokeStyle = ink; cx.lineWidth = 1.6;                                        // jambas: dos rayitas a través del muro
  cx.beginPath(); cx.moveTo(ax - nx * hl, ay - ny * hl); cx.lineTo(ax + nx * hl, ay + ny * hl); cx.moveTo(bx - nx * hl, by - ny * hl); cx.lineTo(bx + nx * hl, by + ny * hl); cx.stroke();
  if (type === 'window') {
    cx.fillStyle = 'rgba(150,215,240,.30)'; cx.beginPath(); cx.moveTo(ax - nx * hl * .45, ay - ny * hl * .45); cx.lineTo(bx - nx * hl * .45, by - ny * hl * .45); cx.lineTo(bx + nx * hl * .45, by + ny * hl * .45); cx.lineTo(ax + nx * hl * .45, ay + ny * hl * .45); cx.closePath(); cx.fill();
    cx.lineWidth = 1.3; cx.beginPath();
    for (const s of [-.45, .45]) { cx.moveTo(ax + nx * hl * s, ay + ny * hl * s); cx.lineTo(bx + nx * hl * s, by + ny * hl * s); }
    cx.stroke();
  } else if (type === 'door') {
    const left = w.id % 2 === 0, hx = left ? ax : bx, hy = left ? ay : by, side = (w.id % 3 === 0 ? -1 : 1), sx = nx * side, sy = ny * side;     // bisagra y lado de apertura
    const tx = hx + sx * L, ty = hy + sy * L, far = left ? [bx, by] : [ax, ay];
    cx.strokeStyle = (MAT.wood && MAT.wood.c) || '#c58b4a'; cx.lineWidth = Math.max(2.4, hl * .5); cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(hx, hy); cx.lineTo(tx, ty); cx.stroke();     // hoja
    const a0 = Math.atan2(sy, sx), a1 = Math.atan2(far[1] - hy, far[0] - hx); let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    cx.strokeStyle = ink; cx.globalAlpha = grow * .75; cx.lineWidth = 1; cx.setLineDash([4, 3]); cx.beginPath(); cx.arc(hx, hy, L, a0, a0 + d, d < 0); cx.stroke(); cx.setLineDash([]);   // arco de giro
  }
  cx.restore();
}

/* ── Capas en caché del plano 2D: lo que no cambia entre cuadros se pinta una vez y se copia ── */
const layer2d = { a: { c: null, k: '' }, b: { c: null, k: '' } };
function blitLayer(l, key, paint) {
  if (!l.c) l.c = document.createElement('canvas');
  if (l.c.width !== cv.width || l.c.height !== cv.height) { l.c.width = cv.width; l.c.height = cv.height; l.k = ''; }
  if (l.k !== key) {
    const real = cx, lc = l.c.getContext('2d'), d = devicePixelRatio || 1; lc.setTransform(d, 0, 0, d, 0, 0); lc.clearRect(0, 0, W0, H0);
    cx = lc; try { paint(); } finally { cx = real; } l.k = key;
  }
  cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(l.c, 0, 0); cx.restore();
}
const r2 = n => Math.round(n * 100);
const key2dA = () => [W0, H0, devicePixelRatio, r2(S.sc), r2(S.ox), r2(S.oy), S.theme, FX.floorId(), S.layers.floor, S.layers.rooms, S.layers.plan, S.layers.grid, planImg ? [planImg.x, planImg.y, planImg.w, planImg.op].join() : '', FX.geoKey(), S.W, S.H].join('|');
function paintBelow() {
  const sc = S.sc, L = S.layers, dark = FX.dark();
  cx.fillStyle = TH.bg; cx.fillRect(0, 0, W0, H0);
  cx.save(); cx.beginPath(); cx.rect(X(0), Y(0), S.W * sc, S.H * sc); cx.clip();
  /* Suelo y habitaciones (2.1) */
  if (L.floor !== 0) {
    cx.fillStyle = TH.floor || TH.bg; cx.globalAlpha = .9; cx.fillRect(X(0), Y(0), S.W * sc, S.H * sc); cx.globalAlpha = 1;
    const fid = FX.floorId(); if (fid && Textures.has(fid)) Textures.floor2D(cx, fid, X(0), Y(0), S.W * sc, S.H * sc, sc, (TH.floorA || .5) * .42);
  }
  if (L.rooms !== 0 && S.walls.length) {
    const R = FX.rooms();
    if (R.list.length) { cx.imageSmoothingEnabled = false; cx.globalAlpha = TH.roomA || .1; cx.drawImage(R.canvas, X(0), Y(0), S.W * sc, S.H * sc); cx.globalAlpha = 1; cx.imageSmoothingEnabled = true; }
  }
  if (L.plan && planImg) { cx.globalAlpha = planImg.op; cx.drawImage(planImg.img, X(planImg.x), Y(planImg.y), planImg.w * sc, planImg.w * sc * planImg.img.height / planImg.img.width); cx.globalAlpha = 1; }
  if (L.grid) {                                                                        // cuadrícula de puntos: discreta, con marcas cada 5 m
    const step = sc < 14 ? 2 : 1; cx.fillStyle = TH.grid; cx.globalAlpha = dark ? .95 : .9; cx.beginPath();
    for (let x = 0; x <= S.W; x += step) for (let y = 0; y <= S.H; y += step) { if (x % 5 || y % 5) cx.rect(X(x) - 1, Y(y) - 1, 2, 2); }
    cx.fill(); cx.beginPath();
    for (let x = 0; x <= S.W; x += 5) for (let y = 0; y <= S.H; y += 5) cx.rect(X(x) - 1.6, Y(y) - 1.6, 3.2, 3.2);
    cx.fillStyle = TH.mut; cx.globalAlpha = .55; cx.fill(); cx.globalAlpha = 1;
  }
  cx.restore();
}

const key2dB = () => [W0, H0, devicePixelRatio, r2(S.sc), r2(S.ox), r2(S.oy), S.theme, FX.geoKey(), S.sel, S.hoverWall, S.layers.labels, FX.q(), r2(S.vz), S.fscale, S.f, S.bw, S.obl, S.fres].join('|');
function paintWalls(enterP, entering) {
  const q = FX.q(), sc = S.sc, L = S.layers, dark = FX.dark();
  /* Paredes: sombra, textura con grosor, remates y aperturas (2.2 / 2.3) */
  const J = FX.geo().joins, hwId = S.hoverWall, lwOf = w => Math.max(7, 4 + w.th / 8 * Math.min(1.6, S.vz), w.th / 100 * sc);
  const growOf = (w, i) => entering ? FX.easeOut(enterP / .55 - i * .05) : 1;
  const pieceXY = (w, p, lw, join) => {
    let ax = X(p[0]), ay = Y(p[1]), bx = X(p[2]), by = Y(p[3]); const L2 = Math.hypot(bx - ax, by - ay) || 1, ux = (bx - ax) / L2, uy = (by - ay) / L2, e = lw / 2 - .5;
    if (join) { if (join[0] && Math.abs(p[0] - w.x1) + Math.abs(p[1] - w.y1) < 1e-6) { ax -= ux * e; ay -= uy * e; } if (join[1] && Math.abs(p[2] - w.x2) + Math.abs(p[3] - w.y2) < 1e-6) { bx += ux * e; by += uy * e; } }
    return [ax, ay, bx, by];
  };
  if (q > 0) {                                                                         // sombra proyectada hacia abajo-derecha
    cx.save(); cx.lineCap = 'butt'; const off = Math.min(4, 1.5 + sc * .06);
    S.walls.forEach((w, i) => {
      const lw = lwOf(w) * growOf(w, i); if (lw < 1) return;
      wallPieces(w).forEach(p => { const a = pieceXY(w, p, lw, J[w.id]);
        for (const [add, al] of q > 1 ? [[7, .06], [3.5, .09], [0, .16]] : [[3, .12]]) { cx.beginPath(); cx.moveTo(a[0] + off, a[1] + off * 1.3); cx.lineTo(a[2] + off, a[3] + off * 1.3); cx.lineWidth = lw + add; cx.strokeStyle = dark ? `rgba(0,0,0,${al * 2.2})` : `rgba(20,30,50,${al * 1.3})`; cx.stroke(); }
      });
    });
    cx.restore();
  }
  const bp = S.theme === 'blueprint';
  S.walls.forEach((w, wi) => {
    const m = MAT[w.m], on = w.id === S.sel, g = growOf(w, wi), isNew = S.drag && S.drag.w === w && S.drag.new;
    if (g <= 0) return;
    cx.lineCap = 'butt'; cx.globalAlpha = isNew ? .78 : Math.min(1, g * 1.4);
    const lw = lwOf(w) * g;
    wallPieces(w).forEach(p => {
      const a = pieceXY(w, p, lw, J[w.id]);
      Textures.wall2D(cx, w.m, a[0], a[1], a[2], a[3], lw, sc, on ? TH.tx : bp ? '#ffffffcc' : dark ? 'rgba(0,0,0,.6)' : 'rgba(10,20,40,.5)', on ? 2.5 : 1.1, w.id);
      if (q > 0) { const L2 = Math.hypot(a[2] - a[0], a[3] - a[1]) || 1, nx = -(a[3] - a[1]) / L2, ny = (a[2] - a[0]) / L2; cx.beginPath(); cx.moveTo(a[0] - nx * lw * .32, a[1] - ny * lw * .32); cx.lineTo(a[2] - nx * lw * .32, a[3] - ny * lw * .32); cx.strokeStyle = 'rgba(255,255,255,.16)'; cx.lineWidth = 1; cx.stroke(); }   // borde de luz
      if (isNew) { cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(a[2], a[3]); cx.lineWidth = lw + 4; cx.strokeStyle = FX.rgba(TH.am, .25); cx.setLineDash([]); cx.stroke(); }
    });
    cx.globalAlpha = 1;
    (w.op || []).forEach(o => drawOpening(w, o, lw, Math.min(1, g * 1.3)));
    if (L.labels || on || hwId === w.id) {
      const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1), tx = on ? `#${w.id} ${m.n} · −${Phys.wallLoss(w, S).toFixed(0)} dB · Γ ${m.g} · ${len.toFixed(1)} m` : (hwId === w.id ? `#${w.id} ${m.n}` : `#${w.id}`);
      FX.pill(cx, X((w.x1 + w.x2) / 2), Y((w.y1 + w.y2) / 2) - lw / 2 - fp(11), tx, { px: fp(11), bold: on, icon: (on || hwId === w.id) && Icons.has('materials', w.m) ? ['materials', w.m] : null, border: on ? TH.tx : null });
    }
    if (on) [[w.x1, w.y1], [w.x2, w.y2]].forEach(p => { cx.beginPath(); cx.arc(X(p[0]), Y(p[1]), 6.5, 0, 7); cx.fillStyle = TH.tx; cx.fill(); cx.strokeStyle = TH.cw; cx.lineWidth = 2; cx.stroke(); });
  });
}

function draw2D() {
  size(); viewXform();
  const q = FX.q(), mot = FX.motion(), t = FX.now(), now = performance.now(), L = S.layers, sc = S.sc, dark = FX.dark();
  /* animación de entrada (5.2): las paredes «crecen» y los equipos rebotan al cargar un escenario */
  const enterP = S.enterT && mot ? (now - S.enterT) / 1000 : 9, entering = enterP < 1.4;
  blitLayer(layer2d.a, key2dA(), paintBelow);                                          // fondo, suelo, habitaciones, plano y cuadrícula (en caché)
  cx.save(); cx.beginPath(); cx.rect(X(0), Y(0), S.W * sc, S.H * sc); cx.clip();
  if (L.heat && S.grid && hmc.width) { cx.imageSmoothingEnabled = !/^(cnt|qual)$/.test(S.hmMode); cx.imageSmoothingQuality = 'low'; cx.globalAlpha = .82; cx.drawImage(hmShow(), X(0), Y(0), S.W * sc, S.H * sc); cx.globalAlpha = 1; cx.imageSmoothingEnabled = true; }
  if (L.cont && S.grid) {
    if (!S._cont || S._contG !== S.grid) { S._cont = [-50, -67, -75, -82].map(t => ({ t, s: contourSegs(S.grid, t) })); S._contG = S.grid; }
    S._cont.forEach(({ t, s }, i) => {
      cx.beginPath(); s.forEach(q => { cx.moveTo(X(q[0]), Y(q[1])); cx.lineTo(X(q[2]), Y(q[3])); });
      cx.strokeStyle = TH.cw; cx.lineWidth = 1.6; cx.setLineDash([[1, 0], [8, 3], [4, 3], [2, 3]][i]); cx.globalAlpha = .9; cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
    });
    S._cont.forEach(({ t, s }) => { if (s.length) { const qq = s[Math.floor(s.length / 2)]; FX.pill(cx, X(qq[0]) + 4, Y(qq[1]) - 3, t + ' dBm', { px: fp(11), bold: 1, align: 'left', pad: 4 }); } });   // etiquetas con fondo (2.6)
  }
  /* Anillos de alcance (2.4): hasta dónde llega −67 dBm (voz/video) y −75 dBm (mínimo), según el mapa calculado (incluye paredes) */
  if (L.rings && S.grid) S.aps.forEach(a => {
    if (a.on === false || a.srv === false) return;
    [[-67, TH.ok, []], [-75, TH.am, [6, 5]]].forEach(([thr, c, dash]) => {
      const pts = FX.ringPoly(a, thr); if (!pts) return;
      poly(pts.map(p => [X(p[0]), Y(p[1])]), true); cx.fillStyle = FX.rgba(c, thr === -67 ? .06 : .03); cx.fill();
      cx.strokeStyle = c; cx.globalAlpha = .7; cx.lineWidth = 1.5; cx.setLineDash(dash); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
      if (q > 0) { const p = pts[9]; FX.pill(cx, X(p[0]), Y(p[1]), thr + ' dBm', { px: fp(10), fg: c, pad: 3 }); }
    });
  });
  if (L.fresnel && S.aps.length) {
    const A = S.aps[S.paths.best >= 0 ? S.paths.best : 0], B = S.rx, d = hyp(A, B);
    if (d > .5) {
      const r1 = Phys.fresnelRadius(1, lam(), d / 2, d / 2), ang = Math.atan2(B.y - A.y, B.x - A.x);
      cx.save(); cx.translate(X((A.x + B.x) / 2), Y((A.y + B.y) / 2)); cx.rotate(ang);
      cx.beginPath(); cx.ellipse(0, 0, d / 2 * sc, r1 * sc, 0, 0, 7); cx.fillStyle = TH.pu; cx.globalAlpha = .13; cx.fill(); cx.globalAlpha = .8; cx.strokeStyle = TH.pu; cx.lineWidth = 1.5; cx.setLineDash([2, 4]); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1; cx.restore();
    }
  }
  /* Rayos visuales: continuo = directo, guiones largos = reflejado, punteado = transmitido. Fundido de salida según la energía que les queda (2.5) */
  if (L.rays) {
    const D = S.dist, add = q > 0 && S.layers.glow !== 0 && dark && !L.heat, hm = L.heat ? .7 : 1;
    cx.save(); if (add) cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
    S.rv.forEach(s => {
      if (s.k !== 'd' && !L.ref) return;
      if (D <= s.s0) return;
      const f = Math.min(1, (D - s.s0) / s.l), x0 = X(s.a.x), y0 = Y(s.a.y), x1 = X(s.a.x + (s.b.x - s.a.x) * f), y1 = Y(s.a.y + (s.b.y - s.a.y) * f), c = s.k === 'd' ? TH.tx : s.k === 'r' ? TH.am : TH.rx;
      const a0 = clamp(Math.pow(s.al, .75) * .95, .12, 1) * hm;
      if (q > 0 && s.k === 'd' && Math.abs(x1 - x0) + Math.abs(y1 - y0) > 3) { const gr = cx.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, FX.rgba(c, a0)); gr.addColorStop(1, FX.rgba(c, a0 * .5)); cx.strokeStyle = gr; cx.globalAlpha = 1; } else { cx.strokeStyle = c; cx.globalAlpha = a0 * (s.k === 'd' ? 1 : .8); }
      cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1);
      cx.setLineDash(s.k === 'd' ? [] : s.k === 'r' ? [9, 4] : [2, 3]); cx.lineWidth = s.k === 'd' ? 1.4 : 1.3; cx.stroke();
      if (s.k !== 'd' && q > 1 && mot && f > 0 && D - s.s0 < 1.1) { cx.setLineDash([]); FX.spark(cx, x0, y0, 14, c, (1 - (D - s.s0) / 1.1) * .9); }      // destello en el punto de impacto
    });
    cx.setLineDash([]); cx.restore(); cx.globalAlpha = 1;
  }
  if (L.front) drawFront(S.dist);
  /* Partículas de señal por la trayectoria directa (5.3, solo calidad Alta) */
  if (q > 1 && mot && L.part !== 0 && S.paths.P.length && S.paths.tot > -95) {
    const p = S.paths.P[0], s01 = clamp((S.paths.tot + 90) / 50, 0, 1), n = Math.round(2 + 7 * s01), sp = .12 + .35 * s01;
    cx.save(); if (dark) cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const f = ((t * sp + i / n) % 1), u = atDist(p, f * p.len); if (u) FX.spark(cx, X(u.x), Y(u.y), 7 + 5 * s01, TH.tx, .5 + .5 * Math.sin(f * 3.14)); }
    cx.restore();
  }
  cx.restore();
  /* Paredes: sombra, textura con grosor, remates y aperturas (2.2 / 2.3) — en caché cuando nada cambia */
  if (entering) paintWalls(enterP, true);
  else blitLayer(layer2d.b, key2dB(), () => paintWalls(9, false));
  /* Trayectorias del receptor */
  const P = S.paths.P;
  if (P.length) {
    [...P.keys()].sort((a, b) => (a == S.pi) - (b == S.pi)).forEach(i => {
      const p = P[i], sel = i == S.pi;
      poly(p.pts.map(q => [X(q.x), Y(q.y)])); cx.setLineDash(i ? [] : [7, 5]);
      cx.strokeStyle = i ? (sel ? TH.am : TH.am + '66') : qc(p.pr); cx.globalAlpha = i && !sel ? .55 : 1; cx.lineWidth = sel ? 3.2 : 1.5; cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
      if (sel) p.pts.slice(1, -1).forEach(q => dot(X(q.x), Y(q.y), 6, TH.pu));
      const u = atDist(p, S.dist);
      if (u) { cx.beginPath(); cx.arc(X(u.x), Y(u.y), sel ? 6 : 4, 0, 7); cx.fillStyle = sel ? TH.cw : TH.am; cx.fill(); }
    });
    const sp = P[Math.min(S.pi, P.length - 1)];
    sp.cr.forEach(c => { const q = atDist({ pts: sp.pts }, c.d); if (q) dot(X(q.x), Y(q.y), 5, TH.rd); });
  }
  /* Mediciones importadas, coloreadas por error (VA-03) */
  if (L.meas && S.meas.length) S.meas.forEach(m => {
    const sim = calc({ x: m.x, y: m.y }, measMode()).tot, e = m.m - sim, col = Math.abs(e) < 3 ? TH.ok : Math.abs(e) < 6 ? TH.am : TH.rd;
    cx.beginPath(); cx.rect(X(m.x) - 6, Y(m.y) - 6, 12, 12); cx.fillStyle = col; cx.fill(); cx.strokeStyle = TH.cw; cx.lineWidth = 1.5; cx.stroke();
    FX.pill(cx, X(m.x), Y(m.y) - 14, `${m.m} (${sg(e)})`, { px: fp(10) });
  });
  /* Estela del receptor y posición fantasma al arrastrar (2.4 / 5.4) */
  if (mot && L.trail !== 0) {
    const tr = S.rxTrail || []; for (let i = tr.length - 1; i >= 0; i--) if (now - tr[i].t > 900) tr.splice(i, 1);
    if (tr.length > 1) { cx.save(); cx.lineCap = 'round'; for (let i = 1; i < tr.length; i++) { cx.beginPath(); cx.moveTo(X(tr[i - 1].x), Y(tr[i - 1].y)); cx.lineTo(X(tr[i].x), Y(tr[i].y)); cx.strokeStyle = TH.rx; cx.globalAlpha = Math.max(0, 1 - (now - tr[i].t) / 900) * .55; cx.lineWidth = 2 + 6 * (i / tr.length); cx.stroke(); } cx.restore(); }
    const gh = S.ghost; if (gh) { const age = gh.end ? (now - gh.end) / 500 : 0; if (age >= 1) S.ghost = null; else { const cur = gh.k === 'rx' ? S.rx : S.aps[gh.i]; cx.save(); cx.globalAlpha = .38 * (1 - age); if (cur) { cx.setLineDash([4, 4]); cx.beginPath(); cx.moveTo(X(gh.x), Y(gh.y)); cx.lineTo(X(cur.x), Y(cur.y)); cx.strokeStyle = TH.mut; cx.lineWidth = 1.2; cx.stroke(); cx.setLineDash([]); } badge(X(gh.x), Y(gh.y), 12, gh.k === 'rx' ? '#17b88a' : '#2f7fe0', gh.k === 'rx' ? clientIcon() : deviceIcon(S.aps[gh.i] || {}), null, null); cx.restore(); } }
  }
  /* Dispositivos: halo según potencia, insignias de estado, rebote al aparecer */
  S.aps.forEach((a, i) => {
    const nm = i ? (a.srv === false ? 'Interferente ' + i : 'AP ' + (i + 1)) : 'Router (Tx)', off = a.on === false, intf = a.srv === false;
    cx.globalAlpha = off ? .5 : 1;
    badge(X(a.x), Y(a.y), 14, intf ? TH.rd : '#2f7fe0', deviceIcon(a), nm + (off ? ' (apagado)' : ''), intf ? TH.rd : TH.tx, i === S.apSel && S.aps.length > 1,
      { halo: off ? null : clamp((a.pt - 10) / 20, .15, 1), off, star: i === 0 && !intf && !off, intf, bounce: entering ? enterP / .6 - .35 - i * .12 : null });
    cx.globalAlpha = 1;
  });
  badge(X(S.rx.x), Y(S.rx.y), 14, '#17b88a', clientIcon(), 'Dispositivo (Rx)', TH.rx, false, { bounce: entering ? enterP / .6 - .5 : null });
  if (S.hintRings) { const tt = performance.now() / 1000, r = 14 + 9 * (tt % 1); [S.aps[0], S.rx].forEach(p => { cx.beginPath(); cx.arc(X(p.x), Y(p.y), r, 0, 7); cx.strokeStyle = TH.am; cx.globalAlpha = 1 - (tt % 1); cx.lineWidth = 3; cx.stroke(); cx.globalAlpha = 1; FX.pill(cx, X(p.x), Y(p.y) - 26, 'arrástrame', { px: fp(13), bold: 1, fg: TH.am }); }); }
  if (S.target) { const tt = performance.now() / 1000, r = 12 + 10 * (tt % 1); cx.beginPath(); cx.arc(X(S.target.x), Y(S.target.y), r, 0, 7); cx.strokeStyle = TH.pu; cx.lineWidth = 3; cx.stroke(); FX.pill(cx, X(S.target.x), Y(S.target.y) - 24, 'destino', { px: fp(13), bold: 1, fg: TH.pu }); }
  /* Regla con extremos y cota en recuadro (2.7) */
  if (S.ruler) {
    const r = S.ruler, b = r.b || r.a, ax = X(r.a.x), ay = Y(r.a.y), bx = X(b.x), by = Y(b.y); poly([[ax, ay], [bx, by]]); cx.strokeStyle = TH.am; cx.lineWidth = 2; cx.stroke();
    const ang = Math.atan2(by - ay, bx - ax), tk = 7; cx.beginPath(); for (const [x, y] of [[ax, ay], [bx, by]]) { cx.moveTo(x - Math.sin(ang) * tk, y + Math.cos(ang) * tk); cx.lineTo(x + Math.sin(ang) * tk, y - Math.cos(ang) * tk); } cx.lineWidth = 2.4; cx.stroke();
    [[ax, ay], [bx, by]].forEach(([x, y]) => { cx.beginPath(); cx.arc(x, y, 3.5, 0, 7); cx.fillStyle = TH.am; cx.fill(); });
    if (r.b) FX.pill(cx, (ax + bx) / 2, (ay + by) / 2 - 14, hyp(r.a, b).toFixed(2) + ' m', { px: fp(13), bold: 1, fg: TH.am, border: TH.am, pad: 6 });
  }
  if (S.drag && S.drag.w && (S.drag.t === 'p2' || S.drag.t === 'p1')) {
    const w = S.drag.w; FX.pill(cx, X((w.x1 + w.x2) / 2), Y((w.y1 + w.y2) / 2) + 20, Math.hypot(w.x2 - w.x1, w.y2 - w.y1).toFixed(2) + ' m', { px: fp(13), bold: 1, fg: TH.am, border: TH.am, pad: 6 });
  }
  /* Fantasma de la herramienta «Dibujar pared»: muestra el material elegido junto al cursor */
  if (S.tool === 'wall' && S.curPx && !S.drag) {
    const cxp = S.curPx.x, cyp = S.curPx.y, m = S.wallMat || 'brick', w2 = Math.max(7, 4 + (MAT[m].th) / 8);
    cx.save(); cx.globalAlpha = .85; Textures.wall2D(cx, m, cxp - 16, cyp, cxp + 16, cyp, w2, sc, TH.am, 1.6, 0); cx.restore();
    FX.pill(cx, cxp, cyp + 20, MAT[m].n, { px: fp(10), icon: Icons.has('materials', m) ? ['materials', m] : null, border: TH.am });
  }
  /* Escala */
  const m = sc > 40 ? 1 : sc > 18 ? 2 : 5, bx = 14, by = H0 - 14;
  cx.strokeStyle = TH.txt; cx.lineWidth = 2; poly([[bx, by - 4], [bx, by], [bx + m * sc, by], [bx + m * sc, by - 4]]); cx.stroke();
  FX.pill(cx, bx + 2, by - 14, m + ' m', { px: fp(11), align: 'left', pad: 3 });
}
function atDist(p, dist) {
  let a = 0;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const l = hyp(p.pts[i], p.pts[i + 1]);
    if (dist <= a + l) { const f = l ? (dist - a) / l : 0; return { x: p.pts[i].x + f * (p.pts[i + 1].x - p.pts[i].x), y: p.pts[i].y + f * (p.pts[i + 1].y - p.pts[i].y) }; }
    a += l;
  }
  return null;
}
