/**
 * drills.js — drills page. "Practise" sets up the metronome for the drill:
 * start BPM, optional tempo ramp, and exercise mode for single-rudiment drills.
 */

import { metronome } from "../audio/metronome.js";
import { loadDrills, loadRudiments } from "../core/data.js";
import { t, localized } from "../core/i18n.js";
import { escapeHTML } from "../core/dom.js";
import { createCatalog, categoryLabel } from "./catalog.js";
import { startExercise, endExercise } from "./exercise.js";
import { configureTrainer } from "./trainer.js";
import { showSection } from "./nav.js";
import { showToast } from "./toast.js";
import { rudimentCatalog } from "./rudiments.js";
import { videoButtonHTML, openVideo } from "./modal.js";

let rudimentsById = new Map();

function rudimentName(id) {
  return rudimentsById.get(id)?.name || id.replace(/-/g, " ");
}

function cardHTML(d) {
  const tags = d.rudiments
    .map(
      (id) => `<button type="button" class="rudiment-tag" data-action="rudiment" data-rudiment="${escapeHTML(id)}"
        >${escapeHTML(rudimentName(id))}</button>`
    )
    .join("");

  const ramp = d.ramp
    ? `<span class="drill-ramp">${escapeHTML(t("drills.ramp", d.ramp.step, d.ramp.everySeconds))}</span>`
    : "";

  return `
    <article class="card drill-card" data-id="${escapeHTML(d.id)}">
      <div class="drill-card-header">
        <div>
          <h3 class="drill-name">${escapeHTML(d.name)}</h3>
          <div class="drill-category">${escapeHTML(categoryLabel(d.category))}</div>
        </div>
        <span class="diff-pill ${d.difficulty}">${escapeHTML(t("filter." + d.difficulty))}</span>
      </div>

      <div class="drill-bpm-range">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
        </svg>
        ${d.bpmRange.min}–${d.bpmRange.max} BPM ${ramp}
      </div>

      ${tags ? `<div class="drill-rudiments">${tags}</div>` : ""}

      <p class="drill-description">${escapeHTML(localized(d, "description"))}</p>

      <div class="drill-card-footer">
        <span class="drill-start-at">${escapeHTML(t("drills.startAt", d.bpmRange.min))}</span>
        <div class="card-actions">
          ${videoButtonHTML(d)}
          <button type="button" class="practise-btn" data-action="practise"
            aria-label="${escapeHTML(t("drills.practiseAria", d.name, d.bpmRange.min))}"
          >▶ ${escapeHTML(t("drills.practise"))}</button>
        </div>
      </div>
    </article>
  `;
}

function practise(drill) {
  const bpm = drill.bpmRange.min;
  metronome.stop();
  configureTrainer(
    drill.ramp ? { ...drill.ramp, target: drill.bpmRange.max } : null
  );

  const rudiment = drill.rudiments.length === 1 ? rudimentsById.get(drill.rudiments[0]) : null;
  if (rudiment) {
    startExercise(rudiment, { bpm });
  } else {
    endExercise();
    metronome.setBpm(bpm);
    showSection("metronome");
    metronome.start();
  }
  showToast(t("drills.toast", bpm));
}

export const drillCatalog = createCatalog({
  ids: { toolbar: "drillsToolbar", search: "drillSearch", grid: "drillsGrid", count: "drillsCount" },
  load: async () => {
    const [drills, rudiments] = await Promise.all([loadDrills(), loadRudiments()]);
    rudimentsById = new Map(rudiments.map((r) => [r.id, r]));
    return drills;
  },
  searchText: (d) =>
    [d.name, d.category, categoryLabel(d.category), localized(d, "description"), ...d.rudiments.map(rudimentName)].join(" "),
  cardHTML,
  actions: {
    practise,
    video: (d) => openVideo(d),
    rudiment: (d, btn) => {
      showSection("rudiments");
      rudimentCatalog.focus(btn.dataset.rudiment);
    },
  },
  keys: { count: "drills.count", empty: "drills.empty", error: "drills.error" },
});
