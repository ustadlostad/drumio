/**
 * theme.js — light / dark theme toggle.
 * The initial theme is applied by an inline script in index.html.
 */

import { settings, updateSettings } from "../core/store.js";

const media = matchMedia("(prefers-color-scheme: dark)");

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "🌙" : "☀️";
}

export function initTheme() {
  apply(settings.theme || (media.matches ? "dark" : "light"));

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    updateSettings({ theme: next });
    apply(next);
  });

  // Follow the system theme until the user picks one.
  media.addEventListener("change", (e) => {
    if (!settings.theme) apply(e.matches ? "dark" : "light");
  });
}
