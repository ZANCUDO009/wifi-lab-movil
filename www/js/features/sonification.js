/* ── Sonificación (UX-21): el tono sube con la potencia recibida ── */
const sound = {
  on: false, ac: null, osc: null, gain: null,
  toggle() {
    if (this.on) {
      try { this.ac = this.ac || new (window.AudioContext || window.webkitAudioContext)(); this.osc = this.ac.createOscillator(); this.gain = this.ac.createGain(); this.gain.gain.value = .04; this.osc.type = 'sine'; this.osc.connect(this.gain); this.gain.connect(this.ac.destination); this.osc.start(); soundUpdate(); } catch (e) { this.on = false; hint('Audio no disponible'); }
    } else if (this.osc) { try { this.osc.stop(); } catch (e) { } this.osc = null; }
  }
};
function soundUpdate() { if (sound.on && sound.osc) sound.osc.frequency.value = 180 + clamp((S.paths.tot + 100) / 60, 0, 1) * 900; }

