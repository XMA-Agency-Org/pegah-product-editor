import type { Section } from "@/app/_types/product";

const SECTIONS: Section[] = [
  "Engraving",
  "Gemstone",
  "For Him",
  "Name Necklaces",
  "Pearl",
];

export function SectionNav() {
  return (
    <nav className="bg-surface-card border-b border-border px-2 sm:px-4 md:px-8 flex overflow-x-auto scrollbar-none">
      {SECTIONS.map((s) => (
        <a
          key={s}
          href={`#${s.toLowerCase().replace(" ", "-")}`}
          className="font-sans text-[11px] sm:text-xs tracking-[0.1em] uppercase text-ink-400 no-underline px-3 sm:px-5 py-3 sm:py-3.5 border-b-2 border-transparent whitespace-nowrap hover:text-ink-900 hover:border-gold-500 transition-colors"
        >
          {s}
        </a>
      ))}
    </nav>
  );
}
