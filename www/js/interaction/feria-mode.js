/* ── Modo feria (UX-30): pantalla completa, cursor oculto y pantalla encendida ── */
let wl = null, curT = 0;
ACT.feria = () => {
  const on = document.body.classList.toggle('feria'); closeMenus();
  try {
    if (on) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => { }); if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => wl = l).catch(() => { }); }
    else { if (document.fullscreenElement) document.exitFullscreen(); if (wl) { wl.release(); wl = null; } document.body.classList.remove('nocursor'); }
  } catch (e) { }
  if (on) hint('Modo feria: toca el router y arrástralo. Esc para salir.', 4000);
};
addEventListener('pointermove', () => { document.body.classList.remove('nocursor'); clearTimeout(curT); if (document.body.classList.contains('feria')) curT = setTimeout(() => document.body.classList.add('nocursor'), 4000); });

