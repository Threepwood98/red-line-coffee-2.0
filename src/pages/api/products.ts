import type { APIRoute } from "astro";
import { readJSON } from "@/lib/data-utils";
import type { Product } from "@/types";

export const GET: APIRoute = async () => {
  const products = await readJSON<Product>("products.json");
  return new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  });
};
