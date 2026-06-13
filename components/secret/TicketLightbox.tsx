"use client";

import { motion, AnimatePresence } from "framer-motion";

type TicketLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export function TicketLightbox({ open, src, alt, onClose }: TicketLightboxProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md md:p-10"
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-label="Enlarged ticket"
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-accent/40 bg-surface-elevated px-4 py-2 text-sm text-muted hover:text-foreground md:right-8 md:top-8"
          >
            Close ×
          </motion.button>
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[92vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Native img so ticket text stays sharp at full size */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[92vh] w-auto max-w-full rounded-sm object-contain shadow-2xl"
            />
          </motion.div>
          <p className="pointer-events-none absolute bottom-6 text-xs text-muted">
            Pinch or scroll if you need an even closer look
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
