/* ── Comparador de equipos A/B/C (EJ-02) ── */
const CMP = ['basic', 'w6', 'ap'];
CH.cmp = (v, el) => { CMP[+el.dataset.i] = v; ACT.compare(); };
ACT.compare = () => {
  const opts = Object.entries(Phys.EQ);
  const res = CMP.map(id => {
    const e = Phys.EQ[id], sc = { ...S, aps: S.aps.map(a => a.srv === false ? { ...a } : { ...a, pt: e.pt, gt: e.gt, ns: e.ns, bh: e.bh, eq: id }) }, d = execData(sc);
    return { id, e, d };
  });
  const best = (f, hi) => res.map(r => f(r)).reduce((m, v, i, a) => (hi ? v > a[m] : v < a[m]) ? i : m, 0);
  const rows = [['Cobertura útil ≥ −67 dBm', r => r.d.k.c67.toFixed(1) + ' %', r => r.d.k.c67, 1], ['10 % peor del área', r => r.d.k.p10.toFixed(1) + ' dBm', r => r.d.k.p10, 1], ['Velocidad útil peor 10 %', r => r.d.k.sp10.toFixed(0) + ' Mbps', r => r.d.k.sp10, 1], ['Velocidad útil mediana', r => r.d.k.spMed.toFixed(0) + ' Mbps', r => r.d.k.spMed, 1], ['Zonas muertas', r => r.d.k.dead.toFixed(1) + ' %', r => r.d.k.dead, 0], ['TCO a ' + CO.yrs + ' años', r => r.d.tco.toFixed(0) + ' USD', r => r.d.tco, 0], ['Costo por m² cubierto', r => (r.d.tco / (r.d.A * r.d.cov || 1)).toFixed(2) + ' USD', r => r.d.tco / (r.d.A * r.d.cov || 1), 0], ['Puntuación global', r => r.d.score + '/100', r => r.d.score, 1]];
  open_(`<h2>Comparar equipos A / B / C</h2><p><small>Se reemplazan todos los puntos de acceso del escenario actual por cada equipo (misma ubicación, mismas paredes). Las fichas son <b>perfiles genéricos editables</b> (sin marcas); precios de ejemplo.</small></p><div class="grid2">${res.map((r, i) => `<div><label for="cm${i}">Opción ${'ABC'[i]}</label><select id="cm${i}" data-ch="cmp" data-i="${i}">${opts.map(([k, v]) => `<option value="${k}"${k === r.id ? ' selected' : ''}>${v.n}</option>`).join('')}</select><small>${r.e.pt} dBm · ${r.e.gt} dBi · ${r.e.ns}×${r.e.ns} · ${r.e.cl} clientes · ${r.e.price} USD · ${r.e.w} W</small></div>`).join('')}</div>
  <div class="scroll-x"><table><tr><th>Indicador</th>${res.map((r, i) => `<th>Opción ${'ABC'[i]}</th>`).join('')}</tr>${rows.map(([n, f, v, hi]) => { const b = best(v, hi); return `<tr><td>${n}</td>${res.map((r, i) => `<td${i === b ? ' class="good"><b>★ ' : '>'}${f(r)}${i === b ? '</b>' : ''}</td>`).join('')}</tr>`; }).join('')}</table></div><p><small>★ = mejor opción en ese indicador. Compara también el costo: el equipo más caro no siempre es el que más conviene.</small></p>`, true);
};

