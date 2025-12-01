import "../globals.css";
import "./fullscreen.css";
import type { Metadata } from "next";

// Default metadata - will be overridden by page-level metadata
export const metadata: Metadata = {
  title: {
    template: "%s | BJH Bangkok",
    default: "Customer Data - TPP",
  },
};

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fullscreen-layout">{children}</div>;
}
