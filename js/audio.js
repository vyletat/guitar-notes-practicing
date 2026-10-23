// Jednoduchý syntetický tón a metronom. AudioContext se vytváří až po první akci uživatele (pravidla prohlížečů).
let ac;
export const audio = () => (ac ??= new AudioContext());

export function play(midi, delay = 0) {
  const ctx = audio(), o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + delay;
  o.type = 'triangle';
  o.frequency.value = 440 * 2 ** ((midi - 12 - 69) / 12); // zní o oktávu níž, než je psáno
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + 1.5);
}

// krátké cvaknutí metronomu, první doba taktu vyšší
export function click(accent = false) {
  const ctx = audio(), o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = 'square';
  o.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.05);
}

// ponytail: setInterval trochu kolísá (desítky ms); pro cvičení stačí, přesnější by bylo plánování přes ctx.currentTime
let metro = null;
export const metronomeOn = () => !!metro;
export function startMetronome(bpm) {
  stopMetronome();
  let beat = 0;
  const tick = () => click(beat++ % 4 === 0);
  tick();
  metro = setInterval(tick, 60000 / bpm);
}
export function stopMetronome() { clearInterval(metro); metro = null; }
