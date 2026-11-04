/* ── Laboratorio ── */
const LABT = { d: '1 · Distancia', m: '2 · Materiales', f: '3 · Frecuencia', r: 'Simulación vs. medición', v: 'Velocidad vs. distancia', k: 'Calculadoras', p: 'Protocolo y datos', x: 'Fichas de experimento', b: 'Bitácora' };
const KC = { bw: 20, nf: 6, snr: 25, v: 1.5, eirp: 20, dd: .2, d1: 5, d2: 5, h: .5 };
ACT.lab = lab;
function lab(t) {
  t = t || 'd'; let b = '', after = null;
  if (t === 'd') {
    b = `<h3>¿Qué ocurre al aumentar la distancia?</h3><p><small>El receptor se desplaza sobre la recta Tx→Rx actual, dentro del recinto, con las paredes del escenario. La curva punteada es el espacio libre ideal (n = 2).</small></p><canvas id="labChart" width="680" height="280" style="width:100%" aria-label="Potencia recibida contra distancia"></canvas><p id="cc"></p><div class="btns"><button data-a="labPng">Exportar gráfico (PNG)</button></div>`;
    after = () => {
      const A = apMain(), sc = Phys.samplePath(S, A, S.rx, .25, p => calc(p).tot), xs = sc.map(s => s.d), ys = sc.map(s => s.value);
      const id = xs.map(d => A.pt + A.gt + S.gr + S.off - Phys.fspl(d, S.f, 2));
      chart2('labChart', [{ x: xs, y: ys, color: TH.rx, label: 'simulado con paredes' }, { x: xs, y: id, color: TH.am, dash: [6, 4], label: 'espacio libre ideal' }], { xl: 'distancia desde el Tx (m)', yl: 'Pr (dBm)' });
      $('cc').innerHTML = ys.length ? `Resultado: de ${xs[0].toFixed(1)} a ${xs[xs.length - 1].toFixed(1)} m la potencia pasó de ${ys[0].toFixed(1)} a ${ys[ys.length - 1].toFixed(1)} dBm (${(ys[0] - ys[ys.length - 1]).toFixed(1)} dB menos). En espacio libre cada duplicación de la distancia cuesta 6 dB; los saltos adicionales son paredes.` : 'El receptor está sobre el router: mueve el Rx para trazar la recta.';
    };
  }
  if (t === 'v') {
    b = `<h3>Adaptación de tasa: la velocidad baja en escalera</h3><canvas id="labChart" width="680" height="280" style="width:100%" aria-label="Velocidad contra distancia"></canvas><p><small>Mbps útiles (≈60 % de la tasa PHY) a lo largo de Tx→Rx con el modelo completo, el ancho de canal, los flujos MIMO y el perfil de dispositivo actuales. Cada escalón es un cambio de MCS: exige más señal <b>y</b> más SNR que el anterior.</small></p><div class="btns"><button data-a="labPng">Exportar gráfico (PNG)</button></div>`;
    after = () => {
      const A = apMain(), sc = Phys.samplePath(S, A, S.rx, .25, p => { const r = calc(p), l = linkOf(r); return l.use; });
      chart2('labChart', [{ x: sc.map(s => s.d), y: sc.map(s => s.value), color: TH.rx }], { xl: 'distancia desde el Tx (m)', yl: 'Mbps útiles', step: 1, ymin: 0 });
    };
  }
  if (t === 'm') {
    const d = S.paths.P[0] ? S.paths.P[0].len : 5, A = apMain();
    b = `<h3>¿Qué material produce mayor atenuación?</h3><p><small>Distancia actual: ${d.toFixed(1)} m, una pared de espesor de referencia. R, T y A son los porcentajes de potencia reflejada, transmitida y absorbida (R + T ≤ 100 %).</small></p><div class="scroll-x"><table><tr><th>Material</th><th>Atenuación</th><th>Γ</th><th>Pérdida refl.</th><th>εr</th><th>v en el medio</th><th>R / T / A</th><th>Pr estimada</th></tr>${Object.values(MAT).map(m => { const L = m.l * Math.sqrt(S.f / 2.4), R = m.g * m.g, Tt = pw(-L), Ab = 1 - R - Tt; return `<tr><td>${m.n}</td><td>−${L.toFixed(1)} dB</td><td>${m.g}</td><td>${(-20 * Math.log10(m.g)).toFixed(1)} dB</td><td>${m.e || '∞'}</td><td>${m.e ? (C / Math.sqrt(m.e) / 1e6).toFixed(0) + ' Mm/s' : 'conductor'}</td><td>${(100 * R).toFixed(0)} / ${(100 * Tt).toFixed(0)} / ${(100 * Ab).toFixed(0)} %${Ab < 0 ? ' ⚠' : ''}</td><td>${(A.pt + A.gt + S.gr + S.off - Phys.fspl(d, S.f, S.pln) - L).toFixed(1)} dBm</td></tr>`; }).join('')}</table></div><p><small><b>Fuente y límites:</b> valores educativos orientados a los rangos típicos de la Rec. ITU-R P.2040 para 2.4 GHz (drywall 2–4 dB, madera 3–5, vidrio 2–4, ladrillo 5–10, concreto 10–15 o más, metal 20–40 o más). Dependen del espesor, la humedad y los refuerzos: contrástalos con tus mediciones (VA-08).</small></p>`;
  }
  if (t === 'f') {
    const d = S.paths.P[0] ? S.paths.P[0].len : 5, A = apMain();
    b = `<h3>¿Qué ocurre cuando cambia la frecuencia?</h3><table><tr><th>Frecuencia</th><th>λ</th><th>T</th><th>FSPL a ${d.toFixed(1)} m</th><th>Pr en espacio libre</th></tr>${[2.4, 5, 6].map(f => `<tr><td>${f} GHz</td><td>${(C / f / 1e7).toFixed(2)} cm</td><td>${(1000 / f).toFixed(0)} ps</td><td>${Phys.fspl(d, f).toFixed(1)} dB</td><td>${(A.pt + A.gt + S.gr + S.off - Phys.fspl(d, f)).toFixed(1)} dBm</td></tr>`).join('')}</table><p>Al pasar de 2.4 a 5 GHz la pérdida en espacio libre aumenta ${(Phys.fspl(d, 5) - Phys.fspl(d, 2.4)).toFixed(1)} dB (20·log₁₀(5/2.4)); además las paredes atenúan más (se modela con √(f/2.4)), pero hay más canales, más ancho de banda y menos interferencia.</p>`;
  }
  if (t === 'r') {
    const st = measStats();
    b = `<h3>Comparación entre el modelo y una medición real</h3><p><small>Modelo simulado: <select data-ch="md" aria-label="Modelo simulado"><option value="fs"${MD === 'fs' ? ' selected' : ''}>Espacio libre (exponente n)</option><option value="walls"${MD === 'walls' ? ' selected' : ''}>Con paredes (incoherente)</option><option value="coh"${MD === 'coh' ? ' selected' : ''}>Con paredes (coherente)</option></select> · cada medición es un punto (x, y) del plano; puedes colocarla con el botón o importar un CSV (plantilla en «Protocolo y datos»).</small></p>
    <div class="scroll-x"><table><tr><th>Punto</th><th>x (m)</th><th>y (m)</th><th>Medido (dBm)</th><th>Simulado</th><th>Error</th><th></th></tr>${S.meas.map((r, i) => { const s = simPt(r.x, r.y), e = r.m - s; return `<tr><td>${i + 1}</td><td><input type="number" step=".1" value="${r.x}" data-ch="mrow" data-i="${i}" data-k="x" aria-label="x"></td><td><input type="number" step=".1" value="${r.y}" data-ch="mrow" data-i="${i}" data-k="y" aria-label="y"></td><td><input type="number" step="1" value="${r.m}" data-ch="mrow" data-i="${i}" data-k="m" aria-label="medido"></td><td>${s.toFixed(1)}</td><td>${sg(e)}</td><td><button data-a="mdel" data-p="${i}" aria-label="Quitar fila">✕</button></td></tr>`; }).join('') || '<tr><td colspan="7"><small>Sin mediciones todavía.</small></td></tr>'}</table></div>
    <div class="btns"><button data-a="madd">+ Punto en la posición del Rx</button><button data-a="mdist">+ A distancia d sobre Tx→Rx</button><input type="number" id="mdd" value="${(S.paths.P[0] ? S.paths.P[0].len : 5).toFixed(1)}" step=".5" style="max-width:6rem" aria-label="Distancia d"><button data-a="csvPick">Importar CSV</button><button data-a="csvTpl">Plantilla CSV</button><button data-a="csvExp">Exportar CSV</button><label style="margin:0;display:flex;align-items:center;gap:.3rem">Separador <select id="csvsep" style="min-width:5rem"><option value=";">;</option><option value=",">,</option><option value="&#9;">tab</option></select></label><button data-a="measClear">Limpiar</button></div>
    <div id="me"></div><canvas id="labScat" width="680" height="300" style="width:100%;margin-top:.5rem" aria-label="Medido contra simulado"></canvas><p><small>Error = medido − simulado. Repeticiones del mismo punto se promedian y se muestran como barras de error (±1 desviación estándar). Un punto se marca atípico si su error se aleja más de 2 desviaciones del sesgo.</small></p>`;
    after = () => {
      const st2 = measStats(), me = $('me');
      if (!st2) { me.innerHTML = '<small>Añade al menos un punto para ver sesgo, MAE, RMSE y R².</small>'; chartEmpty('labScat'); return; }
      me.innerHTML = `<div class="card2"><b>${st2.n} punto(s)</b> · sesgo ${sg(st2.bias)} dB · MAE ${st2.mae.toFixed(1)} dB · RMSE ${st2.rmse.toFixed(1)} dB · R² ${st2.r2 === null ? '—' : st2.r2.toFixed(2)}${st2.fit ? `<br>Ajuste log-distancia: n = ${st2.fit.exponent.toFixed(2)} (2 = espacio libre) · P(1 m) = ${st2.fit.P1m.toFixed(1)} dBm` : ''}${st2.out.length ? `<br><span class="mid">⚠ Atípicos: ${st2.out.map(o => `(${o.x.toFixed(1)}, ${o.y.toFixed(1)})`).join(', ')}</span>` : ''}<div class="btns"><button data-a="autoCal" data-p="${st2.bias}">Auto-calibrar (sumar el sesgo)</button>${st2.fit ? '<button data-a="autoN">Ajustar n y P(1 m) por mínimos cuadrados</button>' : ''}</div></div>`;
      const lo = Math.min(...st2.R.map(r => Math.min(r.m, r.s))) - 3, hi = Math.max(...st2.R.map(r => Math.max(r.m, r.s))) + 3;
      chart2('labScat', [{ x: [lo, hi], y: [lo, hi], color: TH.mut, dash: [5, 4], label: 'y = x (ajuste perfecto)' }, { x: st2.R.map(r => r.s), y: st2.R.map(r => r.m), err: st2.R.map(r => r.sd), pts: 1, color: TH.rx, label: 'mediciones' }], { xl: 'simulado (dBm)', yl: 'medido (dBm)', ymin: lo, ymax: hi });
    };
  }
  if (t === 'k') {
    const K = KC, lm = lam();
    b = `<h3>Calculadoras de física</h3><p><small>Fórmulas del documento de mejoras (Apéndice A). Cambia un valor y se recalcula.</small></p><div class="grid2">
    <div class="card2"><b>Ruido y capacidad</b>${kin('bw', 'Ancho de banda (MHz)')}${kin('nf', 'Figura de ruido (dB)')}${kin('snr', 'SNR (dB)')}${row('Piso de ruido', Phys.noiseDbm(K.bw, K.nf).toFixed(1) + ' dBm')}${row('Capacidad de Shannon (1 flujo)', Phys.shannon(K.bw, K.snr).toFixed(0) + ' Mbps')}</div>
    <div class="card2"><b>Doppler</b>${kin('v', 'Velocidad (m/s)')}${row('Desplazamiento', Phys.dopplerHz(K.v, S.f).toFixed(1) + ' Hz')}${row('Tiempo de coherencia', (.423 / Math.max(Phys.dopplerHz(K.v, S.f), 1e-9) * 1000).toFixed(0) + ' ms')}</div>
    <div class="card2"><b>Densidad de potencia</b>${kin('eirp', 'EIRP (dBm)')}${kin('dd', 'Distancia (m)')}${row('S = EIRP/(4πd²)', (Phys.powerDensity(K.eirp, K.dd) * 1000).toFixed(2) + ' mW/m²')}${row('Referencia ICNIRP (público, 2.4 GHz)', '10 W/m²')}${row('Fracción del límite', (Phys.powerDensity(K.eirp, K.dd) / 10 * 100).toFixed(2) + ' %')}<small>Pico en campo lejano; no es un estudio SAR. Verificar edición vigente de ICNIRP.</small></div>
    <div class="card2"><b>Zona de Fresnel y difracción</b>${kin('d1', 'Distancia al obstáculo d₁ (m)')}${kin('d2', 'Distancia restante d₂ (m)')}${kin('h', 'Altura del borde sobre la línea (m)')}${row('Radio 1.ª zona r₁', Phys.fresnelRadius(1, lm, K.d1, K.d2).toFixed(2) + ' m')}${row('Despeje recomendado (60 %)', (Phys.fresnelRadius(1, lm, K.d1, K.d2) * .6).toFixed(2) + ' m')}${row('Pérdida por borde de cuchilla', Phys.knifeEdgeLossDb(K.h, lm, K.d1, K.d2).toFixed(1) + ' dB')}</div></div>`;
  }
  if (t === 'p') b = protocolHTML();
  if (t === 'x') b = expHTML();
  if (t === 'b') {
    b = `<h3>Bitácora automática</h3><p><small>Registra escenarios, movimientos y resultados. Expórtala como reporte de laboratorio en Markdown.</small></p><div class="btns"><button data-a="logNow" class="pri">Registrar el resultado actual</button><button data-a="logExp">Exportar reporte (.md)</button><button data-a="logClr">Limpiar</button></div><div class="card2" style="max-height:18rem;overflow:auto">${LOG.length ? LOG.slice().reverse().map(l => `<div class="kpi"><span>${esc(l.t)}</span><span style="text-align:right">${esc(l.e)}</span></div>`).join('') : '<small>La bitácora está vacía: mueve el router o cambia un material.</small>'}</div>`;
  }
  open_(`<h2>Laboratorio virtual</h2><div class="tabs" role="tablist">${Object.keys(LABT).map(k => `<button role="tab" aria-selected="${k == t}" class="${k == t ? 'on' : ''}" data-a="lab" data-p="${k}">${LABT[k]}</button>`).join('')}</div>${b}`, true);
  if (after) after();
}
const kin = (k, l) => `<label for="kc_${k}">${l}</label><input type="number" id="kc_${k}" value="${KC[k]}" step="any" data-ch="kc" data-k="${k}">`;
function chartEmpty(id) { const c = $(id), g = c.getContext('2d'); g.fillStyle = TH.bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = TH.mut; g.font = '14px Segoe UI'; g.textAlign = 'center'; g.fillText('Sin datos todavía', c.width / 2, c.height / 2); }
CH.md = v => { MD = v; lab('r'); };
CH.kc = (v, el) => { KC[el.dataset.k] = num(v, 1); lab('k'); setTimeout(() => { const e = $('kc_' + el.dataset.k); if (e) e.focus(); }, 0); };
CH.mrow = (v, el) => { S.meas[+el.dataset.i][el.dataset.k] = num(v); touch(); lab('r'); };
ACT.labPng = () => { const c = $('labChart'); if (c) c.toBlob(b => dl(b, 'grafico_laboratorio.png')); };
ACT.madd = () => { S.meas.push({ x: +S.rx.x.toFixed(2), y: +S.rx.y.toFixed(2), m: Math.round(S.paths.tot), rep: 1, ch: '', t: '', eq: '', note: '' }); touch(); lab('r'); };
ACT.mdist = () => { const A = apMain(), d = num($('mdd').value, 3), L = hyp(A, S.rx) || 1, p = { x: clamp(A.x + (S.rx.x - A.x) / L * d, 0, S.W), y: clamp(A.y + (S.rx.y - A.y) / L * d, 0, S.H) }; S.meas.push({ x: +p.x.toFixed(2), y: +p.y.toFixed(2), m: Math.round(simPt(p.x, p.y)), rep: 1, ch: '', t: '', eq: '', note: '' }); touch(); lab('r'); };
ACT.mdel = i => { S.meas.splice(+i, 1); touch(); lab('r'); };
ACT.measClear = () => { S.meas = []; touch(); closeMenus(); if (modalOn() && $('labScat')) lab('r'); };
ACT.autoCal = b => { S.off = clamp(Math.round((S.off + +b) * 2) / 2, -30, 10); touch(); panelsRefresh(); logEv('Auto-calibración: ' + S.off + ' dB'); lab('r'); };
ACT.autoN = () => {
  const st = measStats(); if (!st || !st.fit) return;
  const a = apMain(), n = clamp(st.fit.exponent, 1, 6), off = st.fit.P1m - (a.pt + a.gt + S.gr - 40.05 - (S.f === 2.4 ? 0 : Phys.fspl(1, S.f, 2) - 40.05));
  S.pln = +n.toFixed(1); S.off = clamp(Math.round(off * 2) / 2, -30, 10); MD = 'fs'; touch(); panelsRefresh(); logEv(`Ajuste por mínimos cuadrados: n = ${S.pln}, calibración ${S.off} dB`); lab('r'); hint(`Ajuste aplicado: n = ${S.pln} y calibración ${S.off} dB (modelo «espacio libre»)`);
};
function csvText(sep) {
  const H = ['punto', 'x', 'y', 'dbm_medido', 'repeticion', 'canal', 'hora', 'equipo', 'notas', 'dbm_simulado', 'error_db'];
  const q = v => { v = String(v ?? ''); return /[;,\t"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return '\ufeff' + H.join(sep) + '\n' + S.meas.map((r, i) => { const s = simPt(r.x, r.y); return [i + 1, r.x, r.y, r.m, r.rep || 1, r.ch, r.t, r.eq, r.note, s.toFixed(2), (r.m - s).toFixed(2)].map(q).join(sep); }).join('\n');
}
ACT.csvExp = () => { const sep = $('csvsep') ? $('csvsep').value : ';'; dl(new Blob([csvText(sep)], { type: 'text/csv;charset=utf-8' }), 'mediciones_simulador.csv'); };
ACT.csvTpl = () => dl(new Blob(['\ufeffpunto;x;y;dbm_medido;repeticion;canal;hora;equipo;notas\n1;2.0;3.0;-45;1;6;10:00;Router A;sin obstáculos\n1;2.0;3.0;-46;2;6;10:01;Router A;repetición\n2;8.0;5.0;-62;1;6;10:05;Router A;pared de ladrillo\n'], { type: 'text/csv;charset=utf-8' }), 'plantilla_mediciones.csv');
function csvLoad(el) {
  const f = el.files[0]; if (!f) return; if (f.size > 1e6) { hint('CSV demasiado grande (máx. 1 MB)'); return; }
  f.text().then(t => {
    const L = t.replace(/^\ufeff/, '').split(/\r?\n/).filter(x => x.trim()); if (L.length < 2) { hint('CSV vacío'); return; }
    const sep = [';', ',', '\t'].map(s => [s, L[0].split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
    const sp = l => { const o = []; let c = '', q = 0; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; };
    const H = sp(L[0]).map(h => h.trim().toLowerCase()), ix = ks => H.findIndex(h => ks.includes(h)), ci = { x: ix(['x']), y: ix(['y']), m: ix(['dbm_medido', 'medido', 'dbm', 'rssi', 'm']), rep: ix(['repeticion', 'rep']), ch: ix(['canal', 'ch']), t: ix(['hora', 't']), eq: ix(['equipo']), note: ix(['notas', 'nota']) };
    if (ci.x < 0 || ci.y < 0 || ci.m < 0) { hint('El CSV necesita columnas x, y y dbm_medido (usa la plantilla)'); return; }
    let n = 0; L.slice(1, 501).forEach(l => { const c = sp(l), x = parseFloat(c[ci.x]), y = parseFloat(c[ci.y]), m = parseFloat(c[ci.m]); if ([x, y, m].every(Number.isFinite)) { S.meas.push({ x: clamp(x, 0, S.W), y: clamp(y, 0, S.H), m, rep: ci.rep >= 0 ? num(c[ci.rep], 1) : 1, ch: ci.ch >= 0 ? esc(c[ci.ch]) : '', t: ci.t >= 0 ? esc(c[ci.t]) : '', eq: ci.eq >= 0 ? esc(c[ci.eq]) : '', note: ci.note >= 0 ? esc(c[ci.note]) : '' }); n++; } });
    S.meas = S.meas.slice(0, 500); S.layers.meas = 1; touch(); hint(n + ' medición(es) importadas: aparecen sobre el plano coloreadas por error'); el.value = ''; lab('r');
  });
}
function protocolHTML() {
  return `<h3>Protocolo estándar de medición (7 pasos)</h3><ol><li><b>Mismo equipo, mismo canal fijo</b> (por ejemplo canal 6) y misma potencia durante todo el experimento.</li><li><b>Altura y orientación constantes</b> del teléfono o receptor (por ejemplo 1.0 m).</li><li><b>Promedia</b> al menos 30 s por punto y repite 3 veces; anota la desviación estándar.</li><li><b>Marca los puntos con cinta métrica</b> desde el router y anota (x, y) en el mismo sistema que el simulador.</li><li><b>Registra el entorno</b>: hora, personas presentes, redes vecinas, puertas abiertas o cerradas.</li><li><b>Un experimento por variable</b>: distancia sin paredes, material con una sola pared, 2.4 vs. 5 GHz, posición del router.</li><li><b>Guarda los datos crudos</b> en CSV con la plantilla y conserva el archivo original.</li></ol>
  <div class="warnb"><b>Advertencia honesta:</b> el RSSI de un teléfono suele estar cuantizado, calibrado distinto en cada modelo y afectado por la orientación del cuerpo. Compara la lectura de al menos dos apps o dispositivos (VA-10) y declara la diferencia como incertidumbre. En un salón con muchas redes las mediciones en vivo se distorsionan: presenta mediciones tomadas antes.</div>
  <h3>Plantilla de datos</h3><p>Campos: punto, x, y, dBm medido, repetición, canal, hora, equipo, notas.</p><div class="btns"><button data-a="csvTpl" class="pri">Descargar plantilla CSV</button><button data-a="lab" data-p="r">Ir a Simulación vs. medición</button></div>
  <h3>Métricas de ajuste</h3><table><tr><th>Métrica</th><th>Qué dice</th></tr><tr><td>Sesgo = media(medido − simulado)</td><td>Sobre o subestimación media; se corrige calibrando</td></tr><tr><td>MAE</td><td>Error típico en dB</td></tr><tr><td>RMSE</td><td>Penaliza más los errores grandes</td></tr><tr><td>R²</td><td>Cuánta de la variación explica el modelo</td></tr><tr><td>Desviación de las repeticiones</td><td>Incertidumbre del propio instrumento</td></tr></table>`;
}

