/* ════════════════════════════════════════════════════════════════════
   INTERACCIÓN · ratón, tacto (pellizco y arrastre con dos dedos), teclado,
   bucle principal, modo feria e inicialización.
   ════════════════════════════════════════════════════════════════════ */
const ptrs = new Map();
let pinch = null, lastTap = 0;
const mposRaw = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - S.ox) / S.sc, y: (e.clientY - r.top - S.oy) / S.sc }; };
const mpos = e => { const p = mposRaw(e); return { x: clamp(p.x, 0, S.W), y: clamp(p.y, 0, S.H) }; };
/** Imán: cuadrícula de 0.25 m y ángulos de 0/45/90° respecto del otro extremo (UX-08). */
function snapPt(p, from, free) {
  if (!S.snap) return p;
  let x = Math.round(p.x * 4) / 4, y = Math.round(p.y * 4) / 4;
  if (from && !free) {
    const dx = p.x - from.x, dy = p.y - from.y, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx), q = Math.round(a / (Math.PI / 4)) * Math.PI / 4;
    if (L > .3 && Math.abs(a - q) < .12) { x = Math.round((from.x + Math.cos(q) * L) * 4) / 4; y = Math.round((from.y + Math.sin(q) * L) * 4) / 4; }
  }
  return { x: clamp(x, 0, S.W), y: clamp(y, 0, S.H) };
}
function pinchStart() {
  const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
}
function pinchMove() {
  const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, cxp = (a.x + b.x) / 2, cyp = (a.y + b.y) / 2, r = cv.getBoundingClientRect();
  if (S.mode === '3d') { S.zoom = S.zoomT = clamp(S.zoom * d / pinch.d, .4, 4); S.p3x = (S.p3x || 0) + cxp - pinch.cx; S.p3y = (S.p3y || 0) + cyp - pinch.cy; }
  else { zoomAt(d / pinch.d, cxp - r.left, cyp - r.top); S.vx -= (cxp - pinch.cx) / S.sc; S.vy -= (cyp - pinch.cy) / S.sc; clampView(); }
  pinch.d = d; pinch.cx = cxp; pinch.cy = cyp;
}
function events0() {
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); S.hintRings = false;
    if (ptrs.size === 2) { pinchStart(); S.drag = null; return; }
    if (e.pointerType === 'touch' || e.pointerType === 'pen') { const t = performance.now(); if (t - lastTap < 320 && !S.tool) { ACT.zoom('0'); } lastTap = t; }
    if (S.mode === '3d') { S.drag = { t: 'rot', x: e.clientX, y: e.clientY, tm: performance.now() }; S.vyaw = S.vpit = 0; S.camAnim = null; return; }
    const p = mpos(e), hr = Math.max(.4, 18 / S.sc);
    S.drag = null;
    if (S.tool === 'ruler') { if (!S.ruler || S.ruler.b) S.ruler = { a: p, b: null }; else S.ruler.b = p; return; }
    if (S.tool === 'wall') {
      const id = nextWallId(), s = snapPt(p), w = wallNew(id, s.x, s.y, s.x, s.y, S.wallMat && MAT[S.wallMat] ? S.wallMat : 'brick'); S.walls.push(w); S.sel = id; S.drag = { t: 'p2', w, new: 1 }; touch(); wallUI(); return;
    }
    const ai = S.aps.findIndex(a => hyp(p, a) < hr);
    if (ai >= 0) { S.drag = { t: 'ap', k: ai }; S.apSel = ai; S.ghost = { k: 'ap', i: ai, x: S.aps[ai].x, y: S.aps[ai].y, end: 0 }; panelsRefresh(); }
    else if (hyp(p, S.rx) < hr) { S.drag = { t: 'rx' }; S.ghost = { k: 'rx', x: S.rx.x, y: S.rx.y, end: 0 }; S.rxTrail = []; }
    else {
      for (const w of S.walls) {
        if (hyp(p, { x: w.x1, y: w.y1 }) < hr) { S.sel = w.id; S.drag = { t: 'p1', w }; break; }
        if (hyp(p, { x: w.x2, y: w.y2 }) < hr) { S.sel = w.id; S.drag = { t: 'p2', w }; break; }
      }
      if (!S.drag) {
        const w = S.walls.find(w => dseg(p, w) < Math.max(.3, 10 / S.sc));
        if (w) { S.sel = w.id; S.drag = { t: 'wb', w, p }; } else { S.sel = null; S.drag = { t: 'pan', x: e.clientX, y: e.clientY }; }
      }
    }
    wallUI();
  });
  cv.addEventListener('pointermove', e => {
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && ptrs.size >= 2) { pinchMove(); return; }
    { const rr = cv.getBoundingClientRect(); S.curPx = { x: e.clientX - rr.left, y: e.clientY - rr.top }; }
    const d = S.drag;
    if (!d) { hover(e); return; }
    if (d.t === 'rot') {                                    // giro con inercia: se estima la velocidad angular
      const tn = performance.now(), dts = Math.max(.008, (tn - d.tm) / 1000), dy = (e.clientX - d.x) * .01, dp = (e.clientY - d.y) * .01;
      S.yaw += dy; S.pit = clamp(S.pit + dp, .15, 1.5); S.vyaw = clamp(.5 * (S.vyaw || 0) + .5 * dy / dts, -7, 7); S.vpit = clamp(.5 * (S.vpit || 0) + .5 * dp / dts, -5, 5);
      d.tm = tn; d.x = e.clientX; d.y = e.clientY; return;
    }
    if (d.t === 'pan') { S.vx -= (e.clientX - d.x) / S.sc; S.vy -= (e.clientY - d.y) / S.sc; d.x = e.clientX; d.y = e.clientY; clampView(); return; }
    const p = mpos(e);
    if (d.t === 'ap') { S.aps[d.k].x = p.x; S.aps[d.k].y = p.y; }
    else if (d.t === 'rx') { S.rx.x = p.x; S.rx.y = p.y; const tr = S.rxTrail || (S.rxTrail = []); tr.push({ x: p.x, y: p.y, t: performance.now() }); if (tr.length > 70) tr.shift(); }
    else if (d.t === 'p1') { const s = snapPt(p, { x: d.w.x2, y: d.w.y2 }, e.shiftKey); d.w.x1 = s.x; d.w.y1 = s.y; }
    else if (d.t === 'p2') { const s = snapPt(p, { x: d.w.x1, y: d.w.y1 }, e.shiftKey); d.w.x2 = s.x; d.w.y2 = s.y; }
    else if (d.t === 'wb') { const dx = p.x - d.p.x, dy = p.y - d.p.y; d.w.x1 += dx; d.w.x2 += dx; d.w.y1 += dy; d.w.y2 += dy; d.p = p; }
    touch();
  });
  const up = e => {
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
    const d = S.drag;
    if (d && d.new && Math.hypot(d.w.x2 - d.w.x1, d.w.y2 - d.w.y1) < .3) { S.walls = S.walls.filter(x => x !== d.w); S.sel = null; }
    if (d && (d.t === 'ap' || d.t === 'rx')) logEv(d.t === 'rx' ? `Receptor movido a (${S.rx.x.toFixed(1)}, ${S.rx.y.toFixed(1)}): ${S.paths.tot.toFixed(1)} dBm` : `${apLabel(d.k)} movido a (${S.aps[d.k].x.toFixed(1)}, ${S.aps[d.k].y.toFixed(1)})`);
    if (d && d.t === 'rot' && performance.now() - d.tm > 90) S.vyaw = S.vpit = 0;
    if (S.ghost && d && (d.t === 'ap' || d.t === 'rx')) S.ghost.end = performance.now();
    S.drag = null; if (d && d.t !== 'rot') { touch(); hmD = 1; commit(); } wallUI();
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', () => { $('probe').style.display = 'none'; S.hoverWall = null; S.curPx = null; });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    if (S.mode === '3d') { S.zoomT = clamp((S.zoomT || S.zoom) * (e.deltaY < 0 ? 1.12 : .89), .4, 4); return; }
    const r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  cv.addEventListener('dblclick', () => { if (!S.tool) ACT.zoom('0'); });
  $('mm').addEventListener('pointerdown', e => {
    const m = $('mm'), k = m._k; if (!k) return; const r = m.getBoundingClientRect();
    S.vx = ((e.clientX - r.left) * m.width / r.width - k.ox) / k.k; S.vy = ((e.clientY - r.top) * m.height / r.height - k.oy) / k.k; clampView();
  });
  /* Teclado (UX-19, UX-20) */
  cv.addEventListener('keydown', e => {
    const st = e.ctrlKey ? .5 : .25, mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
    if (!mv) return; e.preventDefault();
    const t = e.shiftKey ? S.aps[S.apSel] : S.rx; t.x = clamp(t.x + mv[0], 0, S.W); t.y = clamp(t.y + mv[1], 0, S.H); touch();
  });
  addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName, typing = /INPUT|SELECT|TEXTAREA/.test(tag);
    if (e.key === 'Escape') { if (modalOn()) closeM(); else if (menuOpen) closeMenus(); else if (document.body.classList.contains('feria')) ACT.feria(); else if (S.tool) ACT.tool(S.tool); return; }
    if (modalOn() && e.key === 'Tab') {                         // trampa de foco
      const f = [...$('mib').querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(x => !x.disabled && x.offsetParent);
      if (f.length) { const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    if (typing || modalOn()) return;
    if (e.key === 'p' || e.key === 'P') ACT.feria();
    else if (e.key === ' ' && !/BUTTON/.test(tag)) { e.preventDefault(); ACT.pause(); }
    else if (e.key === '?') helpModal();
    else if (/^[1-9]$/.test(e.key)) { const k = Object.keys(PRE)[+e.key - 1]; if (k) { $('pre').value = k; preset(k); } }
    else if ((e.key === 'Delete') && S.sel) ACT.delWall();
  });
}
/** Sonda de potencia al pasar el cursor (UX-01). */
function hover(e) {
  const pr = $('probe');
  if (S.mode !== '2d') { pr.style.display = 'none'; return; }
  const p = mpos(e), r0 = mposRaw(e), c = calc(p), l = linkOf(c), r = cv.getBoundingClientRect();
  let bi = 0; c.P.forEach((x, i) => { if (x.pr > c.P[bi].pr) bi = i; });
  const bp = c.P[bi], hw = S.walls.find(w => dseg(r0, w) < Math.max(.25, 8 / S.sc)); S.hoverWall = hw ? hw.id : null;
  pr.style.display = 'block'; pr.style.left = Math.min(e.clientX - r.left + 16, r.width - 250) + 'px'; pr.style.top = Math.min(e.clientY - r.top + 16, r.height - 130) + 'px';
  pr.innerHTML = `<b>${c.tot.toFixed(1)} dBm</b><div class="mbar"><i style="left:${(clamp((c.tot + 90) / 60, 0, 1) * 100).toFixed(0)}%"></i></div>${c.intf > -90 ? 'SINR' : 'SNR'} ${l.snr.toFixed(0)} dB<br>${l.phy ? l.use.toFixed(0) + ' Mbps útiles · ' + l.mn : 'sin enlace'}<br>Trayectoria dominante: ${bi ? 'reflejada (' + bp.n + ' refl.)' : 'directa'} · ${bp.t.toFixed(0)} ns · ${bp.len.toFixed(1)} m<br>${S.aps.length > 1 && c.best >= 0 ? 'Servido por ' + apLabel(c.best) + ' · ' : ''}x ${p.x.toFixed(1)} · y ${p.y.toFixed(1)} m`;
  legMark(c, l);
  if (sound.on && sound.osc) sound.osc.frequency.value = 180 + clamp((c.tot + 100) / 60, 0, 1) * 900;
}

