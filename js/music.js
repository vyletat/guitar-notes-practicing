// Hudební teorie bez závislosti na stránce.
// Nota = diatonický "krok": písmeno (C=0 … H=6) + 7 × oktáva, e¹ (E4, spodní linka osnovy) = 30.
// Posuvka acc: -1 = béčko, 0 = bez, +1 = křížek. Výšky jsou MIDI čísla v *psané* výšce kytary.
export const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
const FLATS = ['Ces', 'Des', 'Es', 'Fes', 'Ges', 'As', 'B'];
const SUP = ['', '¹', '²', '³', '⁴'];
export const PC = [0, 2, 4, 5, 7, 9, 11]; // půltóny kmenových not od C
export const OPEN = [76, 71, 67, 62, 57, 52]; // prázdné struny 1–6 (kytara zní o oktávu níž)
export const STRING_NAMES = ['e', 'H', 'G', 'D', 'A', 'E'];

export const midiOf = (step, acc = 0) => 12 * (Math.floor(step / 7) + 1) + PC[step % 7] + acc;
// krok kmenové noty pro danou výšku, nebo null pro "černou klávesu"
export const stepOf = m => { const i = PC.indexOf(m % 12); return i < 0 ? null : (Math.floor(m / 12) - 1) * 7 + i; };
// všechna místa [struna, pražec] do 12. pražce, kde zní daná výška
export const positions = m => OPEN.flatMap((o, i) => m - o >= 0 && m - o <= 12 ? [[i, m - o]] : []);

// česká jména: Cis, Des, Es, As, B…
export const nameOf = (step, acc = 0) => acc > 0 ? NAMES[step % 7] + 'is' : acc < 0 ? FLATS[step % 7] : NAMES[step % 7];
// s oktávou: e (malá), c¹, fis², …
export const octName = (step, acc = 0) => {
  const o = Math.floor(step / 7), n = nameOf(step, acc);
  return o < 3 ? n : n.toLowerCase() + SUP[o - 3];
};
// jméno výšky bez ohledu na zápis: "Fis/Ges"
export const pcName = m => stepOf(m) !== null ? NAMES[stepOf(m) % 7] : `${nameOf(stepOf(m - 1), 1)}/${nameOf(stepOf(m + 1), -1)}`;
// bez Eis, His, Ces, Fes – v praxi se skoro nepoužívají
export const validAcc = (step, acc) => !(acc > 0 && (step % 7 === 2 || step % 7 === 6)) && !(acc < 0 && (step % 7 === 0 || step % 7 === 3));

// zápis výšky: kmenová nota, jinak křížek (nebo béčko, když jsou preferovaná)
export const spell = (m, preferFlats = false) =>
  stepOf(m) !== null ? { step: stepOf(m), acc: 0 } : preferFlats ? { step: stepOf(m + 1), acc: -1 } : { step: stepOf(m - 1), acc: 1 };
export const labelOf = (m, preferFlats = false) => { const n = spell(m, preferFlats); return nameOf(n.step, n.acc); };

// "C4", "F#4", "Hb3" → { step, acc } (zápis příkladů v lekcích)
export const parseNote = t => {
  const [, l, a, o] = t.match(/^([A-H])([#b]?)(\d)$/);
  return { step: NAMES.indexOf(l) + 7 * +o, acc: a === '#' ? 1 : a ? -1 : 0 };
};
