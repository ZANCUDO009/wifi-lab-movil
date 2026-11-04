/* ── Bitácora (DI-08) ── */
ACT.logNow = () => { const d = S.cov; logEv(`Resultado: Rx ${S.paths.tot.toFixed(1)} dBm · ${linkOf(S.paths).use.toFixed(0)} Mbps útiles${d ? ` · cobertura ≥ −67 dBm ${d.c67.toFixed(0)} %` : ''}`); lab('b'); };
ACT.logClr = () => { LOG.length = 0; lab('b'); };
ACT.logExp = () => {
  const d = S.cov, st = measStats(), md = `# Reporte de laboratorio · Wi-Fi Lab\n\nFecha: ${new Date().toLocaleString('es')}\n\n## Escenario\n- Banda: ${S.f} GHz · ancho ${S.bw} MHz · ${S.aps.length} equipo(s) · plano ${S.W}×${S.H} m · ${S.walls.length} pared(es)\n- Modelo: ${S.coh ? 'coherente' : 'incoherente'}, ${S.bn} reflexiones, exponente n = ${S.pln}, calibración ${S.off} dB\n\n## Resultado actual\n- Potencia recibida: ${S.paths.tot.toFixed(1)} dBm · velocidad útil estimada: ${linkOf(S.paths).use.toFixed(0)} Mbps\n${d ? `- Cobertura ≥ −67 dBm: ${d.c67.toFixed(1)} % · 10 % peor: ${d.p10.toFixed(1)} dBm\n` : ''}${st ? `\n## Validación (${st.n} puntos)\n- Sesgo ${st.bias.toFixed(1)} dB · MAE ${st.mae.toFixed(1)} dB · RMSE ${st.rmse.toFixed(1)} dB · R² ${st.r2 === null ? '—' : st.r2.toFixed(2)}\n` : ''}\n## Bitácora\n${LOG.map(l => `- ${l.t} — ${l.e}`).join('\n') || '- (vacía)'}\n\n## Límites\nModelo 2D de trazado de rayos educativo; velocidades estimadas; valores de materiales de referencia.\n`;
  dl(new Blob([md], { type: 'text/markdown' }), 'reporte_laboratorio.md');
};

