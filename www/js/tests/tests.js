/* ════════════════════════════════════════════════════════════════════
   MÓDULO DE PRUEBAS · unitarias, de referencia («valores dorados») y de
   casos límite. Botón «Pruebas del motor» (Física) y también en Node.
   ════════════════════════════════════════════════════════════════════ */
const Tests = (() => {
  const P = Phys;
  /** Escena mínima desde un preset, con los parámetros por defecto del simulador. */
  const mk = (k, o = {}) => ({
    W: 20, H: 14, f: 2.4, bw: 20, nf: 6, ns: 2, gr: 0, off: 0, bn: 2, coh: 0, obl: 1, fres: 0, pln: 2,
    walls: PRE[k].w.map((w, i) => ({ id: i + 1, x1: w[0], y1: w[1], x2: w[2], y2: w[3], m: w[4], th: P.MAT[w[4]].th, op: (w[5] || []).map(a => ({ a: a[0], b: a[1] })) })),
    aps: [{ x: PRE[k].tx[0], y: PRE[k].tx[1], pt: 20, gt: 0, ch: 1, on: true, srv: true, ns: 2, bh: 'cable' }],
    rx: { x: PRE[k].rx[0], y: PRE[k].rx[1] }, ...o
  });
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const T = [];
  const add = (id, n, f) => T.push({ id, n, f });

  /* Fórmulas base (documento, sección 8.2) */
  add('SW-03', 'FSPL a 1 m y 2.4 GHz = 40.05 dB', () => { const v = P.fspl(1, 2.4); return { ok: near(v, 40.05, .01), got: v.toFixed(2) }; });
  add('SW-03', 'FSPL a 10 m y 2.4 GHz = 60.05 dB (+20 dB por década)', () => { const v = P.fspl(10, 2.4); return { ok: near(v, 60.05, .01), got: v.toFixed(2) }; });
  add('SW-03', 'Doblar la distancia en espacio libre suma 6.02 dB', () => { const v = P.fspl(8, 2.4) - P.fspl(4, 2.4); return { ok: near(v, 6.02, .01), got: v.toFixed(2) }; });
  add('SW-03', '5 GHz pierde 6.38 dB más que 2.4 GHz', () => { const v = P.fspl(10, 5) - P.fspl(10, 2.4); return { ok: near(v, 6.375, .01), got: v.toFixed(3) }; });
  add('SW-03', 'Longitud de onda a 2.4 GHz = 12.49 cm', () => { const v = P.lamOf(2.4) * 100; return { ok: near(v, 12.49, .01), got: v.toFixed(2) }; });
  add('SW-03', 'Periodo a 2.4 GHz = 416.7 ps', () => { const v = 1e3 / 2.4; return { ok: near(v, 416.7, .05), got: v.toFixed(1) }; });
  add('FIS-08', 'Piso de ruido 20 MHz con NF = 6 dB = −94.99 dBm', () => { const v = P.noiseDbm(20, 6); return { ok: near(v, -94.99, .01), got: v.toFixed(2) }; });
  add('FX-11', 'Doppler a 1.5 m/s y 2.4 GHz = 12.0 Hz', () => { const v = P.dopplerHz(1.5, 2.4); return { ok: near(v, 12.0, .05), got: v.toFixed(2) }; });
  add('FX-18', 'Profundidad de piel del cobre a 2.4 GHz = 1.35 µm', () => { const v = 1 / Math.sqrt(Math.PI * 2.4e9 * 4e-7 * Math.PI * 5.8e7) * 1e6; return { ok: near(v, 1.35, .02), got: v.toFixed(2) }; });
  add('FX-08', 'Radio de la 1.ª zona de Fresnel (5 m + 5 m) = 0.559 m', () => { const v = P.fresnelRadius(1, P.lamOf(2.4), 5, 5); return { ok: near(v, .559, .002), got: v.toFixed(3) }; });
  add('FX-19', 'Densidad de potencia de 20 dBm a 0.2 m = 0.199 W/m²', () => { const v = P.powerDensity(20, .2); return { ok: near(v, .199, .001), got: v.toFixed(3) }; });
  add('FX-07', 'Difracción de borde de cuchilla con h = 0 → 6.03 dB', () => { const v = P.knifeEdgeLossDb(0, P.lamOf(2.4), 5, 5); return { ok: near(v, 6.03, .02), got: v.toFixed(2) }; });
  add('FX-22', 'La regresión log-distancia recupera n = 3 y P(1 m) = −40 dBm', () => {
    const ds = [1, 2, 4, 8, 16], r = P.logDistanceFit(ds, ds.map(d => -40 - 30 * Math.log10(d)));
    return { ok: near(r.exponent, 3, 1e-6) && near(r.P1m, -40, 1e-6), got: `n=${r.exponent.toFixed(3)}, P1m=${r.P1m.toFixed(2)}` };
  });
  add('FX-04', 'Fresnel εr = 4.5: incidencia normal |Γ| = 0.359 y Brewster = 64.8°', () => { const r = P.fresnel(4.5, 0); return { ok: near(Math.abs(r.te), .359, .001) && near(r.brewster, 64.8, .05), got: `${r.te.toFixed(3)} / ${r.brewster.toFixed(1)}°` }; });
  add('FX-04', 'Fresnel εr = 4.5 a 60°: TE = −0.590 y TM = 0.075', () => { const r = P.fresnel(4.5, 60); return { ok: near(r.te, -.590, .002) && near(r.tm, .075, .002), got: `${r.te.toFixed(3)} / ${r.tm.toFixed(3)}` }; });

  /* Interferencia coherente (FIS-01 / FX-02) */
  add('FIS-01', 'Dos rayos iguales con diferencia λ/2 se anulan', () => {
    const l = P.lamOf(2.4), v = P.cohSum([{ pr: -50, len: 10, n: 0 }, { pr: -50, len: 10 + l / 2, n: 0 }], 2.4);
    return { ok: v < -100, got: v.toFixed(1) + ' dBm' };
  });
  add('FIS-01', 'Dos rayos iguales con diferencia λ suman +6 dB (−44.0 dBm)', () => {
    const l = P.lamOf(2.4), v = P.cohSum([{ pr: -50, len: 10, n: 0 }, { pr: -50, len: 10 + l, n: 0 }], 2.4);
    return { ok: near(v, -43.98, .05), got: v.toFixed(2) + ' dBm' };
  });

  /* Velocidad (FIS-09 / FX-25 / FX-14) */
  const L1 = { bw: 20, nf: 6, ns: 1 };
  add('FX-25', 'Adaptación de tasa: −60 dBm → 86 Mbps, −70 → 51.6, −85 → sin enlace', () => {
    const a = P.link(L1, -60).phy, b = P.link(L1, -70).phy, c = P.link(L1, -85).phy;
    return { ok: near(a, 86, .01) && near(b, 51.6, .01) && c === 0, got: `${a} / ${b} / ${c}` };
  });
  add('FX-25', '−55 dBm con 2 flujos → 229.4 Mbps', () => { const v = P.link({ ...L1, ns: 2 }, -55).phy; return { ok: near(v, 229.4, .05), got: v.toFixed(1) }; });
  add('FIS-09', 'El MCS depende también de la SNR/SINR (RSSI −52 con SINR 20 dB → no usa 1024-QAM)', () => {
    const a = P.link(L1, -52), b = P.link(L1, -52, 20);
    return { ok: a.m === 11 && b.m === 4, got: `solo RSSI: MCS ${a.m} · con SINR 20 dB: MCS ${b.m}` };
  });
  add('FX-14', 'Shannon 20 MHz con SNR 25 dB ≈ 166 Mbps', () => { const v = P.shannon(20, 25); return { ok: near(v, 166.2, 1), got: v.toFixed(1) }; });

  /* Referencia por escenario (SW-04: valores dorados medidos en BETA 5).
     Única diferencia deliberada: «dept2» pasó de −67.508 a −67.243 dBm porque C-11 corrige el
     doble conteo de una pared cuando el rayo cruza un vértice compartido (−80.17 → −76.82 dBm en esa trayectoria). */
  const GOLD = {
    dept2:  { tot: -67.2425, direct: -71.6734, n: 11, cohTot: -73.6727, obl0: -66.1460, bn0: -71.6734, pts: [-20.3331, -48.194, -68.0513] },
    office: { tot: -61.6378, direct: -61.6378, n: 1, cohTot: -61.6378, obl0: -61.6378, bn0: -61.6378, pts: [-33.7918, -55.7866, -66.3102] },
    refl:   { tot: -38.2336, direct: -41.4214, n: 11, cohTot: -34.8935, obl0: -38.2336, bn0: -41.4214, pts: [-28.9241, -34.7542, -39.4632] },
    open:   { tot: -49.9768, direct: -49.9768, n: 1, cohTot: -49.9768, obl0: -49.9768, bn0: -49.9768, pts: [-33.7704, -44.0963, -43.6269] }
  };
  Object.keys(GOLD).forEach(k => {
    const g = GOLD[k];
    add('SW-04', `Escenario «${k}»: potencia total, directa y nº de trayectorias`, () => {
      const r = P.calc(mk(k), mk(k).rx);
      return { ok: near(r.tot, g.tot, .01) && near(r.P[0].pr, g.direct, .01) && r.P.length === g.n, got: `${r.tot.toFixed(3)} / ${r.P[0].pr.toFixed(3)} / ${r.P.length}` };
    });
    add('SW-04', `Escenario «${k}»: modo coherente, sin camino oblicuo y sin reflexiones`, () => {
      const c = P.calc(mk(k, { coh: 1 }), mk(k).rx).tot, o = P.calc(mk(k, { obl: 0 }), mk(k).rx).tot, b = P.calc(mk(k, { bn: 0 }), mk(k).rx).tot;
      return { ok: near(c, g.cohTot, .01) && near(o, g.obl0, .01) && near(b, g.bn0, .01), got: `${c.toFixed(2)} / ${o.toFixed(2)} / ${b.toFixed(2)}` };
    });
    add('SW-04', `Escenario «${k}»: tres puntos del plano`, () => {
      const pts = [[2.3, 2.2], [10.1, 7.4], [17.2, 12.1]], v = pts.map(p => P.calc(mk(k), { x: p[0], y: p[1] }, 'inc').tot);
      return { ok: v.every((x, i) => near(x, g.pts[i], .01)), got: v.map(x => x.toFixed(2)).join(' / ') };
    });
    add('FIS-22', `Reciprocidad en «${k}»: intercambiar Tx y Rx no cambia la potencia`, () => {
      const s = mk(k), a = P.calc(s, s.rx, 'inc').tot, s2 = mk(k, { aps: [{ ...s.aps[0], x: s.rx.x, y: s.rx.y }], rx: { x: s.aps[0].x, y: s.aps[0].y } }), b = P.calc(s2, s2.rx, 'inc').tot;
      return { ok: near(a, b, .05), got: `${a.toFixed(2)} vs ${b.toFixed(2)}` };
    });
    add('EJ-04', `Mapa de calor en «${k}» coincide con calc() punto a punto`, () => {
      const s = mk(k), g1 = P.heatAll(s, 2, 'inc'), i = 3, j = 4, r = P.calc(s, { x: (i + .5) * 2, y: (j + .5) * 2 }, 'inc');
      return { ok: near(g1.tot[j * g1.nx + i], r.tot, .001), got: `${g1.tot[j * g1.nx + i].toFixed(2)} vs ${r.tot.toFixed(2)}` };
    });
  });

  /* Materiales (C-05) */
  add('C-05', 'Balance de energía: R + T ≤ 1 en todos los materiales y bandas', () => {
    const bad = [];
    [2.4, 5, 6].forEach(f => Object.entries(P.MAT).forEach(([k, m]) => { const R = m.g * m.g, Tt = P.pw(-m.l * Math.sqrt(f / 2.4)); if (R + Tt > 1) bad.push(k + '@' + f); }));
    return { ok: !bad.length, got: bad.length ? bad.join(', ') : 'todos cumplen' };
  });

  /* Casos límite (C-11) */
  add('C-11', 'Pared de longitud cero: sin NaN ni error', () => {
    const s = mk('open'); s.walls.push({ id: 99, x1: 5, y1: 5, x2: 5, y2: 5, m: 'brick', th: 15 });
    const r = P.calc(s, s.rx); return { ok: Number.isFinite(r.tot), got: r.tot.toFixed(2) };
  });
  add('C-11', 'Rayo que pasa por un vértice compartido cuenta la pared una sola vez', () => {
    const s = mk('free'); s.aps[0] = { ...s.aps[0], x: 2, y: 12 };
    s.walls = [{ id: 1, x1: 8, y1: 2, x2: 8, y2: 8, m: 'brick', th: 15 }, { id: 2, x1: 8, y1: 8, x2: 14, y2: 8, m: 'brick', th: 15 }];
    s.obl = 0; s.bn = 0;
    const p = P.paths(s, s.aps[0], { x: 14, y: 2 })[0], one = P.wallLoss(s.walls[0], s);
    return { ok: near(p.tl, one, .01) || near(p.tl, 0, .01) || p.cr.length <= 1, got: `${p.cr.length} cruce(s), ${p.tl.toFixed(1)} dB` };
  });
  add('C-11', 'Rayo colineal con una pared no se atenúa ni da NaN', () => {
    const s = mk('free'); s.walls = [{ id: 1, x1: 5, y1: 7, x2: 15, y2: 7, m: 'brick', th: 15 }];
    const r = P.calc(s, { x: 17, y: 7 }); return { ok: Number.isFinite(r.tot), got: r.tot.toFixed(2) };
  });
  add('EJ-23', 'Una apertura deja pasar la señal sin atenuación de pared', () => {
    const s = mk('free'); s.aps[0] = { ...s.aps[0], x: 5, y: 5 };
    s.walls = [{ id: 1, x1: 10, y1: 1, x2: 10, y2: 11, m: 'concrete', th: 20, op: [{ a: .4, b: .6 }] }];
    const th = P.calc(s, { x: 15, y: 6 }, 'inc').P[0], go = P.calc(s, { x: 15, y: 2 }, 'inc').P[0];
    return { ok: near(th.tl, 0, 1e-9) && go.tl > 15, got: `por la puerta ${th.tl.toFixed(1)} dB · por la pared ${go.tl.toFixed(1)} dB` };
  });
  add('FIS-02', 'Fresnel: a incidencia rasante cualquier pared refleja casi todo', () => {
    const s = { fres: 1 }, w = { m: 'drywall' }, a = P.refLoss(w, 5, s), b = P.refLoss(w, 88, s);
    return { ok: b < 1 && a > 5 * b, got: `${a.toFixed(1)} dB a 5° · ${b.toFixed(2)} dB a 88°` };
  });

  /* Rayos visuales (C-01) */
  add('C-01', 'Los rayos visuales transmitidos pierden exactamente la atenuación de la pared', () => {
    const s = mk('free'); s.aps[0] = { ...s.aps[0], x: 5, y: 7 }; s.walls = [{ id: 1, x1: 10, y1: 0, x2: 10, y2: 14, m: 'brick', th: 15 }]; s.obl = 0;
    const R = P.traceRays(s, s.aps[0], 8), t = R.find(r => r.k === 't' && r.i === 0), d = R.find(r => r.i === 0 && r.k === 'd');
    if (!t) return { ok: false, got: 'sin segmento transmitido' };
    const expected = 20 - P.fspl(d.l + t.l, 2.4) - P.wallLoss(s.walls[0], s);
    return { ok: near(t.P, expected, .01), got: `${t.P.toFixed(2)} vs ${expected.toFixed(2)} dBm` };
  });
  add('C-01', 'Los rayos reflejados parten con la pérdida de reflexión del material', () => {
    const s = mk('free'); s.aps[0] = { ...s.aps[0], x: 5, y: 7 }; s.walls = [{ id: 1, x1: 10, y1: 0, x2: 10, y2: 14, m: 'metal', th: 2 }];
    const R = P.traceRays(s, s.aps[0], 8), r = R.find(x => x.k === 'r');
    return { ok: !!r && r.P < R[0].P, got: r ? r.P.toFixed(1) + ' dBm' : 'sin reflejado' };
  });

  /* Varios AP, canales y SINR (EJ-03 / EJ-10 / FIS-10) */
  const two = (c2) => mk('open', { aps: [{ x: 3, y: 7, pt: 20, gt: 0, ch: 1, on: true, srv: true, ns: 2 }, { x: 8, y: 7, pt: 20, gt: 0, ch: c2, on: true, srv: true, ns: 2 }] });
  add('FIS-10', 'Dos AP en el mismo canal dan menos SINR que en canales 1 y 6', () => {
    const rx = { x: 6, y: 9 }, a = P.calc(two(1), rx, 'inc').sinr, b = P.calc(two(6), rx, 'inc').sinr;
    return { ok: b > a + 10, got: `mismo canal ${a.toFixed(1)} dB · 1 y 6: ${b.toFixed(1)} dB` };
  });
  add('EJ-10', 'La asignación automática de canales separa dos AP cercanos', () => {
    const s = two(1), ch = P.assignChannels(s);
    return { ok: P.chOverlap(s, ch[0], ch[1]) < .01, got: `canales ${ch.join(' y ')}` };
  });
  add('EJ-12', 'Apagar un AP elimina su aporte (falla de AP)', () => {
    const s = two(6), rx = { x: 9, y: 7 }, a = P.calc(s, rx, 'inc').tot; s.aps[1].on = false;
    const b = P.calc(s, rx, 'inc').tot; return { ok: b < a - 3, got: `${a.toFixed(1)} → ${b.toFixed(1)} dBm` };
  });

  /* Mapa y KPI */
  add('EJ-06', 'KPI coherentes: cobertura ≥ −67 dBm ≤ cobertura ≥ −75 dBm ≤ 100 %', () => {
    const s = mk('dept2'), k = P.kpis(s, P.heatAll(s, 1, 'inc'));
    return { ok: k.c67 <= k.c75 + 1e-9 && k.c75 <= 100 && k.dead >= 0, got: `${k.c67.toFixed(1)} % / ${k.c75.toFixed(1)} % / muertas ${k.dead.toFixed(1)} %` };
  });
  add('EJ-08', 'El optimizador nunca empeora el 10 % peor del área', () => {
    const s = mk('dept2'), g = P.optimizeAP(s, 0); let r; do { r = g.next(); } while (!r.done);
    return { ok: r.value.best.p10 >= r.value.base.p10 - 1e-6, got: `${r.value.base.p10.toFixed(1)} → ${r.value.best.p10.toFixed(1)} dBm` };
  });
  add('C-08', 'El muestreo del laboratorio no sale del recinto', () => {
    const s = mk('open'), r = P.samplePath(s, s.aps[0], s.rx, .5, () => 0);
    return { ok: r.every(x => x.d <= 20) && r.length > 0, got: r.length + ' muestras' };
  });

  /** Ejecuta todas las pruebas y devuelve [{id,n,ok,got}]. */
  function run() {
    return T.map(t => { try { const r = t.f(); return { id: t.id, n: t.n, ok: !!r.ok, got: r.got }; } catch (e) { return { id: t.id, n: t.n, ok: false, got: 'ERROR: ' + e.message }; } });
  }
  return { run, mk, count: () => T.length };
})();

