"use client";

import { useEffect, useState, type RefObject } from "react";

export function useChapterInView(ref: RefObject<HTMLElement | null>, threshold = 0.35) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
