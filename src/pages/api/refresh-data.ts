import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";
import { writeJSON } from "@/lib/data-utils";
import type { Product, Merch } from "@/types";

type Language = "en_US" | "es_ES" | "ja_JP";

async function refreshProducts() {
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
    const description = product.description_sale as Record<Language, string> | null;
    const category = product.product_category?.name.toLowerCase() || "all";
    const bom = product.mrpBoms?.[0];
    const materials =
      bom?.bom_lines?.map((line) => {
        const compName = line.product_product?.product_template?.name as Record<Language, string> | null;
        return {
          productId: line.product_product?.product_tmpl_id?.toString(),
          nameES: compName?.es_ES || Object.values(compName || {})[0] || "",
          nameJP: compName?.ja_JP || Object.values(compName || {})[0] || "",
          quantity: Number(line.product_qty || 1),
        };
      })?.filter((m) => {
        const n = m.nameES.toLowerCase();
        return n !== "aceite" && n !== "azúcar";
      }) ?? [];

    return {
      id: product.id.toString(),
      nameES: name.es_ES || Object.values(name)[0] || "Producto",
      nameJP: name.ja_JP || Object.values(name)[0] || "商品",
      price: Number(product.list_price) || 0,
      rating: 0,
      category,
      image: `/images/products/${product.id}.webp`,
      description: description?.es_ES ?? "",
      materials,
    };
  });

  await writeJSON<Product>("products.json", formattedProducts);

  return formattedProducts.length;
}

async function refreshMerchs() {
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
      image: `/images/merchs/${merch.id}.webp`,
    };
  });

  await writeJSON<Merch>("merchs.json", formattedProducts);

  return formattedProducts.length;
}

export const POST: APIRoute = async () => {
  try {
    const productsCount = await refreshProducts();
    const merchsCount = await refreshMerchs();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Data actualizado correctamente",
        updated: {
          products: productsCount,
          merchs: merchsCount,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error actualizando datos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
