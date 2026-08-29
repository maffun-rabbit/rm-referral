import type { APIRoute } from "astro";
import { loadEnglishSitemap } from "../../data/load-english-pages";

export const GET: APIRoute = () => new Response(loadEnglishSitemap(), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
