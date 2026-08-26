import { ja } from "./ja";
import { vi } from "./vi";
import type { SiteMessages } from "./types";
import type { Locale } from "../config/site";

const dictionaries = { ja, vi } satisfies Record<Locale, SiteMessages>;

export function getMessages(locale: Locale): SiteMessages {
  return dictionaries[locale];
}
