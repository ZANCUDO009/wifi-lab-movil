/* ════════════════════════════════════════════════════════════════════
   DATOS · MATERIALES (propiedades FÍSICAS)
   ────────────────────────────────────────────────────────────────────
   Aquí se define cómo se comporta cada material frente a las ondas Wi-Fi.
   El aspecto VISUAL (textura 3D/2D) vive aparte, en assets/textures/<id>.js
   y el icono en assets/icons/materials/<id>.js (ver README.md).

   Campos:
     n   nombre que ve el usuario
     l   pérdida de transmisión (dB) a 2.4 GHz con el espesor de referencia
     g   |Γ| coeficiente de reflexión en incidencia normal (0..1)
     e   permitividad relativa εr
     th  espesor de referencia (cm)
     c   color base (se usa en minimapa, informe SVG y como respaldo)
     sg  conductividad σ (S/m)

   Para AGREGAR un material nuevo:
     1) añade una línea aquí con un id nuevo (sin espacios, ej. 'marmol');
     2) copia assets/textures/_plantilla.js → assets/textures/marmol.js;
     3) agrega su <script> en index.html (bloque «TEXTURAS»).
   Si no creas la textura, el material funciona igual con una textura genérica.
   ════════════════════════════════════════════════════════════════════ */
const MATERIALS = {
    drywall:    { n: 'Drywall',                       l: 3,  g: .3,  e: 2.5, th: 10, c: '#9ca3af', sg: .02 },
    wood:       { n: 'Madera / puerta',               l: 4,  g: .35, e: 2,   th: 4,  c: '#b9803a', sg: .01 },
    glass:      { n: 'Vidrio simple',                 l: 3,  g: .4,  e: 6,   th: 1,  c: '#8fd3e8', sg: .005 },
    glass_film: { n: 'Vidrio con película metálica',  l: 15, g: .8,  e: 6,   th: 1,  c: '#5aa7c9', sg: 1e4 },
    wood_glass: { n: 'Madera / vidrio (mezcla)',      l: 7,  g: .35, e: 3.5, th: 5,  c: '#d9962b', sg: .01 },
    brick:      { n: 'Ladrillo',                      l: 12, g: .5,  e: 4.5, th: 15, c: '#e2653a', sg: .03 },
    concrete:   { n: 'Concreto armado',               l: 20, g: .65, e: 6,   th: 20, c: '#7b8da3', sg: .1 },
    metal:      { n: 'Metal / espejo',                l: 25, g: .98, e: 0,   th: 2,  c: '#38b6ff', sg: 1e7 },
    body:       { n: 'Cuerpo humano / persona',       l: 4,  g: .35, e: 50,  th: 25, c: '#e8a0b4', sg: 1.7 },
    /* ── Materiales del pack visual v2 (valores típicos a 2.4 GHz; ajústalos con tus mediciones) ── */
    marble:         { n: 'Mármol / piedra pulida',        l: 9,  g: .55, e: 8,   th: 4,  c: '#e9e4f0', sg: .001 },
    wood_dark:      { n: 'Madera oscura (panel)',         l: 5,  g: .38, e: 2.3, th: 5,  c: '#6b4226', sg: .01 },
    plaster:        { n: 'Yeso con pintura de color',     l: 3,  g: .3,  e: 2.5, th: 10, c: '#d8a7a0', sg: .02 },
    brick_white:    { n: 'Ladrillo visto blanco',         l: 11, g: .5,  e: 4.5, th: 15, c: '#e9e5dc', sg: .03 },
    glass_tempered: { n: 'Cristal templado',              l: 4,  g: .4,  e: 6,   th: 1,  c: '#a8dcec', sg: .005 },
    mesh:           { n: 'Malla metálica',                l: 8,  g: .7,  e: 0,   th: 1,  c: '#9aa7b5', sg: 1e6 },
    green_wall:     { n: 'Pared verde (vegetal)',         l: 6,  g: .3,  e: 20,  th: 15, c: '#4f8f4a', sg: .5 },
    false_ceiling:  { n: 'Techo falso / panel ligero',    l: 2,  g: .25, e: 2.2, th: 2,  c: '#d9dde3', sg: .01 }
};
