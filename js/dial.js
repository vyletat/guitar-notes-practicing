// Kruhový ciferník pro výběr noty: C nahoře, po směru hodinových ručiček.
// Bez posuvek 7 výsečí, s posuvkami 12 chromatických pozic (u černých kláves křížek venku, béčko uvnitř).
import { NAMES, PC, nameOf } from './music.js';

const polar = (r, a) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
const arc = (r1, r2, a1, a2) => `M${polar(r2, a1)}A${r2} ${r2} 0 0 1 ${polar(r2, a2)}L${polar(r1, a2)}A${r1} ${r1} 0 0 0 ${polar(r1, a1)}Z`;

function segments({ sharps, flats }) {
  const segs = [];
  const add = (l, a, center, width, r1, r2) => segs.push({ l, a, a1: center - width / 2, a2: center + width / 2, r1, r2 });
  if (!sharps && !flats) {
    NAMES.forEach((_, l) => add(l, 0, l * 2 * Math.PI / 7, 2 * Math.PI / 7, 44, 98));
    return segs;
  }
  const w = Math.PI / 6, both = sharps && flats;
  for (let pc = 0; pc < 12; pc++) {
    const c = pc * w, natural = PC.indexOf(pc);
    if (natural >= 0) { add(natural, 0, c, w, 44, 98); continue; }
    if (sharps) add(PC.indexOf(pc - 1), 1, c, w, both ? 72 : 44, 98);
    if (flats) add(PC.indexOf(pc + 1), -1, c, w, 44, both ? 70 : 98);
  }
  return segs;
}

export function renderDial(box, options) {
  box.innerHTML = `<svg id="dial" viewBox="-100 -100 200 200">` + segments(options).map(s => {
    const mid = (s.a1 + s.a2) / 2, [x, y] = polar((s.r1 + s.r2) / 2, mid).split(' ');
    return `<g class="seg${s.a ? ' acc' : ''}" data-l="${s.l}" data-a="${s.a}" data-angle="${mid}">` +
      `<path d="${arc(s.r1, s.r2, s.a1 + 0.012, s.a2 - 0.012)}"/>` +
      `<text x="${x}" y="${y}" class="${s.a ? 'small' : ''}">${nameOf(s.l, s.a)}</text></g>`;
  }).join('') + `<circle class="hub" r="38"/><g class="needle"><path d="M0 -36 L-7 -25 L7 -25Z"/></g><text class="hubtext">?</text></svg>`;
}

// Obarví správné výseče, zvolenou chybnou označí červeně a natočí na ni ručičku.
export function revealDial(box, picked, isRight, ok, hubText) {
  const needle = box.querySelector('.needle'), hub = box.querySelector('.hubtext');
  for (const g of box.querySelectorAll('.seg')) {
    const l = +g.dataset.l, a = +g.dataset.a, mine = l === picked.l && a === picked.a;
    if (isRight(l, a)) g.classList.add('ok');
    else if (mine) g.classList.add('bad');
    if (mine) {
      needle.style.transform = `rotate(${g.dataset.angle}rad)`;
      needle.classList.add('on', ok ? 'ok' : 'bad');
    }
  }
  hub.textContent = hubText;
  hub.classList.add(ok ? 'ok' : 'bad');
}
