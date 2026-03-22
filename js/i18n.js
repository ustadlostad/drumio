/**
 * i18n.js — Drumio Internationalisation
 *
 * To add a new language, add an entry to TRANSLATIONS below.
 * Function-valued strings support interpolation: call t(key, ...args).
 */

// ─── Translations ─────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    // Nav
    'nav.metronome':  'Metronome',
    'nav.rudiments':  'Rudiments',
    'nav.drills':     'Drills',

    // Theme toggle
    'theme.toggleAria': 'Toggle dark mode',

    // Metronome
    'metronome.timeSig':  'Time Signature',
    'metronome.tapTempo': 'Tap Tempo',
    'metronome.start':    'Start',
    'metronome.stop':     'Stop',

    // Timer
    'timer.title':       'Practice Timer',
    'timer.setDuration': 'Set duration',
    'timer.hint':        'Syncs with metronome \u2014 starts & stops automatically',

    // Filters (shared between rudiments & drills)
    'filter.all':          'All',
    'filter.allLevels':    'All Levels',
    'filter.beginner':     'Beginner',
    'filter.intermediate': 'Intermediate',
    'filter.advanced':     'Advanced',

    // Rudiments
    'rudiments.search':          'Search rudiments\u2026',
    'rudiments.filterCategory':  'Filter by category',
    'rudiments.filterDifficulty':'Filter by difficulty',
    'rudiments.count':    (n, total) => `${n} of ${total} rudiment${total !== 1 ? 's' : ''}`,
    'rudiments.empty':    'No rudiments match your filters.',
    'rudiments.error':    'Could not load rudiments. Try refreshing.',
    'rudiments.watch':    'Watch',
    'rudiments.watchAria':(name) => `Watch ${name} tutorial`,

    // Drills
    'drills.search':       'Search drills\u2026',
    'drills.count':        (n, total) => `${n} of ${total} drill${total !== 1 ? 's' : ''}`,
    'drills.empty':        'No drills match your filters.',
    'drills.error':        'Could not load drills. Try refreshing.',
    'drills.startAt':      (bpm) => `Start at ${bpm} BPM`,
    'drills.practise':     'Practise',
    'drills.practiseAria': (name, bpm) => `Practise ${name} at ${bpm} BPM`,
    'drills.watch':        'Watch',
    'drills.watchAria':    (name) => `Watch ${name} video`,
    'drills.toast':        (bpm) => `Metronome set to ${bpm} BPM`,

    // Modal
    'modal.openYoutube': '\u2197 Open on YouTube',
    'modal.closeAria':   'Close video',
    'modal.playerAria':  'Video player',

    // Footer
    'footer.tagline': 'Keep the beat.',
  },

  tr: {
    // Nav
    'nav.metronome': 'Metronom',
    'nav.rudiments': 'Rudimentler',
    'nav.drills':    'Egzersizler',

    // Theme toggle
    'theme.toggleAria': 'Karanlık modu değiştir',

    // Metronome
    'metronome.timeSig':  'Zaman İşareti',
    'metronome.tapTempo': 'Tempo Vur',
    'metronome.start':    'Başlat',
    'metronome.stop':     'Durdur',

    // Timer
    'timer.title':       'Çalışma Zamanlayıcısı',
    'timer.setDuration': 'Süre Ayarla',
    'timer.hint':        'Metronom ile senkronize \u2014 otomatik başlar ve durur',

    // Filters
    'filter.all':          'Tümü',
    'filter.allLevels':    'Tüm Seviyeler',
    'filter.beginner':     'Başlangıç',
    'filter.intermediate': 'Orta',
    'filter.advanced':     'İleri',

    // Rudiments
    'rudiments.search':           'Rudiment ara\u2026',
    'rudiments.filterCategory':   'Kategoriye göre filtrele',
    'rudiments.filterDifficulty': 'Zorluğa göre filtrele',
    'rudiments.count':    (n, total) => `${total} rudimentten ${n} tanesi`,
    'rudiments.empty':    'Filtrelerinizle eşleşen rudiment bulunamadı.',
    'rudiments.error':    'Rudimentler yüklenemedi. Sayfayı yenilemeyi deneyin.',
    'rudiments.watch':    'İzle',
    'rudiments.watchAria':(name) => `${name} eğitimini izle`,

    // Drills
    'drills.search':       'Egzersiz ara\u2026',
    'drills.count':        (n, total) => `${total} egzersizden ${n} tanesi`,
    'drills.empty':        'Filtrelerinizle eşleşen egzersiz bulunamadı.',
    'drills.error':        'Egzersizler yüklenemedi. Sayfayı yenilemeyi deneyin.',
    'drills.startAt':      (bpm) => `${bpm} BPM'den başla`,
    'drills.practise':     'Pratik Yap',
    'drills.practiseAria': (name, bpm) => `${name} egzersizini ${bpm} BPM'de yap`,
    'drills.watch':        'İzle',
    'drills.watchAria':    (name) => `${name} videosunu izle`,
    'drills.toast':        (bpm) => `Metronom ${bpm} BPM'e ayarlandı`,

    // Modal
    'modal.openYoutube': "\u2197 YouTube'da Aç",
    'modal.closeAria':   'Videoyu kapat',
    'modal.playerAria':  'Video oynatıcı',

    // Footer
    'footer.tagline': 'Ritmi koru.',
  },
};

// ─── State ────────────────────────────────────────────────────────

let _currentLang = 'en';

// ─── Public API ───────────────────────────────────────────────────

/**
 * Get a translated string for the current language.
 * Function-valued entries are called with ...args for interpolation.
 * Falls back to English, then returns the key itself.
 *
 * @param {string} key
 * @param {...any} args  – forwarded to function-valued translations
 * @returns {string}
 */
function t(key, ...args) {
  const dict = TRANSLATIONS[_currentLang] || TRANSLATIONS.en;
  const val  = key in dict ? dict[key] : TRANSLATIONS.en[key];
  if (val === undefined) return key;
  return typeof val === 'function' ? val(...args) : val;
}

/**
 * Switch the active language and notify all listeners.
 * @param {string} lang  – must be a key present in TRANSLATIONS
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang] || lang === _currentLang) return;
  _currentLang = lang;
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

/** Returns the currently active language code, e.g. 'en' or 'tr'. */
function getCurrentLang() {
  return _currentLang;
}
