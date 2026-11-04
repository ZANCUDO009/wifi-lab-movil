/* ── Costos, KPI e informe ejecutivo ── */
const CO = { pr: 120, cab: 80, ins: 150, w: 15, kwh: .15, yrs: 3, users: 60, mbps: 5, emp: 50, min: 10, rate: 8 };
const apCost = a => { const e = Phys.EQ[a.eq]; return (e ? e.price : CO.pr) + CO.cab + CO.ins + (e ? e.w : CO.w) * 8.76 * CO.kwh * CO.yrs; };
function execData(sc = S) {
  const mode = hmModelEff(), g = Phys.heatAll(sc, 1, mode), k = Phys.kpis(sc, g), srv = sc.aps.filter(a => a.srv !== false), N = srv.length, A = sc.W * sc.H, cov = k.c67 / 100;
  const tco = srv.reduce((a, x) => a + apCost(x), 0), loss = CO.emp * CO.min / 60 * CO.rate * 250, sav = loss * cov, roi = (sav * CO.yrs - tco) / tco, pb = tco / Math.max(sav, 1);
  const cap = Math.max(1, k.spMed), nc = Math.ceil(N * 95 / Math.max(k.c67, 1)), per = srv.reduce((a, x) => a + (Phys.EQ[x.eq] ? Phys.EQ[x.eq].cl : 30), 0) / Math.max(1, N), nu = Math.ceil(CO.users / per), nk = Math.ceil(CO.users * CO.mbps / cap), need = Math.max(nc, nu, nk);
  const score = Math.round(100 * (.4 * Math.min(k.c67 / 95, 1) + .2 * Math.min(k.c75 / 99, 1) + .2 * (k.dead <= 1 ? 1 : Math.max(0, 1 - k.dead / 10)) + .2 * Math.min(k.sp10 / Math.max(CO.mbps, 1), 1)));
  return { g, k, N, A, cov, tco, loss, sav, roi, pb, cap, nc, nu, nk, need, score, perAp: per, mode };
}
function weakest(g, sc) { let mi = 0; for (let i = 1; i < g.tot.length; i++) if (g.tot[i] < g.tot[mi]) mi = i; return { x: ((mi % g.nx) + .5) * g.st, y: (Math.floor(mi / g.nx) + .5) * g.st, v: g.tot[mi] }; }
function failureTable(sc) {
  return sc.aps.map((a, i) => ({ a, i })).filter(o => o.a.srv !== false && o.a.on !== false).map(({ a, i }) => {
    const s2 = { ...sc, aps: sc.aps.map((x, j) => j === i ? { ...x, on: false } : x), bn: Math.min(sc.bn, 1) }, k = Phys.kpis(s2, Phys.heatAll(s2, 2, 'inc')); return { i, c67: k.c67, dead: k.dead };
  });
}
function recText(d, sc = S) {
  const k = d.k, w = weakest(d.g, sc), lk = Phys.leakage(sc, 3), ft = sc.aps.filter(a => a.srv !== false && a.on !== false).length > 1 ? failureTable(sc) : [];
  const parts = [];
  parts.push(k.c67 >= 95 ? `La cobertura útil (${k.c67.toFixed(1)} % ≥ −67 dBm) cumple el objetivo del 95 %.` : `Falta cobertura para voz y video: solo ${k.c67.toFixed(1)} % del área supera −67 dBm; la zona más débil está cerca de (${w.x.toFixed(1)}, ${w.y.toFixed(1)}) m con ${w.v.toFixed(0)} dBm.`);
  parts.push(d.need > d.N ? `Para ${CO.users} usuarios a ${CO.mbps} Mbps se necesitan al menos ${d.need} AP (tienes ${d.N}).` : `La cantidad de AP (${d.N}) alcanza para ${CO.users} usuarios a ${CO.mbps} Mbps.`);
  parts.push(`El costo a ${CO.yrs} años es ${d.tco.toFixed(0)} USD (${(d.tco / (d.A * d.cov || 1)).toFixed(2)} USD por m² cubierto); ${d.roi > 0 ? `la inversión se recupera en ${(d.pb * 12).toFixed(0)} meses con los supuestos indicados.` : 'con los supuestos indicados no se recupera en el horizonte.'}`);
  const risks = []; if (lk.max > -75) risks.push(`fuga de señal al exterior (${lk.max.toFixed(0)} dBm a 3 m del perímetro)`); const ap0 = sc.aps[0]; if (ap0.pt + ap0.gt > eirpLim[sc.region]) risks.push('EIRP por encima del valor de referencia de la normativa elegida'); if (Phys.coChannelWarnings(sc).length) risks.push('equipos en el mismo canal');
  const worst = ft.sort((a, b) => a.c67 - b.c67)[0]; if (worst && worst.c67 < k.c67 - 15) risks.push(`${apLabel(worst.i)} es crítico: si falla, la cobertura cae a ${worst.c67.toFixed(0)} %`);
  parts.push(risks.length ? 'Riesgos principales: ' + risks.join('; ') + '.' : 'No se detectan riesgos importantes con estos supuestos.');
  parts.push('Antes de comprar más equipos prueba «Ubicación óptima»; valida con mediciones propias.');
  return parts.join(' ');
}
const kpr = (n, v, ok, w) => `<div class="kpi"><span>${n}</span><b class="${ok ? 'good' : w ? 'mid' : 'bad'}">${ok ? '✔' : w ? '⚠' : '✖'} ${v}</b></div>`;
const cin = (k, l) => `<tr><td>${l}</td><td><input type="number" value="${CO[k]}" step="any" data-ch="co" data-k="${k}" aria-label="${l}"></td></tr>`;
CH.co = (v, el) => { CO[el.dataset.k] = num(v, 0); ACT.exec(); setTimeout(() => { const e = document.querySelector(`[data-k="${el.dataset.k}"][data-ch="co"]`); if (e) e.focus(); }, 0); };
ACT.exec = () => {
  const d = execData(), k = d.k, rec = recText(d), srv = S.aps.filter(a => a.srv !== false);
  S._exec = { d, rec };
  open_(`<h2>Informe ejecutivo</h2><p><small>${d.N} AP · plano ${S.W}×${S.H} m · ${S.f} GHz · mapa de ${k.st} m con ${d.mode === 'coh' ? 'suma coherente (con fase)' : 'suma incoherente'} y ${S.bn} reflexiones · cliente: ${Phys.CLIENT[S.client].n}</small></p>
  <div class="grid2"><div class="card2"><h3 style="margin-top:0">Indicadores clave · <span class="${d.score >= 80 ? 'good' : d.score >= 60 ? 'mid' : 'bad'}">${d.score}/100</span></h3>${kpr('Cobertura útil (≥ −67 dBm)', k.c67.toFixed(1) + ' %', k.c67 >= 95, k.c67 >= 85)}${kpr('Cobertura mínima (≥ −75 dBm)', k.c75.toFixed(1) + ' %', k.c75 >= 99, k.c75 >= 90)}${kpr('Zonas muertas (< −82 dBm)', k.dead.toFixed(1) + ' %', k.dead <= 1, k.dead <= 5)}${kpr('Velocidad útil del 10 % peor', k.sp10.toFixed(0) + ' Mbps', k.sp10 >= CO.mbps, k.sp10 >= CO.mbps / 2)}${kpr('Velocidad útil mediana', k.spMed.toFixed(0) + ' Mbps', k.spMed >= CO.mbps * 3, k.spMed >= CO.mbps)}${kpr('Redundancia (≥ 2 AP ≥ −70 dBm)', k.red.toFixed(0) + ' %', k.red >= 50, k.red >= 20)}</div>
  <div class="card2"><h3 style="margin-top:0">¿Cuántos AP?</h3><table>${cin('users', 'Usuarios simultáneos')}${cin('mbps', 'Demanda por usuario (Mbps)')}</table><p>Por cobertura <b>${d.nc}</b> · por usuarios (${d.perAp.toFixed(0)} por AP) <b>${d.nu}</b> · por capacidad <b>${d.nk}</b> → mínimo <b>${d.need}</b> (tienes ${d.N}).</p><small>N<sub>AP</sub> = máx(N<sub>cobertura</sub>, N<sub>usuarios</sub>, N<sub>capacidad</sub>)</small></div></div>
  <h3>Equipos instalados</h3><div class="scroll-x"><table><tr><th>Equipo</th><th>Modelo</th><th>Potencia</th><th>Canal</th><th>Costo (USD)</th></tr>${srv.map((a, i) => `<tr><td>${apLabel(S.aps.indexOf(a))}</td><td>${a.eq !== 'custom' ? Phys.EQ[a.eq].n : 'Personalizado'}</td><td>${a.pt} dBm</td><td>${a.ch}</td><td>${apCost(a).toFixed(0)}</td></tr>`).join('')}</table></div>
  <h3>Costos y retorno (supuestos editables)</h3><div class="scroll-x"><table>${cin('pr', 'Precio equipo personalizado (USD)')}${cin('cab', 'Cableado por AP (USD)')}${cin('ins', 'Instalación por AP (USD)')}${cin('w', 'Consumo equipo personalizado (W)')}${cin('kwh', 'Precio kWh (USD)')}${cin('yrs', 'Horizonte (años)')}${cin('emp', 'Empleados')}${cin('min', 'Minutos perdidos/día por mala señal')}${cin('rate', 'Costo por hora (USD)')}</table></div>
  <div class="eq">TCO ${CO.yrs} años = ${d.tco.toFixed(0)} USD · por m² cubierto = ${(d.tco / (d.A * d.cov || 1)).toFixed(2)} USD<br>Pérdida por mala conectividad = ${d.loss.toFixed(0)} USD/año · evitada (× cobertura útil) = ${d.sav.toFixed(0)} USD/año<br>ROI = ${(d.roi * 100).toFixed(0)} % · recuperación = ${(d.pb * 12).toFixed(1)} meses</div>
  <h3>Recomendación automática</h3><p>${rec}</p><div class="warnb">Supuestos: precios, consumos y minutos perdidos son hipotéticos y editables; las velocidades son estimaciones; el modelo es 2D sin difracción. Contrasta con mediciones reales y con la hoja técnica de cada equipo antes de decidir una compra.</div>
  <div class="btns"><button class="pri" data-a="repExp">Exportar informe (HTML imprimible)</button><button data-a="compare">Comparar equipos A/B/C</button><button data-a="opt">Ubicación óptima</button></div>`, true);
};
ACT.repExp = () => {
  const x = S._exec || (ACT.exec(), S._exec), d = x.d, k = d.k; S.hintRings = false; draw2D();
  const img = cv.toDataURL('image/png'), hm = hmc.width ? hmc.toDataURL('image/png') : '';
  const dist = Viz.dist(S.grid) || [0, 0, 0, 0, 0], cat = Viz.CAT, hexOf = ['#1fbf8f', '#2f7fe0', '#e0a000', '#f07b2a', '#d6455d'];
  const bar = (v, c) => `<div class="pb"><i style="width:${Math.max(0, Math.min(100, v)).toFixed(0)}%;background:${c}"></i></div>`;
  const sc = d.score >= 80 ? '#1fbf8f' : d.score >= 60 ? '#e0a000' : '#d6455d';
  const logo = Icons.svg('ui', 'wifi');
  const h = `<!DOCTYPE html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe ejecutivo Wi-Fi</title><style>
@page{size:A4;margin:16mm 14mm}
*{box-sizing:border-box}body{font:14px/1.55 Inter,"Segoe UI",Arial,sans-serif;color:#13202e;margin:0;background:#eef2f7}
.page{max-width:920px;margin:1.2rem auto;background:#fff;padding:2rem 2.4rem;border-radius:12px;box-shadow:0 2px 18px #1a2c4822}
.cover{min-height:92vh;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(145deg,#0b1a33,#12305f 60%,#1b4f9a);color:#fff}
.cover svg.ic{width:84px;height:84px;color:#7fd0ff}.cover h1{font-size:2.6rem;line-height:1.1;margin:.8rem 0 .3rem;letter-spacing:-.02em}.cover p{color:#bcd4f2;margin:.2rem 0;font-size:1.05rem}
.cover .sc{display:inline-flex;align-items:baseline;gap:.4rem;margin-top:1.6rem;padding:.6rem 1.2rem;border-radius:14px;background:#ffffff18;border:1px solid #ffffff44;width:max-content}.cover .sc b{font-size:3rem;color:${sc}}.cover .sc span{font-size:1.1rem;color:#dfeaff}
svg.ic{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.ic .d{fill:currentColor;fill-opacity:.25}
h2{margin:1.4rem 0 .5rem;font-size:1.25rem;border-bottom:2px solid #dbe5f2;padding-bottom:.25rem;color:#0b3a73}
.kp{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}.k{border:1px solid #d6e0ee;border-radius:10px;padding:.6rem .8rem;background:#f7faff}.k small{display:block;color:#51647a}.k b{font-size:1.6rem;display:block}.pb{height:6px;background:#dde6f2;border-radius:4px;overflow:hidden;margin-top:.3rem}.pb i{display:block;height:100%}
.stack{display:flex;height:16px;border-radius:8px;overflow:hidden;margin:.4rem 0}.stack i{display:block}.lg{display:flex;flex-wrap:wrap;gap:.2rem 1rem;font-size:.85rem;color:#40536a}.lg b{display:inline-block;width:.7rem;height:.7rem;border-radius:2px;margin-right:.3rem}
td,th{border-bottom:1px solid #d6e0ee;padding:.35rem .5rem;text-align:left}table{border-collapse:collapse;width:100%}th{color:#0b3a73}
img{max-width:100%;border:1px solid #ccd;border-radius:8px}.note{background:#fff6e0;border-left:4px solid #e0a000;padding:.5rem .8rem;border-radius:0 8px 8px 0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media print{body{background:#fff}.page{box-shadow:none;border-radius:0;margin:0;padding:0;max-width:none}.cover{min-height:250mm;padding:2rem;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}h2{break-after:avoid}.k,table,img,.note{break-inside:avoid}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
<div class="page cover">${logo}<h1>Informe ejecutivo<br>de cobertura Wi-Fi</h1><p>${PRE[S.preset] ? PRE[S.preset].n : 'Escenario personalizado'}</p><p>${new Date().toLocaleDateString('es')} · ${d.N} AP · plano ${S.W}×${S.H} m · ${S.f} GHz · cliente: ${Phys.CLIENT[S.client].n}</p><div class="sc"><b>${d.score}</b><span>/ 100 · puntuación global</span></div></div>
<div class="page"><h2>Resumen</h2>
<div class="kp"><div class="k"><small>Cobertura útil (≥ −67 dBm)</small><b>${k.c67.toFixed(1)} %</b>${bar(k.c67, k.c67 >= 95 ? '#1fbf8f' : k.c67 >= 85 ? '#e0a000' : '#d6455d')}</div><div class="k"><small>Velocidad útil mediana</small><b>${k.spMed.toFixed(0)} Mbps</b>${bar(k.spMed / (k.spMed + CO.mbps * 3 || 1) * 100, '#2f7fe0')}</div><div class="k"><small>Zonas muertas (&lt; −82 dBm)</small><b>${k.dead.toFixed(1)} %</b>${bar(100 - Math.min(100, k.dead * 10), k.dead <= 1 ? '#1fbf8f' : k.dead <= 5 ? '#e0a000' : '#d6455d')}</div></div>
<h2>Distribución de la cobertura</h2><div class="stack">${dist.map((v, i) => `<i style="width:${v.toFixed(1)}%;background:${hexOf[i]}"></i>`).join('')}</div><div class="lg">${cat.map((c, i) => `<span><b style="background:${hexOf[i]}"></b>${c[0]} ${dist[i].toFixed(0)} %</span>`).join('')}</div>
<h2>Plano</h2><img src="${img}" alt="Plano de simulación">${hm ? `<h2>Mapa de cobertura (${HMODES[S.hmMode].n})</h2><img src="${hm}" alt="Mapa de calor" style="width:100%;image-rendering:auto">` : ''}
<h2>Indicadores (puntuación ${d.score}/100)</h2><table><tr><td>Cobertura útil ≥ −67 dBm</td><td>${k.c67.toFixed(1)} %</td></tr><tr><td>Cobertura mínima ≥ −75 dBm</td><td>${k.c75.toFixed(1)} %</td></tr><tr><td>Zonas muertas</td><td>${k.dead.toFixed(1)} %</td></tr><tr><td>Velocidad útil peor 10 % / mediana</td><td>${k.sp10.toFixed(0)} / ${k.spMed.toFixed(0)} Mbps</td></tr><tr><td>Redundancia</td><td>${k.red.toFixed(0)} %</td></tr></table>
<h2>Costos</h2><p>TCO a ${CO.yrs} años: <b>${d.tco.toFixed(0)} USD</b> · por m² cubierto ${(d.tco / (d.A * d.cov || 1)).toFixed(2)} USD · ROI ${(d.roi * 100).toFixed(0)} % · recuperación ${(d.pb * 12).toFixed(1)} meses.</p>
<h2>Recomendación</h2><p>${esc(x.rec)}</p><p class="note"><b>Supuestos y límites del modelo:</b> modelo 2D de trazado de rayos sin difracción ni patrones de antena; velocidades estimadas con sensibilidad y SNR típicas del estándar (≈60 % de la tasa PHY); precios y minutos perdidos hipotéticos. Validar con mediciones reales.</p></div></html>`;
  dl(new Blob([h], { type: 'text/html' }), 'informe_ejecutivo_wifi.html'); hint('Informe exportado: ábrelo en el navegador e imprímelo como PDF si lo necesitas');
};

