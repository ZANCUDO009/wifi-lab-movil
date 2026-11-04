/* ════════════════════════════════════════════════════════════════════
   DIDÁCTICA Y FERIA · bienvenida, tour guiado, misiones con puntuación,
   Predice–Observa–Explica, quiz, mito vs. realidad, fichas de experimento,
   glosario, guiones, rúbrica, preguntas del jurado, encuesta y presentador.
   ════════════════════════════════════════════════════════════════════ */

/* ── Pantalla de bienvenida (UX-27) ── */
function welcome() {
  closeMenus();
  open_(`<h2>Wi-Fi Lab</h2><p style="font-size:1.1rem">Un simulador para <b>ver</b> cómo viaja la señal Wi-Fi, cómo la frenan las paredes y cómo elegir dónde poner el router.</p>
  <div class="wgrid">
    <button class="wcard" data-a="wExplore" style="--i:0;--c1:#19b5ff;--c2:#6c7bff"><span class="wic">${Icons.svg('ui', 'telescope')}</span><b>Explorar</b><small>Arrastra el router y mira qué pasa con la señal</small></button>
    <button class="wcard" data-a="wMissions" style="--i:1;--c1:#ffb547;--c2:#ff6b81"><span class="wic">${Icons.svg('ui', 'trophy')}</span><b>Misiones</b><small>Retos con puntuación para aprender jugando</small></button>
    <button class="wcard" data-a="wCompare" style="--i:2;--c1:#2ee6a8;--c2:#19b5ff"><span class="wic">${Icons.svg('ui', 'scale')}</span><b>Comparar equipos</b><small>Prueba el mismo plano con distintos routers</small></button>
  </div>
  <div class="card2"><label for="wlvl" style="margin-top:0">¿Cuánto detalle quieres ver?</label><select id="wlvl" data-ch="level"><option value="b"${S.level == 'b' ? ' selected' : ''}>Básico: pocos controles y frases simples</option><option value="i"${S.level == 'i' ? ' selected' : ''}>Intermedio: presupuesto de enlace y cobertura</option><option value="e"${S.level == 'e' ? ' selected' : ''}>Experto: todas las variables y fórmulas</option></select></div>
  <div class="btns"><button data-a="tour0">🎓 Tour guiado de 7 pasos</button><button data-a="help">⌨ Atajos</button></div>`);
  Store.set('seen', 1);
}
ACT.wExplore = () => { closeM(); S.hintRings = true; hint('Arrastra el router (azul) o el dispositivo (verde)', 5000); };
ACT.wMissions = () => ACT.missions(); ACT.wCompare = () => ACT.compare();

