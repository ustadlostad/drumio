/**
 * rudiments.js — Drumio Rudiment Library
 * Fetches rudiments.json, renders cards, handles search, category & difficulty filter.
 */

let allRudiments     = [];
let activeCategory   = "All";
let activeDifficulty = "All";
let searchQuery      = "";

// ─── Fetch & Init ─────────────────────────────────────────────────

async function initRudiments() {
  const grid    = document.getElementById("rudimentsGrid");
  const toolbar = document.getElementById("rudimentsToolbar");
  if (!grid) return;

  try {
    const res  = await fetch("data/rudiments.json");
    allRudiments = await res.json();
  } catch (e) {
    grid.innerHTML = `<p class="rudiments-empty">${t("rudiments.error")}</p>`;
    return;
  }

  buildCategoryPills(toolbar);
  buildDifficultyPills(toolbar);
  renderRudiments();
  hookSearch();
}

// ─── Category Pills ───────────────────────────────────────────────

function buildCategoryPills(toolbar) {
  const categories = ["All", ...new Set(allRudiments.map((r) => r.category))];
  const container  = toolbar.querySelector("[data-filter='category']");
  container.setAttribute("aria-label", t("rudiments.filterCategory"));
  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className   = "pill" + (cat === activeCategory ? " active" : "");
    btn.dataset.cat = cat;
    btn.textContent = cat === "All" ? t("filter.all") : cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderRudiments();
    });
    container.appendChild(btn);
  });
}
// ─── Difficulty Pills ─────────────────────────────────────────────

function buildDifficultyPills(toolbar) {
  const levels    = ["All", "beginner", "intermediate", "advanced"];
  const container = toolbar.querySelector("[data-filter='difficulty']");
  container.setAttribute("aria-label", t("rudiments.filterDifficulty"));
  container.innerHTML = "";

  levels.forEach((lvl) => {
    const btn = document.createElement("button");
    btn.className    = "pill" + (lvl === activeDifficulty ? " active" : "");
    btn.dataset.diff = lvl;
    btn.textContent  = lvl === "All" ? t("filter.allLevels") : t("filter." + lvl);
    btn.addEventListener("click", () => {
      activeDifficulty = lvl;
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderRudiments();
    });
    container.appendChild(btn);
  });
}

/**
 * Re-build both pill rows (called on language change to retranslate labels).
 * Preserves the current activeCategory / activeDifficulty selection.
 */
function rebuildRudimentFilters() {
  const toolbar = document.getElementById("rudimentsToolbar");
  if (!toolbar || allRudiments.length === 0) return;
  buildCategoryPills(toolbar);
  buildDifficultyPills(toolbar);
}
// ─── Search ───────────────────────────────────────────────────────

function hookSearch() {
  const input = document.getElementById("rudimentSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    searchQuery = input.value.trim().toLowerCase();
    renderRudiments();
  });
}

// ─── Render ───────────────────────────────────────────────────────

function renderRudiments() {
  const grid      = document.getElementById("rudimentsGrid");
  const countEl   = document.getElementById("rudimentsCount");
  if (!grid) return;

  const filtered = allRudiments.filter((r) => {
    const matchCat   = activeCategory === "All" || r.category === activeCategory;
    const matchDiff  = activeDifficulty === "All" || r.difficulty === activeDifficulty;
    const matchSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery) ||
      r.category.toLowerCase().includes(searchQuery) ||
      r.description.toLowerCase().includes(searchQuery) ||
      r.sticking.toLowerCase().includes(searchQuery);
    return matchCat && matchDiff && matchSearch;
  });

  if (countEl) {
    countEl.textContent = t("rudiments.count", filtered.length, allRudiments.length);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="rudiments-empty">${t("rudiments.empty")}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((r) => rudimentCardHTML(r)).join("");

  // Wire Watch buttons
  grid.querySelectorAll(".watch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openVideoModal({
        title:     btn.dataset.title,
        subtitle:  btn.dataset.subtitle,
        youtubeId: btn.dataset.youtubeId,
      });
    });
  });
}

// ─── Card Template ────────────────────────────────────────────────

function rudimentCardHTML(r) {
  const lang = getCurrentLang();
  const description = (lang === "en" || !r.description_tr) ? r.description : r.description_tr;

  const watchBtn = r.youtubeId
    ? `<button
        class="watch-btn"
        data-youtube-id="${escapeHTML(r.youtubeId)}"
        data-title="${escapeHTML(r.name)}"
        data-subtitle="${escapeHTML(r.category)}"
        aria-label="${escapeHTML(t("rudiments.watchAria", r.name))}"
      >&#9654; ${escapeHTML(t("rudiments.watch"))}</button>`
    : "";

  return `
    <article class="card rudiment-card">
      <div class="rudiment-card-header">
        <div>
          <div class="rudiment-name">${escapeHTML(r.name)}</div>
          <div class="rudiment-category">${escapeHTML(r.category)}</div>
        </div>
        <span class="diff-pill ${r.difficulty}">${escapeHTML(t("filter." + r.difficulty))}</span>
      </div>
      <div class="rudiment-sticking">${escapeHTML(r.sticking)}</div>
      <p class="rudiment-description">${escapeHTML(description)}</p>
      ${watchBtn ? `<div class="card-watch-row">${watchBtn}</div>` : ""}
    </article>
  `;
}

// ─── Util ─────────────────────────────────────────────────────────

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
