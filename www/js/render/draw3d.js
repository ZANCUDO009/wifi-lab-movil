/* ════════════════════════════════════════════════════════════════════
   VISTA 3D (Canvas 2D, proyección afín propia — sin WebGL)
   · Paredes con grosor (caras laterales + canto superior), sombreado por cara
   · Puertas y ventanas recortadas con marco, vidrio y hoja entreabierta
   · Suelo con textura, habitaciones, sombras de contacto, fondo de estudio
   · Mapa de calor como plano o como SUPERFICIE con relieve (control de exageración)
   · Routers, AP, repetidores y laptops como modelos de bloques
   · Cámara con inercia, zoom suavizado y vistas isométrica / cenital / frontal
   · Capa estática en caché (suelo + paredes + mapa): solo se redibuja si cambia algo
   ════════════════════════════════════════════════════════════════════ */
function P3(x, y, z) {
  const Xc = x - S.W / 2, Yc = y - S.H / 2, cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), a = Xc * cy - Yc * sy, b = Xc * sy + Yc * cy, sp = Math.sin(S.pit), cp = Math.cos(S.pit);
  const k = Math.min(W0 / (S.W + S.H * .6), H0 / (S.H + S.W * .4)) * .85 * S.zoom;
  return { x: W0 / 2 + (S.p3x || 0) + a * k, y: H0 / 2 + (S.p3y || 0) + (b * sp - z * cp * 1.6) * k, d: b * cp + z * sp };
}
const WALL_H = 2.8, LX = -.46, LY = -.64;
let cam = { v: [0, 0, 1] };
/** Vector hacia el observador en coordenadas del mundo (una cara es visible si su normal apunta hacia él). */
function camUpdate() { cam.v = [Math.sin(S.yaw) * Math.cos(S.pit), Math.cos(S.yaw) * Math.cos(S.pit), Math.sin(S.pit)]; }
const floorBasis = () => { const a = P3(0, 0, 0), b = P3(S.W, 0, 0), c = P3(0, S.H, 0); return { a, b, c, m: [(b.x - a.x) / S.W, (b.y - a.y) / S.W, (c.x - a.x) / S.H, (c.y - a.y) / S.H, a.x, a.y] }; };

/* ── Cámara: inercia al girar, zoom suave, vistas predefinidas y órbita automática (3.7 / 5.5) ── */
const angDiff = (a, b) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };
function view3(k) {
  const T = { iso: [.6, .95], top: [0, 1.5], front: [0, .16] }[k] || [.6, .95];
  if (!FX.motion()) { S.yaw = T[0]; S.pit = T[1]; S.vyaw = S.vpit = 0; return; }
  S.camAnim = { t0: performance.now(), dur: 650, y0: S.yaw, dy: angDiff(S.yaw, T[0]), p0: S.pit, dp: T[1] - S.pit }; S.vyaw = S.vpit = 0;
}
function stepCamera(dt) {
  const smooth = FX.motion();
  if (S.zoomT == null) S.zoomT = S.zoom;
  S.zoom = smooth ? S.zoom + (S.zoomT - S.zoom) * Math.min(1, dt * 10) : S.zoomT; if (Math.abs(S.zoom - S.zoomT) < .0007) S.zoom = S.zoomT;
  const va = S.camAnim;
  if (va) { const t = clamp((performance.now() - va.t0) / va.dur, 0, 1), p = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; S.yaw = va.y0 + va.dy * p; S.pit = va.p0 + va.dp * p; if (t >= 1) S.camAnim = null; return; }
  if (S.drag && S.drag.t === 'rot') return;
  if (smooth && (Math.abs(S.vyaw || 0) > .01 || Math.abs(S.vpit || 0) > .01)) { S.yaw += S.vyaw * dt; S.pit = clamp(S.pit + S.vpit * dt, .15, 1.5); const f = Math.exp(-dt * 3.2); S.vyaw *= f; S.vpit *= f; } else { S.vyaw = S.vpit = 0; }
  if (S.orbit && !S.drag && smooth) S.yaw += dt * .13;
}
const camMoving = () => !!(S.camAnim || Math.abs(S.vyaw || 0) > .01 || Math.abs(S.vpit || 0) > .01 || Math.abs((S.zoomT || S.zoom) - S.zoom) > .0007 || S.orbit || (S.drag && S.drag.t === 'rot'));

const qCam = () => camMoving() ? Math.min(FX.q(), 1) : FX.q();                       // calidad efectiva: reducida mientras la cámara se mueve

