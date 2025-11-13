import { NextRequest, NextResponse } from "next/server";

// ข้อมูลตำแหน่งงานจาก JobThai (Company ID: 135063)
// หมายเหตุ: JobThai ไม่มี Public API ที่เปิดให้ใช้งานโดยตรง
// วิธีการที่แนะนำคือ:
// 1. ใช้ JobThai RSS Feed (ถ้ามี)
// 2. ใช้ Web Scraping (ต้องระวังเรื่อง Terms of Service)
// 3. ติดต่อ JobThai เพื่อขอ API Access
// 4. Manual Update ผ่าน Admin Panel

// สำหรับตัวอย่างนี้ เราจะใช้ข้อมูลแบบ hardcoded ที่ดึงมาจาก JobThai
// คุณควรอัพเดทข้อมูลนี้เป็นระยะๆ หรือใช้ CMS/Admin Panel

interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  category: string;
  postedDate: string;
  isUrgent?: boolean;
  hasOnlineInterview?: boolean;
  jobthaiUrl: string;
  description?: string;
}

// ข้อมูลตำแหน่งงานที่ดึงมาจาก JobThai
// อัพเดทล่าสุด: 14 ตุลาคม 2568
const JOBS_DATA: Job[] = [
  {
    id: "1272565",
    title:
      "รองผจก./ผู้จัดการฝ่ายบริหารงบประมาณและต้นทุน (Budget Cost Management Manager)",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "บริหารจัดการ",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1272565",
    description:
      "วางแผนและควบคุมงบประมาณ บริหารต้นทุนการผลิต วิเคราะห์ความคุ้มค่าทางธุรกิจ",
  },
  {
    id: "1809101",
    title: "เจ้าหน้าที่พัฒนาทรัพยากรบุคคล (ฝึกอบรม)",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "ทรัพยากรบุคคล",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1809101",
    description:
      "วางแผนและจัดอบรมพนักงาน พัฒนาทักษะและความรู้ ประเมินผลการอบรม",
  },
  {
    id: "1659998",
    title: "เจ้าหน้าที่สรรหาว่าจ้าง",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "ทรัพยากรบุคคล",
    postedDate: "14 ต.ค. 68",
    isUrgent: true,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1659998",
    description:
      "สรรหาและคัดเลือกบุคลากร ดำเนินการสัมภาษณ์ ประสานงานการจ้างงาน",
  },
  {
    id: "1808941",
    title: "เจ้าหน้าวางแผนประสานงานขายและบริหารลูกค้าสัมพันธ์",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ฝ่ายขาย",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1808941",
    description: "วางแผนการขาย ประสานงานกับลูกค้า ดูแลความสัมพันธ์ลูกค้า",
  },
  {
    id: "1729096",
    title: "เจ้าหน้าที่ความปลอดภัย(จป.)/สิ่งแวดล้อม",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "อื่นๆ",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1729096",
    description: "ดูแลความปลอดภัยในโรงงาน จัดการสิ่งแวดล้อม ตรวจสอบมาตรฐาน",
  },
  {
    id: "1075573",
    title: "เจ้าหน้าที่ขายและบริหารลูกค้าสัมพันธ์",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "ฝ่ายขาย",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1075573",
    description: "ขายผลิตภัณฑ์ ดูแลลูกค้า สร้างความสัมพันธ์ทางธุรกิจ",
  },
  {
    id: "1586553",
    title: "ช่างเทคนิค(ช่างพิมพ์,ช่างไดคัท,ช่างเครื่องปะ)",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ช่างเทคนิค",
    postedDate: "14 ต.ค. 68",
    isUrgent: true,
    hasOnlineInterview: true,
    jobthaiUrl: "https://www.jobthai.com/th/job/1586553",
    description: "ดูแลเครื่องจักรในกระบวนการผลิต ซ่อมบำรุง ตรวจสอบคุณภาพ",
  },
  {
    id: "1158364",
    title: "วิศวกรจัดซื้อจัดหา",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "บริหารจัดการ",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1158364",
    description: "จัดซื้อวัตถุดิบและอุปกรณ์ เจรจาต่อรอง บริหารคลังสินค้า",
  },
  {
    id: "1192371",
    title: "ผู้จัดการฝ่ายผลิต",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ฝ่ายผลิต",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: true,
    jobthaiUrl: "https://www.jobthai.com/th/job/1192371",
    description: "บริหารจัดการการผลิต วางแผนกำลังการผลิต ควบคุมคุณภาพ",
  },
  {
    id: "1508158",
    title: "วิศวกรการผลิต",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามประสบการณ์ + โครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ฝ่ายผลิต",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1508158",
    description: "วิเคราะห์กระบวนการผลิต ปรับปรุงประสิทธิภาพ แก้ไขปัญหา",
  },
  {
    id: "774643",
    title: "เจ้าหน้าที่ประสานงานขาย",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ฝ่ายขาย",
    postedDate: "14 ต.ค. 68",
    isUrgent: true,
    hasOnlineInterview: true,
    jobthaiUrl: "https://www.jobthai.com/th/job/774643",
    description: "ประสานงานการขาย จัดทำเอกสาร ติดตามออเดอร์",
  },
  {
    id: "1446168",
    title: "หัวหน้าฝ่ายวางแผนและควบคุมการผลิต",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ+ประสบการณ์",
    type: "งานประจำ",
    category: "ฝ่ายผลิต",
    postedDate: "14 ต.ค. 68",
    isUrgent: true,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1446168",
    description: "วางแผนการผลิต ควบคุมกระบวนการ บริหารทีมงาน",
  },
  {
    id: "1633737",
    title: "เจ้าหน้าที่ดูแลไดบอร์ด",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "อื่นๆ",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1633737",
    description: "จัดการและดูแลระบบไดบอร์ด รายงานข้อมูล วิเคราะห์ผล",
  },
  {
    id: "1658448",
    title: "ช่างปรับตั้งเครื่องปะกาวออโต้",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "ช่างเทคนิค",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: true,
    jobthaiUrl: "https://www.jobthai.com/th/job/1658448",
    description: "ปรับตั้งเครื่องปะกาวอัตโนมัติ ดูแลบำรุงรักษา แก้ไขปัญหา",
  },
  {
    id: "1677854",
    title: "หัวหน้าแผนกบัญชี",
    location: "อ.บางพลี จ.สมุทรปราการ",
    salary: "ตามโครงสร้างบริษัทฯ",
    type: "งานประจำ",
    category: "บริหารจัดการ",
    postedDate: "14 ต.ค. 68",
    isUrgent: false,
    hasOnlineInterview: false,
    jobthaiUrl: "https://www.jobthai.com/th/job/1677854",
    description: "บริหารจัดการงานบัญชี จัดทำรายงานทางการเงิน ควบคุมงบประมาณ",
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let filteredJobs = [...JOBS_DATA];

    // Filter by category
    if (category && category !== "all") {
      filteredJobs = filteredJobs.filter((job) => job.category === category);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
      lastUpdated: "2025-10-14",
      source: "JobThai (Company ID: 135063)",
      note: "ข้อมูลนี้ถูกดึงมาจาก JobThai และควรได้รับการอัพเดทเป็นระยะ",
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
        jobs: [],
      },
      { status: 500 }
    );
  }
}

// POST endpoint สำหรับอัพเดทข้อมูลงาน (สำหรับ Admin Panel ในอนาคต)
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement authentication and authorization
    // TODO: Implement job data update logic

    return NextResponse.json(
      {
        success: false,
        message:
          "Not implemented yet. Please update JOBS_DATA manually in the code.",
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
