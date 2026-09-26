/**
 * exercise.js — rudiment exercise mode.
 *
 * Sets the metronome to the rudiment's subdivision, then highlights the
 * current stroke in the sticking lane and shows the hand on the beat dots,
 * driven by the metronome "step" events (locked to the audio clock).
 */

import { metronome } from "../audio/metronome.js";
import { parseSticking, mirrorSticking } from "../core/sticking.js";
import { t } from "../core/i18n.js";
import { stickingHTML } from "./sticking-view.js";
import { showSection } from "./nav.js";

const RECOMMENDED_BPM = { beginner: 80, intermediate: 70, advanced: 60 };
export const COUNT_IN_BEATS = 4;

const $ = (id) => document.getElementById(id);

let exercise = null;   // { rudiment, steps, leftLead }
let prevState = null;  // { bpm, subdivision } to restore once the exercise ends
let countInTimer = null;

export function recommendedBpm(rudiment) {
  return RECOMMENDED_BPM[rudiment.difficulty] || 70;
}

function cancelCountIn() {
  clearTimeout(countInTimer);
  countInTimer = null;
  $("countIn").hidden = true;
}

/**
 * Visual count-in so the player has time to get in position before the
 * exercise starts, instead of the metronome firing the instant they tap
 * Practise. Cancel with cancelCountIn() (e.g. the user ends the exercise
 * before it finishes counting).
 */
export function runCountIn(bpm, beats, onDone) {
  const el = $("countIn");
  const interval = 60000 / bpm;
  let n = beats;

  function step() {
    if (n <= 0) {
      cancelCountIn();
      onDone();
      return;
    }
    el.hidden = false;
    el.textContent = n;
    n--;
    countInTimer = setTimeout(step, interval);
  }
  step();
}

/**
 * Start practising a rudiment.
 * options.bpm overrides the recommended tempo (e.g. from a drill).
 */
export function startExercise(rudiment, options = {}) {
  // Stop first: stopping restores a running tempo trainer's start BPM.
  metronome.stop();
  cancelCountIn();
  prevState = { bpm: metronome.bpm, subdivision: metronome.subdivision };
  exercise = { rudiment, steps: parseSticking(rudiment.sticking), leftLead: false };
  metronome.setSubdivision(rudiment.subdivision);
  const bpm = options.bpm ?? recommendedBpm(rudiment);
  metronome.setBpm(bpm);
  render();
  showSection("metronome");
  runCountIn(bpm, COUNT_IN_BEATS, () => metronome.start());   // step index 0 = first stroke on beat one
}

export function endExercise() {
  cancelCountIn();
  metronome.stop();
  exercise = null;
  if (prevState) {
    metronome.setSubdivision(prevState.subdivision);
    metronome.setBpm(prevState.bpm);
    prevState = null;
  }
  render();
}

function currentSteps() {
  return exercise.leftLead ? mirrorSticking(exercise.steps) : exercise.steps;
}

function render() {
  const bar = $("exerciseBar");
  const lane = $("stickingLane");
  const dots = $("beatIndicator");
  const active = Boolean(exercise);

  bar.hidden = !active;
  lane.hidden = !active;
  dots.classList.toggle("has-sticking", active);
  for (const dot of dots.children) dot.textContent = "";
  if (!active) {
    lane.innerHTML = "";
    return;
  }

  $("exerciseName").textContent = exercise.rudiment.name;
  $("exerciseName").setAttribute("aria-label", t("exercise.openRudimentAria", exercise.rudiment.name));
  $("leadRightBtn").classList.toggle("active", !exercise.leftLead);
  $("leadRightBtn").setAttribute("aria-pressed", !exercise.leftLead);
  $("leadLeftBtn").classList.toggle("active", exercise.leftLead);
  $("leadLeftBtn").setAttribute("aria-pressed", exercise.leftLead);
  lane.innerHTML = stickingHTML(currentSteps(), exercise.rudiment.subdivision);
}

function onStep(step) {
  if (!exercise) return;
  const steps = currentSteps();
  const i = step.index % steps.length;
  const lane = $("stickingLane");

  lane.querySelector(".stk.current")?.classList.remove("current");
  lane.querySelector(`[data-step="${i}"]`)?.classList.add("current");

  if (step.sub === 0) {
    const dot = $("beatIndicator").children[step.pulse];
    if (dot) dot.textContent = steps[i].rest ? "" : steps[i].hand;
  }
}

export function initExercise() {
  metronome.on("step", onStep);
  metronome.on("config", () => {
    // Beat dots are rebuilt on config changes; restore the sticking styling.
    if (exercise) $("beatIndicator").classList.add("has-sticking");
  });
  metronome.on("stop", () => {
    $("stickingLane").querySelector(".stk.current")?.classList.remove("current");
    for (const dot of $("beatIndicator").children) dot.textContent = "";
  });

  $("exerciseClose").addEventListener("click", endExercise);
  $("exerciseLeadToggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".lead-btn");
    if (!btn || !exercise) return;
    exercise.leftLead = btn.dataset.lead === "left";
    render();
  });
  $("exerciseName").addEventListener("click", async () => {
    if (!exercise) return;
    const id = exercise.rudiment.id;
    showSection("rudiments");
    const { rudimentCatalog } = await import("./rudiments.js");
    rudimentCatalog.focus(id);
  });

  document.addEventListener("languagechange", render);
}