/* ── Prismas verticales (paredes, dinteles, marcos, patas…) ── */
function projBox(pts) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(p => { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }); return [x0, y0, x1, y1]; }
const GLASSY = { glass: 1, glass_film: 1, glass_tempered: 1, metal: 1, wood_glass: 0 };
/** Franja de brillo especular que se desplaza al girar la cámara (vidrio y metal). */
function specular(p0, p1, p2, p3, a = .32) {
  if (qCam() < 1 || camMoving()) return;
  const pos = ((S.yaw * .32) % 1 + 1) % 1, gr = cx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(clamp(pos - .14, 0, 1), 'rgba(255,255,255,0)'); gr.addColorStop(pos, `rgba(255,255,255,${a})`); gr.addColorStop(clamp(pos + .14, 0, 1), 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  poly([[p0.x, p0.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]], 1); cx.fillStyle = gr; cx.fill();
}
/** o = { m: material con textura, color: color plano, wid: id para variante, top: color del canto, sel: pared seleccionada, spec: brillo } */
function prism(ax, ay, bx, by, t, z0, z1, o = {}) {
  const len = Math.hypot(bx - ax, by - ay); if (len < 1e-6 || z1 - z0 < 1e-6) return;
  const ux = (bx - ax) / len, uy = (by - ay) / len, nx = -uy, ny = ux, h = t / 2, V = cam.v;
  const A1 = [ax + nx * h, ay + ny * h], A2 = [ax - nx * h, ay - ny * h], B1 = [bx + nx * h, by + ny * h], B2 = [bx - nx * h, by - ny * h];
  const bb = projBox([P3(ax, ay, z0), P3(bx, by, z0), P3(ax, ay, z1), P3(bx, by, z1)]);
  if (bb[2] < -60 || bb[0] > W0 + 60 || bb[3] < -60 || bb[1] > H0 + 60) return;                          // fuera de la vista: no se dibuja
  const faces = [[[nx, ny], A1, B1, len], [[-nx, -ny], A2, B2, len], [[-ux, -uy], A2, A1, t], [[ux, uy], B1, B2, t]];
  const col = o.m && MAT[o.m] ? MAT[o.m].c : (o.color || '#888');
  const order = faces.filter(f => f[0][0] * V[0] + f[0][1] * V[1] > 1e-4).sort((a, b) => (a[0][0] * V[0] + a[0][1] * V[1]) - (b[0][0] * V[0] + b[0][1] * V[1]));
  for (const f of order) {
    const p0 = P3(f[1][0], f[1][1], z0), p1 = P3(f[2][0], f[2][1], z0), p3 = P3(f[1][0], f[1][1], z1), p2 = P3(f[2][0], f[2][1], z1);
    const lam = f[0][0] * LX + f[0][1] * LY, sh = .05 + .38 * (1 - clamp((lam + .5) / 1.14, 0, 1));
    if (o.m && Textures.has(o.m) || (o.m && !o.color)) Textures.wall3D(cx, o.m, p0, p1, p3, f[3], z1 - z0, sh, o.wid);
    else { poly([[p0.x, p0.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]], 1); cx.fillStyle = col; cx.fill(); cx.fillStyle = `rgba(0,0,0,${sh})`; cx.fill(); }
    if (o.spec || (o.m && GLASSY[o.m])) specular(p0, p1, p2, p3, o.m === 'metal' ? .22 : .3);
    poly([[p0.x, p0.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]], 1); cx.strokeStyle = o.sel ? TH.tx : 'rgba(0,0,0,.55)'; cx.lineWidth = o.sel ? 2.4 : .9; cx.stroke();
  }
  const T = [A1, B1, B2, A2].map(c => P3(c[0], c[1], z1));                                              // canto superior (cap)
  poly(T.map(p => [p.x, p.y]), 1); cx.fillStyle = o.top || col; cx.fill(); cx.fillStyle = 'rgba(255,255,255,.30)'; cx.fill(); cx.strokeStyle = o.sel ? TH.tx : 'rgba(255,255,255,.5)'; cx.lineWidth = o.sel ? 2.4 : 1.1; cx.stroke();
}

/* ── Fondo, suelo, sombras ── */
function drawBackdrop() {
  const dark = FX.dark(); cx.fillStyle = TH.bg; cx.fillRect(0, 0, W0, H0);
  const g = cx.createRadialGradient(W0 / 2, H0 * .45, 10, W0 / 2, H0 * .5, Math.max(W0, H0) * .8);
  g.addColorStop(0, dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.7)'); g.addColorStop(.7, 'rgba(255,255,255,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,.22)' : 'rgba(20,40,80,.08)');
  cx.fillStyle = g; cx.fillRect(0, 0, W0, H0);
  if (qCam() > 0 && !camMoving()) {                                                    // rejilla de horizonte muy tenue que se desvanece con la distancia
    const sp = 2, ex = Math.max(S.W, S.H) * .9; cx.lineWidth = 1; cx.strokeStyle = TH.grid;
    for (let x = -ex; x <= S.W + ex; x += sp) { const al = .55 * (1 - Math.abs(x - S.W / 2) / (S.W / 2 + ex)); if (al <= .02) continue; const a = P3(x, -ex, 0), b = P3(x, S.H + ex, 0); cx.globalAlpha = al; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
    for (let y = -ex; y <= S.H + ex; y += sp) { const al = .55 * (1 - Math.abs(y - S.H / 2) / (S.H / 2 + ex)); if (al <= .02) continue; const a = P3(-ex, y, 0), b = P3(S.W + ex, y, 0); cx.globalAlpha = al; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
    cx.globalAlpha = 1;
  }
}
function drawFloor() {
  const F = floorBasis(), c = [[0, 0], [S.W, 0], [S.W, S.H], [0, S.H]].map(p => P3(p[0], p[1], 0)), V = cam.v, dep = .2;
  const edges = [[[0, -1], c[0], c[1], [0, 0], [S.W, 0]], [[1, 0], c[1], c[2], [S.W, 0], [S.W, S.H]], [[0, 1], c[2], c[3], [S.W, S.H], [0, S.H]], [[-1, 0], c[3], c[0], [0, S.H], [0, 0]]];
  edges.forEach(e => {                                                                  // canto de la losa (volumen del suelo)
    if (e[0][0] * V[0] + e[0][1] * V[1] <= 1e-4) return; const a = P3(e[3][0], e[3][1], -dep), b = P3(e[4][0], e[4][1], -dep);
    poly([[e[1].x, e[1].y], [e[2].x, e[2].y], [b.x, b.y], [a.x, a.y]], 1); cx.fillStyle = TH.panel; cx.fill(); cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fill(); cx.strokeStyle = TH.bd; cx.lineWidth = 1; cx.stroke();
  });
  poly(c.map(p => [p.x, p.y]), 1); cx.fillStyle = TH.floor || TH.panel; cx.fill();
  if (S.layers.floor !== 0) { const fid = FX.floorId(); if (fid && Textures.has(fid)) Textures.floor3D(cx, fid, F.a, F.b, F.c, S.W, S.H, clamp((TH.floorA || .5) * .95, 0, 1)); }
  if (S.layers.rooms !== 0 && S.walls.length) {
    const R = FX.rooms(); if (R.list.length) { cx.save(); cx.transform(...F.m); cx.imageSmoothingEnabled = false; cx.globalAlpha = (TH.roomA || .1) * 1.4; cx.drawImage(R.canvas, 0, 0, S.W, S.H); cx.restore(); }
  }
  poly(c.map(p => [p.x, p.y]), 1); cx.strokeStyle = TH.bd; cx.lineWidth = 1.2; cx.stroke();
}
function drawContactShadows() {
  if (qCam() < 1) return;
  S.walls.forEach(w => wallPieces(w).forEach(p => {
    const t = Math.max(w.th / 100, .1);
    for (const [grow, al, ox] of qCam() > 1 ? [[.5, .07, .26], [.28, .09, .2], [.1, .13, .12]] : [[.3, .14, .18]]) {
      const len = Math.hypot(p[2] - p[0], p[3] - p[1]) || 1, ux = (p[2] - p[0]) / len, uy = (p[3] - p[1]) / len, nx = -uy, ny = ux, h = t / 2 + grow, dx = ox, dy = ox * 1.35;
      const q = [[p[0] + nx * h + dx, p[1] + ny * h + dy], [p[2] + nx * h + dx, p[3] + ny * h + dy], [p[2] - nx * h + dx, p[3] - ny * h + dy], [p[0] - nx * h + dx, p[1] - ny * h + dy]].map(c => P3(c[0], c[1], 0));
      poly(q.map(c => [c.x, c.y]), 1); cx.fillStyle = `rgba(0,0,0,${al * (FX.dark() ? 1.6 : 1)})`; cx.fill();
    }
  }));
}

/* ── Mapa de calor: plano sobre el suelo o superficie con relieve (3.5) ── */
let surf = null;
function surfData() {
  const g = S.grid; if (!g) return null;
  if (surf && surf.rev === S.hmRev && surf.mode === S.hmMode) return surf;
  const stride = Math.max(1, Math.ceil(Math.max(g.nx, g.ny) / 56)), bx = Math.ceil(g.nx / stride), by = Math.ceil(g.ny / stride), im = hmc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, g.nx, g.ny).data;
  const th = k => S.hmMode === 'sinr' ? clamp(g.sinr[k] / 45, 0, 1) : clamp((g.tot[k] + 90) / 50, 0, 1);
  const hs = new Float32Array((bx + 1) * (by + 1)), cols = new Array(bx * by);
  for (let j = 0; j <= by; j++) for (let i = 0; i <= bx; i++) { const ci = Math.min(g.nx - 1, i * stride), cj = Math.min(g.ny - 1, j * stride); hs[j * (bx + 1) + i] = th(cj * g.nx + ci); }
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) { const ci = Math.min(g.nx - 1, i * stride + (stride >> 1)), cj = Math.min(g.ny - 1, j * stride + (stride >> 1)), k = (cj * g.nx + ci) * 4; cols[j * bx + i] = [im[k], im[k + 1], im[k + 2]]; }
  return (surf = { rev: S.hmRev, mode: S.hmMode, bx, by, stride, hs, cols, st: g.st });
}
function drawHeat3D() {
  if (!S.layers.heat || !S.grid || !hmc.width) return;
  if (!S.surf) {                                       // modo «Plano»: imagen proyectada sobre el suelo
    const F = floorBasis(); cx.save(); cx.transform(...F.m); cx.imageSmoothingEnabled = !/^(cnt|qual)$/.test(S.hmMode); cx.imageSmoothingQuality = 'low'; cx.globalAlpha = .78; cx.drawImage(hmShow(), 0, 0, S.W, S.H); cx.restore(); return;
  }
  const d = surfData(); if (!d) return; const zmax = 1.5 * (S.exag || 1), cw = d.stride * d.st, V = cam.v;
  const P = new Array((d.bx + 1) * (d.by + 1));
  for (let j = 0; j <= d.by; j++) for (let i = 0; i <= d.bx; i++) P[j * (d.bx + 1) + i] = P3(Math.min(S.W, i * cw), Math.min(S.H, j * cw), d.hs[j * (d.bx + 1) + i] * zmax);
  const i0 = V[0] > 0 ? 0 : d.bx - 1, di = V[0] > 0 ? 1 : -1, j0 = V[1] > 0 ? 0 : d.by - 1, dj = V[1] > 0 ? 1 : -1, W1 = d.bx + 1;
  for (let jj = 0, j = j0; jj < d.by; jj++, j += dj) for (let ii = 0, i = i0; ii < d.bx; ii++, i += di) {
    const a = P[j * W1 + i], b = P[j * W1 + i + 1], c = P[(j + 1) * W1 + i + 1], e = P[(j + 1) * W1 + i], col = d.cols[j * d.bx + i];
    const sl = clamp((d.hs[j * W1 + i] - d.hs[(j + 1) * W1 + i + 1]) * 2.2, -.35, .35), f = 1 + sl, s = `rgb(${clamp(col[0] * f, 0, 255) | 0},${clamp(col[1] * f, 0, 255) | 0},${clamp(col[2] * f, 0, 255) | 0})`;
    cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.lineTo(c.x, c.y); cx.lineTo(e.x, e.y); cx.closePath(); cx.fillStyle = s; cx.fill(); cx.strokeStyle = s; cx.lineWidth = .7; cx.stroke();
  }
}

/* ── Paredes con grosor, aberturas, marcos y vidrio (3.1 / 3.2) ── */
const FRAME_WOOD = '#8a5a2b', FRAME_ALU = '#b7c2cf';
function drawWall3D(w, wi, grow) {
  const Hh = WALL_H * grow, t = Math.max(w.th / 100, .1), sel = w.id === S.sel, len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1), pt = f => [w.x1 + (w.x2 - w.x1) * f, w.y1 + (w.y2 - w.y1) * f], q = FX.q();
  const base = { m: w.m, wid: w.id, sel };
  wallPieces(w).forEach(pc => prism(pc[0], pc[1], pc[2], pc[3], t, 0, Hh, base));
  (w.op || []).forEach(o => {
    const a = pt(o.a), b = pt(o.b), type = FX.openType(w, o), width = (o.b - o.a) * len, glassy = /glass/.test(w.m) || w.m === 'wood_glass';
    const zh = type === 'door' ? 2.05 : 2.1, zs = type === 'window' ? .9 : 0;
    if (Hh > zh) prism(a[0], a[1], b[0], b[1], t, zh * grow, Hh, { ...base, sel: false });                              // dintel
    if (zs > 0) prism(a[0], a[1], b[0], b[1], t, 0, zs * grow, { ...base, sel: false });                                // antepecho
    if (qCam() < 1 || type === 'pass' || grow < .8) return;
    const fc = type === 'door' || !glassy ? FRAME_WOOD : FRAME_ALU, fw = .06, uvx = (w.x2 - w.x1) / (len || 1), uvy = (w.y2 - w.y1) / (len || 1);
    // jambas (marco vertical a cada lado) y cabecero
    prism(a[0], a[1], a[0] + uvx * fw, a[1] + uvy * fw, t + .03, zs, zh, { color: fc });
    prism(b[0] - uvx * fw, b[1] - uvy * fw, b[0], b[1], t + .03, zs, zh, { color: fc });
    prism(a[0], a[1], b[0], b[1], t + .03, zh - fw, zh, { color: fc });
    if (type === 'window') {
      prism(a[0], a[1], b[0], b[1], t + .04, zs, zs + fw, { color: fc });                                               // alféizar
      const g0 = P3(a[0], a[1], zs + fw), g1 = P3(b[0], b[1], zs + fw), g2 = P3(b[0], b[1], zh - fw), g3 = P3(a[0], a[1], zh - fw);                  // vidrio translúcido
      poly([[g0.x, g0.y], [g1.x, g1.y], [g2.x, g2.y], [g3.x, g3.y]], 1); cx.fillStyle = 'rgba(150,215,240,.26)'; cx.fill(); specular(g0, g1, g2, g3, .38);
    } else if (type === 'door') {                                                                                         // hoja entreabierta ~70°
      const hingeA = w.id % 2 === 0, hp = hingeA ? a : b, cd = hingeA ? [uvx, uvy] : [-uvx, -uvy], side = (w.id % 3 === 0 ? -1 : 1), th = 1.2, nxw = -uvy * side, nyw = uvx * side;
      const dx = cd[0] * Math.cos(th) + nxw * Math.sin(th), dy = cd[1] * Math.cos(th) + nyw * Math.sin(th), tip = [hp[0] + dx * width, hp[1] + dy * width];
      const p0 = P3(hp[0], hp[1], 0), p1 = P3(tip[0], tip[1], 0), p3 = P3(hp[0], hp[1], 2.0);
      Textures.wall3D(cx, 'wood', p0, p1, p3, width, 2.0, .12 + (dx * LX + dy * LY < 0 ? .2 : 0), w.id);
      poly([[p0.x, p0.y], [p1.x, p1.y], [P3(tip[0], tip[1], 2.0).x, P3(tip[0], tip[1], 2.0).y], [p3.x, p3.y]], 1); cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.lineWidth = 1; cx.stroke();
      const kb = P3(tip[0] - dx * .1, tip[1] - dy * .1, 1.0); cx.beginPath(); cx.arc(kb.x, kb.y, 2.4, 0, 7); cx.fillStyle = '#e8c36a'; cx.fill();
    }
  });
}

