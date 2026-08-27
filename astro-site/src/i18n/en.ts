import type { SiteMessages } from "./types";

export const en = {
  htmlLang: "en",
  ogLocale: "en_US",
  siteName: "Rakuten Mobile Switching Guide",
  header: { defaultLinkLabel: "Guide for Foreign Residents" },
  campaign: {
    eyebrow: "RAKUTEN EMPLOYEE REFERRAL CAMPAIGN",
    primaryAudience: "Switching from another carrier",
    finalAudience: "Switch and receive",
    points: "14,000",
    pointsUnit: " points",
    primaryButton: "Check the 14,000-point offer",
    primaryNote: "Rakuten Employee Referral Campaign. Registration, activation, and Rakuten Link call requirements apply.",
    finalDescription: "Check the eligibility and point schedule, then sign in with your Rakuten ID through the referral link to apply.",
    floatingButton: "Check the offer",
    updatedLabel: "Information checked",
    updatedSeparator: ": ",
  },
  footer: {
    operatorNotice: "This independently operated website is not an official website of any carrier or listed shop.",
    referralNotice: "This website contains referral links. Check the official website for current terms and shop information before applying.",
  },
} satisfies SiteMessages;
