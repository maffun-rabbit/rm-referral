import type { APIRoute } from "astro";
import { loadChineseSitemap } from "../../data/load-chinese-pages";

export const GET: APIRoute = () => new Response(loadChineseSitemap().replace("</urlset>", "  <url><loc>https://mnp-navi.jp/zh/guide/topics/create-rakuten-id-step-by-step/</loc><lastmod>2026-08-30</lastmod></url>\n</urlset>"), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
