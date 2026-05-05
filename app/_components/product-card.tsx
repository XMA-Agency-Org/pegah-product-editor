"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PencilSimple, Check } from "@phosphor-icons/react";
import type { Product } from "@/app/_types/product";
import { EditableField } from "./editable-field";
import { TypeSelector } from "./type-selector";
import { TagsSelector } from "./tags-selector";
import { MaterialsSelector } from "./materials-selector";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { handle, title, description, type, tags, materials, primaryImage, thumbs } = product;
  const [editing, setEditing] = useState(false);
  const [activeImage, setActiveImage] = useState(primaryImage);
  const [saving, setSaving] = useState(0);

  const isSaving = saving > 0;

  return (
    <motion.article
      layout
      animate={
        editing
          ? { boxShadow: "0 0 0 2px oklch(73% 0.13 78)" }
          : { boxShadow: "0 1px 3px oklch(0% 0 0 / 0.06), 0 0 0 1px oklch(92% 0.01 75)" }
      }
      transition={{ duration: 0.18 }}
      className="bg-surface-card rounded-xl flex flex-col"
    >
      <ImageGallery
        active={activeImage}
        thumbs={thumbs}
        title={title}
        onThumbClick={setActiveImage}
      />

      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* Title — always full width */}
        <EditableField
          handle={handle}
          field="title"
          value={title}
          editing={editing}
          placeholder="Product title"
          className="text-[15px] font-normal text-ink-900 leading-snug"
          onSaveStart={() => setSaving((n) => n + 1)}
          onSaveEnd={() => setSaving((n) => n - 1)}
        />

        {/* Type — badge when reading, pills when editing */}
        <TypeSelector
          handle={handle}
          value={type}
          editing={editing}
          onSaveStart={() => setSaving((n) => n + 1)}
          onSaveEnd={() => setSaving((n) => n - 1)}
        />

        {/* Description */}
        <EditableField
          handle={handle}
          field="description"
          value={description}
          editing={editing}
          placeholder="Product description"
          as="p"
          className="font-sans text-sm text-ink-500 leading-relaxed"
          onSaveStart={() => setSaving((n) => n + 1)}
          onSaveEnd={() => setSaving((n) => n - 1)}
        />

        {/* Materials */}
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-ink-300">
            Materials
          </span>
          <MaterialsSelector
            handle={handle}
            value={materials}
            editing={editing}
            onSaveStart={() => setSaving((n) => n + 1)}
            onSaveEnd={() => setSaving((n) => n - 1)}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-ink-300">
            Tags
          </span>
          <TagsSelector
            handle={handle}
            value={tags}
            editing={editing}
            onSaveStart={() => setSaving((n) => n + 1)}
            onSaveEnd={() => setSaving((n) => n - 1)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border">
          <span className="font-sans text-[10px] text-ink-300 tracking-wide truncate mr-3">
            {handle}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <AnimatePresence>
              {isSaving && (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-sans text-[10px] text-ink-300"
                >
                  Saving…
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => setEditing((e) => !e)}
              className={cn(
                "flex items-center gap-1.5 font-sans text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-[0.97]",
                editing
                  ? "bg-ink-900 text-gold-300 hover:bg-ink-800"
                  : "border border-border text-ink-400 hover:border-gold-300 hover:text-ink-700"
              )}
            >
              {editing ? (
                <>
                  <Check size={11} weight="bold" />
                  Done
                </>
              ) : (
                <>
                  <PencilSimple size={11} />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ImageGallery({
  active,
  thumbs,
  title,
  onThumbClick,
}: {
  active: string;
  thumbs: string[];
  title: string;
  onThumbClick: (src: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-t-xl bg-ink-50">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-ink-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {active ? (
              <Image
                src={active}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 680px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-300 font-sans text-xs">
                No image
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {thumbs.length > 1 && (
        <div className="flex gap-1.5">
          {thumbs.map((src, i) => (
            <button
              key={i}
              onClick={() => onThumbClick(src)}
              className={cn(
                "relative w-11 h-11 rounded-md overflow-hidden border transition-all cursor-pointer active:scale-[0.95] shrink-0",
                src === active
                  ? "border-gold-400 ring-1 ring-gold-300"
                  : "border-border hover:border-ink-300 opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="44px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
