/**
 * modal.js — YouTube video modal.
 *
 * Items with a curated youtubeId open an embedded player. Items without one
 * get a link to a YouTube search for the item name.
 */

import { t } from "../core/i18n.js";
import { escapeHTML } from "../core/dom.js";
import { categoryLabel } from "./catalog.js";

let modal = null;
let lastFocus = null;

const $ = (id) => document.getElementById(id);

function youtubeSearchUrl(name) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${name} drum rudiment`);
}

/** "Watch" button for curated videos, "Find on YouTube" link otherwise. */
export function videoButtonHTML(item) {
  if (item.youtubeId) {
    return `<button type="button" class="watch-btn" data-action="video"
      aria-label="${escapeHTML(t("video.watchAria", item.name))}">▶ ${escapeHTML(t("video.watch"))}</button>`;
  }
  return `<a class="watch-btn" href="${escapeHTML(youtubeSearchUrl(item.name))}" target="_blank" rel="noopener"
    aria-label="${escapeHTML(t("video.searchAria", item.name))}">↗ ${escapeHTML(t("video.search"))}</a>`;
}

function renderLabels() {
  modal.setAttribute("aria-label", t("modal.playerAria"));
  $("modalCloseBtn").setAttribute("aria-label", t("modal.closeAria"));
  $("modalYtLink").textContent = t("modal.openYoutube");
}

function ensureModal() {
  if (modal) return;

  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <div>
          <div class="modal-title" id="modalTitle"></div>
          <div class="modal-title-sub" id="modalSubtitle"></div>
        </div>
        <button type="button" class="modal-close-btn" id="modalCloseBtn">&#x2715;</button>
      </div>
      <div class="modal-video-wrap">
        <iframe id="modalIframe" src="" title="YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
      <div class="modal-footer">
        <a class="modal-yt-link" id="modalYtLink" href="#" target="_blank" rel="noopener"></a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  renderLabels();

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeVideo();
  });
  $("modalCloseBtn").addEventListener("click", closeVideo);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeVideo();
  });
  document.addEventListener("languagechange", renderLabels);
}

export function openVideo(item) {
  ensureModal();
  lastFocus = document.activeElement;
  $("modalTitle").textContent = item.name;
  $("modalSubtitle").textContent = categoryLabel(item.category);
  $("modalIframe").src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.youtubeId)}?autoplay=1&rel=0`;
  $("modalYtLink").href = `https://www.youtube.com/watch?v=${encodeURIComponent(item.youtubeId)}`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  $("modalCloseBtn").focus();
}

export function closeVideo() {
  if (!modal) return;
  modal.classList.remove("open");
  // Clearing src stops playback once the close animation ends.
  setTimeout(() => { $("modalIframe").src = ""; }, 200);
  document.body.style.overflow = "";
  lastFocus?.focus();
}
