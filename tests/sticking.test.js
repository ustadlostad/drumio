import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseSticking, mirrorSticking, countStrokes } from "../js/core/sticking.js";

const rudiments = JSON.parse(readFileSync(new URL("../data/rudiments.json", import.meta.url)));

test("parses plain strokes", () => {
  assert.deepEqual(
    parseSticking("R L").map((s) => s.hand),
    ["R", "L"]
  );
});

test("flam: grace note belongs to the main stroke", () => {
  const [step] = parseSticking("lR");
  assert.equal(step.hand, "R");
  assert.equal(step.grace, "l");
});

test("drag: standalone grace notes attach to the next stroke", () => {
  const steps = parseSticking("ll R L");
  assert.equal(steps.length, 2);
  assert.equal(steps[0].hand, "R");
  assert.equal(steps[0].grace, "ll");
});

test("accent, buzz and rest", () => {
  const [a, b, c] = parseSticking(">R L~ -");
  assert.equal(a.accent, true);
  assert.equal(b.buzz, true);
  assert.equal(c.rest, true);
});

test("rejects unknown tokens", () => {
  assert.throws(() => parseSticking("R X"));
  assert.throws(() => parseSticking("R ll"));
});

test("mirror swaps hands and grace notes", () => {
  const [step] = mirrorSticking(parseSticking(">lR"));
  assert.equal(step.hand, "L");
  assert.equal(step.grace, "r");
  assert.equal(step.accent, true);
});

test("counts strokes without rests", () => {
  assert.equal(countStrokes(parseSticking("R R L L >R - - -")), 5);
});

test("every rudiment has a valid sticking and subdivision", () => {
  assert.equal(rudiments.length, 40);
  for (const r of rudiments) {
    const steps = parseSticking(r.sticking);
    assert.ok(steps.length > 0, r.id);
    assert.ok([1, 2, 3, 4].includes(r.subdivision), `${r.id} subdivision`);
  }
});

test("roll rudiments have the stroke count in their name", () => {
  const counts = { five: 5, six: 6, seven: 7, nine: 9, ten: 10, eleven: 11, thirteen: 13, fifteen: 15, seventeen: 17 };
  for (const [word, n] of Object.entries(counts)) {
    const r = rudiments.find((x) => x.id === `${word}-stroke-roll`);
    const steps = parseSticking(r.sticking);
    const cycles = countStrokes(steps) / n;
    assert.ok(Number.isInteger(cycles), `${r.id}: ${countStrokes(steps)} strokes`);
  }
});
