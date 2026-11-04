/* ════════════════════════════════════════════════════════════════════
   MOTOR DE TEXTURAS v2 · genera cada textura UNA sola vez con <canvas>,
   la guarda en caché y la usa en el plano 2D, en las paredes y el suelo 3D,
   en la lista de paredes y en la galería. Las texturas viven en
   assets/textures/<id>.js  (una por material; los suelos usan el prefijo floor_).

   Cada archivo hace:
     Textures.define('brick', {
       tile: 1,        // cuántos metros cubre el lado de la textura
       alpha: .92,     // opacidad en 3D (el vidrio usa menos)
       bump: .6,       // (opcional) relieve simulado: 0 = liso … 1 = muy marcado
       draw(g, w, h, u) { ... }   // g = contexto 2D, w×h = 256×256 (siempre «lógicos»), u = ayudas
     });

   RESOLUCIONES (v2): se dibuja una sola vez a 256 px lógicos y se rasteriza a
     128 px (plano 2D: menos memoria), 256 px (estándar) o 512 px (vista 3D
     cercana, solo cuando hace falta). draw() no cambia: el motor escala el lienzo.

   IMAGEN PROPIA (PNG/JPG) en vez de dibujar — ver «assets/textures/_ejemplo_png.md»:
     Textures.define('brick', { image: 'assets/textures/brick.png', tile: 1, bump: .5 });
     (mientras carga —o si falla— se usa draw() si existe, o una textura genérica)

   VARIANTES: cada pared pasa su id y la textura se desplaza un poco, de modo que
     dos paredes iguales no se ven como copia exacta.
   TINTE por tema: Textures.setTint(color, alpha) lo llama el sistema de temas.

   Si un material NO tiene archivo de textura, se usa una genérica con su color
   base: agregar materiales nunca rompe el simulador.
   ════════════════════════════════════════════════════════════════════ */
