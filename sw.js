/**
 * sw.js — offline support for the web build.
 *
 * Network first, so a deploy is picked up on the next load; the cache is the
 * fallback when offline. Bump CACHE when the precache list changes.
 */

const CACHE = "drumio-v1";

const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/themes.css",
  "css/style.css",
  "css/metronome.css",
  "css/rudiments.css",
  "css/drills.css",
  "css/modal.css",
  "js/main.js",
  "js/core/i18n.js",
  "js/core/store.js",
  "js/core/dom.js",
  "js/core/data.js",
  "js/core/sticking.js",
  "js/locales/en.js",
  "js/locales/tr.js",
  "js/audio/metronome.js",
  "js/audio/sounds.js",
  "js/ui/catalog.js",
  "js/ui/drills.js",
  "js/ui/exercise.js",
  "js/ui/metronome-ui.js",
  "js/ui/modal.js",
  "js/ui/nav.js",
  "js/ui/rudiments.js",
  "js/ui/sticking-view.js",
  "js/ui/theme.js",
  "js/ui/timer.js",
  "js/ui/toast.js",
  "js/ui/trainer.js",
  "js/ui/wake-lock.js",
  "data/rudiments.json",
  "data/drills.json",
  "assets/favicon.png",
  "assets/apple-touch-icon.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
