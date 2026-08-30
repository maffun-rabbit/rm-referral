import type { APIRoute } from "astro";
import { loadPortugueseSitemap } from "../../data/load-portuguese-pages";
export const GET: APIRoute = () => new Response(loadPortugueseSitemap().replace("</urlset>", "  <url><loc>https://mnp-navi.jp/pt/guide/topics/create-rakuten-id-step-by-step/</loc><lastmod>2026-08-30</lastmod></url>\n</urlset>"), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
