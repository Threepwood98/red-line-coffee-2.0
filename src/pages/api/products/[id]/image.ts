import { prisma } from "@/lib/prisma";
import type { APIRoute } from "astro";

const ODOO_BASE_URL = import.meta.env.ODOO_BASE_URL;

export const GET: APIRoute = async ({ params }) => {
  const productId = parseInt(params.id || "");

  if (!productId) {
    return new Response("Missing product ID", { status: 400 });
  }

  let templateId: number;

  const template = await prisma.product_template.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (template) {
    templateId = template.id;
  } else {
    const product = await prisma.product_product.findUnique({
      where: { id: productId },
      select: { product_tmpl_id: true },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    templateId = product.product_tmpl_id;
  }

  const attachment = await prisma.ir_attachment.findFirst({
    where: {
      res_model: "product.template",
      res_field: "image_256",
      res_id: templateId,
    },
    select: {
      id: true,
      mimetype: true,
    },
  });

  if (!attachment) {
    return new Response("Image not found", { status: 404 });
  }

  const odooImageUrl = `${ODOO_BASE_URL}/web/image/ir.attachment/${attachment.id}/raw`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: odooImageUrl,
      "Cache-Control": "public, max-age=86400",
    },
  });
};
