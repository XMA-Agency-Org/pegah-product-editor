"use client";

import { motion } from "framer-motion";
import React from "react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 22 },
  },
};

export function CatalogGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={cardVariant}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
