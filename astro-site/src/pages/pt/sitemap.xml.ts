import type { APIRoute } from "astro";
import { loadPortugueseSitemap } from "../../data/load-portuguese-pages";
export const GET: APIRoute = () => new Response(loadPortugueseSitemap(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
