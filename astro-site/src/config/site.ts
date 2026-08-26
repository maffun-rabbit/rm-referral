export const SITE_URLS = {
  ja: "https://rm-referral.maffun.workers.dev",
  vi: "https://rm-referral-vi.maffun.workers.dev",
} as const;

export const REFERRAL_URL = "https://r10.to/hNearm";

export type Locale = keyof typeof SITE_URLS;
