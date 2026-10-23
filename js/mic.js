// Mikrofon → stabilně rozpoznané tóny. Volá onNote({ midi, cents, hz, onset }) asi 25× za sekundu,
// dokud tón zní; onset = true u nově zahraného tónu (jiná nota, po pauze nebo znovu brnknutá struna).
import { audio } from './audio.js';
import { detectPitch, freqToMidi } from './pitch.js';

const STABLE_FRAMES = 3; // tón musí vydržet ~120 ms, jinak problikává
// ponytail: práh nového úderu (o kolik musí hlasitost skočit) je odhad; když nepozná opakovaně brnknutou
// stejnou notu, snížit (např. 1.25), když hlásí falešné údery, zvýšit
const ATTACK = 1.4;

let mic = null;
export const micOn = () => !!mic;

function listen() {
  if (!mic) return;
  mic.raf = requestAnimationFrame(listen);
  const now = performance.now();
  if (now - mic.last < 40) return; // ~25 měření za sekundu stačí a šetří baterii
  mic.last = now;
  mic.analyser.getFloatTimeDomainData(mic.buf);

  const st = mic.state;
  let rms = 0;
  for (const v of mic.buf) rms += v * v;
  rms = Math.sqrt(rms / mic.buf.length);
  if (rms > 0.015 && rms > st.env * ATTACK) st.attack = true;
  st.env = Math.max(rms, st.env * 0.9); // obálka hlasitosti s pomalým poklesem

  const f = detectPitch(mic.buf, audio().sampleRate), m = f && Math.round(freqToMidi(f));
  if (!m || m < 50 || m > 90) { st.silent++; st.count = 0; return; }
  st.count = m === st.midi ? st.count + 1 : 1;
  st.midi = m;
  if (st.count < STABLE_FRAMES) return;
  const onset = m !== st.shown || st.silent > 3 || st.attack;
  st.shown = m;
  st.silent = 0;
  st.attack = false;
  mic.onNote({ midi: m, cents: Math.round(100 * (freqToMidi(f) - m)), hz: f, onset });
}

// vrací null, nebo text chyby pro uživatele
export async function startMic(onNote) {
  stopMic();
  try {
    const ctx = audio();
    await ctx.resume();
    // bez úprav signálu – potlačení šumu a ozvěny tón zkresluje
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    ctx.createMediaStreamSource(stream).connect(analyser);
    mic = { stream, analyser, onNote, buf: new Float32Array(analyser.fftSize), last: 0, state: { midi: null, count: 0, silent: 99, shown: null, env: 0, attack: false } };
    listen();
    return null;
  } catch (e) {
    return 'Mikrofon není dostupný: ' + (e.name === 'NotAllowedError' ? 'přístup zamítnut' : e.message || e.name);
  }
}

export function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach(t => t.stop());
  mic = null;
}
