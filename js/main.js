/**
 * main.js — Drumio entry point.
 */

import { LANGUAGES, getLanguage, setLanguage, applyTranslations } from "./core/i18n.js";
import { metronome } from "./audio/metronome.js";
import { initTheme } from "./ui/theme.js";
import { initNav } from "./ui/nav.js";
import { initMetronomeUI } from "./ui/metronome-ui.js";
import { initTrainer } from "./ui/trainer.js";
import { initTimer } from "./ui/timer.js";
import { initExercise } from "./ui/exercise.js";
import { initWakeLock } from "./ui/wake-lock.js";
import { rudimentCatalog } from "./ui/rudiments.js";
import { drillCatalog } from "./ui/drills.js";

function initLanguageSelect() {
  const select = document.getElementById("langSelect");
  select.innerHTML = Object.entries(LANGUAGES)
    .map(([code, { label }]) => `<option value="${code}">${label}</option>`)
    .join("");
  select.value = getLanguage();
  select.addEventListener("change", () => setLanguage(select.value));
}

function registerServiceWorker() {
  // Capacitor serves the app from the bundle; offline caching is for the web build only.
  const isNative = window.Capacitor?.isNativePlatform?.();
  if (!("serviceWorker" in navigator) || isNative || location.protocol === "file:") return;
  navigator.serviceWorker.register("sw.js").catch((err) => console.warn("Service worker:", err));
}

// Unlock the AudioContext on the very first tap anywhere, so it is already
// running by the time a nested control (e.g. a rudiment's Practise button)
// tries to use it. Some WebViews only grant resume() on a raw gesture.
document.addEventListener("pointerdown", () => metronome.unlock(), { once: true, passive: true });

applyTranslations();
initTheme();
initLanguageSelect();
initMetronomeUI();
initTrainer();
initTimer();
initExercise();
initWakeLock();
initNav({
  rudiments: rudimentCatalog.init,
  drills: drillCatalog.init,
});
registerServiceWorker();
