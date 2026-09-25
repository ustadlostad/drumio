/**
 * timer.js — practice countdown that starts and stops with the metronome.
 */

import { metronome } from "../audio/metronome.js";
import { settings, updateSettings } from "../core/store.js";
import { t } from "../core/i18n.js";
import { showToast } from "./toast.js";

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function initTimer() {
  const display = document.getElementById("timerDisplay");
  const minsInput = document.getElementById("timerMinutes");
  const secsInput = document.getElementById("timerSeconds");

  let endAt = 0;
  let interval = null;

  minsInput.value = Math.floor(settings.timerSeconds / 60);
  secsInput.value = settings.timerSeconds % 60;

  function duration() {
    const m = Math.min(99, Math.max(0, parseInt(minsInput.value, 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(secsInput.value, 10) || 0));
    return m * 60 + s;
  }

  function render(remaining) {
    display.textContent = formatTime(remaining);
    display.classList.toggle("timer-done", remaining === 0);
  }

  function setInputsDisabled(disabled) {
    minsInput.disabled = disabled;
    secsInput.disabled = disabled;
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
    setInputsDisabled(true);
    render(secs);
    interval = setInterval(tick, 250);
  }

  function stop() {
    clearInterval(interval);
    interval = null;
    setInputsDisabled(false);
    render(duration());
  }

  render(duration());

  [minsInput, secsInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (interval) return;
      render(duration());
    });
    input.addEventListener("change", () => {
      minsInput.value = Math.floor(duration() / 60);
      secsInput.value = duration() % 60;
      updateSettings({ timerSeconds: duration() });
    });
  });

  metronome.on("start", start);
  metronome.on("stop", stop);
}
