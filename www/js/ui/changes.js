/* ── Cambios en controles (delegación de eventos: sin onclick en línea) ── */
const CH = {
  level: v => { S.level = v; Store.set('level', v); panelsRefresh(); },
  preset: v => preset(v),
  dim: () => { S.W = clamp(num($('inW').value, 20), 5, 80); S.H = clamp(num($('inH').value, 14), 5, 80); S.walls.forEach(w => { w.x1 = Math.min(w.x1, S.W); w.x2 = Math.min(w.x2, S.W); w.y1 = Math.min(w.y1, S.H); w.y2 = Math.min(w.y2, S.H); }); S.aps.forEach(a => { a.x = Math.min(a.x, S.W); a.y = Math.min(a.y, S.H); }); S.rx.x = Math.min(S.rx.x, S.W); S.rx.y = Math.min(S.rx.y, S.H); resetView(); touch(); },
  freq: v => { S.f = +v; if (!Phys.band(S.f).bw.includes(S.bw)) S.bw = 20; const ch = Phys.band(S.f).ch; S.aps.forEach((a, i) => a.ch = ch[i % ch.length]); touch(); panelsRefresh(); logEv('Banda ' + v + ' GHz'); },
  bw: v => { S.bw = +v; touch(); },
  client: v => { S.client = v; const c = Phys.CLIENT[v]; S.gr = c.gr; S.nsC = c.ns; touch(); panelsRefresh(); },
  region: v => { S.region = v; touch(); },
  quality: v => { S.quality = v; Store.set('quality', v); touch(); },
  rays: v => { S.rays = +v; touch(); },
  eq: v => { const a = S.aps[S.apSel]; a.eq = v; const e = Phys.EQ[v]; if (e) { a.pt = e.pt; a.gt = e.gt; a.ns = e.ns; a.bh = e.bh; } touch(); panelsRefresh(); logEv(apLabel(S.apSel) + ': equipo ' + (e ? e.n : 'personalizado')); },
  apk: (v, el) => { const k = el.dataset.k || 'bh', a = S.aps[S.apSel]; a[k] = k === 'bh' ? v : +v; a.eq = 'custom'; touch(); panelsRefresh(); },
  flag: (v, el) => { S[el.dataset.k] = el.checked ? 1 : 0; touch(); },
  layer: (v, el) => { S.layers[el.dataset.k] = el.checked ? 1 : 0; if (el.dataset.k === 'front') dirty = 1; if (el.dataset.k === 'heat' && el.checked) { heatKick(); } if (el.dataset.k === 'heat') hmD = 1; hmPaint(true); },
  hmMode: v => { S.hmMode = v; hmPaint(true); },
  hmModel: v => { S.hmModel = v; hmD = 1; },
  snap: (v, el) => { S.snap = el.checked ? 1 : 0; },
  stat: (v, el) => { $('status').style.display = el.checked ? 'block' : 'none'; },
  wmat: v => { const w = S.walls.find(w => w.id === S.sel); if (w && MAT[v]) { w.m = v; w.th = MAT[v].th; touch(); wallUI(); logEv(`Pared #${w.id}: ${MAT[v].n}`); } },
  wth: (v, el) => { const w = S.walls.find(w => w.id === S.sel); if (w) { w.th = clamp(num(v, 10), 1, 60); el.value = w.th; touch(); wallUI(); } },
  obj: (v, el) => { if (!v) return; addObject(v); el.value = ''; },
  loadJ: (v, el) => { const f = el.files[0]; if (!f) return; if (f.size > 2e6) { hint('Archivo demasiado grande (máx. 2 MB)'); return; } f.text().then(t => { try { applyScenario(JSON.parse(t)); S.preset = ''; touch(); panelsRefresh(); commit(); hint('Escenario cargado'); } catch (e) { hint('Archivo de escenario no válido'); } el.value = ''; }); },
  hmPal: v => { S.hmPal = v; Store.set('hmPal', v); hmPaint(true); legHTML(); },
  floor: v => { S.floor = v; touch(); },
  wallMat: v => { S.wallMat = v; hint('Las paredes nuevas serán de: ' + MAT[v].n); },
  nomotion: (v, el) => { applyMotion(el.checked); hint(el.checked ? 'Efectos animados desactivados' : 'Efectos animados activados'); },
  planFile: (v, el) => planLoad(el),
  csvFile: (v, el) => csvLoad(el)
};
function addObject(k) {
  const id = nextWallId(), c = { x: S.vx, y: S.vy }, O = { person: ['body', .4, 0], shelf: ['metal', 1.5, 0], glass: ['glass', 2, 0], mw: ['wood', 1.2, 0] }[k];
  S.walls.push(wallNew(id, c.x - O[1] / 2, c.y, c.x + O[1] / 2, c.y, O[0], k === 'person' ? 25 : k === 'shelf' ? 2 : undefined)); S.sel = id; touch(); wallUI(); hint('Objeto añadido en el centro de la vista: arrástralo');
}
const IN = {
  exag: v => { S.exag = +v; },
  par: (v, el) => { const k = el.dataset.k, val = +v; if (AP_ONLY[k]) { const a = S.aps[S.apSel]; a[k] = val; a.eq = 'custom'; } else if (k === 'spd') S.spd = val / 100; else S[k] = val; if (k === 'bn') S.pi = 0; if (k === 'off' || k === 'gr') {} touch(); const l = $('v_' + k), u = { pt: ' dBm', gt: ' dBi', gr: ' dBi', off: ' dB', nf: ' dB' }[k] || ''; if (l) l.textContent = (k === 'spd' ? '' : (k === 'pln' ? val.toFixed(1) : val)) + u; apList(); },
  scrub: v => { S.paused = 1; $('bp').textContent = '▶'; S.d0 = (+v / 1000) * S.mx; },
  op: (v, el) => { const w = S.walls.find(w => w.id === S.sel); if (!w) return; const o = w.op[+el.dataset.i]; o[el.dataset.k] = +v; if (o.b <= o.a) { if (el.dataset.k === 'a') o.a = o.b - .02; else o.b = o.a + .02; } touch(); },
  plan: () => planUpdate()
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-a]');
  if (!a) { if (!e.target.closest('.menu')) closeMenus(); return; }
  const f = ACT[a.dataset.a]; if (!f) return;
  if (a.closest('.menu') && !['tool', 'planPick', 'csvPick'].includes(a.dataset.a)) closeMenus();
  f(a.dataset.p, a, e);
});
document.addEventListener('input', e => { const a = e.target.closest('[data-in]'); if (a && IN[a.dataset.in]) IN[a.dataset.in](e.target.value, e.target, e); });
document.addEventListener('change', e => { const a = e.target.closest('[data-ch]'); if (a && CH[a.dataset.ch]) CH[a.dataset.ch](e.target.value, e.target, e); });
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.apx,.wl,.pth')) { e.preventDefault(); e.target.click(); }
});

