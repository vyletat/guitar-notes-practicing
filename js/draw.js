// Pomocníci pro DOM a kreslení osnovy a hmatníku do SVG.
import { OPEN, labelOf } from './music.js';
import { cfg, preferFlats } from './store.js';

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];

export function el(parent, tag, attrs, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent.append(e);
  return e;
}

// ---------- osnova ----------
// y souřadnice kroku; spodní linka (e¹ = 30) je na y = 120, krok = 8 px
const yOf = step => 120 - (step - 30) * 8;
const accidental = (parent, x, step, acc) =>
  el(parent, 'text', { x, y: yOf(step) + (acc < 0 ? 5 : 9), class: 'acc' }, acc > 0 ? '♯' : acc < 0 ? '♭' : '♮');

// převod kliknutí do osnovy na krok
export const stepAt = (svg, clientY) => {
  const r = svg.getBoundingClientRect();
  return 30 + Math.round((120 - (clientY - r.top) * 190 / r.height) / 8);
};

// notes: [{step, acc, cls, x}]; key = předznamenání [{step, acc}]; whole = celé noty (lekce)
export function drawStaff(svg, notes = [], { width = 300, key = [], whole = false } = {}) {
  svg.setAttribute('viewBox', `0 0 ${width} 190`);
  svg.innerHTML = '';
  for (let s = 30; s <= 38; s += 2) el(svg, 'line', { x1: 5, x2: width - 5, y1: yOf(s), y2: yOf(s) });
  el(svg, 'text', { x: 8, y: 132, class: 'clef' }, '𝄞');
  key.forEach(({ step, acc }, i) => accidental(svg, 66 + i * 11, step, acc));
  for (const { step, acc = 0, cls = '', x = 170 } of notes) {
    const g = el(svg, 'g', { class: cls }), y = yOf(step);
    for (let t = 28; t >= step; t -= 2) el(g, 'line', { x1: x - 15, x2: x + 15, y1: yOf(t), y2: yOf(t) }); // pomocné linky dole
    for (let t = 40; t <= step; t += 2) el(g, 'line', { x1: x - 15, x2: x + 15, y1: yOf(t), y2: yOf(t) }); // a nahoře
    if (acc) accidental(g, x - 24, step, acc);
    if (whole) { el(g, 'ellipse', { cx: x, cy: y, rx: 8.5, ry: 6, class: 'whole' }); continue; }
    el(g, 'ellipse', { cx: x, cy: y, rx: 9, ry: 6.5, transform: `rotate(-20 ${x} ${y})`, class: 'note' });
    const up = step < 34, sx = up ? x + 8.4 : x - 8.4; // od h¹ nahoru nožička dolů
    el(g, 'line', { x1: sx, x2: sx, y1: y, y2: up ? y - 50 : y + 50 });
  }
}

// ---------- hmatník ----------
const fx = f => f === 0 ? 20 : 40 + (f - 0.5) * 50;
const sy = i => 20 + i * 30;

// marks: [{s, f, cls, label, style}]; practice = ztlumit vypnuté struny a pražce mimo rozsah z nastavení
export function drawFretboard(svg, marks = [], { onClick, practice = false } = {}) {
  svg.innerHTML = '';
  for (const f of [3, 5, 7, 9]) el(svg, 'circle', { cx: fx(f), cy: 95, r: 6, class: 'inlay' });
  for (const cy of [65, 125]) el(svg, 'circle', { cx: fx(12), cy, r: 6, class: 'inlay' });
  for (let f = 0; f <= 12; f++) {
    el(svg, 'line', { x1: 40 + f * 50, x2: 40 + f * 50, y1: 20, y2: 170, class: f ? 'fret' : 'nut' });
    el(svg, 'text', { x: fx(f), y: 195, class: 'num' }, f);
  }
  for (let i = 0; i < 6; i++) {
    const off = practice && !cfg.strings.includes(i);
    el(svg, 'line', { x1: 0, x2: 640, y1: sy(i), y2: sy(i), 'stroke-width': 1 + i * 0.4, class: 'string' + (off ? ' off' : '') });
  }
  if (practice && cfg.maxFret < 12) el(svg, 'rect', { x: 41 + cfg.maxFret * 50, y: 8, width: 600 - cfg.maxFret * 50, height: 174, class: 'dim' });
  if (onClick) for (let i = 0; i < 6; i++) for (let f = 0; f <= 12; f++)
    el(svg, 'rect', { x: f ? 40 + (f - 1) * 50 : 0, y: sy(i) - 15, width: f ? 50 : 40, height: 30, class: 'cell' }).onclick = () => onClick(i, f);
  for (const { s, f, cls = '', label = labelOf(OPEN[s] + f, preferFlats()), style = '' } of marks) {
    const g = el(svg, 'g', { class: cls, style });
    el(g, 'circle', { cx: fx(f), cy: sy(s), r: 12, class: 'mark' });
    if (label !== '') el(g, 'text', { x: fx(f), y: sy(s), class: 'label' }, label);
  }
}
