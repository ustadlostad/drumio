/**
 * trainer.js — tempo trainer controls (raise BPM by N every X seconds).
 */

import { metronome, clampBpm } from "../audio/metronome.js";
import { t } from "../core/i18n.js";

const $ = (id) => document.getElementById(id);

let fields = null;

function readConfig() {
  if (!fields.enabled.checked) return null;
  return {
    step: Math.max(1, parseInt(fields.step.value, 10) || 5),
    everySeconds: Math.max(5, parseInt(fields.every.value, 10) || 30),
    target: clampBpm(parseInt(fields.target.value, 10) || metronome.bpm),
    returnToStart: fields.returnToStart.checked,
  };
}

function apply() {
  fields.container.classList.toggle("disabled", !fields.enabled.checked);
  metronome.setTrainer(readConfig());
  renderStatus();
}

function renderStatus(text) {
  fields.status.textContent = text || t("trainer.hint");
}

/** Fill the trainer from a drill: { step, everySeconds, target, returnToStart }. */
export function configureTrainer(config) {
  fields.enabled.checked = Boolean(config);
  if (config) {
    fields.step.value = config.step;
    fields.every.value = config.everySeconds;
    fields.target.value = config.target;
    fields.returnToStart.checked = Boolean(config.returnToStart);
  }
  apply();
}

export function initTrainer() {
  fields = {
    enabled: $("trainerEnabled"),
    step: $("trainerStep"),
    every: $("trainerEvery"),
    target: $("trainerTarget"),
    returnToStart: $("trainerReturn"),
    container: $("trainerFields"),
    status: $("trainerStatus"),
  };

  Object.values(fields).forEach((el) => {
    if (el.tagName === "INPUT") el.addEventListener("change", apply);
  });

  metronome.on("bpmchange", ({ bpm, source }) => {
    if (source === "trainer" && metronome.isPlaying) renderStatus(t("trainer.now", bpm));
  });
  metronome.on("trainer", ({ done }) => {
    if (done) renderStatus(t("trainer.done"));
  });
  metronome.on("stop", () => renderStatus());
  document.addEventListener("languagechange", () => renderStatus());

  apply();
}
