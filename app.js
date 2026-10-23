// Noty jako diatonický "krok": písmeno (C=0 … H=6) + 7 × oktáva, e¹ (E4, spodní linka) = 30.
// Posuvka acc: -1 = béčko, 0 = bez, +1 = křížek.
const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
const FLATS = ['Ces', 'Des', 'Es', 'Fes', 'Ges', 'As', 'B'];
const SUP = ['', '¹', '²', '³', '⁴'];
const PC = [0, 2, 4, 5, 7, 9, 11];
const OPEN = [76, 71, 67, 62, 57, 52]; // psaná MIDI výška prázdných strun 1–6 (kytara zní o oktávu níž)
const STRING_NAMES = ['e', 'H', 'G', 'D', 'A', 'E'];
const RANGES = { staff: [29, 39], full: [23, 44] }; // d¹–g², e–e³
const MODES = { read: 'Čtení', write: 'Zápis', find: 'Nota → hmat', name: 'Hmat → nota' };

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const midiOf = (s, acc = 0) => 12 * (Math.floor(s / 7) + 1) + PC[s % 7] + acc;
const stepOf = m => { const i = PC.indexOf(m % 12); return i < 0 ? null : (Math.floor(m / 12) - 1) * 7 + i; };
const positions = m => OPEN.flatMap((o, i) => m - o >= 0 && m - o <= 12 ? [[i, m - o]] : []);
const nameOf = (s, acc = 0) => acc > 0 ? NAMES[s % 7] + 'is' : acc < 0 ? FLATS[s % 7] : NAMES[s % 7];
const octName = (s, acc = 0) => { const o = Math.floor(s / 7), n = nameOf(s, acc); return o < 3 ? n : n.toLowerCase() + SUP[o - 3]; };
const pcName = m => stepOf(m) !== null ? NAMES[stepOf(m) % 7] : `${nameOf(stepOf(m - 1), 1)}/${nameOf(stepOf(m + 1), -1)}`;
// pravopis MIDI výšky: kmenová nota, jinak křížek (béčko jen když jsou v nastavení zapnutá jen béčka)
const spell = m => stepOf(m) !== null ? { step: stepOf(m), acc: 0 } : cfg.flats && !cfg.sharps ? { step: stepOf(m + 1), acc: -1 } : { step: stepOf(m - 1), acc: 1 };
const labelOf = m => { const n = spell(m); return nameOf(n.step, n.acc); };
const validAcc = (s, a) => !(a > 0 && (s % 7 === 2 || s % 7 === 6)) && !(a < 0 && (s % 7 === 0 || s % 7 === 3)); // bez Eis/His/Ces/Fes
const dayKey = (d = new Date()) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD v místním čase
const pct = (ok, all) => all ? Math.round(100 * ok / all) + ' %' : '–';
const load = (k, def) => { try { return Object.assign(def, JSON.parse(localStorage[k] || '{}')); } catch { return def; } };
const save = (k, v) => { try { localStorage[k] = JSON.stringify(v); } catch {} };

// ---------- nastavení ----------
const cfg = load('noty', { range: 'staff', strings: [0, 1, 2, 3, 4, 5], maxFret: 5, sound: true, sharps: false, flats: false, adaptive: true });
// days[YYYY-MM-DD] = {ok, all, sec}; notes[režim][nota] = [ok, all]; pos['struna-pražec'] = [ok, all] (režim hmat → nota)
const stats = load('notyStats', { days: {}, notes: {}, pos: {} });
const readLessons = new Set(load('notyRead', { list: [] }).list);

