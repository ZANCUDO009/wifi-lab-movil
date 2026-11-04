/* Malla metálica · rombos entrelazados sobre fondo translúcido */
Textures.define('mesh', {
  tile: .5, alpha: .55,
  draw(g, w, h, u) {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(120,135,150,.18)'; g.fillRect(0, 0, w, h);
    const s = w / 8;
    for (let i = -8; i <= 16; i++) {
      for (const [col, lw] of [['rgba(40,50,62,.8)', 3], ['rgba(190,205,220,.95)', 1.3]]) {
        g.strokeStyle = col; g.lineWidth = lw;
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + h, h); g.moveTo(i * s, h); g.lineTo(i * s + h, 0); g.stroke();
      }
    }
  }
});
