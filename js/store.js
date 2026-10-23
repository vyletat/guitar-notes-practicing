// Nastavení a statistiky uložené v localStorage (jen v tomto zařízení).
import { midiOf, validAcc } from './music.js';

const load = (key, def) => { try { return Object.assign(def, JSON.parse(localStorage[key] || '{}')); } catch { return def; } };
const save = (key, value) => { try { localStorage[key] = JSON.stringify(value); } catch {} };

export const cfg = load('noty', {
  range: 'staff', strings: [0, 1, 2, 3, 4, 5], maxFret: 5, sound: true,
  sharps: false, flats: false, adaptive: true, dailyGoal: 20, metroBpm: 80, metroBeats: 4,
});
// days[YYYY-MM-DD] = {ok, all, sec}; notes[režim][nota] = [ok, all]; pos['struna-pražec'] = [ok, all] (režim hmat → nota)
export const stats = load('notyStats', { days: {}, notes: {}, pos: {} });
export const readLessons = new Set(load('notyRead', { list: [] }).list);

export const saveCfg = () => save('noty', cfg);
export const saveStats = () => save('notyStats', stats);
export const markRead = i => { readLessons.add(i); save('notyRead', { list: [...readLessons] }); };
export const resetStats = () => { Object.assign(stats, { days: {}, notes: {}, pos: {} }); saveStats(); };

export const dayKey = (d = new Date()) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD v místním čase
export const pct = (ok, all) => all ? Math.round(100 * ok / all) + ' %' : '–';
export const todayCount = () => stats.days[dayKey()]?.all || 0;

// ---------- noty podle nastavení ----------
export const RANGES = { staff: [29, 39], full: [23, 44] }; // kroky d¹–g², e–e³
export const accidentals = () => [0, ...(cfg.sharps ? [1] : []), ...(cfg.flats ? [-1] : [])];
// béčka v zápisu jen tehdy, když jsou v nastavení zapnutá samotná
export const preferFlats = () => cfg.flats && !cfg.sharps;

// všechny noty z rozsahu v nastavení: [{step, acc, midi}]
export function notePool() {
  const [lo, hi] = RANGES[cfg.range], out = [];
  for (let step = lo; step <= hi; step++)
    for (const acc of accidentals()) if (validAcc(step, acc)) out.push({ step, acc, midi: midiOf(step, acc) });
  return out;
}
