/* ICONOS DISPOSITIVOS v2 · más detalle y duotono.
   Convención duotono: los elementos con class="d" se rellenan con un segundo tono (translúcido).
   Convención animada: los arcos de onda llevan class="w1", "w2", "w3" y se animan cuando el icono
   se pide con { anim: true } (ver css/09-icons.css). Se usan en el plano si existen (ver deviceIcon). */
(() => {
const _d = (n, s) => Icons.add('devices', n, s);
_d('router_v2', '<rect class="d" x="3" y="14.500" width="18" height="6" rx="2"/><path d="M6.500 14.500L5.200 8.500M17.500 14.500l1.300-6"/><path d="M7 17.500h.01M10 17.500h.01M17 17.500h-3" stroke-width="2.400"/><path class="w1" d="M10 10.300a2.800 2.800 0 014 0"/><path class="w2" d="M8 7.800a6 6 0 018 0"/><path class="w3" d="M6 5.300a9 9 0 0112 0"/>');
_d('ap_ceiling_v2', '<ellipse class="d" cx="12" cy="17.500" rx="8.500" ry="3"/><path d="M3.500 17.500V16c0-1.700 3.800-3 8.500-3s8.500 1.300 8.500 3v1.500"/><path d="M12 16.200h.01M8.500 17.200h.01M15.500 17.200h.01" stroke-width="2.400"/><path class="w1" d="M10.200 10.500a2.600 2.600 0 013.600 0"/><path class="w2" d="M8 8a6 6 0 018 0"/><path class="w3" d="M5.800 5.500a9.200 9.200 0 0112.400 0"/>');
_d('mesh_v2', '<rect class="d" x="7" y="9.500" width="10" height="11" rx="3.500"/><path d="M12 14.500h.01M12 17.500h.01" stroke-width="2.600"/><path d="M9.500 12.200h5"/><path class="w1" d="M9.800 6.800a3.200 3.200 0 014.400 0"/><path class="w2" d="M7.600 4.400a6.600 6.600 0 018.800 0"/>');
_d('repeater_v2', '<rect class="d" x="7" y="9" width="10" height="10" rx="2.200"/><path d="M10 9V5.500M14 9V5.500M12 19v2M9 21h6"/><path d="M12 14h.01" stroke-width="2.600"/><path class="w1" d="M4.800 12a3.800 3.800 0 000 4"/><path class="w2" d="M2.800 10.500a6.500 6.500 0 000 7"/><path class="w1" d="M19.200 12a3.800 3.800 0 010 4"/><path class="w2" d="M21.200 10.500a6.500 6.500 0 010 7"/>');
})();
