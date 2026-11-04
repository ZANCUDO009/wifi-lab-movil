/* Vidrio con película metálica · espejado teal/dorado, marco oscuro */
Textures.define('glass_film', {
  tile: 1, alpha: .82,
  draw(g, w, h, u) {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#2d6f93'); gr.addColorStop(.35, '#6fc3de'); gr.addColorStop(.55, '#3b86a8'); gr.addColorStop(.8, '#d6b45c'); gr.addColorStop(1, '#2d6f93');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    u.wrap(g => { g.rotate(-.7); for (const [x, wd, a] of [[40, 50, .22], [140, 10, .5], [190, 26, .18]]) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(x, -400, wd, 1200); } });
    for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,30,50,.06)'; g.fillRect(0, y, w, 1); }   // trama de la película
    g.fillStyle = '#26323d'; g.fillRect(0, 0, w, 8); g.fillRect(0, 0, 8, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 8, w, 1.5); g.fillRect(8, 0, 1.5, h);
    u.grain(8);
  }
});
