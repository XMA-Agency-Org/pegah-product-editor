import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/app/_lib/products";
import type { ProductPatch } from "@/app/_types/product";

const ALLOWED_FIELDS = new Set(["title", "description", "type", "tags", "materials"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const body = await req.json();

  const patch: ProductPatch = {};
  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(key)) {
      return NextResponse.json({ error: `Field "${key}" not editable` }, { status: 400 });
    }
    (patch as Record<string, unknown>)[key] = body[key];
  }

  try {
    const updated = await updateProduct(handle, patch);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isNotFound = message.startsWith("Product not found");
    const detail = err instanceof Error ? { message: err.message, stack: err.stack, cause: (err as any).cause } : err;
    console.error(`[PATCH /api/products/${handle}]`, detail);
    return NextResponse.json({ error: message, detail }, { status: isNotFound ? 404 : 500 });
  }
}
