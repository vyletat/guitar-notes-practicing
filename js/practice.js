// Stránka Procvičování: 4 režimy (čtení, zápis, nota → hmat, hmat → nota) a denní trénink, který je střídá.
import { NAMES, PC, OPEN, stepOf, positions, nameOf, octName, pcName } from './music.js';
import { cfg, stats, notePool, accidentals, todayCount } from './store.js';
import { play } from './audio.js';
import { $, $$, drawStaff, drawFretboard, stepAt } from './draw.js';
import { renderDial, revealDial } from './dial.js';
import { record } from './stats.js';

const MODES = ['read', 'write', 'find', 'name'];

// tab = zvolená záložka (režim nebo 'daily'), mode = režim aktuální otázky
let tab = 'read', mode = 'read', q = null, locked = false, score = { ok: 0, all: 0 }, writeAcc = 0, active = false;
const accs = accidentals;

// ---------- výběr otázky ----------
// key = klíč do statistik (a pro váhu otázky)
function candidates() {
  if (mode === 'read' || mode === 'write')
    return notePool().map(n => ({ ...n, key: mode === 'read' ? octName(n.step, n.acc) : nameOf(n.step, n.acc) }));
  return cfg.strings.flatMap(s => Array.from({ length: cfg.maxFret + 1 }, (_, f) => {
    const midi = OPEN[s] + f, natural = stepOf(midi) !== null;
    if (!natural && !cfg.sharps && !cfg.flats) return null;
    const acc = natural ? 0 : cfg.sharps && (!cfg.flats || Math.random() < 0.5) ? 1 : -1;
    const step = stepOf(midi - acc);
    return { s, f, midi, step, acc, key: mode === 'find' ? octName(step, acc) : `${s}-${f}` };
  })).filter(Boolean);
}

// Laplaceův odhad chybovosti: neznámá nota má váhu 3, zvládnutá ~1, problémová až 5.
function weight(c) {
  if (!cfg.adaptive) return 1;
  const [ok, all] = (mode === 'name' ? stats.pos : stats.notes[mode] || {})[c.key] || [0, 0];
  return 1 + 4 * (1 - (ok + 1) / (all + 2));
}

function pickQuestion() {
  const all = candidates(), fresh = all.filter(c => c.midi !== q?.midi); // neopakovat stejný tón hned po sobě
  const list = fresh.length ? fresh : all, w = list.map(weight);
  let r = Math.random() * w.reduce((a, b) => a + b);
  return list.find((_, i) => (r -= w[i]) < 0) || list[0];
}

// ---------- vykreslení otázky ----------
function renderWriteAcc() {
  const opts = accs().length > 1 ? [[-1, '♭'], [0, '♮'], [1, '♯']].filter(([a]) => accs().includes(a)) : [];
  $('#writeAcc').innerHTML = opts.map(([a, t]) => `<button class="${a === writeAcc ? 'on' : ''}" data-a="${a}">${t}</button>`).join('');
}

// ---------- denní trénink ----------
function renderDaily() {
  const n = todayCount(), goal = cfg.dailyGoal;
  $('#daily').hidden = tab !== 'daily';
  $('#dailyText').textContent = n >= goal ? `Denní cíl splněn ✓ (${n} odpovědí) – můžeš pokračovat` : `Dnes ${n} / ${goal} odpovědí`;
  $('#dailyBar').style.width = `${Math.min(100, 100 * n / goal)}%`;
  $('#daily').classList.toggle('done', n >= goal);
}

function next() {
  locked = false;
  mode = tab === 'daily' ? MODES[Math.floor(Math.random() * MODES.length)] : tab;
  renderDaily();
  writeAcc = 0;
  $('#feedback').textContent = '';
  $('#feedback').className = '';
  $('#fretboard').toggleAttribute('hidden', mode === 'read' || mode === 'write');
  $('#names').hidden = mode === 'write' || mode === 'find';
  $('#writeAcc').hidden = mode !== 'write';
  $('#staff').classList.toggle('clickable', mode === 'write');
  $('#staff').classList.toggle('compact', mode === 'name');
  renderDial($('#names'), cfg);
  renderWriteAcc();

  q = pickQuestion();
  const staff = $('#staff'), board = $('#fretboard'), prompt = $('#prompt');
  if (mode === 'read') {
    prompt.textContent = 'Jak se jmenuje tato nota?';
    drawStaff(staff, [q]);
  } else if (mode === 'write') {
    prompt.innerHTML = `Zapiš notu <span class="notebadge">${nameOf(q.step, q.acc)}</span>`;
    drawStaff(staff);
  } else if (mode === 'find') {
    prompt.textContent = 'Najdi tuto notu na hmatníku';
    drawStaff(staff, [q]);
    drawFretboard(board, [], { onClick: onFret, practice: true });
  } else {
    prompt.textContent = 'Jaká nota je na označeném místě?';
    drawStaff(staff);
    drawFretboard(board, [{ s: q.s, f: q.f, cls: 'target', label: '' }], { practice: true });
  }
}

