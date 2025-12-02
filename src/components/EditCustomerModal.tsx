"use client";
import { useState, useEffect, useMemo, useRef, useCallback, type PointerEvent } from "react";
import { X, Save, Loader2, Star, FileText, ClipboardCheck, Briefcase, Calendar, User } from "lucide-react";
import { NotificationPopup } from "./NotificationPopup";

interface CustomerData {
  [key: string]: any;
}

interface ThaiProvince {
  id: number;
  name_th: string;
  name_en: string;
}

interface ThaiDistrict {
  id: number;
  province_id: number;
  name_th: string;
  name_en: string;
}

interface ThaiSubDistrict {
  id: number;
  district_id: number;
  name_th: string;
  name_en: string;
  zip_code: number | string | null;
}

interface ThaiAdministrativeData {
  provinces: ThaiProvince[];
  districts: ThaiDistrict[];
  subdistricts: ThaiSubDistrict[];
}

const THAI_DATA_BASE_URL =
  "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest";

let thaiAdministrativeCache: ThaiAdministrativeData | null = null;
let thaiAdministrativePromise: Promise<ThaiAdministrativeData> | null = null;

const fetchThaiAdministrativeData = async () => {
  if (thaiAdministrativeCache) {
    return thaiAdministrativeCache;
  }

  if (!thaiAdministrativePromise) {
    thaiAdministrativePromise = Promise.all([
      fetch(`${THAI_DATA_BASE_URL}/province.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลจังหวัดได้");
        }
        return response.json() as Promise<ThaiProvince[]>;
      }),
      fetch(`${THAI_DATA_BASE_URL}/district.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลอำเภอได้");
        }
        return response.json() as Promise<ThaiDistrict[]>;
      }),
      fetch(`${THAI_DATA_BASE_URL}/sub_district.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลตำบลได้");
        }
        return response.json() as Promise<ThaiSubDistrict[]>;
      }),
    ]).then(([provinces, districts, subdistricts]) => {
      const payload: ThaiAdministrativeData = {
        provinces,
        districts,
        subdistricts,
      };
      thaiAdministrativeCache = payload;
      return payload;
    });
  }

  return thaiAdministrativePromise;
};

const normalizeAdministrativeName = (value: string | null | undefined) =>
  value ? value.trim().toLowerCase() : "";

const matchesAdministrativeName = (
  candidate: { name_th: string; name_en: string },
  target: string
) => {
  const normalizedTarget = normalizeAdministrativeName(target);
  if (!normalizedTarget) {
    return false;
  }
  return (
    normalizeAdministrativeName(candidate.name_th) === normalizedTarget ||
    normalizeAdministrativeName(candidate.name_en) === normalizedTarget
  );
};

// OPD Service interfaces
interface OPDServiceGroup {
  groupcode: string;
  groupname: string;
}

interface OPDServiceItem {
  itemcode: string;
  itemname: string;
  saleprice: number;
}

interface SelectedServiceEntry {
  id: string;
  itemcode: string;
  itemname: string;
  salesprice: number;
  chargePrice: string;
  chargePercent: string;
  discountPrice: string;
  discountPercent: string;
  saleType?: string;
}

interface ConsentSection {
  weight: string;
  height: string;
  hasChronic: boolean;
  chronicDiseaseDetail: string;
  hasDrugAllergy: boolean;
  drugAllergyDetail: string;
  signatureUrl: string;
  medicalConsent: string;
  acceptPdpa: string;
  acceptMedia: string;
}

const consentPartMeta = [
  { key: "patient", label: "ผู้รับบริการ" },
  { key: "provider", label: "ผู้ให้ข้อมูล" },
] as const;

type ConsentPartKey = (typeof consentPartMeta)[number]["key"];

const buildEmptyConsentSections = () =>
  consentPartMeta.reduce((acc, part) => {
    acc[part.key] = {
      weight: "",
      height: "",
      hasChronic: false,
      chronicDiseaseDetail: "",
      hasDrugAllergy: false,
      drugAllergyDetail: "",
      signatureUrl: "",
      medicalConsent: "",
      acceptPdpa: "",
      acceptMedia: "",
    };
    return acc;
  }, {} as Record<ConsentPartKey, ConsentSection>);

const medicalConsentOptions = ["ยินยอม", "ไม่ยินยอม"] as const;
const medicalConsentAcknowledgementText = [
  "ข้าพเจ้าขอแสดงความยินยอมและรับทราบเงื่อนไขการตรวจรักษาดังต่อไปนี้",
  "ข้าพเจ้ายินยอมเข้ารับบริการหัตถการ, การศัลยกรรม หรือการรักษาทางการแพทย์อื่น ๆ ตามที่แพทย์เห็นสมควร",
  "ข้าพเจ้าตกลงยินยอมให้ทีมแพทย์และบุคลากรทางการแพทย์ ดำเนินการตรวจวินิจฉัย รักษา ให้คำปรึกษา หรือทำหัตถการต่าง ๆ ที่จำเป็น อันรวมถึงแต่ไม่จำกัดเพียง การฉีดยา, การเจาะเลือด, การทำหัตถการเล็ก, การทำเลเซอร์, การผ่าตัดเฉพาะจุด และการรักษาโดยเทคโนโลยีต่าง ๆ ตามดุลยพินิจของแพทย์",
  "ข้าพเจ้ารับทราบถึงผลลัพธ์ที่อาจเกิดขึ้น รวมถึงภาวะแทรกซ้อนหรือความเสี่ยงต่าง ๆ ที่อาจเกิดขึ้นได้จากการตรวจรักษาหรือหัตถการดังกล่าว และขอยืนยันว่าได้รับคำอธิบายจากบุคลากรทางการแพทย์อย่างเพียงพอแล้ว",
  "ในกรณีเกิดเหตุการณ์ฉุกเฉิน ข้าพเจ้ายินยอมให้บุคลากรทางการแพทย์ดำเนินการรักษาอย่างเร่งด่วนตามความเหมาะสมโดยไม่จำเป็นต้องขอความยินยอมเพิ่มเติม",
  "ข้าพเจ้ารับทราบถึงสิทธิ์ของข้าพเจ้าในการขอเข้าถึง แก้ไข หรือเพิกถอนความยินยอมในการใช้ข้อมูลส่วนบุคคล ตามที่กฎหมาย PDPA กำหนด",
  "ข้าพเจ้าเข้าใจและยินยอมว่า เมื่อได้มีการชำระเงินมัดจำเพื่อยืนยันการจองบริการแล้ว จะไม่สามารถขอคืนเงินมัดจำดังกล่าวได้ไม่ว่ากรณีใด ๆ",
  "ข้าพเจ้าได้อ่านและเข้าใจข้อความข้างต้นโดยชัดเจนแล้ว และยินยอมโดยสมัครใจ โดยไม่มีการบังคับหรือหลอกลวงใด ๆ ทั้งสิ้น",
  "ผู้รับบริการขอรับรองว่าได้แสดงเจตนาไว้ก่อนเข้ารับบริการรักษาและ/หรือรับบริการใด ๆ ก็ตาม ผู้รับบริการหรือผู้แทนขอสละสิทธิ์ทุกประเภทที่จะเรียกร้องค่าเสียหายหรือค่าใช้จ่ายใด ๆ จากบริษัทหรือแพทย์ผู้เชี่ยวชาญหรือผู้ให้บริการ",
  "ผู้รับบริการทราบดีว่าการรับบริการนี้เป็นความยินยอมและสมัครใจโดยไม่ได้ถูกบังคับ หลอกลวง หรือเข้าใจผิดในสาระสำคัญของข้อเท็จจริง",
  "ไม่ว่ากรณีใด ๆ ผู้รับบริการจะไม่บอกเลิกการใช้บริการหรือขอคืนเงินที่ชำระไว้แล้ว",
  "กรณีชำระเงินมัดจำไว้บางส่วนและขาดการติดต่อหรือไม่เข้ารับบริการเกิน 6 เดือน ผู้รับบริการจะหมดอายุการเป็นสมาชิก ยกเว้นกรณีชำระเงินครบถ้วนตามโปรแกรม ผู้รับบริการจะต้องเข้ารับบริการให้ครบภายในระยะเวลา 2 ปี หากเกินกำหนด บริษัทมีสิทธิ์ยกเลิกการให้บริการโดยไม่ต้องแจ้งล่วงหน้า",
  "ผู้รับบริการต้องชำระค่าบริการให้ครบถ้วนตามที่ตกลงไว้ มิฉะนั้นโปรแกรมจะสิ้นสุดลงโดยอัตโนมัติ",
  "หากผู้รับบริการชำระเงินไม่ครบถ้วน หากมีการรับบริการ บริษัทจะคำนวณหักค่าใช้บริการจากราคาเต็ม จนกว่าจะชำระครบแล้วจึงคิดราคาตามส่วนลดหรือโปรโมชั่น",
  "โปรแกรมนี้เป็นโปรแกรมเฉพาะบุคคล ไม่สามารถโอนสิทธิ์ให้ผู้อื่นได้",
  "กรณีมีปัญหาสุขภาพที่ไม่สามารถใช้โปรแกรมต่อได้ ต้องได้รับการตรวจและยืนยันจากแพทย์เท่านั้น บริษัทจะคืนเงินไม่เกิน 70% ของราคาเต็ม",
  "ผู้รับบริการทราบและตกลงว่าจะไม่ถือเอาค่าโฆษณา คำชวน คำแนะนำ หรือคำบรรยายสรรพคุณใด ๆ จากพนักงานเป็นส่วนหนึ่งของข้อตกลง ทั้งนี้ผลลัพธ์ขึ้นกับสุขภาพร่างกาย สภาพผิว การใช้ยา สิ่งแวดล้อม และพฤติกรรมของผู้รับบริการ",
  "หากบริษัทพิจารณาว่าสภาพผิวหรือร่างกายผู้รับบริการไม่พร้อม บริษัทขอสงวนสิทธิ์หยุดหรือยกเลิกบริการบางส่วนหรือทั้งหมดได้ทันที",
  "ผู้รับบริการยินยอมให้ตรวจสุขภาพและทำแบบทดสอบต่าง ๆ ตามที่บริษัทกำหนด",
  "ผู้รับบริการตกลงรับผิดชอบต่อความเสียหายที่เกิดขึ้นกับทรัพย์สินของตนเอง",
  "ผู้รับบริการตกลงรับผิดชอบต่อการกระทำใด ๆ ที่ก่อให้เกิดความเสียหายต่อทรัพย์สินหรือชื่อเสียงของบริษัท",
  "บริษัทมีสิทธิ์หยุด ระงับ หรือยกเลิกการให้บริการหากผู้รับบริการมีพฤติกรรมไม่เหมาะสม",
  "สัญญานี้ไม่สามารถดัดแปลง แก้ไข หรือขูดลบใด ๆ เว้นแต่มีข้อตกลงเป็นลายลักษณ์อักษร",
  "กรณีชำระยอดคงเหลือ ผู้รับบริการต้องชำระภายใน 14 วันนับจากวันที่ตกลงใช้บริการ",
  "จดคืนเงินทุกกรณี: No Refund",
];

const pdpaTextBlock = [
  "PDPA - ข้าพเจ้ายินยอมให้โรงพยาบาล/คลินิก เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการให้บริการทางการแพทย์ และ/หรือการใช้เพื่อประโยชน์ทางการแพทย์อื่น ๆ",
  "ข้าพเจ้ายินยอมให้มีการบันทึกภาพถ่าย วิดีโอ หรือเอกสารทางการแพทย์ที่เกี่ยวข้อง เพื่อประกอบการรักษา ติดตามผล หรือใช้เพื่อการศึกษา วิจัย หรือประชาสัมพันธ์ (โดยไม่เปิดเผยตัวตน เว้นแต่จะได้รับความยินยอมเป็นลายลักษณ์อักษรเพิ่มเติม)",
];
const mediaTextBlock = [
  "ข้าพเจ้ายินยอมให้คลินิกใช้ภาพถ่าย หรือวิดีโอที่เกิดขึ้นระหว่างการรักษาเพื่อประกอบการศึกษาภายในหรือประชาสัมพันธ์ โดยไม่ระบุชื่อบุคคล และขอสงวนสิทธิ์ในการขอความยินยอมเพิ่มเติมหากมีการเปิดเผยตัวตน",
  "ข้าพเจ้ายินยอมรับข้อมูลประชาสัมพันธ์เกี่ยวกับการรักษา ผ่านช่องทางที่คลินิกกำหนด เพื่อเป็นส่วนหนึ่งของการติดตามผลการรักษาหรือการให้ข่าวสารสำคัญ",
];
const acceptOptions = ["ยอมรับ", "ไม่ยอมรับ"] as const;

// Currency formatting helpers
const currencyFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrencyDisplay = (value: number) =>
  Number.isFinite(value) ? currencyFormatter.format(value) : "0.00";

const formatDecimalInputValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2) : "";

const parseMonetaryInputValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toNumericValue = (value: unknown) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeSalepriceValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const calculateServiceEntryTotal = (entry: SelectedServiceEntry) => {
  const baseAmount = Number.isFinite(entry.salesprice) ? entry.salesprice : 0;
  const chargeAmount = parseMonetaryInputValue(entry.chargePrice);
  const discountAmount = parseMonetaryInputValue(entry.discountPrice);
  return baseAmount + chargeAmount - discountAmount;
};

const generateReceiptNumber = () => {
  const twoDigits = Math.floor(Math.random() * 90 + 10);
  const fourDigits = Math.floor(Math.random() * 9000 + 1000);
  return `Ex${twoDigits}-${fourDigits}`;
};

const bjhMasterColumnDefinitions = [
  { key: "id_all", label: "id_all", readOnly: true },
  { key: "cn", label: "cn" },
  { key: "code", label: "code" },
  { key: "status", label: "status" },
  { key: "source", label: "source" },
  { key: "interested_product", label: "interested_product" },
  { key: "doctor", label: "doctor" },
  { key: "contact_staff", label: "contact_staff" },
  { key: "prefix", label: "prefix" },
  { key: "name", label: "name" },
  { key: "surname", label: "surname" },
  { key: "nickname", label: "nickname" },
  { key: "gender", label: "gender" },
  { key: "birthdate", label: "birthdate" },
  { key: "occupation", label: "occupation" },
  { key: "member", label: "member" },
  { key: "cusgroup", label: "cusgroup" },
  { key: "customer_name", label: "customer_name" },
  { key: "phone", label: "phone" },
  { key: "mobilephone", label: "mobilephone" },
  { key: "email", label: "email" },
  { key: "lineid", label: "lineid" },
  { key: "facebook", label: "facebook" },
  { key: "country", label: "country" },
  { key: "from_province", label: "from_province" },
  { key: "medianame", label: "medianame" },
  { key: "disease", label: "disease" },
  { key: "allergic", label: "allergic" },
  { key: "note", label: "note", multiline: true },
  { key: "got_contact_date", label: "got_contact_date" },
  { key: "last_followup", label: "last_followup" },
  { key: "next_followup", label: "next_followup" },
  { key: "consult_date", label: "consult_date" },
  { key: "surgery_date", label: "surgery_date" },
  { key: "appointment_time", label: "appointment_time" },
  { key: "booked_consult_date", label: "booked_consult_date" },
  { key: "booked_surgery_date", label: "booked_surgery_date" },
  { key: "proposed_amount", label: "proposed_amount" },
  { key: "star_flag", label: "star_flag" },
  { key: "address", label: "address", multiline: true },
  { key: "province", label: "province" },
  { key: "zipcode", label: "zipcode" },
  { key: "registerdate", label: "registerdate" },
  { key: "ownername", label: "ownername" },
  { key: "binddate", label: "binddate" },
  { key: "is_opd", label: "is_opd" },
  { key: "locno", label: "locno" },
  { key: "road", label: "road" },
  { key: "moo", label: "moo" },
  { key: "tumbon", label: "tumbon" },
  { key: "amphur", label: "amphur" },
  { key: "id_card", label: "id_card" },
];

const getBjFieldType = (key: string) => {
  const normalized = key.toLowerCase();
  if (normalized.includes("date")) return "date";
  if (normalized.includes("time")) return "time";
  if (normalized === "proposed_amount") return "number";
  return "text";
};

type AppointmentFieldType = "text" | "date" | "textarea" | "tel" | "time" | "datetime-local";

interface AppointmentFieldMeta {
  key: string;
  label: string;
  type?: AppointmentFieldType;
  placeholder?: string;
  readOnly?: boolean;
  fullWidth?: boolean;
}

const appointmentFieldMeta: AppointmentFieldMeta[] = [
  { key: "record_no", label: "Record No", readOnly: true },
  { key: "code", label: "Code", readOnly: true },
  { key: "appoint_code", label: "Appoint Code", readOnly: true },
  { key: "register_date", label: "วันที่ลงทะเบียน", type: "date" },
  { key: "start_date", label: "วันนัด", type: "datetime-local" },
  { key: "end_date", label: "ครบกำหนด", type: "datetime-local" },
  { key: "prefix", label: "คำนำหน้า" },
  { key: "name", label: "ชื่อ" },
  { key: "surname", label: "นามสกุล" },
  { key: "nickname", label: "ชื่อเล่น" },
  {
    key: "display_name",
    label: "ชื่อที่แสดง",
    placeholder: "เช่น ชื่อที่ลูกค้าต้องการให้แสดง",
  },
  { key: "mobilephone", label: "เบอร์มือถือ", type: "tel" },
  { key: "email", label: "อีเมล" },
  { key: "activity", label: "กิจกรรม" },
  { key: "note", label: "หมายเหตุ", type: "textarea", fullWidth: true },
  { key: "doctor_code", label: "รหัสหมอ" },
  { key: "doctor_name", label: "ชื่อหมอ" },
  { key: "dest_code", label: "รหัสจุดหมาย" },
  { key: "dest_name", label: "ชื่อจุดหมาย" },
  { key: "organize", label: "หน่วยงาน" },
  { key: "bind_code", label: "รหัส Bind" },
  { key: "bind_date", label: "วันที่ Bind", type: "date" },
  { key: "id_all", label: "ID ลูกค้า", readOnly: true },
];

const appointmentFieldMetaMap = appointmentFieldMeta.reduce((acc, field) => {
  acc[field.key] = field;
  return acc;
}, {} as Record<string, AppointmentFieldMeta>);

type AppointmentHistoryItem = Record<string, unknown> & {
  record_no?: string | number;
  appoint_code?: string;
  start_date?: string | number;
  end_date?: string | number;
  activity?: string;
  note?: string;
  id_all?: string;
};

const formatAppointmentDateTimeLabel = (
  value?: string | number | null
) => {
  if (value === undefined || value === null || value === "") return "-";

  const normalized = typeof value === "number" ? value : String(value);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = typeof normalized === "string" ? normalized : String(normalized);
    return fallback.replace("T", " ").split(".")[0];
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const resolveAppointmentHistoryKey = (
  entry: AppointmentHistoryItem,
  index: number
) => {
  if (entry.appoint_code) {
    return `code-${entry.appoint_code}`;
  }
  if (entry.record_no !== undefined && entry.record_no !== null) {
    return `record-${entry.record_no}`;
  }
  return `history-${index}`;
};

interface AppointmentSection {
  title: string;
  fields: string[];
  columns?: string;
}

const appointmentSections: AppointmentSection[] = [
  {
    title: "ข้อมูลการนัดหมาย",
    fields: [
      "register_date",
      "start_date",
      "end_date",
      "bind_date",
    ],
    columns: "grid-cols-1 md:grid-cols-3",
  },
  {
    title: "ข้อมูลผู้รับบริการ",
    fields: [
      "prefix",
      "name",
      "surname",
      "nickname",
      "display_name",
      "mobilephone",
      "email",
      "id_all",
    ],
    columns: "grid-cols-1 md:grid-cols-2",
  },
  {
    title: "รายละเอียดเพิ่มเติม",
    fields: [
      "activity",
      "note",
      "doctor_code",
      "doctor_name",
      "dest_code",
      "dest_name",
      "organize",
      "bind_code",
    ],
    columns: "grid-cols-1 md:grid-cols-2",
  },
];

const buildEmptyAppointmentForm = () =>
  appointmentFieldMeta.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as Record<string, string>);

const resolveConsentPartKey = (value: string | null | undefined): ConsentPartKey | null => {
  if (!value) return null;
  const normalized = value.toString().trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "patient" || normalized.includes("ผู้รับ")) return "patient";
  if (normalized === "provider" || normalized.includes("ผู้ให้")) return "provider";
  const directMatch = consentPartMeta.find((part) => part.key === normalized);
  return directMatch ? directMatch.key : null;
};

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
}

const SignaturePad = ({ value, onChange }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const updateSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [onChange]);

  const drawFromValue = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!value) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const clientWidth = canvas.clientWidth || 400;
    const fixedHeight = 150;
    canvas.width = clientWidth * ratio;
    canvas.height = fixedHeight * ratio;
    canvas.style.width = "100%";
    canvas.style.height = `${fixedHeight}px`;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "#4c1d95";
    ctxRef.current = ctx;
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    drawFromValue();
  }, [drawFromValue, isReady]);

  const getPointerCoords = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPointerCoords(event);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPointerCoords(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    updateSignature();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <canvas
        ref={canvasRef}
        className="w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
        >
          ล้างลายเซ็น
        </button>
        <span className="text-[11px] text-slate-500">ลงชื่อด้วยเมาส์หรือสัมผัส</span>
      </div>
    </div>
  );
};

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: CustomerData;
  onSave: (data: CustomerData) => void;
}
export const EditCustomerModal = ({
  isOpen,
  onClose,
  customerData: initialData,
  onSave,
}: EditCustomerModalProps) => {
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [activeTab, setActiveTab] = useState<"contact" | "opd" | "consent" | "service" | "appointment">("contact");
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string; color: string }>
  >([]);
  const [sourceOptions, setSourceOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [productOptions, setProductOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [countryOptions, setCountryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [contactPersonOptions, setContactPersonOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOPDPopup, setShowOPDPopup] = useState(false);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<Record<string, string>>(
    buildEmptyAppointmentForm
  );
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistoryItem[]>(
    []
  );
  const [appointmentHistoryLoading, setAppointmentHistoryLoading] = useState(false);
  const [appointmentHistoryError, setAppointmentHistoryError] = useState<string | null>(null);
  const [selectedAppointmentHistoryKey, setSelectedAppointmentHistoryKey] = useState<string | null>(
    null
  );
  const [editingAppointmentCode, setEditingAppointmentCode] = useState<string | null>(null);
  const appointmentPrefillRef = useRef<Record<string, string>>({});
  const [thaiProvinces, setThaiProvinces] = useState<ThaiProvince[]>([]);
  const [thaiDistricts, setThaiDistricts] = useState<ThaiDistrict[]>([]);
  const [thaiSubdistricts, setThaiSubdistricts] = useState<ThaiSubDistrict[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<number | null>(null);
  const [thaiAddressLoading, setThaiAddressLoading] = useState(false);
  const [thaiAddressError, setThaiAddressError] = useState<string | null>(null);
  const normalizeCustomerValue = (value: unknown) => {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : String(value);
    return text.trim();
  };
  const customerIdentifier = useMemo(() => {
    const priorityKeys = ["id_all", "id", "รหัสลูกค้า", "customer_code"];
    for (const key of priorityKeys) {
      if (key in customerData) {
        const normalized = normalizeCustomerValue(customerData[key]);
        if (normalized) return normalized;
      }
    }
    return "";
  }, [customerData]);
  const customerIdAll = useMemo(() => {
    const possible = ["id_all", "idAll", "id"];
    for (const key of possible) {
      if (key in customerData) {
        const normalized = normalizeCustomerValue(customerData[key]);
        if (normalized) return normalized;
      }
    }
    return "";
  }, [customerData]);
  const customerDisplayName = useMemo(() => {
    const labelKeys = ["ชื่อ", "customer_name", "displayName"];
    for (const key of labelKeys) {
      if (key in customerData) {
        const normalized = normalizeCustomerValue(customerData[key]);
        if (normalized) return normalized;
      }
    }
    return "";
  }, [customerData]);
  const customerSaleCode = useMemo(() => {
    const labelKeys = ["รหัสลูกค้า", "customer_code"];
    for (const key of labelKeys) {
      if (key in customerData) {
        const normalized = normalizeCustomerValue(customerData[key]);
        if (normalized) return normalized;
      }
    }
    return "";
  }, [customerData]);
  // OPD Service states
  const [opdGroups, setOpdGroups] = useState<OPDServiceGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedOpdGroupCode, setSelectedOpdGroupCode] = useState<string>("");
  const [groupServiceItems, setGroupServiceItems] = useState<OPDServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedServiceEntry[]>([]);
  const latestServiceFetchGroupRef = useRef<string | null>(null);
  const [saleItemsHistory, setSaleItemsHistory] = useState<any[]>([]);
  const [saleItemsHistoryLoading, setSaleItemsHistoryLoading] = useState(false);
  const [saleItemsHistoryError, setSaleItemsHistoryError] = useState<string | null>(null);
  const [savingServices, setSavingServices] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [lastReceiptNo, setLastReceiptNo] = useState<string | null>(null);
  const [consentSections, setConsentSections] = useState<Record<ConsentPartKey, ConsentSection>>(
    buildEmptyConsentSections()
  );
  const [selectedConsentPart, setSelectedConsentPart] = useState<ConsentPartKey>(
    consentPartMeta[0].key
  );
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentLoadError, setConsentLoadError] = useState<string | null>(null);
  const [consentSaving, setConsentSaving] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch("/api/status-options");
      const result = await response.json();
      if (result.success && result.data) {
        setStatusOptions(result.data);
      } else {
        // Use fallback data when database is not accessible
        setStatusOptions([
          {
            value: "ติดตามต่อเนื่อง",
            label: "ติดตามต่อเนื่อง",
            color: "#FFD700",
          },
          { value: "ปิดการขาย", label: "ปิดการขาย", color: "#90EE90" },
          { value: "ยกเลิก", label: "ยกเลิก", color: "#FFB6C1" },
          { value: "รอตอบกลับ", label: "รอตอบกลับ", color: "#87CEEB" },
          {
            value: "ได้นัด Consult",
            label: "ได้นัด Consult",
            color: "#FFA500",
          },
          { value: "ได้นัดผ่าตัด", label: "ได้นัดผ่าตัด", color: "#FF6347" },
          { value: "ผ่าตัดแล้ว", label: "ผ่าตัดแล้ว", color: "#32CD32" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching status options:", error);
      // Use fallback data on network error
      setStatusOptions([
        {
          value: "ติดตามต่อเนื่อง",
          label: "ติดตามต่อเนื่อง",
          color: "#FFD700",
        },
        { value: "ปิดการขาย", label: "ปิดการขาย", color: "#90EE90" },
        { value: "ยกเลิก", label: "ยกเลิก", color: "#FFB6C1" },
        { value: "รอตอบกลับ", label: "รอตอบกลับ", color: "#87CEEB" },
        { value: "ได้นัด Consult", label: "ได้นัด Consult", color: "#FFA500" },
        { value: "ได้นัดผ่าตัด", label: "ได้นัดผ่าตัด", color: "#FF6347" },
        { value: "ผ่าตัดแล้ว", label: "ผ่าตัดแล้ว", color: "#32CD32" },
      ]);
    }
  };

  const fetchSourceOptions = async () => {
    try {
      const response = await fetch("/api/source-options");
      const result = await response.json();
      if (result.success && result.data) {
        setSourceOptions(result.data);
      } else {
        // Use fallback data
        setSourceOptions([
          { value: "Facebook", label: "Facebook" },
          { value: "Instagram", label: "Instagram" },
          { value: "Google Ads", label: "Google Ads" },
          { value: "Line", label: "Line" },
          { value: "Walk-in", label: "Walk-in" },
          { value: "Referral", label: "Referral" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching source options:", error);
      // Use fallback data
      setSourceOptions([
        { value: "Facebook", label: "Facebook" },
        { value: "Instagram", label: "Instagram" },
        { value: "Google Ads", label: "Google Ads" },
        { value: "Line", label: "Line" },
        { value: "Walk-in", label: "Walk-in" },
        { value: "Referral", label: "Referral" },
      ]);
    }
  };

  const fetchProductOptions = async () => {
    try {
      const response = await fetch("/api/product-options");
      const result = await response.json();
      if (result.success && result.data) {
        setProductOptions(result.data);
      } else {
        // Use fallback data
        setProductOptions([
          { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
          { value: "Sub brow lift", label: "Sub brow lift" },
          { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
          { value: "ตาสองชั้น", label: "ตาสองชั้น" },
          { value: "เสริมจมูก", label: "เสริมจมูก" },
          { value: "แก้จมูก", label: "แก้จมูก" },
          { value: "เสริมตาขาว", label: "เสริมตาขาว" },
          { value: "ลิฟหน้า", label: "ลิฟหน้า" },
          { value: "Skin", label: "Skin" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching product options:", error);
      // Use fallback data
      setProductOptions([
        { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
        { value: "Sub brow lift", label: "Sub brow lift" },
        { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
        { value: "ตาสองชั้น", label: "ตาสองชั้น" },
        { value: "เสริมจมูก", label: "เสริมจมูก" },
        { value: "แก้จมูก", label: "แก้จมูก" },
        { value: "เสริมตาขาว", label: "เสริมตาขาว" },
        { value: "ลิฟหน้า", label: "ลิฟหน้า" },
        { value: "Skin", label: "Skin" },
      ]);
    }
  };

  const fetchCountryOptions = async () => {
    try {
      const response = await fetch("/api/country-options");
      const result = await response.json();
      if (result.success && result.data) {
        setCountryOptions(result.data);
      } else {
        // Use fallback data
        setCountryOptions([
          { value: "ไทย", label: "ไทย" },
          { value: "จีน", label: "จีน" },
          { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
          { value: "เกาหลี", label: "เกาหลี" },
          { value: "สิงคโปร์", label: "สิงคโปร์" },
          { value: "มาเลเซีย", label: "มาเลเซีย" },
          { value: "อื่นๆ", label: "อื่นๆ" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching country options:", error);
      // Use fallback data
      setCountryOptions([
        { value: "ไทย", label: "ไทย" },
        { value: "จีน", label: "จีน" },
        { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
        { value: "เกาหลี", label: "เกาหลี" },
        { value: "สิงคโปร์", label: "สิงคโปร์" },
        { value: "มาเลเซีย", label: "มาเลเซีย" },
        { value: "อื่นๆ", label: "อื่นๆ" },
      ]);
    }
  };

  const fetchContactPersonOptions = async () => {
    try {
      const response = await fetch("/api/contact-person-options");
      const result = await response.json();
      if (result.success && result.data) {
        setContactPersonOptions(result.data);
      } else {
        // Use fallback data
        setContactPersonOptions([
          { value: "ว่าน", label: "ว่าน" },
          { value: "จีน", label: "จีน" },
          { value: "สา", label: "สา" },
          { value: "เจ", label: "เจ" },
          { value: "พิดยา", label: "พิดยา" },
          { value: "มุก", label: "มุก" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching contact person options:", error);
      // Use fallback data
      setContactPersonOptions([
        { value: "ว่าน", label: "ว่าน" },
        { value: "จีน", label: "จีน" },
        { value: "สา", label: "สา" },
        { value: "เจ", label: "เจ" },
        { value: "พิดยา", label: "พิดยา" },
        { value: "มุก", label: "มุก" },
      ]);
    }
  };

  // Fetch OPD Groups
  const fetchOpdGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await fetch("/api/b-item-groups");
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่พบกลุ่มขาย OPD");
      }
      setOpdGroups(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      console.error("Error fetching OPD groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Load services for selected group
  const loadServicesForGroup = async (groupCode: string) => {
    if (!groupCode) {
      setGroupServiceItems([]);
      return;
    }
    latestServiceFetchGroupRef.current = groupCode;
    setServicesLoading(true);
    setServiceError(null);
    setGroupServiceItems([]);
    try {
      const response = await fetch(
        `/api/b-item-services?groupCode=${encodeURIComponent(groupCode)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่พบรายการบริการ");
      }
      if (latestServiceFetchGroupRef.current !== groupCode) return;
      const normalizedItems = Array.isArray(result.data)
        ? result.data.map((item: OPDServiceItem) => ({
          ...item,
          saleprice: normalizeSalepriceValue(item.saleprice),
        }))
        : [];
      setGroupServiceItems(normalizedItems as OPDServiceItem[]);
    } catch (error: any) {
      if (latestServiceFetchGroupRef.current !== groupCode) return;
      setServiceError(error?.message || "ไม่สามารถโหลดรายการบริการได้");
    } finally {
      if (latestServiceFetchGroupRef.current === groupCode) {
        setServicesLoading(false);
      }
    }
  };

  const fetchSaleItemsHistory = useCallback(async (code: string) => {
    setSaleItemsHistoryLoading(true);
    setSaleItemsHistoryError(null);
    try {
      const response = await fetch(`/api/b-saleitem?code=${encodeURIComponent(code)}`);
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่สามารถโหลดประวัติบริการได้");
      }
      setSaleItemsHistory(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      setSaleItemsHistory([]);
      setSaleItemsHistoryError(error?.message || "ไม่สามารถโหลดประวัติบริการได้");
    } finally {
      setSaleItemsHistoryLoading(false);
    }
  }, []);

  const handleGroupSelect = (groupCode: string) => {
    setSelectedOpdGroupCode(groupCode);
    setServiceSearchTerm("");
    setServiceError(null);
    if (!groupCode) {
      setGroupServiceItems([]);
      return;
    }
    loadServicesForGroup(groupCode);
  };

  const handleOpenServicePopup = () => {
    setShowServicePopup(true);
    setServiceError(null);
    if (opdGroups.length === 0) {
      fetchOpdGroups();
    }
    if (selectedOpdGroupCode) {
      loadServicesForGroup(selectedOpdGroupCode);
    }
  };

  const handleCloseServicePopup = () => {
    setShowServicePopup(false);
    setServiceSearchTerm("");
    setServiceError(null);
  };

  const handleShowHistory = () => {
    if (!customerIdentifier) return;
    fetchSaleItemsHistory(customerIdentifier);
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
  };

  const fetchConsentForms = useCallback(async () => {
    if (!customerIdAll) return;
    setConsentLoading(true);
    setConsentLoadError(null);
    setConsentSections(buildEmptyConsentSections());
    try {
      const response = await fetch(
        `/api/consent-forms?id_all=${encodeURIComponent(customerIdAll)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่สามารถโหลด Consent form ได้");
      }
      const nextSections = buildEmptyConsentSections();
      if (Array.isArray(result.data)) {
        result.data.forEach((item: Record<string, any>) => {
          const partKey = resolveConsentPartKey(item.part);
          if (!partKey) return;
          const formatString = (value: unknown) =>
            value === undefined || value === null ? "" : String(value);
          nextSections[partKey] = {
            weight: formatString(item.weight_kg ?? item.weight),
            height: formatString(item.height_cm ?? item.height),
            hasChronic: Boolean(
              item.has_chronic_disease ?? item.has_chronic ?? item.hasChronic
            ),
            chronicDiseaseDetail:
              item.chronic_disease_detail || item.chronicDiseaseDetail || "",
            hasDrugAllergy: Boolean(
              item.has_drug_allergy ?? item.hasDrugAllergy
            ),
            drugAllergyDetail:
              item.drug_allergy_detail || item.drugAllergyDetail || "",
            signatureUrl: item.signature_url || item.signatureUrl || "",
            medicalConsent: item.medical_consent || item.medicalConsent || "",
            acceptPdpa: item.accept_pdpa || item.acceptPdpa || "",
            acceptMedia: item.accept_media || item.acceptMedia || "",
          };
        });
      }
      setConsentSections(nextSections);
    } catch (error: any) {
      console.error("Error fetching consent data:", error);
      setConsentLoadError(error?.message || "ไม่สามารถโหลด Consent form ได้");
    } finally {
      setConsentLoading(false);
    }
  }, [customerIdentifier]);

  useEffect(() => {
    if (showServicePopup && customerIdentifier) {
      fetchSaleItemsHistory(customerIdentifier);
    }
  }, [showServicePopup, customerIdentifier, fetchSaleItemsHistory]);

  useEffect(() => {
    if (!showConsentPopup) return;
    setSelectedConsentPart(consentPartMeta[0].key);
    fetchConsentForms();
  }, [showConsentPopup, fetchConsentForms]);

  const handleConsentSectionChange = (
    part: ConsentPartKey,
    changes: Partial<ConsentSection>
  ) => {
    setConsentSections((current) => ({
      ...current,
      [part]: {
        ...current[part],
        ...changes,
      },
    }));
  };

  const handleConsentToggle = (
    part: ConsentPartKey,
    field: "hasChronic" | "hasDrugAllergy",
    value: boolean
  ) => {
    const updates: Partial<ConsentSection> = { [field]: value } as Partial<ConsentSection>;
    if (field === "hasChronic" && !value) {
      updates.chronicDiseaseDetail = "";
    }
    if (field === "hasDrugAllergy" && !value) {
      updates.drugAllergyDetail = "";
    }
    handleConsentSectionChange(part, updates);
  };

  const handleConsentSignatureChange = (part: ConsentPartKey, signatureUrl: string) => {
    handleConsentSectionChange(part, { signatureUrl });
  };

  const handleSaveConsentForms = async () => {
    if (!customerIdAll) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบ",
        message: "ไม่สามารถบันทึก Consent ได้ เพราะยังไม่รู้จักลูกค้า",
      });
      return;
    }
    setConsentSaving(true);
    try {
      const payload = {
        code: customerIdAll,
        idAll: customerIdAll,
        createdBy: loggedInUser || null,
        sections: consentPartMeta.map((part) => {
          const entry = consentSections[part.key];
          return {
            part: part.key,
            weight: entry.weight,
            height: entry.height,
            hasChronic: entry.hasChronic,
            chronicDiseaseDetail: entry.chronicDiseaseDetail,
            hasDrugAllergy: entry.hasDrugAllergy,
            drugAllergyDetail: entry.drugAllergyDetail,
            signatureUrl: entry.signatureUrl,
            medicalConsent: entry.medicalConsent || null,
            acceptPdpa: entry.acceptPdpa || null,
            acceptMedia: entry.acceptMedia || null,
          };
        }),
      };

      const response = await fetch("/api/consent-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: { success?: boolean; message?: string; error?: string };
      try {
        result = await response.json();
      } catch (parseError) {
        const fallbackText = await response.text();
        throw new Error(
          fallbackText ||
          (parseError as Error).message ||
          "ไม่สามารถอ่านผลลัพธ์จากเซิร์ฟเวอร์"
        );
      }
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่สามารถบันทึก Consent ได้");
      }
      setNotification({
        isOpen: true,
        type: "success",
        title: "บันทึก Consent แล้ว",
        message: result.message || "Consent form ถูกบันทึกเรียบร้อยแล้ว",
      });
      await fetchConsentForms();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "บันทึกไม่สำเร็จ",
        message: error?.message || "เกิดข้อผิดพลาดในการบันทึก Consent",
      });
    } finally {
      setConsentSaving(false);
    }
  };

  const handleSaveSelectedServices = async () => {
    if (!customerIdentifier) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "รหัสลูกค้าไม่ครบ",
        message: "ไม่สามารถบันทึกบริการได้ เพราะยังไม่มีรหัสดึงข้อมูลลูกค้า",
      });
      return false;
    }
    if (selectedServices.length === 0) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "ยังไม่มีบริการ",
        message: "กรุณาเลือกบริการก่อนบันทึกลง b_saleitem",
      });
      return false;
    }
    setSavingServices(true);
    try {
      const currentReceipt = lastReceiptNo ?? generateReceiptNumber();
      const payload = {
        code: customerIdentifier,
        saleCode: customerSaleCode || null,
        displayName: customerDisplayName || null,
        receiptNo: currentReceipt,
        services: selectedServices.map((entry) => ({
          itemCode: entry.itemcode,
          itemName: entry.itemname,
          unitSale: entry.salesprice,
          netAmount: calculateServiceEntryTotal(entry),
          saleType: entry.saleType || "20",
        })),
      };

      const response = await fetch("/api/b-saleitem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึกบริการ");
      }
      setNotification({
        isOpen: true,
        type: "success",
        title: "บันทึกบริการ OPD แล้ว",
        message:
          result.message ||
          `บันทึก ${result.insertedCount ?? selectedServices.length} รายการลง b_saleitem แล้ว`,
      });
      setLastReceiptNo(currentReceipt);
      if (customerIdentifier) {
        fetchSaleItemsHistory(customerIdentifier);
      }
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "ไม่สามารถบันทึกบริการได้",
        message:
          error?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่",
      });
      return false;
    } finally {
      setSavingServices(false);
    }
  };

  const handleCompleteServiceSelection = async () => {
    const saved = await handleSaveSelectedServices();
    if (saved) {
      handleCloseServicePopup();
    }
  };

  // Service entry update handlers
  const updateSelectedServiceEntry = (
    id: string,
    updater: (entry: SelectedServiceEntry) => SelectedServiceEntry
  ) => {
    setSelectedServices((current) =>
      current.map((entry) => (entry.id === id ? updater(entry) : entry))
    );
  };

  const handleChargePriceChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPercent =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((numeric / entry.salesprice) * 100)
          : "";
      return { ...entry, chargePrice: value, chargePercent: nextPercent };
    });
  };

  const handleChargePercentChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPrice =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((entry.salesprice * numeric) / 100)
          : "";
      return { ...entry, chargePrice: nextPrice, chargePercent: value };
    });
  };

  const handleDiscountPriceChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPercent =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((numeric / entry.salesprice) * 100)
          : "";
      return { ...entry, discountPrice: value, discountPercent: nextPercent };
    });
  };

  const handleDiscountPercentChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPrice =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((entry.salesprice * numeric) / 100)
          : "";
      return { ...entry, discountPrice: nextPrice, discountPercent: value };
    });
  };

  const handleAddService = (item: OPDServiceItem) => {
    setSelectedServices((current) => {
      if (current.some((entry) => entry.itemcode === item.itemcode)) {
        return current;
      }
      return [
        ...current,
        {
          id: `${item.itemcode}-${Date.now()}`,
          itemcode: item.itemcode,
          itemname: item.itemname,
          salesprice: normalizeSalepriceValue(item.saleprice),
          chargePrice: "",
          chargePercent: "",
          discountPrice: "",
          discountPercent: "",
          saleType: "20",
        },
      ];
    });
  };

  const handleRemoveServiceEntry = (id: string) => {
    setSelectedServices((current) => current.filter((entry) => entry.id !== id));
  };

  // Memoized values for OPD Service
  const selectedOpdGroup = useMemo(
    () => opdGroups.find((group) => group.groupcode === selectedOpdGroupCode) ?? null,
    [opdGroups, selectedOpdGroupCode]
  );

  const selectedServicesTotals = useMemo(
    () =>
      selectedServices.reduce(
        (acc, entry) => {
          const baseAmount = Number.isFinite(entry.salesprice) ? entry.salesprice : 0;
          const chargeAmount = parseMonetaryInputValue(entry.chargePrice);
          const discountAmount = parseMonetaryInputValue(entry.discountPrice);
          const netAmount = baseAmount + chargeAmount - discountAmount;
          acc.baseTotal += baseAmount;
          acc.chargeTotal += chargeAmount;
          acc.discountTotal += discountAmount;
          acc.netTotal += netAmount;
          return acc;
        },
        { baseTotal: 0, chargeTotal: 0, discountTotal: 0, netTotal: 0 }
      ),
    [selectedServices]
  );

  const saleHistorySummary = useMemo(
    () =>
      saleItemsHistory.reduce(
        (acc, entry) => {
          const amount = toNumericValue(entry?.amount);
          acc.total += Number.isFinite(amount) ? amount : 0;
          acc.count += 1;
          return acc;
        },
        { count: 0, total: 0 }
      ),
    [saleItemsHistory]
  );

  const currentConsentSection = consentSections[selectedConsentPart];

  const filteredServiceItems = useMemo(() => {
    if (!serviceSearchTerm.trim()) return groupServiceItems;
    const lowerTerm = serviceSearchTerm.trim().toLowerCase();
    return groupServiceItems.filter(
      (item) =>
        item.itemname.toLowerCase().includes(lowerTerm) ||
        item.itemcode.toLowerCase().includes(lowerTerm)
    );
  }, [groupServiceItems, serviceSearchTerm]);

  useEffect(() => {
    console.log(
      "📋 EditCustomerModal - isOpen:",
      isOpen,
      "initialData:",
      initialData
    );
    if (initialData) {
      setCustomerData({ ...initialData });
    }
    if (isOpen) {
      fetchStatusOptions();
      fetchSourceOptions();
      fetchProductOptions();
      fetchCountryOptions();
      fetchContactPersonOptions();
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const name = parsed?.name || parsed?.username || parsed?.email || "";
        setLoggedInUser(name);
      }
    } catch (error) {
      console.error("Failed to load logged in user info", error);
    }
  }, []);
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setCustomerData((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }, []);

  const handleAppointmentFieldChange = useCallback((fieldName: string, value: string) => {
    setAppointmentForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }, []);

  const resetAppointmentForm = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setAppointmentForm({
      ...buildEmptyAppointmentForm(),
      ...appointmentPrefillRef.current,
      register_date:
        appointmentPrefillRef.current.register_date || today,
      bind_date: appointmentPrefillRef.current.bind_date || today,
    });
    setEditingAppointmentCode(null);
    setSelectedAppointmentHistoryKey(null);
    setAppointmentError(null);
  }, []);

  const handleOpenNewAppointment = useCallback(() => {
    resetAppointmentForm();
  }, [resetAppointmentForm]);

  const fetchAppointmentHistory = useCallback(async () => {
    if (!customerIdAll) {
      setAppointmentHistory([]);
      setAppointmentHistoryError("ไม่พบ ID ลูกค้าสำหรับประวัติ");
      return;
    }
    setAppointmentHistoryLoading(true);
    setAppointmentHistoryError(null);
    try {
      const response = await fetch(
        `/api/appointments?id_all=${encodeURIComponent(customerIdAll)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่สามารถโหลดประวัตินัดหมายได้");
      }
      setAppointmentHistory(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      setAppointmentHistory([]);
      setAppointmentHistoryError(
        error?.message || "ไม่สามารถโหลดประวัตินัดหมายได้"
      );
    } finally {
      setAppointmentHistoryLoading(false);
    }
  }, [customerIdAll]);

  const handleSelectAppointmentHistory = useCallback(
    (entry: AppointmentHistoryItem, key: string) => {
      const normalized: Record<string, string> = {};
      appointmentFieldMeta.forEach((meta) => {
        const rawValue = entry[meta.key];
        normalized[meta.key] =
          rawValue === undefined || rawValue === null ? "" : String(rawValue);
      });
      if (!normalized.id_all) {
        normalized.id_all = customerIdAll;
      }
      setAppointmentForm({
        ...buildEmptyAppointmentForm(),
        ...normalized,
      });
      setEditingAppointmentCode(entry.appoint_code ? String(entry.appoint_code) : null);
      setSelectedAppointmentHistoryKey(key);
      setAppointmentError(null);
    },
    [customerIdAll]
  );

  useEffect(() => {
    if (!showOPDPopup) return;
    setThaiAddressError(null);
    if (
      thaiProvinces.length &&
      thaiDistricts.length &&
      thaiSubdistricts.length
    ) {
      return;
    }
    let cancelled = false;
    setThaiAddressLoading(true);
    fetchThaiAdministrativeData()
      .then((data) => {
        if (cancelled) return;
        setThaiProvinces(data.provinces);
        setThaiDistricts(data.districts);
        setThaiSubdistricts(data.subdistricts);
      })
      .catch((error: any) => {
        if (cancelled) return;
        setThaiAddressError(error?.message || "ไม่สามารถโหลดข้อมูลที่อยู่ได้");
      })
      .finally(() => {
        if (cancelled) return;
        setThaiAddressLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    showOPDPopup,
    thaiProvinces.length,
    thaiDistricts.length,
    thaiSubdistricts.length,
  ]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    appointmentPrefillRef.current = {
      id_all: customerIdAll,
      display_name: customerDisplayName,
      prefix: customerData["prefix"] || "",
      name: customerData["name"] || customerData["ชื่อ"] || "",
      surname: customerData["surname"] || "",
      nickname: customerData["nickname"] || "",
      mobilephone: customerData["mobilephone"] || customerData["phone"] || "",
      email: customerData["email"] || "",
      activity: customerData["activity"] || "",
      note: customerData["note"] || "",
      register_date:
        appointmentPrefillRef.current.register_date || today,
      bind_date: appointmentPrefillRef.current.bind_date || today,
    };
  }, [customerIdAll, customerDisplayName, customerData]);

  useEffect(() => {
    if (!showAppointmentPopup) return;
    fetchAppointmentHistory();
    resetAppointmentForm();
  }, [showAppointmentPopup, fetchAppointmentHistory, resetAppointmentForm]);

  const provinceValue = customerData["province"] || "";
  const amphurValue = customerData["amphur"] || "";
  const tumbonValue = customerData["tumbon"] || "";

  useEffect(() => {
    if (!thaiProvinces.length) {
      setSelectedProvinceId(null);
      return;
    }
    if (!provinceValue) {
      setSelectedProvinceId(null);
      return;
    }
    const match = thaiProvinces.find((item) =>
      matchesAdministrativeName(item, provinceValue)
    );
    setSelectedProvinceId(match ? match.id : null);
  }, [thaiProvinces, provinceValue]);

  useEffect(() => {
    if (!thaiDistricts.length) {
      setSelectedDistrictId(null);
      return;
    }
    if (!selectedProvinceId) {
      setSelectedDistrictId(null);
      return;
    }
    if (!amphurValue) {
      setSelectedDistrictId(null);
      return;
    }
    const match = thaiDistricts.find(
      (item) =>
        item.province_id === selectedProvinceId &&
        matchesAdministrativeName(item, amphurValue)
    );
    setSelectedDistrictId(match ? match.id : null);
  }, [thaiDistricts, selectedProvinceId, amphurValue]);

  useEffect(() => {
    if (!thaiSubdistricts.length) {
      setSelectedSubdistrictId(null);
      return;
    }
    if (!selectedDistrictId) {
      setSelectedSubdistrictId(null);
      return;
    }
    if (!tumbonValue) {
      setSelectedSubdistrictId(null);
      return;
    }
    const match = thaiSubdistricts.find(
      (item) =>
        item.district_id === selectedDistrictId &&
        matchesAdministrativeName(item, tumbonValue)
    );
    setSelectedSubdistrictId(match ? match.id : null);
  }, [thaiSubdistricts, selectedDistrictId, tumbonValue]);

  useEffect(() => {
    if (showOPDPopup && !customerData["country"]) {
      handleFieldChange("country", "Thailand");
    }
  }, [showOPDPopup, customerData["country"], handleFieldChange]);
  const provinceOptions = useMemo(
    () =>
      thaiProvinces.map((province) => ({
        id: province.id,
        label: `${province.name_th} (${province.name_en})`,
      })),
    [thaiProvinces]
  );
  const districtOptions = useMemo(() => {
    if (!selectedProvinceId) return [] as Array<{ id: number; label: string }>;
    return thaiDistricts
      .filter((district) => district.province_id === selectedProvinceId)
      .map((district) => ({
        id: district.id,
        label: `${district.name_th} (${district.name_en})`,
      }));
  }, [thaiDistricts, selectedProvinceId]);
  const subdistrictOptions = useMemo(() => {
    if (!selectedDistrictId) return [] as Array<{ id: number; label: string }>;
    return thaiSubdistricts
      .filter((subdistrict) => subdistrict.district_id === selectedDistrictId)
      .map((subdistrict) => ({
        id: subdistrict.id,
        label: `${subdistrict.name_th} (${subdistrict.name_en})`,
      }));
  }, [thaiSubdistricts, selectedDistrictId]);

  const handleProvinceSelect = (provinceIdValue: string) => {
    if (!provinceIdValue) {
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedSubdistrictId(null);
      handleFieldChange("province", "");
      handleFieldChange("amphur", "");
      handleFieldChange("tumbon", "");
      handleFieldChange("zipcode", "");
      return;
    }
    const numericId = Number(provinceIdValue);
    if (!Number.isFinite(numericId)) return;
    const province = thaiProvinces.find((item) => item.id === numericId);
    setSelectedProvinceId(numericId);
    setSelectedDistrictId(null);
    setSelectedSubdistrictId(null);
    handleFieldChange("province", province?.name_th || province?.name_en || "");
    handleFieldChange("amphur", "");
    handleFieldChange("tumbon", "");
    handleFieldChange("zipcode", "");
  };

  const handleDistrictSelect = (districtIdValue: string) => {
    if (!districtIdValue) {
      setSelectedDistrictId(null);
      setSelectedSubdistrictId(null);
      handleFieldChange("amphur", "");
      handleFieldChange("tumbon", "");
      handleFieldChange("zipcode", "");
      return;
    }
    const numericId = Number(districtIdValue);
    if (!Number.isFinite(numericId)) return;
    const district = thaiDistricts.find((item) => item.id === numericId);
    setSelectedDistrictId(numericId);
    setSelectedSubdistrictId(null);
    handleFieldChange("amphur", district?.name_th || district?.name_en || "");
    handleFieldChange("tumbon", "");
    handleFieldChange("zipcode", "");
  };

  const handleSubdistrictSelect = (subdistrictIdValue: string) => {
    if (!subdistrictIdValue) {
      setSelectedSubdistrictId(null);
      handleFieldChange("tumbon", "");
      handleFieldChange("zipcode", "");
      return;
    }
    const numericId = Number(subdistrictIdValue);
    if (!Number.isFinite(numericId)) return;
    const subdistrict = thaiSubdistricts.find((item) => item.id === numericId);
    setSelectedSubdistrictId(numericId);
    handleFieldChange("tumbon", subdistrict?.name_th || subdistrict?.name_en || "");
    handleFieldChange(
      "zipcode",
      subdistrict?.zip_code !== null && subdistrict?.zip_code !== undefined
        ? String(subdistrict.zip_code)
        : ""
    );
  };
  const handleSave = async (options?: { autoClose?: boolean; onSuccess?: () => void }) => {
    // Prevent duplicate submissions
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          data: customerData,
        }),
      });

      const result = await response.json();

      const shouldClose = options?.autoClose !== false;
      if (result.success) {
        options?.onSuccess?.();
        setNotification({
          isOpen: true,
          type: "success",
          title: "✨ บันทึกสำเร็จ!",
          message: "ข้อมูลลูกค้าได้รับการอัปเดตเรียบร้อยแล้ว",
        });

        // Wait for notification to display then close
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
          if (shouldClose) {
            setTimeout(() => {
              onSave(customerData);
              onClose();
            }, 300); // Wait for fade out animation
          }
        }, 2000); // Show notification for 2 seconds
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "❌ บันทึกไม่สำเร็จ!",
          message:
            result.error ||
            "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
        });
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
        }, 3000);
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "❌ บันทึกไม่สำเร็จ!",
        message:
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
      });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFromOPD = () => {
    handleFieldChange("is_opd", 1);
    handleSave({
      autoClose: false,
      onSuccess: () => {
        setShowOPDPopup(false);
      },
    });
  };

  const handleSaveAppointment = async () => {
    if (appointmentLoading) return;
    const sanitizedForm = Object.entries(appointmentForm).reduce(
      (acc, [key, value]) => {
        const normalized = typeof value === "string" ? value.trim() : value;
        if (
          normalized !== "" &&
          normalized !== null &&
          normalized !== undefined
        ) {
          acc[key] = normalized as string | number;
        }
        return acc;
      },
      {} as Record<string, string | number>
    );

    delete sanitizedForm.record_no;
    const normalizedIdAll =
      sanitizedForm.id_all || customerIdAll || appointmentPrefillRef.current.id_all;
    if (normalizedIdAll) {
      sanitizedForm.id_all = normalizedIdAll;
    }

    if (!sanitizedForm.id_all) {
      setAppointmentError("ต้องเลือกผู้รับบริการก่อนบันทึกนัดหมาย");
      return;
    }

    setAppointmentLoading(true);
    setAppointmentError(null);
    try {
      const isEditing = Boolean(editingAppointmentCode);
      const endpoint = isEditing
        ? `/api/appointments/${encodeURIComponent(editingAppointmentCode!)}`
        : "/api/appointments";
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: sanitizedForm }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่สามารถบันทึกนัดหมายได้");
      }

      setNotification({
        isOpen: true,
        type: "success",
        title: isEditing ? "แก้ไขเรียบร้อย" : "บันทึกนัดหมายแล้ว",
        message: isEditing
          ? "ข้อมูลการนัดหมายได้รับการอัปเดตใน bjh_appointment"
          : "ข้อมูลนัดหมายถูกส่งไปยัง bjh_appointment เรียบร้อย",
      });
      resetAppointmentForm();
      fetchAppointmentHistory();
    } catch (error: any) {
      setAppointmentError(error?.message || "ไม่สามารถบันทึกนัดหมายได้");
    } finally {
      setAppointmentLoading(false);
    }
  };

  console.log("🎨 EditCustomerModal render - isOpen:", isOpen);

  if (!isOpen) return null;

  // Format date value for input (YYYY-MM-DD)
  const formatDateForInput = (dateValue: any) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // Format time value for input (HH:MM)
  const formatTimeForInput = (timeValue: any) => {
    if (!timeValue) return "";
    if (typeof timeValue === "string" && timeValue.match(/^\d{2}:\d{2}/)) {
      return timeValue.substring(0, 5);
    }
    return timeValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden w-full max-w-4xl animate-slideUp transform transition-all">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-10 shadow-lg">
          {/* Close button - top right */}
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Centered Tabs */}
          <div className="flex justify-center items-center gap-1 sm:gap-2 px-4 py-4">
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === "contact" ? "bg-white/30 shadow-inner" : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px]`}
              title="Contact Information"
            >
              <User className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">Contact</span>
            </button>
            <button
              onClick={() => setActiveTab("opd")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === "opd" ? "bg-white/30 shadow-inner" : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px]`}
              title="OPD"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">OPD</span>
            </button>
            <button
              onClick={() => setActiveTab("consent")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === "consent" ? "bg-white/30 shadow-inner" : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px]`}
              title="Consent"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">Consent</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("service");
                handleOpenServicePopup();
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === "service" ? "bg-white/30 shadow-inner" : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px] relative`}
              title="บริการ"
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">บริการ</span>
              {selectedServices.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-400 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {selectedServices.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("appointment")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === "appointment" ? "bg-white/30 shadow-inner" : "bg-white/10 hover:bg-white/20"
                } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px]`}
              title="นัดหมาย"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">นัดหมาย</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content - Show content based on active tab */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 180px)" }}
        >
          {/* Contact Information Tab Content */}
          {activeTab === "contact" && (
            <div className="p-6 space-y-6">
              {/* Section 1: ข้อมูลส่วนตัว */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    ข้อมูลส่วนตัว
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* status */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                    <select
                      value={customerData["status"] || customerData["สถานะ"] || ""}
                      onChange={(e) => handleFieldChange("status", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกสถานะ</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* prefix */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">คำนำหน้า</label>
                    <select
                      value={customerData["prefix"] || ""}
                      onChange={(e) => handleFieldChange("prefix", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>
                  {/* name */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ *</label>
                    <input
                      type="text"
                      value={customerData["name"] || customerData["ชื่อ"] || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
                      placeholder="กรอกชื่อ"
                    />
                  </div>
                  {/* surname */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล</label>
                    <input
                      type="text"
                      value={customerData["surname"] || ""}
                      onChange={(e) => handleFieldChange("surname", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
                      placeholder="กรอกนามสกุล"
                    />
                  </div>
                  {/* nickname */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={customerData["nickname"] || ""}
                      onChange={(e) => handleFieldChange("nickname", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
                      placeholder="กรอกชื่อเล่น"
                    />
                  </div>
                  {/* gender */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เพศ</label>
                    <select
                      value={customerData["gender"] || ""}
                      onChange={(e) => handleFieldChange("gender", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                  {/* star_flag */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ติดดาว</label>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("star_flag", customerData["star_flag"] === "ติดดาว" ? "" : "ติดดาว")}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl hover:border-cyan-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Star className={`w-6 h-6 ${customerData["star_flag"] === "ติดดาว" ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {customerData["star_flag"] === "ติดดาว" ? "ติดดาวแล้ว" : "คลิกเพื่อติดดาว"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: ข้อมูลติดต่อ */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ข้อมูลติดต่อ
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* phone */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เบอร์โทร</label>
                    <input
                      type="tel"
                      value={customerData["phone"] || customerData["เบอร์โทร"] || ""}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                      placeholder="กรอกเบอร์โทร"
                    />
                  </div>
                  {/* email */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล</label>
                    <input
                      type="email"
                      value={customerData["email"] || ""}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                      placeholder="กรอกอีเมล"
                    />
                  </div>
                  {/* lineid */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ไลน์ไอดี</label>
                    <input
                      type="text"
                      value={customerData["lineid"] || ""}
                      onChange={(e) => handleFieldChange("lineid", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                      placeholder="กรอกไลน์ไอดี"
                    />
                  </div>
                  {/* facebook */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เฟสบุ๊ค</label>
                    <input
                      type="text"
                      value={customerData["facebook"] || ""}
                      onChange={(e) => handleFieldChange("facebook", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                      placeholder="กรอกเฟสบุ๊ค"
                    />
                  </div>
                  {/* country */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ประเทศ</label>
                    <select
                      value={customerData["country"] || customerData["ประเทศ"] || ""}
                      onChange={(e) => handleFieldChange("country", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกประเทศ</option>
                      {countryOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: ข้อมูลธุรกิจ */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ข้อมูลธุรกิจ
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* source */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">แหล่งที่มา</label>
                    <select
                      value={customerData["source"] || customerData["  แหล่งที่มา"] || ""}
                      onChange={(e) => handleFieldChange("source", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกแหล่งที่มา</option>
                      {sourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* interested_product */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ผลิตภัณฑ์ที่สนใจ</label>
                    <select
                      value={customerData["interested_product"] || customerData[" ผลิตภัณฑ์ที่สนใจ"] || ""}
                      onChange={(e) => handleFieldChange("interested_product", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกผลิตภัณฑ์</option>
                      {productOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* contact_staff */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ผู้ติดต่อ</label>
                    <select
                      value={customerData["contact_staff"] || customerData["ผู้ติดต่อ"] || ""}
                      onChange={(e) => handleFieldChange("contact_staff", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกผู้ติดต่อ</option>
                      {contactPersonOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* proposed_amount */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ยอดนำเสนอ</label>
                    <input
                      type="number"
                      value={customerData["proposed_amount"] || customerData["ยอดนำเสนอ"] || ""}
                      onChange={(e) => handleFieldChange("proposed_amount", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                      placeholder="กรอกยอดนำเสนอ"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: วันที่ติดตาม */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    วันที่ติดตาม
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* got_contact_date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ได้ชื่อ เบอร์
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["got_contact_date"] || customerData["วันที่ได้ชื่อ เบอร์ "])}
                      onChange={(e) => handleFieldChange("got_contact_date", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* last_followup */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ติดตามครั้งล่าสุด
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["last_followup"] || customerData["วันที่ติดตามครั้งล่าสุด"])}
                      onChange={(e) => handleFieldChange("last_followup", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* next_followup */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ติดตามครั้งถัดไป
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["next_followup"] || customerData["วันที่ติดตามครั้งถัดไป"])}
                      onChange={(e) => handleFieldChange("next_followup", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: วันที่ Consult */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    วันที่ Consult
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* booked_consult_date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ได้นัด consult
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["booked_consult_date"] || customerData["วันที่ได้นัด consult"])}
                      onChange={(e) => handleFieldChange("booked_consult_date", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* consult_date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ Consult
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["consult_date"] || customerData["  วันที่ Consult"])}
                      onChange={(e) => handleFieldChange("consult_date", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: วันที่ผ่าตัด */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    วันที่ผ่าตัด
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* booked_surgery_date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ได้นัดผ่าตัด
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["booked_surgery_date"] || customerData["วันที่ได้นัดผ่าตัด"])}
                      onChange={(e) => handleFieldChange("booked_surgery_date", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* surgery_date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span> วันที่ผ่าตัด
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(customerData["surgery_date"] || customerData["วันที่ผ่าตัด"])}
                      onChange={(e) => handleFieldChange("surgery_date", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* appointment_time */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>⏰</span> เวลาที่นัด
                    </label>
                    <input
                      type="time"
                      value={formatTimeForInput(customerData["appointment_time"] || customerData["เวลาที่นัด"])}
                      onChange={(e) => handleFieldChange("appointment_time", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: หมายเหตุ */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    หมายเหตุ
                  </h2>
                </div>
                <textarea
                  value={customerData["note"] || customerData["หมายเหตุ"] || ""}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-200 bg-white rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none min-h-[120px] resize-none"
                  placeholder="📝 พิมพ์หมายเหตุ..."
                />
              </div>
            </div>
          )}

          {/* OPD Tab Content */}
          {activeTab === "opd" && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ข้อมูล OPD - ที่อยู่
                  </h2>
                </div>
                {thaiAddressLoading && (
                  <p className="text-xs text-emerald-600 mb-4">กำลังโหลดข้อมูลจังหวัด/อำเภอ/ตำบล...</p>
                )}
                {thaiAddressError && (
                  <p className="text-xs text-red-600 mb-4">{thaiAddressError}</p>
                )}
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">บ้านเลขที่</label>
                    <input
                      type="text"
                      value={customerData["locno"] || ""}
                      onChange={(e) => handleFieldChange("locno", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                      placeholder="ระบุบ้านเลขที่"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">จังหวัด</label>
                      <select
                        value={selectedProvinceId ? String(selectedProvinceId) : ""}
                        onChange={(e) => handleProvinceSelect(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="">เลือกจังหวัด</option>
                        {provinceOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">อำเภอ / เขต</label>
                      <select
                        value={selectedDistrictId ? String(selectedDistrictId) : ""}
                        onChange={(e) => handleDistrictSelect(e.target.value)}
                        disabled={!districtOptions.length}
                        className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer disabled:bg-gray-100"
                      >
                        <option value="">เลือกอำเภอ / เขต</option>
                        {districtOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ตำบล / แขวง</label>
                      <select
                        value={selectedSubdistrictId ? String(selectedSubdistrictId) : ""}
                        onChange={(e) => handleSubdistrictSelect(e.target.value)}
                        disabled={!subdistrictOptions.length}
                        className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer disabled:bg-gray-100"
                      >
                        <option value="">เลือกตำบล / แขวง</option>
                        {subdistrictOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสไปรษณีย์</label>
                      <input
                        type="text"
                        value={customerData["zipcode"] || ""}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-blue-200 bg-gray-100 rounded-xl outline-none text-gray-700"
                        placeholder="รหัสไปรษณีย์ (อัตโนมัติ)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consent Tab Content */}
          {activeTab === "consent" && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Consent Form
                  </h2>
                </div>
                {/* Consent Part Tabs */}
                <div className="flex gap-2 mb-6">
                  {consentPartMeta.map((part) => (
                    <button
                      key={part.key}
                      onClick={() => setSelectedConsentPart(part.key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedConsentPart === part.key
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
                {consentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">น้ำหนัก (kg)</label>
                        <input
                          type="text"
                          value={consentSections[selectedConsentPart]?.weight || ""}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], weight: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                          placeholder="ระบุน้ำหนัก"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ส่วนสูง (cm)</label>
                        <input
                          type="text"
                          value={consentSections[selectedConsentPart]?.height || ""}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], height: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                          placeholder="ระบุส่วนสูง"
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={consentSections[selectedConsentPart]?.hasChronic || false}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], hasChronic: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                        />
                        มีโรคประจำตัว
                      </label>
                      {consentSections[selectedConsentPart]?.hasChronic && (
                        <input
                          type="text"
                          value={consentSections[selectedConsentPart]?.chronicDiseaseDetail || ""}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], chronicDiseaseDetail: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none mt-2"
                          placeholder="ระบุโรคประจำตัว"
                        />
                      )}
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={consentSections[selectedConsentPart]?.hasDrugAllergy || false}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], hasDrugAllergy: e.target.checked }
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                        />
                        มีประวัติแพ้ยา
                      </label>
                      {consentSections[selectedConsentPart]?.hasDrugAllergy && (
                        <input
                          type="text"
                          value={consentSections[selectedConsentPart]?.drugAllergyDetail || ""}
                          onChange={(e) => setConsentSections((prev) => ({
                            ...prev,
                            [selectedConsentPart]: { ...prev[selectedConsentPart], drugAllergyDetail: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none mt-2"
                          placeholder="ระบุยาที่แพ้"
                        />
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ยินยอมรับการรักษา</label>
                      <select
                        value={consentSections[selectedConsentPart]?.medicalConsent || ""}
                        onChange={(e) => setConsentSections((prev) => ({
                          ...prev,
                          [selectedConsentPart]: { ...prev[selectedConsentPart], medicalConsent: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="">เลือก</option>
                        {medicalConsentOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ยอมรับ PDPA</label>
                      <select
                        value={consentSections[selectedConsentPart]?.acceptPdpa || ""}
                        onChange={(e) => setConsentSections((prev) => ({
                          ...prev,
                          [selectedConsentPart]: { ...prev[selectedConsentPart], acceptPdpa: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="">เลือก</option>
                        {acceptOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ยินยอมเผยแพร่สื่อ</label>
                      <select
                        value={consentSections[selectedConsentPart]?.acceptMedia || ""}
                        onChange={(e) => setConsentSections((prev) => ({
                          ...prev,
                          [selectedConsentPart]: { ...prev[selectedConsentPart], acceptMedia: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="">เลือก</option>
                        {acceptOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    {/* Signature Pad */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ลายเซ็น</label>
                      <SignaturePad
                        value={consentSections[selectedConsentPart]?.signatureUrl || ""}
                        onChange={(url) => setConsentSections((prev) => ({
                          ...prev,
                          [selectedConsentPart]: { ...prev[selectedConsentPart], signatureUrl: url }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Tab Content */}
          {activeTab === "service" && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    บริการ
                  </h2>
                </div>
                {/* Service Group Selection */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">กลุ่มบริการ</label>
                    <select
                      value={selectedOpdGroupCode}
                      onChange={(e) => setSelectedOpdGroupCode(e.target.value)}
                      disabled={groupsLoading}
                      className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none cursor-pointer"
                    >
                      <option value="">เลือกกลุ่มบริการ</option>
                      {opdGroups.map((group) => (
                        <option key={group.groupcode} value={group.groupcode}>{group.groupname}</option>
                      ))}
                    </select>
                  </div>
                  {/* Service Search */}
                  {selectedOpdGroupCode && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ค้นหาบริการ</label>
                      <input
                        type="text"
                        value={serviceSearchTerm}
                        onChange={(e) => setServiceSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                        placeholder="พิมพ์ชื่อบริการ..."
                      />
                    </div>
                  )}
                  {/* Selected Services Summary */}
                  {selectedServices.length > 0 && (
                    <div className="bg-purple-100 rounded-xl p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">บริการที่เลือก ({selectedServices.length})</h3>
                      <div className="space-y-2">
                        {selectedServices.map((svc) => (
                          <div key={svc.id} className="flex justify-between items-center bg-white rounded-lg p-2">
                            <span className="text-sm text-gray-700">{svc.itemname}</span>
                            <span className="text-sm font-semibold text-purple-600">
                              {formatCurrencyDisplay(calculateServiceEntryTotal(svc))} ฿
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointment Tab Content */}
          {activeTab === "appointment" && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    นัดหมาย
                  </h2>
                </div>
                {appointmentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointmentSections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <h3 className="font-semibold text-gray-800">{section.title}</h3>
                        <div className={`grid ${section.columns || "grid-cols-1 md:grid-cols-2"} gap-4`}>
                          {section.fields.map((fieldKey) => {
                            const fieldMeta = appointmentFieldMetaMap[fieldKey];
                            if (!fieldMeta) return null;
                            return (
                              <div key={fieldKey} className={fieldMeta.fullWidth ? "col-span-full" : ""}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{fieldMeta.label}</label>
                                {fieldMeta.type === "textarea" ? (
                                  <textarea
                                    value={appointmentForm[fieldKey] || ""}
                                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                                    readOnly={fieldMeta.readOnly}
                                    className="w-full px-4 py-3 border-2 border-orange-200 bg-white rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none min-h-[100px] resize-none"
                                    placeholder={fieldMeta.placeholder}
                                  />
                                ) : (
                                  <input
                                    type={fieldMeta.type || "text"}
                                    value={appointmentForm[fieldKey] || ""}
                                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                                    readOnly={fieldMeta.readOnly}
                                    className={`w-full px-4 py-3 border-2 border-orange-200 ${fieldMeta.readOnly ? "bg-gray-100" : "bg-white"} rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none`}
                                    placeholder={fieldMeta.placeholder}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Appointment History */}
                    {appointmentHistory.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 mb-4">ประวัตินัดหมาย</h3>
                        <div className="space-y-2">
                          {appointmentHistory.map((item, idx) => (
                            <div
                              key={resolveAppointmentHistoryKey(item, idx)}
                              className="bg-white border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => {
                                const key = resolveAppointmentHistoryKey(item, idx);
                                setSelectedAppointmentHistoryKey(selectedAppointmentHistoryKey === key ? null : key);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{item.activity || "ไม่ระบุกิจกรรม"}</span>
                                <span className="text-xs text-gray-500">{formatAppointmentDateTimeLabel(item.start_date)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Gradient */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 p-4 sm:p-5 flex justify-center gap-4 shadow-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => handleSave()}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* OPD Popup Modal */}
      {showOPDPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowOPDPopup(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">เปิด OPD</h2>
              </div>
              <button
                onClick={() => setShowOPDPopup(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-6">
              <div className="space-y-2 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-800">ข้อมูล OPD</p>
                <p className="text-slate-500">เลือกตำแหน่งที่ตั้งเพื่อบันทึกลง bjh_master_customers พร้อม LocNo และ Zipcode อัตโนมัติ</p>
                {thaiAddressLoading && (
                  <p className="text-xs text-emerald-600">กำลังโหลดข้อมูลจังหวัด/อำเภอ/ตำบล...</p>
                )}
                {thaiAddressError && (
                  <p className="text-xs text-red-600">{thaiAddressError}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">บ้านเลขที่</label>
                  <input
                    type="text"
                    value={customerData["locno"] || ""}
                    onChange={(event) => handleFieldChange("locno", event.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-gray-900 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none transition"
                    placeholder="ระบุบ้านเลขที่"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">จังหวัด</label>
                    <select
                      value={selectedProvinceId ? String(selectedProvinceId) : ""}
                      onChange={(event) => handleProvinceSelect(event.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-gray-900 transition focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">อำเภอ / เขต</label>
                    <select
                      value={selectedDistrictId ? String(selectedDistrictId) : ""}
                      onChange={(event) => handleDistrictSelect(event.target.value)}
                      disabled={!districtOptions.length}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-gray-900 transition focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">เลือกอำเภอ / เขต</option>
                      {districtOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ตำบล / แขวง</label>
                  <select
                    value={selectedSubdistrictId ? String(selectedSubdistrictId) : ""}
                    onChange={(event) => handleSubdistrictSelect(event.target.value)}
                    disabled={!subdistrictOptions.length}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-gray-900 transition focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">เลือกตำบล / แขวง</option>
                    {subdistrictOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Zipcode</label>
                    <input
                      type="text"
                      value={customerData["zipcode"] || ""}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-100 text-gray-700"
                      placeholder="จะถูกกรอกอัตโนมัติ"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={customerData["country"] || "Thailand"}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-100 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOPDPopup(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:border-slate-400 transition"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={handleSaveFromOPD}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-60"
                >
                  {isLoading ? "กำลังบันทึก..." : "บันทึก OPD"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Popup Modal */}
      {showConsentPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConsentPopup(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Consent</h2>
              </div>
              <button
                onClick={() => setShowConsentPopup(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-lg font-semibold text-slate-800">ข้อมูล Consent</p>
                  <p className="text-sm text-slate-500">
                    บันทึกน้ำหนัก, ส่วนสูง และประวัติสุขภาพเพื่อนำไปใช้ใน Consent Form
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveConsentForms}
                  disabled={consentSaving || consentLoading}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {consentSaving ? "กำลังบันทึก" : "บันทึก Consent"}
                </button>
              </div>
              <div className="space-y-1">
                {consentLoadError && (
                  <p className="text-xs text-red-600">{consentLoadError}</p>
                )}
                {consentLoading && (
                  <p className="text-xs text-slate-500">กำลังโหลดข้อมูล Consent...</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {consentPartMeta.map((part) => (
                  <button
                    key={part.key}
                    type="button"
                    onClick={() => setSelectedConsentPart(part.key)}
                    className={`rounded-2xl px-4 py-2 text-xs font-semibold transition border shadow-sm ${selectedConsentPart === part.key
                      ? "bg-purple-600 text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {part.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-xs font-semibold uppercase tracking-wider text-slate-500">
                  น้ำหนัก (กก.)
                  <input
                    type="number"
                    value={currentConsentSection.weight}
                    onChange={(e) =>
                      handleConsentSectionChange(selectedConsentPart, { weight: e.target.value })
                    }
                    className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="เช่น 60"
                  />
                </label>
                <label className="flex flex-col text-xs font-semibold uppercase tracking-wider text-slate-500">
                  ส่วนสูง (ซม.)
                  <input
                    type="number"
                    value={currentConsentSection.height}
                    onChange={(e) =>
                      handleConsentSectionChange(selectedConsentPart, { height: e.target.value })
                    }
                    className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="เช่น 170"
                  />
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  มีโรคประจำตัวหรือไม่
                </p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: "ไม่มี", value: false }, { label: "มี", value: true }].map((option) => (
                    <button
                      key={`chronic-${option.value}`}
                      type="button"
                      onClick={() =>
                        handleConsentToggle(selectedConsentPart, "hasChronic", option.value)
                      }
                      className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition border ${currentConsentSection.hasChronic === option.value
                        ? "bg-indigo-600 text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {currentConsentSection.hasChronic && (
                  <textarea
                    value={currentConsentSection.chronicDiseaseDetail}
                    onChange={(e) =>
                      handleConsentSectionChange(selectedConsentPart, {
                        chronicDiseaseDetail: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="โปรดระบุชื่อโรค / การรักษาที่กำลังรับอยู่"
                    rows={3}
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  มีประวัติแพ้ยาหรือไม่
                </p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: "ไม่มี", value: false }, { label: "มี", value: true }].map((option) => (
                    <button
                      key={`drug-${option.value}`}
                      type="button"
                      onClick={() =>
                        handleConsentToggle(selectedConsentPart, "hasDrugAllergy", option.value)
                      }
                      className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition border ${currentConsentSection.hasDrugAllergy === option.value
                        ? "bg-indigo-600 text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {currentConsentSection.hasDrugAllergy && (
                  <textarea
                    value={currentConsentSection.drugAllergyDetail}
                    onChange={(e) =>
                      handleConsentSectionChange(selectedConsentPart, {
                        drugAllergyDetail: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="ระบุชื่อยา / อาการแพ้"
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    ลายเซ็น ({
                      consentPartMeta.find((part) => part.key === selectedConsentPart)?.label
                    })
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        medical_consent
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        เพียงเลือก "ยินยอม" หรือ "ไม่ยินยอม" ก่อนบันทึกลายเซ็น
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      สถานะ: {currentConsentSection.medicalConsent || "ยังไม่เลือก"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalConsentOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleConsentSectionChange(selectedConsentPart, { medicalConsent: option })}
                        className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-colors border shadow-sm ${currentConsentSection.medicalConsent === option
                          ? "bg-purple-600 text-white border-transparent"
                          : "bg-white text-purple-700 border-purple-200 hover:border-purple-400"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs leading-relaxed text-slate-600 space-y-1">
                    {medicalConsentAcknowledgementText.map((line, index) => (
                      <p key={`${line}-${index}`} className={index === 0 ? "font-semibold text-slate-900" : ""}>
                        {line}
                      </p>
                    ))}
                    <p className="text-[10px] text-slate-400">
                      เลื่อนอ่านก่อนตัดสินใจ แล้วลงลายเซ็นด้านล่าง
                    </p>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        accept_pdpa
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        PDPA – ยินยอมให้ข้อมูลส่วนบุคคลถูกใช้ตามนโยบาย
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      สถานะ: {currentConsentSection.acceptPdpa || "ยังไม่เลือก"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {acceptOptions.map((option) => (
                      <button
                        key={`pdpa-${option}`}
                        type="button"
                        onClick={() => handleConsentSectionChange(selectedConsentPart, { acceptPdpa: option })}
                        className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-colors border shadow-sm ${currentConsentSection.acceptPdpa === option
                          ? "bg-purple-600 text-white border-transparent"
                          : "bg-white text-purple-700 border-purple-200 hover:border-purple-400"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs leading-relaxed text-slate-600 space-y-1">
                    {pdpaTextBlock.map((line, index) => (
                      <p key={`${line}-${index}`} className={index === 0 ? "font-semibold text-slate-900" : ""}>
                        {line}
                      </p>
                    ))}
                    <p className="text-[10px] text-slate-400">เลื่อนอ่านก่อนตัดสินใจ</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        accept_media
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        ยินยอมรับข่าวสารหรือการใช้ภาพสำหรับงานประชาสัมพันธ์
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      สถานะ: {currentConsentSection.acceptMedia || "ยังไม่เลือก"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {acceptOptions.map((option) => (
                      <button
                        key={`media-${option}`}
                        type="button"
                        onClick={() => handleConsentSectionChange(selectedConsentPart, { acceptMedia: option })}
                        className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-colors border shadow-sm ${currentConsentSection.acceptMedia === option
                          ? "bg-purple-600 text-white border-transparent"
                          : "bg-white text-purple-700 border-purple-200 hover:border-purple-400"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs leading-relaxed text-slate-600 space-y-1">
                    {mediaTextBlock.map((line, index) => (
                      <p key={`${line}-${index}`} className={index === 0 ? "font-semibold text-slate-900" : ""}>
                        {line}
                      </p>
                    ))}
                    <p className="text-[10px] text-slate-400">เลื่อนอ่านก่อนตัดสินใจ</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  ข้อมูลน้ำหนัก ส่วนสูง และประวัติสุขภาพที่ระบุด้านบนจะถูกแนบใน Consent Form พร้อมสัญญาและลายเซ็น
                </p>
                <SignaturePad
                  value={currentConsentSection.signatureUrl}
                  onChange={(value) => handleConsentSignatureChange(selectedConsentPart, value)}
                />
                {currentConsentSection.signatureUrl && (
                  <div className="space-y-1 rounded-2xl border border-slate-200 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      ตัวอย่างลายเซ็นที่บันทึกไว้
                    </p>
                    <img
                      src={currentConsentSection.signatureUrl}
                      alt="Signature preview"
                      className="h-16 w-full rounded-lg border border-slate-100 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between border-t px-6 py-4">
              <div>
                <p className="text-xs text-slate-500">
                  บันทึก Consent จะถูกเก็บแยกตามส่วน (part) ที่เลือก
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveConsentForms}
                disabled={consentSaving || consentLoading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {consentSaving ? "กำลังบันทึก Consent..." : "บันทึก Consent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Popup Modal - OPD Service */}
      {showServicePopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-5 text-white">
              <div>
                <h2 className="text-2xl font-bold">บริการ OPD</h2>
                <p className="mt-1 text-sm text-white/80">
                  เลือกบริการและกำหนด Charge / Discount
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseServicePopup}
                className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Group selector */}
            <div className="border-b bg-gray-50 px-8 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">กลุ่มบริการ:</label>
                <select
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={selectedOpdGroupCode}
                  onChange={(e) => handleGroupSelect(e.target.value)}
                >
                  <option value="">เลือกกลุ่มบริการ</option>
                  {opdGroups.map((group) => (
                    <option key={group.groupcode} value={group.groupcode}>
                      {group.groupname}
                    </option>
                  ))}
                </select>
                {groupsLoading && (
                  <span className="text-sm text-gray-500">กำลังโหลดกลุ่มบริการ...</span>
                )}
                {selectedServices.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    เลือกแล้ว {selectedServices.length} รายการ
                  </span>
                )}
              </div>
            </div>
            <div className="border-b bg-white/80 px-8 py-3 text-sm text-gray-600">
              {saleItemsHistoryLoading ? (
                <span>กำลังโหลดประวัติ b_saleitem...</span>
              ) : saleItemsHistoryError ? (
                <span className="text-red-600">{saleItemsHistoryError}</span>
              ) : saleHistorySummary.count === 0 ? (
                <span>ยังไม่มีรายการบันทึกใน b_saleitem</span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    บันทึกแล้ว {saleHistorySummary.count} รายการ · ยอดรวม {formatCurrencyDisplay(
                      saleHistorySummary.total
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleShowHistory}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    ดูประวัติทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {/* Two-column content */}
            <div className="grid max-h-[65vh] grid-cols-1 gap-0 md:grid-cols-2">
              {/* Left: Selected services */}
              <div className="flex flex-col border-r border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 max-h-[65vh]">
                <div className="border-b bg-white/80 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">📝 บริการที่เลือก</h3>
                  <p className="text-xs text-gray-500">
                    {selectedServices.length} รายการ
                    {selectedOpdGroup && ` · ${selectedOpdGroup.groupname}`}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedServices.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-3 text-5xl">📂</div>
                      <p className="text-sm text-gray-500">ยังไม่มีบริการที่เลือก</p>
                      <p className="text-xs text-gray-400">เลือกจากรายการทางขวามือ</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {selectedServices.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-white bg-white p-4 shadow-md transition hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{entry.itemname}</p>
                                <p className="text-xs text-gray-500">
                                  รหัส {entry.itemcode} · ราคา {formatCurrencyDisplay(entry.salesprice)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceEntry(entry.id)}
                                className="ml-2 rounded-full bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-emerald-50 p-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                  Charge
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="บาท"
                                    value={entry.chargePrice}
                                    onChange={(e) => handleChargePriceChange(entry.id, e.target.value)}
                                    className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="%"
                                    value={entry.chargePercent}
                                    onChange={(e) => handleChargePercentChange(entry.id, e.target.value)}
                                    className="w-16 rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-center text-sm focus:border-emerald-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="rounded-xl bg-rose-50 p-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                                  Discount
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="บาท"
                                    value={entry.discountPrice}
                                    onChange={(e) => handleDiscountPriceChange(entry.id, e.target.value)}
                                    className="w-full rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="%"
                                    value={entry.discountPercent}
                                    onChange={(e) => handleDiscountPercentChange(entry.id, e.target.value)}
                                    className="w-16 rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-center text-sm focus:border-rose-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-sm font-semibold text-indigo-600">
                              <span>ยอดสุทธิ</span>
                              <span>{formatCurrencyDisplay(calculateServiceEntryTotal(entry))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-inner">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>สรุปยอด</span>
                          <span>{selectedServices.length} รายการ</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>รวมราคาพื้นฐาน</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.baseTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>รวมค่า Charge</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.chargeTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>รวมส่วนลด</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.discountTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-semibold text-indigo-600">
                            <span>ยอดสุทธิทั้งหมด</span>
                            <span>{formatCurrencyDisplay(selectedServicesTotals.netTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Available services */}
              <div className="flex flex-col bg-white max-h-[65vh]">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">📜 รายการบริการ</h3>
                  {selectedOpdGroup && (
                    <p className="text-xs text-gray-500">{selectedOpdGroup.groupname}</p>
                  )}
                </div>
                <div className="px-6 py-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 ค้นหาบริการ..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                  {servicesLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    </div>
                  )}
                  {serviceError && (
                    <p className="py-4 text-center text-sm text-red-600">{serviceError}</p>
                  )}
                  {!servicesLoading && !serviceError && filteredServiceItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-2 text-4xl">💭</div>
                      <p className="text-sm text-gray-500">
                        {selectedOpdGroupCode ? "ไม่พบรายการบริการ" : "เลือกกลุ่มบริการก่อน"}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {filteredServiceItems.map((item) => {
                      const alreadyAdded = selectedServices.some(
                        (entry) => entry.itemcode === item.itemcode
                      );
                      return (
                        <div
                          key={item.itemcode}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${alreadyAdded
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50"
                            }`}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.itemname}</p>
                            <p className="text-xs text-gray-500">
                              ราคา {formatCurrencyDisplay(item.saleprice)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddService(item)}
                            disabled={alreadyAdded}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${alreadyAdded
                              ? "bg-emerald-200 text-emerald-700"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow hover:shadow-md"
                              }`}
                          >
                            {alreadyAdded ? "✓ เลือกแล้ว" : "เพิ่ม"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>



            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-gray-50 px-8 py-4">
              <p className="text-sm text-gray-600">
                เลือกแล้ว <span className="font-bold text-indigo-600">{selectedServices.length}</span> รายการ
                <span className="mx-2 hidden text-xs text-gray-400 md:inline">·</span>
                <span className="mr-1">ยอดสุทธิ</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrencyDisplay(selectedServicesTotals.netTotal)}
                </span>
              </p>
              <button
                type="button"
                onClick={handleCompleteServiceSelection}
                disabled={savingServices || selectedServices.length === 0}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingServices ? "กำลังบันทึกบริการ..." : "เสร็จสิ้น"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={handleCloseHistory}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-lg font-semibold text-slate-800">ประวัติ b_saleitem</p>
                <p className="text-xs text-slate-500">แสดงรายการรวมที่เก็บไว้สำหรับลูกค้านี้</p>
              </div>
              <button
                type="button"
                onClick={handleCloseHistory}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto">
              {saleItemsHistory.length === 0 ? (
                <p className="text-sm text-slate-500">ยังไม่มีประวัติการบันทึกในหน้าต่างนี้</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[120px_120px_1fr_96px] items-center gap-2 text-[11px] font-semibold uppercase text-slate-500">
                    <span>วันที่</span>
                    <span>เลขที่ใบเสร็จ</span>
                    <span>รายการ</span>
                    <span className="text-right">ยอดสุทธิ</span>
                  </div>
                  <div className="space-y-1">
                    {saleItemsHistory.map((historyItem, index) => (
                      <div
                        key={`${historyItem.sale_date}-${historyItem.receipt_no}-${index}`}
                        className="grid grid-cols-[120px_120px_1fr_96px] items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <span className="text-[13px] font-medium text-slate-600">
                          {historyItem.sale_date || "-"}
                        </span>
                        <span className="text-[13px] font-medium text-slate-600">
                          {historyItem.receipt_no || "-"}
                        </span>
                        <span className="truncate" title={historyItem.item_name}>
                          {historyItem.item_name || "-"}
                        </span>
                        <span className="text-right font-semibold text-slate-800">
                          {formatCurrencyDisplay(toNumericValue(historyItem.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleCloseHistory}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Popup Modal */}
      {showAppointmentPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAppointmentPopup(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">นัดหมาย</h2>
              </div>
              <button
                onClick={() => setShowAppointmentPopup(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-6">
              <div className="space-y-2 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-800">ตารางนัดหมาย</p>
                <p className="text-slate-500">
                  กรอกข้อมูลเพื่อสร้างเรกคอร์ดในตาราง `bjh_appointment` พร้อมผูกกับลูกค้ารายนี้
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      ประวัตินัดหมาย ({appointmentHistory.length})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      แสดงรายการล่าสุดจาก `id_all` เดียวกัน
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewAppointment}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                  >
                    เพิ่มนัดหมายใหม่
                  </button>
                </div>
                {appointmentHistoryLoading ? (
                  <p className="text-xs text-slate-500">กำลังโหลดประวัตินัดหมาย...</p>
                ) : appointmentHistoryError ? (
                  <p className="text-xs text-rose-600">{appointmentHistoryError}</p>
                ) : appointmentHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">ยังไม่มีบันทึกนัดหมายในระบบ</p>
                ) : (
                  <div className="space-y-2">
                    {appointmentHistory.map((entry, index) => {
                      const cardKey = resolveAppointmentHistoryKey(entry, index);
                      const start = formatAppointmentDateTimeLabel(entry.start_date);
                      const end = formatAppointmentDateTimeLabel(entry.end_date);
                      const recordLabel = entry.record_no
                        ? `Record No. ${entry.record_no}`
                        : entry.appoint_code || "ไม่ระบุรหัส";
                      const activity = entry.activity ? String(entry.activity) : null;
                      const note = entry.note ? String(entry.note) : null;
                      return (
                        <div
                          key={cardKey}
                          className={`rounded-2xl border bg-white px-3 py-3 shadow-sm transition ${selectedAppointmentHistoryKey === cardKey
                            ? "border-teal-300 ring-1 ring-teal-200"
                            : "border-slate-200"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800">{recordLabel}</p>
                              <p className="text-[11px] text-slate-500">
                                วันนัด {start} · ครบกำหนด {end}
                              </p>
                              {activity && (
                                <p className="text-[11px] text-slate-500">
                                  กิจกรรม: {activity}
                                </p>
                              )}
                              {note && (
                                <p className="text-[11px] text-slate-500">
                                  หมายเหตุ: {note}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                disabled={!entry.appoint_code}
                                title={!entry.appoint_code ? "รหัสนัดหมายไม่พร้อม" : "แก้ไขนัดหมายนี้"}
                                onClick={() => handleSelectAppointmentHistory(entry, cardKey)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${entry.appoint_code
                                  ? "border border-slate-300 text-slate-600 hover:border-slate-400"
                                  : "border border-slate-200 text-slate-400 cursor-not-allowed"
                                  }`}
                              >
                                แก้ไขนัดหมาย
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {appointmentSections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">{section.title}</p>
                  <div
                    className={`grid ${section.columns || "grid-cols-1 md:grid-cols-2"} gap-4`}
                  >
                    {section.fields.map((fieldKey) => {
                      const meta = appointmentFieldMetaMap[fieldKey];
                      if (!meta) return null;
                      const value = appointmentForm[fieldKey] || "";
                      const isTextarea = meta.type === "textarea";
                      const inputType =
                        meta.type === "date"
                          ? "date"
                          : meta.type === "datetime-local"
                            ? "datetime-local"
                            : meta.type === "tel"
                              ? "tel"
                              : "text";
                      return (
                        <div
                          key={fieldKey}
                          className={`group ${meta.fullWidth ? "md:col-span-2" : ""}`}
                        >
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            {meta.label}
                          </label>
                          {isTextarea ? (
                            <textarea
                              rows={4}
                              value={value}
                              onChange={(event) =>
                                handleAppointmentFieldChange(fieldKey, event.target.value)
                              }
                              placeholder={meta.placeholder}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                            />
                          ) : (
                            <input
                              type={inputType}
                              value={value}
                              onChange={(event) =>
                                handleAppointmentFieldChange(fieldKey, event.target.value)
                              }
                              placeholder={meta.placeholder}
                              readOnly={meta.readOnly}
                              disabled={meta.readOnly}
                              className={`w-full px-4 py-3 border-2 rounded-2xl transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-gray-900 ${meta.readOnly
                                ? "bg-slate-100 border-slate-200"
                                : "border-slate-200 bg-white"
                                } disabled:cursor-not-allowed`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {appointmentError && (
                <p className="text-sm text-red-600">{appointmentError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAppointmentPopup(false)}
                  className="px-5 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:border-slate-400 transition"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppointment}
                  disabled={appointmentLoading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {appointmentLoading ? "กำลังบันทึก..." : "บันทึกนัดหมาย"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
