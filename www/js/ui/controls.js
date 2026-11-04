/* ── Generadores de controles ── */
const sl = (k, lab, min, max, st, cls = '') => `<div class="${cls}"><label for="s_${k}">${lab}${hb(k)} <b id="v_${k}"></b></label><input type="range" id="s_${k}" min="${min}" max="${max}" step="${st}" data-in="par" data-k="${k}"></div>`;
const ck = (k, lab, cls = '') => `<label class="ck ${cls}"><input type="checkbox" id="c_${k}" data-ch="flag" data-k="${k}"> <span>${lab}${hb(k)}</span></label>`;
const sel = (id, lab, opts, ch, cls = '') => `<div class="${cls}"><label for="${id}">${lab}</label><select id="${id}" data-ch="${ch}">${opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`;
const det = (id, title, body, cls = '', open = false) => `<details class="card ${cls}" id="${id}"${open ? ' open' : ''}><summary>${title}</summary>${body}</details>`;
const AP_ONLY = { pt: 1, gt: 1 };

function buildPanels() {
  const presets = Object.entries(PRE).map(([k, v]) => [k, v.n]);
  $('L').innerHTML =
    det('cEsc', 'Escenario', sel('pre', 'Tipo de recinto', presets, 'preset') + sel('flr', 'Suelo del recinto', [['auto', 'Automático (según el recinto)'], ...Object.entries(FX.FLOORS)], 'floor', 'x-i') +
      `<div class="grid2 x-i" style="grid-template-columns:1fr 1fr"><div><label for="inW">Ancho (m)</label><input type="number" id="inW" min="5" max="80" step="1" data-ch="dim"></div><div><label for="inH">Alto (m)</label><input type="number" id="inH" min="5" max="80" step="1" data-ch="dim"></div></div>
       <div class="btns"><button data-a="reset">↺ Reiniciar</button><button data-a="swap" title="Intercambia router y dispositivo">⇄ Tx↔Rx</button><button data-a="opt" class="x-i">📍 Ubicación óptima</button></div>
       <div id="planCtl" class="x-i" style="display:none"><label for="planW">Plano importado: ancho real (m) <b id="v_planW"></b></label><input type="range" id="planW" min="2" max="80" step=".5" data-in="plan"><label for="planO">Opacidad <b></b></label><input type="range" id="planO" min=".1" max="1" step=".05" data-in="plan"><div class="btns"><button data-a="planClear">Quitar plano</button></div></div>`, '', 1) +
    det('cAP', 'Equipos y puntos de acceso', `<div id="apl"></div>
      <div class="btns"><button data-a="addAP">+ AP</button><button data-a="addInt" class="x-i" title="Fuente de interferencia: microondas, vecino…">+ Interferente</button><button data-a="delAP">− Quitar</button></div>
      <div class="btns x-i"><button data-a="apFail" id="bFail" title="Simula la falla del equipo seleccionado">⛔ Falla de AP</button><button data-a="autoCh" title="Asigna canales por acoplamiento entre AP">🎨 Canales automáticos</button></div>
      <hr><b id="apName"></b>` +
      sel('eq', 'Equipo (biblioteca genérica)', [['custom', 'Personalizado'], ...Object.entries(Phys.EQ).map(([k, v]) => [k, v.n])], 'eq', 'x-i') +
      sl('pt', 'Potencia Tx', 10, 30, 1) + sl('gt', 'Ganancia antena Tx', 0, 9, .5, 'x-i') +
      `<div class="grid2 x-i" style="grid-template-columns:1fr 1fr"><div><label for="ch">Canal${hb('ch')}</label><select id="ch" data-ch="apk" data-k="ch"></select></div><div><label for="ns">Flujos MIMO</label><select id="ns" data-ch="apk" data-k="ns"><option value="1">1×1</option><option value="2">2×2</option><option value="3">3×3</option><option value="4">4×4</option></select></div></div>` +
      sel('bh', 'Conexión a la red (backhaul)' + hb('bh'), [['cable', 'Cable Ethernet'], ['mesh', 'Mesh con radio dedicada'], ['rep', 'Repetidor (misma banda)']], 'apk', 'x-e') +
      '<div id="eirp"></div><div id="cochan"></div>', '', 1) +
    det('cRx', 'Dispositivo receptor', sel('cl', 'Perfil del dispositivo', Object.entries(Phys.CLIENT).map(([k, v]) => [k, v.n + ' (' + (v.gr >= 0 ? '+' : '') + v.gr + ' dBi, ' + v.ns + '×' + v.ns + ')']), 'client', 'x-i') +
      sl('gr', 'Ganancia antena Rx', -3, 3, .5, 'x-i') + sl('off', 'Calibración con medición real', -30, 10, .5, 'x-i'), 'x-i') +
    det('cRad', 'Radio y canal', sel('fsel', 'Banda', [[2.4, '2.4 GHz'], [5, '5 GHz'], [6, '6 GHz']], 'freq') +
      sel('bwsel', 'Ancho de canal' + hb('bw'), [[20, '20 MHz'], [40, '40 MHz'], [80, '80 MHz'], [160, '160 MHz']], 'bw') + sl('nf', 'Figura de ruido del receptor', 3, 12, 1, 'x-e') +
      sel('reg', 'Normativa de EIRP (referencia)', [['US', 'EE. UU. (36 dBm)'], ['EU', 'Europa (20 dBm)'], ['OTRO', 'Otra: verificar (20 dBm)']], 'region', 'x-e'), 'x-i') +
    det('cMod', 'Modelo y animación', ck('coh', 'Suma coherente (con fase)') + ck('obl', 'Camino oblicuo en paredes (espesor/cosθ)', 'x-e') + ck('fres', 'Reflexión de Fresnel (depende del ángulo)', 'x-e') +
      sl('bn', 'Reflexiones máximas', 0, 3, 1) + sl('pln', 'Exponente de pérdida n', 1, 6, .1, 'x-e') +
      sel('rays', 'Rayos visuales', [[0, 'Ninguno'], [16, '16'], [32, '32'], [64, '64']], 'rays') + sl('spd', 'Velocidad de animación', 2, 100, 1) +
      sel('qsel', 'Calidad de cálculo', [['auto', 'Automática'], ['low', 'Baja (rápida)'], ['mid', 'Media'], ['high', 'Alta']], 'quality', 'x-e'), 'x-i') +
    det('cWall', 'Paredes y objetos', `<div class="btns"><button data-a="addWall">+ Pared</button><button data-a="tool" data-p="wall" id="bWall">✏️ Dibujar</button></div>
      ${sel('wmn', 'Material de las paredes nuevas', Object.entries(MAT).map(([k, m]) => [k, m.n]), 'wallMat')}
      <div id="wp" style="display:none"><label for="wm">Material</label><select id="wm" data-ch="wmat"></select><div class="matprev" id="wmPrev" aria-hidden="true"></div><label for="wt">Espesor (cm)</label><input id="wt" type="number" min="1" max="60" data-ch="wth">
      <div id="wop"></div><div class="btns"><button data-a="addOp" title="Abre un hueco por donde la señal pasa sin atenuación de pared">+ Puerta/ventana</button><button data-a="delWall" class="warn">Eliminar pared</button></div></div>
      <label for="obj">Añadir objeto</label><select id="obj" data-ch="obj"><option value="">Elegir…</option><option value="person">Persona (cuerpo humano)</option><option value="shelf">Estante metálico (1.5 m)</option><option value="glass">Mampara de vidrio (2 m)</option><option value="mw">Mueble de madera (1.2 m)</option></select>
      <div id="wls"></div>`, 'x-i');
  $('R').innerHTML =
    '<div class="card" id="res"></div>' +
    det('dSeq', 'Secuencia del proceso físico', '<div id="seq"></div>', '', 1) +
    det('dPth', 'Trayectorias', '<div id="pl"></div>', 'x-i') +
    det('dBud', 'Presupuesto de enlace', '<small>Pr = Pt + G − FSPL − L<sub>paredes</sub> − L<sub>reflexión</sub></small><div id="bud"></div>', 'x-i') +
    det('dCov', 'Cobertura del plano (KPI)', '<div id="cov"></div>', 'x-i') +
    det('dMon', 'Monitor de propagación', '<div id="mon"></div>', 'x-e') +
    det('dPdp', 'Perfil de retardo (PDP)', '<canvas class="mini" height="130" id="pdp" width="310"></canvas><div id="pdpt"></div>', 'x-e') +
    det('dIq', 'Constelación IQ en vivo', '<canvas class="mini" height="170" id="iq" width="310"></canvas><small id="iqt"></small>', 'x-e') +
    det('dFad', 'Interferencia: franjas y respuesta en frecuencia', '<canvas class="mini" height="120" id="fad" width="310"></canvas><small id="fadt"></small><canvas class="mini" height="120" id="hf" width="310" style="margin-top:.4rem"></canvas><small id="hft"></small>', 'x-e');
  $('wm').innerHTML = Object.entries(MAT).map(([k, m]) => `<option value="${k}">${m.n} (−${m.l} dB)</option>`).join('');
}

