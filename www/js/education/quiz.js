/* ── Quiz con retroalimentación (DI-05) ── */
const QUIZ = [
  ['¿Cuántos dB se pierden en espacio libre al duplicar la distancia?', ['3 dB', '6 dB', '10 dB', '20 dB'], 1, 'La potencia se reparte sobre una esfera de área 4πd²: al duplicar d el área se cuadruplica (−6 dB).'],
  ['¿Cuál es la longitud de onda del Wi-Fi a 2.4 GHz?', ['1.25 mm', '12.5 cm', '1.25 m', '125 m'], 1, 'λ = c / f = 299 792 458 / 2.4×10⁹ ≈ 12.5 cm.'],
  ['¿Por qué 5 GHz llega menos lejos que 2.4 GHz?', ['Viaja más lento', 'Pierde 6.4 dB más en espacio libre y las paredes atenúan más', 'Los routers usan menos potencia', 'Rebota menos'], 1, 'FSPL crece con 20·log₁₀(f): 20·log₁₀(5/2.4) = 6.38 dB más.'],
  ['¿Qué canales de 2.4 GHz de 20 MHz no se solapan?', ['1, 2 y 3', '1, 6 y 11', '4, 5 y 6', 'Todos'], 1, 'Los canales están separados 5 MHz y miden 20 MHz; 1, 6 y 11 distan 25 MHz.'],
  ['Mover el teléfono 5 cm puede cambiar mucho la señal por…', ['Calentamiento', 'Interferencia entre trayectorias (desvanecimiento)', 'El ruido del router', 'La batería'], 1, 'Las copias de la señal se suman con fase; máximos y mínimos distan λ/2 ≈ 6 cm.'],
  ['¿Por qué la velocidad baja «a saltos» al alejarte?', ['Por fallas del router', 'El equipo cambia de modulación (MCS) según la SNR', 'El aire frena la señal', 'Los canales se llenan'], 1, 'Cada MCS exige una señal y una SNR mínimas; al no cumplirlas se baja de escalón.'],
  ['¿Qué material de la lista atenúa más una señal de 2.4 GHz?', ['Drywall', 'Vidrio simple', 'Concreto armado', 'Madera'], 2, 'El concreto armado (≈20 dB con 20 cm) supera por mucho a drywall, vidrio y madera.'],
  ['El Wi-Fi es radiación…', ['Ionizante como los rayos X', 'No ionizante', 'Radiactiva', 'Gamma'], 1, 'Un fotón de 2.4 GHz tiene ≈10⁻⁵ eV, millones de veces menos que los ≈12 eV para ionizar el agua.'],
  ['¿Por qué un metal «bloquea» tanto el Wi-Fi?', ['Absorbe todo en calor', 'Un conductor refleja casi toda la onda (|Γ| ≈ 1)', 'Genera ruido', 'Cambia la frecuencia'], 1, 'En un conductor el campo tangencial es casi nulo: la onda se refleja con inversión de fase.'],
  ['Dos routers cercanos en el mismo canal provocan…', ['Más velocidad', 'Menos SINR por interferencia co-canal', 'Menos ruido', 'Nada'], 1, 'La señal del otro AP cuenta como interferencia y baja el SINR; por eso se reparten canales.']
];
let QS = { i: 0, ok: 0, ans: null };
ACT.quiz = () => { QS = { i: 0, ok: 0, ans: null }; quizShow(); };
function quizShow() {
  if (QS.i >= QUIZ.length) { open_(`<h2>Quiz terminado</h2><p style="font-size:1.4rem">Puntaje: <b>${QS.ok} / ${QUIZ.length}</b> ${QS.ok >= 9 ? '🏆' : QS.ok >= 6 ? '👍' : '📚'}</p><div class="btns"><button class="pri" data-a="quiz">Repetir</button></div>`); return; }
  const q = QUIZ[QS.i];
  open_(`<h2>Quiz · pregunta ${QS.i + 1} de ${QUIZ.length}</h2><p style="font-size:1.15rem">${q[0]}</p><div style="display:grid;gap:.4rem">${q[1].map((o, i) => `<button data-a="qAns" data-p="${i}" ${QS.ans !== null ? 'disabled' : ''} style="justify-content:flex-start;${QS.ans !== null && i === q[2] ? 'border-color:var(--ok)' : ''}">${QS.ans !== null ? (i === q[2] ? '✔ ' : i === QS.ans ? '✖ ' : '') : ''}${o}</button>`).join('')}</div>${QS.ans !== null ? `<div class="warnb ${QS.ans === q[2] ? 'okb' : 'badb'}"><b>${QS.ans === q[2] ? '¡Correcto!' : 'No exactamente.'}</b> ${q[3]}</div><div class="btns"><button class="pri" data-a="qNext">${QS.i < QUIZ.length - 1 ? 'Siguiente' : 'Ver puntaje'}</button></div>` : ''}`);
}
ACT.qAns = i => { QS.ans = +i; if (QS.ans === QUIZ[QS.i][2]) QS.ok++; quizShow(); };
ACT.qNext = () => { QS.i++; QS.ans = null; quizShow(); };