$('#strings').append(...STRING_NAMES.map((n, i) => {
  const l = document.createElement('label');
  l.className = 'chip';
  l.innerHTML = `<input type="checkbox" name="str" value="${i}">${i + 1} · ${n}`;
  return l;
}));
const CHECKS = ['sound', 'sharps', 'flats', 'adaptive'];
function syncForm() {
  $('#range').value = cfg.range;
  $('#maxFret').value = cfg.maxFret;
  CHECKS.forEach(k => $('#' + k).checked = cfg[k]);
  $$('[name=str]').forEach(c => c.checked = cfg.strings.includes(+c.value));
}
$('#settings').onchange = () => {
  cfg.range = $('#range').value;
  cfg.maxFret = +$('#maxFret').value;
  CHECKS.forEach(k => cfg[k] = $('#' + k).checked);
  cfg.strings = $$('[name=str]:checked').map(c => +c.value);
  if (!cfg.strings.length) { cfg.strings = [0, 1, 2, 3, 4, 5]; syncForm(); }
  save('noty', cfg);
};
// confirm() v PWA / náhledech často nefunguje (vrací rovnou false), proto potvrzení druhým klepnutím.
$('#reset').onclick = e => {
  const b = e.currentTarget;
  clearTimeout(b.timer);
  b.timer = setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Smazat statistiky'; }, 4000);
  if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Opravdu? Klepni znovu'; return; }
  Object.assign(stats, { days: {}, notes: {}, pos: {} });
  save('notyStats', stats);
  b.classList.remove('armed');
  b.textContent = 'Smazáno ✓';
};
syncForm();

// ---------- zvuk ----------
let ac;
function play(midi, delay = 0) {
  ac ??= new AudioContext();
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + delay;
  o.type = 'triangle';
  o.frequency.value = 440 * 2 ** ((midi - 12 - 69) / 12); // zní o oktávu níž, než je psáno
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + 1.5);
}

// ---------- kreslení ----------
function el(parent, tag, attrs, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent.append(e);
  return e;
}

const yOf = s => 120 - (s - 30) * 8;
const accidental = (parent, x, step, acc) =>
  el(parent, 'text', { x, y: yOf(step) + (acc < 0 ? 5 : 9), class: 'acc' }, acc > 0 ? '♯' : acc < 0 ? '♭' : '♮');

function drawStaff(svg, notes = [], { width = 300, key = [], whole = false } = {}) {
  svg.setAttribute('viewBox', `0 0 ${width} 190`);
  svg.innerHTML = '';
  for (let s = 30; s <= 38; s += 2) el(svg, 'line', { x1: 5, x2: width - 5, y1: yOf(s), y2: yOf(s) });
  el(svg, 'text', { x: 8, y: 132, class: 'clef' }, '𝄞');
  key.forEach(({ step, acc }, i) => accidental(svg, 66 + i * 11, step, acc));
  for (const { step, acc = 0, cls = '', x = 170 } of notes) {
    const g = el(svg, 'g', { class: cls }), y = yOf(step);
    for (let t = 28; t >= step; t -= 2) el(g, 'line', { x1: x - 15, x2: x + 15, y1: yOf(t), y2: yOf(t) });
    for (let t = 40; t <= step; t += 2) el(g, 'line', { x1: x - 15, x2: x + 15, y1: yOf(t), y2: yOf(t) });
    if (acc) accidental(g, x - 24, step, acc);
    if (whole) { el(g, 'ellipse', { cx: x, cy: y, rx: 8.5, ry: 6, class: 'whole' }); continue; }
    el(g, 'ellipse', { cx: x, cy: y, rx: 9, ry: 6.5, transform: `rotate(-20 ${x} ${y})`, class: 'note' });
    const sx = step >= 34 ? x - 8.4 : x + 8.4;
    el(g, 'line', { x1: sx, x2: sx, y1: y, y2: step >= 34 ? y + 50 : y - 50 });
  }
}

