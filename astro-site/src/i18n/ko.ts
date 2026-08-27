import type { SiteMessages } from "./types";

export const ko = {
  htmlLang: "ko",
  ogLocale: "ko_KR",
  siteName: "라쿠텐 모바일 번호이동 가이드",
  header: { defaultLinkLabel: "외국인 거주자 신청 가이드" },
  campaign: {
    eyebrow: "라쿠텐 직원 추천 캠페인",
    primaryAudience: "다른 통신사에서 번호이동 시",
    finalAudience: "번호이동으로",
    points: "14,000",
    pointsUnit: "포인트",
    primaryButton: "14,000포인트 혜택 확인",
    primaryNote: "라쿠텐 직원 추천 캠페인입니다. 신청, 이용 개시 및 Rakuten Link 통화 등의 조건이 적용됩니다.",
    finalDescription: "적용 조건과 포인트 지급 시기를 확인한 후 추천 링크에서 라쿠텐 ID로 로그인해 신청하세요.",
    floatingButton: "혜택 확인",
    updatedLabel: "정보 확인일",
    updatedSeparator: ": ",
  },
  footer: {
    operatorNotice: "이 사이트는 개인이 독립적으로 운영하며 통신사 또는 게재 매장의 공식 사이트가 아닙니다.",
    referralNotice: "이 사이트에는 추천 링크가 포함되어 있습니다. 신청 시 공식 사이트에서 최신 조건과 매장 정보를 확인하세요.",
  },
} satisfies SiteMessages;
