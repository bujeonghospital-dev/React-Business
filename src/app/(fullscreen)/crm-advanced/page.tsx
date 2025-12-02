"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "@/types/appointment";
import CustomerRegistrationModal, {
  CustomerFormData,
  LeadSummary,
  StaffOption,
} from "./CustomerRegistrationModal";

// Helper function สำหรับสร้างวันที่แบบ local time (YYYY-MM-DD)
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function สำหรับแปลงเวลาเป็นรูปแบบ "HH:MM น."
const formatTimeDisplay = (time: string | undefined | null): string => {
  if (!time || time === "" || time === "null" || time === "undefined")
    return "-";

  // ถ้าเป็นรูปแบบ HH:MM:SS หรือ HH:MM:SS+07 หรือ HH:MM
  const timeStr = String(time).trim();

  // ลองแยกเวลาด้วย :
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].substring(0, 2).padStart(2, "0");
    return `${hours}:${minutes} น.`;
  }

  // ถ้าไม่ใช่รูปแบบที่รู้จัก ให้ตัดเอา 5 ตัวแรก
  return timeStr.slice(0, 5) + " น.";
};

// Helper สำหรับย่อหมายเหตุให้แสดงเพียงไม่กี่ประโยค
const COMPANY_NAME_LABEL = "บริษัท โรงพยาบาล บีเจเอช จำกัด";
const FOLLOW_NOTE_LABEL = "ลูกค้า Follow อ่านหมายเหตุ";

const getNotePreview = (
  raw: string | null | undefined,
  maxSentences = 2
): string => {
  if (!raw) {
    return "-";
  }

  const normalized = String(raw)
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || normalized.toLowerCase() === "null" || normalized.toLowerCase() === "undefined") {
    return "-";
  }

  const sentences = normalized.match(/[^.!?]+[.!?]?/g);

  if (!sentences || sentences.length <= maxSentences) {
    return normalized.length > 160 ? `${normalized.slice(0, 160).trim()} …` : normalized;
  }

  return `${sentences.slice(0, maxSentences).join(" ").trim()} …`;
};

const getLegacyCustomerName = (appointment: Appointment): string => {
  if (appointment.display_name && appointment.display_name.trim()) {
    return appointment.display_name.trim();
  }

  const parts = [appointment.prefix, appointment.name, appointment.surname]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());

  if (parts.length > 0) {
    return parts.join(" ");
  }

  if (appointment.nickname && appointment.nickname.trim()) {
    return appointment.nickname.trim();
  }

  return "-";
};

const getLegacyDateParts = (dateTime: string | null | undefined) => {
  if (!dateTime) {
    return { dateLabel: "-", timeLabel: "-" };
  }

  const parsed = new Date(dateTime);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      dateLabel: parsed.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
      }),
      timeLabel: `${parsed.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      })} น.`,
    };
  }

  const [datePart, timePart] = dateTime.split(/[T\s]/);
  return {
    dateLabel: datePart || "-",
    timeLabel: timePart ? formatTimeDisplay(timePart.slice(0, 5)) : "-",
  };
};

const formatLegacyPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) {
    return "-";
  }

  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return phone.trim();
};

const sanitizeProductName = (product: string | null | undefined): string => {
  if (!product) {
    return "-";
  }
  const trimmed = product.trim();
  if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return "-";
  }
  return trimmed;
};

interface CRMRecord {
  id: number;
  appointmentTime: string;
  status: string;
  appointmentDate: string;
  interestedProduct: string;
  customer_name: string;
  doctor: string;
  contact_staff: string;
  interested_product: string;
  country: string;
  phone: string;
  name: string;
  phoneNumber: string;
  proposed_amount: number;
  proposedAmount: number;
  star_flag: string;
  note: string | null;
  hasCustomerProfile?: boolean;
  customerIdAll?: string;
  surgery_date?: string;
  consult_date?: string;
  displayDate?: string;
}

interface ItemGroup {
  groupcode: string;
  groupname: string;
}

interface ItemService {
  itemcode: string;
  itemname: string;
}

interface HREmployee {
  id?: number;
  full_name: string;
  role: string;
  yearly_leave_quota: number;
  leave_remaining: number;
  work_start_time: string;
  work_end_time: string;
  is_active: boolean;
}

interface HRAttendance {
  id?: number;
  employee_id: number;
  employee_name?: string;
  status_rank?: string;
  work_date: string;
  time_in: string;
  time_out: string;
  status: string;
  work_hours: number;
  overtime_hours: number;
  note: string;
}

type CustomerSegment = "new" | "old";

interface CombinedTableRow {
  kind: CustomerSegment;
  id: string;
  sortKey: number;
  timeLabel: string;
  dateLabel?: string;
  status: string;
  customerName: string;
  phone: string;
  product: string;
  doctor: string;
  contact: string;
  amountValue?: number;
  appointmentCode?: string;
  star: boolean;
  country: string;
  notePreview: string;
  rawRecord?: CRMRecord;
  rawLegacy?: Appointment;
}

