import Airtable from "airtable";

const AIRTABLE_PAT = process.env.AIRTABLE_PAT!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE ?? "Table 1";

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID");
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE);

const METALS = [
  "sterling silver", "white gold", "rose gold", "yellow gold",
  "18k gold", "14k gold", "platinum", "titanium", "brass", "bronze",
  "gold", "silver",
];

const STONES = [
  "tahitian pearl", "blue topaz", "diamond", "ruby", "emerald", "sapphire",
  "topaz", "citrine", "peridot", "tourmaline", "pearl", "opal",
  "amethyst", "aquamarine", "garnet", "onyx", "enamel",
];

const STYLES = [
  "cubic zirconia", "cz", "moissanite", "mother of pearl",
];

function extractMaterials(description: string): string {
  const text = description.toLowerCase();
  const found = new Set<string>();

  for (const metal of METALS) {
    if (text.includes(metal)) found.add(metal);
  }

  for (const stone of STONES) {
    if (text.includes(stone)) found.add(stone);
  }

  for (const style of STYLES) {
    if (text.includes(style)) found.add(style);
  }

  if (found.size === 0) return "";

  const arr = Array.from(found);
  const deduped = arr.filter(
    (s) => !arr.some((other) => other !== s && other.includes(s))
  );

  return deduped
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");
}

const records = await table.select({ fields: ["handle", "description", "materials"] }).all();

const toUpdate: { id: string; fields: Airtable.FieldSet }[] = [];

for (const r of records) {
  const desc = String(r.fields.description ?? "");
  const existing = String(r.fields.materials ?? "");
  // always re-extract to update with cleaner deduped version
  const materials = extractMaterials(desc);
  if (materials) {
    console.log(`${r.fields.handle}: ${materials}`);
    toUpdate.push({ id: r.id, fields: { materials } });
  } else {
    console.log(`${r.fields.handle}: (no match)`);
  }
}

for (let i = 0; i < toUpdate.length; i += 10) {
  await table.update(toUpdate.slice(i, i + 10));
}

console.log(`\nUpdated ${toUpdate.length} records.`);