const fx = f => f === 0 ? 20 : 40 + (f - 0.5) * 50;
const sy = i => 20 + i * 30;
// marks: [{s, f, cls, label, style}]; practice = ztlumit vypnuté struny a pražce mimo rozsah
function drawFretboard(svg, marks = [], { onClick, practice = false } = {}) {
  svg.innerHTML = '';
  for (const f of [3, 5, 7, 9]) el(svg, 'circle', { cx: fx(f), cy: 95, r: 6, class: 'inlay' });
  for (const cy of [65, 125]) el(svg, 'circle', { cx: fx(12), cy, r: 6, class: 'inlay' });
  for (let f = 0; f <= 12; f++) {
    el(svg, 'line', { x1: 40 + f * 50, x2: 40 + f * 50, y1: 20, y2: 170, class: f ? 'fret' : 'nut' });
    el(svg, 'text', { x: fx(f), y: 195, class: 'num' }, f);
  }
  for (let i = 0; i < 6; i++)
    el(svg, 'line', { x1: 0, x2: 640, y1: sy(i), y2: sy(i), 'stroke-width': 1 + i * 0.4, class: 'string' + (!practice || cfg.strings.includes(i) ? '' : ' off') });
  if (practice && cfg.maxFret < 12) el(svg, 'rect', { x: 41 + cfg.maxFret * 50, y: 8, width: 600 - cfg.maxFret * 50, height: 174, class: 'dim' });
  if (onClick) for (let i = 0; i < 6; i++) for (let f = 0; f <= 12; f++)
    el(svg, 'rect', { x: f ? 40 + (f - 1) * 50 : 0, y: sy(i) - 15, width: f ? 50 : 40, height: 30, class: 'cell' }).onclick = () => onClick(i, f);
  for (const { s, f, cls = '', label = labelOf(OPEN[s] + f), style = '' } of marks) {
    const g = el(svg, 'g', { class: cls, style });
    el(g, 'circle', { cx: fx(f), cy: sy(s), r: 12, class: 'mark' });
    if (label !== '') el(g, 'text', { x: fx(f), y: sy(s), class: 'label' }, label);
  }
}

// ---------- procvičování ----------
let mode = 'read', q = null, locked = false, score = { ok: 0, all: 0 }, writeAcc = 0, lastAnswer = 0, page = '';
const accs = () => [0, ...(cfg.sharps ? [1] : []), ...(cfg.flats ? [-1] : [])];

function candidates() {
  if (mode === 'read' || mode === 'write') {
    const [lo, hi] = RANGES[cfg.range], out = [];
    for (let s = lo; s <= hi; s++) for (const acc of accs()) if (validAcc(s, acc))
      out.push({ step: s, acc, midi: midiOf(s, acc), key: mode === 'read' ? octName(s, acc) : nameOf(s, acc) });
    return out;
  }
  return cfg.strings.flatMap(s => Array.from({ length: cfg.maxFret + 1 }, (_, f) => {
    const m = OPEN[s] + f, natural = stepOf(m) !== null;
    if (!natural && !cfg.sharps && !cfg.flats) return null;
    const acc = natural ? 0 : cfg.sharps && (!cfg.flats || Math.random() < 0.5) ? 1 : -1;
    const step = stepOf(m - acc);
    return { s, f, midi: m, step, acc, key: mode === 'find' ? octName(step, acc) : `${s}-${f}` };
  })).filter(Boolean);
}

// Laplaceův odhad chybovosti: neznámá nota má váhu 3, zvládnutá ~1, problémová až 5.
function weight(c) {
  if (!cfg.adaptive) return 1;
  const [ok, all] = (mode === 'name' ? stats.pos : stats.notes[mode] || {})[c.key] || [0, 0];
  return 1 + 4 * (1 - (ok + 1) / (all + 2));
}
function pickQuestion() {
  const all = candidates(), fresh = all.filter(c => c.midi !== q?.midi);
  const list = fresh.length ? fresh : all, w = list.map(weight);
  let r = Math.random() * w.reduce((a, b) => a + b);
  return list.find((_, i) => (r -= w[i]) < 0) || list[0];
}

