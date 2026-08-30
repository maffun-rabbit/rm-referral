import type { APIRoute } from "astro";
import { loadKoreanSitemap } from "../../data/load-korean-pages";

export const GET: APIRoute = () => new Response(loadKoreanSitemap().replace("</urlset>", "  <url><loc>https://mnp-navi.jp/ko/guide/topics/create-rakuten-id-step-by-step/</loc><lastmod>2026-08-30</lastmod></url>\n</urlset>"), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
