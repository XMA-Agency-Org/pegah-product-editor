"use client";

import { useState } from "react";
import axios from "axios";
import { CircleNotch, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = ["Ring", "Earring", "Necklace", "Bracelet"];

interface TypeSelectorProps {
  handle: string;
  value: string;
  editing: boolean;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

export function TypeSelector({
  handle,
  value,
  editing,
  onSaveStart,
  onSaveEnd,
}: TypeSelectorProps) {
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function select(option: string) {
    if (option === current) return;
    setCurrent(option);
    setSaving(true);
    onSaveStart?.();
    try {
      await axios.patch(`/api/products/${handle}`, { type: option });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
      onSaveEnd?.();
    }
  }

  if (!editing) {
    return (
      <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-ink-500 bg-tag-bg px-2.5 py-1 rounded-full shrink-0">
        {current || "—"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => select(opt)}
          className={cn(
            "font-sans text-[10px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border transition-all cursor-pointer active:scale-[0.96]",
            current === opt
              ? "bg-ink-900 text-gold-300 border-ink-900"
              : "border-border text-ink-400 hover:border-ink-300 hover:text-ink-700"
          )}
        >
          {opt}
        </button>
      ))}
      {saving && (
        <CircleNotch size={12} className="text-ink-300 animate-spin ml-1" />
      )}
      {saved && !saving && (
        <Check size={12} className="text-gold-500 ml-1" />
      )}
    </div>
  );
}
