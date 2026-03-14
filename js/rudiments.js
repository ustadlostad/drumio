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
    grid.innerHTML = `<p class="rudiments-empty">Could not load rudiments. Try refreshing.</p>`;
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
  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className  = "pill" + (cat === "All" ? " active" : "");
    btn.textContent = cat;
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
  container.innerHTML = "";

  levels.forEach((lvl) => {
    const btn = document.createElement("button");
    btn.className   = "pill" + (lvl === "All" ? " active" : "");
    btn.textContent = lvl === "All" ? "All Levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1);
    btn.addEventListener("click", () => {
      activeDifficulty = lvl;
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderRudiments();
    });
    container.appendChild(btn);
  });
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
    countEl.textContent = `${filtered.length} of ${allRudiments.length} rudiment${allRudiments.length !== 1 ? "s" : ""}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="rudiments-empty">No rudiments match your filters.</div>`;
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
  const watchBtn = r.youtubeId
    ? `<button
        class="watch-btn"
        data-youtube-id="${escapeHTML(r.youtubeId)}"
        data-title="${escapeHTML(r.name)}"
        data-subtitle="${escapeHTML(r.category)}"
        aria-label="Watch ${escapeHTML(r.name)} tutorial"
      >&#9654; Watch</button>`
    : "";

  return `
    <article class="card rudiment-card">
      <div class="rudiment-card-header">
        <div>
          <div class="rudiment-name">${escapeHTML(r.name)}</div>
          <div class="rudiment-category">${escapeHTML(r.category)}</div>
        </div>
        <span class="diff-pill ${r.difficulty}">${r.difficulty}</span>
      </div>
      <div class="rudiment-sticking">${escapeHTML(r.sticking)}</div>
      <p class="rudiment-description">${escapeHTML(r.description)}</p>
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
