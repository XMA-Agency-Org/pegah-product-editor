import fs from "fs";
import path from "path";
import Airtable from "airtable";

const AIRTABLE_PAT = process.env.AIRTABLE_PAT!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE ?? "Products";

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID");
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE);

type Section = "Engraving" | "Gemstone" | "For Him" | "Name Necklaces" | "Pearl";

const SECTION_DIR: Record<Section, string> = {
  Engraving: "engraving",
  Gemstone: "gemstone",
  "For Him": "men",
  "Name Necklaces": "named",
  Pearl: "pearl",
};

const PUBLIC_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../public/product-pictures"
);

function assignSection(tags: string[]): Section {
  if (tags.includes("Engraving") && !tags.includes("Gems")) return "Engraving";
  if (tags.includes("For Him")) return "For Him";
  if (tags.includes("Name Necklaces")) return "Name Necklaces";
  if (tags.includes("Green Pearl")) return "Pearl";
  return "Gemstone";
}

function discoverImages(handle: string): { primary: string; thumbs: string[] } {
  for (const sectionDir of Object.values(SECTION_DIR)) {
    const dir = path.join(PUBLIC_DIR, sectionDir, handle);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort((a, b) => {
        const aProduct = a.includes("-product") ? 0 : 1;
        const bProduct = b.includes("-product") ? 0 : 1;
        return aProduct - bProduct || a.localeCompare(b);
      });

    const urlBase = `/product-pictures/${sectionDir}/${handle}`;
    const urls = files.map((f) => `${urlBase}/${f}`);
    return { primary: urls[0] ?? "", thumbs: urls };
  }
  return { primary: "", thumbs: [] };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

interface ProductRow {
  handle: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
}

function buildProducts(rows: Record<string, string>[]): ProductRow[] {
  const map = new Map<string, ProductRow>();
  for (const row of rows) {
    const handle = row["Handle"];
    if (!handle || map.has(handle)) continue;
    const tags = (row["Tags"] ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    map.set(handle, {
      handle,
      title: row["Title"] ?? "",
      description: stripHtml(row["Body (HTML)"] ?? ""),
      type: row["Type"] ?? "",
      tags,
    });
  }
  return Array.from(map.values());
}

async function upsert(products: ProductRow[]) {
  const existing = await table.select({ fields: ["handle"] }).all();
  const existingHandles = new Map(existing.map((r) => [String(r.fields.handle), r.id]));

  const toCreate: Airtable.FieldSet[] = [];
  const toUpdate: { id: string; fields: Airtable.FieldSet }[] = [];

  products.forEach((p, i) => {
    const section = assignSection(p.tags);
    const { primary, thumbs } = discoverImages(p.handle);

    const fields: Airtable.FieldSet = {
      handle: p.handle,
      section,
      title: p.title,
      description: p.description,
      type: p.type,
      tags: p.tags.filter((t) => t !== "All Products"),
      primaryImage: primary,
      thumbs: thumbs.join("\n"),
      order: i + 1,
    };

    const existingId = existingHandles.get(p.handle);
    if (existingId) {
      toUpdate.push({ id: existingId, fields });
    } else {
      toCreate.push(fields);
    }
  });

  for (let i = 0; i < toCreate.length; i += 10) {
    await table.create(toCreate.slice(i, i + 10).map((f) => ({ fields: f })));
    console.log(`Created ${Math.min(i + 10, toCreate.length)}/${toCreate.length}`);
  }

  for (let i = 0; i < toUpdate.length; i += 10) {
    await table.update(toUpdate.slice(i, i + 10));
    console.log(`Updated ${Math.min(i + 10, toUpdate.length)}/${toUpdate.length}`);
  }

  console.log(`Done. Created: ${toCreate.length}, Updated: ${toUpdate.length}`);
}

const csvPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../docs/shopify-products.csv"
);

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at ${csvPath}`);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(csv);
const products = buildProducts(rows);
console.log(`Parsed ${products.length} products from CSV`);
await upsert(products);
