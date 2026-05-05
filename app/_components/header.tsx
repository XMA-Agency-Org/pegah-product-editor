export function Header({ productCount }: { productCount: number }) {
  return (
    <header className="bg-ink-950 text-white px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 flex items-start sm:items-end justify-between gap-4 sticky top-0 z-50">
      <span className="font-serif text-2xl sm:text-3xl tracking-[0.18em] uppercase text-gold-300 font-normal">
        Pegah
      </span>
      <div className="font-sans text-[11px] sm:text-xs text-ink-400 tracking-[0.05em] text-right">
        <div>Product Catalog</div>
        <div className="text-ink-500">{productCount} products</div>
      </div>
    </header>
  );
}
