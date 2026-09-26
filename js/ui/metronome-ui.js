/**
 * metronome-ui.js — controls of the metronome card.
 *
 * The engine is the single source of truth: controls call metronome setters
 * and re-render from engine events, so every entry point (slider, nudge,
 * typed BPM, tap, drills, trainer) stays in sync.
 */

import { metronome, TIME_SIGNATURES, SUBDIVISIONS, BPM_MIN, BPM_MAX } from "../audio/metronome.js";
import { SOUND_IDS } from "../audio/sounds.js";
import { settings, updateSettings } from "../core/store.js";
import { t } from "../core/i18n.js";
import { isEditableTarget } from "../core/dom.js";

const $ = (id) => document.getElementById(id);

export function initMetronomeUI() {
  const playBtn = $("playBtn");
  const tapBtn = $("tapBtn");
  const bpmSlider = $("bpmSlider");
  const bpmNumber = $("bpmNumber");
  const beatIndicator = $("beatIndicator");
  const soundSelector = $("soundSelector");
  const timeSigSelect = $("timeSigSelect");
  const subdivisionSelect = $("subdivisionSelect");

  // ── Restore saved settings ──────────────────────────────────
  metronome.setBpm(settings.bpm);
  metronome.setSound(settings.sound);
  metronome.setTimeSignature(settings.timeSig);
  metronome.setSubdivision(settings.subdivision);

  // ── BPM ─────────────────────────────────────────────────────
  bpmSlider.min = bpmNumber.min = BPM_MIN;
  bpmSlider.max = bpmNumber.max = BPM_MAX;

  function renderBpm(bpm) {
    bpmSlider.value = bpm;
    bpmSlider.style.setProperty("--pct", ((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 100 + "%");
    if (document.activeElement !== bpmNumber) bpmNumber.value = bpm;
  }
  renderBpm(metronome.bpm);

  metronome.on("bpmchange", ({ bpm, source }) => {
    renderBpm(bpm);
    if (source === "user") updateSettings({ bpm });
  });

  bpmSlider.addEventListener("input", () => metronome.setBpm(bpmSlider.value));

  document.querySelectorAll(".nudge-btn").forEach((btn) => {
    btn.addEventListener("click", () => metronome.setBpm(metronome.bpm + Number(btn.dataset.delta)));
  });

  function commitTypedBpm() {
    if (bpmNumber.value !== "") metronome.setBpm(bpmNumber.value);
    bpmNumber.value = metronome.bpm;
  }
  bpmNumber.addEventListener("change", commitTypedBpm);
  bpmNumber.addEventListener("blur", commitTypedBpm);
  bpmNumber.addEventListener("focus", () => bpmNumber.select());
  bpmNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") bpmNumber.blur();
    if (e.key === "Escape") {
      bpmNumber.value = metronome.bpm;
      bpmNumber.blur();
    }
  });

  // ── Time signature & subdivision ────────────────────────────
  timeSigSelect.innerHTML = TIME_SIGNATURES.map(
    (sig) => `<option value="${sig.id}">${sig.id}</option>`
  ).join("");

  function renderSubdivisionOptions() {
    subdivisionSelect.innerHTML = SUBDIVISIONS.map(
      (n) => `<option value="${n}">${t(`subdivision.${n}`)}</option>`
    ).join("");
    subdivisionSelect.value = metronome.subdivision;
  }
  renderSubdivisionOptions();

  timeSigSelect.addEventListener("change", () => {
    metronome.setTimeSignature(timeSigSelect.value);
    updateSettings({ timeSig: timeSigSelect.value });
  });
  subdivisionSelect.addEventListener("change", () => {
    const n = Number(subdivisionSelect.value);
    metronome.setSubdivision(n);
    updateSettings({ subdivision: n });
  });

  // ── Beat dots ───────────────────────────────────────────────
  function buildBeatDots() {
    const sig = metronome.timeSignature;
    beatIndicator.innerHTML = "";
    for (let i = 0; i < sig.beats; i++) {
      const dot = document.createElement("div");
      dot.className = "beat-dot" + (sig.accentBeats.includes(i) ? " accent" : "");
      beatIndicator.appendChild(dot);
    }
    beatIndicator.classList.toggle("many", sig.beats > 7);
  }

  function renderConfig() {
    timeSigSelect.value = metronome.timeSignature.id;
    subdivisionSelect.value = metronome.subdivision;
    buildBeatDots();
  }
  renderConfig();
  metronome.on("config", renderConfig);

  metronome.on("step", (step) => {
    if (step.sub !== 0) return;
    const dots = beatIndicator.children;
    for (const dot of dots) dot.classList.remove("current");
    const dot = dots[step.pulse];
    if (!dot) return;
    dot.classList.add("current");
    // Restart the flash animation.
    dot.classList.remove("hit");
    void dot.offsetWidth;
    dot.classList.add("hit");
  });

  // ── Sounds ──────────────────────────────────────────────────
  function renderSounds() {
    soundSelector.innerHTML = SOUND_IDS.map(
      (id) =>
        `<button type="button" class="sound-btn${id === metronome.sound ? " active" : ""}"
          data-sound="${id}" aria-pressed="${id === metronome.sound}">${t(`sound.${id}`)}</button>`
    ).join("");
  }
  renderSounds();

  soundSelector.addEventListener("click", (e) => {
    const btn = e.target.closest(".sound-btn");
    if (!btn) return;
    metronome.setSound(btn.dataset.sound);
    updateSettings({ sound: btn.dataset.sound });
    renderSounds();
  });

  // ── Transport ───────────────────────────────────────────────
  function renderPlayState() {
    playBtn.textContent = t(metronome.isPlaying ? "metronome.stop" : "metronome.start");
    playBtn.classList.toggle("playing", metronome.isPlaying);
    playBtn.setAttribute("aria-pressed", metronome.isPlaying);
  }
  renderPlayState();

  metronome.on("start", renderPlayState);
  metronome.on("stop", () => {
    renderPlayState();
    for (const dot of beatIndicator.children) dot.classList.remove("current", "hit");
  });

  playBtn.addEventListener("click", () => metronome.toggle());
  tapBtn.addEventListener("click", () => metronome.tap());

  // Space = start / stop, T = tap tempo.
  document.addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (isEditableTarget(e.target) || document.querySelector(".modal-overlay.open")) return;
    if (e.code === "Space") {
      e.preventDefault();
      metronome.toggle();
    } else if (e.code === "KeyT") {
      metronome.tap();
    }
  });

  document.addEventListener("languagechange", () => {
    renderPlayState();
    renderSounds();
    renderSubdivisionOptions();
    renderFocusToggle();
  });

  // ── Focus mode ──────────────────────────────────────────────
  const focusToggle = $("focusToggle");
  function renderFocusToggle() {
    const on = document.body.classList.contains("focus-mode");
    focusToggle.textContent = on ? "✕" : "⤢";
    focusToggle.setAttribute("aria-label", t(on ? "metronome.focusExitAria" : "metronome.focusAria"));
  }
  renderFocusToggle();
  focusToggle.addEventListener("click", () => {
    document.body.classList.toggle("focus-mode");
    renderFocusToggle();
  });
}
