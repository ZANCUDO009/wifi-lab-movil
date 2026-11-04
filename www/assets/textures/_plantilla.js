/* ════════════════════════════════════════════════════════════════════
   PLANTILLA DE TEXTURA · copia este archivo con el id de tu material.
   Ejemplo: para el material 'marmol' (definido en js/data/materials.js)
   guarda una copia como  assets/textures/marmol.js  y cambia 'MI_ID'.
   Después agrega  <script src="assets/textures/marmol.js"></script>
   en index.html (bloque «TEXTURAS») y en galeria.html.
   ────────────────────────────────────────────────────────────────────
   draw(g, w, h, u)
     g  contexto 2D de un canvas de 256×256 px (= 1 metro de pared)
     w,h  ancho y alto (256)
     u  ayudas:
        u.r()            azar 0..1 (con semilla: siempre sale igual)
        u.rr(a,b)        azar entre a y b
        u.hsl(h,s,l,a)   texto de color hsl
        u.shade(hex,amt) aclara (+) u oscurece (−) un color (-1..1)
        u.grain(n)       granulado fino sobre lo ya dibujado
        u.scatter(n,fn)  reparte n elementos SIN costuras en los bordes
        u.wrap(fn)       dibuja fn(g) también en los bordes opuestos
   Consejo: dibuja cosas que «se acaben» justo en el borde (juntas, marcos)
   y la textura se verá continua cuando se repita por toda la pared.
   ════════════════════════════════════════════════════════════════════ */
Textures.define('MI_ID', {
  tile: 1,        // metros que cubre la textura
  alpha: .95,     // opacidad en 3D (usa ~.5 para cosas transparentes)
  draw(g, w, h, u) {
    g.fillStyle = '#ff00aa'; g.fillRect(0, 0, w, h);             // color base
    u.scatter(300, (g, x, y, a) => { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, 2 + a * 4, 2 + a * 4); });
    u.grain(12);
  }
});
