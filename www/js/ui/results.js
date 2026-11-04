/* ── Resultados ── */
function uiHero() {
  const r = S.paths, c = S.cov;
  if (r.tot <= -119) { $('res').innerHTML = '<b>Sin AP activo</b><p class="mut">Todos los equipos están apagados. Repón uno desde «Equipos y puntos de acceso».</p>'; return; }
  const lk = linkOf(r), q = qual(r.tot), ap = S.aps[r.best] || S.aps[0];
  const cov = c ? c.c67.toFixed(0) + ' %' : '—';
  const maxM = Phys.RATE[11] * Phys.BWF[S.bw] * 4 * .6 || 1, sg2 = r.intf > -90 ? 'SINR' : 'SNR';
  const kc = c ? Viz.kpi('cov', 'Cobertura útil', c.c67, '%', 0, c.c67 / 100, c.c67 >= 95 ? 'var(--ok)' : c.c67 >= 85 ? 'var(--am)' : 'var(--rd)', .5) : '<div class="kcard"><small>Cobertura útil</small><b>—</b></div>';
  $('res').innerHTML = `<small>Potencia recibida · estimación</small>${Viz.gaugeHTML(r.tot, q)}
  <div class="qbadge" style="color:${q[2]}">${Icons.svg('ui', Viz.qIcon(r.tot))}<span>${q[0]}</span><span class="q" aria-hidden="true">${q[1]}</span></div>
  <div class="kcards">${kc}${Viz.kpi('spd', 'Velocidad útil', lk.use, 'Mbps', 0, lk.use / maxM, 'var(--tx)', 1)}${Viz.kpi('snr', sg2, lk.snr, 'dB', 0, lk.snr / 45, lk.snr >= 25 ? 'var(--ok)' : lk.snr >= 10 ? 'var(--am)' : 'var(--rd)', .5)}</div>
  <div class="x-i">${row('Modulación', lk.mn)}${row('Velocidad PHY', lk.phy.toFixed(0) + ' Mbps')}${S.aps.length > 1 ? row('Servido por', apLabel(r.best)) + (r.intf > -90 ? row('Interferencia', r.intf.toFixed(1) + ' dBm') : '') : ''}${row('Piso de ruido', Phys.noiseDbm(S.bw, S.nf).toFixed(1) + ' dBm')}</div>
  <div class="x-e">${row('Capacidad de Shannon', lk.shannon.toFixed(0) + ' Mbps')}${row('SNR mínima del MCS', lk.minSnr ?? '—')}</div>
  <small>Estimación simplificada: ${S.coh ? 'suma coherente' : 'suma incoherente'} de ${r.P.length} trayectoria(s). La velocidad usa sensibilidad y SNR mínimas típicas del estándar y ≈60 % de la tasa PHY; <b>no es una predicción exacta</b> de un router real.</small>`;
}
function uiCov() {
  const c = S.cov, g = S.grid;
  if (!c) { $('cov').innerHTML = '<small>Calculando cobertura…</small>'; return; }
  const cl = (v, ok, w) => v >= ok ? 'var(--ok)' : v >= w ? 'var(--am)' : 'var(--rd)', lk = Phys.leakage(S, 3);
  $('cov').innerHTML = Viz.covBar(true) + row('Área ≥ −67 dBm (voz/video)', c.c67.toFixed(1) + ' %', cl(c.c67, 95, 85)) + row('Área ≥ −75 dBm', c.c75.toFixed(1) + ' %', cl(c.c75, 99, 90)) + row('Zonas muertas (< −82 dBm)', c.dead.toFixed(1) + ' %', c.dead <= 1 ? 'var(--ok)' : c.dead <= 5 ? 'var(--am)' : 'var(--rd)') +
    row('10 % peor del área', c.p10.toFixed(1) + ' dBm') + row('Mediana', c.med.toFixed(1) + ' dBm') + row('Velocidad útil peor 10 %', c.sp10.toFixed(0) + ' Mbps') + row('Redundancia (≥ 2 AP)', c.red.toFixed(0) + ' %') + row('Fuga a 3 m fuera', lk.max.toFixed(0) + ' dBm') +
    `<small>Mapa: ${(g && g.model === 'coh') ? 'suma coherente' : 'suma incoherente'} · ${g ? g.bn : S.bn} reflexiones · celdas de ${c.st} m${g && !g.final ? ' · <b>refinando…</b>' : ''}. ${Heat.worker ? 'Calculado en segundo plano (Web Worker).' : ''}</small>`;
  const cb = $('cbar'); if (cb) { const on = S.layers.heat && g && !document.body.classList.contains('feria'); cb.style.display = on ? 'block' : 'none'; if (on) cb.innerHTML = '<b>Cobertura del área</b>' + Viz.covBar(true); }
}
function eventsOf(p) {
  const ev = [{ d: 0, k: 'emit', t: 'Emisión desde el router (Tx)' }, { d: .001, k: 'air', t: 'Propagación en aire (v ≈ c)' }];
  p.cr.forEach(c => ev.push({ d: c.d, k: 'wallx', t: `Atraviesa pared #${c.w.id}: ${MAT[c.w.m].n} (−${c.l.toFixed(1)} dB)` }));
  let cum = 0;
  for (let i = 1; i < p.pts.length - 1; i++) {
    cum += hyp(p.pts[i - 1], p.pts[i]); const w = p.rf[i - 1];
    ev.push({ d: cum, k: 'hit', t: `Impacto con pared #${w.id}` }, { d: cum + 1e-4, k: 'reflect', t: `Reflexión ${i}: θi = θr = ${p.ang[i - 1].toFixed(0)}° (−${Phys.refLoss(w, p.ang[i - 1], S).toFixed(1)} dB)` }, { d: cum + 2e-4, k: 'turn', t: 'Cambio de dirección: r = d − 2(d·n)n' });
  }
  ev.push({ d: p.len, k: 'arrive', t: 'Llegada al receptor (Rx)' });
  return ev.sort((a, b) => a.d - b.d);
}
let evs = [], lastA = -2, lastSlow = 0, slowT = 0;
function stepHL() {
  const p = S.paths.P[S.pi]; if (!p) return;
  let a = -1; evs.forEach((e, i) => { if (e.d <= S.dist) a = i; });
  if (a === lastA) return; lastA = a;
  evs.forEach((e, i) => { const el = $('s' + i); if (el) el.className = 'st' + (i == a ? ' a' : i < a ? ' d' : ''); });
}
function uiSlow() {
  const P = S.paths.P; if (!P.length) return;
  S.pi = Math.min(S.pi, P.length - 1); const p = P[S.pi], r = S.paths, q = qual(r.tot), ap = S.aps[r.best] || S.aps[0];
  const fc = C / (S.spd * 20 * S.spdMul), ex = Math.floor(Math.log10(fc));
  $('chip').textContent = `Animación desacelerada ×${(fc / 10 ** ex).toFixed(1)}·10^${ex} · ${S.coh ? 'con' : 'sin'} fase · sin difracción ni dispersión`;
  const eirp = ap.pt + ap.gt, lim = eirpLim[S.region];
  $('eirp').innerHTML = `${row('EIRP (Pt + Gt)', eirp.toFixed(1) + ' dBm', eirp > lim ? 'var(--rd)' : eirp > lim - 3 ? 'var(--am)' : null)}${eirp > lim ? `<div class="warnb badb">EIRP por encima de ${lim} dBm, valor típico de referencia en 2.4 GHz para la normativa elegida. Verifica la norma local antes de usar este equipo.</div>` : ''}`;
  const cw = Phys.coChannelWarnings(S);
  $('cochan').innerHTML = cw.map(w => `<div class="warnb">⚠ ${apLabel(w.i)} y ${apLabel(w.j)} comparten canal y se escuchan a ${w.rssi.toFixed(0)} dBm (contención). Prueba «Canales automáticos».</div>`).join('');
  $('bud').innerHTML = row('Potencia transmitida', sg(ap.pt) + ' dBm', 'var(--tx)') + row('Ganancias Tx + Rx', sg(ap.gt + S.gr) + ' dBi') + row('Pérdida en espacio libre', '−' + p.fs.toFixed(1) + ' dB', 'var(--rd)') + row('Atenuación por paredes', '−' + p.tl.toFixed(1) + ' dB', 'var(--am)') + row('Pérdida por reflexión', '−' + p.r.toFixed(1) + ' dB', 'var(--pu)') + (S.off ? row('Calibración', sg(S.off) + ' dB') : '') + '<hr>' + row('<b>Potencia de esta trayectoria</b>', p.pr.toFixed(1) + ' dBm', q[2]);
  $('pl').innerHTML = P.map((x, i) => `<div class="pth${i == S.pi ? ' on' : ''}" data-a="pth" data-p="${i}" role="button" tabindex="0"><span>${i ? 'Reflejada #' + i + ' (' + x.n + ' refl.)' : 'Directa'}</span><span>${x.len.toFixed(1)} m · ${x.pr.toFixed(1)} dBm</span></div>`).join('');
  $('mon').innerHTML = row('Frecuencia', S.f.toFixed(3) + ' GHz') + row('Velocidad de propagación', C.toLocaleString('en-US') + ' m/s') + row('Longitud de onda λ', (lam() * 100).toFixed(2) + ' cm') + row('Período T', (1000 / S.f).toFixed(1) + ' ps') + '<hr>' + row('Trayectoria', S.pi ? 'Reflejada #' + S.pi : 'Directa') + row('Distancia recorrida', p.len.toFixed(2) + ' m') + row('Tiempo de propagación', p.t.toFixed(1) + ' ns') + row('Reflexiones', p.n) + row('Ángulos θi = θr', p.ang.map(a => a.toFixed(0) + '°').join(', ') || '—') + row('Paredes atravesadas', p.cr.length);
  evs = eventsOf(p);
  $('seq').innerHTML = evs.map((e, i) => `<div class="st" id="s${i}"><span class="nd">${Icons.svg('ui', e.k || 'air')}</span><span class="tx"><small class="mut">${String(i + 1).padStart(2, '0')}</small> ${e.t}</span></div>`).join(''); lastA = -2;
  pdpDraw(P); fadeDraw(); iqDraw(linkOf(r)); apList(); wallUI();
  const fz = Phys.fresnelClear(S, ap, S.rx);
  $('cv').setAttribute('aria-label', `Plano de ${S.W} por ${S.H} metros. ${S.aps.length} punto(s) de acceso. Receptor en x ${S.rx.x.toFixed(1)}, y ${S.rx.y.toFixed(1)}. Potencia recibida ${r.tot.toFixed(1)} dBm, ${q[0]}. Flechas mueven el receptor; Mayúscula más flechas mueven el AP seleccionado.`);
  mapInfo(); legHTML();
}
function uiFast() {
  uiHero(); soundUpdate();
  const t = performance.now(); if (t - lastSlow > (S.drag ? 160 : 40)) { lastSlow = t; uiSlow(); } else { clearTimeout(slowT); slowT = setTimeout(() => { lastSlow = performance.now(); uiSlow(); }, 170); }
}

