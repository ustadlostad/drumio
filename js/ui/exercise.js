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

const $ = (id) => document.getElementById(id);

let exercise = null;   // { rudiment, steps, leftLead }

export function recommendedBpm(rudiment) {
  return RECOMMENDED_BPM[rudiment.difficulty] || 70;
}

/**
 * Start practising a rudiment.
 * options.bpm overrides the recommended tempo (e.g. from a drill).
 */
export function startExercise(rudiment, options = {}) {
  // Stop first: stopping restores a running tempo trainer's start BPM.
  metronome.stop();
  exercise = { rudiment, steps: parseSticking(rudiment.sticking), leftLead: false };
  metronome.setSubdivision(rudiment.subdivision);
  metronome.setBpm(options.bpm ?? recommendedBpm(rudiment));
  render();
  showSection("metronome");
  metronome.start();   // step index 0 = first stroke on beat one
}

export function endExercise() {
  metronome.stop();
  exercise = null;
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
  $("exerciseLead").textContent = t(exercise.leftLead ? "exercise.leadLeft" : "exercise.leadRight");
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
  $("exerciseLead").addEventListener("click", () => {
    exercise.leftLead = !exercise.leftLead;
    render();
  });

  document.addEventListener("languagechange", render);
}
