// Standalone layout - No TPP branding, no headers, no footers
import "../globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Dashboard",
  description: "Real-time contact management dashboard",
};

const font = localFont({
  src: [
    {
      path: "../../../fonts/Kanit-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    { path: "../../../fonts/Kanit-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head />
      <body className={`min-h-screen antialiased ${font.className}`}>
        <main className="w-full h-full">{children}</main>
      </body>
    </html>
  );
}
