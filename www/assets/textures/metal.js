/* Metal / espejo · lámina acanalada de acero cepillado con remaches */
Textures.define('metal', {
  tile: 1, alpha: .96, bump: 0.2,
  draw(g, w, h, u) {
    const ridges = 8, rw = w / ridges;
    for (let i = 0; i < ridges; i++) {                                                  // acanalado: luz-sombra-luz en cada cresta
      const gr = g.createLinearGradient(i * rw, 0, (i + 1) * rw, 0);
      gr.addColorStop(0, '#5f7388'); gr.addColorStop(.35, '#cfe2f3'); gr.addColorStop(.55, '#8fb2d0'); gr.addColorStop(1, '#4c5f73');
      g.fillStyle = gr; g.fillRect(i * rw, 0, rw + 1, h);
    }
    u.scatter(420, (g, x, y, a, b) => { g.fillStyle = b > .5 ? 'rgba(255,255,255,.18)' : 'rgba(10,25,45,.18)'; g.fillRect(x, y, 14 + a * 90, 1); });   // cepillado horizontal
    for (const y of [14, 242]) for (let i = 0; i < ridges; i++) {                       // remaches
      const x = i * rw + rw * .45;
      g.fillStyle = 'rgba(0,20,40,.5)'; g.beginPath(); g.arc(x + 1, y + 1.5, 4.2, 0, 7); g.fill();
      const rg = g.createRadialGradient(x - 1.5, y - 1.5, .5, x, y, 4.5); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, '#6d8399'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
    }
    u.grain(8);
  }
});
