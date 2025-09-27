import ScaledCanvas from "../../components/ScaledCanvas";
import type { Metadata } from "next";
import BoardDirectory from "./BoardDirectory";

export const metadata: Metadata = {
  title: "คณะกรรมการ / ผู้บริหาร ",
  description: "หน้าแสดงคณะกรรมการ / ผู้บริหาร",
};

export default function Page() {
  return <ScaledCanvas><BoardDirectory /></ScaledCanvas>;
}
