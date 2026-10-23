// Záložky Hra → Podle not a Hra → Etudy: aplikace ukáže řadu not, ty ji zahraješ na kytaru
// a mikrofon (nebo klepnutí na hmatník) kontroluje, jestli hraješ správně. Bez hodnocení rytmu.
import { OPEN, positions, nameOf, octName, labelOf, parseNote, midiOf, spell } from './music.js';
import { cfg, notePool, preferFlats, pct } from './store.js';
import { play, startMetronome, stopMetronome, metronomeOn } from './audio.js';
import { $, el, drawStaff, drawFretboard } from './draw.js';
import { micOn, startMic, stopMic } from './mic.js';
import { record } from './stats.js';
import { ETUDES } from './etudes.js';

const PER_LINE = 8, RANDOM_LENGTH = 8;
let seq = [], pos = 0, tries = 0, firstTry = 0, started = 0, source = null; // source: 'random' | číslo etudy

// ---------- sekvence ----------
function randomSeq() {
  const pool = notePool(), out = [];
  while (out.length < RANDOM_LENGTH) {
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (n.midi !== out.at(-1)?.midi) out.push(n);
  }
  return out;
}
const etudeSeq = i => ETUDES[i].notes.split(' ').map(t => { const n = parseNote(t); return { ...n, midi: midiOf(n.step, n.acc) }; });

function start(newSource) {
  source = newSource;
  seq = source === 'random' ? randomSeq() : etudeSeq(source);
  pos = tries = firstTry = 0;
  started = 0;
  $('#etudeList').hidden = true;
  $('#along').hidden = false;
  $('#alongDone').hidden = true;
  $('#alongTitle').textContent = source === 'random' ? 'Náhodné noty' : ETUDES[source].title;
  $('#tempo').value = source === 'random' ? 70 : ETUDES[source].bpm;
  showTempo();
  status('Zahraj zvýrazněnou notu. Bez mikrofonu můžeš klepat na hmatník.');
  renderSeq();
  drawFretboard($('#alongFret'), [], { onClick: tapFret });
}

// ---------- vykreslení ----------
function renderSeq() {
  const box = $('#alongStaff');
  box.innerHTML = '';
  for (let i = 0; i < seq.length; i += PER_LINE) {
    let x = 60;
    const line = seq.slice(i, i + PER_LINE).map((n, j) => ({
      ...n, x: x += 40 + (n.acc ? 14 : 0),
      cls: i + j < pos ? 'ok' : i + j === pos ? 'target' : '',
    }));
    const svg = el(box, 'svg', { class: 'staff' });
    drawStaff(svg, line, { width: Math.max(300, x + 30) });
  }
  $('#alongProgress').textContent = `${pos} / ${seq.length}`;
  box.children[Math.floor(pos / PER_LINE)]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function status(text, cls = '') {
  $('#alongStatus').textContent = text;
  $('#alongStatus').className = 'hint ' + cls;
}

// ---------- hraní ----------
function attempt(m) {
  if (pos >= seq.length) return;
  started ||= Date.now();
  const want = seq[pos];
  if (m === want.midi) {
    record(tries === 0, 'play', octName(want.step, want.acc));
    if (!tries) firstTry++;
    pos++;
    tries = 0;
    status('Správně!', 'ok');
    renderSeq();
    drawFretboard($('#alongFret'), [], { onClick: tapFret });
    if (pos === seq.length) finish();
    return;
  }
  tries++;
  const n = spell(m, preferFlats()), heard = `${nameOf(n.step, n.acc)} (${octName(n.step, n.acc)})`;
  status(m % 12 === want.midi % 12
    ? `Správná nota, ale v jiné oktávě – hledáme ${octName(want.step, want.acc)}.`
    : `Zaznělo ${heard}, hledáme ${nameOf(want.step, want.acc)}.`, 'bad');
}
function finish() {
  const sec = Math.round((Date.now() - started) / 1000);
  $('#alongDone').hidden = false;
  $('#alongSummary').textContent = `${seq.length} not, napoprvé správně ${firstTry} (${pct(firstTry, seq.length)}), čas ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  $('#alongNext').textContent = source === 'random' ? 'Nové noty' : source < ETUDES.length - 1 ? `Další: ${ETUDES[source + 1].title}` : 'Zpět na etudy';
  status('Hotovo!', 'ok');
}

function tapFret(s, f) {
  const m = OPEN[s] + f;
  play(m);
  attempt(m);
}

function onNote({ midi, onset }) {
  $('#alongHeard').textContent = labelOf(midi, preferFlats());
  if (onset) attempt(midi);
}

// ---------- ovládání ----------
const showTempo = () => { $('#tempoValue').textContent = `${$('#tempo').value} BPM`; };
$('#tempo').oninput = () => { showTempo(); if (metronomeOn()) startMetronome(+$('#tempo').value); };
$('#metroBtn').onclick = () => {
  if (metronomeOn()) stopMetronome(); else startMetronome(+$('#tempo').value);
  $('#metroBtn').classList.toggle('on', metronomeOn());
};
$('#alongPlay').onclick = () => {
  const beat = 60 / +$('#tempo').value;
  seq.slice(pos).forEach((n, i) => play(n.midi, i * beat));
};
$('#alongHint').onclick = () => {
  if (pos < seq.length) drawFretboard($('#alongFret'), positions(seq[pos].midi).map(([s, f]) => ({ s, f, cls: 'target' })), { onClick: tapFret });
};
$('#alongMic').onclick = async () => {
  if (micOn()) { stopMic(); $('#alongMic').textContent = 'Zapnout mikrofon'; return; }
  const err = await startMic(onNote);
  if (err) return status(err, 'bad');
  $('#alongMic').textContent = 'Vypnout mikrofon';
  status('Poslouchám… zahraj zvýrazněnou notu.');
};
$('#alongAgain').onclick = () => {
  if (source === 'random') { pos = tries = firstTry = started = 0; $('#alongDone').hidden = true; renderSeq(); status('Znovu od začátku.'); }
  else start(source);
};
$('#alongNext').onclick = () => {
  if (source === 'random') start('random');
  else if (source < ETUDES.length - 1) location.hash = `hrat/etudy/${source + 1}`;
  else location.hash = 'hrat/etudy';
};

// ---------- vstup na záložky ----------
export const showRandom = () => start('random');

export function showEtudes(arg) {
  const i = Number(arg);
  if (arg != null && ETUDES[i]) return start(i);
  $('#along').hidden = true;
  $('#etudeList').hidden = false;
  $('#etudeList').innerHTML = '<ol class="lessons">' + ETUDES.map((e, i) =>
    `<li><a href="#hrat/etudy/${i}"><span class="num">${i + 1}</span><span class="t">${e.title}<small>${e.sub} · ${e.notes.split(' ').length} not</small></span><span class="chev">›</span></a></li>`).join('') + '</ol>';
}

export function hide() {
  stopMic();
  stopMetronome();
  $('#alongMic').textContent = 'Zapnout mikrofon';
  $('#metroBtn').classList.remove('on');
}
