import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

export const GET: APIRoute = async () => {
  const products = await prisma.product_template.findMany({
    where: {
      active: true,
      sale_ok: true,
    },
    select: {
      id: true,
      name: true,
      description_sale: true,
      list_price: true,
      product_product: {
        select: {
          default_code: true,
          barcode: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  });
};
