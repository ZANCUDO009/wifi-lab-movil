/* SUELO · baldosa cerámica 50×50 cm con junta */
Textures.define('floor_tile', {
  tile: 1, alpha: 1, bump: .25,
  draw(g, w, h, u) {
    g.fillStyle = '#8c93a0'; g.fillRect(0, 0, w, h);
    const n = 2, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = u.hsl(215, u.rr(6, 12), u.rr(72, 80)); g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
      const gr = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(0,0,0,.1)'); g.fillStyle = gr; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
    }
    u.grain(5);
  }
});
