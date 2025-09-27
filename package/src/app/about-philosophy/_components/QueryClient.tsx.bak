"use client";
import { useSearchParams } from "next/navigation";

export default function QueryClient() {
  const sp = useSearchParams();
  const tab = sp.get("tab") ?? "overview";
  return <div data-tab={tab} />;
}
