import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputPath = new URL("../dist/tokyo/au/au-shop-narimasu/index.html", import.meta.url);

test("auショップ 成増を既存URLへ静的出力する", async () => {
  const html = await readFile(outputPath, "utf8");
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /ａｕショップ 成増（板橋区）を利用中の方へ｜auから楽天モバイルへの乗り換えガイド/);
  assert.match(html, /rel="canonical" href="https:\/\/rm-referral\.maffun\.workers\.dev\/tokyo\/au\/au-shop-narimasu\/"/);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.match(html, /G-86FFC09LTE/);
  assert.match(html, /"@type":"WebPage"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /data-primary-cta/);
  assert.match(html, /data-final-cta/);
  assert.match(html, /data-floating-cta/);
  assert.match(html, /板橋区周辺の楽天モバイル最新トピック/);
  assert.match(html, /楽天モバイル 成増店/);
  assert.match(html, /\/js\/shop-cta\.js/);
  await access(new URL("../dist/js/analytics.js", import.meta.url));
  await access(new URL("../dist/js/shop-cta.js", import.meta.url));
});
