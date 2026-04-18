"use client";

import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function useVerbCycle(words: string[], intervalMs = 2200) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("in");
      }, 380);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, reduced]);

  return { word: words[index], phase };
}

export function useCountUp(target: number, durationMs = 1400, startDelayMs = 0) {
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const begin = (t: number) => {
      start = t;
      raf = requestAnimationFrame(step);
    };
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const delay = setTimeout(() => {
      raf = requestAnimationFrame(begin);
    }, startDelayMs);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, startDelayMs, reduced]);

  return value;
}

export function useLiveTicker(
  enabled: boolean,
  onTick: () => void,
  minMs = 8000,
  maxMs = 14000
) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      timer = setTimeout(() => {
        onTickRef.current();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [enabled, minMs, maxMs]);
}
