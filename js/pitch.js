// Rozpoznání výšky tónu algoritmem YIN (de Cheveigné & Kawahara, 2002).
// Vrací základní frekvenci v Hz z jednoho okna vzorků, nebo null pro ticho / nejasný tón.
export function detectPitch(buf, sampleRate) {
  let rms = 0;
  for (const v of buf) rms += v * v;
  if (Math.sqrt(rms / buf.length) < 0.01) return null;

  // hledáme periody pro 70–1100 Hz (kytara: E2 = 82 Hz až ~1 kHz)
  const minLag = Math.floor(sampleRate / 1100), maxLag = Math.ceil(sampleRate / 70), W = buf.length - maxLag;
  const d = new Float32Array(maxLag + 2);
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let sum = 0;
    for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + lag]; sum += x * x; }
    d[lag] = sum;
  }
  // kumulativně normalizovaný rozdíl – potlačí chyby o oktávu výš
  let run = 0;
  d[0] = 1;
  for (let lag = 1; lag <= maxLag + 1; lag++) { run += d[lag]; d[lag] = run ? d[lag] * lag / run : 1; }

  let lag = minLag;
  while (lag <= maxLag && d[lag] >= 0.15) lag++;
  if (lag > maxLag) return null;
  while (lag < maxLag && d[lag + 1] < d[lag]) lag++;
  // parabolická interpolace kolem minima pro přesnost pod jeden vzorek
  const a = d[lag - 1], b = d[lag], c = d[lag + 1], den = a - 2 * b + c;
  return sampleRate / (lag + (den ? (a - c) / (2 * den) : 0));
}

// frekvence → (desetinné) MIDI číslo v psané výšce kytary (+12, kytara zní o oktávu níž)
export const freqToMidi = f => 69 + 12 * Math.log2(f / 440) + 12;