const Textures = (() => {
  'use strict';
  const SIZE = 256, defs = {}, ents = {}, thumbs = {}, imgs = {};
  let rev = 0, tint = { c: 'transparent', a: 0 };

  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hex = c => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(c || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [136, 136, 136]; };
  /** Mezcla un color con blanco (amt>0) o negro (amt<0). */
  const shade = (c, amt, a = 1) => { const t = amt < 0 ? 0 : 255, k = Math.abs(amt); return `rgba(${hex(c).map(v => Math.round(v + (t - v) * k)).join(',')},${a})`; };

  /** Ayudas que recibe draw(): azar con semilla fija, ruido, repetición sin costuras, color. */
  function helpers(id, g, px) {
    const r = rng(hash(id)), u = {
      r, rr: (a, b) => a + (b - a) * r(), pick: arr => arr[Math.floor(r() * arr.length)], shade,
      hsl: (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`,
      /** Granulado fino: suma ±amt de luminosidad a cada píxel real (respeta la transparencia). */
      grain(amt = 14) {
        const im = g.getImageData(0, 0, px, px), d = im.data;
        for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 2 * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
        g.putImageData(im, 0, 0);
      },
      /** Reparte n elementos al azar y los dibuja también en los bordes opuestos → la textura se repite sin costura. */
      scatter(n, fn) {
        for (let i = 0; i < n; i++) {
          const x = r() * SIZE, y = r() * SIZE, a = r(), b = r(), c = r();
          for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) fn(g, x + dx, y + dy, a, b, c);
        }
      },
      /** Dibuja fn(g) en las 9 posiciones vecinas (para trazos que cruzan el borde). */
      wrap(fn) { for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) { g.save(); g.translate(dx, dy); fn(g); g.restore(); } }
    };
    return u;
  }

  function generic(g, id, u) {
    const c = (typeof MATERIALS !== 'undefined' && MATERIALS[id] && MATERIALS[id].c) || '#8a94a3';
    g.fillStyle = c; g.fillRect(0, 0, SIZE, SIZE);
    u.scatter(500, (g, x, y, a, b) => { g.fillStyle = shade(c, b > .5 ? .25 : -.25, .35); g.fillRect(x, y, 1 + a * 3, 1 + a * 3); });
    u.grain(10);
  }

  /** Relieve simulado (bump): mapa de alturas = luminosidad; luz desde arriba-izquierda; se repite sin costura. */
  function applyBump(g, px, k) {
    const im = g.getImageData(0, 0, px, px), d = im.data, h = new Float32Array(px * px);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) h[j] = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
    const s = k * 70 * (px / SIZE > 1 ? .8 : 1);
    for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) {
      const xl = (x + px - 1) % px, xr = (x + 1) % px, yu = (y + px - 1) % px, yd = (y + 1) % px;
      const dx = h[y * px + xr] - h[y * px + xl], dy = h[yd * px + x] - h[yu * px + x], v = -(dx + dy) * s, i = (y * px + x) * 4;
      d[i] += v; d[i + 1] += v; d[i + 2] += v;
    }
    g.putImageData(im, 0, 0);
  }

  function define(id, def) { defs[id] = def || {}; delete ents[id]; for (const k in thumbs) if (k.startsWith(id + '@')) delete thumbs[k]; rev++; }

  function ent(id) {
    if (ents[id]) return ents[id];
    const d = defs[id] || {};
    const e = ents[id] = { id, alpha: d.alpha == null ? .92 : d.alpha, tile: d.tile || 1, lod: {} };
    if (d.image && !imgs[id]) {                         // imagen propia: se pide una sola vez
      const im = new Image(); imgs[id] = { im, ok: false };
      im.onload = () => { imgs[id].ok = true; const e2 = ents[id]; if (e2) e2.lod = {}; for (const k in thumbs) if (k.startsWith(id + '@')) delete thumbs[k]; rev++; };
      im.onerror = () => console.warn('Textura «' + id + '»: no se pudo cargar ' + d.image);
      im.src = d.image;
    }
    return e;
  }
  /** Rasteriza la textura a px×px (128, 256 o 512). */
  function lod(id, px = SIZE) {
    const e = ent(id); if (e.lod[px]) return e.lod[px];
    const d = defs[id] || {}, canvas = document.createElement('canvas'), work = document.createElement('canvas');
    canvas.width = canvas.height = work.width = work.height = px;
    const g = work.getContext('2d', { willReadFrequently: true }), u = helpers(id, g, px);
    g.save(); g.scale(px / SIZE, px / SIZE);
    const ii = imgs[id];
    if (d.image && ii && ii.ok) g.drawImage(ii.im, 0, 0, SIZE, SIZE);
    else if (d.draw) { try { d.draw(g, SIZE, SIZE, u); } catch (err) { console.warn('Textura «' + id + '» con error:', err); g.clearRect(0, 0, SIZE, SIZE); generic(g, id, u); } }
    else generic(g, id, u);
    g.restore();
    if (d.bump) { try { applyBump(g, px, d.bump); } catch (err) { } }
    canvas.getContext('2d').drawImage(work, 0, 0);
    return (e.lod[px] = { canvas, pat: null, patRev: -1 });
  }
  const get = id => lod(id, SIZE);

  function pattern(cx, id, px = SIZE) {
    const t = lod(id, px);
    if (!t.pat || t.patRev !== rev) { t.pat = cx.createPattern(t.canvas, 'repeat'); t.patRev = rev; }
    return t.pat;
  }
  const off = wid => wid == null ? [0, 0] : [((hash('v' + wid) % 997) / 997), ((hash('w' + wid) % 991) / 991)];
  const setTint = (c, a) => { tint = { c: c || 'transparent', a: +a || 0 }; };

  /** Pared 3D: pinta la textura sobre el paralelogramo de la pared (proyección afín) con luz y sombra. */
  function wall3D(cx, id, p0, p1, p3, len, hgt, shadeA, wid) {
    if (len < 1e-6 || hgt < 1e-6) return;
    const e = ent(id), scr = Math.hypot(p3.x - p0.x, p3.y - p0.y) / hgt * e.tile, px = scr > 230 ? 512 : scr < 100 ? 128 : 256;
    const pat = pattern(cx, id, px), o = off(wid);
    cx.save();
    cx.transform((p1.x - p0.x) / len, (p1.y - p0.y) / len, (p0.x - p3.x) / hgt, (p0.y - p3.y) / hgt, p3.x, p3.y);
    pat.setTransform(new DOMMatrix().translate(o[0] * e.tile, o[1] * e.tile).scale(e.tile / px));
    cx.globalAlpha = e.alpha; cx.fillStyle = pat; cx.fillRect(0, 0, len, hgt);
    if (tint.a) { cx.globalAlpha = tint.a; cx.fillStyle = tint.c; cx.fillRect(0, 0, len, hgt); cx.globalAlpha = e.alpha; }
    const gr = cx.createLinearGradient(0, 0, 0, hgt);      // más claro arriba, más oscuro junto al suelo (oclusión ambiental falsa)
    gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(.4, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.46)');
    cx.globalAlpha = 1; cx.fillStyle = gr; cx.fillRect(0, 0, len, hgt);
    if (shadeA) { cx.fillStyle = 'rgba(0,0,0,' + shadeA + ')'; cx.fillRect(0, 0, len, hgt); }
    cx.restore();
  }

  /** Pared 2D: franja con la textura alineada a la pared. pxPerM = píxeles por metro del plano. */
  function wall2D(cx, id, x1, y1, x2, y2, wpx, pxPerM, outline, outW, wid) {
    const len = Math.hypot(x2 - x1, y2 - y1); if (len < .5) return;
    const e = ent(id), px = e.tile * pxPerM <= 110 ? 128 : SIZE, pat = pattern(cx, id, px), k = Math.max(.06, e.tile * pxPerM / px), o = off(wid);
    cx.save(); cx.translate(x1, y1); cx.rotate(Math.atan2(y2 - y1, x2 - x1));
    pat.setTransform(new DOMMatrix().translate(o[0] * e.tile * pxPerM, o[1] * e.tile * pxPerM).scale(k));
    cx.fillStyle = pat; cx.fillRect(0, -wpx / 2, len, wpx);
    if (tint.a) { cx.globalAlpha = tint.a; cx.fillStyle = tint.c; cx.fillRect(0, -wpx / 2, len, wpx); cx.globalAlpha = 1; }
    if (outW) { cx.strokeStyle = outline; cx.lineWidth = outW; cx.strokeRect(0, -wpx / 2, len, wpx); }
    cx.restore();
  }

  /** Suelo 2D: rellena el rectángulo (x,y,w,h) en píxeles con la textura (1 baldosa = tile metros). */
  function floor2D(cx, id, x, y, w, h, pxPerM, alpha) {
    const e = ent(id), px = e.tile * pxPerM <= 110 ? 128 : SIZE, pat = pattern(cx, id, px);
    cx.save(); pat.setTransform(new DOMMatrix().translate(x, y).scale(Math.max(.05, e.tile * pxPerM / px)));
    cx.globalAlpha = alpha; cx.fillStyle = pat; cx.fillRect(x, y, w, h); cx.restore();
  }
  /** Suelo 3D con proyección afín: p00 = esquina (0,0), pW0 = (W,0), p0H = (0,H) ya proyectadas. */
  function floor3D(cx, id, p00, pW0, p0H, W, H, alpha) {
    const e = ent(id), scr = Math.hypot(pW0.x - p00.x, pW0.y - p00.y) / W * e.tile, px = scr > 230 ? 512 : scr < 100 ? 128 : 256, pat = pattern(cx, id, px);
    cx.save(); cx.transform((pW0.x - p00.x) / W, (pW0.y - p00.y) / W, (p0H.x - p00.x) / H, (p0H.y - p00.y) / H, p00.x, p00.y);
    pat.setTransform(new DOMMatrix().scale(e.tile / px)); cx.globalAlpha = alpha; cx.fillStyle = pat; cx.fillRect(0, 0, W, H); cx.restore();
  }

  /** Miniatura (data URL) para listas y paneles. */
  function thumb(id, px = 48) {
    const k = id + '@' + px; if (thumbs[k]) return thumbs[k];
    const c = document.createElement('canvas'); c.width = c.height = px; const g = c.getContext('2d');
    g.fillStyle = (typeof MATERIALS !== 'undefined' && MATERIALS[id] && MATERIALS[id].c) || '#888'; g.globalAlpha = .35; g.fillRect(0, 0, px, px); g.globalAlpha = 1;
    g.drawImage(get(id).canvas, 0, 0, px, px);
    return (thumbs[k] = c.toDataURL());
  }
  /** Valor CSS «background» listo para usar: style="background:${Textures.swatch('brick')}". */
  const swatch = (id, px) => `url(${thumb(id, px)}) center/cover`;

  return { SIZE, define, get, lod, pattern, wall3D, wall2D, floor2D, floor3D, setTint, thumb, swatch, has: id => !!defs[id], list: () => Object.keys(defs), canvas: id => get(id).canvas, alpha: id => ent(id).alpha, tile: id => ent(id).tile };
})();
