"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  CHORE_TICKETS,
  CHORE_TICKET_STORAGE_KEY,
} from "@/lib/secret-rewards";

type ChoreTicketsRevealProps = {
  embedded?: boolean;
};

function loadRedeemed(): Set<number> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(CHORE_TICKET_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function saveRedeemed(ids: Set<number>) {
  sessionStorage.setItem(
    CHORE_TICKET_STORAGE_KEY,
    JSON.stringify([...ids])
  );
}

export function ChoreTicketsReveal({ embedded = false }: ChoreTicketsRevealProps) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.2 });
  const [redeemed, setRedeemed] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [activeFan, setActiveFan] = useState<number | null>(null);

  useEffect(() => {
    setRedeemed(loadRedeemed());
    setHydrated(true);
  }, []);

  const redeem = useCallback((num: number) => {
    setRedeemed((prev) => {
      if (prev.has(num)) return prev;
      const next = new Set(prev);
      next.add(num);
      saveRedeemed(next);
      return next;
    });
  }, []);

  const remaining = CHORE_TICKETS.length - redeemed.size;

  return (
    <motion.section
      ref={stageRef}
      className={`relative w-full ${embedded ? "mt-16" : "mt-24"}`}
      aria-label="Chore tickets"
    >
      <div className="mx-auto max-w-4xl px-2 text-center">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <p className="shrink-0 text-xs uppercase tracking-[0.35em] text-accent">
            Your other gift
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </motion.div>

        <motion.h2
          className={`mt-4 font-display text-foreground/95 ${
            embedded ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          Five chore orders
        </motion.h2>

        <motion.p
          className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted md:text-base"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Official vouchers to order me to do chores — five times, no expiry, your
          rules. Tap a ticket when you&apos;re ready to cash one in.
        </motion.p>

        {hydrated && (
          <motion.p
            className="mt-4 text-sm text-accent/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {remaining === 0
              ? "All five claimed — I'm on duty ♥"
              : `${remaining} ticket${remaining === 1 ? "" : "s"} left to use`}
          </motion.p>
        )}
      </div>

      {/* Fan on desktop, stack grid on mobile */}
      <div className="relative mx-auto mt-10 max-w-5xl px-4 pb-8">
        <div className="hidden min-h-[320px] items-end justify-center md:flex">
          {CHORE_TICKETS.map((ticket, i) => {
            const used = redeemed.has(ticket.number);
            const center = (CHORE_TICKETS.length - 1) / 2;
            const offset = i - center;
            const isHovered = activeFan === ticket.number;

            return (
              <motion.button
                key={ticket.number}
                type="button"
                disabled={used}
                onClick={() => !used && redeem(ticket.number)}
                onMouseEnter={() => setActiveFan(ticket.number)}
                onMouseLeave={() => setActiveFan(null)}
                initial={{ opacity: 0, y: 40, rotate: offset * 6 }}
                animate={
                  inView
                    ? {
                        opacity: used ? 0.45 : 1,
                        y: isHovered && !used ? -24 : 0,
                        rotate: isHovered && !used ? 0 : offset * 5,
                        scale: isHovered && !used ? 1.06 : 1,
                      }
                    : {}
                }
                transition={{
                  delay: 0.4 + i * 0.08,
                  duration: reducedMotion ? 0.15 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative mx-[-12px] w-[168px] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  used ? "cursor-default" : "cursor-pointer"
                }`}
                style={{ zIndex: isHovered ? 30 : 10 + i }}
                aria-label={
                  used
                    ? `Chore ticket ${ticket.number} — already used`
                    : `Chore ticket ${ticket.number} — tap to redeem`
                }
              >
                <ChoreTicketCard ticket={ticket} used={used} />
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
          {CHORE_TICKETS.map((ticket, i) => {
            const used = redeemed.has(ticket.number);
            return (
              <motion.button
                key={ticket.number}
                type="button"
                disabled={used}
                onClick={() => !used && redeem(ticket.number)}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: used ? 0.5 : 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                className={`w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  used ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <ChoreTicketCard ticket={ticket} used={used} compact />
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {redeemed.size > 0 && redeemed.size < CHORE_TICKETS.length && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-muted"
          >
            Tear them off one at a time — I&apos;ll do the chore you ask for.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ChoreTicketCard({
  ticket,
  used,
  compact = false,
}: {
  ticket: { number: number; label: string };
  used: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border-2 border-dashed bg-gradient-to-br from-[#fff9f5] via-[#fff5f8] to-[#fdeef3] text-left shadow-lg transition ${
        used
          ? "border-muted/30 opacity-80"
          : "border-accent/50 shadow-[0_8px_32px_rgba(232,160,180,0.25)]"
      } ${compact ? "p-4" : "p-5"}`}
    >
      {used && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40"
          aria-hidden
        >
          <span className="rotate-[-12deg] rounded border-2 border-accent/60 bg-background/90 px-4 py-1 font-display text-lg uppercase tracking-widest text-accent">
            Redeemed
          </span>
        </div>
      )}

      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent/90">
        Official chore order
      </p>
      <p className="mt-2 font-mono text-2xl font-bold text-foreground/90">
        № {ticket.number}
        <span className="text-base font-normal text-muted"> / 5</span>
      </p>

      <div className="my-3 border-t border-dashed border-accent/30" />

      <p className="font-display text-lg leading-snug text-foreground">
        {ticket.label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Present this ticket anytime. One chore per voucher — you choose what
        needs doing.
      </p>

      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted/80">
        Issued with love · 520
      </p>

      {!used && (
        <p className="mt-3 text-center text-xs text-accent">
          {compact ? "Tap to redeem" : "Tap to tear off & order a chore"}
        </p>
      )}
    </div>
  );
}
