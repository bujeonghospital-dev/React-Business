"use client";
import ScaledCanvas from "../components/ScaledCanvas";
// package/src/app/providers.tsx
import { LoadingProvider } from "@/components/LoadingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ScaledCanvas>
      <LoadingProvider>{children}</LoadingProvider>
    </ScaledCanvas>
  );
}
