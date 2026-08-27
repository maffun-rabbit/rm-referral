import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { languageConfig, requireLanguage, supportedLanguages } from "../scripts/language-config.mjs";

const root = path.resolve(import.meta.dirname, "..");

test("all six languages have independent Worker and Wrangler settings", async () => {
  assert.deepEqual(supportedLanguages, ["ja", "vi", "en", "zh", "ko", "pt"]);
  assert.equal(new Set(supportedLanguages.map((locale) => languageConfig[locale].worker)).size, 6);
  assert.equal(new Set(supportedLanguages.map((locale) => languageConfig[locale].config)).size, 6);

  for (const locale of supportedLanguages) {
    const { worker, config } = requireLanguage(locale);
    const wrangler = await readFile(path.join(root, config), "utf8");
    assert.match(wrangler, new RegExp(`"name"\\s*:\\s*"${worker}"`));
    assert.match(wrangler, new RegExp(`"directory"\\s*:\\s*"\\.deploy/${locale}"`));
  }
});

test("Vietnamese artifact contains only the /vi/ public root", async () => {
  await access(path.join(root, ".deploy", "vi", "vi", "index.html"));
  const result = await import("node:child_process").then(({ spawnSync }) =>
    spawnSync("node", ["scripts/validate-language-assets.mjs", "vi"], { cwd: root, encoding: "utf8" }),
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const validation = JSON.parse(result.stdout);
  assert.equal(validation.passed, true);
  assert.equal(validation.files, 6852);
  assert.equal(validation.htmlFiles, 6835);
  assert.equal(validation.publicPath, "/vi/");
});

test("unknown language is rejected before packaging or deployment", () => {
  assert.throws(() => requireLanguage("fr"), /Unsupported locale/);
});
