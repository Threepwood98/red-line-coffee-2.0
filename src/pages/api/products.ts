import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

type Language = "en_US" | "es_ES" | "ja_JP";

export const GET: APIRoute = async () => {
  const products = await prisma.product_template.findMany({
    where: {
      active: true,
      sale_ok: true,
      product_category: { complete_name: { startsWith: "FP" } },
    },
    include: {
      product_category: true,
      productProducts: {
        where: { active: true },
      },
      mrpBoms: {
        where: { active: true },
        include: {
          bom_lines: {
            include: {
              product_product: { include: { product_template: true } },
            },
          },
        },
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
    const category = product.product_category?.name.toLowerCase() || "all";
    const bom = product.mrpBoms?.[0];
    const materials =
      bom?.bom_lines?.map((line) => {
        const compName = line.product_product?.product_template?.name as Record<
          Language,
          string
        > | null;

        return {
          productId: line.product_product?.product_tmpl_id?.toString(),
          nameES: compName?.es_ES || Object.values(compName || {})[0] || "",
          nameJP: compName?.ja_JP || Object.values(compName || {})[0] || "",
          quantity: Number(line.product_qty || 1),
        };
      }) ?? [];

    return {
      id: product.id.toString(),
      nameES: name.es_ES || Object.values(name)[0] || "Producto",
      nameJP: name.ja_JP || Object.values(name)[0] || "商品",
      price: Number(product.list_price) || 0,
      rating: 0,
      category,
      description: description?.es_ES ?? "",
      materials,
    };
  });

  return new Response(JSON.stringify(formattedProducts), {
    headers: { "Content-Type": "application/json" },
  });
};