// Volba noty jako kruhový ciferník: C nahoře, po směru hodinových ručiček. Bez posuvek 7 výsečí,
// s posuvkami 12 chromatických pozic (u černých kláves křížek venku, béčko uvnitř).
const polar = (r, a) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
const arc = (r1, r2, a1, a2) => `M${polar(r2, a1)}A${r2} ${r2} 0 0 1 ${polar(r2, a2)}L${polar(r1, a2)}A${r1} ${r1} 0 0 0 ${polar(r1, a1)}Z`;
function buildNames() {
  const segs = [], chromatic = cfg.sharps || cfg.flats;
  const add = (l, a, center, width, r1, r2) => segs.push({ l, a, a1: center - width / 2, a2: center + width / 2, r1, r2 });
  if (!chromatic) NAMES.forEach((_, l) => add(l, 0, l * 2 * Math.PI / 7, 2 * Math.PI / 7, 44, 98));
  else for (let pc = 0; pc < 12; pc++) {
    const c = pc * Math.PI / 6, w = Math.PI / 6, nat = PC.indexOf(pc);
    if (nat >= 0) { add(nat, 0, c, w, 44, 98); continue; }
    const both = cfg.sharps && cfg.flats;
    if (cfg.sharps) add(PC.indexOf(pc - 1), 1, c, w, both ? 72 : 44, 98);
    if (cfg.flats) add(PC.indexOf(pc + 1), -1, c, w, 44, both ? 70 : 98);
  }
  $('#names').innerHTML = `<svg id="dial" viewBox="-100 -100 200 200">` + segs.map(s => {
    const mid = (s.a1 + s.a2) / 2, [x, y] = polar((s.r1 + s.r2) / 2, mid).split(' ');
    return `<g class="seg${s.a ? ' acc' : ''}" data-l="${s.l}" data-a="${s.a}" data-angle="${mid}"><path d="${arc(s.r1, s.r2, s.a1 + 0.012, s.a2 - 0.012)}"/>` +
      `<text x="${x}" y="${y}" class="${s.a ? 'small' : ''}">${nameOf(s.l, s.a)}</text></g>`;
  }).join('') + `<circle class="hub" r="38"/><g id="needle"><path d="M0 -36 L-7 -25 L7 -25Z"/></g><text id="hubText" class="hubtext">?</text></svg>`;
}
$('#names').onclick = e => { const g = e.target.closest('.seg'); if (g) onName(+g.dataset.l, +g.dataset.a); };

function buildWriteAcc() {
  const opts = accs().length > 1 ? [[-1, '♭'], [0, '♮'], [1, '♯']].filter(([a]) => accs().includes(a)) : [];
  $('#writeAcc').innerHTML = opts.map(([a, t]) => `<button class="${a === writeAcc ? 'on' : ''}" data-a="${a}">${t}</button>`).join('');
}
$('#writeAcc').onclick = e => { const b = e.target.closest('button'); if (b) { writeAcc = +b.dataset.a; buildWriteAcc(); } };

function next() {
  locked = false;
  writeAcc = 0;
  $('#feedback').textContent = '';
  $('#feedback').className = '';
  $('#fretboard').toggleAttribute('hidden', mode === 'read' || mode === 'write');
  $('#names').hidden = mode === 'write' || mode === 'find';
  $('#writeAcc').hidden = mode !== 'write';
  $('#staff').classList.toggle('clickable', mode === 'write');
  $('#staff').classList.toggle('compact', mode === 'name');
  buildNames();
  buildWriteAcc();

  q = pickQuestion();
  const staff = $('#staff'), fb = $('#fretboard');
  if (mode === 'read') { $('#prompt').textContent = 'Jak se jmenuje tato nota?'; drawStaff(staff, [q]); }
  if (mode === 'write') { $('#prompt').innerHTML = `Zapiš notu <span class="notebadge">${nameOf(q.step, q.acc)}</span>`; drawStaff(staff); }
  if (mode === 'find') { $('#prompt').textContent = 'Najdi tuto notu na hmatníku'; drawStaff(staff, [q]); drawFretboard(fb, [], { onClick: onFret, practice: true }); }
  if (mode === 'name') { $('#prompt').textContent = 'Jaká nota je na označeném místě?'; drawStaff(staff); drawFretboard(fb, [{ s: q.s, f: q.f, cls: 'target', label: '' }], { practice: true }); }
}

function record(ok) {
  const d = stats.days[dayKey()] ??= { ok: 0, all: 0, sec: 0 }, now = Date.now();
  d.all++;
  d.ok += ok;
  d.sec += Math.min(30, lastAnswer ? (now - lastAnswer) / 1000 : 5); // ponytail: čas = mezery mezi odpověďmi (max 30 s), stačí na odhad
  lastAnswer = now;
  const bump = (obj, k) => { const v = obj[k] ??= [0, 0]; v[0] += ok; v[1]++; };
  const notes = stats.notes[mode] ??= {};
  if (mode === 'name') { bump(stats.pos, q.key); bump(notes, pcName(q.midi)); } else bump(notes, q.key);
  save('notyStats', stats);
}

