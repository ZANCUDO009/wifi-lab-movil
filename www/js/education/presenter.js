/* ── Modo presentador (DI-09) ── */
let presT = null, presS = 0;
ACT.present = () => {
  const p = $('pres'); p.style.display = 'block'; presS = Date.now();
  const draw = () => { const s = Math.floor((Date.now() - presS) / 1000), seg = SCRIPT3.findIndex(r => { const m = r[0].split('–')[1].split(':'); return s < +m[0] * 60 + +m[1]; }); p.innerHTML = `<div class="top"><b>Modo presentador</b><button data-a="presX" aria-label="Cerrar presentador">✕</button></div><div style="font:700 2rem monospace;text-align:center">${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}</div><div class="btns"><button data-a="presRst">Reiniciar</button><select data-ch="presLv" aria-label="Nivel"><option value="b"${S.level == 'b' ? ' selected' : ''}>Básico</option><option value="i"${S.level == 'i' ? ' selected' : ''}>Intermedio</option><option value="e"${S.level == 'e' ? ' selected' : ''}>Experto</option></select></div><hr>${SCRIPT3.map((r, i) => `<div class="st${i === seg ? ' a' : ''}"><b>${r[0]}</b> ${r[1]}<br><small>${r[2]}</small></div>`).join('')}<small>Atajos: <kbd>1</kbd>–<kbd>9</kbd> escenarios · <kbd>Espacio</kbd> pausa.</small>`; };
  draw(); clearInterval(presT); presT = setInterval(draw, 1000);
};
ACT.presX = () => { clearInterval(presT); $('pres').style.display = 'none'; };
ACT.presRst = () => { presS = Date.now(); };
CH.presLv = v => { S.level = v; panelsRefresh(); };

