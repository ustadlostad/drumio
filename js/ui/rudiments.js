/**
 * rudiments.js — rudiment library page.
 */

import { loadRudiments } from "../core/data.js";
import { parseSticking } from "../core/sticking.js";
import { t, localized } from "../core/i18n.js";
import { escapeHTML } from "../core/dom.js";
import { createCatalog, categoryLabel } from "./catalog.js";
import { stickingHTML } from "./sticking-view.js";
import { startExercise } from "./exercise.js";
import { videoButtonHTML, openVideo } from "./modal.js";

function cardHTML(r) {
  let sticking;
  try {
    sticking = stickingHTML(parseSticking(r.sticking), r.subdivision);
  } catch {
    sticking = escapeHTML(r.sticking);
  }

  return `
    <article class="card rudiment-card" data-id="${escapeHTML(r.id)}">
      <div class="rudiment-card-header">
        <div>
          <h3 class="rudiment-name">${escapeHTML(r.name)}</h3>
          <div class="rudiment-category">${escapeHTML(categoryLabel(r.category))}</div>
        </div>
        <span class="diff-pill ${r.difficulty}">${escapeHTML(t("filter." + r.difficulty))}</span>
      </div>
      <div class="rudiment-sticking">${sticking}</div>
      <p class="rudiment-description">${escapeHTML(localized(r, "description"))}</p>
      <div class="card-actions">
        <button type="button" class="practise-btn" data-action="practise"
          aria-label="${escapeHTML(t("rudiments.practiseAria", r.name))}"
        >▶ ${escapeHTML(t("rudiments.practise"))}</button>
        ${videoButtonHTML(r)}
      </div>
    </article>
  `;
}

export const rudimentCatalog = createCatalog({
  ids: { toolbar: "rudimentsToolbar", search: "rudimentSearch", grid: "rudimentsGrid", count: "rudimentsCount" },
  load: loadRudiments,
  searchText: (r) => [r.name, r.category, categoryLabel(r.category), r.sticking, localized(r, "description")].join(" "),
  cardHTML,
  actions: {
    practise: (r) => startExercise(r),
    video: (r) => openVideo(r),
  },
  keys: { count: "rudiments.count", empty: "rudiments.empty", error: "rudiments.error" },
});
