import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  LOCALE_CONFIG,
  SITE_ORIGIN,
  SUPPORTED_LOCALES,
  getAbsoluteLocaleUrl,
  getAlternateLinks,
  getLocalePath,
} from "../src/config/site.ts";
import { getMessages } from "../src/i18n/index.ts";

test("all six locales have routing metadata and dictionaries", () => {
  assert.deepEqual(SUPPORTED_LOCALES, ["ja", "vi", "en", "zh", "ko", "pt"]);
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(LOCALE_CONFIG[locale].worker);
    assert.ok(LOCALE_CONFIG[locale].inLanguage);
    assert.ok(getMessages(locale).siteName);
  }
});

test("Japanese stays unprefixed and foreign locales use one path prefix", () => {
  assert.equal(SITE_ORIGIN, "https://mnp-navi.jp");
  assert.equal(getLocalePath("ja", "/tokyo/"), "/tokyo/");
  assert.equal(getLocalePath("vi", "/tokyo/"), "/vi/tokyo/");
  assert.equal(getLocalePath("en", "tokyo"), "/en/tokyo/");
  assert.equal(getAbsoluteLocaleUrl("zh", "/"), "https://mnp-navi.jp/zh/");
});

test("alternate links only include available locales and Japanese x-default", () => {
  assert.deepEqual(getAlternateLinks("/tokyo/", ["ja", "vi", "en"]), [
    { hreflang: "ja-JP", href: "https://mnp-navi.jp/tokyo/" },
    { hreflang: "vi-VN", href: "https://mnp-navi.jp/vi/tokyo/" },
    { hreflang: "en", href: "https://mnp-navi.jp/en/tokyo/" },
    { hreflang: "x-default", href: "https://mnp-navi.jp/tokyo/" },
  ]);
  assert.deepEqual(getAlternateLinks("/tokyo/", ["vi"]), [
    { hreflang: "vi-VN", href: "https://mnp-navi.jp/vi/tokyo/" },
  ]);
});

test("BaseLayout renders the new canonical and all configured hreflang links", async () => {
  const html = await readFile(new URL("../dist/vi-component-preview/index.html", import.meta.url), "utf8");
  assert.match(html, /rel="canonical" href="https:\/\/mnp-navi\.jp\/vi\/guide\/foreigners\/"/);
  for (const hreflang of ["ja-JP", "vi-VN", "en", "zh-CN", "ko-KR", "pt-BR", "x-default"]) {
    assert.match(html, new RegExp(`rel="alternate" hreflang="${hreflang}"`));
  }
});