/* ── Capa estática en caché (3.8) ── */
let lay = null, layCx = null, layKey = '';
const GROW = () => { const e = S.enterT && FX.motion() ? (performance.now() - S.enterT) / 1000 : 9; return e < 1.4 ? e : 9; };
function renderStatic(target, grow) {
  const real = cx; cx = target; camUpdate();
  try {
    drawBackdrop(); drawFloor(); drawContactShadows(); drawHeat3D();
    const ws = S.walls.map((w, i) => ({ w, i, d: P3((w.x1 + w.x2) / 2, (w.y1 + w.y2) / 2, 1).d })).sort((a, b) => a.d - b.d);
    ws.forEach(({ w, i }) => drawWall3D(w, i, grow >= 9 ? 1 : clamp(FX.easeOut(grow / .6 - i * .06), 0, 1)));
  } finally { cx = real; }
}
function staticKey() {
  const r = n => Math.round(n * 1e4);
  return [W0, H0, devicePixelRatio, r(S.yaw), r(S.pit), r(S.zoom), r(S.p3x || 0), r(S.p3y || 0), geoHashPub(), S.sel, S.theme, FX.floorId(), S.layers.floor, S.layers.rooms, S.layers.heat, S.hmRev, hmFading() ? 'f' : '', S.surf, r(S.exag || 1), FX.q(), camMoving() ? 1 : 0, S.preset, S.W, S.H].join('|');
}
const geoHashPub = () => { let h = S.walls.length; for (const w of S.walls) h = (Math.imul(h, 31) + ((w.x1 * 97 + w.y1 * 53 + w.x2 * 29 + w.y2 * 17 + w.th * 7) * 100 | 0) + w.m.length + ((w.op || []).length * 131) + (w.op || []).reduce((a, o) => a + ((o.a + o.b * 3) * 1000 | 0), 0)) | 0; return h; };

