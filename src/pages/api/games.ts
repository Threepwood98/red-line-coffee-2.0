import type { APIRoute } from "astro";
import { GAME_IDS, type Game, type RAWGGame } from "@/types/games";

const RAWG_BASE_URL = "https://api.rawg.io/api/games";
const SGDB_BASE_URL = "https://www.steamgriddb.com/api/v2";

// Caché en memoria
const cache = new Map<string, { data: any; ts: number }>();
const TTL_INFO = 1000 * 60 * 60; // 1 hora para info RAWG
const TTL_COVER = 1000 * 60 * 60 * 24; // 24 horas para portadas SGDB

async function cachedFetch(
  url: string,
  options: RequestInit = {},
  ttl: number,
) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fetch error ${res.status}: ${url}`);

  const data = await res.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
}

async function getCover(gameName: string, sgdbKey: string): Promise<string> {
  const headers = { Authorization: `Bearer ${sgdbKey}` };

  try {
    // 1. Buscar el juego en SGDB por nombre
    const searchData = await cachedFetch(
      `${SGDB_BASE_URL}/search/autocomplete/${encodeURIComponent(gameName)}`,
      { headers },
      TTL_COVER,
    );

    const sgdbGame = searchData?.data?.[0];
    if (!sgdbGame) return "";

    // 2. Obtener portada vertical (box art estilo PS4)
    const gridData = await cachedFetch(
      `${SGDB_BASE_URL}/grids/game/${sgdbGame.id}?dimensions=600x900`,
      { headers },
      TTL_COVER,
    );

    return gridData?.data?.[0]?.url ?? "";
  } catch {
    return "";
  }
}

export const GET: APIRoute = async () => {
  try {
    const rawgKey = import.meta.env.RAWG_API_KEY;
    const sgdbKey = import.meta.env.STEAMGRIDDB_API_KEY;

    if (!rawgKey) {
      return new Response(
        JSON.stringify({ error: "RAWG_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!sgdbKey) {
      return new Response(
        JSON.stringify({ error: "STEAMGRIDDB_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const games = await Promise.all(
      GAME_IDS.map(async (id) => {
        const res = await cachedFetch(
          `${RAWG_BASE_URL}/${id}?key=${rawgKey}`,
          {},
          TTL_INFO,
        ).catch(() => null);

        return res as RAWGGame | null;
      }),
    );

    const validGames = games.filter((g): g is RAWGGame => g !== null);

    const mappedGames: Game[] = await Promise.all(
      validGames.map(async (rawgGame) => ({
        id: rawgGame.id.toString(),
        name: rawgGame.name,
        name_original: rawgGame.name_original,
        description: rawgGame.description,
        released: rawgGame.released ?? "",
        background_image: rawgGame.background_image_additional ?? "",
        background_image_additional: rawgGame.background_image_additional ?? "",
        genres: rawgGame.genres,
        cover: await getCover(rawgGame.name, sgdbKey),
      })),
    ).then((games) => games.sort((a, b) => a.name.localeCompare(b.name)));

    return new Response(JSON.stringify(mappedGames), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch games" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
