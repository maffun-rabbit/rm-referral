import {getIncludePath} from '../scripts/locale-mapping.mjs';
import {transformHeaderInclude} from '../scripts/promotion-edge-response.mjs';

export const PILOT_PATHNAME = "/guide/rakuten-mobile-three-features/";

export function approvedPathname(env) {
  const value = env.APPROVED_PROMOTION_PATHNAME ?? "";
  if (!value) return null;
  if (typeof value !== "string" || !value.startsWith("/") || !value.endsWith("/") || value.includes("%") || value.includes("\\") || value.includes("//") || value.includes("/../") || value.includes("/./")) return null;
  return value;
}

export function isApprovedPathname(pathname, env) {
  if (pathname === PILOT_PATHNAME && (env.LOCALE ?? "ja") === "ja") return true;
  return pathname === approvedPathname(env);
}

export class IncludeHandler {
  constructor(request, assets, locale = "ja") {
    this.request = request;
    this.assets = assets;
    this.locale = locale;
  }

  async element(element) {
    const src = element.getAttribute("src");
    const locale = this.locale;
    const headerPath = getIncludePath(locale, 'header');
    const footerPath = getIncludePath(locale, 'footer');
    if (src !== headerPath && src !== footerPath) return;

    try {
      const includeUrl = new URL(src, this.request.url);
      const response = await this.assets.fetch(new Request(includeUrl, { headers: this.request.headers }));
      if (!response.ok) return;
      const html = await response.text();
      if (!html.trim()) return;
      if (src === headerPath) {
        const pathname = new URL(this.request.url).pathname;
        const locales = new Set((element.getAttribute('data-locales') || 'ja').split(','));
        const label = element.getAttribute('data-header-label');
        const header = transformHeaderInclude({html,locale,pathname,publicationLocales:[...locales],label});
        element.replace(header, { html: true });
      } else {
        element.replace(html, { html: true });
      }
    } catch {
      // Leave the element and its fallback children untouched.
    }
  }
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const contentType = response.headers.get("content-type") ?? "";

    if (
      request.method !== "GET" && request.method !== "HEAD" ||
      !isApprovedPathname(url.pathname, env) ||
      !response.ok ||
      !contentType.toLowerCase().includes("text/html") ||
      request.method === "HEAD"
    ) {
      return response;
    }

    return new HTMLRewriter()
      .on("rm-include[src]", new IncludeHandler(request, env.ASSETS, env.LOCALE ?? "ja"))
      .transform(response);
  },
};
