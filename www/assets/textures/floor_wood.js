/* SUELO · tarima de madera clara en listones horizontales */
Textures.define('floor_wood', {
  tile: 1, alpha: 1, bump: .3,
  draw(g, w, h, u) {
    const rows = 6, rh = h / rows;
    for (let j = 0; j < rows; j++) {
      const cuts = [0, u.rr(.25, .5), u.rr(.55, .85), 1];
      for (let k = 0; k < 3; k++) {
        g.fillStyle = u.hsl(u.rr(30, 38), u.rr(35, 50), u.rr(58, 70)); const x0 = cuts[k] * w, x1 = cuts[k + 1] * w; g.fillRect(x0, j * rh, x1 - x0, rh);
        for (let n = 0; n < 7; n++) { g.strokeStyle = u.hsl(30, 40, u.rr(40, 55), .3); g.lineWidth = .8; const y = j * rh + u.r() * rh; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + (x1 - x0) / 3, y + u.rr(-2, 2), x0 + (x1 - x0) * .66, y + u.rr(-2, 2), x1, y); g.stroke(); }
        g.fillStyle = 'rgba(40,20,0,.4)'; g.fillRect(x0, j * rh, 1.2, rh);
      }
      g.fillStyle = 'rgba(40,20,0,.45)'; g.fillRect(0, j * rh, w, 1.4);
    }
    u.grain(5);
  }
});
