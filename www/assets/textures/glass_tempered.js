/* Cristal templado · verde azulado, borde grueso y reflejos diagonales */
Textures.define('glass_tempered', {
  tile: 1, alpha: .42,
  draw(g, w, h, u) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(170,225,240,.75)'); gr.addColorStop(1, 'rgba(110,190,215,.55)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.28)';
    [[0, .22, .1], [.42, .62, .06], [.78, .86, .04]].forEach(([a, b]) => { g.beginPath(); g.moveTo(w * a, 0); g.lineTo(w * b, 0); g.lineTo(w * (b - .35), h); g.lineTo(w * (a - .35), h); g.closePath(); g.fill(); });
    g.strokeStyle = 'rgba(40,120,140,.55)'; g.lineWidth = 5; g.strokeRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,120,140,.75)'; [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 3.2, 0, 7); g.fill(); });   // herrajes
  }
});
