/* Madera / puerta · tablones verticales con vetas y nudos */
Textures.define('wood', {
  tile: 1, alpha: .95, bump: 0.35,
  draw(g, w, h, u) {
    const n = 4, pw = w / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * pw, hue = u.rr(24, 33), l = u.rr(30, 42);
      g.fillStyle = u.hsl(hue, u.rr(55, 70), l); g.fillRect(x0, 0, pw, h);
      for (let k = 0; k < 34; k++) {                                                   // vetas onduladas (periódicas en vertical)
        const bx = x0 + 3 + u.r() * (pw - 6), A = u.rr(1, 4), f = Math.ceil(u.rr(1, 3)), ph = u.r() * 6.28;
        g.beginPath(); for (let y = 0; y <= h; y += 4) { const x = bx + A * Math.sin(6.283 * f * y / h + ph); y ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = u.r() < .6 ? u.hsl(hue, 60, l - 14, u.rr(.12, .34)) : u.hsl(hue + 4, 70, l + 14, u.rr(.10, .22)); g.lineWidth = u.rr(.6, 1.8); g.stroke();
      }
      const ky = u.rr(30, h - 30), kx = x0 + u.rr(16, pw - 16);                        // nudo
      for (let r = 12; r > 1; r -= 2.5) { g.strokeStyle = u.hsl(hue, 55, l - 16 - (12 - r), .55); g.lineWidth = 1.2; g.beginPath(); g.ellipse(kx, ky, r * .7, r * 1.5, 0, 0, 7); g.stroke(); }
      g.fillStyle = 'rgba(40,18,6,.8)'; g.beginPath(); g.ellipse(kx, ky, 2.2, 4.5, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(30,12,4,.85)'; g.fillRect(x0, 0, 2, h);                      // juntas
      g.fillStyle = 'rgba(255,210,150,.22)'; g.fillRect(x0 + 2, 0, 1.5, h);
    }
    u.grain(10);
  }
});
