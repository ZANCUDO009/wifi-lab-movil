/* Drywall · yeso pintado, tornillos en filas y junta con cinta */
Textures.define('drywall', {
  tile: 1, alpha: .92, bump: 0.25,
  draw(g, w, h, u) {
    g.fillStyle = '#d3d8df'; g.fillRect(0, 0, w, h);
    u.scatter(14, (g, x, y, a, b) => { const r = 50 + a * 70, gr = g.createRadialGradient(x, y, 0, x, y, r); const c = b > .5 ? '255,255,255' : '120,135,160'; gr.addColorStop(0, `rgba(${c},.14)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, 14, h);                    // cinta de junta
    g.fillStyle = 'rgba(80,95,120,.30)'; g.fillRect(0, 0, 1.5, h); g.fillRect(14, 0, 1.5, h);
    for (let y = 16; y < h; y += 48) for (const x of [60, 128, 196]) {                  // tornillos
      g.fillStyle = 'rgba(90,100,120,.45)'; g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - .8, y - .8, 1.2, 0, 7); g.fill();
    }
    u.scatter(500, (g, x, y, a) => { g.fillStyle = 'rgba(70,85,110,.22)'; g.fillRect(x, y, 1 + a, 1 + a); });
    u.grain(9);
  }
});
