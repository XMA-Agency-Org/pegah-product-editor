import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans text-sm tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-900 text-gold-200 hover:bg-ink-800 px-5 py-2.5 rounded-md",
        ghost:
          "text-ink-500 hover:text-ink-900 px-3 py-1.5",
        outline:
          "border border-border text-ink-700 hover:border-gold-500 hover:text-ink-900 px-5 py-2.5 rounded-md",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props} />
  );
}
