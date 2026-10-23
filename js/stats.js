// Záznam odpovědí a stránka Statistiky (dlaždice, kalendář, týdny, problémové noty).
import { stats, saveStats, dayKey, pct } from './store.js';
import { $, $$, drawFretboard } from './draw.js';

let lastAnswer = 0;
const bump = (bucket, key, ok) => { const v = bucket[key] ??= [0, 0]; v[0] += ok; v[1]++; };

// key = nota pro přehled "co dělá potíže"; pos = 'struna-pražec' (jen režim hmat → nota)
export function record(ok, mode, key, pos) {
  const d = stats.days[dayKey()] ??= { ok: 0, all: 0, sec: 0 }, now = Date.now();
  d.all++;
  d.ok += ok;
  // ponytail: čas = mezery mezi odpověďmi (max 30 s), na odhad stačí
  d.sec += Math.min(30, lastAnswer ? (now - lastAnswer) / 1000 : 5);
  lastAnswer = now;
  bump(stats.notes[mode] ??= {}, key, ok);
  if (pos) bump(stats.pos, pos, ok);
  saveStats();
}

const fmtMin = sec => Math.round(sec / 60) + ' min';

function streak() {
  const d = new Date();
  if (!stats.days[dayKey(d)]) d.setDate(d.getDate() - 1); // dnešek se ještě může doplnit
  let n = 0;
  while (stats.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function renderStats() {
  const days = Object.values(stats.days), today = stats.days[dayKey()] || { ok: 0, all: 0 };
  const total = days.reduce((a, d) => ({ ok: a.ok + d.ok, all: a.all + d.all, sec: a.sec + d.sec }), { ok: 0, all: 0, sec: 0 });
  $('#tiles').innerHTML = [
    [today.all, `dnes odpovědí · ${pct(today.ok, today.all)}`],
    [streak(), 'dní v řadě'],
    [days.length, `dní procvičování · ${fmtMin(total.sec)}`],
    [total.all, `odpovědí celkem · ${pct(total.ok, total.all)}`],
  ].map(([v, t]) => `<div class="tile"><b>${v}</b><small>${t}</small></div>`).join('');
  renderCalendar();
  renderWeeks();
  renderNotes();
}

// ---------- kalendář ----------
const calMonth = new Date();
calMonth.setDate(1);

function renderCalendar() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  $('#calTitle').textContent = calMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
  const blanks = (new Date(y, m, 1).getDay() + 6) % 7; // týden začíná pondělím
  let html = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => `<b>${d}</b>`).join('') + '<span></span>'.repeat(blanks);
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const k = dayKey(new Date(y, m, d)), v = stats.days[k];
    const level = !v ? 0 : v.all < 20 ? 1 : v.all < 50 ? 2 : v.all < 100 ? 3 : 4;
    const title = v ? `${v.all} odpovědí, ${pct(v.ok, v.all)}` : 'bez procvičování';
    html += `<button class="day l${level}${k === dayKey() ? ' today' : ''}" data-day="${k}" title="${title}">${d}</button>`;
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

// ---------- posledních 12 týdnů ----------
function renderWeeks() {
  const monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const weeks = Array.from({ length: 12 }, (_, w) => {
    const start = new Date(monday);
    start.setDate(start.getDate() - (11 - w) * 7);
    const sum = { ok: 0, all: 0, start };
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
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

// ---------- problémové noty ----------
function renderNotes() {
  const mode = $('#statMode').value, entries = Object.entries(stats.notes[mode] || {});
  entries.sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1] || b[1][1] - a[1][1]); // nejhorší úspěšnost první
  $('#noteBars').innerHTML = entries.length
    ? entries.map(([k, [ok, all]]) =>
      `<b>${k}</b><div class="track"><i style="width:${100 * (all - ok) / all}%"></i></div><span>${pct(ok, all)} <small>(${all}×)</small></span>`).join('')
    : '<span class="hint" style="grid-column:1/-1">Zatím žádná data – jdi procvičovat.</span>';
  $('#heatWrap').hidden = mode !== 'name';
  if (mode === 'name') drawFretboard($('#heat'), Object.entries(stats.pos).map(([k, [ok, all]]) => {
    const [s, f] = k.split('-').map(Number), err = (all - ok) / all;
    return { s, f, cls: err > 0.5 ? '' : 'heat', style: `color: rgba(var(--heat), ${0.15 + 0.85 * err})`, label: Math.round(100 * ok / all) };
  }));
}
$('#statMode').onchange = renderNotes;
