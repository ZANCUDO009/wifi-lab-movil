/* ── Plano importado (EJ-20) ── */
function planLoad(el) {
  const f = el.files[0]; if (!f) return; if (f.size > 6e6) { hint('Imagen demasiado grande (máx. 6 MB)'); return; }
  const rd = new FileReader();
  rd.onload = () => { const img = new Image(); img.onload = () => { planImg = { img, x: 0, y: 0, w: S.W, op: .55 }; S.layers.plan = 1; planUpdate(true); hint('Plano importado: ajusta el ancho real con el deslizador para calibrar la escala, y calca las paredes con «Dibujar pared»', 7000); }; img.onerror = () => hint('No se pudo leer la imagen'); img.src = rd.result; };
  rd.readAsDataURL(f); el.value = '';
}
function planUpdate(init) {
  const c = $('planCtl'); if (!planImg) { c.style.display = 'none'; return; } c.style.display = '';
  if (!init) { planImg.w = +$('planW').value; planImg.op = +$('planO').value; } else { $('planW').value = planImg.w; $('planO').value = planImg.op; }
  $('v_planW').textContent = planImg.w.toFixed(1) + ' m'; $('cEsc').open = true;
}
ACT.planClear = () => { planImg = null; planUpdate(); };

