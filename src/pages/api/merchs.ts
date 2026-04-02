import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

type Language = "en_US" | "es_ES" | "ja_JP";

export const GET: APIRoute = async () => {
  const merchs = await prisma.product_template.findMany({
    where: {
      active: true,
      sale_ok: true,
      product_category: { name: "Merch" },
    },
    include: {
      product_category: true,
      productProducts: {
        where: { active: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedProducts = merchs.map((merch) => {
    const name = (merch.name || {}) as Record<Language, string>;

    return {
      id: merch.id.toString(),
      nameES: name.es_ES || Object.values(name)[0] || "Producto",
      price: Number(merch.list_price) || 0,
    };
  });

  return new Response(JSON.stringify(formattedProducts), {
    headers: { "Content-Type": "application/json" },
  });
};
