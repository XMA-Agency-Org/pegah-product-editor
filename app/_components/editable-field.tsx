"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { CircleNotch, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  handle: string;
  field: "title" | "description" | "materials";
  value: string;
  editing: boolean;
  placeholder?: string;
  className?: string;
  as?: "div" | "span" | "p";
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

export function EditableField({
  handle,
  field,
  value,
  editing,
  placeholder,
  className,
  as: Tag = "div",
  onSaveStart,
  onSaveEnd,
}: EditableFieldProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(e: React.FormEvent<HTMLElement>) {
    if (!editing) return;
    const text = (e.currentTarget as HTMLElement).innerText;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setError(false);
      onSaveStart?.();
      try {
        await axios.patch(`/api/products/${handle}`, { [field]: text });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch {
        setError(true);
      } finally {
        setSaving(false);
        onSaveEnd?.();
      }
    }, 800);
  }

  return (
    <div className="relative w-full">
      <Tag
        contentEditable={editing}
        suppressContentEditableWarning
        onInput={handleInput}
        className={cn(
          "outline-none w-full block transition-colors",
          editing && "border-b border-gold-300 pb-0.5 cursor-text",
          editing && !value && "empty:before:content-[attr(data-placeholder)] before:text-ink-300",
          error && "border-b border-red-300",
          className
        )}
        {...(placeholder ? { "data-placeholder": placeholder } : {})}
      >
        {value}
      </Tag>
      {editing && (saving || saved) && (
        <span className="absolute right-0 top-0">
          {saving && <CircleNotch size={11} className="text-ink-300 animate-spin" />}
          {saved && !saving && <Check size={11} className="text-gold-500" />}
        </span>
      )}
    </div>
  );
}
