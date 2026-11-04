/* SUELO · alfombra de oficina (fibra corta, azul grisáceo) */
Textures.define('floor_carpet', {
  tile: 1, alpha: 1, bump: .5,
  draw(g, w, h, u) {
    g.fillStyle = '#56627a'; g.fillRect(0, 0, w, h);
    u.scatter(2600, (g, x, y, a, b) => { g.fillStyle = b > .5 ? 'rgba(190,205,230,.20)' : 'rgba(10,15,30,.22)'; g.fillRect(x, y, 1.4, 1.4 + a * 2.5); });
    u.grain(11);
  }
});
