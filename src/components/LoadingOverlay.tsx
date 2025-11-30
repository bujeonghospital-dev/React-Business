"use client";
import ScaledCanvas from "./ScaledCanvas";
import React from "react";
import { useLoading } from "./LoadingContext";
export default function LoadingOverlay() {
  const { loading: isLoading, suppressLoading } = useLoading();

  // Don't show loading overlay when suppressed (e.g., during file transfers)
  const shouldShow = isLoading && !suppressLoading;

  return (
    <ScaledCanvas>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 transition-opacity ${shouldShow
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}>
        <div className="inline-flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-black/5">
          <span className="size-3 animate-ping rounded-full bg-cyan-500" />
          <span className="text-sm font-medium text-gray-700">Loading…</span>
        </div>
      </div>
    </ScaledCanvas>
  );
}
