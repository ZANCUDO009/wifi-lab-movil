/* Cuerpo humano / persona · piel con variaciones suaves de tono y poros finos */
Textures.define('body', {
  tile: 1, alpha: .92,
  draw(g, w, h, u) {
    g.fillStyle = '#e6a99a'; g.fillRect(0, 0, w, h);
    u.scatter(30, (g, x, y, a, b) => { const r = 24 + a * 56, gr = g.createRadialGradient(x, y, 0, x, y, r); const c = b < .33 ? '255,215,195' : b < .66 ? '210,110,110' : '170,95,80'; gr.addColorStop(0, `rgba(${c},.22)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
    u.scatter(700, (g, x, y, a) => { g.fillStyle = 'rgba(120,50,45,.22)'; g.fillRect(x, y, 1, 1 + a); });
    u.grain(7);
  }
});
