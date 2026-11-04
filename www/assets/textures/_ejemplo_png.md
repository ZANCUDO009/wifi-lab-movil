# Cómo usar una imagen propia (PNG/JPG) como textura

1. Crea una imagen **cuadrada y repetible** (256×256 o 512×512 px). Que los bordes opuestos
   encajen entre sí para que no se vea la costura al repetirla.
2. Guárdala en esta carpeta: `assets/textures/marmol_negro.png`.
3. Crea `assets/textures/marmol_negro.js` con:

```js
Textures.define('marmol_negro', {
  image: 'assets/textures/marmol_negro.png',   // ruta RELATIVA a index.html
  tile: 1,        // metros que cubre la imagen
  alpha: .95,
  bump: .15,      // relieve simulado opcional (0 = liso)
  // draw() es opcional: se usa como respaldo mientras la imagen carga o si falla
});
```
4. Añade el material en `js/data/materials.js` (id `marmol_negro`) y su `<script>` en
   `index.html` y `galeria.html`.

Notas: sin servidor (doble clic en index.html) algunos navegadores marcan el lienzo como
«contaminado» al usar PNG propios y no dejan exportar PNG del plano; con Live Server o
`python -m http.server` funciona sin problemas.
