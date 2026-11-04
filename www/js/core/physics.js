/* ════════════════════════════════════════════════════════════════════
   MÓDULO FÍSICA · funciones puras, sin DOM ni estado global.
   Se ejecuta en la página, en el Web Worker del mapa de calor y en las
   pruebas automáticas (Node). Unidades: metros, dB, dBm, GHz, MHz, ns.
   ════════════════════════════════════════════════════════════════════ */
/** Fábrica del motor. Se usa en la página y se re-instancia dentro del Web Worker (ver heatmap-engine.js). */
const PhysFactory = (MAT) => {
  'use strict';
  const C = 299792458;

  /** Materiales: llegan por parámetro desde js/data/materials.js (así también viajan al Web Worker). */

  /** Bandas: frecuencia (GHz), canales disponibles y anchos permitidos. */
  const BANDS = {
    2.4: { ch: [1, 6, 11], all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], mhz: n => 2407 + 5 * n, bw: [20, 40] },
    5:   { ch: [36, 40, 44, 48, 149, 153, 157, 161], all: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 149, 153, 157, 161], mhz: n => 5000 + 5 * n, bw: [20, 40, 80, 160] },
    6:   { ch: [1, 21, 41, 61], all: [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61], mhz: n => 5950 + 5 * n, bw: [20, 40, 80, 160] }
  };
  const band = f => BANDS[f] || BANDS[2.4];

  /** Tabla de equipos genéricos (sin marcas). Precios y consumos editables, solo referencia. */
  const EQ = {
    basic: { n: 'Router doméstico básico (Wi-Fi 4)',  pt: 18, gt: 3, ns: 2, cl: 8,   price: 40,  w: 8,  bh: 'cable' },
    dual:  { n: 'Router dual-band (Wi-Fi 5)',          pt: 21, gt: 4, ns: 3, cl: 20,  price: 90,  w: 12, bh: 'cable' },
    w6:    { n: 'Router Wi-Fi 6',                      pt: 22, gt: 5, ns: 4, cl: 40,  price: 160, w: 15, bh: 'cable' },
    ap:    { n: 'AP empresarial de techo (Wi-Fi 6)',   pt: 20, gt: 4, ns: 4, cl: 80,  price: 280, w: 14, bh: 'cable' },
    mesh:  { n: 'Nodo mesh (backhaul dedicado)',       pt: 21, gt: 4, ns: 2, cl: 30,  price: 130, w: 10, bh: 'mesh' },
    rep:   { n: 'Repetidor (misma banda)',             pt: 18, gt: 2, ns: 2, cl: 10,  price: 35,  w: 6,  bh: 'rep' }
  };
  const BH = { cable: 1, mesh: .9, rep: .5 };

  /** Perfiles de dispositivo cliente (ganancia Rx típica y flujos que soportan). */
  const CLIENT = {
    phone:  { n: 'Teléfono',          gr: -2, ns: 1 },
    laptop: { n: 'Laptop',            gr: 0,  ns: 2 },
    iot:    { n: 'Sensor IoT',        gr: -3, ns: 1 },
    usb:    { n: 'Adaptador USB',     gr: 2,  ns: 2 },
    cam:    { n: 'Cámara de seguridad', gr: 0, ns: 1 }
  };

  const SENS = [-82, -79, -77, -74, -70, -66, -65, -64, -59, -57, -54, -52];
  const RATE = [8.6, 17.2, 25.8, 34.4, 51.6, 68.8, 77.4, 86, 103.2, 114.7, 129, 143.4];
  const MINSNR = [5, 8, 11, 14, 18, 22, 24, 26, 30, 32, 35, 37];   // SNR mínima típica por MCS (dB), a validar
  const MN = ['BPSK 1/2', 'QPSK 1/2', 'QPSK 3/4', '16-QAM 1/2', '16-QAM 3/4', '64-QAM 2/3', '64-QAM 3/4', '64-QAM 5/6', '256-QAM 3/4', '256-QAM 5/6', '1024-QAM 3/4', '1024-QAM 5/6'];
  const BWF = { 20: 1, 40: 2, 80: 4.19, 160: 8.38 };      // factor de tasa por ancho de canal (subportadoras HE)

  const pw = d => Math.pow(10, d / 10);
  const db = p => 10 * Math.log10(p);
  const hyp = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lamOf = f => C / (f * 1e9);
  const E = w => [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /** Pérdida de trayectoria (dB). n = exponente (2 = espacio libre, Friis). d mínima 0.3 m. */
  const fspl = (d, f, n = 2) => 10 * n * Math.log10(Math.max(d, .3)) + 20 * Math.log10(f * 1000) - 27.55;
  /** Piso de ruido térmico (dBm) para un ancho de banda en MHz y figura de ruido nf. */
  const noiseDbm = (bw, nf = 6) => -174 + 10 * Math.log10(bw * 1e6) + nf;
  const shannon = (bwMHz, snrDb) => bwMHz * Math.log2(1 + pw(snrDb));

  /** Pérdida de transmisión (dB) de una pared a la frecuencia sc.f (escala √(f/2.4)). */
  const wallLoss = (w, sc) => MAT[w.m].l * (w.th / MAT[w.m].th) * Math.sqrt(sc.f / 2.4);
  /** Factor de camino oblicuo ≈ 1/cosθt (θt: ángulo refractado, Snell con n = √εr). */
  function oblF(w, dx, dy) {
    const wx = w.x2 - w.x1, wy = w.y2 - w.y1, l = Math.hypot(dx, dy) * Math.hypot(wx, wy) || 1;
    const ci = Math.min(1, Math.abs((dx * wy - dy * wx) / l));
    const st = Math.sqrt(1 - ci * ci) / Math.sqrt(MAT[w.m].e || 1);
    return 1 / Math.max(.25, Math.sqrt(1 - st * st));
  }
  /** Coeficientes de Fresnel (aire → dieléctrico sin pérdidas). θ en grados desde la normal. */
  function fresnel(er, thDeg) {
    const ti = thDeg * Math.PI / 180, n = Math.sqrt(er), ci = Math.cos(ti), st = Math.sin(ti) / n, ct = Math.sqrt(1 - st * st);
    const te = (ci - n * ct) / (ci + n * ct), tm = (n * ci - ct) / (n * ci + ct);
    return { te, tm, R: (te * te + tm * tm) / 2, brewster: Math.atan(n) * 180 / Math.PI };
  }
  /** Pérdida (dB) en una reflexión. Con sc.fres usa Fresnel (promedio TE/TM); si no, |Γ| fijo. */
  function refLoss(w, thDeg, sc) {
    const m = MAT[w.m];
    let g = m.g;
    if (sc.fres && m.e > 1) g = Math.min(.995, Math.sqrt(fresnel(m.e, thDeg).R));
    return -20 * Math.log10(g);
  }
  const inOpen = (w, s) => !!(w.op && w.op.some(o => s >= o.a && s <= o.b));

  /** Intersección segmento a→b con segmento c→d. Devuelve {x,y,t,s} o null. */
  function inter(a, b, c, d, eps) {
    const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y, den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-9) return null;           // paralelos o colineales: no se cuentan como cruce
    const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den, s = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
    if (t < eps || t > 1 - eps || s < 0 || s > 1) return null;
    return { x: a.x + t * rx, y: a.y + t * ry, t, s };
  }
  /** Imagen especular del punto p respecto de la recta de la pared w. */
  function mir(p, w) {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1, L = dx * dx + dy * dy || 1e-9, t = ((p.x - w.x1) * dx + (p.y - w.y1) * dy) / L;
    return { x: 2 * (w.x1 + t * dx) - p.x, y: 2 * (w.y1 + t * dy) - p.y };
  }
  /** Distancia de un punto a un segmento de pared. */
  function dseg(p, w) {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1, L = dx * dx + dy * dy || 1e-9, t = clamp(((p.x - w.x1) * dx + (p.y - w.y1) * dy) / L, 0, 1);
    return Math.hypot(p.x - w.x1 - t * dx, p.y - w.y1 - t * dy);
  }
  const share = (a, b) => E(a).some(p => E(b).some(q => Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6));

  /** Suma coherente (campos con fase). paths: [{pr (dBm), len (m), n (reflexiones)}]. */
  function cohSum(P, f) {
    let re = 0, im = 0;
    const k = 2 * Math.PI / lamOf(f);
    P.forEach(p => { const a = Math.sqrt(pw(p.pr)), ph = -k * p.len + Math.PI * p.n; re += a * Math.cos(ph); im += a * Math.sin(ph); });
    return db(re * re + im * im + 1e-30);
  }
  const incSum = P => db(P.reduce((a, p) => a + pw(p.pr), 0));

  /** Pérdidas por paredes cruzadas por el segmento a→b (con aperturas y sin doble conteo en vértices). */
  function crossings(sc, a, b, d0) {
    const sl = hyp(a, b), hits = [];
    sc.walls.forEach(w => {
      const h = inter(a, b, ...E(w), 1e-4);
      if (h && !inOpen(w, h.s)) hits.push({ w, h, l: wallLoss(w, sc) * (sc.obl ? oblF(w, b.x - a.x, b.y - a.y) : 1) });
    });
    hits.sort((p, q) => p.h.t - q.h.t);
    const out = [];
    hits.forEach(c => {
      const prev = out[out.length - 1];
      if (prev && (c.h.t - prev.h.t) * sl < 2e-3 && share(prev.w, c.w)) {   // vértice compartido: contar solo el mayor
        if (c.l > prev.l) out[out.length - 1] = c;
      } else out.push(c);
    });
    return out.map(c => ({ w: c.w, d: d0 + c.h.t * sl, l: c.l }));
  }

  /** Trayectorias (directa + reflejadas por método de imágenes) de un AP A hacia B. */
  function paths(sc, A, B) {
    const Ws = sc.walls, base = A.pt + A.gt + sc.gr + sc.off, n2 = sc.pln || 2;
    const mk = (pts, rf) => {
      let len = 0, tl = 0, cr = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const c = crossings(sc, pts[i], pts[i + 1], len);
        c.forEach(x => { tl += x.l; cr.push(x); });
        len += hyp(pts[i], pts[i + 1]);
      }
      len = Math.max(len, .3);
      const fs = fspl(len, sc.f, n2), ang = [];
      for (let i = 1; i < pts.length - 1; i++) {
        const d = { x: pts[i].x - pts[i - 1].x, y: pts[i].y - pts[i - 1].y }, w = rf[i - 1], wx = w.x2 - w.x1, wy = w.y2 - w.y1, l = Math.hypot(d.x, d.y) * Math.hypot(wx, wy) || 1;
        ang.push(Math.acos(Math.min(1, Math.abs((-d.x * wy + d.y * wx) / l))) * 180 / Math.PI);
      }
      const r = rf.reduce((a, w, i) => a + refLoss(w, ang[i], sc), 0);
      return { pts, rf, len, tl, r, fs, cr, ang, n: rf.length, pr: base - fs - tl - r, t: len / C * 1e9 };
    };
    const P = [mk([A, B], [])];
    if (sc.bn > 0 && Ws.length) {
      const seqs = [];
      (function g(c) {
        if (c.length) seqs.push(c.slice());
        if (c.length < sc.bn) Ws.forEach(w => { if (c[c.length - 1] !== w) { c.push(w); g(c); c.pop(); } });
      })([]);
      const R = [];
      seqs.forEach(sq => {
        const im = [A];
        sq.forEach(w => im.push(mir(im[im.length - 1], w)));
        let cur = B, hit = [], ok = 1;
        for (let i = sq.length; i > 0; i--) {
          const h = inter(cur, im[i], ...E(sq[i - 1]), 1e-6);
          if (!h || inOpen(sq[i - 1], h.s)) { ok = 0; break; }
          hit[i - 1] = { x: h.x, y: h.y };
          cur = hit[i - 1];
        }
        if (ok) { const p = mk([A, ...hit, B], sq); if (p.pr > -110) R.push(p); }
      });
      R.sort((a, b) => b.pr - a.pr);
      P.push(...R.slice(0, 10));
    }
    return P;
  }

  /** Un AP A hacia el punto rx: devuelve {P, tot}. mode: 'coh' | 'inc'. */
  function calcAP(sc, A, rx, mode) {
    const P = paths(sc, A, rx);
    return { P, tot: (mode || (sc.coh ? 'coh' : 'inc')) === 'coh' ? cohSum(P, sc.f) : incSum(P) };
  }

  /** Factor de solape espectral entre dos canales (0..1). */
  function chOverlap(sc, c1, c2, bw1, bw2) {
    const b = band(sc.f), df = Math.abs(b.mhz(c1) - b.mhz(c2)), w = ((bw1 || sc.bw) + (bw2 || sc.bw)) / 2;
    return Math.max(0, 1 - df / w);
  }
  const isServer = a => a.on !== false && a.srv !== false;

  /** Escena con varios AP: mejor servidor + interferencia (solo APs que solapan canal) → SINR. */
  function calc(sc, rx, mode) {
    const aps = sc.aps, R = [];
    let b = null, bi = -1, cnt = 0;
    aps.forEach((a, i) => {
      if (a.on === false) { R.push(null); return; }
      const r = calcAP(sc, a, rx, mode);
      R.push(r);
      if (isServer(a)) {
        if (r.tot >= -70) cnt++;
        if (!b || r.tot > b.tot) { b = r; bi = i; }
      }
    });
    if (!b) return { P: [], tot: -120, intf: -99, sinr: -99, best: -1, cnt: 0, all: R.map(r => r ? r.tot : null) };
    let s = 0;
    aps.forEach((a, i) => {
      if (i === bi || !R[i]) return;
      s += pw(R[i].tot) * chOverlap(sc, a.ch || 1, aps[bi].ch || 1, a.bw, aps[bi].bw);
    });
    const nz = pw(noiseDbm(sc.bw, sc.nf));
    return { P: b.P, tot: b.tot, intf: s > 1e-20 ? db(s) : -99, sinr: b.tot - db(nz + s), best: bi, cnt, all: R.map(r => r ? r.tot : null) };
  }

  /** Enlace: MCS elegido con RSSI y con SNR (o SINR); velocidades PHY/útil y capacidad de Shannon. */
  function link(sc, rssi, sinr, bhf) {
    const sh = 10 * Math.log10(sc.bw / 20), snr = sinr != null ? sinr : rssi - noiseDbm(sc.bw, sc.nf);
    let m = -1;
    for (let i = 0; i < 12; i++) if (rssi >= SENS[i] + sh && snr >= MINSNR[i]) m = i;
    const st = Math.min(sc.ns || 1, sc.nsC || 99), f = (BWF[sc.bw] || sc.bw / 20) * st * (bhf == null ? 1 : bhf);
    const phy = m < 0 ? 0 : RATE[m] * f;
    return { m, snr, phy, mb: phy, use: phy * .6, shannon: shannon(sc.bw, snr) * st, mn: m < 0 ? '—' : MN[m], minSnr: m < 0 ? null : MINSNR[m] };
  }

  /* ─── Mapa de cobertura ─── */
  const gridDims = (sc, st) => ({ nx: Math.round(sc.W / st), ny: Math.round(sc.H / st) });
  function makeGrid(sc, st) {
    const { nx, ny } = gridDims(sc, st), N = nx * ny;
    return { st, nx, ny, tot: new Float32Array(N), sinr: new Float32Array(N), best: new Int8Array(N), cnt: new Uint8Array(N) };
  }
  /** Calcula las filas j0..j1-1 de la cuadrícula g (celdas de st metros). */
  function heatRows(sc, g, mode, j0, j1) {
    for (let j = j0; j < j1; j++) for (let i = 0; i < g.nx; i++) {
      const r = calc(sc, { x: (i + .5) * g.st, y: (j + .5) * g.st }, mode), k = j * g.nx + i;
      g.tot[k] = r.tot; g.sinr[k] = r.sinr; g.best[k] = r.best; g.cnt[k] = r.cnt;
    }
  }
  const heatAll = (sc, st, mode) => { const g = makeGrid(sc, st); heatRows(sc, g, mode, 0, g.ny); return g; };
  const pctile = (arr, q) => { const v = Array.from(arr).sort((a, b) => a - b); return v[Math.min(v.length - 1, Math.floor(v.length * q))]; };
  const pctGE = (arr, th) => { let n = 0; for (const a of arr) if (a >= th) n++; return 100 * n / arr.length; };

  /** KPI del plano a partir de una cuadrícula (cobertura, zonas muertas, redundancia, velocidad). */
  function kpis(sc, g) {
    const sp = new Float32Array(g.tot.length);
    for (let k = 0; k < sp.length; k++) {
      const bi = g.best[k], a = sc.aps[bi], l = link({ ...sc, ns: a ? a.ns || sc.ns : sc.ns }, g.tot[k], g.sinr[k], a ? BH[a.bh || 'cable'] : 1);
      sp[k] = l.use;
    }
    let red = 0;
    for (let k = 0; k < g.cnt.length; k++) if (g.cnt[k] >= 2) red++;
    return {
      c67: pctGE(g.tot, -67), c75: pctGE(g.tot, -75), dead: 100 - pctGE(g.tot, -82),
      p10: pctile(g.tot, .1), med: pctile(g.tot, .5), red: 100 * red / g.cnt.length,
      sp10: pctile(sp, .1), spMed: pctile(sp, .5), st: g.st
    };
  }

  /** Fuga: RSSI máximo en un anillo a 'off' metros fuera del rectángulo que envuelve las paredes. */
  function leakage(sc, off = 3) {
    if (!sc.walls.length) return { max: -120, bbox: null };
    const xs = sc.walls.flatMap(w => [w.x1, w.x2]), ys = sc.walls.flatMap(w => [w.y1, w.y2]);
    const x0 = Math.min(...xs) - off, x1 = Math.max(...xs) + off, y0 = Math.min(...ys) - off, y1 = Math.max(...ys) + off, pts = [];
    for (let x = x0; x <= x1; x += 1) { pts.push({ x, y: y0 }, { x, y: y1 }); }
    for (let y = y0; y <= y1; y += 1) { pts.push({ x: x0, y }, { x: x1, y }); }
    let mx = -120, at = null;
    pts.forEach(p => { const r = calc(sc, p, 'inc'); if (r.tot > mx) { mx = r.tot; at = p; } });
    return { max: mx, at, bbox: { x0, y0, x1, y1 } };
  }

  /** Evalúa una disposición de AP sobre una cuadrícula gruesa (para optimizar posiciones). */
  function evalLayout(sc, step = 2) {
    const v = [];
    for (let y = step / 2; y < sc.H; y += step) for (let x = step / 2; x < sc.W; x += step) v.push(calc(sc, { x, y }, 'inc').tot);
    return { p10: pctile(v, .1), c: pctGE(v, -67), med: pctile(v, .5) };
  }
  /** Optimiza la posición del AP k (generador: cede el control para mostrar progreso). */
  function* optimizeAP(sc, k, step = 2) {
    const sc2 = { ...sc, bn: Math.min(sc.bn, 1), aps: sc.aps.map(a => ({ ...a })) };
    const base = evalLayout(sc2, 2), a0 = sc.aps[k];
    let best = { ...base, x: a0.x, y: a0.y };
    const better = (r, b) => r.p10 > b.p10 + .05 || (Math.abs(r.p10 - b.p10) <= .05 && r.c > b.c + .5);
    const cand = [];
    for (let y = 1; y < sc.H; y += step) for (let x = 1; x < sc.W; x += step) cand.push({ x, y });
    for (let i = 0; i < cand.length; i++) {
      const p = cand[i];
      if (sc.walls.some(w => dseg(p, w) < .4)) continue;
      sc2.aps[k].x = p.x; sc2.aps[k].y = p.y;
      const r = evalLayout(sc2, 2);
      if (better(r, best)) best = { ...r, x: p.x, y: p.y };
      if (i % 4 === 0) yield (i + 1) / (cand.length + 12);
    }
    for (const d of [1, .5, .25]) {           // refinamiento local
      for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) {
        const p = { x: clamp(best.x + dx, .3, sc.W - .3), y: clamp(best.y + dy, .3, sc.H - .3) };
        if (sc.walls.some(w => dseg(p, w) < .3)) continue;
        sc2.aps[k].x = p.x; sc2.aps[k].y = p.y;
        const r = evalLayout(sc2, 2);
        if (better(r, best)) best = { ...r, x: p.x, y: p.y };
      }
      yield 1;
    }
    return { best, base, k };
  }

  /** Plan de canales por coloreado voraz: minimiza solape × acoplamiento entre APs. */
  function assignChannels(sc) {
    const b = band(sc.f), aps = sc.aps, out = aps.map(a => a.ch);
    const coup = (i, j) => { const r = calcAP(sc, aps[i], aps[j], 'inc'); return pw(r.tot); };
    const done = [];
    aps.forEach((a, i) => {
      if (a.on === false) { done.push(i); return; }
      let bestC = b.ch[0], bestS = Infinity;
      b.ch.forEach(c => {
        let s = 0;
        done.forEach(j => { if (aps[j].on !== false) s += chOverlap(sc, c, out[j], sc.bw, sc.bw) * Math.max(coup(i, j), coup(j, i)); });
        if (s < bestS - 1e-18) { bestS = s; bestC = c; }
      });
      out[i] = bestC; done.push(i);
    });
    return out;
  }
  /** Pares de AP que comparten canal y se «escuchan» por encima de −82 dBm. */
  function coChannelWarnings(sc) {
    const w = [];
    sc.aps.forEach((a, i) => sc.aps.forEach((b, j) => {
      if (j <= i || a.on === false || b.on === false) return;
      if (chOverlap(sc, a.ch, b.ch, sc.bw, sc.bw) > .5) {
        const r = Math.max(calcAP(sc, a, b, 'inc').tot, calcAP(sc, b, a, 'inc').tot);
        if (r > -82) w.push({ i, j, rssi: r });
      }
    }));
    return w;
  }

  /* ─── Rayos visuales con reflexión + transmisión (C-01) ─── */
  /** Lanza nRays desde el AP A; en cada pared el rayo se divide en reflejado y transmitido y se poda por potencia.
   *  Devuelve segmentos {a,b,al,s0,l,k:'d'|'r'|'t',i,key,P} (P en dBm al final del segmento). */
  function traceRays(sc, A, nRays, maxSeg = 5000, cut = -98) {
    const out = [], base = A.pt + A.gt + sc.gr + sc.off, n2 = sc.pln || 2;
    for (let i = 0; i < nRays; i++) {
      const a0 = i / nRays * 2 * Math.PI, st = [{ p: { x: A.x, y: A.y }, d: { x: Math.cos(a0), y: Math.sin(a0) }, tot: 0, loss: 0, rd: 0, nt: 0, k: 'd', key: '' }];
      let n = 0;
      while (st.length && out.length < maxSeg && n < 80) {
        const r = st.pop(); n++;
        const q = { x: r.p.x + r.d.x * 40, y: r.p.y + r.d.y * 40 };
        let best = null;
        sc.walls.forEach(w => {
          const h = inter(r.p, q, ...E(w), 1e-6);
          if (h && !inOpen(w, h.s) && (!best || h.t < best.h.t)) best = { h, w };
        });
        const e = best ? { x: best.h.x, y: best.h.y } : q, l = hyp(r.p, e);
        const pEnd = base - fspl(r.tot + l, sc.f, n2) - r.loss;
        out.push({ a: r.p, b: e, al: clamp((pEnd + 90) / 80, .04, .7), s0: r.tot, l, k: r.k, i, key: r.key, P: pEnd });
        if (!best) continue;
        const w = best.w, tot = r.tot + l, p0 = { x: e.x + r.d.x * 1e-4, y: e.y + r.d.y * 1e-4 };
        const Lt = wallLoss(w, sc) * (sc.obl ? oblF(w, r.d.x, r.d.y) : 1);
        if (r.nt < 8 && base - fspl(tot, sc.f, n2) - r.loss - Lt > cut)
          st.push({ p: p0, d: r.d, tot, loss: r.loss + Lt, rd: r.rd, nt: r.nt + 1, k: r.k === 'r' ? 'r' : 't', key: r.key + 't' + w.id });
        if (r.rd < sc.bn) {
          const wx = w.x2 - w.x1, wy = w.y2 - w.y1, L = Math.hypot(wx, wy) || 1, nx = -wy / L, ny = wx / L, dn = r.d.x * nx + r.d.y * ny;
          const th = Math.acos(Math.min(1, Math.abs(dn))) * 180 / Math.PI;
          const Lr = refLoss(w, th, sc), d2 = { x: r.d.x - 2 * dn * nx, y: r.d.y - 2 * dn * ny };
          if (base - fspl(tot, sc.f, n2) - r.loss - Lr > cut)
            st.push({ p: { x: e.x + d2.x * 1e-4, y: e.y + d2.y * 1e-4 }, d: d2, tot, loss: r.loss + Lr, rd: r.rd + 1, nt: r.nt, k: 'r', key: r.key + 'r' + w.id });
        }
      }
    }
    return out;
  }

  /* ─── Canal: PDP, respuesta en frecuencia, zonas de Fresnel ─── */
  function delaySpread(P) {
    const q = P.map(p => pw(p.pr)), s = q.reduce((a, b) => a + b, 0), m = P.reduce((a, p, i) => a + q[i] * p.t, 0) / s, m2 = P.reduce((a, p, i) => a + q[i] * p.t * p.t, 0) / s;
    const rms = Math.sqrt(Math.max(0, m2 - m * m));
    return { rms_ns: rms, Bc_MHz: rms > .05 ? 1000 / (5 * rms) : Infinity, mean_ns: m };
  }
  /** |H(f)| en dB a lo largo del canal (f0 ± bw/2), con las trayectorias coherentes. */
  function freqResp(P, f0, bwMHz, N = 128) {
    const k = 2 * Math.PI / lamOf(f0), xs = [], ys = [];
    for (let i = 0; i < N; i++) {
      const df = (i / (N - 1) - .5) * bwMHz * 1e6;
      let re = 0, im = 0;
      P.forEach(p => { const a = Math.sqrt(pw(p.pr)), ph = -k * p.len + Math.PI * p.n - 2 * Math.PI * df * p.t * 1e-9; re += a * Math.cos(ph); im += a * Math.sin(ph); });
      xs.push(df / 1e6); ys.push(db(re * re + im * im + 1e-30));
    }
    return { xs, ys };
  }
  const fresnelRadius = (n, lam, d1, d2) => Math.sqrt(n * lam * d1 * d2 / (d1 + d2));
  function segDist(a, b, c, d) {      // distancia mínima entre segmentos ab y cd (0 si se cruzan)
    if (inter(a, b, c, d, 0)) return 0;
    const pd = (p, s, e) => dseg(p, { x1: s.x, y1: s.y, x2: e.x, y2: e.y });
    return Math.min(pd(a, c, d), pd(b, c, d), pd(c, a, b), pd(d, a, b));
  }
  /** 1.ª zona de Fresnel entre A y B y despeje libre frente a las paredes (2D). */
  function fresnelClear(sc, A, B) {
    const d = hyp(A, B) || 1, r1 = fresnelRadius(1, lamOf(sc.f), d / 2, d / 2);
    let md = Infinity;
    sc.walls.forEach(w => { const o = segDist(A, B, ...E(w)); if (o < md) md = o; });
    return { r1, d, minDist: md, clear: md === Infinity ? 100 : Math.max(0, Math.min(100, 100 * md / r1)) };
  }

  /* ─── Utilidades de física (Apéndice D del documento) ─── */
  const knifeEdgeLossDb = (h, lam, d1, d2) => { const v = h * Math.sqrt(2 * (d1 + d2) / (lam * d1 * d2)); return v > -.78 ? 6.9 + 20 * Math.log10(Math.sqrt((v - .1) ** 2 + 1) + v - .1) : 0; };
  const dopplerHz = (v, fGHz, cosT = 1) => v * fGHz * 1e9 / C * cosT;
  const powerDensity = (eirpDbm, d) => pw(eirpDbm) / 1000 / (4 * Math.PI * d * d);
  function logDistanceFit(ds, prs) {
    const x = ds.map(d => 10 * Math.log10(d)), n = x.length, mx = x.reduce((a, b) => a + b) / n, my = prs.reduce((a, b) => a + b) / n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (prs[i] - my); sxx += (x[i] - mx) ** 2; }
    const sl = sxx ? sxy / sxx : 0;
    return { exponent: -sl, P1m: my - sl * mx };
  }
  /** Muestrea valores a lo largo de la recta Tx→Rx (reutilizado por los gráficos de distancia y velocidad). */
  function samplePath(sc, A, B, step, fn, dmax = 20) {
    const L = hyp(A, B) || 1, ux = (B.x - A.x) / L, uy = (B.y - A.y) / L, out = [];
    for (let d = step; d <= dmax + 1e-9; d += step) {
      const p = { x: A.x + ux * d, y: A.y + uy * d };
      if (p.x < 0 || p.y < 0 || p.x > sc.W || p.y > sc.H) break;      // no salir del recinto (C-08)
      out.push({ d, value: fn(p) });
    }
    return out;
  }

  return { C, MAT, BANDS, band, EQ, BH, CLIENT, SENS, RATE, MINSNR, MN, BWF, pw, db, hyp, lamOf, E, clamp, fspl, noiseDbm, shannon, wallLoss, oblF, fresnel, refLoss, inOpen, inter, mir, dseg,
    cohSum, incSum, crossings, paths, calcAP, calc, chOverlap, isServer, link, gridDims, makeGrid, heatRows, heatAll, pctile, pctGE, kpis, leakage, evalLayout, optimizeAP, assignChannels,
    coChannelWarnings, traceRays, delaySpread, freqResp, fresnelRadius, fresnelClear, knifeEdgeLossDb, dopplerHz, powerDensity, logDistanceFit, samplePath, version: 6 };
};

/** Instancia del motor para la página. Los materiales vienen de MATERIALS (js/data/materials.js). */
const Phys = PhysFactory(MATERIALS);
