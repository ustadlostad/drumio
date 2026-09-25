/**
 * sticking-view.js — renders parsed sticking as HTML.
 * Steps are grouped per beat (subdivision steps per group).
 */

import { escapeHTML } from "../core/dom.js";

function stepHTML(step, i) {
  if (step.rest) return `<span class="stk rest" data-step="${i}">·</span>`;
  const classes = ["stk", step.hand === "R" ? "right" : "left"];
  if (step.accent) classes.push("accent");
  if (step.buzz) classes.push("buzz");
  const grace = step.grace ? `<small class="grace">${escapeHTML(step.grace)}</small>` : "";
  return `<span class="${classes.join(" ")}" data-step="${i}">${grace}${step.hand}${step.buzz ? "~" : ""}</span>`;
}

export function stickingHTML(steps, subdivision) {
  const groups = [];
  for (let i = 0; i < steps.length; i += subdivision) {
    const group = steps.slice(i, i + subdivision).map((s, j) => stepHTML(s, i + j));
    groups.push(`<span class="stk-group">${group.join("")}</span>`);
  }
  return groups.join("");
}