function done(ok) {
  locked = true;
  score.all++;
  score.ok += ok;
  showScore();
  record(ok);
  const answer = mode === 'name' ? pcName(q.midi) : mode === 'write' ? nameOf(q.step, q.acc) : `${nameOf(q.step, q.acc)} (${octName(q.step, q.acc)})`;
  $('#feedback').textContent = ok ? `Správně! ${answer}` : `Špatně – správně je ${answer}`;
  $('#feedback').className = ok ? 'ok' : 'bad';
  if (cfg.sound) play(q.midi);
  const current = q;
  setTimeout(() => { if (q === current && page === 'procvicovani') next(); }, ok ? 1000 : 2500);
}
const showScore = () => $('#score').textContent = page === 'procvicovani' ? `${score.ok} / ${score.all}` : '';

function onName(l, a) {
  if (locked || (mode !== 'read' && mode !== 'name')) return;
  const right = (bl, ba) => mode === 'read' ? bl === q.step % 7 && ba === q.acc : (PC[bl] + ba + 12) % 12 === q.midi % 12;
  const ok = right(l, a);
  $$('#names .seg').forEach(g => {
    const mine = +g.dataset.l === l && +g.dataset.a === a;
    if (right(+g.dataset.l, +g.dataset.a)) g.classList.add('ok');
    else if (mine) g.classList.add('bad');
    if (mine) {
      $('#needle').style.transform = `rotate(${g.dataset.angle}rad)`;
      $('#needle').classList.add('on', ok ? 'ok' : 'bad');
    }
  });
  $('#hubText').textContent = mode === 'read' ? nameOf(q.step, q.acc) : pcName(q.midi).replace('/', ' ');
  $('#hubText').classList.add(ok ? 'ok' : 'bad');
  if (mode === 'name') {
    drawStaff($('#staff'), [{ ...q, cls: 'ok' }]);
    drawFretboard($('#fretboard'), [{ s: q.s, f: q.f, cls: ok ? 'ok' : 'bad' }], { practice: true });
  }
  done(ok);
}

$('#staff').onclick = e => {
  if (mode !== 'write' || locked) return;
  const r = e.currentTarget.getBoundingClientRect();
  const y = (e.clientY - r.top) * 190 / r.height;
  const s = Math.min(44, Math.max(23, 30 + Math.round((120 - y) / 8)));
  const ok = s % 7 === q.step % 7 && writeAcc === q.acc; // libovolná oktáva se počítá
  drawStaff($('#staff'), ok ? [{ step: s, acc: writeAcc, cls: 'ok' }] : [{ step: s, acc: writeAcc, cls: 'bad', x: 130 }, { ...q, cls: 'ok', x: 220 }]);
  done(ok);
};

function onFret(i, f) {
  if (mode !== 'find' || locked) return;
  const ok = OPEN[i] + f === q.midi;
  const marks = positions(q.midi).map(([s, f]) => ({ s, f, cls: 'ok' }));
  if (!ok) marks.push({ s: i, f, cls: 'bad' });
  drawFretboard($('#fretboard'), marks, { practice: true });
  done(ok);
}

