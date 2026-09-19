import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd(), "..");
const locales = ["ja", "en", "zh", "ko", "vi", "pt"];

test("all replacement-program pages use the shared design structure", async () => {
  for (const locale of locales) {
    const file = path.join(root, "astro-site/dist", locale === 'ja' ? '' : locale, "guide/replacement-program/index.html");
    const html = await readFile(file, "utf8");
    assert.match(html, /data-component="replacement-program-v2"/, locale);
    assert.match(html, /class="program-hero"/, locale);
    assert.match(html, /class="payment-timeline"/, locale);
    assert.match(html, /class="caution-grid"/, locale);
    assert.match(html, /class="program-steps"/, locale);
    assert.match(html, /class="faq-list"/, locale);
    assert.doesNotMatch(html, /localized-program/, locale);
    assert.match(html, new RegExp(`href="${locale === 'ja' ? '' : '/' + locale}/css/style\\.css"`), locale);
  }
});
