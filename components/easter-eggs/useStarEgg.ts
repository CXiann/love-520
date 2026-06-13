"use client";

import { useEffect, useRef, useState } from "react";
import { useEasterEgg } from "./EasterEggProvider";

const STAR_TARGET = 5;
const STORAGE_KEY = "love520_egg_stars";
const OPENING_SECTION_ID = "opening";

export function useStarEgg(message: string) {
  const { showToast } = useEasterEgg();
  const [clicks, setClicks] = useState(0);
  const [hasFound, setHasFound] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayVisibleRef = useRef(false);
  const completingRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setHasFound(true);
    }
  }, []);

  useEffect(() => {
    overlayVisibleRef.current = showOverlay;
  }, [showOverlay]);

  useEffect(() => {
    const el = document.getElementById(OPENING_SECTION_ID);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && overlayVisibleRef.current) {
          setShowOverlay(false);
        }
      },
      { threshold: 0.15, rootMargin: "-10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (clicks < STAR_TARGET || hasFound || completingRef.current) return;

    completingRef.current = true;
    sessionStorage.setItem(STORAGE_KEY, "1");
    setHasFound(true);
    setShowOverlay(true);
    showToast("Every little heart remembers us ♥");
  }, [clicks, hasFound, showToast]);

  function onStarClick() {
    if (hasFound || completingRef.current) return;
    setClicks((prev) => prev + 1);
  }

  return {
    onStarClick,
    showOverlay,
    message,
    remaining: Math.max(0, STAR_TARGET - clicks),
    showProgress: !hasFound && clicks > 0 && clicks < STAR_TARGET,
  };
}
