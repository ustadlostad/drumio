/**
 * toast.js — short status message at the bottom of the screen.
 */

let hideTimer = null;

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove("visible"), 2500);
}
