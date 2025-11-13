import Subsidiaries from "./subsidiaries";
import ScaledCanvas from "../../components/ScaledCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "บริษัทในเครือ",
  description: "บริษัทในเครือ",
};
export default function Page() {
  return (
    <ScaledCanvas>
      <Subsidiaries />
    </ScaledCanvas>
  );
}
