import Airtable from "airtable";
import { getTable } from "./airtable";
import type { Product, ProductPatch, Section } from "../_types/product";

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string")
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function parseProduct(id: string, fields: Record<string, unknown>): Product {
  return {
    id,
    handle: String(fields.handle ?? ""),
    section: (fields.section as Section) ?? "Gemstone",
    title: String(fields.title ?? ""),
    description: String(fields.description ?? ""),
    type: String(fields.type ?? ""),
    tags: parseTags(fields.tags),
    materials: Array.isArray(fields.materials)
      ? (fields.materials as string[])
      : String(fields.materials ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    primaryImage: String(fields.primaryImage ?? ""),
    thumbs: String(fields.thumbs ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean),
    order: Number(fields.order ?? 0),
  };
}

export async function listProducts(): Promise<Product[]> {
  const table = getTable();
  const records = await table
    .select({ sort: [{ field: "order", direction: "asc" }] })
    .all();
  return records.map((r) =>
    parseProduct(r.id, r.fields as Record<string, unknown>)
  );
}

export async function updateProduct(
  handle: string,
  patch: ProductPatch
): Promise<Product> {
  const table = getTable();
  const records = await table
    .select({ filterByFormula: `{handle} = "${handle}"`, maxRecords: 1 })
    .firstPage();

  if (!records.length) throw new Error(`Product not found: ${handle}`);

  type EditableFields = {
    title?: string;
    description?: string;
    type?: string;
    tags?: string[];
    materials?: string;
  };
  const fields: EditableFields = {};
  if (patch.title !== undefined) fields.title = patch.title;
  if (patch.description !== undefined) fields.description = patch.description;
  if (patch.type !== undefined) fields.type = patch.type;
  if (patch.materials !== undefined) {
    fields.materials = Array.isArray(patch.materials)
      ? patch.materials.join(", ")
      : patch.materials as unknown as string;
  }
  if (patch.tags !== undefined)
    fields.tags = Array.isArray(patch.tags)
      ? patch.tags
      : patch.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const updated = await table.update(
    records[0].id,
    fields as Airtable.FieldSet
  );
  return parseProduct(updated.id, updated.fields as Record<string, unknown>);
}
