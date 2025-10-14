"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteChangeLoading({
  minDuration = 300,
}: {
  minDuration?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<number | null>(null);
  // track previous route so we don't show on initial mount
  const prevRoute = useRef<string | null>(null);

  const ensureOverlay = () => {
    let el = document.getElementById("route-change-overlay");
    if (!el) {
      el = document.createElement("div");
      el.id = "route-change-overlay";
      Object.assign(el.style, {
        position: "fixed",
        inset: "0",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
        background: "rgba(0,0,0,0.15)",
        zIndex: "9999",
      });
      el.innerHTML = `<div style="padding:12px 16px;border-radius:10px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2);font:500 14px/1.4 system-ui,sans-serif">Loading…</div>`;
      document.body.appendChild(el);
    }
    return el;
  };

  const show = () => {
    const el = ensureOverlay();
    el.style.display = "flex";
  };

  const hide = () => {
    const el = ensureOverlay();
    el.style.display = "none";
  };

  useEffect(() => {
    const current = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;

    // don't show on first render — only when the route actually changes
    if (prevRoute.current === null) {
      prevRoute.current = current;
      return;
    }

    // if route didn't change (rare), do nothing
    if (prevRoute.current === current) return;

    prevRoute.current = current;

    show();

    const startedAt = Date.now();
    const scheduleHide = () => {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(minDuration - elapsed, 0);
      timer.current = window.setTimeout(() => {
        hide();
        timer.current = null;
      }, wait) as unknown as number;
    };

    scheduleHide();

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString(), minDuration]);

  return null;
}
