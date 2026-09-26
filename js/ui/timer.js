/**
 * timer.js — practice countdown.
 *
 * Linked mode (default): starts and pauses with the metronome, and resumes
 * from where it left off rather than resetting, so a short stop to fix a
 * grip doesn't wipe out the practice session's progress.
 * Manual mode: runs on its own Start/Pause/Reset controls, independent of
 * the metronome, for practising without a click.
 */

import { metronome } from "../audio/metronome.js";
import { settings, updateSettings } from "../core/store.js";
import { t } from "../core/i18n.js";
import { showToast } from "./toast.js";

const PRESET_MINUTES = [1, 5, 10, 15, 20, 30];

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** Two short beeps plus a haptic buzz so the end of a session is noticed. */
function playDoneSignal() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain).connect(ctx.destination);
      const at = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.35, at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      osc.start(at);
      osc.stop(at + 0.2);
    });
  } catch {
    // Web Audio unavailable — the toast still shows.
  }
  navigator.vibrate?.([120, 60, 120]);
}

export function initTimer() {
  const display = document.getElementById("timerDisplay");
  const mini = document.getElementById("timerMini");
  const presets = document.getElementById("timerPresets");
  const inputsWrap = document.getElementById("timerInputs");
  const minsInput = document.getElementById("timerMinutes");
  const secsInput = document.getElementById("timerSeconds");
  const linkedToggle = document.getElementById("timerLinked");
  const manualControls = document.getElementById("timerManualControls");
  const startBtn = document.getElementById("timerStartBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const hint = document.getElementById("timerHint");

  let linked = settings.timerLinked !== false;
  let endAt = 0;
  let remainingOnPause = null;   // seconds left, set while paused
  let interval = null;
  let activePreset = "custom";

  minsInput.value = Math.floor(settings.timerSeconds / 60);
  secsInput.value = settings.timerSeconds % 60;

  function duration() {
    const m = Math.min(99, Math.max(0, parseInt(minsInput.value, 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(secsInput.value, 10) || 0));
    return m * 60 + s;
  }

  // A preset is "active" only when the current duration is a whole number
  // of preset minutes with zero leftover seconds.
  function matchingPreset() {
    const secs = duration();
    if (secs % 60 !== 0) return "custom";
    const mins = secs / 60;
    return PRESET_MINUTES.includes(mins) ? mins : "custom";
  }

  function renderPresets() {
    const presetButtons = PRESET_MINUTES.map(
      (m) =>
        `<button type="button" class="pill${m === activePreset ? " active" : ""}" data-mins="${m}" aria-pressed="${m === activePreset}">${t("timer.presetLabel", m)}</button>`
    ).join("");
    const customButton = `<button type="button" class="pill${activePreset === "custom" ? " active" : ""}" data-custom="1" aria-pressed="${activePreset === "custom"}">${t("timer.custom")}</button>`;
    presets.innerHTML = presetButtons + customButton;
  }

  function showCustomInputs(show) {
    inputsWrap.hidden = !show;
  }

  function isRunning() {
    return interval !== null;
  }

  function currentRemaining() {
    if (isRunning()) return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (remainingOnPause !== null) return remainingOnPause;
    return duration();
  }

  function render(remaining) {
    display.textContent = formatTime(remaining);
    display.classList.toggle("timer-done", remaining === 0);
    mini.hidden = !isRunning();
    mini.textContent = "⏱ " + formatTime(remaining);
    startBtn.textContent = t(isRunning() ? "timer.pauseBtn" : "timer.startBtn");
  }

  function renderHint() {
    hint.textContent = t(linked ? "timer.hint" : "timer.hintManual");
  }

  function setControlsDisabled(disabled) {
    minsInput.disabled = disabled;
    secsInput.disabled = disabled;
    presets.querySelectorAll("button").forEach((btn) => (btn.disabled = disabled));
  }

  function tick() {
    // Wall-clock based so a throttled interval never drifts.
    const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    render(remaining);
    if (remaining === 0) complete();
  }

  function beginCountdown(secs) {
    endAt = Date.now() + secs * 1000;
    remainingOnPause = null;
    setControlsDisabled(true);
    clearInterval(interval);
    interval = setInterval(tick, 250);
    render(secs);
  }

  /** Fresh start from the configured duration. */
  function start() {
    const secs = duration();
    if (secs === 0) return;
    beginCountdown(secs);
  }

  /** Continue from where a pause left off. */
  function resume() {
    if (remainingOnPause === null || remainingOnPause === 0) return;
    beginCountdown(remainingOnPause);
  }

  /** Stop ticking but keep the remaining time so it can resume later. */
  function pause() {
    if (!isRunning()) return;
    const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    clearInterval(interval);
    interval = null;
    remainingOnPause = remaining;
    render(remaining);
  }

  /** Clear the countdown entirely and restore the configured duration. */
  function reset() {
    clearInterval(interval);
    interval = null;
    remainingOnPause = null;
    setControlsDisabled(false);
    render(duration());
  }

  function complete() {
    clearInterval(interval);
    interval = null;
    remainingOnPause = null;
    setControlsDisabled(false);
    render(0);
    playDoneSignal();
    showToast(t("timer.done"));
    if (linked) metronome.stop();
  }

  function toggleManualStart() {
    if (isRunning()) pause();
    else if (remainingOnPause !== null) resume();
    else start();
  }

  activePreset = matchingPreset();
  showCustomInputs(activePreset === "custom");
  renderPresets();
  renderHint();
  manualControls.hidden = linked;
  render(duration());

  linkedToggle.checked = linked;
  linkedToggle.addEventListener("change", () => {
    linked = linkedToggle.checked;
    updateSettings({ timerLinked: linked });
    manualControls.hidden = linked;
    renderHint();
    reset();
    if (linked && metronome.isPlaying) start();
  });

  startBtn.addEventListener("click", toggleManualStart);
  resetBtn.addEventListener("click", reset);

  presets.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || isRunning()) return;
    if (btn.dataset.custom) {
      activePreset = "custom";
      showCustomInputs(true);
      renderPresets();
      minsInput.focus();
      return;
    }
    const mins = parseInt(btn.dataset.mins, 10);
    minsInput.value = mins;
    secsInput.value = 0;
    activePreset = mins;
    showCustomInputs(false);
    renderPresets();
    render(duration());
    updateSettings({ timerSeconds: duration() });
  });

  [minsInput, secsInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (isRunning()) return;
      render(duration());
    });
    input.addEventListener("change", () => {
      minsInput.value = Math.floor(duration() / 60);
      secsInput.value = duration() % 60;
      activePreset = matchingPreset();
      showCustomInputs(activePreset === "custom");
      renderPresets();
      updateSettings({ timerSeconds: duration() });
    });
  });

  document.addEventListener("languagechange", () => {
    renderPresets();
    renderHint();
    render(currentRemaining());
  });

  metronome.on("start", () => {
    if (!linked) return;
    if (remainingOnPause !== null) resume();
    else start();
  });
  metronome.on("stop", () => {
    if (linked) pause();
  });
}
