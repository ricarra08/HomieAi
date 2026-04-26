"use client";

import { motion } from "motion/react";

export function PainPoint({
  stat,
  description,
  delay,
}: {
  stat: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl border border-border shadow-sm p-6 text-center"
    >
      <p className="text-3xl font-semibold text-accent">{stat}</p>
      <p className="text-base text-muted-foreground mt-2">{description}</p>
    </motion.div>
  );
}
