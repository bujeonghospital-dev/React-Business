import ScaledCanvas from "../../components/ScaledCanvas";
import GoGreenSection from "./GoGreenSection";
export default function Page() {
  return (
    <ScaledCanvas>
      <GoGreenSection
        title={`" ความงามที่มีมาตรฐาน ปลอดภัย โดยแพทย์เฉพาะทาง "`}
        imageFit="cover"
        textFirstOnMobile={false}
        imagePosition="left"
      />
    </ScaledCanvas>
  );
}
