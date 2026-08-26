import assert from "node:assert/strict";
import test from "node:test";
import { validateKantoBuild } from "../scripts/validate-tokyo-build.mjs";

test("Kanto build passes full-slice SEO, link and sitemap validation", async () => {
  const result = await validateKantoBuild();
  assert.equal(result.passed, true, result.errors.join("\n"));
  assert.deepEqual(result.summary, {
    shopPages: 1792,
    generatedShopFiles: 1792,
    uniqueCanonicals: 1792,
    sitemapUrls: result.summary.sitemapUrls,
    sitemapCoveredShopPages: 1792,
    prefectures: ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"],
    previewUrlsInSitemap: 0,
  });
});
