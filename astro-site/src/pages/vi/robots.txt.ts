import type { APIRoute } from "astro";
import { loadVietnameseRobots } from "../../data/load-vietnamese-pages";

export const GET: APIRoute = () => new Response(loadVietnameseRobots(), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
