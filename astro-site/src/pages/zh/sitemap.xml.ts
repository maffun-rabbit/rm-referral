import type { APIRoute } from "astro";
import { loadChineseSitemap } from "../../data/load-chinese-pages";

export const GET: APIRoute = () => new Response(loadChineseSitemap(), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
