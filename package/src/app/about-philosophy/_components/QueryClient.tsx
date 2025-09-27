"use client";
import ScaledCanvas from "../../../components/ScaledCanvas";
import { useSearchParams } from "next/navigation";

export default function QueryClient() {
  const sp = useSearchParams();
  const tab = sp.get("tab") ?? "overview";
  return (
    <ScaledCanvas>
      <div data-tab={tab} />
    </ScaledCanvas>
  );
}
