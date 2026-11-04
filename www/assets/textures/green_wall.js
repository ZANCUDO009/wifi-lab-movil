/* Pared verde · hojas superpuestas (jardín vertical) */
Textures.define('green_wall', {
  tile: 1, alpha: .96, bump: .5,
  draw(g, w, h, u) {
    g.fillStyle = '#2f5a2b'; g.fillRect(0, 0, w, h);
    for (let layer = 0; layer < 3; layer++) u.scatter(150, (g, x, y, a, b, c) => {
      const ang = a * 6.28, l = u.rr(22, 44) * (1 - layer * .15), len = 10 + b * 16;
      g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = u.hsl(90 + c * 40, u.rr(40, 65), l + layer * 6);
      g.beginPath(); g.ellipse(0, 0, len, len * .45, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,30,0,.35)'; g.lineWidth = .8; g.beginPath(); g.moveTo(-len, 0); g.lineTo(len, 0); g.stroke(); g.restore();
    });
    u.grain(6);
  }
});
