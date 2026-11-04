/* Mármol · fondo claro con venas diagonales suaves */
Textures.define('marble', {
  tile: 1, alpha: .95, bump: .12,
  draw(g, w, h, u) {
    g.fillStyle = '#ece8f2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {                                  // manchas de tono
      const x = u.r() * w, y = u.r() * h, gr = g.createRadialGradient(x, y, 4, x, y, 90);
      gr.addColorStop(0, u.hsl(260, 12, u.rr(78, 90), .5)); gr.addColorStop(1, 'rgba(236,232,242,0)');
      u.wrap(gg => { gg.fillStyle = gr; gg.fillRect(x - 90, y - 90, 180, 180); });
    }
    for (let v = 0; v < 7; v++) {                                  // venas
      u.wrap(gg => {
        let x = u.r() * w, y = 0; gg.beginPath(); gg.moveTo(x, y);
        for (let s = 0; s < 14; s++) { x += u.rr(-18, 22); y += h / 13; gg.lineTo(x, y); }
        gg.strokeStyle = u.hsl(255, 10, u.rr(40, 62), u.rr(.12, .4)); gg.lineWidth = u.rr(.6, 2.2); gg.stroke();
      });
    }
    g.strokeStyle = 'rgba(80,70,100,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);   // junta de la losa
    u.grain(5);
  }
});
