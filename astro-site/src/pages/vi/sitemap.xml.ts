import type { APIRoute } from "astro";
import { loadVietnameseSitemap } from "../../data/load-vietnamese-pages";

export const GET: APIRoute = () => new Response(loadVietnameseSitemap(), {
  headers: { "Content-Type": "application/xml; charset=utf-8" },
});
