// Spuštění: npm test  (nebo node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { midiOf, stepOf, nameOf, octName, pcName, spell, labelOf, validAcc, positions, parseNote } from '../js/music.js';
import { detectPitch, freqToMidi } from '../js/pitch.js';

test('české názvy not a oktáv', () => {
  assert.equal(octName(30), 'e¹'); // spodní linka
  assert.equal(octName(23), 'e'); // nejhlubší struna (psaná)
  assert.equal(octName(42), 'c³');
  assert.equal(nameOf(6, -1), 'B'); // h snížené
  assert.equal(nameOf(2, -1), 'Es');
  assert.equal(nameOf(5, -1), 'As');
  assert.equal(nameOf(3, 1), 'Fis');
  assert.equal(octName(31, 1), 'fis¹');
  assert.equal(pcName(70), 'Ais/B');
});

test('převody výšek', () => {
  assert.equal(midiOf(30), 64); // E4
  assert.equal(midiOf(34, -1), 70); // b¹
  assert.equal(stepOf(64), 30);
  assert.equal(stepOf(61), null); // cis není kmenová
  assert.deepEqual(spell(61), { step: 28, acc: 1 });
  assert.equal(labelOf(61, true), 'Des');
  assert.deepEqual(parseNote('Hb4'), { step: 34, acc: -1 });
  assert.equal(validAcc(2, 1), false); // Eis vynecháváme
  assert.equal(validAcc(30, -1), true); // Es
});

test('místa na hmatníku', () => {
  // g¹ (psaná 67): prázdná G, D struna 5. pražec, A struna 10. pražec
  assert.deepEqual(positions(67), [[2, 0], [3, 5], [4, 10]]);
  assert.deepEqual(positions(52), [[5, 0]]); // nejhlubší E jen na 6. struně
});

test('rozpoznání tónu (YIN) v celém rozsahu kytary', () => {
  const sr = 48000;
  for (let m = 52; m <= 88; m++) { // prázdná E struna … e struna 12. pražec
    const f0 = 440 * 2 ** ((m - 12 - 69) / 12), buf = new Float32Array(4096);
    const harmonics = [0.3, 1, 0.8, 0.5, 0.35, 0.2]; // slabý základní tón jako u kytary
    for (let i = 0; i < buf.length; i++)
      buf[i] = 0.15 * harmonics.reduce((v, a, h) => v + a * Math.sin(2 * Math.PI * f0 * (h + 1) * i / sr + h), 0);
    assert.equal(Math.round(freqToMidi(detectPitch(buf, sr))), m, `MIDI ${m}`);
  }
  assert.equal(detectPitch(new Float32Array(4096), sr), null); // ticho
});
