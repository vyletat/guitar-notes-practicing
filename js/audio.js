// Jednoduchý syntetický tón a metronom. AudioContext se vytváří až po první akci uživatele (pravidla prohlížečů).
let ac;
export const audio = () => (ac ??= new AudioContext());

const voices = new Set(); // znějící a naplánované tóny, aby šly zastavit

export function play(midi, delay = 0) {
  const ctx = audio(), o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + delay;
  o.type = 'triangle';
  o.frequency.value = 440 * 2 ** ((midi - 12 - 69) / 12); // zní o oktávu níž, než je psáno
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + 1.5);
  const voice = { o, g };
  voices.add(voice);
  o.onended = () => voices.delete(voice);
}

// ---------- přehrávání sekvencí s tlačítkem ▶ Přehrát / ■ Zastavit ----------
let playing = null; // { btn, label, timer }

// seq = pole akordů (každý = pole MIDI), step = rozestup v sekundách
export function togglePlayback(btn, seq, step) {
  const same = playing?.btn === btn;
  stopPlayback();
  if (same || !seq.length) return;
  seq.forEach((chord, i) => chord.forEach((m, j) => play(m, i * step + j * 0.05)));
  playing = { btn, label: btn.textContent, timer: setTimeout(stopPlayback, ((seq.length - 1) * step + 1.5) * 1000) };
  btn.textContent = '■ Zastavit';
}

export function stopPlayback() {
  if (!ac) return; // ještě nic nehrálo
  const t = ac.currentTime;
  for (const { o, g } of voices) { // rychlé ztlumení místo useknutí, aby to necvaklo
    g.gain.cancelScheduledValues(t);
    g.gain.setTargetAtTime(0, t, 0.015);
    try { o.stop(t + 0.1); } catch {}
  }
  voices.clear();
  if (!playing) return;
  clearTimeout(playing.timer);
  playing.btn.textContent = playing.label;
  playing = null;
}

// krátké cvaknutí metronomu v čase `when` (ctx.currentTime), první doba taktu vyšší
function click(accent, when) {
  const ctx = audio(), o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(0.15, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.04);
  o.connect(g).connect(ctx.destination);
  o.start(when);
  o.stop(when + 0.05);
}

// ---------- metronom ----------
// Údery se plánují dopředu přes hodiny Web Audio (přesné), časovač je jen budí každých 25 ms.
// Ve skryté záložce prohlížeč časovače brzdí, takže metronom může zaváhat – pak je potřeba mít aplikaci na obrazovce.
const metro = { timer: null, bpm: 80, beats: 4, beat: 0, next: 0, onBeat: null };
export const metronomeOn = () => !!metro.timer;

function schedule() {
  const ctx = audio();
  while (metro.next < ctx.currentTime + 0.1) {
    const beat = metro.beat % metro.beats;
    click(beat === 0, metro.next);
    const onBeat = metro.onBeat; // vizuální údaj ve chvíli, kdy úder opravdu zazní
    if (onBeat) setTimeout(() => metronomeOn() && onBeat(beat), Math.max(0, (metro.next - ctx.currentTime) * 1000));
    metro.next += 60 / metro.bpm;
    metro.beat++;
  }
}

// bpm = údery za minutu, beats = dob v taktu, onBeat(číslo doby) pro zobrazení
export function startMetronome({ bpm, beats = 4, onBeat = null }) {
  stopMetronome();
  const ctx = audio();
  ctx.resume();
  Object.assign(metro, { bpm, beats, onBeat, beat: 0, next: ctx.currentTime + 0.05 });
  metro.timer = setInterval(schedule, 25);
  schedule();
}
// změna tempa nebo taktu za běhu, bez přerušení
export const setMetronome = opts => Object.assign(metro, opts);
export function stopMetronome() { clearInterval(metro.timer); metro.timer = null; }
