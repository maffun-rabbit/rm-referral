import type { SiteMessages } from "./types";

export const ja = {
  htmlLang: "ja",
  ogLocale: "ja_JP",
  siteName: "楽天モバイル乗り換えガイド",
  header: {
    defaultLinkLabel: "乗り換え前の不安を確認",
  },
  campaign: {
    eyebrow: "楽天従業員紹介キャンペーン",
    primaryAudience: "他社から乗り換えなら",
    finalAudience: "他社から乗り換えで",
    points: "14,000",
    pointsUnit: "ポイント",
    primaryButton: "14,000ポイント特典を確認する",
    primaryNote: "楽天従業員紹介キャンペーン。適用には申し込み・利用開始・Rakuten Link通話などの条件があります。",
    finalDescription: "適用条件やポイント進呈時期を確認し、紹介リンクから楽天IDでログインして申し込みへ進んでください。",
    floatingButton: "特典を確認する",
    updatedLabel: "情報確認日",
    updatedSeparator: "：",
  },
  footer: {
    operatorNotice: "当サイトは個人が運営しており、各通信会社および掲載店舗の公式サイトではありません。",
    referralNotice: "当サイトには紹介リンクが含まれます。条件や店舗情報は、申し込み時点の各公式サイトでご確認ください。",
  },
} satisfies SiteMessages;
