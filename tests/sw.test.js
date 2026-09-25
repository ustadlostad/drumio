import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const sw = readFileSync(new URL("sw.js", root), "utf8");
const precache = [...sw.matchAll(/^\s+"([^"]+)",$/gm)].map((m) => m[1]);

function files(dir, ext) {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(`${dir}${e.name}/`, ext) : e.name.endsWith(ext) ? [`${dir}${e.name}`] : []
  );
}

test("service worker precaches every app script and stylesheet", () => {
  for (const file of [...files("js/", ".js"), ...files("css/", ".css")]) {
    assert.ok(precache.includes(file), `sw.js PRECACHE is missing ${file}`);
  }
});

test("every precached file exists", () => {
  for (const file of precache.filter((f) => f !== "./")) {
    assert.ok(existsSync(new URL(file, root)), `missing file: ${file}`);
  }
});
