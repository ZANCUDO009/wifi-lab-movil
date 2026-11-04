/* ── Mapa de calor: pintura de la imagen según el modo elegido ──
   hmc  = imagen «de datos» (1 píxel por celda; la usan 3D, informe y SVG)
   hmS  = versión suavizada para mostrar (escalado por pasos con calidad alta)
   El cálculo vive en js/engine/heatmap-engine.js; aquí solo se PINTA. */
const HMODES = {
  rssi: { n: 'Potencia recibida (dBm)', lo: '−90', hi: '−40', marks: [[-90, '−90'], [-67, '−67'], [-50, '−50'], [-40, '−40 dBm']] },
  sinr: { n: 'SNR / SINR (dB)', lo: '0', hi: '45', marks: [[0, '0'], [10, '10'], [25, '25'], [45, '45 dB']] },
  mbps: { n: 'Velocidad útil (Mbps)', lo: '0', hi: 'máx.', marks: [] },
  cnt: { n: 'Nº de AP que cubren (≥ −70 dBm)', lo: '0', hi: '3+' },
  qual: { n: 'Calidad por aplicación', lo: '', hi: '' }
};
const CNTC = [[60, 10, 30], [200, 150, 40], [40, 170, 120], [60, 140, 230]];
const QUALC = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
const hmS = document.createElement('canvas'), hmSP = document.createElement('canvas'), hmMix = document.createElement('canvas'), hmTmp = document.createElement('canvas');
let hmKey = '', hmFade = null;
/** Escala hmc → hmS en dos pasos con suavizado de alta calidad (≈ bicúbico), a un tamaño que solo depende del plano. */
function hmSmooth() {
  const sc = Math.min(24, 960 / Math.max(S.W, S.H)), tw = Math.max(2, Math.round(S.W * sc)), th = Math.max(2, Math.round(S.H * sc));
  hmS.width = tw; hmS.height = th; const g = hmS.getContext('2d');
  g.imageSmoothingEnabled = FX.q() > 0 && !/^(cnt|qual)$/.test(S.hmMode); g.imageSmoothingQuality = 'high';
  if (g.imageSmoothingEnabled && hmc.width * 4 < tw) {            // paso intermedio ×4 para evitar la «escalera» al ampliar
    hmTmp.width = hmc.width * 4; hmTmp.height = hmc.height * 4; const t = hmTmp.getContext('2d'); t.imageSmoothingEnabled = true; t.imageSmoothingQuality = 'high'; t.drawImage(hmc, 0, 0, hmTmp.width, hmTmp.height); g.drawImage(hmTmp, 0, 0, tw, th);
  } else g.drawImage(hmc, 0, 0, tw, th);
}
/** Imagen a mostrar: la nueva, o una mezcla suave con la anterior durante ~280 ms (sin parpadeo al arrastrar). */
function hmShow() {
  if (!hmFade) return hmS;
  const p = (performance.now() - hmFade) / 280;
  if (p >= 1 || hmSP.width !== hmS.width || hmSP.height !== hmS.height) { hmFade = null; return hmS; }
  if (hmMix.width !== hmS.width || hmMix.height !== hmS.height) { hmMix.width = hmS.width; hmMix.height = hmS.height; }
  const g = hmMix.getContext('2d'); g.globalAlpha = 1; g.clearRect(0, 0, hmMix.width, hmMix.height); g.drawImage(hmSP, 0, 0); g.globalAlpha = FX.easeOut(p); g.drawImage(hmS, 0, 0); g.globalAlpha = 1;
  return hmMix;
}
const hmFading = () => !!hmFade && performance.now() - hmFade < 300;
function hmPaint(force) {
  const g = S.grid; if (!g) return;
  const key = g.st + '|' + g.nx + S.hmMode + S.theme + (S.hmPal || '') + g.tot[0] + g.tot[g.tot.length >> 1] + g.tot[g.tot.length >> 2];
  if (!force && key === hmKey) return; hmKey = key;
  if (S.layers.heat && hmS.width && FX.motion()) { hmSP.width = hmS.width; hmSP.height = hmS.height; hmSP.getContext('2d').drawImage(hmS, 0, 0); hmFade = performance.now(); }
  hmc.width = g.nx; hmc.height = g.ny;
  const c = hmc.getContext('2d', { willReadFrequently: true }), im = c.createImageData(g.nx, g.ny), N = g.nx * g.ny;
  const maxM = Phys.RATE[11] * Phys.BWF[S.bw] * 4 * .6 || 1; S._maxM = maxM;
  const pc = t => FX.palCol(t);
  for (let k = 0; k < N; k++) {
    let col;
    if (S.hmMode === 'rssi') col = pc((g.tot[k] + 90) / 50);
    else if (S.hmMode === 'sinr') col = pc(clamp(g.sinr[k] / 45, 0, 1));
    else if (S.hmMode === 'mbps') { const a = S.aps[g.best[k]], l = Phys.link({ bw: S.bw, nf: S.nf, ns: a ? a.ns : S.ns, nsC: S.nsC }, g.tot[k], g.sinr[k], a ? Phys.BH[a.bh || 'cable'] : 1); col = pc(clamp(l.use / maxM, 0, 1)); }
    else if (S.hmMode === 'cnt') col = CNTC[Math.min(3, g.cnt[k])];
    else { const t = g.tot[k]; col = QUALC[t >= -67 ? 4 : t >= -70 ? 3 : t >= -75 ? 2 : t >= -82 ? 1 : 0]; }
    im.data.set([col[0], col[1], col[2], 255], k * 4);
  }
  c.putImageData(im, 0, 0);
  hmSmooth();
  S._cont = null; S.hmRev = (S.hmRev || 0) + 1;
}
function hmPart() { hmPaint(); S.cov = Phys.kpis(S, S.grid); S.covStale = 0; uiCov(); uiHero(); }
function hmDone() { uiCov(); uiHero(); if (typeof missionTick === 'function') missionTick(); }