/* ── Dispositivos como modelos de bloques (3.6) ── */
const DARK = '#2a3342', LIGHT = '#e8edf3';
function device3D(kind, x, y, z, off, accent) {
  const g = (c) => off ? '#6b7385' : c;
  if (kind === 'router' || kind === 'basic' || kind === 'dual' || kind === 'w6' || kind === 'custom') {
    prism(x - .11, y, x + .11, y, .14, z, z + .045, { color: g(DARK), top: g('#3a4558') });
    for (const dx of [-.085, 0, .085]) prism(x + dx, y, x + dx + .012, y, .014, z + .045, z + .27, { color: g('#10151e') });
    cx.beginPath(); const l = P3(x + .08, y + .075, z + .03); cx.arc(l.x, l.y, 1.8, 0, 7); cx.fillStyle = off ? '#444' : accent; cx.fill();
  } else if (kind === 'ap') {
    prism(x - .16, y, x + .16, y, .32, z, z + .07, { color: g(LIGHT), top: g('#ffffff') });
    prism(x, y, x + .01, y, .03, z + .07, z + .16, { color: g('#9aa5b5') });
    const l = P3(x, y + .16, z + .035); cx.beginPath(); cx.arc(l.x, l.y, 2, 0, 7); cx.fillStyle = off ? '#444' : accent; cx.fill();
  } else if (kind === 'mesh') {
    prism(x - .06, y, x + .06, y, .12, z, z + .3, { color: g(LIGHT), top: g('#ffffff') });
    const l = P3(x, y + .06, z + .22); cx.beginPath(); cx.arc(l.x, l.y, 2, 0, 7); cx.fillStyle = off ? '#444' : accent; cx.fill();
  } else if (kind === 'rep') {
    prism(x - .09, y, x + .09, y, .1, z, z + .13, { color: g(LIGHT), top: g('#ffffff') });
    for (const dx of [-.05, .05]) prism(x + dx, y, x + dx + .012, y, .014, z + .13, z + .28, { color: g('#10151e') });
  } else if (kind === 'interferer') {
    prism(x - .14, y, x + .14, y, .2, z, z + .17, { color: g('#c8374c'), top: g('#e85a6e') });
    prism(x - .09, y + .101, x + .06, y + .101, .004, z + .04, z + .13, { color: '#1a1f2b' });
  }
}
function client3D(kind, x, y, z) {
  if (kind === 'phone') { prism(x - .035, y, x + .035, y, .012, z, z + .15, { color: '#1b2230', top: '#2a3342' }); prism(x - .03, y + .007, x + .03, y + .007, .002, z + .01, z + .14, { color: '#6fb8ff' }); }
  else if (kind === 'laptop') {
    prism(x - .16, y, x + .16, y, .22, z, z + .02, { color: '#aeb7c4', top: '#c9d1dc' });
    const a0 = P3(x - .16, y - .11, z + .02), a1 = P3(x + .16, y - .11, z + .02), a2 = P3(x + .16, y - .16, z + .27), a3 = P3(x - .16, y - .16, z + .27);        // pantalla inclinada
    poly([[a0.x, a0.y], [a1.x, a1.y], [a2.x, a2.y], [a3.x, a3.y]], 1); cx.fillStyle = '#1a2233'; cx.fill(); cx.strokeStyle = '#000a'; cx.lineWidth = 1; cx.stroke();
    const i0 = P3(x - .14, y - .118, z + .045), i1 = P3(x + .14, y - .118, z + .045), i2 = P3(x + .14, y - .152, z + .25), i3 = P3(x - .14, y - .152, z + .25);
    poly([[i0.x, i0.y], [i1.x, i1.y], [i2.x, i2.y], [i3.x, i3.y]], 1); const gr = cx.createLinearGradient(i3.x, i3.y, i1.x, i1.y); gr.addColorStop(0, '#79c2ff'); gr.addColorStop(1, '#2f7fe0'); cx.fillStyle = gr; cx.fill();
  } else if (kind === 'cam') { prism(x - .05, y, x + .05, y, .08, z, z + .09, { color: '#e8edf3', top: '#fff' }); prism(x, y + .04, x + .001, y + .04, .05, z + .03, z + .07, { color: '#111' }); }
  else { prism(x - .05, y, x + .05, y, .09, z, z + .06, { color: '#1fa37a', top: '#37d6a0' }); }
}

