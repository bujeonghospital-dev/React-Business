import "../globals.css";
import "./fullscreen.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Data - TPP",
};

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fullscreen-layout">{children}</div>;
}