export default function CRMAdvancedPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "calendar2">(
    "table"
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentMonth2, setCurrentMonth2] = useState<Date>(new Date());
  const [customerSegment, setCustomerSegment] = useState<"new" | "old">("new");
  const [selectedDateRecords, setSelectedDateRecords] = useState<CRMRecord[]>(
    []
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<HREmployee>({
    full_name: "",
    role: "",
    yearly_leave_quota: 10,
    leave_remaining: 10,
    work_start_time: "08:00",
    work_end_time: "19:00",
    is_active: true,
  });
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [attendances, setAttendances] = useState<HRAttendance[]>([]);
  const [attendanceForm, setAttendanceForm] = useState<HRAttendance>({
    employee_id: 0,
    work_date: "",
    time_in: "08:00",
    time_out: "17:00",
    status: "PRESENT",
    work_hours: 8.0,
    overtime_hours: 0,
    note: "",
  });
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedDateAttendances, setSelectedDateAttendances] = useState<
    HRAttendance[]
  >([]);
  const [selectedAttendanceDateStr, setSelectedAttendanceDateStr] =
    useState<string>("");
  const [editingAttendance, setEditingAttendance] =
    useState<HRAttendance | null>(null);
  const [noteModalRecord, setNoteModalRecord] = useState<CRMRecord | null>(null);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [selectedGroupForServices, setSelectedGroupForServices] =
    useState<ItemGroup | null>(null);
  const [groupServiceItems, setGroupServiceItems] = useState<ItemService[]>([]);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerFormData | null>(
    null
  );
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [customerMessage, setCustomerMessage] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [selectedLeadSummary, setSelectedLeadSummary] =
    useState<LeadSummary | null>(null);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [legacyRecords, setLegacyRecords] = useState<Appointment[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const dateFieldKeys: Array<keyof CustomerFormData> = [
    "birthdate",
    "registerdate",
    "binddate",
    "idcardIssueDate",
    "idcardExpireDate",
  ];

  const getNameParts = (fullName: string) => {
    if (!fullName) {
      return { firstName: "", lastName: "" };
    }
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    const [first, ...rest] = parts;
    return { firstName: first, lastName: rest.join(" ") };
  };

  const buildLeadSummary = (record: CRMRecord): LeadSummary => ({
    id: record.id,
    name: record.customer_name || "",
    phone: record.phone || "",
    status: record.status || "",
    interestedProduct: record.interested_product || record.interestedProduct || "",
  });

  const normalizeDateValue = (value: unknown) => {
    if (!value) {
      return "";
    }
    const str = String(value);
    if (str.length >= 10) {
      return str.slice(0, 10);
    }
    return str;
  };

  const buildBaseCustomerForm = (record: CRMRecord): CustomerFormData => {
    const today = getLocalDateString();
    const { firstName, lastName } = getNameParts(record.customer_name || "");

    return {
      recordno: "",
      code: "",
      cn: String(record.id),
      prefix: "",
      name: firstName,
      surname: lastName,
      nickname: "",
      gender: "",
      idcard: "",
      birthdate: "",
      registerdate: today,
      member: "",
      cusgroup: "",
      mobilephone: record.phone || "",
      email: "",
      lineid: "",
      facebook: "",
      medianame: "",
      disease: "",
      allergic: "",
      displayname: record.customer_name || "",
      locno: "",
      soi: "",
      road: "",
      moo: "",
      tumbon: "",
      amphur: "",
      province: "",
      zipcode: "",
      country: "Thailand",
      address: "",
      ownercode: "",
      ownername: record.contact_staff || "",
      binddate: today,
      idcardLaserCode: "",
      idcardIssueDate: "",
      idcardExpireDate: "",
      idcardProvinceNative: "",
      idcardDistrictNative: "",
      idcardSubdistrictNative: "",
      idcardFrontImage: "",
      idcardBackImage: "",
    };
  };

  const mapDbRecordToForm = (
    dbRecord: Record<string, unknown>,
    fallback: CustomerFormData
  ): CustomerFormData => {
    const next: CustomerFormData = { ...fallback };

    (Object.keys(dbRecord) as Array<keyof CustomerFormData>).forEach((key) => {
      if (key === "cn") {
        return;
      }

      const rawValue = dbRecord[key];

      if (key === "recordno") {
        next.recordno = rawValue === undefined || rawValue === null ? "" : String(rawValue);
        return;
      }

      if (dateFieldKeys.includes(key)) {
        next[key] = normalizeDateValue(rawValue);
        return;
      }

      next[key] = rawValue === undefined || rawValue === null ? "" : String(rawValue);
    });

    if (!next.displayname) {
      const composed = [next.prefix, next.name, next.surname]
        .filter(Boolean)
        .join(" ")
        .trim();
      next.displayname = composed;
    }

    return next;
  };

  const ensureStaffOptions = useCallback(async () => {
    if (staffLoading) {
      return;
    }

    if (staffOptions.length > 0 && !staffError) {
      return;
    }

    setStaffLoading(true);
    setStaffError(null);

    try {
      const response = await fetch("/api/n-staff");
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result?.error || "ไม่สามารถโหลดรายชื่อผู้ดูแลได้");
      }

      const data: StaffOption[] = Array.isArray(result.data) ? result.data : [];
      setStaffOptions(data);
    } catch (err: any) {
      setStaffError(err?.message || "ไม่สามารถโหลดรายชื่อผู้ดูแลได้");
    } finally {
      setStaffLoading(false);
    }
  }, [staffLoading, staffOptions.length, staffError]);

  const openCustomerModal = async (record: CRMRecord) => {
    ensureStaffOptions();

    const baseForm = buildBaseCustomerForm(record);
    setSelectedLeadSummary(buildLeadSummary(record));
    setCustomerForm(baseForm);
    setShowCustomerModal(true);
    setCustomerExists(false);
    setCustomerLoading(true);
    setCustomerSaving(false);
    setCustomerMessage(null);
    setCustomerError(null);

    try {
      const response = await fetch(`/api/n-customer?cn=${record.id}`);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        if (result?.error) {
          setCustomerError(result.error);
        }
        return;
      }

      if (result.exists && result.data) {
        setCustomerForm(mapDbRecordToForm(result.data, baseForm));
        setCustomerExists(true);
      }
    } catch (err: any) {
      setCustomerError(err?.message || "ไม่สามารถโหลดข้อมูลลูกค้าได้");
    } finally {
      setCustomerLoading(false);
    }
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setCustomerForm(null);
    setCustomerError(null);
    setCustomerMessage(null);
    setCustomerExists(false);
    setCustomerLoading(false);
    setCustomerSaving(false);
    setSelectedLeadSummary(null);
  };

  const handleCustomerFormChange = (
    field: keyof CustomerFormData,
    value: string
  ) => {
    setCustomerForm((prev) => {
      if (!prev) {
        return prev;
      }

      if (field === "prefix" || field === "name" || field === "surname") {
        const currentComposite = [prev.prefix, prev.name, prev.surname]
          .filter(Boolean)
          .join(" ")
          .trim();
        const nextState = { ...prev, [field]: value } as CustomerFormData;
        const nextComposite = [nextState.prefix, nextState.name, nextState.surname]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (!prev.displayname || prev.displayname.trim() === currentComposite) {
          nextState.displayname = nextComposite;
        }

        return nextState;
      }

      return { ...prev, [field]: value } as CustomerFormData;
    });
  };

  const handleCustomerSubmit = async () => {
    if (!customerForm) {
      return;
    }

    setCustomerSaving(true);
    setCustomerError(null);
    setCustomerMessage(null);

    try {
      const {
        idcardFrontImage,
        idcardBackImage,
        ...rest
      } = customerForm;

      const payload: Partial<CustomerFormData> = {
        ...rest,
        cn: customerForm.cn,
      };

      if (!payload.recordno || !payload.recordno.trim()) {
        delete payload.recordno;
      }

      const response = await fetch("/api/n-customer", {
        method: customerExists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result?.error || "บันทึกข้อมูลลูกค้าไม่สำเร็จ");
      }

      if (result.data) {
        setCustomerForm(mapDbRecordToForm(result.data, customerForm));
      }

      setCustomerExists(true);
      setCustomerMessage("บันทึกข้อมูลลูกค้าสำเร็จ");
    } catch (err: any) {
      setCustomerError(err?.message || "บันทึกข้อมูลลูกค้าไม่สำเร็จ");
    } finally {
      setCustomerSaving(false);
    }
  };

  // ดึงข้อมูลจาก API - เริ่มต้นด้วยวันนี้
  useEffect(() => {
    const today = getLocalDateString();
    setStartDate(today);
    fetchRecords(today, today);
  }, []);

  // ค้นหาอัตโนมัติเมื่อเปลี่ยนวันที่
  useEffect(() => {
    if (startDate && viewMode === "table") {
      fetchRecords(startDate, startDate);
    }
  }, [startDate]);

  // โหลดข้อมูลตามเดือนที่เลือกในปฏิทิน
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchRecordsByMonth(currentMonth);
    }
  }, [currentMonth, viewMode]);

  // โหลดข้อมูลตามเดือนที่เลือกในปฏิทิน 2
  useEffect(() => {
    if (viewMode === "calendar2") {
      fetchRecordsByMonth(currentMonth2);
      fetchEmployees();
      fetchAttendances(currentMonth2);
    }
  }, [currentMonth2, viewMode]);

  useEffect(() => {
    if (showCustomerModal) {
      ensureStaffOptions();
    }
  }, [showCustomerModal, ensureStaffOptions]);

  // โหลดรายชื่อพนักงาน
  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/hr-employees");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data.filter((emp: HREmployee) => emp.is_active));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // โหลดข้อมูลการเข้างานตามเดือน
  const fetchAttendances = async (date: Date) => {
    try {
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();

      console.log("Fetching attendances for:", { month, year });

      const response = await fetch(
        `/api/hr-attendance?month=${month}&year=${year}`
      );
      const data = await response.json();
      console.log("Attendance API response:", data);

      if (data.success) {
        setAttendances(data.data);
        console.log("Set attendances:", data.data);
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const fetchLegacyAppointments = useCallback(async (dateStr?: string) => {
    const effectiveDate = dateStr && dateStr.trim() ? dateStr : getLocalDateString();

    try {
      setLegacyLoading(true);
      setLegacyError(null);

      const params = new URLSearchParams();
      params.append("from", effectiveDate);
      params.append("to", effectiveDate);

      const response = await fetch(`/api/appointments?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data?.error || "ไม่สามารถโหลดข้อมูลลูกค้าเก่าได้");
      }

      setLegacyRecords(Array.isArray(data.data) ? data.data : []);
    } catch (error: any) {
      console.error("Error fetching legacy appointments:", error);
      setLegacyRecords([]);
      setLegacyError(error?.message || "ไม่สามารถโหลดข้อมูลลูกค้าเก่าได้");
    } finally {
      setLegacyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode !== "table" || customerSegment !== "old") {
      return;
    }

    const targetDate = startDate && startDate.trim() ? startDate : getLocalDateString();
    fetchLegacyAppointments(targetDate);
  }, [customerSegment, fetchLegacyAppointments, startDate, viewMode]);

  const fetchRecords = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = "/api/crm-advanced";
      const params = new URLSearchParams();

      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch records");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsByMonth = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();

      const url = `/api/crm-advanced?month=${month}&year=${year}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch records");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate) {
      fetchRecords(startDate, startDate);
    } else {
      // ถ้าไม่กรอกวันที่ ให้ใช้วันนี้
      const today = getLocalDateString();
      fetchRecords(today, today);
    }
  };

  const handleResetFilter = () => {
    const today = getLocalDateString();
    setStartDate(today);
    setSelectedDate("");
    if (viewMode === "calendar") {
      // ถ้าอยู่ในโหมดปฏิทิน ให้โหลดข้อมูลของเดือนปัจจุบัน
      fetchRecordsByMonth(currentMonth);
    } else if (viewMode === "calendar2") {
      // ถ้าอยู่ในโหมดปฏิทิน 2 ให้โหลดข้อมูลของเดือนปัจจุบัน
      fetchRecordsByMonth(currentMonth2);
    } else {
      // ถ้าอยู่ในโหมดตาราง ให้โหลดข้อมูลวันนี้
      fetchRecords(today, today);
      if (customerSegment === "old") {
        fetchLegacyAppointments(today);
      }
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(`/api/crm-advanced?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("ลบข้อมูลสำเร็จ!");
        setRecords(records.filter((record) => record.id !== id));
        setSelectedDateRecords(
          selectedDateRecords.filter((record) => record.id !== id)
        );

        // Close popup if no records left
        if (selectedDateRecords.length <= 1) {
          setShowPopup(false);
        }
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getRecordsForDate = (dateStr: string) => {
    return records.filter((record) => {
      // ใช้ .split("T")[0] โดยตรง ไม่ผ่าน new Date() เพื่อหลีกเลี่ยงปัญหา timezone
      const surgeryDate = record.surgery_date
        ? record.surgery_date.split("T")[0]
        : null;
      const consultDate = record.consult_date
        ? record.consult_date.split("T")[0]
        : null;
      return surgeryDate === dateStr || consultDate === dateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handlePrevMonth2 = () => {
    setCurrentMonth2(
      new Date(currentMonth2.getFullYear(), currentMonth2.getMonth() - 1)
    );
  };

  const handleNextMonth2 = () => {
    setCurrentMonth2(
      new Date(currentMonth2.getFullYear(), currentMonth2.getMonth() + 1)
    );
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setStartDate(dateStr);
    const dayRecords = getRecordsForDate(dateStr);
    if (dayRecords.length > 0) {
      setSelectedDateRecords(dayRecords);
      setSelectedDateStr(dateStr);
      setShowPopup(true);
    } else {
      // ถ้าไม่มีข้อมูล ให้เรียก API เพื่อดึงข้อมูลของวันนั้น
      fetchRecords(dateStr, dateStr);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedDateRecords([]);
    setSelectedDateStr("");
  };

  const needsItemGroupSection =
    showPopup && selectedDateRecords.some((record) => record.hasCustomerProfile);

  const fetchItemGroups = async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const response = await fetch("/api/b-item-groups");
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่พบกลุ่มบริการ");
      }
      setItemGroups(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      console.error("Error loading item groups:", error);
      setGroupsError(error?.message || "ไม่สามารถโหลดกลุ่มบริการได้");
    } finally {
      setGroupsLoading(false);
    }
  };

  const openGroupServiceModal = async (group: ItemGroup) => {
    setSelectedGroupForServices(group);
    setGroupServiceItems([]);
    setServiceError(null);
    setServiceModalVisible(true);
    setServicesLoading(true);
    try {
      const response = await fetch(
        `/api/b-item-services?groupCode=${encodeURIComponent(group.groupcode)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่พบรายการบริการ");
      }
      setGroupServiceItems(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      console.error("Error loading item services:", error);
      setServiceError(error?.message || "ไม่สามารถโหลดรายการบริการได้");
    } finally {
      setServicesLoading(false);
    }
  };

  const closeServiceModal = () => {
    setServiceModalVisible(false);
    setServicesLoading(false);
    setGroupServiceItems([]);
    setSelectedGroupForServices(null);
    setServiceError(null);
  };

  useEffect(() => {
    if (!needsItemGroupSection) {
      return;
    }
    if (itemGroups.length > 0 || groupsLoading) {
      return;
    }
    fetchItemGroups();
  }, [needsItemGroupSection, itemGroups.length, groupsLoading]);

  const openNoteModal = (record: CRMRecord) => {
    const noteValue = record.note?.trim();
    if (!noteValue) {
      return;
    }
    setNoteModalRecord(record);
  };

  const closeNoteModal = () => setNoteModalRecord(null);

  const handleEmployeeFormChange = (
    field: keyof HREmployee,
    value: string | number | boolean
  ) => {
    setEmployeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEmployee = async () => {
    try {
      const response = await fetch("/api/hr-employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeForm),
      });

      const data = await response.json();

      if (data.success) {
        alert("บันทึกข้อมูลพนักงานสำเร็จ!");
        setShowEmployeeForm(false);
        fetchEmployees();
        // Reset form
        setEmployeeForm({
          full_name: "",
          role: "",
          yearly_leave_quota: 10,
          leave_remaining: 10,
          work_start_time: "08:00",
          work_end_time: "19:00",
          is_active: true,
        });
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleAttendanceFormChange = (
    field: keyof HRAttendance,
    value: string | number
  ) => {
    setAttendanceForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // คำนวณชั่วโมงทำงานอัตโนมัติ
      if (field === "time_in" || field === "time_out") {
        if (updated.time_in && updated.time_out) {
          const timeIn = new Date(`2000-01-01T${updated.time_in}`);
          const timeOut = new Date(`2000-01-01T${updated.time_out}`);
          const diffMs = timeOut.getTime() - timeIn.getTime();
          const hours = diffMs / (1000 * 60 * 60);
          updated.work_hours = Math.max(0, parseFloat(hours.toFixed(2)));

          // คำนวณ OT (เกิน 8 ชั่วโมง)
          updated.overtime_hours = Math.max(
            0,
            parseFloat((hours - 8).toFixed(2))
          );
        }
      }

      return updated;
    });
  };

  const handleDeleteAttendance = async (id: number) => {
    if (!confirm("คุณต้องการลบข้อมูลการเข้างานนี้หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(`/api/hr-attendance?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("ลบข้อมูลการเข้างานสำเร็จ!");

        // Refresh attendance data
        await fetchAttendances(currentMonth2);

        // Update popup if it's open
        if (showAttendancePopup && selectedAttendanceDateStr) {
          const updatedAttendances = attendances.filter((att) => att.id !== id);
          const filtered = updatedAttendances.filter((att) => {
            const attDateStr = att.work_date.split("T")[0];
            return attDateStr === selectedAttendanceDateStr;
          });
          setSelectedDateAttendances(filtered);

          // Close popup if no records left
          if (filtered.length === 0) {
            setShowAttendancePopup(false);
          }
        }
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleSaveAttendance = async () => {
    try {
      // Validate required fields
      if (!attendanceForm.employee_id || attendanceForm.employee_id === 0) {
        alert("กรุณาเลือกพนักงาน");
        return;
      }

      if (!attendanceForm.work_date) {
        alert("กรุณาเลือกวันที่");
        return;
      }

      // Normalize work_date to YYYY-MM-DD format for comparison
      const normalizedWorkDate = attendanceForm.work_date.split("T")[0];

      const method = "POST";
      const url = editingAttendance
        ? `/api/hr-attendance?id=${editingAttendance.id}`
        : "/api/hr-attendance";

      // When editing, send updated data (allow changing date)
      const bodyData = editingAttendance
        ? {
          employee_id: attendanceForm.employee_id,
          work_date: normalizedWorkDate,
          time_in: attendanceForm.time_in,
          time_out: attendanceForm.time_out,
          status: attendanceForm.status,
          work_hours: Number(attendanceForm.work_hours),
          overtime_hours: Number(attendanceForm.overtime_hours),
          note: attendanceForm.note,
        }
        : {
          ...attendanceForm,
          work_date: normalizedWorkDate,
          work_hours: Number(attendanceForm.work_hours),
          overtime_hours: Number(attendanceForm.overtime_hours),
        };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editingAttendance
            ? "แก้ไขข้อมูลการเข้างานสำเร็จ!"
            : "บันทึกข้อมูลการเข้างานสำเร็จ!"
        );
        setShowAttendanceForm(false);
        setEditingAttendance(null);

        // Fetch updated data
        await fetchAttendances(currentMonth2);

        // Update popup if it's open
        if (showAttendancePopup && selectedAttendanceDateStr) {
          const updatedAttendances = await fetch(
            `/api/hr-attendance?month=${currentMonth2.getMonth() + 1
            }&year=${currentMonth2.getFullYear()}`
          ).then((res) => res.json());

          if (updatedAttendances.success) {
            const filtered = updatedAttendances.data.filter(
              (att: HRAttendance) => {
                const attDateStr = att.work_date.split("T")[0];
                return attDateStr === selectedAttendanceDateStr;
              }
            );
            setSelectedDateAttendances(filtered);
          }
        }

        // Reset form
        setAttendanceForm({
          employee_id: 0,
          work_date: "",
          time_in: "08:00",
          time_out: "17:00",
          status: "PRESENT",
          work_hours: 8.0,
          overtime_hours: 0,
          note: "",
        });
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const parseAppointmentTimeValue = (value: string): number => {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) {
      return Number.MAX_SAFE_INTEGER;
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  };

  const parseLegacyDateValue = (value: string | null | undefined): number => {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }

    const timeMatch = value.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      return parseAppointmentTimeValue(`${timeMatch[1]}:${timeMatch[2]}`);
    }

    return Number.MAX_SAFE_INTEGER;
  };

  const sortedByAppointment = [...records].sort((a, b) =>
    parseAppointmentTimeValue(a.appointmentTime) -
    parseAppointmentTimeValue(b.appointmentTime)
  );

  const legacyRecordsSorted = [...legacyRecords].sort(
    (a, b) => parseLegacyDateValue(a.start_date) - parseLegacyDateValue(b.start_date)
  );

  const legacySelectedDate = startDate && startDate.trim() ? startDate : getLocalDateString();
  const legacySelectedDateLabel = (() => {
    if (!legacySelectedDate) {
      return "";
    }

    const [year, month, day] = legacySelectedDate.split("-").map(Number);
    if (!year || !month || !day) {
      return legacySelectedDate;
    }

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      return legacySelectedDate;
    }

    return parsed.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  // ดึงข้อมูลการเข้างานของวันที่เลือก
  const getAttendancesForDate = (dateStr: string) => {
    const filtered = attendances.filter((att) => {
      // แปลง work_date ให้เป็นรูปแบบ YYYY-MM-DD โดยใช้ UTC
      const workDateStr = att.work_date.split("T")[0];
      return workDateStr === dateStr;
    });
    console.log(`Attendances for ${dateStr}:`, filtered);
    return filtered;
  };

  const getDayColor = (dateStr: string) => {
    // สร้าง Date object แบบ local time เพื่อหลีกเลี่ยงปัญหา timezone
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // สีประจำวัน (ตามความเชื่อไทย)
    const dayColors = {
      0: {
        bg: "bg-red-400/30",
        border: "border-red-400",
        text: "text-red-200",
      }, // อาทิตย์ - แดง
      1: {
        bg: "bg-yellow-400/30",
        border: "border-yellow-400",
        text: "text-yellow-200",
      }, // จันทร์ - เหลือง
      2: {
        bg: "bg-pink-400/30",
        border: "border-pink-400",
        text: "text-pink-200",
      }, // อังคาร - ชมพู
      3: {
        bg: "bg-green-400/30",
        border: "border-green-400",
        text: "text-green-200",
      }, // พุธ - เขียว
      4: {
        bg: "bg-orange-400/30",
        border: "border-orange-400",
        text: "text-orange-200",
      }, // พฤหัสบดี - ส้ม
      5: {
        bg: "bg-blue-400/30",
        border: "border-blue-400",
        text: "text-blue-200",
      }, // ศุกร์ - ฟ้า
      6: {
        bg: "bg-purple-400/30",
        border: "border-purple-400",
        text: "text-purple-200",
      }, // เสาร์ - ม่วง
    };

    return dayColors[dayOfWeek as keyof typeof dayColors];
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentMonth);
    const days = [];
    const today = getLocalDateString();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-700"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayRecords = getRecordsForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const hasRecords = dayRecords.length > 0;
      const dayOfWeek = new Date(year, month, day).getDay();
      const isSunday = dayOfWeek === 0;
      const hasStarredRecords = dayRecords.some(r => r.star_flag);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateStr)}
          className={`
            min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-700 cursor-pointer transition-all
            ${isToday ? "bg-gray-800" : ""}
            ${isSelected ? "bg-blue-900/50" : ""}
            hover:bg-gray-800/50
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <div className={`text-xs sm:text-sm font-medium ${isSunday ? "text-red-400" : "text-gray-300"} ${isToday ? "bg-white text-black rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" : ""}`}>
              {day}
            </div>
            {hasStarredRecords && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
          {hasRecords && (
            <div className="space-y-0.5">
              {dayRecords.slice(0, 3).map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openCustomerModal(record);
                  }}
                  className="w-full flex items-center gap-0.5 truncate rounded-sm bg-emerald-600 px-1 py-0.5 text-left text-[8px] sm:text-[10px] text-white font-medium hover:bg-emerald-500 transition"
                  title={`${record.customer_name} - ${record.status}`}
                >
                  {record.star_flag && (
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-300 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  <span className="truncate">{record.customer_name}</span>
                </button>
              ))}
              {dayRecords.length > 3 && (
                <div className="text-[8px] sm:text-[10px] text-gray-400 pl-1">
                  +{dayRecords.length - 3} เพิ่มเติม
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Render Calendar 2 (สำหรับตารางเข้างาน)
  const renderCalendar2 = () => {
    const year = currentMonth2.getFullYear();
    const month = currentMonth2.getMonth(); // 0-11

    // คำนวณจำนวนวันในเดือน
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    const today = getLocalDateString();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-700"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayAttendances = getAttendancesForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const hasAttendances = dayAttendances.length > 0;
      const dayOfWeek = new Date(year, month, day).getDay();
      const isSunday = dayOfWeek === 0;

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(dateStr);
            if (hasAttendances) {
              setSelectedDateAttendances(dayAttendances);
              setSelectedAttendanceDateStr(dateStr);
              setShowAttendancePopup(true);
            } else {
              // Open form to add new attendance
              setEditingAttendance(null);
              setAttendanceForm({
                employee_id: 0,
                work_date: dateStr,
                time_in: "08:00",
                time_out: "17:00",
                status: "PRESENT",
                work_hours: 8.0,
                overtime_hours: 0,
                note: "",
              });
              setShowAttendanceForm(true);
            }
          }}
          className={`
            min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-700 cursor-pointer transition-all
            ${isToday ? "bg-gray-800" : ""}
            ${isSelected ? "bg-teal-900/50" : ""}
            hover:bg-gray-800/50
          `}
        >
          <div className={`text-xs sm:text-sm font-medium mb-1 ${isSunday ? "text-red-400" : "text-gray-300"} ${isToday ? "bg-white text-black rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" : ""}`}>
            {day}
          </div>
          {hasAttendances ? (
            <div className="space-y-0.5">
              <div className="text-[8px] sm:text-[10px] bg-teal-500 text-white px-1 py-0.5 rounded-sm font-bold text-center">
                {dayAttendances.length} คน
              </div>
              {dayAttendances.slice(0, 2).map((att) => {
                const statusColors: Record<string, string> = {
                  PRESENT: "bg-green-500",
                  LATE: "bg-yellow-500",
                  LEAVE: "bg-blue-500",
                  ABSENT: "bg-red-500",
                  WFH: "bg-purple-500",
                };
                return (
                  <div
                    key={att.id}
                    className={`${statusColors[att.status] || "bg-gray-500"} rounded-sm px-1 py-0.5 text-[8px] sm:text-[10px] text-white font-medium truncate`}
                    title={`${att.employee_name} - ${att.status}`}
                  >
                    {att.employee_name}
                  </div>
                );
              })}
              {dayAttendances.length > 2 && (
                <div className="text-[8px] sm:text-[10px] text-gray-400 pl-1">
                  +{dayAttendances.length - 2} คน
                </div>
              )}
            </div>
          ) : (
            <div className="text-[8px] sm:text-[10px] text-gray-500 text-center mt-2">
              คลิกเพื่อเพิ่มข้อมูล
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-0 m-0">
      {/* Top Bar - Back Button and View Mode Toggle */}
      <div className="px-3 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left Side - Back Button */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            aria-label="กลับไปหน้าหลัก"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {/* Right Side - View Mode Toggle */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all shadow-lg font-medium flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-[10px] sm:text-sm ${viewMode === "table"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">ตาราง</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all shadow-lg font-medium flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-[10px] sm:text-sm ${viewMode === "calendar"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">ปฏิทิน</span>
            </button>
            <button
              onClick={() => setViewMode("calendar2")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all shadow-lg font-medium flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-[10px] sm:text-sm ${viewMode === "calendar2"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">เข้างาน</span>
            </button>
          </div>
        </div>
      </div>
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <svg
                className="animate-spin h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-white font-bold text-lg">
                กำลังโหลดข้อมูล...
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-8 pb-4">
          <div className="bg-red-500/20 backdrop-blur-md border-2 border-red-400 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-white font-bold text-lg">เกิดข้อผิดพลาด</h4>
                <p className="text-red-100">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-0 mb-0 px-6 py-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📅 นัดหมายวันนี้</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.length}
          </p>
          <p className="text-blue-100 font-medium">รายการทั้งหมด</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">✅ สถานะดำเนินการ</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.filter((r) => r.status).length}
          </p>
          <p className="text-emerald-100 font-medium">รายการที่มีสถานะ</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🔔 ต้องติดตาม</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.filter((r) => r.star_flag).length}
          </p>
          <p className="text-purple-100 font-medium">รายการที่ต้องติดตาม</p>
        </div>
      </div> */}
      {/* Main Content */}
      <div className="w-full h-full m-0 p-0">
        <div className="w-full overflow-hidden">
          {/* Calendar View */}
          {viewMode === "calendar" && (
            <div className="px-2 sm:px-8 pb-8">
              <div className="bg-black/90 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h2 className="text-lg sm:text-2xl font-bold text-white">
                      {currentMonth.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                      }).replace(" ", ".")}
                    </h2>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {/* Day Headers */}
                  {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day, index) => (
                    <div
                      key={day}
                      className={`text-center text-[10px] sm:text-xs font-medium py-2 border-b border-r border-gray-700 ${index === 0 ? "text-red-400" : "text-gray-400"}`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {renderCalendar()}
                </div>
              </div>
            </div>
          )}
          {/* Calendar View 2 */}
          {viewMode === "calendar2" && (
            <div className="px-2 sm:px-8 pb-8">
              {/* ปุ่มเพิ่มพนักงานและบันทึกการเข้างาน */}
              <div className="mb-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingAttendance(null);
                    // ใช้ local time สำหรับวันที่ปัจจุบัน
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(
                      now.getMonth() + 1
                    ).padStart(2, "0")}-${String(now.getDate()).padStart(
                      2,
                      "0"
                    )}`;
                    const newForm = {
                      employee_id: 0,
                      work_date: todayStr,
                      time_in: "08:00",
                      time_out: "17:00",
                      status: "PRESENT",
                      work_hours: 8.0,
                      overtime_hours: 0,
                      note: "",
                    };
                    setAttendanceForm(newForm);
                    setShowAttendanceForm(true);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg font-bold flex items-center gap-2 text-xs sm:text-sm"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  บันทึกการเข้างาน
                </button>
              </div>

              <div className="bg-black/90 backdrop-blur-md rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
                  <button
                    onClick={handlePrevMonth2}
                    className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h2 className="text-lg sm:text-2xl font-bold text-white">
                      {currentMonth2.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                      }).replace(" ", ".")}
                    </h2>
                  </div>
                  <button
                    onClick={handleNextMonth2}
                    className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-all"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {/* Day Headers */}
                  {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day, index) => (
                    <div
                      key={day}
                      className={`text-center text-[10px] sm:text-xs font-medium py-2 border-b border-r border-gray-700 ${index === 0 ? "text-red-400" : "text-gray-400"}`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {renderCalendar2()}
                </div>
              </div>
            </div>
          )}
          {/* Table Container */}
          {viewMode === "table" && (
            <div className="space-y-3 sm:space-y-5 px-2 sm:px-0">
              {/* Date Filter Row */}
              <div className="flex justify-center">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="px-3 sm:px-4 py-2 rounded-lg bg-white/90 text-gray-800 font-medium text-sm sm:text-base flex items-center gap-2 pointer-events-none">
                    <span>
                      {startDate ? (() => {
                        const [year, month, day] = startDate.split("-");
                        return `${day}/${month}/${year}`;
                      })() : "เลือกวันที่"}
                    </span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Customer Segment Buttons Row */}
              <div className="flex gap-2 sm:gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setCustomerSegment("new")}
                  className={`rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition ${customerSegment === "new"
                    ? "bg-white text-blue-700 shadow-lg"
                    : "bg-white/40 text-white border border-white/40"
                    }`}
                >
                  ลูกค้าใหม่
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSegment("old")}
                  className={`rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition ${customerSegment === "old"
                    ? "bg-slate-50 text-slate-900 shadow-lg"
                    : "bg-white/20 text-white border border-white/30"
                    }`}
                >
                  ลูกค้าเก่า
                </button>
              </div>
              {customerSegment === "new" ? (
                <div className="overflow-x-auto w-full rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl transition bg-white">
                  {!loading && sortedByAppointment.length === 0 ? (
                    <div className="flex justify-center items-center py-8 sm:py-12">
                      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-8 shadow-2xl text-center">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 text-white/50 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
                          ไม่พบข้อมูล
                        </h3>
                        <p className="text-white/80 text-sm sm:text-base">
                          ไม่มีรายการนัดหมายในช่วงเวลาที่เลือก
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {/* Table Header */}
                      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 grid grid-cols-7 sm:grid-cols-11 gap-0">
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          เวลา
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          สถานะ
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          ชื่อ
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          เบอร์โทร
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          ผลิตภัณฑ์
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          หมอ
                        </div>
                        <div className="hidden sm:block px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          ผู้ติดต่อ
                        </div>
                        <div className="px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20 sm:border-r">
                          ยอด
                        </div>
                        <div className="hidden sm:block px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          ดาว
                        </div>
                        <div className="hidden sm:block px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white border-r border-white/20">
                          ประเทศ
                        </div>
                        <div className="hidden sm:block px-1 py-2 sm:py-3 text-center text-[8px] sm:text-xs font-bold text-white">
                          หมายเหตุ
                        </div>
                      </div>

                      {/* Table Rows */}
                      {sortedByAppointment.map((record, index) => (
                        <div key={record.id}>
                          {/* Main Row - Clickable */}
                          <div
                            onClick={() => setExpandedRowId(expandedRowId === record.id ? null : record.id)}
                            className={`grid grid-cols-7 sm:grid-cols-11 gap-0 cursor-pointer ${index % 2 === 0
                              ? "bg-gradient-to-r from-slate-50 to-blue-50"
                              : "bg-gradient-to-r from-blue-100 to-indigo-100"
                              } hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-200 transition-all duration-200`}
                          >
                            <div className="px-1 py-2 sm:py-3 text-[8px] sm:text-sm text-gray-800 border-r border-gray-200 text-center flex items-center justify-center">
                              {formatTimeDisplay(record.appointmentTime)}
                            </div>
                            <div className="px-0.5 py-1 sm:py-2 text-[8px] sm:text-sm text-gray-800 border-r border-gray-200 text-center flex flex-col items-center justify-center">
                              <span className="inline-block px-0.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-[6px] sm:text-xs font-bold shadow">
                                {record.status}
                              </span>
                              {record.status.trim() === "นัดพร้อมทำ" && record.hasCustomerProfile && (
                                <span className="mt-0.5 inline-block rounded-full bg-emerald-500/90 text-white text-[5px] sm:text-[10px] font-semibold px-0.5 sm:px-2 py-0.5">
                                  OPD
                                </span>
                              )}
                            </div>
                            <div className="px-0.5 py-2 sm:py-3 text-[8px] sm:text-sm text-gray-800 border-r border-gray-200 text-center flex items-center justify-center">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openCustomerModal(record); }}
                                className="font-semibold text-blue-600 hover:underline text-[8px] sm:text-sm truncate max-w-full"
                              >
                                {record.customer_name}
                              </button>
                            </div>
                            <div className="px-0.5 py-2 sm:py-3 text-[7px] sm:text-sm text-gray-800 border-r border-gray-200 text-center flex items-center justify-center">
                              {record.phone}
                            </div>
                            <div className="px-0.5 py-2 sm:py-3 text-[7px] sm:text-sm text-gray-800 border-r border-gray-200 text-center flex items-center justify-center truncate">
                              {record.interested_product}
                            </div>
                            <div className="px-0.5 py-2 sm:py-3 text-[7px] sm:text-sm text-gray-800 border-r border-gray-200 font-medium text-center flex items-center justify-center truncate">
                              {record.doctor}
                            </div>
                            <div className="hidden sm:flex px-0.5 py-2 sm:py-3 text-[7px] sm:text-sm text-gray-800 border-r border-gray-200 text-center items-center justify-center truncate">
                              {record.contact_staff}
                            </div>
                            <div className="px-0.5 py-2 sm:py-3 text-[7px] sm:text-sm text-gray-800 border-r border-gray-200 sm:border-r text-center flex items-center justify-center">
                              {record.proposed_amount.toLocaleString()}
                            </div>
                            <div className="hidden sm:flex px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center items-center justify-center">
                              {record.star_flag ? (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                              )}
                            </div>
                            <div className="hidden sm:flex px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center items-center justify-center">
                              {record.country || "-"}
                            </div>
                            <div className="hidden sm:flex px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 text-center items-center justify-center">
                              {record.note ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openNoteModal(record); }}
                                  className="text-blue-600 hover:underline text-xs truncate max-w-[80px]"
                                >
                                  ดูหมายเหตุ
                                </button>
                              ) : "-"}
                            </div>
                          </div>

                          {/* Expanded Details - Mobile Only */}
                          {expandedRowId === record.id && (
                            <div className="sm:hidden bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-3 border-t border-indigo-200">
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="font-semibold text-gray-600">ผู้ติดต่อ:</span>
                                  <p className="text-gray-800 truncate">{record.contact_staff || "-"}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">ติดดาว:</span>
                                  <p className="text-gray-800 flex items-center gap-1">
                                    {record.star_flag ? (
                                      <><svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> ใช่</>
                                    ) : "ไม่"}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">ประเทศ:</span>
                                  <p className="text-gray-800">{record.country || "-"}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">หมายเหตุ:</span>
                                  <p className="text-gray-800">
                                    {record.note ? (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); openNoteModal(record); }}
                                        className="text-blue-600 hover:underline text-left"
                                      >
                                        {getNotePreview(record.note)}
                                      </button>
                                    ) : "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto w-full rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl transition bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 pt-4 sm:pt-6 pb-2 text-slate-700">
                    <div className="font-semibold text-xs sm:text-base">
                      ข้อมูลลูกค้าเก่าวันที่ {legacySelectedDateLabel || legacySelectedDate}
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchLegacyAppointments(legacySelectedDate)}
                      className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow hover:from-purple-600 hover:to-indigo-600 transition text-xs sm:text-sm"
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      รีโหลด
                    </button>
                  </div>

                  {legacyError && (
                    <div className="bg-red-500/10 border border-red-200 text-red-700 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 m-3 sm:m-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                      <span className="font-medium text-xs sm:text-sm">{legacyError}</span>
                      <button
                        type="button"
                        onClick={() => fetchLegacyAppointments(legacySelectedDate)}
                        className="px-3 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-xs sm:text-sm"
                      >
                        ลองอีกครั้ง
                      </button>
                    </div>
                  )}

                  {legacyLoading ? (
                    <div className="flex justify-center items-center py-8 sm:py-12">
                      <div className="bg-white/60 rounded-2xl p-4 sm:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <svg
                            className="animate-spin h-8 w-8 text-indigo-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="text-indigo-700 font-semibold text-lg">
                            กำลังโหลดข้อมูลลูกค้าเก่า...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : legacyRecordsSorted.length === 0 ? (
                    <div className="flex justify-center items-center py-8 sm:py-12">
                      <div className="bg-white/70 rounded-2xl p-4 sm:p-8 shadow-2xl text-center">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-3-9h.01M4 6h16M4 10h16M4 14h16"
                          />
                        </svg>
                        <h3 className="text-indigo-700 font-bold text-lg sm:text-xl mb-2">
                          ไม่มีรายการลูกค้าเก่า
                        </h3>
                        <p className="text-indigo-500 text-sm sm:text-base">
                          ไม่พบข้อมูลในวันที่เลือก ลองเปลี่ยนวันที่หรือรีโหลดอีกครั้ง
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            เวลาที่นัด
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            สถานะ
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            ชื่อลูกค้า
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            เบอร์โทร
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            หัตถการ / บริการ
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            แพทย์
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            ผู้ดูแล
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            รหัสนัด
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white border-r border-white/20 tracking-wide whitespace-nowrap">
                            ติดดาว
                          </th>
                          <th className="px-2 sm:px-4 py-3 sm:py-5 text-center text-xs sm:text-sm font-bold text-white tracking-wide whitespace-nowrap">
                            หมายเหตุ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {legacyRecordsSorted.map((appointment, index) => {
                          const { dateLabel, timeLabel } = getLegacyDateParts(appointment.start_date);
                          const productName = appointment.dest_name || appointment.activity || "-";
                          const statusLabel = appointment.activity || "รอติดต่อ";
                          const contactName = appointment.organize || appointment.bind_code || "-";
                          const notePreview = getNotePreview(appointment.note);
                          const visitLinked = Boolean(appointment.vn && appointment.vn.trim());
                          const appointmentKey = appointment.appoint_code || `${appointment.code}-${index}`;

                          return (
                            <tr
                              key={appointmentKey}
                              className={`${index % 2 === 0
                                ? "bg-gradient-to-r from-white via-indigo-50 to-purple-50"
                                : "bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50"
                                } hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200`}
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                <div className="font-semibold text-indigo-700 text-sm sm:text-base">
                                  {timeLabel}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500">{dateLabel}</div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                <span className="inline-block px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-[10px] sm:text-xs font-bold shadow">
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                {getLegacyCustomerName(appointment)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center whitespace-nowrap">
                                {formatLegacyPhoneNumber(appointment.mobilephone)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                {productName}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                {appointment.doctor_name || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                {contactName}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 text-center">
                                {appointment.appoint_code || appointment.code || "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 border-r border-gray-200 bg-gradient-to-r from-amber-100 to-yellow-100 text-center">
                                <div className="flex items-center justify-center">
                                  {visitLinked ? (
                                    <svg
                                      className="w-6 h-6 text-yellow-500 fill-current"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-800 text-left">
                                <div
                                  className="text-xs sm:text-sm text-gray-700"
                                  title={appointment.note || undefined}
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {notePreview}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Footer Summary */}
          {viewMode === "table" && customerSegment === "new" && (
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-3 sm:px-8 py-3 sm:py-6 border-t-4 border-indigo-600">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-base text-white flex items-center gap-1 sm:gap-2">
                  <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm font-bold">
                    📊 ทั้งหมด:
                  </span>
                  <span className="bg-white text-blue-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg">
                    {records.length} รายการ
                  </span>
                </div>
                <div className="text-xs sm:text-base text-white flex items-center gap-1 sm:gap-2">
                  <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm font-bold">
                    💎 รวมยอด:
                  </span>
                  <span className="bg-white text-purple-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg">
                    {records
                      .reduce((sum, r) => sum + r.proposedAmount, 0)
                      .toLocaleString()}{" "}
                    บาท
                  </span>
                </div>
              </div>
            </div>
          )}
          {viewMode === "table" && customerSegment === "old" && (
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 sm:px-8 py-3 sm:py-6 border-t-4 border-purple-600">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-white">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-base">
                  <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm font-bold">
                    📁 ลูกค้าเก่า:
                  </span>
                  <span className="bg-white text-purple-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg">
                    {legacyRecordsSorted.length} รายการ
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-base">
                  <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm font-bold">
                    ⭐ เชื่อมต่อ VN:
                  </span>
                  <span className="bg-white text-pink-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg">
                    {legacyRecordsSorted.filter((item) => item.vn && item.vn.trim()).length} รายการ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && selectedDateRecords.length > 0 && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-gradient-to-br from-white to-blue-50 rounded-t-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <style jsx>{`
              @keyframes slideUp {
                from {
                  transform: translateY(100%);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>
            {/* Popup Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    นัดหมายวันที่{" "}
                    {(() => {
                      const [year, month, day] = selectedDateStr
                        .split("-")
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    ทั้งหมด {selectedDateRecords.length} รายการ
                  </p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto">
              {selectedDateRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCustomerModal(record)}
                        className="text-lg sm:text-xl font-bold text-blue-600 hover:underline"
                      >
                        {record.customer_name}
                      </button>
                      <span className="text-gray-500 text-sm">{record.phone}</span>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-bold">
                      {record.status}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="px-4 py-2">
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบข้อมูล
                    </button>
                  </div>

                  {/* Details Grid - 2 columns layout */}
                  <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
                    {/* Row 1 */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span className="text-red-500">⏰</span> เวลานัดหมาย
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {formatTimeDisplay(record.appointmentTime)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>👨‍⚕️</span> แพทย์
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {record.doctor}
                      </p>
                    </div>

                    {/* Row 2 */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>💊</span> ผลิตภัณฑ์
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {sanitizeProductName(record.interested_product || record.interestedProduct)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>🌍</span> ประเทศ
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {record.country || "-"}
                      </p>
                    </div>

                    {/* Row 3 */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>👤</span> ผู้ติดต่อ
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {record.contact_staff || "-"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>💰</span> ยอดเสนอ
                      </div>
                      <p className="text-purple-600 font-bold text-lg sm:text-xl">
                        {record.proposed_amount.toLocaleString()} ฿
                      </p>
                    </div>

                    {/* Row 4 - Star and OPD status */}
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>⭐</span> ติดดาว
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base flex items-center gap-1">
                        {record.star_flag ? (
                          <><svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> ใช่</>
                        ) : "ไม่"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                        <span>🏥</span> OPD
                      </div>
                      <p className="text-gray-900 font-bold text-sm sm:text-base">
                        {record.status.trim() === "นัดพร้อมทำ" && record.hasCustomerProfile ? (
                          <span className="text-emerald-600">เปิด OPD แล้ว</span>
                        ) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Note Section */}
                  {record.note && (
                    <div className="mx-4 mb-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        📝 หมายเหตุ
                      </p>
                      <p className="text-sm text-gray-800">{record.note}</p>
                    </div>
                  )}

                  {/* Surgery/Consult Dates */}
                  {(record.surgery_date || record.consult_date) && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {record.surgery_date && (
                        <div className="bg-red-100 px-3 py-1 rounded-full">
                          <span className="text-red-700 font-bold text-xs">
                            🏥 ผ่าตัด:{" "}
                            {(() => {
                              const [year, month, day] = record.surgery_date!.split("-").map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString("th-TH");
                            })()}
                          </span>
                        </div>
                      )}
                      {record.consult_date && (
                        <div className="bg-blue-100 px-3 py-1 rounded-full">
                          <span className="text-blue-700 font-bold text-xs">
                            📅 ปรึกษา:{" "}
                            {(() => {
                              const [year, month, day] = record.consult_date!.split("-").map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString("th-TH");
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Popup Footer */}
            <div className="bg-gray-100 px-4 sm:px-6 py-3 flex justify-end border-t">
              <button
                onClick={closePopup}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmployeeForm(false)}
        >
          <div
            className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    เพิ่มข้อมูลพนักงาน
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    กรอกข้อมูลพนักงานใหม่
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmployeeForm(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* ชื่อ-นามสกุล */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeForm.full_name}
                  onChange={(e) =>
                    handleEmployeeFormChange("full_name", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* ตำแหน่ง */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  ตำแหน่ง
                </label>
                <input
                  type="text"
                  value={employeeForm.role}
                  onChange={(e) =>
                    handleEmployeeFormChange("role", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                  placeholder="เช่น พนักงานขาย, ผู้จัดการ"
                />
              </div>

              {/* วันลาต่อปี */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    วันลาต่อปี
                  </label>
                  <input
                    type="number"
                    value={employeeForm.yearly_leave_quota}
                    onChange={(e) =>
                      handleEmployeeFormChange(
                        "yearly_leave_quota",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    วันลาคงเหลือ
                  </label>
                  <input
                    type="number"
                    value={employeeForm.leave_remaining}
                    onChange={(e) =>
                      handleEmployeeFormChange(
                        "leave_remaining",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                    min="0"
                  />
                </div>
              </div>

              {/* เวลาทำงาน */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    เวลาเข้างาน
                  </label>
                  <input
                    type="time"
                    value={employeeForm.work_start_time}
                    onChange={(e) =>
                      handleEmployeeFormChange(
                        "work_start_time",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    เวลาเลิกงาน
                  </label>
                  <input
                    type="time"
                    value={employeeForm.work_end_time}
                    onChange={(e) =>
                      handleEmployeeFormChange("work_end_time", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* สถานะ */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={employeeForm.is_active}
                  onChange={(e) =>
                    handleEmployeeFormChange("is_active", e.target.checked)
                  }
                  className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-gray-700 font-bold">
                  พนักงานปฏิบัติงานอยู่
                </label>
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-gray-100 p-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowEmployeeForm(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAttendanceForm(false)}
        >
          <div
            className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingAttendance ? "แก้ไข" : "บันทึก"}การเข้างาน
                  </h2>
                  <p className="text-teal-100 text-sm mt-1">
                    {editingAttendance
                      ? "แก้ไขข้อมูลการเข้า-ออกงานของพนักงาน"
                      : "กรอกข้อมูลการเข้า-ออกงานของพนักงาน"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceForm(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* เลือกพนักงาน */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  พนักงาน <span className="text-red-500">*</span>
                </label>
                {editingAttendance ? (
                  // แสดงชื่อพนักงานเมื่อแก้ไข (ไม่ให้เปลี่ยน)
                  <div className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-bold">
                    {editingAttendance.employee_name ||
                      `ID: ${editingAttendance.employee_id}`}
                  </div>
                ) : (
                  <select
                    value={attendanceForm.employee_id}
                    onChange={(e) =>
                      handleAttendanceFormChange(
                        "employee_id",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:outline-none text-gray-800"
                  >
                    <option value={0}>เลือกพนักงาน</option>
                    {employees
                      .filter((emp) => {
                        // When creating new, filter out employees who already have attendance on this date
                        if (attendanceForm.work_date) {
                          // Normalize both dates to YYYY-MM-DD format
                          const formDate =
                            attendanceForm.work_date.split("T")[0];
                          const hasAttendance = attendances.some((att) => {
                            const attDateStr = att.work_date.split("T")[0];
                            // Convert both to numbers to ensure type consistency
                            return (
                              Number(att.employee_id) === Number(emp.id) &&
                              attDateStr === formDate
                            );
                          });
                          return !hasAttendance;
                        }
                        return true;
                      })
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.role}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* วันที่ */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  วันที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={attendanceForm.work_date}
                  onChange={(e) =>
                    handleAttendanceFormChange("work_date", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:outline-none text-gray-800"
                />
              </div>

              {/* เวลาเข้า-ออก */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    เวลาเข้างาน
                  </label>
                  <input
                    type="time"
                    value={attendanceForm.time_in}
                    onChange={(e) =>
                      handleAttendanceFormChange("time_in", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    เวลาออกงาน
                  </label>
                  <input
                    type="time"
                    value={attendanceForm.time_out}
                    onChange={(e) =>
                      handleAttendanceFormChange("time_out", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-gray-100 p-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAttendanceForm(false);
                  setEditingAttendance(null);
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                {editingAttendance ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Details Popup */}
      {showAttendancePopup && selectedDateAttendances.length > 0 && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAttendancePopup(false)}
        >
          <div
            className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    การเข้างานวันที่{" "}
                    {(() => {
                      const [year, month, day] = selectedAttendanceDateStr
                        .split("-")
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      });
                    })()}
                  </h2>
                  <p className="text-teal-100 text-sm mt-1">
                    ทั้งหมด {selectedDateAttendances.length} คน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendancePopup(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6">
              {/* Add Staff Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAttendancePopup(false);
                    setEditingAttendance(null);
                    setTimeout(() => {
                      setAttendanceForm({
                        employee_id: 0,
                        work_date: selectedAttendanceDateStr,
                        time_in: "08:00",
                        time_out: "17:00",
                        status: "PRESENT",
                        work_hours: 8.0,
                        overtime_hours: 0,
                        note: "",
                      });
                      setShowAttendanceForm(true);
                    }, 100);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg font-bold flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  เพิ่มพนักงาน
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateAttendances.map((att, index) => {
                  const statusColors: Record<string, string> = {
                    PRESENT: "bg-green-100 text-green-800 border-green-300",
                    LATE: "bg-yellow-100 text-yellow-800 border-yellow-300",
                    LEAVE: "bg-blue-100 text-blue-800 border-blue-300",
                    ABSENT: "bg-red-100 text-red-800 border-red-300",
                    WFH: "bg-purple-100 text-purple-800 border-purple-300",
                  };

                  const statusLabels: Record<string, string> = {
                    PRESENT: "มาทำงาน",
                    LATE: "มาสาย",
                    LEAVE: "ลา",
                    ABSENT: "ขาดงาน",
                    WFH: "WFH",
                  };

                  return (
                    <div
                      key={att.id || index}
                      className="bg-gradient-to-br from-white to-teal-50 rounded-xl p-4 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all"
                    >
                      {/* Name */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                          {att.employee_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="text-xs text-teal-600 font-medium">
                            ชื่อพนักงาน
                          </div>
                          <div className="font-bold text-gray-800 text-lg">
                            {att.employee_name || `ID: ${att.employee_id}`}
                          </div>
                        </div>
                      </div>

                      {/* Status Rank */}
                      <div className="mb-3">
                        <div className="text-xs text-teal-600 font-medium mb-1">
                          สถานะ
                        </div>
                        <span
                          className={`inline-block px-4 py-2 rounded-lg font-bold border-2 text-sm ${statusColors[att.status] ||
                            "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                        >
                          {statusLabels[att.status] || att.status}
                        </span>
                      </div>

                      {/* Time Section */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-teal-600 font-medium mb-1">
                            เวลาเข้า
                          </div>
                          <div className="bg-blue-100 text-blue-800 rounded-lg px-3 py-2 font-bold text-center">
                            {formatTimeDisplay(att.time_in)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-teal-600 font-medium mb-1">
                            เวลาออก
                          </div>
                          <div className="bg-orange-100 text-orange-800 rounded-lg px-3 py-2 font-bold text-center">
                            {formatTimeDisplay(att.time_out)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            // Set editing attendance พร้อมกับ form
                            setEditingAttendance(att);
                            setAttendanceForm({
                              employee_id: att.employee_id,
                              work_date: att.work_date.split("T")[0], // Normalize date
                              time_in: att.time_in,
                              time_out: att.time_out,
                              status: att.status,
                              work_hours: att.work_hours,
                              overtime_hours: att.overtime_hours,
                              note: att.note,
                            });
                            setShowAttendancePopup(false);
                            setShowAttendanceForm(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          แก้ไข
                        </button>
                        <button
                          onClick={() =>
                            att.id && handleDeleteAttendance(att.id)
                          }
                          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popup Footer */}
            <div className="bg-gray-100 p-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowAttendancePopup(false)}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceModalVisible && selectedGroupForServices && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeServiceModal}
        >
          <div
            className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl flex justify-between items-center text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  บริการในกลุ่ม {selectedGroupForServices.groupname}
                </h2>
                <p className="text-xs text-white/80 mt-1">
                  ข้อมูลจาก b_itemservice (groupcode = {selectedGroupForServices.groupcode})
                </p>
              </div>
              <button
                onClick={closeServiceModal}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {servicesLoading && (
                <p className="text-sm text-slate-500">กำลังโหลดรายการ...</p>
              )}
              {serviceError && (
                <p className="text-sm text-red-600">{serviceError}</p>
              )}
              {!servicesLoading && !serviceError && groupServiceItems.length === 0 && (
                <p className="text-sm text-gray-500">ไม่พบรายการบริการในกลุ่มนี้</p>
              )}
              {!servicesLoading && groupServiceItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupServiceItems.map((item) => (
                    <div
                      key={item.itemcode}
                      className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
                    >
                      <p className="text-xs text-gray-500">{item.itemcode}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.itemname}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-100 p-4 rounded-b-2xl flex justify-end">
              <button
                onClick={closeServiceModal}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {noteModalRecord && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeNoteModal}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  หมายเหตุทั้งหมด
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {noteModalRecord.customer_name || "ไม่ระบุชื่อลูกค้า"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeNoteModal}
                className="text-gray-500 hover:text-gray-800 transition"
                aria-label="ปิดหน้าต่างหมายเหตุ"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 6l12 12M6 18L18 6"
                  />
                </svg>
              </button>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 text-left max-h-[60vh] overflow-y-auto">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {noteModalRecord.note ?? "-"}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeNoteModal}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerRegistrationModal
        visible={showCustomerModal}
        loading={customerLoading}
        saving={customerSaving}
        exists={customerExists}
        form={customerForm}
        error={customerError}
        message={customerMessage}
        lead={selectedLeadSummary}
        staffOptions={staffOptions}
        staffLoading={staffLoading}
        staffError={staffError}
        onClose={closeCustomerModal}
        onChange={handleCustomerFormChange}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
}
