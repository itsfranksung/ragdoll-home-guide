import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);

test("exports the interactive book landing screen", async () => {
  const html = await readFile(new URL("dist/client/index.html", root), "utf8");

  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /布偶貓<br\/>照顧準備書/);
  assert.match(html, /你們…….*願意帶我回家嗎？/s);
  assert.doesNotMatch(html, /熊、獅子……/);
  assert.match(html, /assets\/cat-guide\.webp/);
  assert.doesNotMatch(html, /Starter Project/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("ships every required visual asset", async () => {
  await Promise.all([
    "cat-cover.webp",
    "cat-portrait.webp",
    "cat-guide.webp",
    "bear-lion.webp",
  ].map((name) => access(new URL(`dist/client/assets/${name}`, root))));
});

test("includes motion accessibility and page-turn styling", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@keyframes flip-next/);
  assert.match(css, /@keyframes cat-arrive/);
  assert.match(css, /family=Iansui/);
  assert.match(css, /--font-hand: "Iansui"/);
});

test("contains twelve authored pages and local progress storage", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(source, /const PAGE_COUNT = 12/);
  assert.match(source, /ragdoll-home-guide-progress-v1/);
  assert.match(source, /我們的共同照顧約定/);
  assert.match(source, /HCM DNA 檢測結果/);
  assert.match(source, /turnPage\(delta > 0 \? "next" : "prev"\)/);
  assert.doesNotMatch(source, /熊|獅子/);
});
