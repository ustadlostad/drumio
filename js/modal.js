/**
 * modal.js — Drumio Video Modal
 * Opens a YouTube embed in a modal overlay.
 * Usage: openVideoModal({ title, subtitle, youtubeId })
 */

(function () {
  let _modal     = null;
  let _iframe    = null;
  let _titleEl   = null;
  let _subtitleEl = null;
  let _ytLink    = null;

  // ─── Build DOM once ─────────────────────────────────────────────

  function ensureModal() {
    if (_modal) return;

    _modal = document.createElement("div");
    _modal.className = "modal-overlay";
    _modal.setAttribute("role", "dialog");
    _modal.setAttribute("aria-modal", "true");
    _modal.setAttribute("aria-label", t("modal.playerAria"));

    _modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="modalTitle"></div>
            <div class="modal-title-sub" id="modalSubtitle"></div>
          </div>
          <button class="modal-close-btn" id="modalCloseBtn" aria-label="${t("modal.closeAria")}">&#x2715;</button>
        </div>
        <div class="modal-video-wrap">
          <iframe
            id="modalIframe"
            src=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            title="YouTube video player"
          ></iframe>
        </div>
        <div class="modal-footer">
          <a class="modal-yt-link" id="modalYtLink" href="#" target="_blank" rel="noopener">
            ${t("modal.openYoutube")}
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(_modal);

    _iframe     = document.getElementById("modalIframe");
    _titleEl    = document.getElementById("modalTitle");
    _subtitleEl = document.getElementById("modalSubtitle");
    _ytLink     = document.getElementById("modalYtLink");

    // Close on overlay click
    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) closeVideoModal();
    });

    // Close button
    document.getElementById("modalCloseBtn").addEventListener("click", closeVideoModal);

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && _modal.classList.contains("open")) closeVideoModal();
    });

    // Update translated text on language change
    document.addEventListener("languagechange", () => {
      if (!_modal) return;
      _modal.setAttribute("aria-label", t("modal.playerAria"));
      const closeBtn = document.getElementById("modalCloseBtn");
      if (closeBtn) closeBtn.setAttribute("aria-label", t("modal.closeAria"));
      if (_ytLink) _ytLink.textContent = t("modal.openYoutube");
    });
  }

  // ─── Public API ──────────────────────────────────────────────────

  window.openVideoModal = function ({ title, subtitle, youtubeId }) {
    ensureModal();
    _titleEl.textContent    = title || "";
    _subtitleEl.textContent = subtitle || "";
    _iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
    _ytLink.href = `https://www.youtube.com/watch?v=${youtubeId}`;
    _modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.closeVideoModal = function () {
    if (!_modal) return;
    _modal.classList.remove("open");
    // Stop video by clearing src
    setTimeout(() => {
      _iframe.src = "";
    }, 200);
    document.body.style.overflow = "";
  };
})();
