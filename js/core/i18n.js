/**
 * i18n.js — Drumio internationalisation
 *
 * To add a language: create js/locales/<code>.js and register it in LANGUAGES.
 * Function-valued strings support interpolation: t(key, ...args).
 */

import en from "../locales/en.js";
import tr from "../locales/tr.js";
import { settings, updateSettings } from "./store.js";

export const LANGUAGES = {
  en: { label: "EN", strings: en },
  tr: { label: "TR", strings: tr },
};

const DEFAULT_LANG = "en";

let currentLang = resolveInitialLang();

function resolveInitialLang() {
  if (LANGUAGES[settings.lang]) return settings.lang;
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return LANGUAGES[browser] ? browser : DEFAULT_LANG;
}

/**
 * Get a translated string for the current language.
 * Falls back to English, then to the key itself.
 */
export function t(key, ...args) {
  const strings = LANGUAGES[currentLang].strings;
  const val = key in strings ? strings[key] : en[key];
  if (val === undefined) return key;
  return typeof val === "function" ? val(...args) : val;
}

export function getLanguage() {
  return currentLang;
}

/** Switch language, persist it and notify listeners via "languagechange". */
export function setLanguage(lang) {
  if (!LANGUAGES[lang] || lang === currentLang) return;
  currentLang = lang;
  updateSettings({ lang });
  applyTranslations();
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

/**
 * Translate static markup tagged with data-i18n, data-i18n-placeholder,
 * data-i18n-aria or data-i18n-title.
 */
export function applyTranslations(root = document) {
  document.documentElement.lang = currentLang;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

/** Pick the localised field of a data record, e.g. description / description_tr. */
export function localized(record, field) {
  if (currentLang === DEFAULT_LANG) return record[field];
  return record[`${field}_${currentLang}`] || record[field];
}
