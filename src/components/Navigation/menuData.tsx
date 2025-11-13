import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "หน้าหลัก", href: "/#" },

  {
    label: "เกี่ยวกับเรา",
    submenu: [
      { label: "วิสัยทัศน์ และพันธกิจ", href: "/about-philosophy" },
      { label: "ประวัติองค์กร", href: "/about-history" },
      { label: "คณะกรรมการ / ผู้บริหาร", href: "/about-executives" },
      { label: "บริษัทในเครือ", href: "/about-subsidiaries" },
    ],
  },
  {
    label: "สินค้าและบริการ",
    submenu: [
      {
        label: "สินค้า - ภายใต้แบรนด์ Pakku Packaging",
        href: "/products-pakku-packaging",
      },
      { label: "บริการของเรา", href: "/our-services" },
      { label: "ลูกค้าของเรา", href: "/our-customers" },
    ],
  },
  {
    label: "โรงงานและมาตรฐาน",
    submenu: [
      { label: "เครื่องพิมพ์และเทคโนโลยี", href: "/factory-technology" },
      { label: "การควบคุมคุณภาพ", href: "/quality-control" },
      { label: "การรับรองคุณภาพ", href: "/quality-certification" },
      { label: "รางวัลและความภาคภูมิใจ", href: "/awards-achievements" },
    ],
  },

  { label: "ข่าวสารและกิจกรรม", href: "/news-events" },
  { label: "บทความ", href: "/articles" },

  {
    label: "นักลงทุนสัมพันธ์",
    submenu: [
      { label: "ข้อมูลทางการเงิน", href: "/investor-financials" },
      { label: "การกำกับดูแลกิจการที่ดี", href: "/investor-governance" },
      { label: "ข้อมูลผู้ถือหุ้น", href: "/investor-shareholders" },
      { label: "เอกสารเผยแพร่และดาวน์โหลด", href: "/investor-downloads" },
      { label: "ติดต่อนักลงทุนสัมพันธ์", href: "/investor-contact" },
    ],
  },
  {
    label: "ติดต่อเรา",
    submenu: [
      { label: "ร่วมงานกับเรา", href: "/careers" },
      { label: "ติดต่อสอบถาม", href: "/contact-inquiry" },
    ],
  },
];
