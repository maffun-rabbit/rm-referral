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
      ["条件に一致する店舗がありません。検索語または通信会社を変更してください。", "No stores match your filters. Try another search term or carrier."],
      ["オンラインで乗り換えを始める", "Start switching online"],
      ["紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。", "Check the referral campaign terms before applying."],
      ["紹介キャンペーンを確認する", "Check the referral campaign"],
      ["情報確認日：", "Information checked: "],
    ],
  },
  zh: { shopListLabel: (prefectureLabel) => `${prefectureLabel}的门店`, replacements: [] },
  ko: { shopListLabel: (prefectureLabel) => `${prefectureLabel} 매장 목록`, replacements: [] },
  pt: { shopListLabel: (prefectureLabel) => `Lojas em ${prefectureLabel}`, replacements: [] },
};
