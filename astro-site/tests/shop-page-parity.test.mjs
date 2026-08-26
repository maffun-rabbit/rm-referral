import assert from "node:assert/strict";
import test from "node:test";
import { compareFiles } from "../scripts/compare-shop-page.mjs";

test("legacy and Astro shop pages preserve SEO, content, schemas and links", async () => {
  const result = await compareFiles();
  assert.deepEqual(result.checks, {
    title: true,
    description: true,
    canonical: true,
    visibleMainText: true,
    headings: true,
    structuredData: true,
    mainLinks: true,
    externalScripts: true,
  });
  assert.equal(result.passed, true);
});
