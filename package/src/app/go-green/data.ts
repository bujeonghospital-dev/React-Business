export type Feature = {
  icon: string;
  title: string;
  lines?: string[];
};
export const SAMPLE_FEATURES: Feature[] = [
  {
    icon: "/images/go-green/icons/solar.png",
    title: "Solar Energy",
    lines: ["ประหยัดพลังงานได้", "146,518.4 kWh/ปี"],
  },
  {
    icon: "/images/go-green/icons/energy.png",
    title: "Energy Saving",
    lines: ["ประหยัดค่าไฟฟ้า ", "1,940,575.80 บาท/ปี"],
  },
  {
    icon: "/images/go-green/icons/co2.png",
    title: "GHG Emissions Reduction",
    lines: ["ลดการปล่อยคาร์บอน", "≈ 195 tCO2/ปี"],
  },
  {
    icon: "/images/go-green/icons/tree.png",
    title: "Tree-Planting Equivalent",
    lines: ["เก่ากับการปลูกต้นไม้", "21,667 ต้น"],
  },
  {
    icon: "/images/go-green/icons/truck_1.png",
    title: "Green Transport",
    lines: ["ลดการปล่อย", "ก๊าซคาร์บอนไดออกไซด์และมลภาวะ", "สู่สิ่งแวดล้อม"],
  },
  {
    icon: "/images/go-green/icons/property-document_14001_1.png",
    title: "Green standard",
    lines: ["ปฏิบัติตามมาตรฐานสิ่งแวดล้อม", "ISO 14001"],
  },
];
