/**
 * dom.js — small DOM helpers shared by the UI modules.
 */

export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** True when a key press should go to a form control instead of a shortcut. */
export function isEditableTarget(el) {
  return Boolean(
    el.closest && el.closest('input, textarea, select, [contenteditable="true"]')
  );
}
