export type Section =
  | "Engraving"
  | "Gemstone"
  | "For Him"
  | "Name Necklaces"
  | "Pearl";

export interface Product {
  id: string;
  handle: string;
  section: Section;
  title: string;
  description: string;
  type: string;
  tags: string[];
  materials: string[];
  primaryImage: string;
  thumbs: string[];
  order: number;
}

export type ProductPatch = Partial<
  Pick<Product, "title" | "description" | "type" | "tags" | "materials">
>;
