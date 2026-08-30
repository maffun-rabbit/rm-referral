import type { APIRoute } from "astro";
import { loadEnglishSitemap } from "../../data/load-english-pages";

export const GET: APIRoute = () => new Response(loadEnglishSitemap().replace("</urlset>", "  <url><loc>https://mnp-navi.jp/en/guide/topics/create-rakuten-id-step-by-step/</loc><lastmod>2026-08-30</lastmod></url>\n</urlset>"), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
