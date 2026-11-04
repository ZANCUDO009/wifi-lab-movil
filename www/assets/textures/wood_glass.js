/* Madera / vidrio (mezcla) · puerta o mampara con marco de madera y 4 cristales */
Textures.define('wood_glass', {
  tile: 1, alpha: .9,
  draw(g, w, h, u) {
    g.fillStyle = '#b4721f'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) { const y = u.r() * h; g.strokeStyle = u.r() < .5 ? 'rgba(80,35,5,.28)' : 'rgba(255,200,120,.20)'; g.lineWidth = u.rr(.6, 1.6); g.beginPath(); for (let x = 0; x <= w; x += 4) { const yy = y + 2 * Math.sin(6.283 * x / w + k); x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    for (const [x, y] of [[22, 22], [138, 22], [22, 138], [138, 138]]) {
      g.fillStyle = 'rgba(30,12,2,.65)'; g.fillRect(x - 3, y - 3, 102, 102);                  // bisel
      const gl = g.createLinearGradient(x, y, x + 96, y + 96); gl.addColorStop(0, '#bfeaf7'); gl.addColorStop(1, '#5aa9cf'); g.fillStyle = gl; g.fillRect(x, y, 96, 96);
      g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(x + 8, y + 88); g.lineTo(x + 56, y + 8); g.lineTo(x + 74, y + 8); g.lineTo(x + 26, y + 88); g.fill();
      g.strokeStyle = 'rgba(255,230,180,.55)'; g.lineWidth = 1.5; g.strokeRect(x - 2.5, y - 2.5, 101, 101);
    }
    u.grain(9);
  }
});
