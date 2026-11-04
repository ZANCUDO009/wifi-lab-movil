/* ── Misiones con puntuación (DI-03) ── */
const MISSIONS = [
  { id: 'm1', n: 'Sin zonas muertas', d: 'Departamento con 1 solo router: mueve el router para que al menos el 90 % del plano supere −67 dBm. Máx. 1 equipo.', preset: 'dept2', maxAp: 1, goal: 90, budget: 9999, leak: 0 },
  { id: 'm2', n: 'Coworking económico', d: 'Cubre el coworking con máx. 2 equipos y un TCO a 3 años menor a 900 USD. Meta: 90 % de cobertura útil sin dejar equipos en el mismo canal.', preset: 'cowork', maxAp: 2, goal: 90, budget: 900, leak: 0 },
  { id: 'm3', n: 'Hotel seguro', d: 'Hotel con 3 equipos como máximo: cubre el 85 % y mantén la fuga a 3 m del perímetro por debajo de −65 dBm.', preset: 'hotel', maxAp: 3, goal: 85, budget: 1500, leak: -65 }
];
function missionScore(m) {
  const d = execData(), k = d.k, srv = S.aps.filter(a => a.srv !== false).length, lk = Phys.leakage(S, 3), co = Phys.coChannelWarnings(S).length;
  const pc = Math.min(1, k.c67 / m.goal), pb = d.tco <= m.budget ? 1 : Math.max(0, 1 - (d.tco - m.budget) / m.budget), pl = !m.leak || lk.max <= m.leak ? 1 : Math.max(0, 1 - (lk.max - m.leak) / 20), pa = srv <= m.maxAp ? 1 : 0, pr = co ? .5 : 1;
  const score = Math.round(100 * (.5 * pc + .2 * pb + .15 * pl + .15 * pr) * (pa ? 1 : .5));
  return { score, k, tco: d.tco, leak: lk.max, srv, co, pc, pb, pl, pa, pr };
}
let curM = null;
ACT.missions = () => {
  const best = Store.get('missions', {});
  open_(`<h2>Misiones</h2><p><small>Retos con objetivo, restricciones y puntaje (cobertura 50 %, costo 20 %, fuga 15 %, canales 15 %). Medallas: 🥉 ≥ 60 · 🥈 ≥ 80 · 🥇 ≥ 92.</small></p>${MISSIONS.map(m => `<div class="card2"><b>${m.n}</b> ${best[m.id] ? `<span class="mid">· mejor: ${best[m.id]} ${best[m.id] >= 92 ? '🥇' : best[m.id] >= 80 ? '🥈' : best[m.id] >= 60 ? '🥉' : ''}</span>` : ''}<p>${m.d}</p><div class="btns"><button class="pri" data-a="mStart" data-p="${m.id}">Empezar</button>${curM && curM.id === m.id ? `<button data-a="mEval" data-p="${m.id}">Evaluar mi solución</button>` : ''}</div></div>`).join('')}<div id="mres"></div>`);
};
ACT.mStart = id => { curM = MISSIONS.find(m => m.id === id); $('pre').value = curM.preset; preset(curM.preset); S.layers.heat = 1; hmD = 1; closeM(); hint('Misión «' + curM.n + '»: ' + curM.d, 7000); logEv('Misión iniciada: ' + curM.n); $('tour').style.display = 'block'; $('tour').innerHTML = `<b>Misión: ${esc(curM.n)}</b><p>${esc(curM.d)}</p><div class="btns"><button class="pri" data-a="mEval2">Evaluar mi solución</button><button data-a="mEnd">Salir de la misión</button></div>`; };
ACT.mEnd = () => { curM = null; $('tour').style.display = 'none'; };
ACT.mEval2 = () => { $('tour').style.display = 'none'; ACT.missions(); ACT.mEval(curM.id); };
ACT.mEval = id => {
  const m = MISSIONS.find(x => x.id === id), r = missionScore(m), best = Store.get('missions', {});
  if (!best[id] || r.score > best[id]) { best[id] = r.score; Store.set('missions', best); }
  logEv(`Misión «${m.n}»: ${r.score} puntos`);
  const med = r.score >= 92 ? '🥇 Oro' : r.score >= 80 ? '🥈 Plata' : r.score >= 60 ? '🥉 Bronce' : 'Sigue intentando';
  const html = `<div class="card2" style="border-color:var(--tx)"><h3 style="margin-top:0">Puntaje: ${r.score}/100 · ${med}</h3>${kpr('Cobertura útil', r.k.c67.toFixed(1) + ' % (meta ' + m.goal + ' %)', r.pc >= 1, r.pc > .9)}${kpr('Costo TCO', r.tco.toFixed(0) + ' USD (máx. ' + m.budget + ')', r.pb >= 1, r.pb > .7)}${m.leak ? kpr('Fuga a 3 m', r.leak.toFixed(0) + ' dBm (máx. ' + m.leak + ')', r.pl >= 1, r.pl > .6) : ''}${kpr('Equipos', r.srv + ' (máx. ' + m.maxAp + ')', r.pa, 0)}${kpr('Canales', r.co ? r.co + ' par(es) en el mismo canal' : 'sin conflictos', r.pr >= 1, 0)}</div>`;
  if ($('mres')) $('mres').innerHTML = html; else { ACT.missions(); $('mres').innerHTML = html; }
};
function missionTick() { }

