/* ── Tour guiado no modal con resalte (DI-01) ── */
const TS = [
  { t: 'Arrastra el router (azul) y el dispositivo (verde): la potencia cambia al instante.', el: '#cv', on: () => { S.hintRings = true; } },
  { t: 'Haz clic en una pared y cambia su material en «Paredes y objetos», o dibuja una nueva con «Herramientas → Dibujar pared».', el: '#cWall', on: () => { $('cWall').open = true; if (S.level == 'b') { S.level = 'i'; panelsRefresh(); } } },
  { t: 'Activa el mapa de calor: ves la cobertura de todo el plano de un vistazo. Pasa el cursor para leer cada punto.', el: '#bMap', on: () => { S.layers.heat = 1; hmD = 1; heatKick(); hmPaint(true); } },
  { t: 'Activa «Suma coherente» y mueve el dispositivo unos centímetros: la señal sube y baja por interferencia.', el: '#cMod', on: () => { $('cMod').open = true; S.coh = 1; panelsRefresh(); touch(); } },
  { t: 'Abre Física → Modo Onda: las ecuaciones de Maxwell resueltas en tiempo real. Haz clic para poner un poste metálico.', el: '[data-p="fis"]', on: () => { S.coh = 0; panelsRefresh(); touch(); } },
  { t: 'Añade otro equipo con «+ AP» y mira cómo cambian la cobertura y la interferencia.', el: '#cAP', on: () => { $('cAP').open = true; } },
  { t: 'Abre Informe → Informe ejecutivo: cobertura, costos, retorno y cuántos AP necesitas. ¡Tu turno!', el: '[data-p="inf"]', on: () => { } }
];
let tourI = -1;
ACT.tour0 = () => { closeM(); closeMenus(); tour(0); };
function tour(i) {
  document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
  if (i >= TS.length || i < 0) { $('tour').style.display = 'none'; tourI = -1; return; }
  tourI = i; const s = TS[i]; s.on(); const t = $('tour');
  t.style.display = 'block';
  t.innerHTML = `<b>Paso ${i + 1} de ${TS.length}</b><p>${s.t}</p><div class="btns">${i ? '<button data-a="tourGo" data-p="-1">← Anterior</button>' : ''}<button class="pri" data-a="tourGo" data-p="1">${i < TS.length - 1 ? 'Siguiente →' : 'Terminar'}</button><button data-a="tourGo" data-p="x">Saltar</button></div>`;
  const e = document.querySelector(s.el); if (e) { e.classList.add('hl'); e.scrollIntoView && e.scrollIntoView({ block: 'nearest' }); }
}
ACT.tourGo = p => p === 'x' ? tour(-1) : tour(tourI + +p);

