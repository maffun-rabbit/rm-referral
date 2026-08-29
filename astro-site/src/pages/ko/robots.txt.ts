import type { APIRoute } from "astro";
import { loadKoreanRobots } from "../../data/load-korean-pages";

export const GET: APIRoute = () => new Response(loadKoreanRobots(), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
