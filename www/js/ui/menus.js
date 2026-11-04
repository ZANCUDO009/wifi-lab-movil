/* ── Menús ── */
const mi = (a, t, p) => `<button role="menuitem" data-a="${a}"${p !== undefined ? ` data-p="${p}"` : ''}>${t}</button>`;
const MENUS = {
  sim: () => [mi('reset', '↺ Reiniciar escenario'), mi('swap', '⇄ Intercambiar Tx ↔ Rx'), mi('opt', '📍 Ubicación óptima…'), mi('undo', '↶ Deshacer (Ctrl+Z)'), mi('redo', '↷ Rehacer (Ctrl+Y)'), '<hr>',
    mi('saveJ', '💾 Guardar escenario (.json)'), mi('loadJ', '📂 Cargar escenario'), mi('versions', '🗂 Versiones guardadas…'), mi('share', '🔗 Copiar enlace del escenario'), '<hr>',
    mi('png', '🖼 Exportar PNG'), mi('copyPng', '📋 Copiar imagen'), mi('svg', '📐 Exportar SVG'), '<hr>', mi('feria', '🖥 Modo feria (P)'), mi('tour0', '🎓 Tour guiado'), mi('welcome', '👋 Pantalla de bienvenida')].join(''),
  lab: () => [['d', '1 · Distancia'], ['m', '2 · Materiales'], ['f', '3 · Frecuencia'], ['r', 'Simulación vs. medición'], ['v', 'Velocidad vs. distancia'], ['k', 'Calculadoras de física'], ['p', 'Protocolo y plantilla de datos'], ['x', 'Fichas de experimento'], ['b', 'Bitácora y reporte']].map(([k, t]) => mi('lab', t, k)).join(''),
  fis: () => [mi('insp', '🔬 Inspector de física', 'prop'), mi('wave', '🌊 Modo Onda (FDTD)'), mi('lim', '⚖️ Límites del modelo'), mi('myth', '🧪 Mito vs. realidad'), mi('gloss', '📖 Glosario'), mi('quiz', '❓ Quiz'), mi('poe', '🎯 Predice – Observa – Explica'), mi('tests', '✅ Pruebas del motor')].join(''),
  inf: () => [mi('exec', '📊 Informe ejecutivo'), mi('compare', '⚖ Comparar equipos A/B/C'), mi('missions', '🏆 Misiones'), mi('present', '🎤 Modo presentador'), mi('script', '📝 Guiones y rúbrica'), mi('faq', '🎓 Preguntas del jurado'), mi('survey', '📋 Encuesta antes/después'), mi('demos', '🔧 Demostraciones físicas')].join(''),
  map: () => `<label><input type="checkbox" id="m_heat" data-ch="layer" data-k="heat"> Mostrar mapa de calor</label><div class="lbl">Qué mostrar</div><select id="m_mode" data-ch="hmMode">${Object.entries(HMODES).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('')}</select><div class="lbl">Modelo de cálculo del mapa</div><select id="m_model" data-ch="hmModel"><option value="auto">Igual que el receptor</option><option value="inc">Suma incoherente (promedio)</option><option value="coh">Suma coherente (con fase)</option></select><div class="lbl">Paleta de color</div><select id="m_pal" data-ch="hmPal">${Object.entries(FX.PALS).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('')}</select><label><input type="checkbox" id="m_cont" data-ch="layer" data-k="cont"> Líneas de contorno (−50, −67, −75, −82 dBm)</label><div class="lbl" id="m_info"></div>`,
  lay: () => [['rays', 'Rayos'], ['ref', 'Rayos reflejados y transmitidos'], ['front', 'Frente de onda'], ['labels', 'Etiquetas de paredes'], ['grid', 'Cuadrícula'], ['fresnel', 'Zona de Fresnel'], ['meas', 'Mediciones'], ['plan', 'Plano importado'], ['floor', 'Textura de suelo'], ['rooms', 'Habitaciones coloreadas'], ['rings', 'Anillos de alcance (−67 / −75 dBm)'], ['glow', 'Brillo en las ondas'], ['part', 'Partículas de señal (calidad alta)'], ['trail', 'Estela y fantasma al arrastrar']].map(([k, t]) => `<label><input type="checkbox" id="l_${k}" data-ch="layer" data-k="${k}"> ${t}</label>`).join('') + '<label><input type="checkbox" id="l_snap" data-ch="snap"> Imán a cuadrícula y ángulos</label><label><input type="checkbox" id="l_stat" data-ch="stat"> Barra de estado (FPS, ms)</label><label><input type="checkbox" id="l_nomo" data-ch="nomotion"> Reducir movimiento (sin efectos animados)</label>',
  tool: () => [mi('tool', '☝ Mover y seleccionar', ''), mi('tool', '✏️ Dibujar pared', 'wall'), mi('tool', '📏 Regla', 'ruler'), mi('planPick', '🖼 Importar plano (imagen)…'), mi('csvPick', '📍 Importar mediciones (CSV)…'), mi('measClear', '🗑 Borrar mediciones')].join('')
};
let menuOpen = null;
function buildMenus() {
  $('menus').innerHTML = Object.keys(MENUS).map(k => `<div class="menu" id="mn_${k}" role="menu">${MENUS[k]()}</div>`).join('');
}
function openMenu(k, btn) {
  const was = menuOpen === k; closeMenus(); if (was) return;
  const m = $('mn_' + k); if (!m) return;
  if (k === 'map') { $('m_heat').checked = !!S.layers.heat; $('m_cont').checked = !!S.layers.cont; $('m_mode').value = S.hmMode; $('m_model').value = S.hmModel; $('m_pal').value = S.hmPal || 'viridis'; mapInfo(); }
  if (k === 'lay') { Object.keys(S.layers).forEach(l => { const e = $('l_' + l); if (e) e.checked = !!S.layers[l]; }); $('l_snap').checked = !!S.snap; $('l_stat').checked = $('status').style.display === 'block'; $('l_nomo').checked = !!S.reduceMotion; }
  m.classList.add('on'); menuOpen = k; btn.setAttribute('aria-expanded', 'true');
  const r = btn.getBoundingClientRect(); m.style.left = Math.max(8, Math.min(r.left, innerWidth - m.offsetWidth - 8)) + 'px'; m.style.top = (r.bottom + 4) + 'px';
  const f = m.querySelector('button,select,input'); if (f) f.focus();
}
function closeMenus() { document.querySelectorAll('.menu.on').forEach(m => m.classList.remove('on')); document.querySelectorAll('[aria-expanded=true]').forEach(b => b.setAttribute('aria-expanded', 'false')); menuOpen = null; }
function mapInfo() {
  const g = S.grid, el = $('m_info'); if (!el) return;
  el.textContent = g ? `Mapa actual: ${hmModelEff() === 'coh' ? 'coherente (con fase)' : 'incoherente'}, ${g.bn ?? S.bn} reflexiones, celdas de ${g.st} m.` : '';
}