function draw3D() {
  size(); camUpdate(); const q = FX.q(), mot = FX.motion(), dark = FX.dark(), grow = GROW(), now = performance.now();
  /* capa estática: se reutiliza mientras no cambien cámara, escena ni mapa */
  if (!lay) { lay = document.createElement('canvas'); layCx = lay.getContext('2d'); }
  if (grow < 9) renderStatic(cx, grow);
  else {
    if (lay.width !== cv.width || lay.height !== cv.height) { lay.width = cv.width; lay.height = cv.height; layKey = ''; }
    const key = staticKey();
    if (key !== layKey) { const d = devicePixelRatio || 1; layCx.setTransform(d, 0, 0, d, 0, 0); layCx.clearRect(0, 0, W0, H0); renderStatic(layCx, 9); layKey = key; }
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(lay, 0, 0); const d = devicePixelRatio || 1; cx.setTransform(d, 0, 0, d, 0, 0);
  }
  const z = 1, L = S.layers, add = q > 0 && dark && L.glow !== 0 && !L.heat && !camMoving();
  /* ondas esféricas: anillos que se expanden en el plano horizontal y vertical del AP (3.6) */
  if (L.front) S.aps.forEach(a => {
    if (a.on === false) return; const Rm = Math.min(12, Math.max(S.W, S.H) * .6), n = q > 1 ? 4 : q > 0 ? 3 : 2, c = a.srv === false ? TH.rd : TH.tx;
    cx.save(); if (add) cx.globalCompositeOperation = 'lighter'; cx.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const r = (S.d0 * 1.0 + i * Rm / n) % Rm, al = Math.pow(1 - r / Rm, 1.4) * .75; if (al < .03) continue;
      const ring = (fn) => { cx.beginPath(); let st = false; const NP = camMoving() ? 28 : 48; for (let k = 0; k <= NP; k++) { const th = k / NP * 2 * Math.PI, p = fn(th); if (!p) { st = false; continue; } const s = P3(p[0], p[1], p[2]); st ? cx.lineTo(s.x, s.y) : cx.moveTo(s.x, s.y); st = true; } };
      ring(th => [a.x + r * Math.cos(th), a.y + r * Math.sin(th), z]); cx.strokeStyle = c; cx.globalAlpha = al; cx.lineWidth = 2; cx.stroke();
      if (q > 0) { cx.globalAlpha = al * .22; cx.lineWidth = 6; cx.stroke(); }
      if (q > 1 && !camMoving()) { ring(th => { const zz = z + r * Math.sin(th); return zz < 0 || zz > 3.2 ? null : [a.x + r * Math.cos(th), a.y, zz]; }); cx.globalAlpha = al * .5; cx.lineWidth = 1.2; cx.stroke(); }
    }
    cx.restore();
  });
  if (L.rays) {                                                                          // rayos agrupados por tipo y nivel de energía: pocos trazos grandes en vez de cientos
    cx.save(); if (add) cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
    const B = new Map(), sparks = [], moving = camMoving();
    S.rv.forEach(s => {
      if (S.dist <= s.s0 || (s.k !== 'd' && !L.ref)) return;
      const f = Math.min(1, (S.dist - s.s0) / s.l), a = P3(s.a.x, s.a.y, z), b = P3(s.a.x + (s.b.x - s.a.x) * f, s.a.y + (s.b.y - s.a.y) * f, z);
      const a0 = clamp(Math.pow(s.al, .75) * .9, .1, 1) * (s.k === 'd' ? 1 : .6) * (L.heat ? .7 : 1), lv = Math.max(1, Math.round(a0 * 5)), key = s.k + lv;
      let bk = B.get(key); if (!bk) { bk = { k: s.k, al: lv / 5, p: new Path2D() }; B.set(key, bk); }
      bk.p.moveTo(a.x, a.y); bk.p.lineTo(b.x, b.y);
      if (s.k !== 'd' && q > 1 && mot && !moving && S.dist - s.s0 < 1.1) sparks.push([a.x, a.y, s.k === 'r' ? TH.am : TH.rx, (1 - (S.dist - s.s0) / 1.1) * .9]);
    });
    B.forEach(bk => {
      const c = bk.k === 'd' ? TH.tx : bk.k === 'r' ? TH.am : TH.rx;
      cx.setLineDash(bk.k === 'd' ? [] : bk.k === 'r' ? [9, 4] : [2, 3]); cx.strokeStyle = c; cx.lineWidth = 1.2; cx.globalAlpha = bk.al; cx.stroke(bk.p);
      if (q > 0 && !moving && bk.k === 'd') { cx.setLineDash([]); cx.globalAlpha = bk.al * .18; cx.lineWidth = 5; cx.stroke(bk.p); }
    });
    cx.setLineDash([]); sparks.forEach(sp => FX.spark(cx, sp[0], sp[1], 12, sp[2], sp[3]));
    cx.restore(); cx.globalAlpha = 1;
  }
  S.paths.P.forEach((p, i) => {
    poly(p.pts.map(q2 => { const a = P3(q2.x, q2.y, z); return [a.x, a.y]; })); cx.setLineDash(i ? [] : [6, 5]);
    cx.strokeStyle = i ? (i == S.pi ? TH.am : TH.am + '55') : qc(p.pr); cx.lineWidth = i == S.pi ? 3 : 1.5; cx.stroke(); cx.setLineDash([]);
    const u = atDist(p, S.dist); if (u) { const a = P3(u.x, u.y, z); cx.beginPath(); cx.arc(a.x, a.y, 4, 0, 7); cx.fillStyle = TH.cw; cx.fill(); }
  });
  if (q > 1 && mot && L.part !== 0 && S.paths.P.length && S.paths.tot > -95) {                                  // partículas de señal Tx→Rx
    const p = S.paths.P[0], s01 = clamp((S.paths.tot + 90) / 50, 0, 1), n = Math.round(2 + 7 * s01), sp = .12 + .35 * s01, t = FX.now();
    cx.save(); if (dark) cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const f = ((t * sp + i / n) % 1), u = atDist(p, f * p.len); if (u) { const a = P3(u.x, u.y, z); FX.spark(cx, a.x, a.y, 7 + 5 * s01, TH.tx, .5 + .5 * Math.sin(f * 3.14)); } }
    cx.restore();
  }
  /* dispositivos: patas, modelos y etiqueta siempre legible orientada a la pantalla */
  const enterP = S.enterT && mot ? (now - S.enterT) / 1000 : 9, items = [];
  S.aps.forEach((a, i) => {
    const off = a.on === false, intf = a.srv === false, eq = a.eq || 'custom', kind = intf ? 'interferer' : (eq === 'ap' ? 'ap' : eq === 'mesh' ? 'mesh' : eq === 'rep' ? 'rep' : 'router'), zz = kind === 'ap' ? 2.6 : z;
    items.push({ d: P3(a.x, a.y, 0).d, fn: () => standModel(a.x, a.y, zz, kind === 'ap', intf ? TH.rd : '#2f7fe0', deviceIcon(a), (i ? (intf ? 'Interferente ' + i : 'AP ' + (i + 1)) : 'Router (Tx)'), intf ? TH.rd : TH.tx, off, () => device3D(kind, a.x, a.y, zz, off, intf ? '#ff4d6a' : '#46e0ff'), { halo: off ? null : clamp((a.pt - 10) / 20, .15, 1), star: i === 0 && !intf && !off, intf, off, bounce: enterP < 1.4 ? enterP / .6 - .35 - i * .12 : null }) });
  });
  items.push({ d: P3(S.rx.x, S.rx.y, 0).d, fn: () => standModel(S.rx.x, S.rx.y, .9, false, '#17b88a', clientIcon(), 'Rx', TH.rx, false, () => client3D(S.client, S.rx.x, S.rx.y, .9), { bounce: enterP < 1.4 ? enterP / .6 - .5 : null }) });
  items.sort((a, b) => a.d - b.d).forEach(it => it.fn());
}
/** Pie con sombra, pata, modelo de bloques y etiqueta (insignia + pastilla) sobre el modelo. */
function standModel(x, y, zTop, ceiling, c, icon, label, lc, off, model, o) {
  const f = P3(x, y, 0), t = P3(x, y, zTop), ga = cx.globalAlpha; cx.globalAlpha = off ? .5 : 1;
  cx.beginPath(); cx.ellipse(f.x, f.y, 12, 5, 0, 0, 7); cx.fillStyle = 'rgba(0,0,0,.38)'; cx.fill();
  if (ceiling) prism(x, y, x + .012, y, .03, zTop + .07, WALL_H, { color: '#8a94a6' });
  else prism(x, y, x + .012, y, .035, 0, zTop, { color: '#8a94a6' });                                    // pata
  model();
  const top = P3(x, y, zTop + (ceiling ? -.1 : .55));
  cx.beginPath(); cx.moveTo(t.x, t.y - 2); cx.lineTo(top.x, top.y); cx.strokeStyle = FX.rgba(c, .55); cx.lineWidth = 1; cx.setLineDash([2, 3]); cx.stroke(); cx.setLineDash([]);
  badge(top.x, top.y, 11, c, icon, label, lc, false, o);
  cx.globalAlpha = ga;
}
