export type Feature = {
  icon: string;
  title: string;
  lines?: string[];
};
export const SAMPLE_FEATURES: Feature[] = [
  {
    icon: "/images/go-green/icons/solar.png",
    title: "Certified Surgeons",
    lines: ["แพทย์ศัลยกรรมเฉพาะทาง", "มาตรฐานสากล"],
  },
  {
    icon: "/images/go-green/icons/energy.png",
    title: "Modern Equipment",
    lines: ["เครื่องมือทันสมัย", "ได้มาตรฐานสากล"],
  },
  {
    icon: "/images/go-green/icons/co2.png",
    title: "Safety First",
    lines: ["ความปลอดภัยสูงสุด", "มาตรฐานโรงพยาบาล"],
  },
  {
    icon: "/images/go-green/icons/tree.png",
    title: "1:1 Consultation",
    lines: ["ปรึกษาแบบ 1:1", "กับแพทย์โดยตรง"],
  },
  {
    icon: "/images/go-green/icons/truck_1.png",
    title: "Aftercare Support",
    lines: ["ดูแลหลังผ่าตัด", "ติดตามตลอดการรักษา"],
  },
  {
    icon: "/images/go-green/icons/property-document_14001_1.png",
    title: "Licensed Clinic",
    lines: ["ได้รับอนุญาตถูกต้อง", "ฆสพ.สบส : ๔๖๒๗ / ๒๕๖๘"],
  },
];
