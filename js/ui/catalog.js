/**
 * catalog.js — reusable searchable, filterable card list.
 * Used by the rudiment library and the drills page.
 */

import { t } from "../core/i18n.js";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const ALL = "all";

/** Translated category name; falls back to the English name from the data. */
export function categoryLabel(name) {
  const key = "category." + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const label = t(key);
  return label === key ? name : label;
}

/**
 * options:
 *   ids          { toolbar, search, grid, count }  element ids
 *   load         () => Promise<items[]>
 *   searchText   (item) => string   text matched by the search box
 *   cardHTML     (item) => string   card markup; the root needs data-id
 *   actions      { name: (item, button) => void }  for buttons with data-action
 *   keys         { count, empty, error }  i18n keys
 */
export function createCatalog(options) {
  const $ = (id) => document.getElementById(options.ids[id]);
  const state = { items: [], category: ALL, difficulty: ALL, query: "" };
  let ready = null;
  let wired = false;

  function pillsHTML(values, active, label) {
    return values
      .map(
        (v) => `<button type="button" class="pill${v === active ? " active" : ""}"
          data-value="${v}" aria-pressed="${v === active}">${label(v)}</button>`
      )
      .join("");
  }

  function renderFilters() {
    const toolbar = $("toolbar");
    const categories = [ALL, ...new Set(state.items.map((i) => i.category))];
    toolbar.querySelector("[data-filter='category']").innerHTML = pillsHTML(
      categories, state.category, (v) => (v === ALL ? t("filter.all") : categoryLabel(v))
    );
    toolbar.querySelector("[data-filter='difficulty']").innerHTML = pillsHTML(
      [ALL, ...DIFFICULTIES], state.difficulty, (v) => t(v === ALL ? "filter.allLevels" : `filter.${v}`)
    );
  }

  function matches(item) {
    return (
      (state.category === ALL || item.category === state.category) &&
      (state.difficulty === ALL || item.difficulty === state.difficulty) &&
      (!state.query || options.searchText(item).toLowerCase().includes(state.query))
    );
  }

  function isFiltered() {
    return state.category !== ALL || state.difficulty !== ALL || Boolean(state.query);
  }

  function render() {
    const grid = $("grid");
    const filtered = state.items.filter(matches);
    $("count").textContent = isFiltered() ? t(options.keys.count, filtered.length, state.items.length) : "";
    grid.innerHTML = filtered.length
      ? filtered.map(options.cardHTML).join("")
      : `<div class="catalog-empty">
          <p>${t(options.keys.empty)}</p>
          ${isFiltered() ? `<button type="button" class="pill clear-filters-btn">${t("filter.clear")}</button>` : ""}
        </div>`;
  }

  function clearFilters() {
    Object.assign(state, { category: ALL, difficulty: ALL, query: "" });
    $("search").value = "";
    renderFilters();
    render();
  }

  function wireEvents() {
    $("toolbar").addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      const filter = pill.parentElement.dataset.filter;
      state[filter] = pill.dataset.value;
      renderFilters();
      render();
    });

    $("search").addEventListener("input", (e) => {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });

    $("grid").addEventListener("click", (e) => {
      if (e.target.closest(".clear-filters-btn")) {
        clearFilters();
        return;
      }
      const btn = e.target.closest("[data-action]");
      const card = btn?.closest("[data-id]");
      if (!card) return;
      const item = state.items.find((i) => i.id === card.dataset.id);
      options.actions[btn.dataset.action]?.(item, btn);
    });

    document.addEventListener("languagechange", () => {
      if (!state.items.length) return;
      renderFilters();
      render();
    });
  }

  /** Load data and render. Safe to call more than once. */
  function init() {
    ready ||= (async () => {
      if (!wired) {
        wireEvents();
        wired = true;
      }
      try {
        state.items = await options.load();
      } catch (err) {
        console.error(err);
        $("grid").innerHTML = `<div class="catalog-empty">${t(options.keys.error)}</div>`;
        ready = null;
        return;
      }
      renderFilters();
      render();
    })();
    return ready;
  }

  /** Clear filters, then scroll to and highlight one card. */
  async function focus(id) {
    await init();
    clearFilters();
    const card = $("grid").querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("highlight");
    setTimeout(() => card.classList.remove("highlight"), 1600);
  }

  return { init, focus, items: () => state.items };
}
