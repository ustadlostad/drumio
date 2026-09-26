/**
 * store.js — persisted user settings (localStorage).
 *
 * Storage can be unavailable (private mode, blocked site data), so every
 * access is guarded and the app keeps working with in-memory defaults.
 */

const STORAGE_KEY = "drumio-settings";
const LEGACY_THEME_KEY = "drumio-theme";

const DEFAULTS = {
  theme: null,        // "light" | "dark" | null (follow system)
  lang: null,         // language code | null (follow browser)
  bpm: 100,
  sound: "click",
  timeSig: "4/4",
  subdivision: 1,     // clicks per beat: 1, 2, 3 or 4
  timerSeconds: 300,
  timerLinked: true,  // whether the practice timer starts/stops with the metronome
};

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacyTheme && !saved.theme) saved.theme = legacyTheme;
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Current settings. Treat as read-only; change through updateSettings(). */
export const settings = read();

export function updateSettings(patch) {
  Object.assign(settings, patch);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // Storage unavailable: settings stay in memory for this session.
  }
}
