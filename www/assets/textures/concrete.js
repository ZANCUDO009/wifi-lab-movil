/* Concreto armado · manchas, poros, juntas de encofrado y orificios de tensores */
Textures.define('concrete', {
  tile: 1, alpha: .95, bump: 0.45,
  draw(g, w, h, u) {
    g.fillStyle = '#8a95a3'; g.fillRect(0, 0, w, h);
    u.scatter(26, (g, x, y, a, b) => { const r = 30 + a * 60, gr = g.createRadialGradient(x, y, 0, x, y, r); const c = b > .5 ? '255,255,255' : '30,40,55'; gr.addColorStop(0, `rgba(${c},.16)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
    u.scatter(900, (g, x, y, a, b) => { g.fillStyle = b > .55 ? 'rgba(235,240,245,.42)' : 'rgba(25,30,40,.38)'; g.beginPath(); g.arc(x, y, .5 + a * 1.8, 0, 7); g.fill(); });
    u.scatter(40, (g, x, y, a) => { g.fillStyle = 'rgba(15,20,30,.55)'; g.beginPath(); g.arc(x, y, 1.5 + a * 2.5, 0, 7); g.fill(); });   // poros
    g.fillStyle = 'rgba(10,15,25,.55)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);                                              // juntas
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(0, 2, w, 1.5); g.fillRect(2, 0, 1.5, h);
    for (const [x, y] of [[64, 64], [192, 64], [64, 192], [192, 192]]) {                                                              // tensores
      g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.arc(x + 1, y + 1.5, 7, 0, 7); g.fill();
      g.fillStyle = '#2a3340'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
      g.fillStyle = '#0d1219'; g.beginPath(); g.arc(x - 1, y - 1, 3.5, 0, 7); g.fill();
    }
    u.grain(14);
  }
});
