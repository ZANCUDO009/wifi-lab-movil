/* ════════════════════════════════════════════════════════════════════
   POLISH · detalles de interfaz (Fase 1 y 6)
   · Iconos en los títulos de sección + animación suave de abrir/cerrar
   · Sliders: pista rellena (--pct) y burbuja con el valor al arrastrar
   · Indicador de pestaña activa que se desliza
   · Estado «Listo / Calculando…» en la cabecera
   · Selector de temas con miniaturas
   Se inicia desde boot.js con polishInit().
   ════════════════════════════════════════════════════════════════════ */
const SEC_ICON = {
  cEsc: ['ui', 'layers'], cAP: ['devices', 'router_v2'], cRx: ['devices', 'laptop'], cRad: ['ui', 'radio'], cMod: ['ui', 'sliders'], cWall: ['ui', 'walls'],
  dSeq: ['ui', 'timeline'], dPth: ['ui', 'route'], dBud: ['ui', 'calc'], dCov: ['ui', 'chart'], dMon: ['ui', 'gauge'], dPdp: ['ui', 'pulse'], dIq: ['ui', 'constellation'], dFad: ['ui', 'wave']
};
const THEMES = [['dark', 'Oscuro', 'Azul profundo, el de siempre'], ['light', 'Claro', 'Para aulas luminosas'], ['contrast', 'Alto contraste', 'Máxima legibilidad'], ['neon', 'Neón', 'Cian y magenta, para ferias'], ['blueprint', 'Plano', 'Azul de plano con líneas blancas']];

function polishInit() {
  /* 1 · iconos en los títulos de las tarjetas */
  document.querySelectorAll('details.card').forEach(d => {
    const sm = d.querySelector(':scope > summary'), ic = SEC_ICON[d.id]; if (!sm || sm.querySelector('.sic') || !ic || !Icons.has(ic[0], ic[1])) return;
    sm.innerHTML = `<span class="sic" aria-hidden="true">${Icons.svg(ic[0], ic[1])}</span><span>${sm.innerHTML}</span>`;
  });
  /* 2 · cierre animado de las tarjetas */
  document.addEventListener('click', e => {
    const sm = e.target.closest && e.target.closest('details.card > summary'); if (!sm) return;
    const d = sm.parentElement; if (!d.open || !FX.motion()) return;
    e.preventDefault(); d.classList.add('closing'); setTimeout(() => { d.open = false; d.classList.remove('closing'); }, 160);
  });
  /* 3 · sliders */
  const bub = $('sbub'); let bt = 0;
  const fill = el => { const mn = +el.min || 0, mx = +el.max || 100, v = clamp((+el.value - mn) / ((mx - mn) || 1), 0, 1); el.style.setProperty('--pct', (v * 100).toFixed(1) + '%'); el._pv = el.value; };
  const show = el => {
    const r = el.getBoundingClientRect(), mn = +el.min || 0, mx = +el.max || 100, f = clamp((+el.value - mn) / ((mx - mn) || 1), 0, 1), lab = el.id && $('v_' + el.id.replace(/^s_/, ''));
    bub.textContent = lab && lab.textContent.trim() ? lab.textContent.trim() : (+el.value).toString(); bub.style.left = (r.left + 10 + f * (r.width - 20)) + 'px'; bub.style.top = (r.top + 2) + 'px'; bub.classList.add('on');
    clearTimeout(bt); bt = setTimeout(() => bub.classList.remove('on'), 900);
  };
  document.addEventListener('input', e => { if (e.target.type === 'range') { fill(e.target); setTimeout(() => show(e.target), 0); } });
  document.addEventListener('pointerup', () => { clearTimeout(bt); bt = setTimeout(() => bub.classList.remove('on'), 350); });
  const sweep = () => document.querySelectorAll('input[type=range]').forEach(el => { if (el._pv !== el.value) fill(el); });
  sweep(); setInterval(sweep, 300);
  /* 4 · indicador de pestaña */
  const nav = document.querySelector('nav.tabs2'), ind = $('tabInd');
  const place = () => {
    if (!nav || !ind) return; const t = nav.querySelector('.tab[aria-expanded=true]') || nav.querySelector('.tab.on') || nav.querySelector('.tab'); if (!t) return;
    ind.style.left = t.offsetLeft + 'px'; ind.style.width = t.offsetWidth + 'px';
  };
  if (nav) { new MutationObserver(place).observe(nav, { attributes: true, subtree: true, attributeFilter: ['aria-expanded', 'class'] }); addEventListener('resize', place); setTimeout(place, 50); setTimeout(place, 600); }
  /* 5 · logotipo animado (ondas del icono) */
  const lg = document.querySelector('.ic-brand .ic'); if (lg) lg.classList.add('ic-anim');
}

/** Cabecera: «Calculando…» mientras se recalcula el mapa o la escena. */
let busyT = 0, busyOn = null;
function uiBusy(now) {
  if (now - busyT < 160) return; busyT = now;
  const w = !!(S.gridBusy || hmD || dirty); if (w === busyOn) return; busyOn = w;
  const b = $('busy'); if (!b) return; b.classList.toggle('work', w); $('busyT').textContent = w ? 'Calculando…' : 'Listo';
}

/** Selector de temas con miniaturas (6.1). */
function themePicker() {
  closeMenus();
  open_(`<h2>Tema visual</h2><p class="mut">Elige cómo se ve todo el simulador. El tema se recuerda en este navegador.</p>
    <div class="thm-grid">${THEMES.map(t => `<button class="thm${S.theme === t[0] ? ' cur' : ''}" data-a="setTheme" data-p="${t[0]}" aria-pressed="${S.theme === t[0]}">
      <span class="pv" data-theme="${t[0]}"><i class="pw"></i><i class="pr"></i><i class="pa"></i><i class="pb2"></i><i class="pp"></i></span>
      <span class="nm">${t[1]}<small>${t[2]}</small></span></button>`).join('')}</div>
    <div class="btns"><button data-a="closeM">Cerrar</button></div>`, true);
}
ACT.setTheme = t => {
  applyTheme(t); legHTML(); document.querySelectorAll('.thm').forEach(b => { const on = b.dataset.p === t; b.classList.toggle('cur', on); b.setAttribute('aria-pressed', on); });
  hint('Tema: ' + (THEMES.find(x => x[0] === t) || [0, t])[1]);
};
if (!ACT.closeM) ACT.closeM = () => closeM();
