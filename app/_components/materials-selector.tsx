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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const MATERIAL_GROUPS = {
  Metals: [
    "Gold", "Silver", "Sterling Silver", "18k Gold", "14k Gold",
    "Rose Gold", "White Gold", "Yellow Gold", "Platinum",
    "Brushed Gold", "Brushed Silver", "Matte Gold",
  ],
  Stones: [
    "Diamond", "Ruby", "Emerald", "Sapphire", "Blue Topaz", "Topaz",
    "Citrine", "Peridot", "Tourmaline", "Tahitian Pearl", "Pearl",
    "Opal", "Amethyst", "Aquamarine", "Garnet", "Onyx",
  ],
  Finishes: ["Enamel", "Polished", "Brushed", "Hammered"],
};

interface MaterialsSelectorProps {
  handle: string;
  value: string[];
  editing: boolean;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

export function MaterialsSelector({
  handle,
  value,
  editing,
  onSaveStart,
  onSaveEnd,
}: MaterialsSelectorProps) {
  const [current, setCurrent] = useState<string[]>(value);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  async function addCustom() {
    const trimmed = query.trim();
    if (!trimmed || current.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return;
    setQuery("");
    await toggle(trimmed);
  }

  async function toggle(material: string) {
    const next = current.includes(material)
      ? current.filter((m) => m !== material)
      : [...current, material];
    setCurrent(next);
    setSaving(true);
    onSaveStart?.();
    try {
      await axios.patch(`/api/products/${handle}`, {
        materials: next,
      });
    } finally {
      setSaving(false);
      onSaveEnd?.();
    }
  }

  async function remove(material: string, e: React.MouseEvent) {
    e.stopPropagation();
    await toggle(material);
  }

  if (!editing) {
    if (!current.length)
      return <p className="font-sans text-sm text-ink-300">—</p>;
    return (
      <p className="font-sans text-sm text-ink-600">{current.join(", ")}</p>
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
              {current.length ? (
                current.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wide bg-ink-900 text-gold-300 px-2 py-0.5 rounded-full"
                  >
                    {m}
                    <button
                      onClick={(e) => remove(m, e)}
                      className="hover:text-white cursor-pointer"
                    >
                      <X size={9} strokeWidth={2.5} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-ink-300">Select materials…</span>
              )}
            </span>
            <ChevronsUpDown size={14} className="text-ink-300 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0 shadow-lg" align="start">
          <Command>
            <CommandInput
              placeholder="Search or add material…"
              className="font-sans text-sm"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-64">
              <CommandEmpty className="p-0">
                {query.trim() && (
                  <button
                    onClick={addCustom}
                    className="w-full text-left px-3 py-2 font-sans text-sm text-ink-600 hover:bg-accent cursor-pointer"
                  >
                    Add &ldquo;{query.trim()}&rdquo;
                  </button>
                )}
              </CommandEmpty>

              {Object.entries(MATERIAL_GROUPS).map(([group, items], gi) => (
                <div key={group}>
                  {gi > 0 && <CommandSeparator />}
                  <CommandGroup heading={group}>
                    {items.map((mat) => {
                      const selected = current.some(
                        (c) => c.toLowerCase() === mat.toLowerCase()
                      );
                      return (
                        <CommandItem
                          key={mat}
                          value={mat}
                          onSelect={() => toggle(mat)}
                          className="font-sans text-sm cursor-pointer"
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              selected
                                ? "bg-ink-900 border-ink-900"
                                : "border-border"
                            )}
                          >
                            {selected && (
                              <Check size={10} strokeWidth={3} className="text-gold-300" />
                            )}
                          </div>
                          {mat}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </div>
              ))}
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
