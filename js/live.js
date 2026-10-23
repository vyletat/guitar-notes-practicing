// Záložka Hra → Volně: mikrofon → rozpoznaný tón v osnově, na hmatníku a v ladičce.
import { OPEN, positions, spell, labelOf, octName } from './music.js';
import { preferFlats } from './store.js';
import { play } from './audio.js';
import { $, drawStaff, drawFretboard } from './draw.js';
import { micOn, startMic, stopMic } from './mic.js';

const STAFF_WIDTH = 570, HISTORY = 12;
let played = [];

function showNote(m, cents = null, hz = null) {
  const n = spell(m, preferFlats());
  $('#liveNote').textContent = labelOf(m, preferFlats());
  $('#liveInfo').textContent = octName(n.step, n.acc) + (hz ? ` · ${hz.toFixed(1)} Hz · ${cents > 0 ? '+' : ''}${cents} ct` : '');
  $('#tunerNeedle').style.left = `${50 + (cents ?? 0)}%`;
  $('#tunerNeedle').classList.toggle('in', cents !== null && Math.abs(cents) <= 5);
  drawFretboard($('#liveFret'), positions(m).map(([s, f]) => ({ s, f, cls: 'target' })), { onClick: tapFret });
}

function drawPlayed() {
  const notes = played.map((m, i) => ({ ...spell(m, preferFlats()), x: 90 + i * 40, cls: i === played.length - 1 ? 'target' : '' }));
  drawStaff($('#liveStaff'), notes, { width: STAFF_WIDTH });
}
function addPlayed(m) {
  played = [...played, m].slice(-HISTORY);
  drawPlayed();
}

function tapFret(s, f) {
  const m = OPEN[s] + f;
  play(m);
  showNote(m);
  addPlayed(m);
}

function onNote({ midi, cents, hz, onset }) {
  showNote(midi, cents, hz);
  if (onset) addPlayed(midi);
}

$('#micBtn').onclick = async () => {
  if (micOn()) return hide();
  const err = await startMic(onNote);
  $('#liveInfo').textContent = err || 'Poslouchám… zahraj tón';
  if (!err) $('#micBtn').textContent = 'Vypnout mikrofon';
};
$('#liveClear').onclick = () => { played = []; drawPlayed(); };

export function show() {
  played = [];
  drawPlayed();
  drawFretboard($('#liveFret'), [], { onClick: tapFret });
}
export function hide() {
  stopMic();
  $('#micBtn').textContent = 'Zapnout mikrofon';
}
