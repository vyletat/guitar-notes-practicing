// Jednoduchý syntetický tón. AudioContext se vytváří až po první akci uživatele (pravidla prohlížečů).
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
