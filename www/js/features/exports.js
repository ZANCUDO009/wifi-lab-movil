/* ── Exportaciones: PNG, portapapeles, SVG ── */
ACT.png = () => { cv.toBlob(b => dl(b, 'wifi_lab_plano.png')); };
ACT.copyPng = () => { if (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) { cv.toBlob(b => dl(b, 'wifi_lab_plano.png')); return; } cv.toBlob(b => { try { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(() => hint('Imagen copiada'), () => hint('El navegador no permitió copiar la imagen')); } catch (e) { hint('Copiar imagen no está disponible aquí'); } }); };
ACT.svg = () => {
  const sc = 40, w = S.W * sc, h = S.H * sc, pt = q => `${(q.x * sc).toFixed(1)},${(q.y * sc).toFixed(1)}`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Segoe UI,Arial" font-size="12"><rect width="${w}" height="${h}" fill="#fff"/>`;
  if (S.layers.heat && hmc.width) s += `<image href="${hmc.toDataURL('image/png')}" width="${w}" height="${h}" preserveAspectRatio="none" opacity=".85" style="image-rendering:auto"/>`;
  for (let x = 0; x <= S.W; x++) s += `<line x1="${x * sc}" y1="0" x2="${x * sc}" y2="${h}" stroke="#e5e9ef"/>`; for (let y = 0; y <= S.H; y++) s += `<line x1="0" y1="${y * sc}" x2="${w}" y2="${y * sc}" stroke="#e5e9ef"/>`;
  S.paths.P.forEach((p, i) => { s += `<polyline points="${p.pts.map(pt).join(' ')}" fill="none" stroke="${i ? '#d89000' : '#0b62c4'}" stroke-width="${i === S.pi ? 3 : 1.5}"${i ? '' : ' stroke-dasharray="7 5"'}/>`; });
  S.walls.forEach(wl => wallPieces(wl).forEach(p => { s += `<line x1="${p[0] * sc}" y1="${p[1] * sc}" x2="${p[2] * sc}" y2="${p[3] * sc}" stroke="${MAT[wl.m].c}" stroke-width="${3 + wl.th / 10}" stroke-linecap="round"><title>${esc(MAT[wl.m].n)}</title></line>`; }));
  S.aps.forEach((a, i) => { s += `<circle cx="${a.x * sc}" cy="${a.y * sc}" r="9" fill="#2f7fe0" stroke="#fff" stroke-width="2"/><text x="${a.x * sc}" y="${a.y * sc + 24}" text-anchor="middle" fill="#0b62c4">${esc(apLabel(i))}</text>`; });
  s += `<circle cx="${S.rx.x * sc}" cy="${S.rx.y * sc}" r="9" fill="#17b88a" stroke="#fff" stroke-width="2"/><text x="${S.rx.x * sc}" y="${S.rx.y * sc + 24}" text-anchor="middle" fill="#07806a">Dispositivo (Rx) ${S.paths.tot.toFixed(1)} dBm</text></svg>`;
  dl(new Blob([s], { type: 'image/svg+xml' }), 'wifi_lab_plano.svg');
};

