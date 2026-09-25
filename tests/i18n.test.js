import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import en from "../js/locales/en.js";
import tr from "../js/locales/tr.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function jsFiles(dir) {
  return readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? jsFiles(`${dir}/${e.name}`) : e.name.endsWith(".js") ? [`${dir}/${e.name}`] : []
  );
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

test("Turkish has exactly the English keys", () => {
  assert.deepEqual(Object.keys(tr).sort(), Object.keys(en).sort());
});

test("every key used in index.html exists", () => {
  const html = read("index.html");
  for (const [, key] of html.matchAll(/data-i18n(?:-placeholder|-aria|-title)?="([^"]+)"/g)) {
    assert.ok(key in en, `missing key: ${key}`);
  }
});

test("every literal t() key used in JavaScript exists", () => {
  for (const file of jsFiles("js")) {
    for (const [, key] of read(file).matchAll(/\bt\("([a-zA-Z0-9.]+)"\s*[,)]/g)) {
      assert.ok(key in en, `${file}: missing key ${key}`);
    }
  }
});

test("every data category has a translation", () => {
  for (const file of ["data/rudiments.json", "data/drills.json"]) {
    for (const item of JSON.parse(read(file))) {
      assert.ok(`category.${slug(item.category)}` in en, `${file}: ${item.category}`);
    }
  }
});

test("every data item has a Turkish description", () => {
  for (const file of ["data/rudiments.json", "data/drills.json"]) {
    for (const item of JSON.parse(read(file))) {
      assert.ok(item.description_tr, `${file}: ${item.id}`);
    }
  }
});
