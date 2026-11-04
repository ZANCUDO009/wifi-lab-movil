/* ICONOS DISPOSITIVOS · equipos emisores (se dibujan en blanco sobre un círculo de color en el plano).
   Nombres usados por el simulador: router, ap_ceiling, mesh, repeater, interferer.
   La tabla equipo→icono está en js/render/draw2d.js (función deviceIcon). */
Icons.add('devices', 'router', '<rect x="3" y="14.500" width="18" height="6" rx="2"/><path d="M7 17.500h.01M10 17.500h.01" stroke-width="2.600"/><path d="M6.500 14.500V9M17.500 14.500V9"/><path d="M9.500 9.800a3.500 3.500 0 015 0M7.200 7a7 7 0 019.600 0"/>');
Icons.add('devices', 'ap_ceiling', '<ellipse cx="12" cy="17.500" rx="8.500" ry="3"/><path d="M5 17.500V16c0-1.700 3.400-3 7-3s7 1.300 7 3v1.500"/><path d="M9 9.200a4.200 4.200 0 016 0M6.800 6.300a7.500 7.500 0 0110.400 0"/><path d="M12 16.200h.01" stroke-width="2.600"/>');
Icons.add('devices', 'mesh', '<rect x="7.500" y="9.500" width="9" height="11" rx="3"/><path d="M12 15h.01M12 18h.01" stroke-width="2.600"/><path d="M9.200 6.300a4 4 0 015.600 0M6.800 3.800a7.500 7.500 0 0110.400 0"/>');
Icons.add('devices', 'repeater', '<rect x="7" y="9" width="10" height="10" rx="2.200"/><path d="M10 9V5.500M14 9V5.500M12 19v2"/><path d="M12 14h.01" stroke-width="2.600"/><path d="M3.500 11.500a4 4 0 000 5M20.500 11.500a4 4 0 010 5"/>');
Icons.add('devices', 'interferer', '<path d="M13.500 2.800L5.500 13.500H11L10 21.200l8.500-11.500H13z"/>');
