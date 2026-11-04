/* ── Acciones ── */
const resetView = () => { S.vz = 1; S.vx = S.W / 2; S.vy = S.H / 2; S.zoom = S.zoomT = 1; S.p3x = S.p3y = 0; };
function preset(k) {
  const p = PRE[k]; if (!p) return;
  S.preset = k; S.W = 20; S.H = 14; S.walls = p.w.map((w, i) => wallNew(i + 1, w[0], w[1], w[2], w[3], w[4], 0, (w[5] || []).map(a => ({ a: a[0], b: a[1] }))));
  const ch = Phys.band(S.f).ch;
  S.aps = [apNew(p.tx[0], p.tx[1], { ch: ch[0] }), ...(p.ex || []).map((e, i) => apNew(e[0], e[1], { ch: ch[(i + 1) % ch.length] }))];
  S.rx = { x: p.rx[0], y: p.rx[1] }; S.apSel = 0; S.sel = null; S.pi = 0; S.ruler = null; S.target = null; S.floor = 'auto'; S.enterT = performance.now(); S.ghost = null; S.rxTrail = []; resetView(); touch(); panelsRefresh(); logEv('Escenario: ' + p.n); commit();
}
ACT.reset = () => { preset(S.preset); };
ACT.swap = () => { const t = { x: S.aps[0].x, y: S.aps[0].y }; S.aps[0].x = S.rx.x; S.aps[0].y = S.rx.y; S.rx = t; touch(); };
ACT.undo = undo; ACT.redo = redo;
ACT.mode = m => {
  const was = S.mode;
  if (was && was !== m && FX.motion() && cv && cv.width) {                                  // fundido cruzado entre 2D y 3D (5.1)
    const sn = document.createElement('canvas'); sn.width = cv.width; sn.height = cv.height; sn.getContext('2d').drawImage(cv, 0, 0); S.xfade = { img: sn, t0: performance.now(), dur: 380 };
  }
  S.mode = m; $('b2').setAttribute('aria-pressed', m == '2d'); $('b3').setAttribute('aria-pressed', m == '3d'); $('b2').classList.toggle('on', m == '2d'); $('b3').classList.toggle('on', m == '3d');
  document.body.classList.toggle('m3d', m === '3d');
  if (m === '3d' && was === '2d') { S.yaw = 0; S.pit = 1.5; S.vyaw = S.vpit = 0; view3('iso'); }                // la cámara «se inclina» al entrar en 3D
};
ACT.theme = () => themePicker();
ACT.view3 = k => view3(k);
ACT.surf = () => { S.surf = S.surf ? 0 : 1; const b = $('bSurf'); b.setAttribute('aria-pressed', !!S.surf); b.classList.toggle('on', !!S.surf); b.textContent = S.surf ? 'Superficie' : 'Plano'; if (S.surf && !S.layers.heat) hint('Activa «Mapa de calor» para ver la superficie'); };
ACT.orbit = () => { S.orbit = !S.orbit; $('bOrb').setAttribute('aria-pressed', !!S.orbit); $('bOrb').classList.toggle('on', !!S.orbit); };
ACT.fsz = d => { applyFont(S.fscale + .1 * d); };
ACT.menu = (k, b) => openMenu(k, b);
ACT.pause = () => { S.paused = !S.paused; $('bp').textContent = S.paused ? '▶' : '⏸'; };
ACT.astep = () => { S.paused = 1; $('bp').textContent = '▶'; S.d0 += .5; };
ACT.arst = () => { S.d0 = 0; };
ACT.aspd = v => { S.spdMul = +v; hint('Velocidad de animación ×' + v); };
ACT.zoom = d => {
  if (S.mode === '3d') { S.zoomT = d == 0 ? 1 : clamp((S.zoomT || S.zoom) * (d > 0 ? 1.25 : .8), .4, 4); if (d == 0) { S.p3x = S.p3y = 0; view3('iso'); } return; }
  if (d == 0) return resetView(); zoomAt(d > 0 ? 1.3 : 1 / 1.3, W0 / 2, H0 / 2);
};
function zoomAt(f, px, py) {
  const wx = (px - S.ox) / S.sc, wy = (py - S.oy) / S.sc; S.vz = clamp(S.vz * f, 1, 12);
  viewXform(); S.vx = wx - (px - W0 / 2) / S.sc; S.vy = wy - (py - H0 / 2) / S.sc; clampView();
}
function clampView() { S.vx = clamp(S.vx, 0, S.W); S.vy = clamp(S.vy, 0, S.H); if (S.vz <= 1.001) { S.vx = S.W / 2; S.vy = S.H / 2; } }
ACT.drawer = id => { const a = $(id), o = a.classList.contains('open'); $('L').classList.remove('open'); $('R').classList.remove('open'); if (!o) a.classList.add('open'); };
ACT.apSel = i => { S.apSel = +i; panelsRefresh(); };
ACT.addAP = () => {
  if (S.aps.length >= 8) return hint('Máximo 8 equipos');
  const ch = Phys.band(S.f).ch, k = S.aps.length; S.aps.push(apNew(clamp(S.W * (.2 + .2 * (k % 4)), 1, S.W - 1), S.H * (k % 2 ? .3 : .7), { ch: ch[k % ch.length] })); S.apSel = k; touch(); panelsRefresh(); logEv('Se añadió ' + apLabel(k));
};
ACT.addInt = () => { if (S.aps.length >= 8) return hint('Máximo 8 equipos'); const k = S.aps.length, b = Phys.band(S.f); S.aps.push(apNew(S.W * .6, S.H * .5, { srv: false, pt: 17, ch: b.ch[Math.min(1, b.ch.length - 1)], eq: 'custom' })); S.apSel = k; touch(); panelsRefresh(); hint('Interferente añadido: simula un vecino o un microondas'); };
ACT.delAP = () => { if (S.aps.length < 2) return hint('Debe quedar al menos un equipo'); S.aps.splice(S.apSel, 1); S.apSel = Math.min(S.apSel, S.aps.length - 1); touch(); panelsRefresh(); };
ACT.apFail = () => { const a = S.aps[S.apSel]; a.on = a.on === false; touch(); panelsRefresh(); logEv(apLabel(S.apSel) + (a.on ? ' repuesto' : ' en falla')); hint(a.on ? 'AP repuesto' : 'Falla simulada: observa qué zonas pierden cobertura'); };
ACT.autoCh = () => { const ch = Phys.assignChannels(S); S.aps.forEach((a, i) => a.ch = ch[i]); touch(); panelsRefresh(); hint('Canales asignados: ' + ch.join(', ')); };
ACT.pth = i => { S.pi = +i; lastSlow = 0; uiSlow(); };
ACT.selWall = id => { S.sel = +id; wallUI(); };
ACT.addWall = () => { const id = nextWallId(); S.walls.push(wallNew(id, S.W * .25, S.H * .2, S.W * .25, S.H * .7, 'brick')); S.sel = id; touch(); wallUI(); };
ACT.delWall = () => { S.walls = S.walls.filter(w => w.id !== S.sel); S.sel = null; touch(); wallUI(); };
ACT.addOp = () => { const w = S.walls.find(w => w.id === S.sel); if (!w) return; if ((w.op || []).length >= 6) return; (w.op = w.op || []).push({ a: .4, b: .55 }); touch(); wallUI(); };
ACT.delOp = i => { const w = S.walls.find(w => w.id === S.sel); if (w) { w.op.splice(+i, 1); touch(); wallUI(); } };
ACT.tool = t => { S.tool = (S.tool === t ? '' : t); S.ruler = null; panelsRefresh(); closeMenus(); hint(S.tool === 'wall' ? 'Pared: arrastra en el plano (Mayúscula = ángulo libre)' : S.tool === 'ruler' ? 'Regla: haz clic en dos puntos' : 'Modo mover'); };
ACT.leg = () => { const l = $('leg'), on = l.style.display !== 'block'; l.style.display = on ? 'block' : 'none'; $('bLeg').setAttribute('aria-pressed', on); legHTML(); };
ACT.snd = () => { sound.on = !sound.on; $('bSnd').setAttribute('aria-pressed', sound.on); $('bSnd').textContent = sound.on ? '🔊' : '🔈'; sound.toggle(); };
ACT.saveJ = () => { dl(new Blob([JSON.stringify(scenarioObj(), null, 1)], { type: 'application/json' }), 'escenario_wifi.json'); closeMenus(); };
ACT.loadJ = () => { closeMenus(); $('fl').click(); };
ACT.share = () => { closeMenus(); shareLink(); };
ACT.planPick = () => { closeMenus(); $('plf').click(); };
ACT.csvPick = () => { closeMenus(); $('csvf').click(); };
ACT.measClear = () => { S.meas = []; touch(); closeMenus(); hint('Mediciones borradas'); };
ACT.help = () => helpModal();
ACT.welcome = () => welcome();
function dl(blob, name) {
  /* App Android (Capacitor): el WebView no descarga blobs; se guarda en caché y se abre «Compartir/Guardar». */
  const C = window.Capacitor, P = C && C.Plugins;
  if (C && C.isNativePlatform && C.isNativePlatform() && P && P.Filesystem && P.Share) {
    const fr = new FileReader();
    fr.onload = async () => {
      try {
        const r = await P.Filesystem.writeFile({ path: name, data: String(fr.result).split(',')[1], directory: 'CACHE' });
        await P.Share.share({ title: name, url: r.uri, dialogTitle: 'Guardar o compartir ' + name });
      } catch (e) { if (!/cancel/i.test(String(e && e.message))) hint('No se pudo exportar el archivo'); }
    };
    fr.readAsDataURL(blob); return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

