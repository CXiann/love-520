"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
};

export function Section({
  id,
  children,
  className = "",
  fullHeight = true,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      className={`section-snap relative w-full px-6 py-20 md:px-12 md:py-28 ${
        fullHeight ? "min-h-screen flex flex-col justify-center" : ""
      } ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
