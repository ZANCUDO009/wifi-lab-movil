/* ICONOS UI · física, medidores y secciones del panel (v2). viewBox 24×24, trazo currentColor, duotono con class="d". */
(() => {
const _f = (n, s) => Icons.add('ui', n, s);
/* pasos del proceso físico (línea de tiempo) */
_f('emit', '<circle class="d" cx="12" cy="12" r="3"/><path d="M5.600 5.600a9 9 0 000 12.800M18.400 5.600a9 9 0 010 12.800M8.400 8.400a5 5 0 000 7.200M15.600 8.400a5 5 0 010 7.200"/>');
_f('air', '<path d="M3 8h11a2.500 2.500 0 10-2.500-2.500M3 12h16a2.500 2.500 0 11-2.500 2.500M3 16h8"/>');
_f('wallx', '<rect class="d" x="9" y="3" width="6" height="18" rx="1"/><path d="M2.500 12h4.500M17 12h4.500M19.200 10l2.300 2-2.300 2"/>');
_f('hit', '<path d="M3 12h7"/><circle class="d" cx="13" cy="12" r="3"/><path d="M13 4v2.500M13 17.500V20M19 6l-1.800 1.800M19 18l-1.800-1.800"/>');
_f('reflect', '<path d="M3 19l8-8"/><path d="M11 11l8-8M3 3v18"/><path d="M15.500 3H19.500V7" />');
_f('turn', '<path class="d" d="M4 20V10h10V4l6 6-6 6v-4H8v8z"/>');
_f('arrive', '<circle class="d" cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r="1" stroke-width="2.600"/>');
/* insignias de calidad de señal (barras) */
_f('sig4', '<path class="d" d="M4 20v-3M9 20v-7M14 20V9M19 20V4" stroke-width="3"/>');
_f('sig3', '<path d="M4 20v-3M9 20v-7M14 20V9" stroke-width="3"/><path d="M19 20V4" stroke-width="3" opacity=".25"/>');
_f('sig2', '<path d="M4 20v-3M9 20v-7" stroke-width="3"/><path d="M14 20V9M19 20V4" stroke-width="3" opacity=".25"/>');
_f('sig1', '<path d="M4 20v-3" stroke-width="3"/><path d="M9 20v-7M14 20V9M19 20V4" stroke-width="3" opacity=".25"/>');
_f('sig0', '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4" stroke-width="3" opacity=".25"/><path d="M3 3l18 18"/>');
/* iconos de secciones del panel */
_f('layers', '<path class="d" d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17.500l9 5 9-5" />');
_f('radio', '<circle class="d" cx="12" cy="12" r="2.500"/><path d="M7.800 7.800a6 6 0 000 8.400M16.200 7.800a6 6 0 010 8.400M4.900 4.900a10 10 0 000 14.200M19.100 4.900a10 10 0 010 14.200"/>');
_f('sliders', '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h5M13 12h7"/><circle class="d" cx="15" cy="7" r="2"/><circle class="d" cx="9" cy="17" r="2"/><circle class="d" cx="11" cy="12" r="2"/>');
_f('walls', '<rect class="d" x="3" y="4" width="18" height="16" rx="1.500"/><path d="M3 9.300h18M3 14.600h18M9 4v5.300M15 9.300v5.300M9 14.600V20"/>');
_f('timeline', '<circle class="d" cx="6" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle class="d" cx="6" cy="19" r="2"/><path d="M6 7v3M6 14v3M11 5h9M11 12h7M11 19h9"/>');
_f('route', '<circle class="d" cx="5.500" cy="18.500" r="2.500"/><circle class="d" cx="18.500" cy="5.500" r="2.500"/><path d="M8 18.500h6a3.500 3.500 0 000-7h-4a3.500 3.500 0 010-7h6"/>');
_f('calc', '<rect class="d" x="5" y="3" width="14" height="18" rx="2"/><path d="M8.500 7h7M8.500 12h.01M12 12h.01M15.500 12h.01M8.500 16h.01M12 16h.01M15.500 16h.01" stroke-width="2"/>');
_f('gauge', '<path d="M4.500 17a8.500 8.500 0 1115 0"/><path class="d" d="M12 17l4-6" stroke-width="2.200"/><circle cx="12" cy="17" r="1.300"/>');
_f('pulse', '<path d="M3 12h4l2-6 4 12 2-6h6"/>');
_f('constellation', '<rect class="d" x="3.500" y="3.500" width="17" height="17" rx="2"/><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01" stroke-width="3"/>');
_f('cube', '<path class="d" d="M12 3l8 4.500v9L12 21l-8-4.500v-9z"/><path d="M4 7.500l8 4.500 8-4.500M12 12v9"/>');
_f('sparkle', '<path class="d" d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900z"/><path d="M19 15l.8 2.200L22 18l-2.200.8L19 21l-.8-2.200L16 18l2.200-.8z"/>');
_f('target-lock', '<circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>');
})();
