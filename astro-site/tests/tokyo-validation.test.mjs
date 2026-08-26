import assert from "node:assert/strict";
import test from "node:test";
import { validateTokyoBuild } from "../scripts/validate-tokyo-build.mjs";

test("Tokyo build passes full-slice SEO, link and sitemap validation", async () => {
  const result = await validateTokyoBuild();
  assert.equal(result.passed, true, result.errors.join("\n"));
  assert.deepEqual(result.summary, {
    shopPages: 587,
    generatedShopFiles: 587,
    uniqueCanonicals: 587,
    sitemapUrls: result.summary.sitemapUrls,
    sitemapCoveredShopPages: 587,
    prefectures: ["tokyo"],
    previewUrlsInSitemap: 0,
  });
});
