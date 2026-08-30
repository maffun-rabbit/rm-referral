import type { APIRoute } from "astro";
import { loadVietnameseSitemap } from "../../data/load-vietnamese-pages";

export const GET: APIRoute = () => new Response(loadVietnameseSitemap().replace("</urlset>", "  <url><loc>https://mnp-navi.jp/vi/guide/topics/create-rakuten-id-step-by-step/</loc><lastmod>2026-08-30</lastmod></url>\n</urlset>"), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
