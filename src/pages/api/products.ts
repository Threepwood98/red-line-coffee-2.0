import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

type Language = "en_US" | "es_ES" | "ja_JP";
type Category = "coffee" | "drink" | "food" | "sweet";

export const GET: APIRoute = async () => {
  const products = await prisma.product_template.findMany({
    where: {
      active: true,
      sale_ok: true,
    },
    include: {
      product_category: true,
      productProducts: {
        where: { active: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedProducts = products.map((product) => {
    const name = (product.name || {}) as Record<Language, string>;
    const description = product.description_sale as Record<
      Language,
      string
    > | null;
    const category = product.product_category?.name as unknown as Record<
      Language,
      string
    > | null;

    return {
      id: product.id.toString(),
      nameES: name.es_ES || Object.values(name)[0] || "Producto",
      nameJP: name.ja_JP || Object.values(name)[0] || "商品",
      price: Number(product.list_price) || 0,
      rating: 0,
      category: (category?.es_ES?.toLowerCase() as Category) || "general",
      image: "https://picsum.photos/seed/" + product.id + "/400/400",
      description: description?.es_ES
        ? description.es_ES || Object.values(description)[0] || ""
        : "",
    };
  });

  return new Response(JSON.stringify(formattedProducts), {
    headers: { "Content-Type": "application/json" },
  });
};
