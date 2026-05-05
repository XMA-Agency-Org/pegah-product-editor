import Airtable from "airtable";

let _table: Airtable.Table<Airtable.FieldSet> | null = null;

export function getTable() {
  if (!_table) {
    const pat = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    if (!pat || !baseId) {
      throw new Error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID env vars");
    }
    const base = new Airtable({ apiKey: pat }).base(baseId);
    _table = base(process.env.AIRTABLE_TABLE ?? "Products");
  }
  return _table;
}
