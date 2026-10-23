// Vstupní bod: nastavení, navigace mezi stránkami a service worker.
import { STRING_NAMES } from './music.js';
import { cfg, saveCfg, resetStats } from './store.js';
import { $, $$ } from './draw.js';
import * as practice from './practice.js';
import * as live from './live.js';
import * as along from './playalong.js';
import * as metronome from './metronome.js';
import { renderStats } from './stats.js';
import { renderLesson } from './lessons.js';

// ---------- nastavení ----------
const SWITCHES = ['sound', 'sharps', 'flats', 'adaptive'];
const ALL_STRINGS = [0, 1, 2, 3, 4, 5];

$('#strings').innerHTML = STRING_NAMES.map((n, i) => `<label class="chip"><input type="checkbox" name="str" value="${i}">${i + 1} · ${n}</label>`).join('');

function fillForm() {
  $('#range').value = cfg.range;
  $('#maxFret').value = cfg.maxFret;
  $('#dailyGoal').value = cfg.dailyGoal;
  SWITCHES.forEach(k => $('#' + k).checked = cfg[k]);
  $$('[name=str]').forEach(c => c.checked = cfg.strings.includes(+c.value));
}

$('#settings').onchange = () => {
  cfg.range = $('#range').value;
  cfg.maxFret = +$('#maxFret').value;
  cfg.dailyGoal = +$('#dailyGoal').value;
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

// ---------- navigace (#stranka/parametr/parametr) ----------
// stránka Hra má záložky: #hrat/volne, #hrat/noty, #hrat/etudy[/číslo], #hrat/metronom
function showPlay(tab, arg) {
  tab = ['volne', 'noty', 'etudy', 'metronom'].includes(tab) ? tab : 'volne';
  $$('#playTabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  $('#playFree').hidden = tab !== 'volne';
  $('#metronome').hidden = tab !== 'metronom';
  $('#along').hidden = $('#etudeList').hidden = true;
  if (tab === 'volne') live.show();
  else if (tab === 'noty') along.showRandom();
  else if (tab === 'etudy') along.showEtudes(arg);
  else metronome.show();
}

const PAGES = {
  procvicovani: ['Procvičování', practice.show],
  hrat: ['Hra', showPlay],
  vyuka: ['Výuka', renderLesson],
  statistiky: ['Statistiky', renderStats],
  nastaveni: ['Nastavení', () => {}],
};

function route() {
  const [hash, arg, arg2] = location.hash.slice(1).split('/');
  const page = PAGES[hash] ? hash : 'procvicovani', [title, show] = PAGES[page];
  $$('main > section').forEach(s => s.hidden = s.id !== page);
  $$('#menu a').forEach(a => a.classList.toggle('on', a.hash === '#' + page));
  $('#title').textContent = title;
  $('#score').textContent = '';
  practice.hide();
  live.hide(); // vypne mikrofon a metronom při odchodu ze stránky
  along.hide();
  metronome.hide();
  show(arg, arg2);
  scrollTo(0, 0);
}

addEventListener('hashchange', route);
route();

// ---------- instalace (PWA) ----------
// Chrome/Edge/Android nabídnou instalaci událostí beforeinstallprompt; iPhone jen ručně přes Sdílet.
let installPrompt = null;
function updateInstall() {
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#installBtn').hidden = !installPrompt;
  $('#installHint').textContent = installed ? 'Aplikace je nainstalovaná ✓'
    : installPrompt ? 'Přidej si aplikaci na plochu – pak funguje i offline.'
    : !isSecureContext ? 'Instalace funguje jen přes HTTPS (nebo localhost). Tahle adresa zabezpečená není – návod je v README.'
    : /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'Na iPhonu: v Safari klepni na Sdílet → Přidat na plochu.'
    : 'Prohlížeč instalaci teď nenabízí – zkus v jeho menu „Nainstalovat aplikaci“ nebo „Přidat na plochu“. Možná je už nainstalovaná.';
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; updateInstall(); });
addEventListener('appinstalled', () => { installPrompt = null; updateInstall(); });
$('#installBtn').onclick = async () => {
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  updateInstall();
};
updateInstall();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
