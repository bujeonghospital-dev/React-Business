import ScaledCanvas from "../../components/ScaledCanvas";
import GoGreenSection from "./GoGreenSection";

export default function Page() {
  return (
    <ScaledCanvas>
      <GoGreenSection
        title={`" ขับเคลื่อนการเติบโตอย่างยั่งยืน เพื่อธุรกิจ สังคม และโลกใบนี้ "`}
        imageFit="cover"
        textFirstOnMobile={false}
        imagePosition="left"
      />
    </ScaledCanvas>
  );
}
