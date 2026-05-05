"use client";

import { useState } from "react";
import axios from "axios";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { CircleNotch } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const ALL_TAGS = [
  "Rings", "Earrings", "Necklaces", "Bracelets", "Pendants",
  "Personalised", "Engraving", "Name Necklaces",
  "Gems", "Circle Gem", "Tear Set", "Green Pearl",
  "For Him", "Gifting",
];

interface TagsSelectorProps {
  handle: string;
  value: string[];
  editing: boolean;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

export function TagsSelector({
  handle,
  value,
  editing,
  onSaveStart,
  onSaveEnd,
}: TagsSelectorProps) {
  const [current, setCurrent] = useState<string[]>(value);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayTags = current.filter((t) => t !== "All Products");

  async function toggle(tag: string) {
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setCurrent(next);
    setSaving(true);
    onSaveStart?.();
    try {
      await axios.patch(`/api/products/${handle}`, { tags: next });
    } finally {
      setSaving(false);
      onSaveEnd?.();
    }
  }

  async function remove(tag: string, e: React.MouseEvent) {
    e.stopPropagation();
    await toggle(tag);
  }

  if (!editing) {
    if (!displayTags.length)
      return <p className="font-sans text-[11px] text-ink-300">—</p>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {displayTags.map((t) => (
          <span
            key={t}
            className="font-sans text-[10px] tracking-wide text-ink-500 bg-tag-bg px-2 py-0.5 rounded-full"
          >
            {t}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full min-h-9 px-3 py-2 rounded-lg border border-border bg-surface-card font-sans text-sm cursor-pointer transition-colors hover:border-gold-300",
              open && "border-gold-400 ring-1 ring-gold-300/50"
            )}
          >
            <span className="flex flex-wrap gap-1.5 flex-1 text-left">
              {displayTags.length ? (
                displayTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wide bg-ink-900 text-gold-300 px-2 py-0.5 rounded-full"
                  >
                    {t}
                    <button
                      onClick={(e) => remove(t, e)}
                      className="hover:text-white cursor-pointer"
                    >
                      <X size={9} strokeWidth={2.5} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-ink-300">Select tags…</span>
              )}
            </span>
            <ChevronsUpDown size={14} className="text-ink-300 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 shadow-lg" align="start">
          <Command>
            <CommandInput placeholder="Search tags…" className="font-sans text-sm" />
            <CommandList>
              <CommandEmpty className="font-sans text-sm text-ink-400">No tags found.</CommandEmpty>
              <CommandGroup>
                {ALL_TAGS.map((tag) => {
                  const selected = current.includes(tag);
                  return (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => toggle(tag)}
                      className="font-sans text-sm cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          selected
                            ? "bg-ink-900 border-ink-900"
                            : "border-border"
                        )}
                      >
                        {selected && <Check size={10} strokeWidth={3} className="text-gold-300" />}
                      </div>
                      {tag}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {saving && (
        <div className="flex items-center gap-1.5">
          <CircleNotch size={11} className="text-ink-300 animate-spin" />
          <span className="font-sans text-[10px] text-ink-300">Saving</span>
        </div>
      )}
    </div>
  );
}
