/* ── Ubicación óptima de uno o varios AP (EJ-08), con progreso y cancelación ── */
let OPT = null, optCancel = 0;
function opt() {
  open_(`<h2>Ubicación óptima de los equipos</h2><p><small>Búsqueda en cuadrícula de 2 m con refinamiento local (1 reflexión, suma incoherente) que maximiza la potencia del 10 % peor del área y, en empate, la cobertura ≥ −67 dBm. Con varios AP se optimiza cada uno por turnos (2 pasadas) considerando al mejor servidor y la interferencia.</small></p><div class="btns"><button class="pri" data-a="optRun" data-p="one">Optimizar ${apLabel(S.apSel)}</button>${S.aps.filter(a => a.srv !== false).length > 1 ? '<button data-a="optRun" data-p="all">Optimizar todos los AP</button>' : ''}<button data-a="optStop">Detener</button></div><progress id="optp" max="1" value="0" style="width:100%;margin-top:.6rem" aria-label="Progreso"></progress><div id="optr"></div>`);
}
ACT.opt = opt; ACT.optStop = () => { optCancel = 1; };
ACT.optRun = async mode => {
  optCancel = 0;
  const sc = { ...S, aps: S.aps.map(a => ({ ...a })), walls: S.walls }, ks = sc.aps.map((a, i) => i).filter(i => sc.aps[i].on !== false && sc.aps[i].srv !== false), jobs = mode === 'one' ? [S.apSel] : [...ks, ...ks];
  if (mode === 'one' && sc.aps[S.apSel].srv === false) return hint('Selecciona un AP o el router principal');
  const before = Phys.evalLayout({ ...sc, bn: Math.min(sc.bn, 1) }, 2), base = sc.aps.map(a => ({ x: a.x, y: a.y }));
  for (let j = 0; j < jobs.length; j++) {
    const g = Phys.optimizeAP(sc, jobs[j]); let r, n = 0;
    do { r = g.next(); if (!r.done && ++n % 2 === 0) { $('optp').value = (j + r.value) / jobs.length; await new Promise(res => setTimeout(res, 0)); if (optCancel) { $('optr').innerHTML = '<p class="warnb">Búsqueda detenida.</p>'; return; } } } while (!r.done);
    sc.aps[jobs[j]].x = r.value.best.x; sc.aps[jobs[j]].y = r.value.best.y;
  }
  const after = Phys.evalLayout({ ...sc, bn: Math.min(sc.bn, 1) }, 2);
  OPT = { pos: sc.aps.map(a => ({ x: a.x, y: a.y })), before, after };
  $('optp').value = 1;
  $('optr').innerHTML = `<table><tr><th></th><th>Actual</th><th>Sugerida</th></tr><tr><td>10 % peor del área</td><td>${before.p10.toFixed(1)} dBm</td><td><b>${after.p10.toFixed(1)} dBm</b></td></tr><tr><td>Cobertura ≥ −67 dBm</td><td>${before.c.toFixed(1)} %</td><td><b>${after.c.toFixed(1)} %</b></td></tr><tr><td>Mediana</td><td>${before.med.toFixed(1)} dBm</td><td>${after.med.toFixed(1)} dBm</td></tr>${sc.aps.map((a, i) => (Math.hypot(a.x - base[i].x, a.y - base[i].y) > .05) ? `<tr><td>${apLabel(i)}</td><td>(${base[i].x.toFixed(1)}, ${base[i].y.toFixed(1)})</td><td><b>(${a.x.toFixed(1)}, ${a.y.toFixed(1)})</b></td></tr>` : '').join('')}</table><p>${after.p10 > before.p10 + .5 ? `Sin comprar nada, mover el equipo mejora <b>${(after.p10 - before.p10).toFixed(1)} dB</b> en la peor zona.` : 'La ubicación actual ya es casi óptima.'}</p><div class="btns"><button class="pri" data-a="optApply">Aplicar posiciones</button></div>`;
};
ACT.optApply = () => { if (!OPT) return; OPT.pos.forEach((p, i) => { S.aps[i].x = p.x; S.aps[i].y = p.y; }); touch(); commit(); closeM(); hint('Posiciones aplicadas (puedes deshacer con Ctrl+Z)'); logEv('Ubicación óptima aplicada: 10 % peor ' + OPT.before.p10.toFixed(1) + ' → ' + OPT.after.p10.toFixed(1) + ' dBm'); };

