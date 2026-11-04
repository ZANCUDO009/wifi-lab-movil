/* Yeso con pintura de color · rodillo suave y pequeñas imperfecciones */
Textures.define('plaster', {
  tile: 1, alpha: .94, bump: .12,
  draw(g, w, h, u) {
    g.fillStyle = '#d9a9a0'; g.fillRect(0, 0, w, h);
    u.scatter(160, (g, x, y, a, b) => { g.fillStyle = b > .5 ? 'rgba(255,235,230,.12)' : 'rgba(120,60,60,.09)'; g.beginPath(); g.ellipse(x, y, 10 + a * 26, 5 + a * 12, a * 3, 0, 7); g.fill(); });
    g.fillStyle = 'rgba(80,40,40,.18)'; g.fillRect(0, h - 6, w, 6);   // zócalo
    u.grain(6);
  }
});
