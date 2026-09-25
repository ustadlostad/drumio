/**
 * wake-lock.js — keeps the screen on while the metronome plays.
 */

import { metronome } from "../audio/metronome.js";

let lock = null;

async function acquire() {
  if (!("wakeLock" in navigator) || lock || document.visibilityState !== "visible") return;
  try {
    lock = await navigator.wakeLock.request("screen");
    lock.addEventListener("release", () => { lock = null; });
  } catch {
    // Denied (e.g. low battery mode); the metronome still works.
  }
}

function release() {
  lock?.release();
  lock = null;
}

export function initWakeLock() {
  metronome.on("start", acquire);
  metronome.on("stop", release);
  // The browser drops the lock when the page is hidden; take it back.
  document.addEventListener("visibilitychange", () => {
    if (metronome.isPlaying) acquire();
  });
}
