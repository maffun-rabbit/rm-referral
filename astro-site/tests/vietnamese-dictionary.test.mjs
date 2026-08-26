import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../dist/vi-component-preview/index.html", import.meta.url), "utf8");

test("Vietnamese locale metadata is rendered", () => {
  assert.match(html, /<html lang="vi">/);
  assert.match(html, /property="og:locale" content="vi_VN"/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});

test("shared header, CTA and footer use the Vietnamese dictionary", () => {
  assert.match(html, /Hướng dẫn chuyển sang Rakuten Mobile/);
  assert.match(html, /Chuyển mạng giữ số từ nhà mạng khác/);
  assert.match(html, /14\.000 điểm/);
  assert.match(html, /Xem ưu đãi 14\.000 điểm/);
  assert.match(html, /Ngày kiểm tra thông tin: 2026-08-26/);
  assert.match(html, /Trang web này được vận hành độc lập/);
});

test("all CTA variants keep the shared referral URL", () => {
  assert.equal((html.match(/https:\/\/r10\.to\/hNearm/g) ?? []).length, 3);
  assert.match(html, /data-primary-cta/);
  assert.match(html, /data-final-cta/);
  assert.match(html, /data-floating-cta/);
});
