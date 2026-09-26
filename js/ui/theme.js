/**
 * theme.js — theme toggle, cycling system → light → dark → system.
 * The initial theme is applied by an inline script in index.html.
 */

import { settings, updateSettings } from "../core/store.js";
import { t } from "../core/i18n.js";

const media = matchMedia("(prefers-color-scheme: dark)");
const ORDER = ["system", "light", "dark"];
const ICON = { system: "🖥️", light: "☀️", dark: "🌙" };

function state() {
  return settings.theme || "system";
}

function resolve(s) {
  return s === "system" ? (media.matches ? "dark" : "light") : s;
}

function apply(s) {
  document.documentElement.setAttribute("data-theme", resolve(s));
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.textContent = ICON[s];
  btn.setAttribute("aria-label", t(`theme.aria.${s}`));
}

export function initTheme() {
  apply(state());

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = ORDER[(ORDER.indexOf(state()) + 1) % ORDER.length];
    updateSettings({ theme: next === "system" ? null : next });
    apply(next);
  });

  // Follow the system theme while "system" is selected.
  media.addEventListener("change", () => {
    if (state() === "system") apply("system");
  });

  document.addEventListener("languagechange", () => apply(state()));
}
