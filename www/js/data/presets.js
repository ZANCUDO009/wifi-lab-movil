/* ════════════════════════════════════════════════════════════════════
   MÓDULO DE DATOS · escenarios predefinidos.
   Pared: [x1, y1, x2, y2, material, aperturas?]; aperturas = [[a,b],…] en
   fracción 0..1 a lo largo de la pared (puertas, ventanas, huecos).
   ════════════════════════════════════════════════════════════════════ */
const PRE = {
  dept2: { n: 'Departamento de 2 dormitorios', tx: [3, 3], rx: [16, 10], w: [
    [1, 1, 19, 1, 'brick'], [19, 1, 19, 13, 'brick'], [19, 13, 1, 13, 'brick'], [1, 13, 1, 1, 'brick'],
    [8, 1, 8, 8, 'brick'], [8, 8, 14, 8, 'drywall'], [14, 1, 14, 13, 'brick'], [1, 7, 6, 7, 'drywall']] },
  office: { n: 'Oficina con muro de concreto', tx: [4, 7], rx: [16, 7], w: [
    [10, 1, 10, 13, 'concrete'], [5, 1, 5, 6, 'wood_glass'], [15, 8, 15, 13, 'drywall']] },
  refl: { n: 'Sala cerrada (muchas reflexiones)', tx: [4, 5], rx: [15, 9], w: [
    [1, 1, 19, 1, 'concrete'], [19, 1, 19, 13, 'concrete'], [19, 13, 1, 13, 'concrete'], [1, 13, 1, 1, 'concrete'],
    [10, 4, 10, 6, 'metal']] },
  open: { n: 'Espacio abierto (con una división)', tx: [3, 7], rx: [17, 7], w: [[10, 5, 10, 9, 'wood_glass']] },
  free: { n: 'Campo libre (sin paredes, para medir espacio libre)', tx: [3, 7], rx: [17, 7], w: [] },
  cowork: { n: 'Coworking / open space con salas de vidrio', tx: [5, 7], rx: [16, 4], ex: [[15, 10]], w: [
    [1, 1, 19, 1, 'concrete'], [19, 1, 19, 13, 'concrete'], [19, 13, 1, 13, 'concrete'], [1, 13, 1, 1, 'concrete', [[.45, .55]]],
    [12, 1, 12, 5, 'glass'], [12, 5, 19, 5, 'glass', [[.2, .4]]], [12, 9, 19, 9, 'glass', [[.6, .8]]], [12, 9, 12, 13, 'glass'],
    [6, 10, 6, 12, 'metal'], [8, 10, 8, 12, 'metal']] },
  hotel: { n: 'Hotel: pasillo central y habitaciones', tx: [10, 7], rx: [4, 3], w: [
    [1, 1, 19, 1, 'concrete'], [19, 1, 19, 13, 'concrete'], [19, 13, 1, 13, 'concrete'], [1, 13, 1, 1, 'concrete'],
    [1, 5.5, 19, 5.5, 'brick', [[.08, .13], [.28, .33], [.48, .53], [.68, .73], [.88, .93]]],
    [1, 8.5, 19, 8.5, 'brick', [[.08, .13], [.28, .33], [.48, .53], [.68, .73], [.88, .93]]],
    [7, 1, 7, 5.5, 'brick'], [13, 1, 13, 5.5, 'brick'], [7, 8.5, 7, 13, 'brick'], [13, 8.5, 13, 13, 'brick']] },
  bodega: { n: 'Bodega con estantes metálicos', tx: [2.5, 7], rx: [17, 7], w: [
    [1, 1, 19, 1, 'concrete'], [19, 1, 19, 13, 'concrete'], [19, 13, 1, 13, 'concrete'], [1, 13, 1, 1, 'concrete'],
    [6, 2.5, 6, 11.5, 'metal'], [9, 2.5, 9, 11.5, 'metal'], [12, 2.5, 12, 11.5, 'metal'], [15, 2.5, 15, 11.5, 'metal']] },
  casa: { n: 'Casa de bloque con techo de lámina', tx: [4, 4], rx: [15, 9], w: [
    [1, 1, 17, 1, 'brick'], [17, 1, 17, 12, 'brick'], [17, 12, 1, 12, 'brick'], [1, 12, 1, 1, 'brick'],
    [7, 1, 7, 12, 'brick', [[.35, .5]]], [12, 1, 12, 7, 'brick', [[.5, .7]]], [7, 7, 12, 7, 'drywall', [[.4, .6]]],
    [12, 7, 17, 7, 'drywall']] }
};

