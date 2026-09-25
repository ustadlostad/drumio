/**
 * sticking.js — parser for Drumio sticking notation.
 *
 * One token per step on the subdivision grid, separated by spaces:
 *   R  L     right / left hand stroke
 *   >R       accented stroke
 *   lR       flam (one grace note before the main stroke)
 *   llR      drag (two grace notes before the main stroke)
 *   R~       buzz (multiple bounce) stroke
 *   -        rest
 * Grace notes may also stand alone before the stroke they belong to ("ll R").
 * The pattern loops: it is written as one full cycle of the rudiment.
 */

const STROKE_RE = /^(>)?([lr]*)([RL])(~)?$/;
const GRACE_RE = /^[lr]+$/;

/**
 * @param {string} notation
 * @returns {Array<{rest: true} | {rest: false, hand: "R"|"L", grace: string, accent: boolean, buzz: boolean}>}
 * @throws {Error} on an unknown token
 */
export function parseSticking(notation) {
  const steps = [];
  let pendingGrace = "";

  for (const token of notation.trim().split(/\s+/)) {
    if (token === "") continue;
    if (token === "-") {
      if (pendingGrace) throw new Error(`Grace notes before a rest in "${notation}"`);
      steps.push({ rest: true });
      continue;
    }
    if (GRACE_RE.test(token)) {
      pendingGrace += token;
      continue;
    }
    const match = STROKE_RE.exec(token);
    if (!match) throw new Error(`Unknown sticking token "${token}" in "${notation}"`);
    const [, accent, grace, hand, buzz] = match;
    steps.push({
      rest: false,
      hand,
      grace: pendingGrace + grace,
      accent: Boolean(accent),
      buzz: Boolean(buzz),
    });
    pendingGrace = "";
  }

  if (pendingGrace) throw new Error(`Grace notes without a stroke in "${notation}"`);
  return steps;
}

const SWAP = { R: "L", L: "R", r: "l", l: "r" };

/** Same pattern led by the other hand. */
export function mirrorSticking(steps) {
  return steps.map((step) =>
    step.rest
      ? step
      : { ...step, hand: SWAP[step.hand], grace: step.grace.replace(/[lr]/g, (c) => SWAP[c]) }
  );
}

/** Number of played strokes (grace notes not counted). */
export function countStrokes(steps) {
  return steps.filter((step) => !step.rest).length;
}