let WID = 0, WM = 0;
function wave(sc = 'cur') {
  const c0 = C, f = S.f * 1e9, lm = c0 / f, dx = lm / 10, dt = .99 * dx / (c0 * Math.SQRT2), nx = 320, ny = 240, N = nx * ny, mu = 4e-7 * Math.PI, e0 = 1 / (mu * c0 * c0), ch = dt / (mu * dx);
  const ox = Math.max(0, Math.min(S.W - nx * dx, S.tx.x - nx * dx / 2)), oy = Math.max(0, Math.min(S.H - ny * dx, S.tx.y - ny * dx / 2)), SG = {
    drywall: .02,
    wood: .01,
    glass: .005,
    glass_film: 1e4,
    wood_glass: .01,
    brick: .03,
    concrete: .1,
    metal: 1e7
  };
  let WL, sx, sy;
  const sl = (a, b) => ({
    x1: 2,
    y1: a,
    x2: 2,
    y2: b,
    m: 'metal',
    th: 2
  });
  if (sc == 'cur') {
    WL = S.walls.flatMap(w => wallPieces(w).map(p => ({ x1: p[0] - ox, y1: p[1] - oy, x2: p[2] - ox, y2: p[3] - oy, m: w.m, th: w.th })));
    sx = S.tx.x - ox;
    sy = S.tx.y - oy;
  } else {
    sx = .8;
    sy = 1.5;
    WL = sc == 'slit' ? [sl(0, 1.125), sl(1.375, 1.625), sl(1.875, 3)] : [sl(0, 1.05), sl(1.95, 3)];
  }
  const er = new Float32Array(N).fill(1), sg = new Float32Array(N), pec = new Uint8Array(N), mk = new Uint8Array(N), Ca = new Float32Array(N), Cb = new Float32Array(N), Ez = new Float32Array(N), Hx = new Float32Array(N), Hy = new Float32Array(N), I = new Float32Array(N);
  WL.forEach(w => {
    const hf = Math.max(w.th / 200, dx * .6), i0 = Math.max(0, Math.floor((Math.min(w.x1, w.x2) - hf) / dx)), i1 = Math.min(nx - 1, Math.ceil((Math.max(w.x1, w.x2) + hf) / dx)), j0 = Math.max(0, Math.floor((Math.min(w.y1, w.y2) - hf) / dx)), j1 = Math.min(ny - 1, Math.ceil((Math.max(w.y1, w.y2) + hf) / dx));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (dseg({ x: i * dx, y: j * dx }, w) < hf) {
          const k = j * nx + i;
          er[k] = MAT[w.m].e || 1;
          sg[k] = MAT[w.m].sg;
          pec[k] = MAT[w.m].sg >= 1e4 ? 1 : 0;
          mk[k] = 1;
        }
      }
    }
  });
  const coef = k => {
    if (pec[k]) {
      Ca[k] = 0;
      Cb[k] = 0;
      Ez[k] = 0;
      return;
    }
    const e = e0 * er[k], a = sg[k] * dt / (2 * e);
    Ca[k] = (1 - a) / (1 + a);
    Cb[k] = dt / (e * dx) / (1 + a);
  };
  for (let k = 0; k < N; k++) {
    coef(k);
  }
  const SP = [], B = 14;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const d = Math.min(i, j, nx - 1 - i, ny - 1 - j);
      if (d < B) {
        SP.push([j * nx + i, 1 - .15 * ((B - d) / B) ** 2]);
      }
    }
  }
  const src = Math.round(sy / dx) * nx + Math.round(sx / dx);
  let n = 0;
  const id = ++WID;
  open_(`<h2 style="margin:0">Modo Onda · ecuaciones de Maxwell (FDTD 2D)</h2><p><small>No hay rayos: reflexión, difracción e interferencia salen solas de las ecuaciones. Ventana de ${(nx * dx).toFixed(2)}×${(ny * dx).toFixed(2)} m a ${S.f} GHz (λ = ${(lm * 100).toFixed(2)} cm = 10 celdas). <b>Haz clic en el lienzo para poner un poste metálico.</b></small></p>
<div class="tabs"><select data-ch="waveSc"><option value="cur"${sc == 'cur' ? ' selected' : ''}>Escena actual (alrededor del Tx)</option><option value="slit"${sc == 'slit' ? ' selected' : ''}>Doble rendija (a = 25 cm)</option><option value="door"${sc == 'door' ? ' selected' : ''}>Puerta de 90 cm</option></select><label style="display:flex;gap:6px;align-items:center;margin:0;color:var(--t)"><input type="checkbox" ${WM ? ' checked' : ''} data-ch="waveWM"> Intensidad promedio (ver ondas estacionarias)</label><button data-a="waveRst" data-p="${sc}">↺ Reiniciar</button></div>
<canvas id="wv" width="640" height="480" style="aspect-ratio:4/3;width:auto;max-width:100%;max-height:60vh;display:block;margin:0 auto;border-radius:8px;cursor:crosshair"></canvas><p id="wvt"><small></small></p><small>Paredes: εr y σ por celda (metal = conductor perfecto). Bordes con capa amortiguadora. Rojo/naranja = campo Ez positivo, azul = negativo. Educativo: 2D, polarización TMz, sin calibración de potencia.</small>`);
  const cv2 = $('wv'), g = cv2.getContext('2d'), oc = document.createElement('canvas');
  oc.width = nx;
  oc.height = ny;
  const og = oc.getContext('2d'), im = og.createImageData(nx, ny), D = im.data;
  let am = 1;
  cv2.onpointerdown = e => {
    const r = cv2.getBoundingClientRect(), ci = Math.round((e.clientX - r.left) / r.width * nx), cj = Math.round((e.clientY - r.top) / r.height * ny);
    for (let j = cj - 5; j <= cj + 5; j++) {
      for (let i = ci - 5; i <= ci + 5; i++) {
        if (i > 0 && j > 0 && i < nx - 1 && j < ny - 1 && (i - ci) ** 2 + (j - cj) ** 2 <= 25) {
          const k = j * nx + i;
          pec[k] = 1;
          mk[k] = 1;
          coef(k);
        }
      }
    }
  };
  function step() {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const k = j * nx + i;
        Hx[k] -= ch * (Ez[k + nx] - Ez[k]);
        Hy[k] += ch * (Ez[k + 1] - Ez[k]);
      }
    }
    for (let j = 1; j < ny; j++) {
      for (let i = 1; i < nx; i++) {
        const k = j * nx + i;
        Ez[k] = Ca[k] * Ez[k] + Cb[k] * ((Hy[k] - Hy[k - 1]) - (Hx[k] - Hx[k - nx]));
      }
    }
    Ez[src] += Math.sin(2 * Math.PI * f * n * dt);
    n++;
    for (const [k, v] of SP) {
      Ez[k] *= v;
      Hx[k] *= v;
      Hy[k] *= v;
    }
    for (let k = 0; k < N; k++) {
      I[k] = I[k] * .996 + Ez[k] * Ez[k] * .004;
    }
  }
  function paint() {
    let mx = 1e-6, mi = 1e-12;
    for (let k = 0; k < N; k++) {
      const a = Math.abs(Ez[k]);
      if (a > mx) {
        mx = a;
      }
      if (I[k] > mi) {
        mi = I[k];
      }
    }
    am = am * .9 + mx * .1;
    for (let k = 0; k < N; k++) {
      let r, gg, b;
      if (WM) {
        const t = Math.max(0, Math.min(1, (10 * Math.log10(I[k] / mi + 1e-6) + 45) / 45)), c = hcol(-90 + 50 * t);
        r = c[0];
        gg = c[1];
        b = c[2];
      } else {
        const v = Math.max(-1, Math.min(1, Ez[k] / (am * .8))), a = Math.abs(v), t = v > 0 ? [245, 185, 66] : [77, 163, 255];
        r = 13 + (t[0] - 13) * a;
        gg = 21 + (t[1] - 21) * a;
        b = 32 + (t[2] - 32) * a;
      }
      if (mk[k]) {
        const m = pec[k] ? .85 : .5;
        r += (170 - r) * m;
        gg += (180 - gg) * m;
        b += (195 - b) * m;
      }
      D[k * 4] = r;
      D[k * 4 + 1] = gg;
      D[k * 4 + 2] = b;
      D[k * 4 + 3] = 255;
    }
    og.putImageData(im, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(oc, 0, 0, 640, 480);
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(sx / dx * 2, sy / dx * 2, 5, 0, 7);
    g.fill();
    $('wvt').innerHTML = '<small>Paso ' + n + ' · t = ' + (n * dt * 1e9).toFixed(2) + ' ns · la onda avanza ' + (c0 * dt * 100).toFixed(2) + ' cm por paso</small>';
  }
  (function fr() {
    if (id !== WID || !$('wv') || !$('mi').classList.contains('on')) {
      return;
    }
    for (let s = 0; s < 5; s++) {
      step();
    }
    paint();
    requestAnimationFrame(fr);
  })();
}

CH.waveSc = v => wave(v);
CH.waveWM = (v, el) => { WM = el.checked ? 1 : 0; };
ACT.waveRst = sc => wave(sc);
ACT.wave = () => wave('cur');

