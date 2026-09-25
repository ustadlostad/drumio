/**
 * data.js — loads the JSON content files once and caches them.
 */

const cache = new Map();

function load(path) {
  if (!cache.has(path)) {
    const promise = fetch(path).then((res) => {
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
      return res.json();
    });
    // Allow a retry after a failed request.
    promise.catch(() => cache.delete(path));
    cache.set(path, promise);
  }
  return cache.get(path);
}

export const loadRudiments = () => load("data/rudiments.json");
export const loadDrills = () => load("data/drills.json");
