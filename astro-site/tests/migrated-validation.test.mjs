import assert from "node:assert/strict";
import test from "node:test";
import { validateMigratedBuild } from "../scripts/validate-tokyo-build.mjs";

test("all migrated shop pages pass SEO, link and sitemap validation", async () => {
  const result = await validateMigratedBuild();
  assert.equal(result.passed, true, result.errors.join("\n"));
  assert.equal(result.summary.shopPages, 6714);
  assert.equal(result.summary.generatedShopFiles, 6714);
  assert.equal(result.summary.uniqueCanonicals, 6714);
  assert.equal(result.summary.sitemapCoveredShopPages, 6714);
  assert.equal(result.summary.previewUrlsInSitemap, 0);
});
