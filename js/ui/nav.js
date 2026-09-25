/**
 * nav.js — hash-based navigation between the app sections.
 * #metronome, #rudiments, #drills. Browser back / forward works.
 */

const DEFAULT_SECTION = "metronome";
const initializers = {};
const initialised = new Set();

function sectionFromHash() {
  const name = location.hash.slice(1);
  return document.querySelector(`.nav-link[data-section="${CSS.escape(name)}"]`)
    ? name
    : DEFAULT_SECTION;
}

function render() {
  const name = sectionFromHash();

  document.querySelectorAll("main [data-section]").forEach((el) => {
    el.hidden = el.dataset.section !== name;
  });
  document.querySelectorAll(".nav-link").forEach((a) => {
    const active = a.dataset.section === name;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  if (!initialised.has(name)) {
    initialised.add(name);
    initializers[name]?.();
  }
}

/** Show a section. Returns after its lazy initialiser (if any) has run. */
export function showSection(name) {
  if (location.hash.slice(1) !== name) {
    location.hash = name;   // triggers render via hashchange
  }
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** initializers: { sectionName: fn } called once, the first time a section is shown. */
export function initNav(sectionInitializers) {
  Object.assign(initializers, sectionInitializers);
  window.addEventListener("hashchange", render);
  render();
}
