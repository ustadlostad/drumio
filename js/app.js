/**
 * app.js — Drumio entry point
 * Handles theme toggling and top-level app initialisation.
 */

// ─── Theme ────────────────────────────────────────────────────────

const THEME_KEY = "drumio-theme";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ─── Active Sticking (Exercise) ───────────────────────────────────

let activeSticking    = [];  // parsed R/L array from selected rudiment
let stickingBeatCount = 0;   // total beats fired since exercise started

function parseSticking(str) {
  return str.trim().split(/\s+/)
    .map(tkn => tkn[0] && tkn[0].toUpperCase())
    .filter(tkn => tkn === 'R' || tkn === 'L');
}

function clearSticking() {
  activeSticking    = [];
  stickingBeatCount = 0;
  const bi = document.getElementById("beatIndicator");
  if (!bi) return;
  bi.classList.remove("has-sticking");
  bi.querySelectorAll(".beat-dot").forEach(d => { d.textContent = ""; });
}

function openRudimentExercise(stickingStr) {
  activeSticking    = parseSticking(stickingStr);
  stickingBeatCount = 0;
  const bi = document.getElementById("beatIndicator");
  if (bi) bi.classList.add("has-sticking");
  showSection("Metronome");
  if (!metronome.isPlaying) {
    metronome.start();
    const playBtn = document.getElementById("playBtn");
    if (playBtn) {
      playBtn.textContent = t("metronome.stop");
      playBtn.classList.add("playing");
    }
  }
}

// ─── Metronome UI ─────────────────────────────────────────────────

function initMetronomeUI() {
  const playBtn       = document.getElementById("playBtn");
  const tapBtn        = document.getElementById("tapBtn");
  const bpmSlider     = document.getElementById("bpmSlider");
  const bpmNumber     = document.getElementById("bpmNumber");
  const beatIndicator = document.getElementById("beatIndicator");
  const soundBtns     = document.querySelectorAll(".sound-btn");
  const nudgeBtns     = document.querySelectorAll(".nudge-btn");
  const timeSigSelect = document.getElementById("timeSigSelect");

  if (!playBtn) return; // metronome section not on this page

  // ── Build beat dots ──────────────────────────────────────────
  function buildBeatDots(count) {
    beatIndicator.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("div");
      dot.className = "beat-dot" + (i === 0 ? " accent" : "");
      dot.dataset.beat = i;
      beatIndicator.appendChild(dot);
    }
  }
  buildBeatDots(metronome.beatsPerBar);

  // ── Time signature dropdown ───────────────────────────────────
  TIME_SIGNATURES.forEach((sig) => {
    const opt = document.createElement("option");
    opt.value = sig.id;
    opt.textContent = sig.label;
    timeSigSelect.appendChild(opt);
  });
  timeSigSelect.value = metronome.timeSignature.id;

  timeSigSelect.addEventListener("change", () => {
    metronome.setTimeSignature(timeSigSelect.value);
    buildBeatDots(metronome.beatsPerBar);
  });
  function syncBpm(value) {
    metronome.setBpm(value);
    const clamped = metronome.bpm;
    bpmNumber.textContent = clamped;
    bpmNumber.setAttribute("aria-valuenow", clamped);
    bpmSlider.value = clamped;
    const pct = ((clamped - 20) / (300 - 20)) * 100;
    bpmSlider.style.setProperty("--pct", pct + "%");
  }
  syncBpm(metronome.bpm);

  // ── Slider ───────────────────────────────────────────────────
  bpmSlider.addEventListener("input", () => syncBpm(bpmSlider.value));

  // ── Nudge buttons ────────────────────────────────────────────
  nudgeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      syncBpm(metronome.bpm + Number(btn.dataset.delta));
    });
  });

  // ── BPM inline edit (click on number) ────────────────────────
  bpmNumber.addEventListener("click", () => {
    bpmNumber.contentEditable = "true";
    bpmNumber.focus();
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(bpmNumber);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });

  bpmNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      bpmNumber.blur();
    }
    // Allow only digits and editing keys
    if (
      !/^\d$/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
    ) {
      e.preventDefault();
    }
  });

  bpmNumber.addEventListener("blur", () => {
    bpmNumber.contentEditable = "false";
    const parsed = parseInt(bpmNumber.textContent, 10);
    syncBpm(isNaN(parsed) ? metronome.bpm : parsed);
  });

  // ── Sound selector ───────────────────────────────────────────
  soundBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      soundBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      metronome.setSound(btn.dataset.sound);
    });
  });

  // ── Play / Stop ──────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    metronome.toggle();
    playBtn.textContent = metronome.isPlaying ? t("metronome.stop") : t("metronome.start");
    playBtn.classList.toggle("playing", metronome.isPlaying);
  });

  // ── Tap Tempo ────────────────────────────────────────────────
  tapBtn.addEventListener("click", () => {
    const newBpm = metronome.tap();
    syncBpm(newBpm);
  });

  // Keyboard shortcut: Space = play/stop, T = tap tempo
  document.addEventListener("keydown", (e) => {
    // Don't fire if user is typing in an input
    if (e.target.closest("input, [contenteditable]")) return;
    if (e.code === "Space") {
      e.preventDefault();
      playBtn.click();
    } else if (e.code === "KeyT") {
      tapBtn.click();
    }
  });

  // ── Beat callback → flash dots ────────────────────────────────
  metronome.onBeat = (beatIndex) => {
    const dots = beatIndicator.querySelectorAll(".beat-dot");
    dots.forEach((d) => d.classList.remove("active"));
    if (dots[beatIndex]) {
      dots[beatIndex].classList.add("active");
      if (activeSticking.length > 0) {
        dots[beatIndex].textContent =
          activeSticking[stickingBeatCount % activeSticking.length];
        stickingBeatCount++;
      }
    }

    // Remove active after short flash
    setTimeout(() => {
      if (dots[beatIndex]) dots[beatIndex].classList.remove("active");
    }, 120);
  };

  // ── Countdown Timer ──────────────────────────────────────────
  (function initTimer() {
    const display   = document.getElementById("timerDisplay");
    const minsInput = document.getElementById("timerMinutes");
    const secsInput = document.getElementById("timerSeconds");
    if (!display || !minsInput || !secsInput) return;

    let remaining = 0;
    let interval  = null;

    function getDuration() {
      const m = Math.max(0, parseInt(minsInput.value, 10) || 0);
      const s = Math.max(0, Math.min(59, parseInt(secsInput.value, 10) || 0));
      return m * 60 + s;
    }

    function formatTime(secs) {
      const m = Math.floor(secs / 60).toString().padStart(2, "0");
      const s = (secs % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }

    function setInputsDisabled(disabled) {
      minsInput.disabled = disabled;
      secsInput.disabled = disabled;
    }

    function updateDisplay() {
      display.textContent = formatTime(remaining);
      display.classList.toggle("timer-done", remaining === 0);
    }

    function startTimer() {
      const duration = getDuration();
      if (duration === 0) return;
      remaining = duration;
      updateDisplay();
      setInputsDisabled(true);
      interval = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        updateDisplay();
        if (remaining <= 0) {
          clearInterval(interval);
          interval = null;
          setInputsDisabled(false);
          // Stop metronome when countdown finishes
          if (metronome.isPlaying) {
            metronome.stop();
            playBtn.textContent = t("metronome.start");
            playBtn.classList.remove("playing");
          }
        }
      }, 1000);
    }

    function stopTimer() {
      clearInterval(interval);
      interval = null;
      setInputsDisabled(false);
      remaining = getDuration();
      updateDisplay();
    }

    // Initialise display
    remaining = getDuration();
    updateDisplay();

    // Keep display in sync when user edits duration while idle
    [minsInput, secsInput].forEach((input) => {
      input.addEventListener("input", () => {
        if (!interval) {
          remaining = getDuration();
          updateDisplay();
        }
      });
    });

    // Hook into metronome lifecycle
    metronome.onStart = startTimer;
    metronome.onStop  = () => { stopTimer(); clearSticking(); };
  })();
}