function setMode(m) {
  mode = MODES[m] ? m : 'read';
  $$('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  score = { ok: 0, all: 0 };
  showScore();
  next();
}
$('#modes').onclick = e => { if (e.target.dataset.mode) location.hash = 'procvicovani/' + e.target.dataset.mode; };

document.onkeydown = e => {
  const l = NAMES.indexOf(e.key.toUpperCase());
  if (page === 'procvicovani' && l >= 0 && !e.ctrlKey && !e.metaKey && !e.altKey) onName(l, 0);
};

// ---------- statistiky ----------
const calMonth = new Date(); calMonth.setDate(1);
const fmtMin = sec => Math.round(sec / 60) + ' min';

function streak() {
  const d = new Date();
  if (!stats.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (stats.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function renderStats() {
  const days = Object.values(stats.days), today = stats.days[dayKey()] || { ok: 0, all: 0 };
  const tot = days.reduce((a, d) => ({ ok: a.ok + d.ok, all: a.all + d.all, sec: a.sec + d.sec }), { ok: 0, all: 0, sec: 0 });
  $('#tiles').innerHTML = [
    [today.all, `dnes odpovědí · ${pct(today.ok, today.all)}`],
    [streak(), 'dní v řadě'],
    [days.length, `dní procvičování · ${fmtMin(tot.sec)}`],
    [tot.all, `odpovědí celkem · ${pct(tot.ok, tot.all)}`],
  ].map(([v, t]) => `<div class="tile"><b>${v}</b><small>${t}</small></div>`).join('');
  renderCalendar();
  renderWeeks();
  renderNotes();
}

function renderCalendar() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  $('#calTitle').textContent = calMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
  let html = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => `<b>${d}</b>`).join('') + '<span></span>'.repeat((new Date(y, m, 1).getDay() + 6) % 7);
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const k = dayKey(new Date(y, m, d)), v = stats.days[k];
    const lvl = !v ? 0 : v.all < 20 ? 1 : v.all < 50 ? 2 : v.all < 100 ? 3 : 4;
    html += `<button class="day l${lvl}${k === dayKey() ? ' today' : ''}" data-day="${k}" title="${v ? `${v.all} odpovědí, ${pct(v.ok, v.all)}` : 'bez procvičování'}">${d}</button>`;
  }
  $('#calendar').innerHTML = html;
}
$('#calendar').onclick = e => {
  const k = e.target.dataset.day;
  if (!k) return;
  $$('.day.sel').forEach(b => b.classList.remove('sel'));
  e.target.classList.add('sel');
  const v = stats.days[k], date = new Date(k + 'T12:00').toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#dayDetail').textContent = v ? `${date}: ${v.all} odpovědí, úspěšnost ${pct(v.ok, v.all)}, asi ${fmtMin(v.sec)}` : `${date}: neprocvičováno`;
};
$('#calPrev').onclick = () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); };
$('#calNext').onclick = () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); };

function renderWeeks() {
  const monday = new Date(); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const weeks = Array.from({ length: 12 }, (_, w) => {
    const start = new Date(monday); start.setDate(start.getDate() - (11 - w) * 7);
    const sum = { ok: 0, all: 0, start };
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const v = stats.days[dayKey(d)];
      if (v) { sum.ok += v.ok; sum.all += v.all; }
    }
    return sum;
  });
  const max = Math.max(1, ...weeks.map(w => w.all));
  const label = d => `${d.getDate()}.${d.getMonth() + 1}.`;
  $('#weeks').innerHTML = weeks.map(w =>
    `<div title="týden od ${label(w.start)}: ${w.all} odpovědí, úspěšnost ${pct(w.ok, w.all)}">${w.all || ''}<span style="height:${80 * w.all / max}%"></span></div>`).join('');
  $('#weekLabels').innerHTML = weeks.map((w, i) => `<span>${i % 3 ? '' : label(w.start)}</span>`).join('');
}

function renderNotes() {
  const m = $('#statMode').value, entries = Object.entries(stats.notes[m] || {});
  entries.sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1] || b[1][1] - a[1][1]);
  $('#noteBars').innerHTML = entries.length ? entries.map(([k, [ok, all]]) =>
    `<b>${k}</b><div class="track"><i style="width:${100 * (all - ok) / all}%"></i></div><span>${pct(ok, all)} <small>(${all}×)</small></span>`).join('')
    : '<span class="hint" style="grid-column:1/-1">Zatím žádná data – jdi procvičovat.</span>';
  $('#heatWrap').hidden = m !== 'name';
  if (m === 'name') drawFretboard($('#heat'), Object.entries(stats.pos).map(([k, [ok, all]]) => {
    const [s, f] = k.split('-').map(Number), err = (all - ok) / all;
    return { s, f, cls: err > 0.5 ? '' : 'heat', style: `color: rgba(var(--heat), ${0.15 + 0.85 * err})`, label: Math.round(100 * ok / all) };
  }));
}
$('#statMode').onchange = renderNotes;

