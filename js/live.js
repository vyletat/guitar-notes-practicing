// Stránka Volná hra: mikrofon → rozpoznaný tón v osnově, na hmatníku a v ladičce.
import { OPEN, positions, spell, labelOf, octName } from './music.js';
import { preferFlats } from './store.js';
import { audio, play } from './audio.js';
import { $, drawStaff, drawFretboard } from './draw.js';
import { detectPitch, freqToMidi } from './pitch.js';

const STAFF_WIDTH = 570, HISTORY = 12;
let mic = null, played = [];
// count = kolik měření po sobě dalo stejný tón; silent = kolik měření bylo ticho
let live = { midi: null, count: 0, silent: 99, shown: null };

function showNote(m, cents = null, hz = null) {
  const n = spell(m, preferFlats());
  $('#liveNote').textContent = labelOf(m, preferFlats());
  $('#liveInfo').textContent = octName(n.step, n.acc) + (hz ? ` · ${hz.toFixed(1)} Hz · ${cents > 0 ? '+' : ''}${cents} ct` : '');
  $('#tunerNeedle').style.left = `${50 + (cents ?? 0)}%`;
  $('#tunerNeedle').classList.toggle('in', cents !== null && Math.abs(cents) <= 5);
  drawFretboard($('#liveFret'), positions(m).map(([s, f]) => ({ s, f, cls: 'target' })), { onClick: tapFret });
}

function drawPlayed() {
  const notes = played.map((m, i) => ({ ...spell(m, preferFlats()), x: 90 + i * 40, cls: i === played.length - 1 ? 'target' : '' }));
  drawStaff($('#liveStaff'), notes, { width: STAFF_WIDTH });
}
function addPlayed(m) {
  played = [...played, m].slice(-HISTORY);
  drawPlayed();
}

function tapFret(s, f) {
  const m = OPEN[s] + f;
  play(m);
  showNote(m);
  addPlayed(m);
}

function listen() {
  if (!mic) return;
  mic.raf = requestAnimationFrame(listen);
  const now = performance.now();
  if (now - mic.last < 40) return; // ~25 měření za sekundu stačí a šetří baterii
  mic.last = now;
  mic.analyser.getFloatTimeDomainData(mic.buf);
  const f = detectPitch(mic.buf, audio().sampleRate), m = f && Math.round(freqToMidi(f));
  if (!m || m < 50 || m > 90) { live.silent++; live.count = 0; return; }
  live.count = m === live.midi ? live.count + 1 : 1;
  live.midi = m;
  if (live.count < 3) return; // tón musí chvíli vydržet, jinak problikává
  showNote(m, Math.round(100 * (freqToMidi(f) - m)), f);
  if (m !== live.shown || live.silent > 3) addPlayed(m); // nový tón, nebo znovu zahraný po pauze
  live.shown = m;
  live.silent = 0;
}

async function startMic() {
  try {
    const ctx = audio();
    await ctx.resume();
    // bez úprav signálu – potlačení šumu a ozvěny tón zkresluje
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    ctx.createMediaStreamSource(stream).connect(analyser);
    mic = { stream, analyser, buf: new Float32Array(analyser.fftSize), last: 0 };
    $('#micBtn').textContent = 'Vypnout mikrofon';
    $('#liveInfo').textContent = 'Poslouchám… zahraj tón';
    listen();
  } catch (e) {
    $('#liveInfo').textContent = 'Mikrofon není dostupný: ' + (e.name === 'NotAllowedError' ? 'přístup zamítnut' : e.message || e.name);
  }
}

function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach(t => t.stop());
  mic = null;
  $('#micBtn').textContent = 'Zapnout mikrofon';
}

$('#micBtn').onclick = () => mic ? stopMic() : startMic();
$('#liveClear').onclick = () => { played = []; drawPlayed(); };

export function show() {
  played = [];
  drawPlayed();
  drawFretboard($('#liveFret'), [], { onClick: tapFret });
}
export const hide = stopMic;
