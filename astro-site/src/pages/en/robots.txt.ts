import type { APIRoute } from "astro";
import { loadEnglishRobots } from "../../data/load-english-pages";

export const GET: APIRoute = () => new Response(loadEnglishRobots(), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