// ---------- výuka ----------
// Příklady v lekcích: <div class="ex" data-staff="C4 F#4 Hb3 C4+E4+G4" data-key="F#5"> nebo data-fret="6:0 5:2" (struna:pražec), data-chord = zahrát najednou.
const parseNote = t => { const [, l, a, o] = t.match(/^([A-H])([#b]?)(\d)$/); return { step: NAMES.indexOf(l) + 7 * +o, acc: a === '#' ? 1 : a ? -1 : 0 }; };

function renderLesson(i) {
  const sec = $('#vyuka');
  if (!LESSONS[i]) {
    const n = LESSONS.filter((_, i) => readLessons.has(i)).length;
    sec.innerHTML = `<div class="card"><b>Přečteno ${n} z ${LESSONS.length} kapitol</b><div class="progress"><i style="width:${100 * n / LESSONS.length}%"></i></div></div>` +
      '<ol class="lessons">' + LESSONS.map((l, i) => `<li><a href="#vyuka/${i}"><span class="num${readLessons.has(i) ? ' done' : ''}">${readLessons.has(i) ? '✓' : i + 1}</span>` +
      `<span class="t">${l.title}<small>${l.sub}</small></span><span class="chev">›</span></a></li>`).join('') + '</ol>';
    return;
  }
  i = +i;
  readLessons.add(i);
  save('notyRead', { list: [...readLessons] });
  const L = LESSONS[i];
  sec.innerHTML = `<article class="lesson"><a class="btn" href="#vyuka">← Kapitoly</a><h2>${i + 1}. ${L.title}</h2>${L.body}
    <div class="lessonnav">${i > 0 ? `<a class="btn" href="#vyuka/${i - 1}">← ${LESSONS[i - 1].title}</a>` : '<span></span>'}
    ${i < LESSONS.length - 1 ? `<a class="btn primary" href="#vyuka/${i + 1}">${LESSONS[i + 1].title} →</a>` : ''}</div></article>`;
  for (const ex of sec.querySelectorAll('.ex')) {
    const svg = el(ex, 'svg', {});
    let seq; // pole akordů (každý = pole MIDI) k přehrání
    if (ex.dataset.staff != null) {
      svg.classList.add('staff');
      const key = (ex.dataset.key || '').split(' ').filter(Boolean).map(parseNote);
      const groups = ex.dataset.staff.split(' ').filter(Boolean).map(g => g.split('+').map(parseNote));
      let x = 70 + key.length * 11; // nota s posuvkou potřebuje víc místa vlevo
      const xs = groups.map(g => x += 40 + (g.some(n => n.acc) ? 14 : 0));
      const width = Math.max(300, x + 30);
      svg.style.maxWidth = width * 1.4 + 'px';
      drawStaff(svg, groups.flatMap((g, i) => g.map(n => ({ ...n, x: xs[i] }))), { width, key, whole: true });
      seq = groups.map(g => g.map(n => midiOf(n.step, n.acc)));
    } else {
      svg.classList.add('fretboard');
      svg.setAttribute('viewBox', '0 0 650 205');
      const marks = ex.dataset.fret.split(' ').map(t => { const [s, f] = t.split(':').map(Number); return { s: s - 1, f, cls: 'target' }; });
      drawFretboard(svg, marks);
      seq = ex.hasAttribute('data-chord') ? [marks.map(m => OPEN[m.s] + m.f).sort((a, b) => a - b)] : marks.map(m => [OPEN[m.s] + m.f]);
    }
    if (ex.dataset.text) ex.insertAdjacentHTML('beforeend', `<p class="hint">${ex.dataset.text}</p>`);
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = '▶ Přehrát';
    b.onclick = () => seq.forEach((chord, i) => chord.forEach((m, j) => play(m, i * 0.5 + j * 0.05)));
    ex.append(b);
  }
}

// ---------- volná hra (mikrofon) ----------
// YIN: odhad základní frekvence z jednoho okna vzorků; null = ticho nebo nejasný tón.
function detectPitch(buf, sr) {
  let rms = 0;
  for (const v of buf) rms += v * v;
  if (Math.sqrt(rms / buf.length) < 0.01) return null;
  const minLag = Math.floor(sr / 1100), maxLag = Math.ceil(sr / 70), W = buf.length - maxLag;
  const d = new Float32Array(maxLag + 2);
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let sum = 0;
    for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + lag]; sum += x * x; }
    d[lag] = sum;
  }
  let run = 0;
  d[0] = 1;
  for (let lag = 1; lag <= maxLag + 1; lag++) { run += d[lag]; d[lag] = run ? d[lag] * lag / run : 1; }
  let lag = minLag;
  while (lag <= maxLag && d[lag] >= 0.15) lag++;
  if (lag > maxLag) return null;
  while (lag < maxLag && d[lag + 1] < d[lag]) lag++;
  const a = d[lag - 1], b = d[lag], c = d[lag + 1], den = a - 2 * b + c;
  return sr / (lag + (den ? (a - c) / (2 * den) : 0));
}

let mic = null, live = { midi: null, count: 0, silent: 99, shown: null }, played = [];
const freqToMidi = f => 69 + 12 * Math.log2(f / 440) + 12; // +12: psaná výška kytary

function showLive(m, cents = null, hz = null) {
  const n = spell(m);
  $('#liveNote').textContent = labelOf(m);
  $('#liveInfo').textContent = `${octName(n.step, n.acc)}${hz ? ` · ${hz.toFixed(1)} Hz · ${cents > 0 ? '+' : ''}${cents} ct` : ''}`;
  $('#tunerNeedle').style.left = `${50 + (cents ?? 0)}%`;
  $('#tunerNeedle').classList.toggle('in', cents !== null && Math.abs(cents) <= 5);
  drawFretboard($('#liveFret'), positions(m).map(([s, f]) => ({ s, f, cls: 'target' })), { onClick: tapFret });
}
function pushHistory(m) {
  played = [...played, m].slice(-12);
  drawStaff($('#liveStaff'), played.map((m, i) => ({ ...spell(m), x: 90 + i * 40, cls: i === played.length - 1 ? 'target' : '' })), { width: 570 });
}
function tapFret(s, f) {
  const m = OPEN[s] + f;
  play(m);
  showLive(m);
  pushHistory(m);
}

function listen() {
  if (!mic) return;
  mic.raf = requestAnimationFrame(listen);
  const now = performance.now();
  if (now - mic.last < 40) return; // ~25 měření za sekundu stačí, šetří baterii
  mic.last = now;
  mic.an.getFloatTimeDomainData(mic.buf);
  const f = detectPitch(mic.buf, ac.sampleRate), m = f && Math.round(freqToMidi(f));
  if (!m || m < 50 || m > 90) { live.silent++; live.count = 0; return; }
  live.count = m === live.midi ? live.count + 1 : 1;
  live.midi = m;
  if (live.count < 3) return; // tón musí chvíli vydržet, jinak problikává
  showLive(m, Math.round(100 * (freqToMidi(f) - m)), f);
  if (m !== live.shown || live.silent > 3) pushHistory(m); // nový tón, nebo znovu zahraný po pauze
  live.shown = m;
  live.silent = 0;
}

async function startMic() {
  try {
    ac ??= new AudioContext();
    await ac.resume();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const an = ac.createAnalyser();
    an.fftSize = 4096;
    ac.createMediaStreamSource(stream).connect(an);
    mic = { stream, an, buf: new Float32Array(an.fftSize), last: 0 };
    $('#micBtn').textContent = 'Vypnout mikrofon';
    $('#liveInfo').textContent = 'Poslouchám… zahraj tón';
    listen();
  } catch (e) {
    $('#liveInfo').textContent = 'Mikrofon není dostupný: ' + (e.name === 'NotAllowedError' ? 'přístup zamítnut' : e.message || e.name);
  }
}
function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach(t => t.stop());
  mic = null;
  $('#micBtn').textContent = 'Zapnout mikrofon';
}
$('#micBtn').onclick = () => mic ? stopMic() : startMic();
$('#liveClear').onclick = () => { played = []; drawStaff($('#liveStaff'), [], { width: 570 }); };

// ---------- navigace ----------
const TITLES = { procvicovani: 'Procvičování', hrat: 'Volná hra', vyuka: 'Výuka', statistiky: 'Statistiky', nastaveni: 'Nastavení' };
function route() {
  const [p, arg] = location.hash.slice(1).split('/');
  page = TITLES[p] ? p : 'procvicovani';
  $$('main > section').forEach(s => s.hidden = s.id !== page);
  $$('#menu a').forEach(a => a.classList.toggle('on', a.hash === '#' + page));
  $('#title').textContent = TITLES[page];
  if (page === 'procvicovani') setMode(arg || mode);
  if (page === 'vyuka') renderLesson(arg);
  if (page === 'statistiky') renderStats();
  if (page === 'hrat') { drawStaff($('#liveStaff'), [], { width: 570 }); drawFretboard($('#liveFret'), [], { onClick: tapFret }); played = []; }
  else stopMic();
  showScore();
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
