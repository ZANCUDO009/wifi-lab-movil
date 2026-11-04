/* ════════════════════════════════════════════════════════════════════
   FX · utilidades visuales compartidas por el plano 2D y la vista 3D.
   · Calidad y movimiento:  FX.q() → 0 baja · 1 media · 2 alta ;  FX.motion()
   · Geometría cacheada:    habitaciones, uniones de paredes, tipo de abertura
   · Ayudas de dibujo:      pill(), glow, anillos de alcance, destellos
   · Paletas del mapa de calor (viridis accesible, térmica, neón)
   Todo efecto cuesta algo: cada función consulta FX.q()/FX.motion() y se apaga solo.
   ════════════════════════════════════════════════════════════════════ */
const FX = (() => {
  'use strict';
  const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  /** Nivel de calidad efectivo (usa el mismo ajuste automático que el mapa de calor). */
  const q = () => { const k = S.quality === 'auto' ? (S.autoQ || 'high') : S.quality; return k === 'low' ? 0 : k === 'mid' ? 1 : 2; };
  /** ¿Se permiten efectos animados decorativos? (no afecta a la animación didáctica de ondas). */
  const motion = () => !(S.reduceMotion || mq.matches) && q() > 0;
  const dark = () => { const c = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(TH.bg || ''); return c ? (parseInt(c[1], 16) * .3 + parseInt(c[2], 16) * .59 + parseInt(c[3], 16) * .11) < 110 : true; };
  const now = () => performance.now() / 1000;
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeBack = t => { t = clamp(t, 0, 1); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const rgba = (c, a) => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(c || ''); return m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})` : c; };

  /** Rectángulo redondeado (con respaldo para navegadores sin roundRect). */
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    if (g.roundRect) { g.roundRect(x, y, w, h, r); return; }
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  /** Etiqueta legible: texto sobre una pastilla semitransparente. */
  function pill(g, x, y, text, o = {}) {
    const px = o.px || fp(11), pad = o.pad == null ? 5 : o.pad;
    g.font = `${o.bold ? 'bold ' : ''}${px}px Inter,Segoe UI,sans-serif`;
    const tw = g.measureText(text).width + (o.icon ? px + 4 : 0), w = tw + pad * 2, h = px + pad * 1.4, al = o.align || 'center';
    const x0 = al === 'center' ? x - w / 2 : al === 'left' ? x : x - w;
    g.save(); rr(g, x0, y - h / 2, w, h, h / 2); g.fillStyle = o.bg || rgba(dark() ? '#050a14' : '#ffffff', .78); g.fill();
    if (o.border) { g.strokeStyle = o.border; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = o.fg || TH.txt; g.textAlign = 'left'; g.textBaseline = 'middle';
    let tx = x0 + pad; if (o.icon) { Icons.draw(g, o.icon[0], o.icon[1], tx + px / 2, y, px + 2, o.fg || TH.txt); tx += px + 4; }
    g.fillText(text, tx, y + .5); g.restore();
    return { w, h };
  }

  /* ── Geometría cacheada por «huella» numérica de las paredes ── */
  function geoHash() {
    let h = (S.walls.length * 2654435761 + S.W * 73 + S.H * 131) | 0;
    for (const w of S.walls) {
      h = Math.imul(h ^ ((w.x1 * 100) | 0), 16777619); h = Math.imul(h ^ ((w.y1 * 100) | 0), 16777619);
      h = Math.imul(h ^ ((w.x2 * 100) | 0), 16777619); h = Math.imul(h ^ ((w.y2 * 100) | 0), 16777619);
      h = Math.imul(h ^ (w.th | 0), 16777619); h = Math.imul(h ^ (w.m.length * 31 + w.m.charCodeAt(0)), 16777619);
      if (w.op) for (const o of w.op) { h = Math.imul(h ^ ((o.a * 100) | 0), 16777619); h = Math.imul(h ^ ((o.b * 100) | 0), 16777619); }
    }
    return h;
  }
  let gh = 0, cacheGeo = null;
  const geoKey = () => { geo(); return gh; };
  function geo() {
    const h = geoHash(); if (cacheGeo && gh === h) return cacheGeo; gh = h;
    cacheGeo = { joins: computeJoins(), rooms: null }; return cacheGeo;
  }
  /** Para cada pared, ¿su extremo 1 / 2 toca a otra pared? (para remates limpios en las esquinas). */
  function computeJoins() {
    const j = {}, tol = .18;
    S.walls.forEach(w => {
      const t = [[w.x1, w.y1], [w.x2, w.y2]].map(p => S.walls.some(o => o !== w && (
        Math.hypot(p[0] - o.x1, p[1] - o.y1) < tol || Math.hypot(p[0] - o.x2, p[1] - o.y2) < tol || dseg({ x: p[0], y: p[1] }, o) < Math.max(tol, o.th / 200))));
      j[w.id] = t;
    });
    return j;
  }
  /** Habitaciones cerradas: relleno por inundación sobre una rejilla de 0,25 m; la zona que toca el borde es «exterior». */
  function rooms() {
    const G = geo(); if (G.rooms) return G.rooms;
    const st = S.W * S.H > 2500 ? .5 : .25, nx = Math.ceil(S.W / st), ny = Math.ceil(S.H / st), bar = new Uint8Array(nx * ny), lab = new Int32Array(nx * ny);
    S.walls.forEach(w => {                                   // las aberturas NO abren la habitación: una puerta separa estancias
      const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1), n = Math.ceil(len / (st * .5)) + 1, r = Math.max(.12, w.th / 200) + st * .35;
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = w.x1 + (w.x2 - w.x1) * t, y = w.y1 + (w.y2 - w.y1) * t;
        for (let yy = Math.floor((y - r) / st); yy <= Math.floor((y + r) / st); yy++) for (let xx = Math.floor((x - r) / st); xx <= Math.floor((x + r) / st); xx++) if (xx >= 0 && yy >= 0 && xx < nx && yy < ny) bar[yy * nx + xx] = 1;
      }
    });
    const list = []; let id = 0; const stack = [];
    for (let s = 0; s < nx * ny; s++) {
      if (bar[s] || lab[s]) continue; id++; let cnt = 0, sx = 0, sy = 0, edge = false; stack.push(s); lab[s] = id;
      while (stack.length) {
        const c = stack.pop(), x = c % nx, y = (c / nx) | 0; cnt++; sx += x; sy += y;
        if (x === 0 || y === 0 || x === nx - 1 || y === ny - 1) edge = true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X2 = x + dx, Y2 = y + dy; if (X2 < 0 || Y2 < 0 || X2 >= nx || Y2 >= ny) continue; const k = Y2 * nx + X2; if (!bar[k] && !lab[k]) { lab[k] = id; stack.push(k); } }
      }
      list.push({ id, area: cnt * st * st, cx: (sx / cnt + .5) * st, cy: (sy / cnt + .5) * st, edge });
    }
    const good = list.filter(r => !r.edge && r.area >= 2);
    const cv2 = document.createElement('canvas'); cv2.width = nx; cv2.height = ny; const g = cv2.getContext('2d'), im = g.createImageData(nx, ny);
    const idx = new Map(); good.forEach((r, i) => idx.set(r.id, i));
    const pal = [[90, 160, 255], [255, 170, 90], [120, 220, 160], [210, 130, 255], [255, 120, 150], [240, 220, 100], [90, 210, 230]];
    for (let k = 0; k < nx * ny; k++) { const i = idx.get(lab[k]); if (i === undefined) continue; const c = pal[i % pal.length]; im.data[k * 4] = c[0]; im.data[k * 4 + 1] = c[1]; im.data[k * 4 + 2] = c[2]; im.data[k * 4 + 3] = 255; }
    g.putImageData(im, 0, 0);
    return (G.rooms = { canvas: cv2, list: good });
  }

  /** Tipo de abertura según material y tamaño del hueco (puerta, ventana o paso libre). */
  function openType(w, o) {
    const width = (o.b - o.a) * Math.hypot(w.x2 - w.x1, w.y2 - w.y1), glassy = /glass/.test(w.m) || w.m === 'wood_glass';
    if (glassy) return width <= 2.6 ? (width < .55 ? 'window' : 'window') : 'pass';
    if (width < .55) return 'window';
    if (width <= 1.3) return 'door';
    return 'pass';
  }

  /** Contorno de alcance de un AP: avanza por 72 direcciones sobre la cuadrícula del mapa hasta que la señal cae bajo `thr` dBm.
   *  Así el anillo refleja el efecto real de las paredes (no un círculo de espacio libre). Se cachea por cuadrícula. */
  const rc = { g: null, m: new Map() };
  function ringPoly(a, thr) {
    const g = S.grid; if (!g) return null; if (rc.g !== g) { rc.g = g; rc.m.clear(); }
    const k = a.x.toFixed(2) + ',' + a.y.toFixed(2) + ',' + thr; if (rc.m.has(k)) return rc.m.get(k);
    const st = g.st, N = 72, pts = [], lim = Math.max(S.W, S.H) * 1.2;
    for (let i = 0; i < N; i++) {
      const th = i / N * 2 * Math.PI, dx = Math.cos(th), dy = Math.sin(th); let last = 0;
      for (let r = st * .5; r < lim; r += st * .5) {
        const x = a.x + dx * r, y = a.y + dy * r; if (x < 0 || y < 0 || x > S.W || y > S.H) { last = r - st * .5; break; }
        if (g.tot[Math.min(g.ny - 1, Math.floor(y / st)) * g.nx + Math.min(g.nx - 1, Math.floor(x / st))] < thr) break; last = r;
      }
      pts.push([a.x + dx * last, a.y + dy * last]);
    }
    rc.m.set(k, pts); return pts;
  }

  /* ── Paletas del mapa de calor ── */
  const PALS = {
    viridis: { n: 'Viridis (accesible para daltonismo)', s: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]] },
    thermal: { n: 'Térmica (azul → rojo)', s: [[30, 50, 170], [20, 150, 220], [40, 200, 110], [250, 225, 40], [235, 60, 30]] },
    neon: { n: 'Neón', s: [[20, 0, 60], [110, 20, 200], [255, 40, 200], [25, 230, 255], [240, 255, 120]] }
  };
  const lut = {};
  function palLut(name) {
    if (lut[name]) return lut[name]; const s = (PALS[name] || PALS.viridis).s, L = new Array(256);
    for (let i = 0; i < 256; i++) { const t = i / 255 * (s.length - 1), k = Math.min(s.length - 2, Math.floor(t)), f = t - k; L[i] = s[k].map((c, j) => Math.round(c + (s[k + 1][j] - c) * f)); }
    return (lut[name] = L);
  }
  const palCol = t => palLut(S.hmPal || 'viridis')[Math.round(clamp(t, 0, 1) * 255)];
  const palCss = (stops = 8) => { const L = palLut(S.hmPal || 'viridis'); return 'linear-gradient(90deg,' + Array.from({ length: stops }, (_, i) => { const c = L[Math.round(i / (stops - 1) * 255)]; return `rgb(${c[0]},${c[1]},${c[2]}) ${(i / (stops - 1) * 100).toFixed(0)}%`; }).join(',') + ')'; };

  /** Suelo del escenario: 'auto' elige uno según el tipo de recinto; 'none' lo desactiva. */
  const FLOORS = { floor_tile: 'Baldosa', floor_wood: 'Madera clara', floor_concrete: 'Concreto pulido', floor_carpet: 'Alfombra', none: 'Sin textura' };
  const FLOORMAP = { dept2: 'floor_wood', office: 'floor_carpet', refl: 'floor_concrete', open: 'floor_tile', free: 'none', cowork: 'floor_carpet', hotel: 'floor_carpet', bodega: 'floor_concrete', casa: 'floor_tile' };
  const floorId = () => { const f = S.floor || 'auto'; if (f !== 'auto') return f === 'none' ? null : f; const k = FLOORMAP[S.preset]; return k === 'none' ? null : (k || 'floor_tile'); };

  /** Destello radial aditivo (para impactos de onda y partículas). */
  function spark(g, x, y, r, color, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(color, a)); gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }

  return { geoKey, FLOORS, floorId, q, motion, dark, now, easeOut, easeBack, rgba, rr, pill, geo, rooms, openType, ringPoly, PALS, palCol, palCss, palLut, spark };
})();
