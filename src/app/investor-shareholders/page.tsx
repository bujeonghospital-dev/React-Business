import ScaledCanvas from "../../components/ScaledCanvas";
import type { Metadata } from "next";
import ShareholderInfo from "./ShareholderInfo";

export const metadata: Metadata = {
  title: "ข้อมูลผู้ถือหุ้น",
  description: "ข้อมูลผู้ถือหุ้น บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
};

export default function Page() {
  return (
    <ScaledCanvas>
      <ShareholderInfo />
    </ScaledCanvas>
  );
}
