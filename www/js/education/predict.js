/* ── Predice – Observa – Explica (DI-04) ── */
const POE = { stage: 0, target: null, pred: -60, before: 0 };
ACT.poe = () => {
  const cand = [[3, 3], [10, 4], [12, 11], [17, 6], [6, 11], [14, 3]].map(p => ({ x: Math.min(p[0], S.W - 1), y: Math.min(p[1], S.H - 1) }));
  POE.target = cand[Math.floor(Math.random() * cand.length)]; POE.before = S.paths.tot; S.target = POE.target; POE.stage = 1; POE.pred = Math.round(S.paths.tot);
  poeShow();
};
function poeShow() {
  if (POE.stage === 1) open_(`<h2>Predice – Observa – Explica</h2><p style="font-size:1.1rem">Hoy la señal del dispositivo es <b>${POE.before.toFixed(1)} dBm</b>. Voy a mover el <b>router</b> al punto marcado como «destino» en el plano.</p><p><b>1 · Predice:</b> ¿cuántos dBm tendrá el dispositivo después?</p><label for="poeS">Tu predicción <b id="poeV">${POE.pred} dBm</b></label><input type="range" id="poeS" min="-95" max="-25" value="${POE.pred}" data-in="poePred" aria-label="Predicción en dBm"><div class="btns"><button class="pri" data-a="poeGo">Mover el router y observar</button></div><p><small>Pista: piensa en la distancia y en cuántas paredes hay entre el punto y el dispositivo.</small></p>`);
}
IN.poePred = v => { POE.pred = +v; $('poeV').textContent = v + ' dBm'; };
ACT.poeGo = () => {
  S.aps[0].x = POE.target.x; S.aps[0].y = POE.target.y; S.target = null; S.paths = calc(); touch();
  const p = S.paths.P[0], real = S.paths.tot, err = POE.pred - real, bi = S.paths.P.reduce((m, x, i, a) => x.pr > a[m].pr ? i : m, 0);
  logEv(`Predice–Observa–Explica: predicción ${POE.pred}, real ${real.toFixed(1)} dBm`);
  open_(`<h2>Observa y explica</h2><div class="grid2"><div class="card2"><small>Tu predicción</small><div class="big" style="font:700 2rem monospace">${POE.pred} dBm</div></div><div class="card2"><small>Resultado del simulador</small><div style="font:700 2rem monospace">${real.toFixed(1)} dBm</div></div></div><p class="${Math.abs(err) <= 5 ? 'good' : Math.abs(err) <= 12 ? 'mid' : 'bad'}"><b>${Math.abs(err) <= 5 ? '¡Muy buena predicción!' : Math.abs(err) <= 12 ? 'Cerca, vale la pena revisar.' : 'Hay mucha diferencia: veamos por qué.'}</b> Diferencia: ${sg(err)} dB.</p>
  <h3>Explicación</h3><p>La trayectoria directa recorre <b>${p.len.toFixed(1)} m</b>: el espacio libre cuesta <b>${p.fs.toFixed(1)} dB</b>${p.cr.length ? ` y atraviesa <b>${p.cr.length} pared(es)</b> que restan <b>${p.tl.toFixed(1)} dB</b> (${p.cr.map(c => MAT[c.w.m].n).join(', ')})` : ', sin paredes en medio'}. ${bi ? `Una trayectoria reflejada (${S.paths.P[bi].n} reflexión) llega con ${S.paths.P[bi].pr.toFixed(1)} dBm y domina el resultado.` : 'La trayectoria directa domina.'} Cambio respecto de antes: ${sg(real - POE.before)} dB.</p><div class="btns"><button class="pri" data-a="poe">Otra ronda</button></div>`);
  POE.stage = 0;
};

