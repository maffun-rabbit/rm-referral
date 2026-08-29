import type { APIRoute } from "astro";
import { loadChineseRobots } from "../../data/load-chinese-pages";

export const GET: APIRoute = () => new Response(loadChineseRobots(), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
