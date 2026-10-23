// Záložka Hra → Metronom: tempo, takt, ťukání do rytmu a světelné zobrazení dob.
import { cfg, saveCfg } from './store.js';
import { startMetronome, stopMetronome, setMetronome, metronomeOn } from './audio.js';
import { $, $$ } from './draw.js';

const MIN = 30, MAX = 240;
const TEMPO_NAMES = [[60, 'Largo'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [168, 'Allegro'], [Infinity, 'Presto']];
let taps = [];

function render() {
  $('#bpmValue').textContent = cfg.metroBpm;
  $('#bpmRange').value = cfg.metroBpm;
  $('#beatsSel').value = cfg.metroBeats;
  $('#tempoName').textContent = TEMPO_NAMES.find(([max]) => cfg.metroBpm < max)[1];
  $('#beatDots').innerHTML = Array.from({ length: cfg.metroBeats }, (_, i) => `<i class="${i ? '' : 'first'}"></i>`).join('');
  $('#metroStart').textContent = metronomeOn() ? '■ Zastavit' : '▶ Spustit';
  $('#metroStart').classList.toggle('on', metronomeOn());
}

function setBpm(bpm) {
  cfg.metroBpm = Math.round(Math.min(MAX, Math.max(MIN, bpm)));
  saveCfg();
  setMetronome({ bpm: cfg.metroBpm });
  render();
}

// rozsvítí aktuální dobu
function flash(beat) {
  $$('#beatDots i').forEach((dot, i) => dot.classList.toggle('lit', i === beat));
}

function toggle() {
  if (metronomeOn()) { stopMetronome(); flash(-1); }
  else startMetronome({ bpm: cfg.metroBpm, beats: cfg.metroBeats, onBeat: flash });
  render();
}

// tempo z posledních (až 4) intervalů mezi klepnutími; po 2 s pauze se začíná znovu
function tap() {
  const now = performance.now();
  if (now - (taps.at(-1) ?? 0) > 2000) taps = [];
  taps = [...taps, now].slice(-5);
  if (taps.length > 1) setBpm(60000 / ((taps.at(-1) - taps[0]) / (taps.length - 1)));
}

$('#bpmMinus').onclick = () => setBpm(cfg.metroBpm - 1);
$('#bpmPlus').onclick = () => setBpm(cfg.metroBpm + 1);
$('#bpmRange').oninput = e => setBpm(+e.target.value);
$('#beatsSel').onchange = e => {
  cfg.metroBeats = +e.target.value;
  saveCfg();
  setMetronome({ beats: cfg.metroBeats });
  render();
};
$('#tapBtn').onclick = tap;
$('#metroStart').onclick = toggle;
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !$('#metronome').hidden && e.target.tagName !== 'BUTTON') { e.preventDefault(); toggle(); }
});

export const show = render;
export function hide() {
  stopMetronome();
  flash(-1);
  render();
}
