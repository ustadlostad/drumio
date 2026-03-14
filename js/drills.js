/**
 * drills.js — Drumio Drills
 * Fetches drills.json, renders cards, handles search & category filter,
 * and links "Practise" to the metronome section.
 */

let allDrills = [];
let activeDrillCategory   = "All";
let activeDrillDifficulty = "All";
let drillSearchQuery = "";

// ─── Fetch & Init ─────────────────────────────────────────────────

async function initDrills() {
  const grid    = document.getElementById("drillsGrid");
  const toolbar = document.getElementById("drillsToolbar");
  if (!grid) return;

  try {
    const res = await fetch("data/drills.json");
    allDrills = await res.json();
  } catch (e) {
    grid.innerHTML = `<p class="drills-empty">Could not load drills. Try refreshing.</p>`;
    return;
  }

  buildDrillCategoryPills(toolbar);
  buildDrillDifficultyPills(toolbar);
  renderDrills();
  hookDrillSearch();
}

// ─── Category Pills ───────────────────────────────────────────────

function buildDrillCategoryPills(toolbar) {
  const categories = ["All", ...new Set(allDrills.map((d) => d.category))];
  const container  = toolbar.querySelector("[data-filter='category']");
  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className   = "pill" + (cat === "All" ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeDrillCategory = cat;
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderDrills();
    });
    container.appendChild(btn);
  });
}

// ─── Difficulty Pills ─────────────────────────────────────────────

function buildDrillDifficultyPills(toolbar) {
  const levels    = ["All", "beginner", "intermediate", "advanced"];
  const container = toolbar.querySelector("[data-filter='difficulty']");
  container.innerHTML = "";

  levels.forEach((lvl) => {
    const btn = document.createElement("button");
    btn.className   = "pill" + (lvl === "All" ? " active" : "");
    btn.textContent = lvl === "All" ? "All Levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1);
    btn.addEventListener("click", () => {
      activeDrillDifficulty = lvl;
      container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderDrills();
    });
    container.appendChild(btn);
  });
}

// ─── Search ───────────────────────────────────────────────────────

function hookDrillSearch() {
  const input = document.getElementById("drillSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    drillSearchQuery = input.value.trim().toLowerCase();
    renderDrills();
  });
}

// ─── Render ───────────────────────────────────────────────────────

function renderDrills() {
  const grid    = document.getElementById("drillsGrid");
  const countEl = document.getElementById("drillsCount");
  if (!grid) return;

  const filtered = allDrills.filter((d) => {
    const matchCat   = activeDrillCategory === "All" || d.category === activeDrillCategory;
    const matchDiff  = activeDrillDifficulty === "All" || d.difficulty === activeDrillDifficulty;
    const matchSearch =
      !drillSearchQuery ||
      d.name.toLowerCase().includes(drillSearchQuery) ||
      d.category.toLowerCase().includes(drillSearchQuery) ||
      d.description.toLowerCase().includes(drillSearchQuery);
    return matchCat && matchDiff && matchSearch;
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} of ${allDrills.length} drill${allDrills.length !== 1 ? "s" : ""}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="drills-empty">No drills match your filters.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((d) => drillCardHTML(d)).join("");

  // Attach practise button listeners
  grid.querySelectorAll(".practise-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bpm = parseInt(btn.dataset.bpm, 10);
      openMetronomeWithBpm(bpm);
    });
  });

  // Attach Watch button listeners
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

function drillCardHTML(d) {
  const tags = d.rudiments
    .map((id) => `<span class="rudiment-tag">${escapeHTML(id.replace(/-/g, " "))}</span>`)
    .join("");

  const recommendedBpm = d.bpmRange.min;

  const watchBtn = d.youtubeId
    ? `<button
        class="watch-btn"
        data-youtube-id="${escapeHTML(d.youtubeId)}"
        data-title="${escapeHTML(d.name)}"
        data-subtitle="${escapeHTML(d.category)}"
        aria-label="Watch ${escapeHTML(d.name)} video"
      >▶ Watch</button>`
    : "";

  return `
    <article class="card drill-card">
      <div class="drill-card-header">
        <div>
          <div class="drill-name">${escapeHTML(d.name)}</div>
          <div class="drill-category">${escapeHTML(d.category)}</div>
        </div>
        <span class="diff-pill ${d.difficulty}">${d.difficulty}</span>
      </div>

      <div class="drill-bpm-range">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
        </svg>
        ${d.bpmRange.min}–${d.bpmRange.max} BPM
      </div>

      ${tags ? `<div class="drill-rudiments">${tags}</div>` : ""}

      <p class="drill-description">${escapeHTML(d.description)}</p>

      <div class="drill-card-footer">
        <span style="font-size:0.78rem;color:var(--color-text-muted)">Start at ${recommendedBpm} BPM</span>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          ${watchBtn}
          <button class="practise-btn" data-bpm="${recommendedBpm}" aria-label="Practise ${escapeHTML(d.name)} at ${recommendedBpm} BPM">
            ▶ Practise
          </button>
        </div>
      </div>
    </article>
  `;
}

// ─── Link to Metronome ────────────────────────────────────────────

function openMetronomeWithBpm(bpm) {
  // Set the metronome BPM
  if (typeof metronome !== "undefined") {
    metronome.setBpm(bpm);
    // Sync the metronome UI controls
    const slider = document.getElementById("bpmSlider");
    const number = document.getElementById("bpmNumber");
    if (slider) {
      slider.value = bpm;
      const pct = ((bpm - 20) / (300 - 20)) * 100;
      slider.style.setProperty("--pct", pct + "%");
    }
    if (number) {
      number.textContent = bpm;
      number.setAttribute("aria-valuenow", bpm);
    }
  }

  // Switch to metronome section
  showSection("Metronome");

  // Auto-start the metronome if it isn't already playing
  if (!metronome.isPlaying) {
    metronome.start();
    const playBtn = document.getElementById("playBtn");
    if (playBtn) {
      playBtn.textContent = "Stop";
      playBtn.classList.add("playing");
    }
  }

  // Show a toast confirmation
  showBpmToast(bpm);
}

function showBpmToast(bpm) {
  let toast = document.getElementById("bpmToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id        = "bpmToast";
    toast.className = "bpm-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = `Metronome set to ${bpm} BPM`;
  toast.classList.add("visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("visible"), 2500);
}
