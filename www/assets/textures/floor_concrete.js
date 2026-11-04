/* SUELO · concreto pulido con juntas de dilatación */
Textures.define('floor_concrete', {
  tile: 2, alpha: 1, bump: .12,
  draw(g, w, h, u) {
    g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, w, h);
    u.scatter(60, (g, x, y, a, b) => { const gr = g.createRadialGradient(x, y, 2, x, y, 30 + a * 40); gr.addColorStop(0, b > .5 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 70, y - 70, 140, 140); });
    g.strokeStyle = 'rgba(30,40,50,.5)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.strokeStyle = 'rgba(30,40,50,.22)'; g.stroke();
    u.grain(9);
  }
});
