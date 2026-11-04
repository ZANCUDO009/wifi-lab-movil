/* Madera oscura · tablones verticales de nogal con vetas */
Textures.define('wood_dark', {
  tile: 1, alpha: .96, bump: .4,
  draw(g, w, h, u) {
    const n = 5, bw = w / n;
    for (let i = 0; i < n; i++) {
      const l = u.rr(18, 27); g.fillStyle = u.hsl(u.rr(18, 26), u.rr(40, 55), l); g.fillRect(i * bw, 0, bw, h);
      for (let k = 0; k < 22; k++) { const x = i * bw + u.r() * bw; g.strokeStyle = u.hsl(22, 45, u.rr(10, 32), .35); g.lineWidth = u.rr(.5, 1.6); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + u.rr(-5, 5), h * .3, x + u.rr(-5, 5), h * .7, x + u.rr(-3, 3), h); g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(i * bw, 0, 1.5, h);
    }
    u.grain(7);
  }
});
