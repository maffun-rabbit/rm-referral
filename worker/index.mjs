const GUIDE_PREFIX = "/guide/";

export class IncludeHandler {
  constructor(request, assets) {
    this.request = request;
    this.assets = assets;
  }

  async element(element) {
    const src = element.getAttribute("src");
    if (!src?.startsWith("/_includes/ja/") || !src.endsWith(".html")) return;

    try {
      const includeUrl = new URL(src, this.request.url);
      const response = await this.assets.fetch(new Request(includeUrl, { headers: this.request.headers }));
      if (!response.ok) return;
      const html = await response.text();
      if (!html.trim()) return;
      element.replace(html, { html: true });
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
      !url.pathname.startsWith(GUIDE_PREFIX) ||
      !response.ok ||
      !contentType.toLowerCase().includes("text/html") ||
      request.method === "HEAD"
    ) {
      return response;
    }

    return new HTMLRewriter()
      .on("rm-include[src]", new IncludeHandler(request, env.ASSETS))
      .transform(response);
  },
};
