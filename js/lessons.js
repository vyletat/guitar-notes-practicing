// Stránka Výuka: seznam kapitol a kapitola s interaktivními příklady.
// Příklady v obsahu: <div class="ex" data-staff="C4 F#4 C4+E4+G4" data-key="F#5"> (osnova, akord = +)
// nebo data-fret="6:0 5:2" (struna:pražec), data-chord = zahrát najednou, data-text = popisek.
import { OPEN, midiOf, parseNote } from './music.js';
import { readLessons, markRead } from './store.js';
import { togglePlayback } from './audio.js';
import { $, el, drawStaff, drawFretboard } from './draw.js';
import { LESSONS } from './lessons-content.js';

function renderList(sec) {
  const n = LESSONS.filter((_, i) => readLessons.has(i)).length;
  sec.innerHTML = `<div class="card"><b>Přečteno ${n} z ${LESSONS.length} kapitol</b>` +
    `<div class="progress"><i style="width:${100 * n / LESSONS.length}%"></i></div></div>` +
    '<ol class="lessons">' + LESSONS.map((l, i) => {
      const done = readLessons.has(i);
      return `<li><a href="#vyuka/${i}"><span class="num${done ? ' done' : ''}">${done ? '✓' : i + 1}</span>` +
        `<span class="t">${l.title}<small>${l.sub}</small></span><span class="chev">›</span></a></li>`;
    }).join('') + '</ol>';
}

// nakreslí příklad a vrátí sekvenci k přehrání: pole akordů, každý = pole MIDI výšek
function renderExample(ex) {
  const svg = el(ex, 'svg', {});
  if (ex.dataset.staff != null) {
    svg.classList.add('staff');
    const key = (ex.dataset.key || '').split(' ').filter(Boolean).map(parseNote);
    const groups = ex.dataset.staff.split(' ').filter(Boolean).map(g => g.split('+').map(parseNote));
    let x = 70 + key.length * 11;
    const xs = groups.map(g => x += 40 + (g.some(n => n.acc) ? 14 : 0)); // nota s posuvkou potřebuje víc místa
    const width = Math.max(300, x + 30);
    svg.style.maxWidth = width * 1.4 + 'px';
    drawStaff(svg, groups.flatMap((g, i) => g.map(n => ({ ...n, x: xs[i] }))), { width, key, whole: true });
    return groups.map(g => g.map(n => midiOf(n.step, n.acc)));
  }
  svg.classList.add('fretboard');
  svg.setAttribute('viewBox', '0 0 650 205');
  const marks = ex.dataset.fret.split(' ').map(t => { const [s, f] = t.split(':').map(Number); return { s: s - 1, f, cls: 'target' }; });
  drawFretboard(svg, marks);
  const midis = marks.map(m => OPEN[m.s] + m.f);
  return ex.hasAttribute('data-chord') ? [midis.sort((a, b) => a - b)] : midis.map(m => [m]);
}

export function renderLesson(arg) {
  const sec = $('#vyuka'), i = Number(arg), L = LESSONS[i];
  if (arg == null || !L) return renderList(sec);
  markRead(i);
  sec.innerHTML = `<article class="lesson"><a class="btn" href="#vyuka">← Kapitoly</a><h2>${i + 1}. ${L.title}</h2>${L.body}
    <div class="lessonnav">${i > 0 ? `<a class="btn" href="#vyuka/${i - 1}">← ${LESSONS[i - 1].title}</a>` : '<span></span>'}
    ${i < LESSONS.length - 1 ? `<a class="btn primary" href="#vyuka/${i + 1}">${LESSONS[i + 1].title} →</a>` : ''}</div></article>`;
  for (const ex of sec.querySelectorAll('.ex')) {
    const seq = renderExample(ex);
    if (ex.dataset.text) ex.insertAdjacentHTML('beforeend', `<p class="hint">${ex.dataset.text}</p>`);
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = '▶ Přehrát';
    b.onclick = () => togglePlayback(b, seq, 0.5);
    ex.append(b);
  }
}
