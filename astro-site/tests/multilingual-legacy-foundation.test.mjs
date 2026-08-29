import assert from "node:assert/strict";
import test from "node:test";
import { createLegacyLanguageLoader, localizeLegacyHtml } from "../src/data/load-legacy-language-pages.ts";
import { legacyLanguageConfig } from "../src/i18n/legacy.ts";

test("shared legacy localizer prefixes internal assets and replaces Worker origins", () => {
  const source = '<a href="/guide/">Guide</a><script src="/js/home.js"></script><a href="https://rm-referral-en.maffun.workers.dev/tokyo/">Tokyo</a>';
  const output = localizeLegacyHtml(source, "en");
  assert.match(output, /href="\/en\/guide\/"/);
  assert.match(output, /src="\/en\/js\/home\.js"/);
  assert.match(output, /href="https:\/\/mnp-navi\.jp\/en\/tokyo\/"/);
  assert.doesNotMatch(output, /workers\.dev/);
});

test("English and Vietnamese UI replacements are isolated by locale", () => {
  const source = "通信会社で絞り込む｜紹介キャンペーンを確認する｜情報確認日：";
  assert.equal(
    localizeLegacyHtml(source, "en"),
    "Filter by carrier｜Check the referral campaign｜Information checked: ",
  );
  assert.equal(
    localizeLegacyHtml(source, "vi"),
    "Lọc theo nhà mạng｜Xem điều kiện chương trình giới thiệu｜Ngày kiểm tra thông tin: ",
  );
});

test("shared loader exposes all route families for both migration locales", () => {
  const vietnamese = createLegacyLanguageLoader("vi");
  const english = createLegacyLanguageLoader("en");
  assert.equal(vietnamese.prefectureSlugs.length, 47);
  assert.equal(english.prefectureSlugs.length, 47);
  assert.equal(vietnamese.loadGuidePages().length, 19);
  assert.equal(english.loadGuidePages().length, 19);
  assert.equal(vietnamese.loadShopPages().length, 6714);
  assert.equal(english.loadShopPages().length, 6714);
  assert.equal(legacyLanguageConfig.vi.shopListLabel("Tokyo"), "Danh sách cửa hàng tại Tokyo");
  assert.equal(legacyLanguageConfig.en.shopListLabel("Tokyo"), "Stores in Tokyo");
});
