"use client";

import React, { useState, useEffect } from "react";
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
    { id: "102", label: "102-พัชชา" },
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
      const slotData = callMatrixYaleCounts[hourSlot];
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

  const totalYaleCalls = Object.values(callMatrixYaleTotals).reduce(
    (sum, value) => sum + value,
    0
  );

  // Auto-fetch on component mount and every 5 seconds
  useEffect(() => {
    fetchContacts();
    fetchGoogleSheetsData();
    fetchRobocallData();
    fetchLogCallAiData(); // เพิ่มการดึงข้อมูล Log_call_ai
    fetchCallMatrixYaleSummary();
    fetchFilmData(); // เพิ่มการดึงข้อมูล Film data

    // Auto refresh every 30 seconds (ลด API calls เพื่อไม่เกิน quota limit)
    const interval = setInterval(() => {
      fetchYalecomQueueStatus(undefined, "900");
      fetchRobocallData();
      fetchLogCallAiData(); // รีเฟรชข้อมูล Log_call_ai ทุก 30 วินาที
      fetchCallMatrixYaleSummary();
      fetchFilmData(); // รีเฟรชข้อมูล Film data ทุก 30 วินาที
    }, 30000); // เปลี่ยนจาก 5000 (5 วินาที) เป็น 30000 (30 วินาที)

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // เพิ่ม selectedDate เป็น dependency

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
        "102": "พัชชา",
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

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);

      // Fetch from Supabase API
      const response = await fetch("/api/customer-contacts");
      const result = await response.json();

      if (result.success) {
        setContacts(result.data);
      }

      // Also fetch from Yalecom API (ใช้ queue_extension 900)
      await fetchYalecomQueueStatus(undefined, "900");
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

  // Fetch Yale call summary from Google Sheets
  const fetchCallMatrixYaleSummary = async () => {
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
        console.log("✅ Yale call summary loaded:", result);
      } else {
        console.error("❌ Failed to fetch Yale summary:", result.error);
      }
    } catch (error) {
      console.error("Error fetching Yale summary:", error);
    }
  };

  // Fetch Film Data - จำนวนนับ (O) และจำนวนผ่า (P)
  const fetchFilmData = async () => {
    try {
      const response = await fetch(
        `/api/google-sheets-film-data?date=${selectedDate}`
      );
      const result = await response.json();

      if (result.success) {
        setFilmDataCounts(result.agentCounts || {});
        setFilmDataSurgeryCounts(result.surgeryCounts || {});
        console.log("✅ Film data loaded:", result);
        console.log("  - Consult counts:", result.agentCounts);
        console.log("  - Surgery counts:", result.surgeryCounts);
      } else {
        console.error("❌ Failed to fetch Film data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching Film data:", error);
    }
  };

  // Save call input to database
  const handleSaveCallInput = async () => {
    if (!callInputValues.outgoing && !callInputValues.successful) {
      alert("กรุณากรอกจำนวนอย่างน้อย 1 ค่า");
      return;
    }

    try {
      // Extract hour range from hourSlot (e.g., "11-12" -> start at 11:00)
      const [hourStart] = callInputModal.hourSlot.split("-");
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hourStart), 0, 0, 0);

      // Save as individual call logs (we'll create multiple records based on count)
      const outgoingCount = parseInt(callInputValues.outgoing) || 0;
      const successfulCount = parseInt(callInputValues.successful) || 0;

      // บันทึกข้อมูลเข้า Google Sheets (ยังไม่ได้ implement)
      // TODO: สร้าง API สำหรับบันทึกข้อมูลลง Google Sheets

      alert("บันทึกข้อมูลสำเร็จ");
      setCallInputModal({ isOpen: false, agentId: "", hourSlot: "" });
      setCallInputValues({ outgoing: "", successful: "" });
      await fetchCallMatrixYaleSummary(); // Refresh table
    } catch (error) {
      console.error("Error saving call input:", error);
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchContacts();
    await fetchGoogleSheetsData();
    await fetchCallMatrixYaleSummary();
    await fetchFilmData();
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรายการใหม่
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
                    const value = callMatrixYaleTotals[agent.id] ?? 0;
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
