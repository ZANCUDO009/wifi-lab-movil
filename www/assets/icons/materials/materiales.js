/* ICONOS MATERIALES · un icono por id de js/data/materials.js.
   Se muestran en el panel de la pared seleccionada y en las tablas del laboratorio.
   Para un material nuevo añade aquí:  Icons.add('materials', 'mi_id', '<path .../>'); */
(() => {
const _m = (n, s) => Icons.add('materials', n, s);
_m('drywall', '<rect class=\"d\" x="3.500" y="4" width="17" height="16" rx="1.500"/><path d="M12 4v16M7 8h.01M7 16h.01M17 8h.01M17 16h.01" stroke-width="2.200"/>');
_m('wood', '<rect class=\"d\" x="3.500" y="4" width="17" height="16" rx="1.500"/><path d="M9.200 4v16M14.800 4v16M6.400 8c.8 2 .8 5 0 8M12 7c-.7 2-.7 6 0 9"/>');
_m('glass', '<rect class=\"d\" x="4" y="3.500" width="16" height="17" rx="1.500"/><path d="M8 16l5-8M12 18l5.500-9"/>');
_m('glass_film', '<rect class=\"d\" x="4" y="3.500" width="16" height="17" rx="1.500" fill="currentColor" fill-opacity=".22"/><path d="M8 16l5-8M12 18l5.500-9"/><path d="M4 12h16" stroke-dasharray="2 2"/>');
_m('wood_glass', '<rect class=\"d\" x="4" y="3" width="16" height="18" rx="1.500"/><rect x="7" y="6" width="4" height="5" rx=".5"/><rect x="13" y="6" width="4" height="5" rx=".5"/><rect x="7" y="13" width="4" height="5" rx=".5"/><rect x="13" y="13" width="4" height="5" rx=".5"/>');
_m('brick', '<rect class=\"d\" x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.700h18M3 14.300h18M9 5v4.700M15 5v4.700M6 9.700v4.600M12 9.700v4.600M18 9.700v4.600M9 14.300V19M15 14.300V19"/>');
_m('concrete', '<rect class=\"d\" x="3.500" y="4.500" width="17" height="15" rx="1.500"/><path d="M8 9h.01M15 8h.01M11 12.500h.01M17 14h.01M7.500 16h.01M13.500 16.500h.01" stroke-width="2.600"/>');
_m('metal', '<rect class=\"d\" x="3.500" y="4.500" width="17" height="15" rx="1.500"/><path d="M8 4.500v15M12 4.500v15M16 4.500v15"/><path d="M5.800 7h.01M5.800 17h.01M18.200 7h.01M18.200 17h.01" stroke-width="2.400"/>');
_m('body', '<circle class=\"d\" cx="12" cy="7.500" r="3.500"/><path d="M5 20.500c0-4.200 3-7 7-7s7 2.800 7 7"/>');
_m('marble', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M8 4c2 4-1 6 1 9s-1 5 1 7M15 4c-2 3 1 6-1 9\"/>');
_m('wood_dark', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M8.700 4v16M13.300 4v16M17 4v16M6 9c1 2 1 4 0 6M11 8c-1 3-1 5 0 8\"/>');
_m('plaster', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M7 9c3-1.500 5 1.500 8 0M7 14c3-1.500 5 1.500 8 0\"/><path d=\"M17.500 16.500l-2.200 2.200\"/>');
_m('brick_white', '<rect class=\"d\" x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"1\"/><path d=\"M3 9.700h18M3 14.300h18M9 5v4.700M15 5v4.700M6 9.700v4.600M12 9.700v4.600M18 9.700v4.600M9 14.300V19M15 14.300V19\" stroke-dasharray=\"3 1.500\"/>');
_m('glass_tempered', '<rect class=\"d\" x=\"4\" y=\"3.500\" width=\"16\" height=\"17\" rx=\"1.500\"/><path d=\"M7 6h.01M17 6h.01M7 18h.01M17 18h.01\" stroke-width=\"2.600\"/><path d=\"M9 15l4-6\"/>');
_m('mesh', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M3.500 9l8.500 11M3.500 4l17 16M12 4l8.500 11M20.500 9L12 20M20.500 4L3.500 20M12 4L3.500 15\"/>');
_m('green_wall', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M12 19c-4 0-6-3-6-6 4 0 6 2 6 6zM12 13c0-4 2-6 6-6 0 4-2 6-6 6z\"/>');
_m('false_ceiling', '<rect class=\"d\" x=\"3.500\" y=\"4\" width=\"17\" height=\"16\" rx=\"1.500\"/><path d=\"M12 4v16M3.500 12h17M7 8h.01M16 8h.01M7 16h.01M16 16h.01\" stroke-width=\"2.200\"/>');
})();
