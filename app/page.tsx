import { listProducts } from "./_lib/products";
import { Header } from "./_components/header";
import { SectionNav } from "./_components/section-nav";
import { ProductCard } from "./_components/product-card";
import { CatalogGrid } from "./_components/catalog-grid";
import type { Section, Product } from "./_types/product";

const SECTION_ORDER: Section[] = [
  "Engraving",
  "Gemstone",
  "For Him",
  "Name Necklaces",
  "Pearl",
];

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await listProducts();

  const grouped = SECTION_ORDER.reduce<Record<Section, Product[]>>(
    (acc, s) => {
      acc[s] = products.filter((p) => p.section === s);
      return acc;
    },
    {} as Record<Section, Product[]>
  );

  return (
    <>
      <Header productCount={products.length} />
      <SectionNav />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-6 sm:py-10">
        {SECTION_ORDER.map((section) => {
          const items = grouped[section];
          if (!items.length) return null;
          return (
            <section
              key={section}
              id={section.toLowerCase().replace(" ", "-")}
            >
              <div className="mt-10 sm:mt-14 mb-6 sm:mb-8 pb-4 border-b border-border flex items-baseline gap-3">
                <h2 className="text-lg sm:text-[22px] font-normal tracking-[0.06em] uppercase text-ink-900">
                  {section}
                </h2>
                <span className="font-sans text-xs text-ink-400 tracking-[0.05em]">
                  {items.length} products
                </span>
              </div>
              <CatalogGrid>
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </CatalogGrid>
            </section>
          );
        })}
      </main>
    </>
  );
}
