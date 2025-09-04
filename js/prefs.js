// /js/prefs.js
const KEY_FAVS = 'fav_mods_v1';
const KEY_AUTOSELECT = 'pref_autoselect_favs';

function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/** @returns {string[]} */
export function getFavs() {
  const arr = readJSON(KEY_FAVS, []);
  return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
}
/** @param {string[]} ids */
export function setFavs(ids) {
  const uniq = Array.from(new Set((ids || []).filter(x => typeof x === 'string' && x.trim())));
  writeJSON(KEY_FAVS, uniq);
}
/** Alterna e devolve o novo estado (true=favorito) */
export function toggleFav(id) {
  const set = new Set(getFavs());
  let now;
  if (set.has(id)) { set.delete(id); now = false; }
  else { set.add(id); now = true; }
  writeJSON(KEY_FAVS, Array.from(set));
  return now;
}
export function isFav(id) { return getFavs().includes(id); }

export function getPrefAutoselectFavs() { return !!readJSON(KEY_AUTOSELECT, false); }
export function setPrefAutoselectFavs(v) { writeJSON(KEY_AUTOSELECT, !!v); }

/** Coloca favoritos primeiro (ordem estável) */
export function orderModules(mods) {
  const fav = new Set(getFavs());
  const a = [], b = [];
  (mods || []).forEach(m => (fav.has(m.id) ? a : b).push(m));
  return [...a, ...b];
}
