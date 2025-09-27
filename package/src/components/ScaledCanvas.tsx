"use client";
import React from "react";

/* Emergency safe mode: temporarily render children unchanged to stop layout break.
   After stabilizing, replace with a single top-level scaled implementation (in app/layout)
   or a portal-based client-only scaler. */
export default function ScaledCanvas({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
