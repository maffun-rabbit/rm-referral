import type { Locale } from "../config/site";

export type ForeignLocale = Exclude<Locale, "ja">;

type LegacyLanguageConfig = {
  shopListLabel: (prefectureLabel: string) => string;
  replacements: readonly (readonly [string, string])[];
};

export const legacyLanguageConfig: Record<ForeignLocale, LegacyLanguageConfig> = {
  vi: {
    shopListLabel: (prefectureLabel) => `Danh sách cửa hàng tại ${prefectureLabel}`,
    replacements: [
      ["通信会社で絞り込む", "Lọc theo nhà mạng"],
      [">ドコモ <small>", ">docomo <small>"],
      [">ソフトバンク <small>", ">SoftBank <small>"],
      [">イオンモバイル <small>", ">AEON Mobile <small>"],
      ["条件に一致する店舗がありません。検索語または通信会社を変更してください。", "Không tìm thấy cửa hàng phù hợp. Hãy đổi từ khóa hoặc nhà mạng."],
      ["オンラインで乗り換えを始める", "Bắt đầu chuyển mạng trực tuyến"],
      ["紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。", "Hãy kiểm tra điều kiện chương trình giới thiệu trước khi đăng ký."],
      ["紹介キャンペーンを確認する", "Xem điều kiện chương trình giới thiệu"],
      ["情報確認日：", "Ngày kiểm tra thông tin: "],
    ],
  },
  en: {
    shopListLabel: (prefectureLabel) => `Stores in ${prefectureLabel}`,
    replacements: [
      ["通信会社で絞り込む", "Filter by carrier"],
      [">ドコモ <small>", ">docomo <small>"],
      [">ソフトバンク <small>", ">SoftBank <small>"],
      [">イオンモバイル <small>", ">AEON Mobile <small>"],
      ["· ドコモ Users", "· docomo Users"],
      ["· ソフトバンク Users", "· SoftBank Users"],
      ["· イオンモバイル Users", "· AEON Mobile Users"],
      ["<dt>Current Carrier</dt><dd>ドコモ</dd>", "<dt>Current Carrier</dt><dd>docomo</dd>"],
      ["<dt>Current Carrier</dt><dd>ソフトバンク</dd>", "<dt>Current Carrier</dt><dd>SoftBank</dd>"],
      ["<dt>Current Carrier</dt><dd>イオンモバイル</dd>", "<dt>Current Carrier</dt><dd>AEON Mobile</dd>"],
      ["条件に一致する店舗がありません。検索語または通信会社を変更してください。", "No stores match your filters. Try another search term or carrier."],
      ["オンラインで乗り換えを始める", "Start switching online"],
      ["紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。", "Check the referral campaign terms before applying."],
      ["紹介キャンペーンを確認する", "Check the referral campaign"],
      ["情報確認日：", "Information checked: "],
      ["https://mnp-navi.jp/tokyo/coverage/", "https://mnp-navi.jp/en/tokyo/coverage/"],
      ["</strong>stores shown", "</strong> stores shown"],
    ],
  },
  zh: {
    shopListLabel: (prefectureLabel) => `${prefectureLabel}的门店`,
    replacements: [
      ["通信会社で絞り込む", "按运营商筛选"],
      [">ドコモ <small>", ">docomo <small>"],
      [">ソフトバンク <small>", ">SoftBank <small>"],
      [">イオンモバイル <small>", ">AEON Mobile <small>"],
      ["· ドコモ 用户", "· docomo 用户"],
      ["· ソフトバンク 用户", "· SoftBank 用户"],
      ["· イオンモバイル 用户", "· AEON Mobile 用户"],
      ["<dt>当前通信公司</dt><dd>ドコモ</dd>", "<dt>当前通信公司</dt><dd>docomo</dd>"],
      ["<dt>当前通信公司</dt><dd>ソフトバンク</dd>", "<dt>当前通信公司</dt><dd>SoftBank</dd>"],
      ["<dt>当前通信公司</dt><dd>イオンモバイル</dd>", "<dt>当前通信公司</dt><dd>AEON Mobile</dd>"],
      ["条件に一致する店舗がありません。検索語または通信会社を変更してください。", "没有符合条件的门店。请更换搜索词或运营商。"],
      ["オンラインで乗り換えを始める", "在线开始携号转网"],
      ["紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。", "申请前请先确认推荐活动的适用条件。"],
      ["紹介キャンペーンを確認する", "查看推荐活动条件"],
      ["情報確認日：", "信息确认日期："],
      ["https://mnp-navi.jp/tokyo/coverage/", "https://mnp-navi.jp/zh/tokyo/coverage/"],
    ],
  },
  ko: { shopListLabel: (prefectureLabel) => `${prefectureLabel} 매장 목록`, replacements: [] },
  pt: { shopListLabel: (prefectureLabel) => `Lojas em ${prefectureLabel}`, replacements: [] },
};
