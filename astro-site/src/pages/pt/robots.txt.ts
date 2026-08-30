import type { APIRoute } from "astro";
import { loadPortugueseRobots } from "../../data/load-portuguese-pages";
export const GET: APIRoute = () => new Response(loadPortugueseRobots(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
