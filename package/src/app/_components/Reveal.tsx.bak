// app/_components/Reveal.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type CSSProperties,
} from "react";

type BaseProps = {
  children?: React.ReactNode;
  delay?: number; // ms
  y?: number; // px slide up
  once?: boolean; // show once
  className?: string;
  threshold?: number; // 0..1
  style?: CSSProperties;
};

type RevealProps<T extends ElementType = "div"> = BaseProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof BaseProps | "as" | "ref"> & {
    as?: T;
  };

export default function Reveal<T extends ElementType = "div">(
  props: RevealProps<T>
) {
  const {
    as,
    children,
    delay = 0,
    y = 16,
    once = true,
    className,
    threshold = 0.2,
    style,
    ...rest
  } = props;

  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  const mergedStyle: CSSProperties = {
    ...style,
    transitionDelay: shown ? `${delay}ms` : undefined,
    transform: shown ? "translateY(0)" : `translateY(${y}px)`,
  };

  const base =
    "will-change-[opacity,transform] transform-gpu motion-safe:transition motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";
  const hidden = "motion-safe:opacity-0";
  const visible = "opacity-100";

  return (
    <Tag
      {...(rest as any)}
      ref={ref as unknown as React.Ref<any>}
      style={mergedStyle}
      className={`${base} ${shown ? visible : hidden} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
