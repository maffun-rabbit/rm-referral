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

test("English, Vietnamese and Chinese UI replacements are isolated by locale", () => {
  const source = "通信会社で絞り込む｜紹介キャンペーンを確認する｜情報確認日：";
  assert.equal(
    localizeLegacyHtml(source, "en"),
    "Filter by carrier｜Check the referral campaign｜Information checked: ",
  );
  assert.equal(
    localizeLegacyHtml(source, "vi"),
    "Lọc theo nhà mạng｜Xem điều kiện chương trình giới thiệu｜Ngày kiểm tra thông tin: ",
  );
  assert.equal(
    localizeLegacyHtml(source, "zh"),
    "按运营商筛选｜查看推荐活动条件｜信息确认日期：",
  );
});

test("shared loader exposes all route families for all migration locales", () => {
  const vietnamese = createLegacyLanguageLoader("vi");
  const english = createLegacyLanguageLoader("en");
  const chinese = createLegacyLanguageLoader("zh");
  assert.equal(vietnamese.prefectureSlugs.length, 47);
  assert.equal(english.prefectureSlugs.length, 47);
  assert.equal(chinese.prefectureSlugs.length, 47);
  assert.equal(vietnamese.loadGuidePages().length, 19);
  assert.equal(english.loadGuidePages().length, 19);
  assert.equal(chinese.loadGuidePages().length, 19);
  assert.equal(vietnamese.loadShopPages().length, 6714);
  assert.equal(english.loadShopPages().length, 6714);
  assert.equal(chinese.loadShopPages().length, 6714);
  assert.equal(legacyLanguageConfig.vi.shopListLabel("Tokyo"), "Danh sách cửa hàng tại Tokyo");
  assert.equal(legacyLanguageConfig.en.shopListLabel("Tokyo"), "Stores in Tokyo");
  assert.equal(legacyLanguageConfig.zh.shopListLabel("东京都"), "东京都的门店");
});
