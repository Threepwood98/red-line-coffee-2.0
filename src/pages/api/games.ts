import type { APIRoute } from "astro";
import { readJSON } from "@/lib/data-utils";
import type { Game } from "@/types/games";

export const GET: APIRoute = async () => {
  const games = await readJSON<Game>("games.json");
  return new Response(JSON.stringify(games), {
    headers: { "Content-Type": "application/json" },
  });
};
