// Vstupní bod: nastavení, navigace mezi stránkami a service worker.
import { STRING_NAMES } from './music.js';
import { cfg, saveCfg, resetStats } from './store.js';
import { $, $$ } from './draw.js';
import * as practice from './practice.js';
import * as live from './live.js';
import { renderStats } from './stats.js';
import { renderLesson } from './lessons.js';

// ---------- nastavení ----------
const SWITCHES = ['sound', 'sharps', 'flats', 'adaptive'];
const ALL_STRINGS = [0, 1, 2, 3, 4, 5];

$('#strings').innerHTML = STRING_NAMES.map((n, i) => `<label class="chip"><input type="checkbox" name="str" value="${i}">${i + 1} · ${n}</label>`).join('');

function fillForm() {
  $('#range').value = cfg.range;
  $('#maxFret').value = cfg.maxFret;
  SWITCHES.forEach(k => $('#' + k).checked = cfg[k]);
  $$('[name=str]').forEach(c => c.checked = cfg.strings.includes(+c.value));
}

$('#settings').onchange = () => {
  cfg.range = $('#range').value;
  cfg.maxFret = +$('#maxFret').value;
  SWITCHES.forEach(k => cfg[k] = $('#' + k).checked);
  cfg.strings = $$('[name=str]:checked').map(c => +c.value);
  if (!cfg.strings.length) { cfg.strings = ALL_STRINGS; fillForm(); } // aspoň jedna struna
  saveCfg();
};

// confirm() v PWA a náhledech často nefunguje (vrací rovnou false), proto potvrzení druhým klepnutím
$('#reset').onclick = e => {
  const b = e.currentTarget;
  clearTimeout(b.timer);
  b.timer = setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Smazat statistiky'; }, 4000);
  if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Opravdu? Klepni znovu'; return; }
  resetStats();
  b.classList.remove('armed');
  b.textContent = 'Smazáno ✓';
};

fillForm();

// ---------- navigace (#stranka/parametr) ----------
const PAGES = {
  procvicovani: ['Procvičování', practice.show],
  hrat: ['Volná hra', live.show],
  vyuka: ['Výuka', renderLesson],
  statistiky: ['Statistiky', renderStats],
  nastaveni: ['Nastavení', () => {}],
};

function route() {
  const [hash, arg] = location.hash.slice(1).split('/');
  const page = PAGES[hash] ? hash : 'procvicovani', [title, show] = PAGES[page];
  $$('main > section').forEach(s => s.hidden = s.id !== page);
  $$('#menu a').forEach(a => a.classList.toggle('on', a.hash === '#' + page));
  $('#title').textContent = title;
  $('#score').textContent = '';
  practice.hide();
  live.hide(); // vypne mikrofon při odchodu ze stránky
  show(arg);
  scrollTo(0, 0);
}

addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
