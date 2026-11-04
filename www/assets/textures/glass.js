/* Vidrio simple · transparente, con reflejos diagonales y marco de aluminio cada metro */
Textures.define('glass', {
  tile: 1, alpha: .55,
  draw(g, w, h, u) {
    g.fillStyle = 'rgba(140,215,240,.40)'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(200,240,255,.28)'); gr.addColorStop(1, 'rgba(60,150,200,.20)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    u.wrap(g => {                                                                      // brillos diagonales
      g.rotate(-.6);
      for (const [x, wd, a] of [[60, 34, .28], [110, 8, .5], [170, 18, .2], [-30, 22, .22]]) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(x, -400, wd, 1200); }
    });
    g.fillStyle = 'rgba(225,238,248,.95)'; g.fillRect(0, 0, w, 7); g.fillRect(0, 0, 7, h);   // marco
    g.fillStyle = 'rgba(40,70,100,.55)'; g.fillRect(0, 7, w, 1.5); g.fillRect(7, 0, 1.5, h);
    g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(0, 0, w, 1.5); g.fillRect(0, 0, 1.5, h);
  }
});
