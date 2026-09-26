/**
 * timer.js — practice countdown that starts and stops with the metronome.
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

export function initTimer() {
  const display = document.getElementById("timerDisplay");
  const presets = document.getElementById("timerPresets");
  const inputsWrap = document.getElementById("timerInputs");
  const minsInput = document.getElementById("timerMinutes");
  const secsInput = document.getElementById("timerSeconds");

  let endAt = 0;
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

  function render(remaining) {
    display.textContent = formatTime(remaining);
    display.classList.toggle("timer-done", remaining === 0);
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
    if (remaining === 0) {
      metronome.stop();
      showToast(t("timer.done"));
    }
  }

  function start() {
    const secs = duration();
    if (secs === 0) return;
    endAt = Date.now() + secs * 1000;
    setControlsDisabled(true);
    render(secs);
    interval = setInterval(tick, 250);
  }

  function stop() {
    clearInterval(interval);
    interval = null;
    setControlsDisabled(false);
    render(duration());
  }

  activePreset = matchingPreset();
  showCustomInputs(activePreset === "custom");
  renderPresets();
  render(duration());

  presets.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || interval) return;
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
      if (interval) return;
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

  document.addEventListener("languagechange", renderPresets);

  metronome.on("start", start);
  metronome.on("stop", stop);
}