/** Vuelve a leer el estado y rellena todos los controles. */
function panelsRefresh() {
  const ap = S.aps[S.apSel] || S.aps[0], bs = Phys.band(S.f);
  const sv = (k, v, u) => { const e = $('s_' + k); if (e) e.value = v; const l = $('v_' + k); if (l) l.textContent = (k === 'spd' ? '' : v) + (u || ''); };
  sv('pt', ap.pt, ' dBm'); sv('gt', ap.gt, ' dBi'); sv('gr', S.gr, ' dBi'); sv('off', S.off, ' dB'); sv('nf', S.nf, ' dB'); sv('bn', S.bn, ''); sv('pln', S.pln.toFixed(1), ''); sv('spd', S.spd * 100, '');
  ['coh', 'obl', 'fres'].forEach(k => { $('c_' + k).checked = !!S[k]; });
  $('pre').value = PRE[S.preset] ? S.preset : 'dept2'; $('flr').value = S.floor || 'auto'; $('wmn').value = S.wallMat || 'brick'; $('fsel').value = S.f; $('bwsel').value = S.bw; $('cl').value = S.client; $('reg').value = S.region;
  $('rays').value = S.rays; $('qsel').value = S.quality; $('eq').value = ap.eq || 'custom'; $('ns').value = ap.ns; $('bh').value = ap.bh || 'cable';
  $('inW').value = S.W; $('inH').value = S.H;
  const bwOpts = bs.bw; [...$('bwsel').options].forEach(o => { o.disabled = !bwOpts.includes(+o.value); });
  $('ch').innerHTML = bs.all.map(c => `<option value="${c}">${c}${bs.ch.includes(c) ? ' ★' : ''}</option>`).join(''); $('ch').value = ap.ch;
  $('apName').textContent = (S.apSel ? (ap.srv === false ? 'Interferente ' + S.apSel : 'AP ' + (S.apSel + 1)) : 'Router principal (Tx)') + (ap.on === false ? ' · apagado' : '');
  $('bFail').textContent = ap.on === false ? '▶ Reponer AP' : '⛔ Falla de AP';
  $('s_pt').closest('div').style.display = ''; $('s_gt').disabled = $('s_pt').disabled = false;
  $('bWall').classList.toggle('on', S.tool === 'wall');
  $('fq').textContent = S.f;
  document.title = 'Wi-Fi Lab · Simulador a ' + S.f + ' GHz';
  apList(); wallUI(); $('lvl').value = S.level;
  document.body.classList.remove('lv-b', 'lv-i', 'lv-e'); document.body.classList.add('lv-' + S.level);
}
const apLabel = i => i ? (S.aps[i].srv === false ? 'Interferente ' + i : 'AP ' + (i + 1)) : 'Router (Tx)';
function apList() {
  $('apl').innerHTML = S.aps.map((a, i) => `<div class="apx${i === S.apSel ? ' on' : ''}" data-a="apSel" data-p="${i}" role="button" tabindex="0"><span>${a.on === false ? '⛔' : a.srv === false ? '▲' : '●'} ${apLabel(i)}</span><span class="mut">${a.pt} dBm · canal ${a.ch}</span></div>`).join('');
}
function wallUI() {
  const w = S.walls.find(w => w.id === S.sel);
  $('wp').style.display = w ? 'block' : 'none';
  if (w) {
    $('wm').value = w.m; $('wt').value = w.th;
    $('wmPrev').style.backgroundImage = `url(${Textures.thumb(w.m, 128)})`; $('wmPrev').innerHTML = Icons.svg('materials', w.m);   // vista previa de la textura
    $('wop').innerHTML = (w.op || []).map((o, i) => `<div class="row" style="align-items:center"><span>Hueco ${i + 1}: ${(o.a * 100).toFixed(0)}–${(o.b * 100).toFixed(0)} % · ${((o.b - o.a) * Math.hypot(w.x2 - w.x1, w.y2 - w.y1)).toFixed(2)} m</span><button class="warn" data-a="delOp" data-p="${i}" aria-label="Quitar hueco">✕</button></div><input type="range" min="0" max="1" step=".01" value="${o.a}" data-in="op" data-k="a" data-i="${i}" aria-label="Inicio del hueco"><input type="range" min="0" max="1" step=".01" value="${o.b}" data-in="op" data-k="b" data-i="${i}" aria-label="Fin del hueco">`).join('');
  }
  $('wls').innerHTML = S.walls.map(w => `<div class="wl${w.id === S.sel ? ' on' : ''}" data-a="selWall" data-p="${w.id}" role="button" tabindex="0"><span><i class="tx-sw" style="background:${Textures.swatch(w.m, 32)}"></i>#${w.id} ${MAT[w.m].n}${(w.op || []).length ? ' · ' + w.op.length + ' hueco(s)' : ''}</span><span class="mut">−${Phys.wallLoss(w, S).toFixed(1)} dB</span></div>`).join('');
}

