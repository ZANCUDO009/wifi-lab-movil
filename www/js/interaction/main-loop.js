/* ── Bucle principal ── */
let lastDraw = 0, lt = 0, lh = 0, lfps = 0, frames = 0, fps = 60, ft = 0, lastScrub = 0, slowFrames = 0;
function loop(now) {
  const dt = Math.min(.1, (now - lt) / 1000 || 0); lt = now;
  frames++; if (now - lfps > 1000) { fps = frames * 1000 / (now - lfps); frames = 0; lfps = now; if (S.quality === 'auto') { slowFrames = fps < 28 ? slowFrames + 1 : Math.max(0, slowFrames - 1); S.autoQ = slowFrames >= 3 ? 'mid' : 'high'; } if ($('status').style.display === 'block') $('status').textContent = `v6 · ${fps.toFixed(0)} FPS · cálculo ${S.calcMs ? S.calcMs.toFixed(1) : '–'} ms · mapa ${Heat.lastMs.toFixed(0)} ms ${Heat.worker ? '(Worker)' : '(hilo principal)'} · ${S.rv.length} segmentos de rayo · calidad ${S.quality === 'auto' ? 'auto→' + (S.autoQ || 'high') : S.quality}`; }
  const forceDraw = dirty || hmD; if (dirty) { dirty = 0; recompute(); }
  if (hmD && (!S.drag || now - lh > 220)) { hmD = 0; lh = now; heatKick(); }
  const vis = S.spd * 20 * S.spdMul, mx = Math.max(...S.paths.P.map(p => p.len), 1) + 3; S.mx = mx;
  if (!S.paused) S.d0 += dt * vis; S.dist = S.d0 % mx;
  if (now - lastScrub > 100 && !S.paused) { lastScrub = now; $('scrub').value = S.dist / mx * 1000; }
  if (S.mode === '3d') stepCamera(dt);
  Viz.tick(dt); uiBusy(now);
  /* Con la animación en pausa y sin interacción se dibuja a ~20 cuadros/s: menos CPU y batería (7.1) */
  const idleLoop = S.paused && !S.drag && !ptrs.size && !camMoving() && !hmFading() && !S.camAnim && !S.xfade && !(S.enterT && now - S.enterT < 1600) && !forceDraw;
  if (!idleLoop || now - lastDraw > 48) {
    lastDraw = now; S.mode === '2d' ? draw2D() : draw3D(); drawMini(); stepHL();
    if (S.xfade) {                                                                       // fundido cruzado 2D ↔ 3D
      const p = (now - S.xfade.t0) / S.xfade.dur;
      if (p >= 1) S.xfade = null; else { cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1 - FX.easeOut(p); cx.drawImage(S.xfade.img, 0, 0); cx.restore(); }
    }
  }
  requestAnimationFrame(loop);
}

