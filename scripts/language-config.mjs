export const languageConfig = {
  ja: { worker: "rm-referral", config: "wrangler.jsonc", pathPrefix: "" },
  vi: { worker: "rm-referral-vi", config: "wrangler.vi.jsonc", pathPrefix: "vi" },
  en: { worker: "rm-referral-en", config: "wrangler.en.jsonc", pathPrefix: "en" },
  zh: { worker: "rm-referral-zh", config: "wrangler.zh.jsonc", pathPrefix: "zh" },
  ko: { worker: "rm-referral-ko", config: "wrangler.ko.jsonc", pathPrefix: "ko" },
  pt: { worker: "rm-referral-pt", config: "wrangler.pt.jsonc", pathPrefix: "pt" },
};

export const supportedLanguages = Object.keys(languageConfig);

export function requireLanguage(locale) {
  if (!languageConfig[locale]) {
    throw new Error(`Unsupported locale: ${locale}. Choose one of: ${supportedLanguages.join(", ")}`);
  }
  return languageConfig[locale];
}
