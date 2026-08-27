import { ja } from "./ja.ts";
import { vi } from "./vi.ts";
import { en } from "./en.ts";
import { zh } from "./zh.ts";
import { ko } from "./ko.ts";
import { pt } from "./pt.ts";
import type { SiteMessages } from "./types.ts";
import type { Locale } from "../config/site.ts";

const dictionaries = { ja, vi, en, zh, ko, pt } satisfies Record<Locale, SiteMessages>;

export function getMessages(locale: Locale): SiteMessages {
  return dictionaries[locale];
}
