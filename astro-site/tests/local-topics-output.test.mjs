import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync, readdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "astro-site/dist");
const source = JSON.parse(readFileSync(path.join(root, "data/local-topics.json"), "utf8"));
const prefectures = new Set(readdirSync(path.join(root, "data")).filter((f) => f.endsWith("-carrier-shops-geocoded.csv") && f !== "value-carrier-shops-geocoded.csv").map((f) => f.replace(/-carrier-shops-geocoded\.csv$/, "")));
prefectures.add("hokkaido");

test("local cards use source metadata, keep links out, and publish current official updates", () => {
  let cards = 0, pages = 0, areaUpdates = 0, nagoya = 0, kawaguchi = 0;
  for (const prefecture of prefectures) {
    const base = path.join(dist, prefecture);
    for (const carrier of readdirSync(base, {withFileTypes: true}).filter((entry) => entry.isDirectory() && entry.name !== "coverage")) {
      for (const shop of readdirSync(path.join(base, carrier.name), {withFileTypes: true}).filter((entry) => entry.isDirectory())) {
        const html = readFileSync(path.join(base, carrier.name, shop.name, "index.html"), "utf8");
        assert.match(html, /他社から乗り換えなら<\/span><strong>14,000/);
        assert.match(html, /data-floating-cta/);
        for (const [section] of html.matchAll(/<section class="local-topics-section"[\s\S]*?<\/section>/g)) {
          pages++;
          assert.doesNotMatch(section, /\bhref\s*=/);
          for (const [card] of section.matchAll(/<article class="local-topic-card"[\s\S]*?<\/article>/g)) {
            cards++;
            assert.match(card, /元記事：[^<]+<br>媒体：[^<]+<br>公開日：\d{4}年\d{1,2}月\d{1,2}日/);
            if (card.includes("Rakuten最強プランプロジェクト進行中！")) { areaUpdates++; assert.match(card, /公開日：2026年9月15日/); }
            if (card.includes("ヨドバシカメラ マルチメディア名鉄名古屋店がオープン")) { nagoya++; assert.match(card, /公開日：2026年9月14日/); }
            if (card.includes("コジマ×ビックカメラ minanoba川口店がオープン")) { kawaguchi++; assert.match(card, /公開日：2026年9月14日/); }
          }
        }
      }
    }
  }
  assert.ok(pages > 1000 && cards >= pages);
  assert.ok(areaUpdates > 0 && nagoya > 0 && kawaguchi > 0);
  assert.equal(source.reviewedAt, "2026-09-21");
});
