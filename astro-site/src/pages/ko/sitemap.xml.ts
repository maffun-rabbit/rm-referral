import type { APIRoute } from "astro";
import { loadKoreanSitemap } from "../../data/load-korean-pages";

export const GET: APIRoute = () => new Response(loadKoreanSitemap(), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