// ─── SPA Navigation ──────────────────────────────────────────────────

const SECTIONS = {
  Metronome: "metronome-section",
  Rudiments: "rudiments-section",
  Drills:    "drills-section",
};

// Track which sections have been initialised (lazy-load)
const _initialised = new Set();

function showSection(name) {
  // Hide all sections
  Object.values(SECTIONS).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  // Timer section is shown only alongside Metronome
  const timerSection = document.getElementById("timer-section");
  if (timerSection) timerSection.hidden = (name !== "Metronome");

  // Show target
  const target = document.getElementById(SECTIONS[name]);
  if (target) target.hidden = false;

  // Update nav links — compare using data-section (language-independent)
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.section === name);
  });

  // Lazy-init sections
  if (!_initialised.has(name)) {
    _initialised.add(name);
    if (name === "Rudiments") initRudiments();
    if (name === "Drills") initDrills();
  }
}

function initNav() {
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(a.dataset.section);
    });
  });
}

// ─── i18n ─────────────────────────────────────────────────────────

/**
 * Update all static elements tagged with data-i18n / data-i18n-placeholder
 * / data-i18n-aria, and sync any dynamic UI that references translated text.
 */
function applyTranslations() {
  // textContent
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  // placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // aria-label
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  // Play button text depends on metronome state
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.textContent = metronome.isPlaying ? t("metronome.stop") : t("metronome.start");
  }
}

function initLangSwitcher() {
  const select = document.getElementById("langSelect");
  if (!select) return;
  select.value = getCurrentLang();
  select.addEventListener("change", () => setLanguage(select.value));
}

// Re-apply translations and re-render all initialised sections on lang change
document.addEventListener("languagechange", () => {
  applyTranslations();
  if (_initialised.has("Rudiments")) {
    rebuildRudimentFilters();
    renderRudiments();
  }
  if (_initialised.has("Drills")) {
    rebuildDrillFilters();
    renderDrills();
  }
});

// ─── Init ─────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Apply saved / preferred theme on load
  applyTheme(getPreferredTheme());

  // Theme toggle button
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // Navigation
  initNav();

  // Language switcher
  initLangSwitcher();

  // Apply initial translations (English defaults already in HTML, but this
  // ensures the applyTranslations path is wired for future language changes)
  applyTranslations();

  // Show default section & init metronome
  showSection("Metronome");
  initMetronomeUI();
  _initialised.add("Metronome");
});
