"use client";
import { useEffect, useRef } from "react";

// Fades children in when they scroll into view. Content is visible without JS and under reduced motion.
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    el.classList.add("in-view");
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Tag>;
}