const showScore = () => { $('#score').textContent = `${score.ok} / ${score.all}`; };

function done(ok) {
  locked = true;
  score.all++;
  score.ok += ok;
  showScore();
  if (mode === 'name') record(ok, mode, pcName(q.midi), q.key);
  else record(ok, mode, q.key);
  const answer = mode === 'name' ? pcName(q.midi) : mode === 'write' ? nameOf(q.step, q.acc) : `${nameOf(q.step, q.acc)} (${octName(q.step, q.acc)})`;
  const goalNow = tab === 'daily' && todayCount() === cfg.dailyGoal;
  $('#feedback').textContent = (ok ? `Správně! ${answer}` : `Špatně – správně je ${answer}`) + (goalNow ? ' · Denní cíl splněn! 🎉' : '');
  renderDaily();
  $('#feedback').className = ok ? 'ok' : 'bad';
  if (cfg.sound) play(q.midi);
  const current = q;
  setTimeout(() => { if (q === current && active) next(); }, goalNow ? 3000 : ok ? 1000 : 2500);
}

// ---------- odpovědi ----------
function onName(l, a) {
  if (locked || (mode !== 'read' && mode !== 'name')) return;
  // čtení: přesný zápis (Fis ≠ Ges); hmat → nota: stačí stejná výška
  const isRight = (bl, ba) => mode === 'read' ? bl === q.step % 7 && ba === q.acc : (PC[bl] + ba + 12) % 12 === q.midi % 12;
  const ok = isRight(l, a);
  revealDial($('#names'), { l, a }, isRight, ok, mode === 'read' ? nameOf(q.step, q.acc) : pcName(q.midi).replace('/', ' '));
  if (mode === 'name') {
    drawStaff($('#staff'), [{ ...q, cls: 'ok' }]);
    drawFretboard($('#fretboard'), [{ s: q.s, f: q.f, cls: ok ? 'ok' : 'bad' }], { practice: true });
  }
  done(ok);
}

function onStaff(e) {
  if (mode !== 'write' || locked) return;
  const step = Math.min(44, Math.max(23, stepAt(e.currentTarget, e.clientY)));
  const ok = step % 7 === q.step % 7 && writeAcc === q.acc; // libovolná oktáva se počítá
  drawStaff($('#staff'), ok
    ? [{ step, acc: writeAcc, cls: 'ok' }]
    : [{ step, acc: writeAcc, cls: 'bad', x: 130 }, { ...q, cls: 'ok', x: 220 }]);
  done(ok);
}

function onFret(s, f) {
  if (mode !== 'find' || locked) return;
  const ok = OPEN[s] + f === q.midi;
  const marks = positions(q.midi).map(([s, f]) => ({ s, f, cls: 'ok' }));
  if (!ok) marks.push({ s, f, cls: 'bad' });
  drawFretboard($('#fretboard'), marks, { practice: true });
  done(ok);
}

$('#names').onclick = e => { const g = e.target.closest('.seg'); if (g) onName(+g.dataset.l, +g.dataset.a); };
$('#writeAcc').onclick = e => { const b = e.target.closest('button'); if (b) { writeAcc = +b.dataset.a; renderWriteAcc(); } };
$('#staff').onclick = onStaff;
$('#modes').onclick = e => { if (e.target.dataset.mode) location.hash = 'procvicovani/' + e.target.dataset.mode; };
document.addEventListener('keydown', e => {
  const l = NAMES.indexOf(e.key.toUpperCase());
  if (active && l >= 0 && !e.ctrlKey && !e.metaKey && !e.altKey) onName(l, 0);
});

// ---------- vstup na stránku ----------
export function show(m) {
  active = true;
  tab = MODES.includes(m) || m === 'daily' ? m : tab;
  $$('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === tab));
  score = { ok: 0, all: 0 };
  showScore();
  next();
}
export const hide = () => { active = false; };
