/* ════════════════════════════════════════════════════════════════════
   MOTOR DE ICONOS · registro de iconos SVG organizados por categoría.
   Las categorías son carpetas en assets/icons/:
       ui/         botones y menús del programa
       devices/    objetos que se dibujan en el plano 2D/3D (routers, equipos)
       materials/  un icono por material de pared

   Cada archivo registra sus iconos así (viewBox 24×24, trazo currentColor):
       Icons.add('ui', 'play', '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>');

   Usos:
     · HTML estático:    <span data-ic="ui.wifi"></span>
     · Texto dinámico:   Icons.svg('ui', 'play')            → cadena <svg> en línea
     · Canvas 2D/3D:     Icons.draw(cx, 'devices', 'router', x, y, 22, '#fff')
     · Emojis antiguos:  assets/icons/ui/_emoji-map.js los cambia solos por iconos
   ════════════════════════════════════════════════════════════════════ */
const Icons = (() => {
  'use strict';
  const reg = {}, imgs = {}; let emap = {}, emRx = null;
  const add = (cat, name, inner) => { reg[cat + '.' + name] = inner; };
  const has = (cat, name) => !!reg[cat + '.' + name];
  const list = cat => Object.keys(reg).filter(k => k.startsWith(cat + '.')).map(k => k.slice(cat.length + 1));
  const cats = () => [...new Set(Object.keys(reg).map(k => k.split('.')[0]))];

  /** Icono SVG en línea (hereda el color del texto con currentColor). */
  function svg(cat, name, o = {}) {
    const inner = reg[cat + '.' + name]; if (!inner) return '';
    const sz = o.size ? ` width="${o.size}" height="${o.size}"` : '';
    const duo = inner.indexOf('class="d"') >= 0 ? ' ic-duo' : '';
    return `<svg class="ic ic-${cat}${duo}${o.anim ? ' ic-anim' : ''}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 24 24"${sz} fill="none" stroke="currentColor" stroke-width="${o.sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /** Imagen para canvas con un color fijo (los canvas no entienden currentColor). Se cachea. */
  function img(cat, name, color = '#fff', px = 48) {
    const k = cat + '.' + name + '|' + color + '|' + px; if (imgs[k]) return imgs[k];
    const inner = reg[cat + '.' + name]; if (!inner) return null;
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><style>.d{fill:${color};fill-opacity:.3}</style>${inner.replace(/currentColor/g, color)}</svg>`;
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    return (imgs[k] = im);
  }
  /** Dibuja un icono centrado en (x,y) con lado `size` px (si aún no cargó, se dibujará en el siguiente cuadro). */
  function draw(cx, cat, name, x, y, size, color) {
    const im = img(cat, name, color, 64);
    if (im && im.complete && im.naturalWidth) cx.drawImage(im, x - size / 2, y - size / 2, size, size);
  }

  /** Emojis → iconos: mapa { '🔥': 'flame', … } de la categoría ui. */
  function emoji(map) {
    Object.assign(emap, map);
    emRx = new RegExp('(' + Object.keys(emap).sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\uFE0F?', 'g');
  }
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'SELECT', 'TITLE', 'CANVAS', 'SVG', 'INPUT']);
  function decorateNode(root) {
    if (!emRx || !root) return;
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || SKIP.has(root.tagName.toUpperCase())) return;
    if (root.matches && root.matches('[data-ic]')) fillStatic(root);
    root.querySelectorAll && root.querySelectorAll('[data-ic]').forEach(fillStatic);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentNode && !SKIP.has(n.parentNode.nodeName.toUpperCase()) && n.nodeValue && (emRx.lastIndex = 0, emRx.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const hits = []; while (w.nextNode()) hits.push(w.currentNode);
    hits.forEach(fixText);
  }
  function fixText(node) {
    if (!node.parentNode || SKIP.has(node.parentNode.nodeName.toUpperCase())) return;
    const txt = node.nodeValue; emRx.lastIndex = 0; if (!emRx.test(txt)) return;
    emRx.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = emRx.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const name = emap[m[1]], sp = document.createElement('span'); sp.className = 'ic-wrap'; sp.innerHTML = svg('ui', name) || m[1]; frag.appendChild(sp);
      last = m.index + m[0].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function fillStatic(el) { const [c, n] = (el.getAttribute('data-ic') || '').split('.'); if (c && n && !el.firstChild) el.innerHTML = svg(c, n); }

  /** Se llama una vez cuando todo el HTML y los archivos de iconos ya cargaron. */
  function start() {
    decorateNode(document.body);
    new MutationObserver(ms => ms.forEach(m => { if (m.type === 'characterData') fixText(m.target); else m.addedNodes.forEach(decorateNode); }))
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', start);

/** Auditoría de estilo (v2): detecta iconos que se salen de las reglas del libro de estilo (ver galeria.html). */
  function audit() {
    const out = [];
    Object.keys(reg).forEach(k => {
      const s = reg[k], p = [];
      if (/stroke-width="(?!2\.[2-9]|3)[\d.]+"/.test(s) && !/stroke-width="(1\.[5-9]|2)"/.test(s)) p.push('grosor de trazo propio');
      if (/stroke="#|stroke="rgb|fill="#|fill="rgb/.test(s)) p.push('color fijo (usa currentColor)');
      if (/viewBox|<svg/.test(s)) p.push('no debe incluir <svg>/viewBox');
      if (/stroke-linecap="(butt|square)"/.test(s)) p.push('extremos no redondeados');
      const attrs = [...s.matchAll(/\b(?:x|y|cx|cy|width|height|x1|x2|y1|y2)="(-?[\d.]+)"/g)].map(m => +m[1]); if (attrs.some(n => n > 24.01 || n < -0.01)) p.push('coordenadas fuera de 24×24');
      if (p.length) out.push({ icon: k, problemas: p });
    });
    return out;
  }
  return { add, has, list, cats, svg, img, draw, emoji, decorateNode, start, audit };
})();
