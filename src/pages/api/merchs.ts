import type { APIRoute } from "astro";
import { readJSON } from "@/lib/data-utils";
import type { Merch } from "@/types";

export const GET: APIRoute = async () => {
  const merchs = await readJSON<Merch>("merchs.json");
  return new Response(JSON.stringify(merchs), {
    headers: { "Content-Type": "application/json" },
  });
};
