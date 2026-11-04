/* Ladrillo visto blanco · pintado, con juntas grises */
Textures.define('brick_white', {
  tile: 1, alpha: .94, bump: .6,
  draw(g, w, h, u) {
    g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, w, h);
    const rows = 12, bh = h / rows, bw = w / 4;
    for (let j = 0; j < rows; j++) for (let i = -1; i < 4; i++) {
      const x = i * bw + (j % 2 ? bw / 2 : 0) + 2, y = j * bh + 2, ww = bw - 4, hh = bh - 4, l = u.rr(86, 94);
      g.fillStyle = u.hsl(40, 10, l); g.fillRect(x, y, ww, hh);
      const gr = g.createLinearGradient(x, y, x, y + hh); gr.addColorStop(0, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(60,50,40,.12)'); g.fillStyle = gr; g.fillRect(x, y, ww, hh);
      for (let n = 0; n < 10; n++) { g.fillStyle = 'rgba(90,80,70,.14)'; g.fillRect(x + u.r() * ww, y + u.r() * hh, 1 + u.r() * 2, 1 + u.r() * 2); }
    }
    u.grain(6);
  }
});
