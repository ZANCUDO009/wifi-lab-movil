/* Ladrillo · aparejo a soga (running bond), 4 ladrillos por metro */
Textures.define('brick', {
  tile: 1, alpha: .94, bump: 0.55,
  draw(g, w, h, u) {
    g.fillStyle = '#cdbfa6'; g.fillRect(0, 0, w, h); u.grain(16);            // mortero
    const rows = 12, bh = h / rows, bw = w / 4;
    for (let j = 0; j < rows; j++) for (let i = -1; i < 4; i++) {
      const x = i * bw + (j % 2 ? bw / 2 : 0) + 2, y = j * bh + 2, ww = bw - 4, hh = bh - 4;
      const hue = u.rr(6, 20), l = u.rr(36, 50), burnt = u.r() < .08;
      g.fillStyle = u.hsl(hue, u.rr(55, 72), burnt ? 26 : l); g.fillRect(x, y, ww, hh);
      const gr = g.createLinearGradient(x, y, x, y + hh);                      // volumen: luz arriba, sombra abajo
      gr.addColorStop(0, 'rgba(255,220,190,.30)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,0,0,.32)');
      g.fillStyle = gr; g.fillRect(x, y, ww, hh);
      for (let n = 0; n < 26; n++) { g.fillStyle = u.r() < .5 ? 'rgba(60,15,5,.28)' : 'rgba(255,200,160,.22)'; g.fillRect(x + u.r() * ww, y + u.r() * hh, 1 + u.r() * 2, 1 + u.r() * 2); }
    }
    u.grain(10);
  }
});
