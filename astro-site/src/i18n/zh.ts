import type { SiteMessages } from "./types";

export const zh = {
  htmlLang: "zh-CN",
  ogLocale: "zh_CN",
  siteName: "乐天移动换网指南",
  header: { defaultLinkLabel: "外国居民申请指南" },
  campaign: {
    eyebrow: "乐天员工推荐活动",
    primaryAudience: "从其他运营商携号转网",
    finalAudience: "携号转网可获得",
    points: "14,000",
    pointsUnit: "积分",
    primaryButton: "查看14,000积分优惠",
    primaryNote: "乐天员工推荐活动。须满足申请、开通及使用Rakuten Link通话等条件。",
    finalDescription: "请确认适用条件和积分发放时间，并通过推荐链接登录乐天ID后申请。",
    floatingButton: "查看优惠",
    updatedLabel: "信息确认日期",
    updatedSeparator: "：",
  },
  footer: {
    operatorNotice: "本网站由个人独立运营，并非任何运营商或所列门店的官方网站。",
    referralNotice: "本网站含有推荐链接。申请前请在官方网站确认最新条件和门店信息。",
  },
} satisfies SiteMessages;
