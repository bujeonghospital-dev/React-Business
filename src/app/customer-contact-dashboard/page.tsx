"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  CheckCircle2,
  User,
  Mail,
  Building2,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  UserCheck,
  PhoneCall,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Container from "@/components/Container";
import CustomerContactForm from "@/components/CustomerContactForm";
import {
  fetchCallMatrix,
  logCall,
  updateCallCount,
  transformCallMatrixData,
} from "@/utils/callMatrixApi";
import {
  fetchFilmDataContacts,
  transformFilmDataToAgentCounts,
} from "@/utils/filmDataApi";
// Types
interface ContactRecord {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: "outgoing" | "received" | "waiting" | "sale";
  lastContact: string;
  notes: string;
  createdAt: string;
  [key: string]: any; // สำหรับ dynamic columns จาก Google Sheets
}
// Film Contact Types (from Film_dev sheet)
interface FilmContactRecord {
  id: string;
  dbId?: number; // ID จาก database
  customerName: string;
  phoneNumber: string;
  remarks: string;
  product?: string; // ผลิตภัณฑ์ที่สนใจ (Column C)
  status: "incoming" | "outgoing" | "pending" | "completed";
  contactDate: string;
  nextContactDate?: string; // วันที่ติดต่อครั้งถัดไป
  company?: string;
  email?: string;
  agentId?: string; // ผู้ติดต่อ - Agent ID from YaleCom
}
type StatusType = "outgoing" | "received" | "waiting" | "sale" | "all";
// Google Sheets Types
interface GoogleSheetsData {
  id: string;
  [key: string]: any; // Dynamic columns
}
// Yalecom API Types
interface YalecomAgent {
  agent_id: string;
  agent_name: string;
  agent_queue_status: string;
  agent_outbound_callee_number: string;
  agent_queue_caller_number: string;
}
interface YalecomQueueStatus {
  queue_name: string;
  queue_extension: string;
  waiting_calls_in_queue: number;
  agents: YalecomAgent[];
}
// Robocall API Types
interface RobocallRecord {
  id: number;
  status: string;
  effective_caller_id_number: string;
  caller_destination: string;
  created_at: string;
  processed_at: string;
  transfer_to: string;
  last_destination: string;
  call_duration: string;
  last_fail_cause: string;
}
// Status Configuration
const STATUS_CONFIG = {
  outgoing: {
    label: "โทรออก",
    color: "bg-red-500",
    lightColor: "bg-red-100",
    textColor: "text-red-600",
    borderColor: "border-red-500",
    icon: PhoneOutgoing,
    gradient: "from-red-500 to-red-600",
  },
  received: {
    label: "รับสาย",
    color: "bg-yellow-500",
    lightColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    icon: PhoneIncoming,
    gradient: "from-yellow-500 to-yellow-600",
  },
  waiting: {
    label: "รอสาย",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-100",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-500",
    icon: Clock,
    gradient: "from-cyan-500 to-cyan-600",
  },
  sale: {
    label: "SALE ติดต่อ",
    color: "bg-green-500",
    lightColor: "bg-green-100",
    textColor: "text-green-600",
    borderColor: "border-green-500",
    icon: CheckCircle2,
    gradient: "from-green-500 to-green-600",
  },
};
// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const CustomerContactDashboard = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(
    null
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [queueData, setQueueData] = useState<YalecomQueueStatus | null>(null);
  const [agentContacts, setAgentContacts] = useState<ContactRecord[]>([]);
  const [allAgents, setAllAgents] = useState<ContactRecord[]>([]); // เก็บ agents ทั้งหมดสำหรับแสดงในส่วนล่าง
  const [robocallData, setRobocallData] = useState<RobocallRecord[]>([]); // เก็บข้อมูล Robocall
  const [logCallAiData, setLogCallAiData] = useState<any[]>([]); // เก็บข้อมูล Log_call_ai
  // Film Contact States (from contact-dashboard)
  const [filmContacts, setFilmContacts] = useState<FilmContactRecord[]>([]);
  const [filteredFilmContacts, setFilteredFilmContacts] = useState<
    FilmContactRecord[]
  >([]);
  const [filmSearchQuery, setFilmSearchQuery] = useState({
    customerName: "",
    phoneNumber: "",
    product: "",
    remarks: "",
  });
  const [selectedFilmContact, setSelectedFilmContact] =
    useState<FilmContactRecord | null>(null);
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState("");
  const [editedNextContactDate, setEditedNextContactDate] = useState("");
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  // Google Sheets States
  const [googleSheetsData, setGoogleSheetsData] = useState<GoogleSheetsData[]>(
    []
  );
  const [googleSheetsHeaders, setGoogleSheetsHeaders] = useState<string[]>([]);
  const [googleSheetsLoading, setGoogleSheetsLoading] = useState(false);
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // Call Matrix States
  const [callMatrixYaleCounts, setCallMatrixYaleCounts] = useState<
    Record<string, Record<string, number>>
  >({});
  const [callMatrixYaleTotals, setCallMatrixYaleTotals] = useState<
    Record<string, number>
  >({});
  // User Log Robocall States - ตารางบันทึกการโทรตามช่วงเวลา
  const [userLogRobocallData, setUserLogRobocallData] = useState<
    Record<string, Record<string, number>>
  >({});
  const [userLogRobocallTotals, setUserLogRobocallTotals] = useState<
    Record<string, number>
  >({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [callInputModal, setCallInputModal] = useState<{
    isOpen: boolean;
    agentId: string;
    hourSlot: string;
  }>({
    isOpen: false,
    agentId: "",
    hourSlot: "",
  });
  const [callInputValues, setCallInputValues] = useState({
    outgoing: "",
    successful: "",
  });
  // Film Data States - จำนวนนับ (O) และจำนวนผ่า (P)
  const [filmDataCounts, setFilmDataCounts] = useState<Record<string, number>>(
    {}
  );
  const [filmDataSurgeryCounts, setFilmDataSurgeryCounts] = useState<
    Record<string, number>
  >({});
  const callTableTimeSlots = [
    { label: "9:00-10:00", start: "9" },
    { label: "10:00-11:00", start: "10" },
    { label: "11:00-12:00", start: "11" },
    { label: "12:00-13:00", start: "12" },
    { label: "13:00-14:00", start: "13" },
    { label: "14:00-15:00", start: "14" },
    { label: "15:00-16:00", start: "15" },
    { label: "16:00-17:00", start: "16" },
    { label: "17:00-18:00", start: "17" },
    { label: "18:00-19:00", start: "18" },
    { label: "19:00-20:00", start: "19" },
  ];
  const agentDisplayList = [
    { id: "101", label: "101-สา" },
    { id: "102", label: "102-พัดชา" },
    { id: "103", label: "103-ตั้งโอ๋" },
    { id: "104", label: "104-Test" },
    { id: "105", label: "105-จีน" },
    { id: "106", label: "106-มุก" },
    { id: "107", label: "107-เจ" },
    { id: "108", label: "108-ว่าน" },
  ];
  const getCallTableValue = (
    agentId: string,
    hourSlot: string,
    metric: "yale" | "outgoing" | "passed"
  ) => {
    if (metric === "yale") {
      // ใช้ข้อมูลจาก API user_log_robocall
      // Format: "09:00-10:00", "10:00-11:00" เป็นต้น
      const hour = parseInt(hourSlot);
      const timeSlotKey = `${hour.toString().padStart(2, "0")}:00-${(hour + 1)
        .toString()
        .padStart(2, "0")}:00`;
      const slotData = userLogRobocallData[timeSlotKey];
      if (!slotData) {
        return 0;
      }
      return slotData[agentId] ?? 0;
    }
    if (metric === "outgoing") {
      // ใช้ข้อมูลจาก Film Data - จำนวนนับ (O)
      return filmDataCounts[agentId] ?? 0;
    }
    if (metric === "passed") {
      // ใช้ข้อมูลจาก Film Data - จำนวนผ่า (P)
      return filmDataSurgeryCounts[agentId] ?? 0;
    }
    return 0;
  };
  // Calculate statistics
  const allContacts = agentContacts.length > 0 ? agentContacts : contacts;
  const displayAgents = allAgents.length > 0 ? allAgents : allContacts; // ใช้สำหรับแสดงในส่วนล่าง
  const stats = {
    outgoing: allContacts.filter((c) => c.status === "outgoing").length,
    received: allContacts.filter((c) => c.status === "received").length,
    waiting: allContacts.filter((c) => c.status === "waiting").length,
    sale: allContacts.filter((c) => c.status === "sale").length,
    total: allContacts.length,
  };
  // Film Contact Statistics
  const filmContactsArray = Array.isArray(filmContacts) ? filmContacts : [];
  const filmStats = {
    total: filmContactsArray.length,
    incoming: filmContactsArray.filter((c) => c.status === "incoming").length,
    outgoing: filmContactsArray.filter((c) => c.status === "outgoing").length,
    pending: filmContactsArray.filter((c) => c.status === "pending").length,
    completed: filmContactsArray.filter((c) => c.status === "completed").length,
  };
  // คำนวณยอดรวมจากข้อมูล user_log_robocall
  const totalYaleCalls = Object.values(userLogRobocallTotals).reduce(
    (sum, value) => sum + value,
    0
  );
  // Auto-fetch on component mount
  useEffect(() => {
    fetchContacts();
    fetchGoogleSheetsData();
    fetchRobocallData();
    fetchLogCallAiData();
    fetchUserLogRobocallData(); // โหลดข้อมูลตารางบันทึกการโทร
    fetchCallMatrixYaleSummary();
    fetchFilmData();
    // Auto refresh ทุก 5 วินาที - Yalecom Queue Status และ Robocall
    const fastInterval = setInterval(() => {
      fetchYalecomQueueStatus(undefined, "900");
      fetchRobocallData();
      fetchLogCallAiData(); // รีเฟรช Log_call_ai ทุก 5 วินาที
      fetchFilmContacts(); // รีเฟรช Film contacts
    }, 5000); // 5 วินาที
    // Auto refresh ทุก 30 วินาที - ตารางบันทึกการโทรและ Google Sheets
    const slowInterval = setInterval(() => {
      fetchUserLogRobocallData(); // ตารางบันทึกการโทรตามช่วงเวลาจาก API ใหม่
      fetchCallMatrixYaleSummary(); // ตารางบันทึกการโทรตามช่วงเวลา (fallback)
      fetchFilmData(); // Film data
      fetchGoogleSheetsData(); // ตารางสรุป call_AI
    }, 30000); // 30 วินาที
    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);
  // Filter contacts
  useEffect(() => {
    // ใช้ข้อมูลจาก Yalecom API แทน contacts
    let filtered = agentContacts.length > 0 ? agentContacts : contacts;
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredContacts(filtered);
  }, [selectedStatus, searchQuery, contacts, agentContacts]);
  // Filter Film Contacts
  useEffect(() => {
    const contactsArray = Array.isArray(filmContacts) ? filmContacts : [];
    let filtered = [...contactsArray];
    if (filmSearchQuery.customerName) {
      filtered = filtered.filter((c) =>
        c.customerName
          .toLowerCase()
          .includes(filmSearchQuery.customerName.toLowerCase())
      );
    }
    if (filmSearchQuery.phoneNumber) {
      filtered = filtered.filter((c) =>
        c.phoneNumber.includes(filmSearchQuery.phoneNumber)
      );
    }
    if (filmSearchQuery.product) {
      filtered = filtered.filter((c) =>
        (c.product || "")
          .toLowerCase()
          .includes(filmSearchQuery.product.toLowerCase())
      );
    }
    if (filmSearchQuery.remarks) {
      filtered = filtered.filter((c) =>
        (c.remarks || "")
          .toLowerCase()
          .includes(filmSearchQuery.remarks.toLowerCase())
      );
    }
    setFilteredFilmContacts(filtered);
  }, [filmSearchQuery, filmContacts]);
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  // Fetch Robocall API data
  const fetchRobocallData = async () => {
    try {
      const response = await fetch("/api/robocall");
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // กรองเฉพาะสถานะ "กำลังดำเนินการ"
        const activeRobocalls = result.data.filter(
          (call: RobocallRecord) => call.status === "กำลังดำเนินการ"
        );
        setRobocallData(activeRobocalls);
      }
    } catch (error) {
      console.error("Error fetching Robocall data:", error);
    }
  };
  // Fetch Log_call_ai data from Google Sheets
  const fetchLogCallAiData = async () => {
    try {
      const response = await fetch("/api/google-sheets-log-call-ai");
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setLogCallAiData(result.data);
        console.log("✅ Log_call_ai data loaded:", result.data.length, "rows");
        console.log("📋 Log_call_ai sample data:", result.data[0]); // แสดงข้อมูลตัวอย่าง
        console.log("📋 Headers:", result.headers); // แสดง headers
      } else {
        console.error("❌ Failed to load Log_call_ai:", result.error);
      }
    } catch (error) {
      console.error("❌ Error fetching Log_call_ai data:", error);
    }
  };
  // Fetch queue status from Yalecom API (via internal API route)
  const fetchYalecomQueueStatus = async (
    queueUuid?: string,
    queueExtension?: string
  ) => {
    try {
      // ดึงข้อมูล Log_call_ai ก่อนทุกอย่าง
      const logResponse = await fetch("/api/google-sheets-log-call-ai");
      const logResult = await logResponse.json();
      let currentLogData: any[] = [];
      if (logResult.success && Array.isArray(logResult.data)) {
        currentLogData = logResult.data;
        setLogCallAiData(currentLogData);
        console.log(
          "🔄 โหลด Log_call_ai สำเร็จ:",
          currentLogData.length,
          "rows"
        );
        console.log("📋 ข้อมูลตัวอย่าง:", currentLogData[0]);
      }
      // ดึงข้อมูล Robocall ต่อ
      const robocallResponse = await fetch("/api/robocall");
      const robocallResult = await robocallResponse.json();
      let activeRobocalls: RobocallRecord[] = [];
      if (robocallResult.success && Array.isArray(robocallResult.data)) {
        activeRobocalls = robocallResult.data.filter(
          (call: RobocallRecord) => call.status === "กำลังดำเนินการ"
        );
        setRobocallData(activeRobocalls);
        console.log(
          "🔄 โหลด Robocall สำเร็จ:",
          activeRobocalls.length,
          "calls"
        );
      }
      const params = new URLSearchParams();
      if (queueUuid) {
        params.append("queue_uuid", queueUuid);
      } else if (queueExtension) {
        params.append("queue_extension", queueExtension);
      }
      const response = await fetch(
        `/api/yalecom/queue-status?${params.toString()}`
      );
      const result = await response.json();
      if (!result.success) {
        console.error("❌ API Error:", result.error);
        throw new Error(result.error || "Failed to fetch queue status");
      }
      const data: YalecomQueueStatus = result.data;
      setQueueData(data);
      // Agent Name Mapping
      const agentNameMap: { [key: string]: string } = {
        "101": "สา",
        "102": "พัดชา",
        "103": "ตั้งโอ๋",
        "104": "Test",
        "105": "จีน",
        "106": "มุก",
        "107": "เจ",
        "108": "ว่าน",
      };
      // แปลงข้อมูล agents เป็น ContactRecord สำหรับแสดงในส่วนล่าง (ทุกคน)
      const allAgentsData: ContactRecord[] = data.agents.map((agent) => {
        const agentName = agentNameMap[agent.agent_id];
        const displayName = agentName
          ? `${agent.agent_id} - ${agentName}`
          : agent.agent_name;
        let status: ContactRecord["status"] = "waiting";
        let customerPhone = "-";
        // กำหนดสถานะและเบอร์
        if (agent.agent_queue_status === "Dialing") {
          status = "outgoing";
          customerPhone = agent.agent_outbound_callee_number || "-";
        } else if (agent.agent_queue_status === "Ringing") {
          status = "waiting";
          customerPhone = agent.agent_queue_caller_number || "-";
        } else if (
          agent.agent_queue_status === "InCall" ||
          agent.agent_queue_status === "Busy" ||
          agent.agent_queue_status === "Inbound" ||
          agent.agent_queue_status === "Outbound"
        ) {
          status = "sale";
          customerPhone =
            agent.agent_queue_caller_number ||
            agent.agent_outbound_callee_number ||
            "-";
        } else if (agent.agent_queue_status === "Waiting") {
          status = "waiting";
          customerPhone = "-";
        }
        return {
          id: agent.agent_id,
          name: displayName,
          company: data.queue_name,
          phone: customerPhone,
          email: "",
          status: status,
          lastContact: new Date().toISOString(),
          notes: `สถานะ: ${agent.agent_queue_status}`,
          createdAt: new Date().toISOString(),
        };
      });
      setAllAgents(allAgentsData); // เก็บทุกคนไว้สำหรับแสดงในส่วนล่าง
      // แปลงข้อมูลจาก Robocall API เป็น ContactRecord สำหรับ "โทรออก"
      const robocallContacts: ContactRecord[] = activeRobocalls.map((call) => {
        // ใช้เบอร์ caller (effective_caller_id_number) เป็นชื่อแสดง
        const callerNumber = call.effective_caller_id_number;
        // ทำความสะอาดเบอร์โทรศัพท์ (เอาเฉพาะตัวเลข)
        const cleanPhone = (phone: string) => {
          return phone.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
        };
        // ตัดเลข 0 ออกจากเบอร์ลูกค้า (caller_destination) เพื่อแมพกับ Log_call_ai
        const customerPhone = call.caller_destination;
        const customerPhoneClean = cleanPhone(customerPhone);
        const customerPhoneWithoutZero = customerPhoneClean.replace(/^0/, "");
        // ตรวจสอบว่ามีเบอร์นี้ใน Log_call_ai หรือไม่ และ status = "2" (รับสาย)
        const isAnswered = currentLogData.some((log) => {
          const logPhone =
            log.phone || log.Phone || log.เบอร์ || log["เบอร์"] || "";
          const logPhoneClean = cleanPhone(String(logPhone));
          const logPhoneWithoutZero = logPhoneClean.replace(/^0/, "");
          const logStatus = String(log.status || log.Status || log.สถานะ || "");
          const phoneMatch =
            customerPhoneClean === logPhoneClean ||
            customerPhoneWithoutZero === logPhoneWithoutZero ||
            customerPhone === logPhone;
          return phoneMatch && logStatus === "2";
        });
        // ตรวจสอบว่ามีเบอร์นี้ใน Log_call_ai หรือไม่ และ status = "3" (รอสาย)
        const isWaiting = currentLogData.some((log) => {
          const logPhone =
            log.phone || log.Phone || log.เบอร์ || log["เบอร์"] || "";
          const logPhoneClean = cleanPhone(String(logPhone));
          const logPhoneWithoutZero = logPhoneClean.replace(/^0/, "");
          const logStatus = String(log.status || log.Status || log.สถานะ || "");
          const phoneMatch =
            customerPhoneClean === logPhoneClean ||
            customerPhoneWithoutZero === logPhoneWithoutZero ||
            customerPhone === logPhone;
          return phoneMatch && logStatus === "3";
        });
        // Debug logging
        const matchedLog = currentLogData.find((log) => {
          const logPhone =
            log.phone || log.Phone || log.เบอร์ || log["เบอร์"] || "";
          const logPhoneClean = cleanPhone(String(logPhone));
          const logPhoneWithoutZero = logPhoneClean.replace(/^0/, "");
          return (
            customerPhoneClean === logPhoneClean ||
            customerPhoneWithoutZero === logPhoneWithoutZero ||
            customerPhone === logPhone
          );
        });
        if (matchedLog) {
          const logStatus = String(
            matchedLog.status || matchedLog.Status || matchedLog.สถานะ || ""
          );
          console.log("📞 เจอเบอร์ตรงกัน:", {
            robocallPhone: customerPhone,
            logPhone: matchedLog.phone || matchedLog.เบอร์,
            logStatus: logStatus,
            result:
              logStatus === "2"
                ? "✅ ย้ายไป รับสาย"
                : logStatus === "3"
                ? "⏳ ย้ายไป รอสาย"
                : "🔴 อยู่ที่ โทรออก",
          });
        } else if (currentLogData.length > 0) {
          console.log("🔍 ตรวจสอบเบอร์:", {
            robocallPhone: customerPhone,
            cleanPhone: customerPhoneClean,
            withoutZero: customerPhoneWithoutZero,
            logDataCount: currentLogData.length,
            availableLogPhones: currentLogData.map((log) => ({
              phone: log.phone || log.เบอร์,
              status: log.status,
            })),
            status: "ไม่เจอเบอร์ตรงกัน - อยู่ที่ โทรออก",
          });
        } else if (currentLogData.length === 0) {
          console.warn("⚠️ Log_call_ai ยังไม่มีข้อมูล - รอโหลด...");
        }
        // กำหนด status และ display name
        let finalStatus: ContactRecord["status"] = "outgoing";
        let displayName = `Robocall - ${callerNumber}`;
        let companyName = "Robocall (กำลังดำเนินการ)";
        if (isAnswered) {
          finalStatus = "received";
          displayName = customerPhone;
          companyName = "Robocall (รับสายแล้ว)";
        } else if (isWaiting) {
          finalStatus = "waiting";
          displayName = customerPhone;
          companyName = "Robocall (รอสาย)";
        }
        return {
          id: `robocall-${call.id}`,
          name: displayName,
          company: companyName,
          phone: call.caller_destination,
          email: "",
          status: finalStatus,
          lastContact: call.created_at,
          notes: `Robocall ID: ${call.id}, Transfer to: ${call.transfer_to}, Duration: ${call.call_duration}`,
          createdAt: call.created_at,
        };
      });
      // แปลงข้อมูล agents เป็น ContactRecord ตามระบบใหม่ (สำหรับ Kanban Board)
      const agentContactsData: ContactRecord[] = data.agents
        .map((agent): ContactRecord | null => {
          let status: ContactRecord["status"] | null = null;
          let customerPhone = "-";
          // ใช้ชื่อจาก mapping พร้อม ID หรือใช้ชื่อเดิมถ้าไม่มีใน mapping
          const agentName = agentNameMap[agent.agent_id];
          const displayName = agentName
            ? `${agent.agent_id} - ${agentName}`
            : agent.agent_name;
          // 1. โทรออก - Robocall API (กำลังดำเนินการ)
          if (agent.agent_queue_status === "Dialing") {
            status = "outgoing"; // แท็กเป็น "โทรออก"
            customerPhone = agent.agent_outbound_callee_number || "-";
          }
          // 2. รอสาย - ไม่แสดง (ซ่อนไว้)
          // else if (agent.agent_queue_status === "Ringing") {
          //   status = "waiting";
          //   customerPhone = agent.agent_queue_caller_number || "-";
          // }
          // 3. SALE ติดต่อ - Queue Status API (InCall/Inbound/Outbound)
          else if (
            agent.agent_queue_status === "InCall" ||
            agent.agent_queue_status === "Busy" ||
            agent.agent_queue_status === "Inbound" ||
            agent.agent_queue_status === "Outbound"
          ) {
            status = "sale"; // แท็กเป็น "SALE ติดต่อ"
            customerPhone =
              agent.agent_queue_caller_number ||
              agent.agent_outbound_callee_number ||
              "-";
          }
          // ถ้าไม่ใช่สถานะที่ต้องการ ไม่ต้องแสดง
          else {
            return null;
          }
          return {
            id: agent.agent_id,
            name: displayName,
            company: data.queue_name,
            phone: customerPhone,
            email: "",
            status: status!,
            lastContact: new Date().toISOString(),
            notes: `สถานะ: ${agent.agent_queue_status}`,
            createdAt: new Date().toISOString(),
          };
        })
        .filter((contact) => contact !== null) as ContactRecord[]; // กรอง null ออก
      // รวม Robocall contacts กับ agent contacts
      const combinedContacts = [...robocallContacts, ...agentContactsData];
      setAgentContacts(combinedContacts);
      return data;
    } catch (error) {
      console.error("Error fetching Yalecom queue status:", error);
      return null;
    }
  };
  // Fetch Film Contacts from API (Google Sheets - Film_dev)
  const fetchFilmContacts = async () => {
    try {
      const response = await fetch("/api/film-contacts");
      if (response.ok) {
        const result = await response.json();
        const contactsData: FilmContactRecord[] = Array.isArray(result)
          ? result
          : result.data || [];
        setFilmContacts(contactsData);
        setFilteredFilmContacts(contactsData);
        console.log("✅ Film contacts loaded:", contactsData.length);
      }
    } catch (error) {
      console.error("Error fetching film contacts:", error);
    }
  };
  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      // Fetch from Supabase API (optional - ถ้าไม่มี Supabase ก็ข้ามไป)
      try {
        const response = await fetch("/api/customer-contacts");
        const result = await response.json();
        if (result.success) {
          setContacts(result.data);
          console.log("✅ Contacts loaded from Supabase:", result.data.length);
        } else if (
          result.error &&
          result.error !== "Supabase is not configured"
        ) {
          console.warn("⚠️ Supabase API warning:", result.error);
        }
      } catch (supabaseError) {
        console.warn("⚠️ Supabase not available, skipping...");
      }
      // Also fetch from Yalecom API (ใช้ queue_extension 900)
      await fetchYalecomQueueStatus(undefined, "900");
      // Fetch Film contacts
      await fetchFilmContacts();
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch Google Sheets Data (สรุป call_AI)
  const fetchGoogleSheetsData = async () => {
    try {
      setGoogleSheetsLoading(true);
      const response = await fetch("/api/google-sheets-call-ai");
      const result = await response.json();
      if (result.success) {
        setGoogleSheetsData(result.data);
        // Debug: ดูว่า headers มีอะไรบ้าง
        console.log("📋 All available headers:", result.headers);
        // กรองเฉพาะคอลัมน์ที่ต้องการ (รองรับทั้ง End และ end)
        const desiredHeaders = [
          "ชื่อลูกค้า",
          "ช่องทาง",
          "status",
          "เบอร์",
          "start",
        ];
        // หา End column (case insensitive)
        const endColumn = result.headers.find(
          (h: string) => h.toLowerCase() === "end"
        );
        if (endColumn) {
          desiredHeaders.push(endColumn);
        }
        const filteredHeaders = result.headers.filter((header: string) =>
          desiredHeaders.includes(header)
        );
        console.log("✅ Filtered headers:", filteredHeaders);
        setGoogleSheetsHeaders(
          filteredHeaders.length > 0 ? filteredHeaders : desiredHeaders
        );
        setCurrentPage(1); // รีเซ็ตกลับไปหน้า 1 เมื่อโหลดข้อมูลใหม่
        console.log(
          "✅ Google Sheets Data loaded:",
          result.data.length,
          "rows"
        );
      } else {
        console.error("❌ Failed to fetch Google Sheets:", result.error);
      }
    } catch (error) {
      console.error("Error fetching Google Sheets data:", error);
    } finally {
      setGoogleSheetsLoading(false);
    }
  };
  // Fetch User Log Robocall data from API
  const fetchUserLogRobocallData = async () => {
    try {
      console.log("🔄 Fetching user_log_robocall data for date:", selectedDate);
      const params = new URLSearchParams();
      params.append("report_date", selectedDate); // ใช้ report_date แทน
      params.append("limit", "1000");
      const response = await fetch(
        `/api/user-log-robocall?${params.toString()}`
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // จัดกลุ่มข้อมูลตาม caller_id_name และ time slot
        const counts: Record<string, Record<string, number>> = {};
        const totals: Record<string, number> = {};
        result.data.forEach((log: any) => {
          const callerId = log.caller_id_name || log.user_id || "Unknown";
          // วนลูปทุก time slot (09:00-10:00 ถึง 19:00-20:00)
          for (let hour = 9; hour <= 19; hour++) {
            // Key สำหรับเก็บข้อมูลและแสดงผล
            const timeSlotKey = `${hour.toString().padStart(2, "0")}:00-${(
              hour + 1
            )
              .toString()
              .padStart(2, "0")}:00`;
            // Key ของคอลัมน์ในตาราง (ตรงกับ API response: "09:00-10:00", "10:00-11:00")
            const columnKey = timeSlotKey;
            // ดึงค่าจากคอลัมน์ในตาราง
            const value = parseInt(log[columnKey]) || 0;
            if (value > 0) {
              if (!counts[timeSlotKey]) {
                counts[timeSlotKey] = {};
              }
              counts[timeSlotKey][callerId] = value;
            }
          }
          // ใช้ total_day สำหรับยอดรวม
          if (log.total_day) {
            totals[callerId] = parseInt(log.total_day) || 0;
          }
        });
        setUserLogRobocallData(counts);
        setUserLogRobocallTotals(totals);
        console.log("✅ User log robocall data loaded:", counts);
        console.log("📊 Totals:", totals);
        console.log("📋 Sample data:", result.data[0]);
      } else {
        console.error("❌ Failed to load user_log_robocall:", result.error);
      }
    } catch (error) {
      console.error("❌ Error fetching user_log_robocall data:", error);
    }
  };
  // Fetch Yale call summary from Python API
  const fetchCallMatrixYaleSummary = async () => {
    try {
      console.log(
        "🔄 Fetching call matrix from Python API for date:",
        selectedDate
      );
      const result = await fetchCallMatrix(selectedDate);
      if (result.success) {
        // แปลงข้อมูลจาก Python API format เป็น format ที่ใช้ใน dashboard
        const { callMatrixYaleCounts, callMatrixYaleTotals } =
          transformCallMatrixData(result);
        setCallMatrixYaleCounts(callMatrixYaleCounts);
        setCallMatrixYaleTotals(callMatrixYaleTotals);
        console.log("✅ Call matrix loaded from Python API:", {
          date: result.date,
          grand_total: result.grand_total,
          agents: Object.keys(result.matrix_data).length,
          time_slots: result.time_slots.length,
        });
      } else {
        console.error(
          "❌ Failed to fetch call matrix from Python API:",
          result
        );
      }
    } catch (error) {
      console.error("❌ Error fetching call matrix from Python API:", error);
      // Fallback: ถ้า Python API ไม่ตอบสนอง ให้ลอง Google Sheets API แทน
      console.log("⚠️ Trying fallback to Google Sheets API...");
      try {
        const response = await fetch(
          `/api/google-sheets-call-ai-summary?date=${selectedDate}`
        );
        const result = await response.json();
        if (result.success) {
          const slotMap: Record<string, Record<string, number>> = {};
          if (Array.isArray(result.timeSlots)) {
            result.timeSlots.forEach((slot: any) => {
              if (!slot || typeof slot !== "object") {
                return;
              }
              const hourKey = String(slot.hourStart ?? slot.key ?? "");
              if (!hourKey) {
                return;
              }
              slotMap[hourKey] = { ...(slot.agentCounts || {}) };
            });
          }
          setCallMatrixYaleCounts(slotMap);
          setCallMatrixYaleTotals(result.totals || {});
          console.log(
            "✅ Call matrix loaded from Google Sheets API (fallback):",
            result
          );
        }
      } catch (fallbackError) {
        console.error(
          "❌ Fallback to Google Sheets API also failed:",
          fallbackError
        );
      }
    }
  };
  // Fetch Film Data - จำนวนนับ (O) และจำนวนผ่า (P) จาก SQL API (ORDER BY booking_count DESC)
  const fetchFilmData = async () => {
    try {
      // ใช้ SQL API ใหม่ที่เรียงลำดับด้วย ORDER BY booking_count DESC
      const params = new URLSearchParams();
      params.append("date", selectedDate);
      params.append("today", "true");
      const response = await fetch(
        `/api/film-booking-count?${params.toString()}`
      );
      const result = await response.json();
      if (result.success) {
        // ตั้งค่าจำนวน consult และนัดผ่าตัด
        setFilmDataCounts(result.consultCounts || {});
        setFilmDataSurgeryCounts(result.surgeryCounts || {});
        console.log(
          "✅ Film data loaded from SQL API (ORDER BY booking_count DESC):",
          result
        );
        console.log("  - Consult counts by agent:", result.consultCounts);
        console.log("  - Surgery counts by agent:", result.surgeryCounts);
        console.log("  - Summary:", result.summary);
      } else {
        // API ตอบกลับมาแต่ไม่ success
        console.warn(
          "⚠️ Film data SQL API returned error:",
          result.error || result
        );
        // Fallback: ลอง Python API (เดิม)
        console.log("⚠️ Trying fallback to Python API...");
        try {
          const pythonResult = await fetchFilmDataContacts(
            selectedDate,
            true,
            true
          );
          if (pythonResult.success) {
            const { consultCounts, surgeryCounts } =
              transformFilmDataToAgentCounts(pythonResult);
            setFilmDataCounts(consultCounts);
            setFilmDataSurgeryCounts(surgeryCounts);
            console.log(
              "✅ Film data loaded from Python API (fallback):",
              pythonResult
            );
          } else {
            // Fallback ที่ 2: ลอง Google Sheets API
            console.log("⚠️ Trying fallback to Google Sheets API...");
            const gsResponse = await fetch(
              `/api/google-sheets-film-data?date=${selectedDate}`
            );
            const gsResult = await gsResponse.json();
            if (gsResult.success) {
              setFilmDataCounts(gsResult.agentCounts || {});
              setFilmDataSurgeryCounts(gsResult.surgeryCounts || {});
              console.log(
                "✅ Film data loaded from Google Sheets (fallback 2):",
                gsResult
              );
            } else {
              // ไม่มีข้อมูล - ตั้งค่าเป็นว่าง
              setFilmDataCounts({});
              setFilmDataSurgeryCounts({});
            }
          }
        } catch (fallbackError) {
          console.error("❌ All fallbacks failed:", fallbackError);
          setFilmDataCounts({});
          setFilmDataSurgeryCounts({});
        }
      }
    } catch (error) {
      console.error("❌ Error fetching Film data from SQL API:", error);
      // Fallback: ลอง Python API
      try {
        const pythonResult = await fetchFilmDataContacts(
          selectedDate,
          true,
          true
        );
        if (pythonResult.success) {
          const { consultCounts, surgeryCounts } =
            transformFilmDataToAgentCounts(pythonResult);
          setFilmDataCounts(consultCounts);
          setFilmDataSurgeryCounts(surgeryCounts);
          console.log(
            "✅ Film data loaded from Python API (error fallback):",
            pythonResult
          );
        } else {
          setFilmDataCounts({});
          setFilmDataSurgeryCounts({});
        }
      } catch (fallbackError) {
        console.error("❌ Error fallback also failed:", fallbackError);
        setFilmDataCounts({});
        setFilmDataSurgeryCounts({});
      }
    }
  };
  // Save call input to database via Python API
  const handleSaveCallInput = async () => {
    if (!callInputValues.outgoing && !callInputValues.successful) {
      alert("กรุณากรอกจำนวนอย่างน้อย 1 ค่า");
      return;
    }
    try {
      const outgoingCount = parseInt(callInputValues.outgoing) || 0;
      const successfulCount = parseInt(callInputValues.successful) || 0;
      // สร้าง time_slot format (เช่น "9" -> "9-10")
      const hourStart = parseInt(callInputModal.hourSlot);
      const hourEnd = hourStart + 1;
      const timeSlot = `${hourStart}-${hourEnd}`;
      console.log("💾 บันทึกข้อมูล:", {
        agent_id: callInputModal.agentId,
        time_slot: timeSlot,
        outgoing: outgoingCount,
        successful: successfulCount,
      });
      // อัพเดทค่าผ่าน Python API
      // ใช้ค่า successful (จำนวนที่นับ) เป็นค่าที่บันทึก
      if (successfulCount > 0) {
        const result = await updateCallCount({
          agent_id: callInputModal.agentId,
          time_slot: timeSlot,
          value: successfulCount,
        });
        if (result.success) {
          console.log("✅ บันทึกสำเร็จผ่าน Python API:", result);
          setCallInputModal({ isOpen: false, agentId: "", hourSlot: "" });
          setCallInputValues({ outgoing: "", successful: "" });
          await fetchCallMatrixYaleSummary(); // Refresh table
        } else {
          console.error("❌ บันทึกล้มเหลว:", result.error);
        }
      } else {
        console.warn("กรุณากรอกจำนวนที่นับ (สำเร็จ)");
      }
    } catch (error) {
      console.error("❌ Error saving call input:", error);
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
    }
  };
  // Film Contact Modal Handlers
  const handleFilmRowClick = async (contact: FilmContactRecord) => {
    setSelectedFilmContact(contact);
    setEditedRemarks(contact.remarks || "");
    setEditedNextContactDate(contact.nextContactDate || "");
    setIsFilmModalOpen(true);
    // บันทึก last_followup อัตโนมัติเป็นเวลาปัจจุบัน
    if (contact.dbId) {
      try {
        const response = await fetch(
          "/api/film-contacts/update-last-followup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: contact.dbId }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          const newContactDate = result.data.last_followup;
          const updatedContacts = filmContacts.map((c) =>
            c.dbId === contact.dbId ? { ...c, contactDate: newContactDate } : c
          );
          setFilmContacts(updatedContacts);
          setSelectedFilmContact((prev) =>
            prev ? { ...prev, contactDate: newContactDate } : prev
          );
        }
      } catch (error) {
        console.error("Error auto-saving last followup:", error);
      }
    }
  };
  const handleCloseFilmModal = () => {
    setIsFilmModalOpen(false);
    setTimeout(() => {
      setSelectedFilmContact(null);
      setEditedRemarks("");
      setEditedNextContactDate("");
    }, 300);
  };
  const showToastNotification = (
    message: string,
    type: "success" | "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const handleSaveFilmContact = async () => {
    if (!selectedFilmContact || !selectedFilmContact.dbId) {
      showToastNotification("ไม่สามารถบันทึกได้: ไม่พบ ID ของข้อมูล", "error");
      return;
    }
    try {
      setIsSavingRemarks(true);
      const [remarksResponse, nextContactResponse] = await Promise.all([
        fetch("/api/film-contacts/update-remarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedFilmContact.dbId,
            remarks: editedRemarks,
          }),
        }),
        fetch("/api/film-contacts/update-next-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedFilmContact.dbId,
            nextContactDate: editedNextContactDate,
          }),
        }),
      ]);
      if (remarksResponse.ok && nextContactResponse.ok) {
        showToastNotification("✅ บันทึกข้อมูลทั้งหมดสำเร็จ!", "success");
        const updatedContacts = filmContacts.map((c) =>
          c.dbId === selectedFilmContact.dbId
            ? {
                ...c,
                remarks: editedRemarks,
                nextContactDate: editedNextContactDate,
              }
            : c
        );
        setFilmContacts(updatedContacts);
        setSelectedFilmContact({
          ...selectedFilmContact,
          remarks: editedRemarks,
          nextContactDate: editedNextContactDate,
        });
      } else {
        const errors = [];
        if (!remarksResponse.ok) {
          const error = await remarksResponse.json();
          errors.push(`หมายเหตุ: ${error.message || "ไม่สามารถบันทึกได้"}`);
        }
        if (!nextContactResponse.ok) {
          const error = await nextContactResponse.json();
          errors.push(`วันที่ติดต่อ: ${error.message || "ไม่สามารถบันทึกได้"}`);
        }
        showToastNotification(`❌ ${errors.join(", ")}`, "error");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showToastNotification("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSavingRemarks(false);
    }
  };
  // Refresh data
  const handleRefresh = async () => {
    await fetchContacts();
    await fetchGoogleSheetsData();
    await fetchUserLogRobocallData();
    await fetchCallMatrixYaleSummary();
    await fetchFilmData();
    await fetchFilmContacts();
  };
  // Open form for creating new contact
  const handleCreate = () => {
    setFormMode("create");
    setEditingContact(null);
    setIsFormOpen(true);
  };
  // Open form for editing contact
  const handleEdit = (contact: ContactRecord) => {
    setFormMode("edit");
    setEditingContact(contact);
    setIsFormOpen(true);
  };
  // Handle form submit
  const handleFormSubmit = async (formData: any) => {
    try {
      if (formMode === "create") {
        // Create new contact
        const response = await fetch("/api/customer-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          setContacts((prev) => [result.data, ...prev]);
        }
      } else if (formMode === "edit" && editingContact) {
        // Update existing contact
        const response = await fetch(
          `/api/customer-contacts/${editingContact.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        const result = await response.json();
        if (result.success) {
          setContacts((prev) =>
            prev.map((c) => (c.id === editingContact.id ? result.data : c))
          );
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };
  // Handle delete contact
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      return;
    }
    try {
      const response = await fetch(`/api/customer-contacts/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>กลับไปหน้าหลัก</span>
          </button>
        </motion.div>
        {/* Header Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              dashboard การติดต่อลูกค้า
            </h1>
            {queueData && (
              <div className="flex items-center justify-center gap-4 text-white/90 text-sm mt-4">
                <span>Queue: {queueData.queue_name}</span>
                <span>•</span>
                <span>Extension: {queueData.queue_extension}</span>
                <span>•</span>
                <span>รอสาย: {queueData.waiting_calls_in_queue} สาย</span>
              </div>
            )}
          </div>
        </motion.div>
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-3 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md disabled:opacity-50 border border-gray-200"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            รีเฟรช
          </motion.button>
        </motion.div>
        {/* Statistics Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {(
            Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
          ).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const count = stats[status];
            return (
              <motion.div
                key={status}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? "all" : status)
                }
                className={`cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                  selectedStatus === status
                    ? config.borderColor
                    : "border-transparent"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-4 rounded-xl ${config.lightColor} transform hover:rotate-6 transition-transform`}
                    >
                      <Icon className={`w-8 h-8 ${config.textColor}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {count}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">รายการ</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${config.textColor} text-lg`}>
                      {config.label}
                    </h3>
                    {selectedStatus === status && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-3 h-3 rounded-full ${config.color}`}
                      />
                    )}
                  </div>
                </div>
                <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
              </motion.div>
            );
          })}
        </motion.div>
        {/* Filters and Search */}
        {/* Kanban Board - Contact Tables by Status */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {(
            Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
          ).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const statusContacts = filteredContacts.filter(
              (c) => c.status === status
            );
            return (
              <motion.div
                key={status}
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100"
              >
                {/* Column Header */}
                <div
                  className={`p-4 bg-gradient-to-r ${config.gradient} text-white`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-6 h-6" />
                      <h3 className="font-bold text-lg">{config.label}</h3>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {statusContacts.length}
                    </div>
                  </div>
                </div>
                {/* Contact Cards in Column */}
                <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {statusContacts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-gray-400"
                      >
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">ไม่มีรายการ</p>
                      </motion.div>
                    ) : (
                      statusContacts.map((contact) => (
                        <motion.div
                          key={contact.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`${config.lightColor} rounded-xl p-4 border-2 ${config.borderColor} transition-all`}
                        >
                          {/* ชื่อและเบอร์ในแถวเดียวกัน */}
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-semibold text-gray-900 text-[16px] truncate">
                              {contact.name}
                            </h4>
                            <p
                              className={`text-base font-bold ${config.textColor} whitespace-nowrap`}
                            >
                              {/* กรองเบอร์ 101-108 ออก */}
                              {contact.phone &&
                              !contact.phone.match(/^10[1-8]-/)
                                ? contact.phone
                                : "-"}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* Detail Cards Section - แสดงรายละเอียดทั้งหมด */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            รายละเอียด Agents ทั้งหมด
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayAgents.map((contact) => {
              const config = STATUS_CONFIG[contact.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
                >
                  {/* Agent ID Badge */}
                  <div className={`${config.color} px-4 py-2 text-center`}>
                    <p className="text-white font-bold text-lg">
                      {contact.name}
                    </p>
                  </div>
                  {/* Contact Info */}
                  <div className="p-4">
                    {/* Phone Number - เบอร์ที่ติดต่อกับลูกค้า */}
                    <div className="mb-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {contact.phone}
                      </p>
                    </div>
                    {/* Status - จาก API */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 text-center mb-2">
                        สถานะ
                      </p>
                      <div
                        className={`flex items-center justify-center gap-2 ${config.lightColor} ${config.textColor} px-3 py-2 rounded-lg`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {displayAgents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ไม่มีข้อมูล Agent</p>
              <p className="text-sm mt-2">กรุณารอสักครู่...</p>
            </div>
          )}
        </motion.div>
        {/* Call Log Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="w-7 h-7" />
              ตารางบันทึกการโทรตามช่วงเวลา
            </h2>
          </div>
          <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>เลือกวันที่</span>
              <span className="font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="call-matrix-date"
                className="text-sm font-semibold text-gray-700"
              >
                วันที่
              </label>
              <input
                id="call-matrix-date"
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value) {
                    setSelectedDate(value);
                  }
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-400 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-4 py-3 text-center font-bold text-gray-700 min-w-[140px]" />
                  {agentDisplayList.map((agent) => (
                    <th
                      key={`header-${agent.id}`}
                      className="border border-gray-400 px-4 py-3 text-center font-bold text-gray-700"
                    >
                      {agent.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50">
                  <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-700 bg-blue-200">
                    จำนวน นัดผ่าตัด
                  </th>
                  {agentDisplayList.map((agent) => {
                    const value = filmDataSurgeryCounts[agent.id] ?? 0;
                    return (
                      <td
                        key={`surgery-${agent.id}`}
                        className="border border-gray-400 px-4 py-3 text-center font-semibold text-gray-900 bg-blue-50"
                      >
                        {value > 0 ? value : ""}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-yellow-50">
                  <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-700 bg-yellow-200">
                    จำนวน consult
                  </th>
                  {agentDisplayList.map((agent) => {
                    const value = filmDataCounts[agent.id] ?? 0;
                    return (
                      <td
                        key={`appointment-${agent.id}`}
                        className="border border-gray-400 px-4 py-3 text-center font-semibold text-gray-900 bg-yellow-50"
                      >
                        {value > 0 ? value : ""}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-green-50">
                  <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-700 bg-green-200">
                    จำนวนโทร
                  </th>
                  {agentDisplayList.map((agent) => {
                    const value = userLogRobocallTotals[agent.id] ?? 0;
                    return (
                      <td
                        key={`total-${agent.id}`}
                        className="border border-gray-400 px-4 py-3 text-center font-semibold text-gray-900 bg-green-50"
                      >
                        {value > 0 ? value : ""}
                      </td>
                    );
                  })}
                </tr>
                {callTableTimeSlots.map((slot) => (
                  <tr key={`slot-${slot.start}`} className="bg-white">
                    <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                      {slot.label}
                    </th>
                    {agentDisplayList.map((agent) => {
                      const value = getCallTableValue(
                        agent.id,
                        slot.start,
                        "yale"
                      );
                      return (
                        <td
                          key={`${slot.start}-${agent.id}`}
                          onClick={() =>
                            setCallInputModal({
                              isOpen: true,
                              agentId: agent.id,
                              hourSlot: slot.start,
                            })
                          }
                          className="border border-gray-400 px-4 py-3 text-center font-semibold text-gray-900 cursor-pointer hover:bg-blue-50"
                        >
                          {value > 0 ? value : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span>
                  ช่วงเวลา <span className="font-bold text-gray-900">7</span>{" "}
                  ช่วง
                </span>
                <span>•</span>
                <span>
                  เซลล์ <span className="font-bold text-gray-900">8</span> คน
                  (101-108)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">
                  วันที่:{" "}
                  {new Date(selectedDate).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Contact History Table - ตารางประวัติการติดต่อลูกค้า */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <PhoneCall className="w-7 h-7" />
              รายการติดต่อลูกค้า
            </h2>
          </div>
          {/* Statistics Cards */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                <h3 className="text-sm font-bold mb-1">จำนวน Lead</h3>
                <p className="text-3xl font-bold">{filmStats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-4 text-white">
                <h3 className="text-sm font-bold mb-1">โทรแล้ว</h3>
                <p className="text-3xl font-bold">{filmStats.outgoing}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
                <h3 className="text-sm font-bold mb-1">ไม่รับสาย</h3>
                <p className="text-3xl font-bold">{filmStats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                <h3 className="text-sm font-bold mb-1">ติดสาย</h3>
                <p className="text-3xl font-bold">{filmStats.incoming}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                <h3 className="text-sm font-bold mb-1">รับสาย</h3>
                <p className="text-3xl font-bold">{filmStats.completed}</p>
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-500 text-white border-b-2 border-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    ชื่อลูกค้า
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    ผลิตภัณฑ์
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    หมายเหตุ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    ผู้ติดต่อ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase">
                    วันที่ติดต่อ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredFilmContacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">ไม่พบข้อมูล</p>
                    </td>
                  </tr>
                ) : (
                  filteredFilmContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleFilmRowClick(contact)}
                      className="hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {contact.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Phone className="w-4 h-4 text-purple-600" />
                          {contact.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">
                          {contact.product || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="text-gray-700">
                          {contact.remarks || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contact.agentId ? (
                          <span className="font-semibold text-blue-600">
                            Agent {contact.agentId}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            contact.status === "incoming"
                              ? "bg-green-500 text-white"
                              : contact.status === "outgoing"
                              ? "bg-blue-500 text-white"
                              : contact.status === "pending"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {contact.status === "incoming"
                            ? "รับสาย"
                            : contact.status === "outgoing"
                            ? "โทรออก"
                            : contact.status === "pending"
                            ? "รอดำเนินการ"
                            : "เสร็จสิ้น"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(contact.contactDate)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredFilmContacts.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
              <div className="text-sm text-gray-600">
                แสดง{" "}
                <span className="font-bold text-gray-900">
                  {filteredFilmContacts.length}
                </span>{" "}
                รายการ
              </div>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <PhoneCall className="w-7 h-7" />
              ตารางสรุป call_AI จาก Google Sheets
            </h2>
          </div>
          {/* Loading State */}
          {googleSheetsLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-600">
                กำลังโหลดข้อมูล...
              </span>
            </div>
          )}
          {/* Table */}
          {!googleSheetsLoading && googleSheetsData.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        ลำดับ
                      </th>
                      {googleSheetsHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence mode="popLayout">
                      {googleSheetsData
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )
                        .map((row, rowIndex) => {
                          const actualRowIndex =
                            (currentPage - 1) * itemsPerPage + rowIndex;
                          return (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: rowIndex * 0.02 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {actualRowIndex + 1}
                              </td>
                              {googleSheetsHeaders.map((header, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                >
                                  {row[header] || "-"}
                                </td>
                              ))}
                            </motion.tr>
                          );
                        })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {(() => {
                const filteredData = googleSheetsData;
                return (
                  filteredData.length > itemsPerPage && (
                    <div className="bg-white px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        {/* Page Info */}
                        <div className="text-sm text-gray-600">
                          แสดง{" "}
                          <span className="font-semibold text-gray-900">
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{" "}
                          ถึง{" "}
                          <span className="font-semibold text-gray-900">
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredData.length
                            )}
                          </span>{" "}
                          จากทั้งหมด{" "}
                          <span className="font-semibold text-gray-900">
                            {filteredData.length}
                          </span>{" "}
                          รายการ
                        </div>
                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Previous Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            ก่อนหน้า
                          </motion.button>
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {(() => {
                              const totalPages = Math.ceil(
                                filteredData.length / itemsPerPage
                              );
                              const pageButtons = [];
                              const maxVisiblePages = 5;
                              let startPage = Math.max(
                                1,
                                currentPage - Math.floor(maxVisiblePages / 2)
                              );
                              const endPage = Math.min(
                                totalPages,
                                startPage + maxVisiblePages - 1
                              );
                              // Adjust startPage if we're near the end
                              if (endPage - startPage < maxVisiblePages - 1) {
                                startPage = Math.max(
                                  1,
                                  endPage - maxVisiblePages + 1
                                );
                              }
                              // First page
                              if (startPage > 1) {
                                pageButtons.push(
                                  <motion.button
                                    key={1}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setCurrentPage(1)}
                                    className="w-10 h-10 rounded-lg font-semibold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  >
                                    1
                                  </motion.button>
                                );
                                if (startPage > 2) {
                                  pageButtons.push(
                                    <span
                                      key="dots-start"
                                      className="px-2 text-gray-400"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                              }
                              // Page numbers
                              for (let i = startPage; i <= endPage; i++) {
                                pageButtons.push(
                                  <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                                      currentPage === i
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    {i}
                                  </motion.button>
                                );
                              }
                              // Last page
                              if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                  pageButtons.push(
                                    <span
                                      key="dots-end"
                                      className="px-2 text-gray-400"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                pageButtons.push(
                                  <motion.button
                                    key={totalPages}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="w-10 h-10 rounded-lg font-semibold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  >
                                    {totalPages}
                                  </motion.button>
                                );
                              }
                              return pageButtons;
                            })()}
                          </div>
                          {/* Next Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(
                                  prev + 1,
                                  Math.ceil(filteredData.length / itemsPerPage)
                                )
                              )
                            }
                            disabled={
                              currentPage ===
                              Math.ceil(filteredData.length / itemsPerPage)
                            }
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                              currentPage ===
                              Math.ceil(filteredData.length / itemsPerPage)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            ถัดไป
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )
                );
              })()}
            </>
          )}
          {/* Empty State */}
          {!googleSheetsLoading &&
            (() => {
              const filteredData = googleSheetsData;
              return (
                filteredData.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">ไม่พบข้อมูล</p>
                    <p className="text-sm mt-2">
                      ไม่มีข้อมูลในชีท &quot;สรุป call_AI&quot;
                    </p>
                  </div>
                )
              );
            })()}
          {/* Table Footer with Summary */}
          {!googleSheetsLoading &&
            (() => {
              const filteredData = googleSheetsData;
              return (
                filteredData.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-6 text-gray-600">
                        <span>
                          แสดง{" "}
                          <span className="font-bold text-gray-900">
                            {filteredData.length}
                          </span>{" "}
                          รายการ
                        </span>
                        <span>•</span>
                        <span>
                          จำนวนคอลัมน์{" "}
                          <span className="font-bold text-gray-900">
                            {googleSheetsHeaders.length}
                          </span>{" "}
                          คอลัมน์
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          อัพเดทล่าสุด:{" "}
                          {new Date().toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              );
            })()}
        </motion.div>
      </div>
      {/* Film Contact Detail Modal */}
      <AnimatePresence>
        {isFilmModalOpen && selectedFilmContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseFilmModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  ข้อมูลผู้ติดต่อ
                </h2>
                <button
                  onClick={handleCloseFilmModal}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-xl"
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
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      ชื่อลูกค้า
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedFilmContact.customerName}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      เบอร์โทรศัพท์
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedFilmContact.phoneNumber}
                    </p>
                  </div>
                  {selectedFilmContact.product && (
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        ผลิตภัณฑ์ที่สนใจ
                      </label>
                      <p className="text-lg text-gray-900">
                        {selectedFilmContact.product}
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      วันที่ติดต่อ
                    </label>
                    <p className="text-lg text-gray-900">
                      {formatDate(selectedFilmContact.contactDate)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      ติดตามครั้งถัดไป
                    </label>
                    <input
                      type="datetime-local"
                      value={editedNextContactDate}
                      onChange={(e) => setEditedNextContactDate(e.target.value)}
                      className="w-full bg-white rounded-xl px-4 py-3 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-900"
                    />
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      หมายเหตุ
                    </label>
                    <textarea
                      value={editedRemarks}
                      onChange={(e) => setEditedRemarks(e.target.value)}
                      placeholder="กรอกหมายเหตุ..."
                      rows={6}
                      className="w-full bg-white rounded-xl p-4 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-900 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveFilmContact}
                    disabled={isSavingRemarks}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    {isSavingRemarks ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        บันทึกข้อมูล
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-6 right-6 z-[100] max-w-md"
          >
            <div
              className={`${
                toastType === "success"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-rose-500"
              } text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4`}
            >
              <div className="flex-1">
                <p className="font-bold text-lg">{toastMessage}</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Call Input Modal */}
      <AnimatePresence>
        {callInputModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={() =>
              setCallInputModal({ isOpen: false, agentId: "", hourSlot: "" })
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                บันทึกการโทร
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    เซลล์ ID:{" "}
                    <span className="text-blue-600">
                      {callInputModal.agentId}
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ช่วงเวลา:{" "}
                    <span className="text-blue-600">
                      {callInputModal.hourSlot}:00 น.
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    จำนวนโทรออก
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={callInputValues.outgoing}
                    onChange={(e) =>
                      setCallInputValues({
                        ...callInputValues,
                        outgoing: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    จำนวนที่นับ (สำเร็จ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={callInputValues.successful}
                    onChange={(e) =>
                      setCallInputValues({
                        ...callInputValues,
                        successful: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setCallInputModal({
                      isOpen: false,
                      agentId: "",
                      hourSlot: "",
                    })
                  }
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveCallInput}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Contact Form Modal */}
      <CustomerContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={
          editingContact
            ? {
                name: editingContact.name,
                company: editingContact.company,
                phone: editingContact.phone,
                email: editingContact.email,
                status: editingContact.status,
                notes: editingContact.notes,
              }
            : undefined
        }
        mode={formMode}
      />
    </div>
  );
};
export default CustomerContactDashboard;
