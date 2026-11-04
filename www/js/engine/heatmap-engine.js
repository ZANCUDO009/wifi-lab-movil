/* ── Motor del mapa de calor: Web Worker con resolución progresiva (EJ-04, FIS-21) ── */
let hmD = 1;
const QUAL = { low: { steps: [2], rays: 16, bn: 1 }, mid: { steps: [2, 1], rays: 32, bn: 2 }, high: { steps: [2, 1, .5], rays: 64, bn: 3 } };
const sceneForWorker = () => ({
  W: S.W, H: S.H, f: S.f, bw: S.bw, nf: S.nf, ns: S.ns, nsC: S.nsC, gr: S.gr, off: S.off, bn: S.bn, coh: S.coh, obl: S.obl, fres: S.fres, pln: S.pln,
  walls: S.walls.map(w => ({ id: w.id, x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2, m: w.m, th: w.th, op: w.op })),
  aps: S.aps.map(a => ({ ...a }))
});
const WORKER_GLUE = `
let cur = 0;
onmessage = async e => {
  const m = e.data, id = m.id; cur = id;
  for (const st of m.steps) {
    const g = Phys.makeGrid(m.scene, st), t0 = performance.now();
    for (let j = 0; j < g.ny; j += 3) {
      if (cur !== id) return;
      Phys.heatRows(m.scene, g, m.mode, j, Math.min(g.ny, j + 3));
      if ((j / 3) % 4 === 3) await new Promise(r => setTimeout(r, 0));
    }
    postMessage({ id, st, nx: g.nx, ny: g.ny, tot: g.tot, sinr: g.sinr, best: g.best, cnt: g.cnt, ms: performance.now() - t0 }, [g.tot.buffer, g.sinr.buffer, g.best.buffer, g.cnt.buffer]);
  }
  postMessage({ id, done: 1 });
};`;
const Heat = (() => {
  let wk = null, rid = 0, ok = true, fb = 0, lastMs = 0;
  function mk() {
    if (wk || !ok) return;
    try {
      // El Worker recibe el código de la fábrica de física + los materiales actuales (incluidos los que añadas).
      const code = 'const PhysFactory = ' + PhysFactory.toString() + ';\nconst Phys = PhysFactory(' + JSON.stringify(Phys.MAT) + ');\n' + WORKER_GLUE;
      wk = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      wk.onmessage = e => onMsg(e.data);
      wk.onerror = () => { ok = false; wk = null; };
    } catch (err) { ok = false; wk = null; }
  }
  function onMsg(m) {
    if (m.id !== rid) return;
    if (m.done) { S.gridBusy = 0; hmDone(); return; }
    lastMs = m.ms;
    S.grid = { st: m.st, nx: m.nx, ny: m.ny, tot: m.tot, sinr: m.sinr, best: m.best, cnt: m.cnt, ms: m.ms, model: S._hmM, bn: S._hmBn, final: m.st === S._hmLast };
    hmPart();
  }
  function request(steps, mode) {
    rid++; const id = rid; S.gridBusy = 1; S._hmM = mode; S._hmBn = S.bn; S._hmLast = steps[steps.length - 1];
    mk();
    if (wk) { wk.postMessage({ id, steps, mode, scene: sceneForWorker() }); return; }
    // Respaldo sin Worker: se calcula en la página por tandas para no congelar la interfaz.
    fb = id; const sc = sceneForWorker(); let si = 0, g = Phys.makeGrid(sc, steps[0]), j = 0;
    (function tick() {
      if (fb !== id) return;
      const t0 = performance.now();
      while (j < g.ny && performance.now() - t0 < 12) { Phys.heatRows(sc, g, mode, j, j + 1); j++; }
      if (j >= g.ny) {
        S.grid = { st: g.st, nx: g.nx, ny: g.ny, tot: g.tot, sinr: g.sinr, best: g.best, cnt: g.cnt, ms: 0, model: mode, bn: sc.bn, final: g.st === S._hmLast }; hmPart();
        if (++si < steps.length) { g = Phys.makeGrid(sc, steps[si]); j = 0; setTimeout(tick, 0); } else { S.gridBusy = 0; hmDone(); }
      } else setTimeout(tick, 0);
    })();
  }
  return { request, get worker() { return !!wk; }, get lastMs() { return lastMs; } };
})();
/** Modelo efectivo con el que se calcula el mapa («auto» = el mismo que el receptor). */
const hmModelEff = () => S.hmModel === 'auto' ? (S.coh ? 'coh' : 'inc') : S.hmModel;
function heatKick() {
  const q = QUAL[S.quality === 'auto' ? (S.autoQ || 'high') : S.quality];
  const steps = S.drag ? [2] : S.layers.heat ? q.steps : [2, 1];
  Heat.request(steps, hmModelEff());
}

