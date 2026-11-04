/* ── Inicio ── */
onload = () => {
  cv = $('cv'); cx = cv.getContext('2d');
  applyTheme(Store.get('theme', 'dark')); applyFont(Store.get('fscale', 1)); applyMotion(Store.get('nomotion', 0)); S.hmPal = Store.get('hmPal', 'viridis');
  S.level = Store.get('level', 'i'); S.quality = Store.get('quality', 'auto'); S.client = 'laptop'; S.nsC = 2; S.zoomT = S.zoom;
  buildPanels(); buildMenus(); events0(); polishInit();
  ACT.mode('2d');
  if (!loadFromHash()) preset('dept2'); else { S.preset = ''; panelsRefresh(); }
  S.hintRings = true; hmD = 1; commit(); lastSnap = snapState();
  document.querySelectorAll('details.card').forEach(d => { if (innerWidth < 900 && d.id !== 'cEsc' && d.id !== 'cAP') d.open = false; });
  if (!Store.get('seen', 0)) setTimeout(welcome, 400);
  /** API pública del motor: se puede probar desde la consola del navegador (SW-23). */
  window.WifiSim = { Phys, Tests, compute: (scene, rx, mode) => Phys.calc(scene, rx, mode), scene: () => S };
  requestAnimationFrame(loop);
};

