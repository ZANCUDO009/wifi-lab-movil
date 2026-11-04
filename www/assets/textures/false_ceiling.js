/* Techo falso / panel ligero · baldosas 60×60 con perfil T y perforado */
Textures.define('false_ceiling', {
  tile: 1.2, alpha: .93, bump: .3,
  draw(g, w, h, u) {
    g.fillStyle = '#e4e7ec'; g.fillRect(0, 0, w, h);
    const n = 2, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = 'rgba(90,100,115,.22)';
      for (let k = 0; k < 70; k++) g.fillRect(i * s + 8 + u.r() * (s - 16), j * s + 8 + u.r() * (s - 16), 1.6, 1.6);
    }
    g.fillStyle = '#f7f8fa'; g.fillRect(0, 0, w, 4); g.fillRect(0, 0, 4, h); g.fillRect(w / 2 - 2, 0, 4, h); g.fillRect(0, h / 2 - 2, w, 4);
    g.strokeStyle = 'rgba(60,70,85,.4)'; g.lineWidth = 1; g.strokeRect(2, 2, w - 4, h - 4);
    u.grain(4);
  }
});
