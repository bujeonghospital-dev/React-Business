"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  User,
  Building2,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  CheckCircle2,
} from "lucide-react";

// Types
interface ContactRecord {
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

interface YaleComAgent {
  agent_id: string;
  agent_name: string;
  agent_queue_status: "Inbound" | "Outbound" | "Waiting";
  agent_outbound_callee_number: string;
  agent_queue_caller_number: string;
}

interface YaleComQueueStatus {
  queue_name: string;
  queue_extension: string;
  waiting_calls_in_queue: number;
  agents: YaleComAgent[];
}

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

const ContactDashboard = () => {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState({
    customerName: "",
    phoneNumber: "",
    product: "",
    remarks: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState("");
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const [editedNextContactDate, setEditedNextContactDate] = useState("");
  const [isSavingNextContact, setIsSavingNextContact] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Statistics - Ensure contacts is always an array
  const contactsArray = Array.isArray(contacts) ? contacts : [];
  const stats = {
    total: contactsArray.length,
    incoming: contactsArray.filter((c) => c.status === "incoming").length,
    outgoing: contactsArray.filter((c) => c.status === "outgoing").length,
    pending: contactsArray.filter((c) => c.status === "pending").length,
    completed: contactsArray.filter((c) => c.status === "completed").length,
  };

  // Fetch YaleCom queue status and map agents
  const fetchYaleComAgents = async (): Promise<Map<string, string>> => {
    try {
      console.log("🔄 Fetching YaleCom queue status...");
      const response = await fetch("/api/yalecom-queue");

      console.log("📡 YaleCom API Response Status:", response.status);

      if (response.ok) {
        const rawData = await response.json();
        console.log(
          "✅ YaleCom API Raw Data:",
          JSON.stringify(rawData, null, 2)
        );

        // Handle both array and single object responses
        const data: YaleComQueueStatus[] = Array.isArray(rawData)
          ? rawData
          : [rawData];
        console.log("✅ YaleCom API Data (normalized):", data);

        const agentMap = new Map<string, string>(); // phoneNumber -> agentId

        // Map agents with Inbound status to their caller numbers
        data.forEach((queue) => {
          console.log(
            `📋 Queue: ${queue.queue_name}, Agents:`,
            queue.agents.length
          );
          queue.agents.forEach((agent) => {
            console.log(`👤 Agent ${agent.agent_id}:`, {
              status: agent.agent_queue_status,
              caller: agent.agent_queue_caller_number,
              callee: agent.agent_outbound_callee_number,
            });

            if (
              agent.agent_queue_status === "Inbound" &&
              agent.agent_queue_caller_number
            ) {
              // Clean phone number (remove dashes, spaces, and leading zeros for matching)
              const cleanNumber = agent.agent_queue_caller_number.replace(
                /[-\s()]/g,
                ""
              );

              // Store multiple formats for better matching
              agentMap.set(cleanNumber, agent.agent_id);

              // Also store with dashes (089-123-4567 format)
              if (cleanNumber.length === 10) {
                const dashedFormat = `${cleanNumber.slice(
                  0,
                  3
                )}-${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
                agentMap.set(dashedFormat, agent.agent_id);
              }

              console.log(
                `✅ Mapped: ${cleanNumber} -> Agent ${agent.agent_id}`
              );
            }
          });
        });

        console.log("🗺️ Final Agent Map:", Array.from(agentMap.entries()));
        return agentMap;
      }
    } catch (error) {
      console.error("❌ Error fetching YaleCom agents:", error);
    }
    return new Map();
  };

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);

      // Fetch YaleCom agent data first
      const agentMap = await fetchYaleComAgents();

      // Fetch from Film API (Google Sheets - Film_dev)
      const response = await fetch("/api/film-contacts");

      if (response.ok) {
        const result = await response.json();
        // Check if result has a data property (API response format)
        let contactsData: ContactRecord[] = Array.isArray(result)
          ? result
          : result.data || [];

        // Map agents to contacts
        console.log("📞 Total contacts before mapping:", contactsData.length);
        console.log(
          "🗺️ Available agent mappings:",
          Array.from(agentMap.entries())
        );

        contactsData = contactsData.map((contact) => {
          const cleanContactNumber = contact.phoneNumber.replace(
            /[-\s()]/g,
            ""
          );

          // Try to match with both original format and cleaned format
          const agentId =
            agentMap.get(contact.phoneNumber) ||
            agentMap.get(cleanContactNumber);

          console.log(`🔍 Checking contact ${contact.customerName}:`, {
            original: contact.phoneNumber,
            cleaned: cleanContactNumber,
            agentId: agentId || "not found",
          });

          if (agentId) {
            console.log(
              `✅ MATCHED! Contact ${contact.customerName} (${contact.phoneNumber}) -> Agent ${agentId}`
            );
            // Update contact with agent and change status to incoming
            return {
              ...contact,
              agentId,
              status: "incoming" as const,
            };
          }
          return contact;
        });

        const matchedCount = contactsData.filter((c) => c.agentId).length;
        console.log(
          `✅ Agent mapping complete: ${matchedCount}/${contactsData.length} contacts matched`
        );

        setContacts(contactsData);
        setFilteredContacts(contactsData);
      } else {
        // Mock data for development
        const mockData: ContactRecord[] = [
          {
            id: "1",
            customerName: "คุณสมชาย ใจดี",
            phoneNumber: "089-123-4567",
            remarks: "สนใจผลิตภัณฑ์",
            status: "incoming",
            contactDate: new Date().toISOString(),
            company: "บริษัท ABC จำกัด",
            email: "somchai@abc.com",
          },
          {
            id: "2",
            customerName: "คุณสมหญิง รักษ์ดี",
            phoneNumber: "081-234-5678",
            remarks: "ติดตามผลการสั่งซื้อ",
            status: "outgoing",
            contactDate: new Date().toISOString(),
            company: "บริษัท XYZ จำกัด",
            email: "somying@xyz.com",
          },
          {
            id: "3",
            customerName: "คุณประภาส สว่างไสว",
            phoneNumber: "092-345-6789",
            remarks: "ขอใบเสนอราคา",
            status: "pending",
            contactDate: new Date().toISOString(),
          },
        ];
        setContacts(mockData);
        setFilteredContacts(mockData);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);

      // Use mock data on error
      const mockData: ContactRecord[] = [
        {
          id: "1",
          customerName: "คุณสมชาย ใจดี",
          phoneNumber: "089-123-4567",
          remarks: "สนใจผลิตภัณฑ์",
          status: "incoming",
          contactDate: new Date().toISOString(),
        },
      ];
      setContacts(mockData);
      setFilteredContacts(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter contacts
  useEffect(() => {
    // Ensure contacts is an array before spreading
    const contactsArray = Array.isArray(contacts) ? contacts : [];
    let filtered = [...contactsArray];

    if (searchQuery.customerName) {
      filtered = filtered.filter((c) =>
        c.customerName
          .toLowerCase()
          .includes(searchQuery.customerName.toLowerCase())
      );
    }

    if (searchQuery.phoneNumber) {
      filtered = filtered.filter((c) =>
        c.phoneNumber.includes(searchQuery.phoneNumber)
      );
    }

    if (searchQuery.product) {
      filtered = filtered.filter((c) =>
        (c.product || "")
          .toLowerCase()
          .includes(searchQuery.product.toLowerCase())
      );
    }

    if (searchQuery.remarks) {
      filtered = filtered.filter((c) =>
        (c.remarks || "")
          .toLowerCase()
          .includes(searchQuery.remarks.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  // Initial load
  useEffect(() => {
    fetchContacts();

    // Auto-refresh every 3 seconds (background refresh only - no UI disruption)
    const interval = setInterval(async () => {
      try {
        // Silent refresh without showing loading state
        const agentMap = await fetchYaleComAgents();
        const response = await fetch("/api/film-contacts");
        const result = await response.json();

        let contactsData: ContactRecord[] = Array.isArray(result)
          ? result
          : result.data || [];

        // Map agents to contacts
        contactsData = contactsData.map((contact) => {
          const cleanContactNumber = contact.phoneNumber.replace(
            /[-\s()]/g,
            ""
          );

          // Try to match with both original format and cleaned format
          const agentId =
            agentMap.get(contact.phoneNumber) ||
            agentMap.get(cleanContactNumber);

          if (agentId) {
            return {
              ...contact,
              agentId,
              status: "incoming" as const,
            };
          }
          return contact;
        });

        setContacts(contactsData);
      } catch (error) {
        console.error("Background refresh error:", error);
        // Silently fail - don't disrupt user experience
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchContacts();
  };

  // Handle search input change
  const handleSearchChange = (
    field: keyof typeof searchQuery,
    value: string
  ) => {
    setSearchQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery({
      customerName: "",
      phoneNumber: "",
      product: "",
      remarks: "",
    });
  };

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

  // Handle row click - บันทึก last_followup อัตโนมัติ
  const handleRowClick = async (contact: ContactRecord) => {
    setSelectedContact(contact);
    setEditedRemarks(contact.remarks || "");
    setEditedNextContactDate(contact.nextContactDate || "");
    setIsModalOpen(true);

    // บันทึก last_followup อัตโนมัติเป็นเวลาปัจจุบัน
    if (contact.dbId) {
      try {
        const response = await fetch(
          "/api/film-contacts/update-last-followup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: contact.dbId,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const newContactDate = result.data.last_followup;

          // อัพเดทข้อมูลใน state แบบเงียบๆ
          const updatedContacts = contacts.map((c) =>
            c.dbId === contact.dbId ? { ...c, contactDate: newContactDate } : c
          );
          setContacts(updatedContacts);

          // อัพเดท selectedContact
          setSelectedContact((prev) =>
            prev ? { ...prev, contactDate: newContactDate } : prev
          );

          console.log(
            `✅ Auto-saved last_followup for contact ID ${contact.dbId}`
          );
        }
      } catch (error) {
        console.error("Error auto-saving last followup:", error);
        // ไม่แสดง error ให้ผู้ใช้เห็น เพื่อไม่รบกวนประสบการณ์การใช้งาน
      }
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedContact(null);
      setEditedRemarks("");
      setEditedNextContactDate("");
    }, 300); // Clear after animation
  };

  // Show toast notification
  const showToastNotification = (
    message: string,
    type: "success" | "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Save all data (remarks + next contact date)
  const handleSaveAll = async () => {
    if (!selectedContact || !selectedContact.dbId) {
      showToastNotification("ไม่สามารถบันทึกได้: ไม่พบ ID ของข้อมูล", "error");
      return;
    }

    try {
      setIsSavingRemarks(true);
      setIsSavingNextContact(true);

      // บันทึกทั้งสองพร้อมกัน
      const [remarksResponse, nextContactResponse] = await Promise.all([
        fetch("/api/film-contacts/update-remarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedContact.dbId,
            remarks: editedRemarks,
          }),
        }),
        fetch("/api/film-contacts/update-next-contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedContact.dbId,
            nextContactDate: editedNextContactDate,
          }),
        }),
      ]);

      if (remarksResponse.ok && nextContactResponse.ok) {
        showToastNotification("✅ บันทึกข้อมูลทั้งหมดสำเร็จ!", "success");

        // อัพเดทข้อมูลใน state
        const updatedContacts = contacts.map((c) =>
          c.dbId === selectedContact.dbId
            ? {
                ...c,
                remarks: editedRemarks,
                nextContactDate: editedNextContactDate,
              }
            : c
        );
        setContacts(updatedContacts);

        // อัพเดท selectedContact
        setSelectedContact({
          ...selectedContact,
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
      setIsSavingNextContact(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: ContactRecord["status"]) => {
    const statusConfig = {
      incoming: {
        label: "รับสาย",
        color: "bg-green-500",
        textColor: "text-white",
        icon: PhoneIncoming,
      },
      outgoing: {
        label: "โทรออก",
        color: "bg-blue-500",
        textColor: "text-white",
        icon: PhoneOutgoing,
      },
      pending: {
        label: "รอดำเนินการ",
        color: "bg-yellow-500",
        textColor: "text-white",
        icon: Clock,
      },
      completed: {
        label: "เสร็จสิ้น",
        color: "bg-gray-500",
        textColor: "text-white",
        icon: TrendingUp,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color} ${config.textColor}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Status Cards - Horizontal Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {/* จำนวน Lead Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">จำนวน Lead</h3>
                <div className="text-center">
                  <p className="text-sm mb-1">คงเหลือ</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                  <p className="text-sm mt-1">จำนวน</p>
                </div>
              </div>
            </div>

            {/* โทรแล้ว Card */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">โทรแล้ว</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.outgoing}</p>
                  <p className="text-sm mt-1">จำนวน</p>
                </div>
              </div>
            </div>

            {/* ไม่รับสาย Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">ไม่รับสาย</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.pending}</p>
                  <p className="text-sm mt-1">จำนวน</p>
                </div>
              </div>
            </div>

            {/* ติดสาย Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">ติดสาย</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.incoming}</p>
                  <p className="text-sm mt-1">จำนวน</p>
                </div>
              </div>
            </div>

            {/* รับสาย Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">รับสาย</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.completed}</p>
                  <p className="text-sm mt-1">จำนวน</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Section - Compact version for clean UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-200 hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              ค้นหาและกรองข้อมูล
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: ชื่อลูกค้า */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อลูกค้า
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery.customerName}
                  onChange={(e) =>
                    handleSearchChange("customerName", e.target.value)
                  }
                  placeholder="ค้นหาด้วยชื่อลูกค้า..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Column 2: เบอร์โทร */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เบอร์โทร
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery.phoneNumber}
                  onChange={(e) =>
                    handleSearchChange("phoneNumber", e.target.value)
                  }
                  placeholder="ค้นหาด้วยเบอร์โทร..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Column 3: ผลิตภัณฑ์ที่สนใจ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ผลิตภัณฑ์ที่สนใจ
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery.product}
                  onChange={(e) =>
                    handleSearchChange("product", e.target.value)
                  }
                  placeholder="ค้นหาด้วยผลิตภัณฑ์..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Column 4: หมายเหตุ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery.remarks}
                  onChange={(e) =>
                    handleSearchChange("remarks", e.target.value)
                  }
                  placeholder="ค้นหาด้วยหมายเหตุ..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              พบ{" "}
              <span className="font-bold text-purple-600">
                {filteredContacts.length}
              </span>{" "}
              รายการ
              {contacts.length !== filteredContacts.length && (
                <span className="text-gray-500">
                  {" "}
                  จากทั้งหมด {contacts.length} รายการ
                </span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Contact List - Table View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white text-center">
              รายการติดต่อทั้งหมด
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-500 text-white border-b-2 border-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    ชื่อลูกค้า
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    ผลิตภัณฑ์ที่สนใจ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    หมายเหตุ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    ผู้ติดต่อ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    วันที่ติดต่อ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mr-3" />
                          <span className="text-lg text-gray-600">
                            กำลังโหลดข้อมูล...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                          <p className="text-lg font-semibold">ไม่พบข้อมูล</p>
                          <p className="text-sm mt-2">
                            ไม่มีรายการติดต่อที่ตรงกับเงื่อนไขการค้นหา
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact, index) => (
                      <motion.tr
                        key={contact.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleRowClick(contact)}
                        className="hover:bg-purple-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {contact.customerName}
                              </div>
                              {contact.company && (
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  {contact.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <Phone className="w-4 h-4 text-purple-600" />
                            {contact.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 max-w-xs truncate">
                            {contact.product || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 max-w-xs truncate">
                            {contact.remarks || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.agentId ? (
                            <div className="flex items-center gap-2">
                              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">
                                Agent {contact.agentId}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(contact.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(contact.contactDate)}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredContacts.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  แสดง{" "}
                  <span className="font-bold text-gray-900">
                    {filteredContacts.length}
                  </span>{" "}
                  รายการ
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
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedContact && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 relative overflow-hidden rounded-t-3xl">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                  </div>

                  <div className="relative z-10 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white">
                        ข้อมูลผู้ติดต่อ
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        รายละเอียดข้อมูลทั้งหมด
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-xl transition-colors z-20"
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
                  </motion.button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="space-y-6">
                    {/* ชื่อลูกค้า */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        ชื่อลูกค้า
                      </label>
                      <p className="text-lg text-gray-900">
                        {selectedContact.customerName}
                      </p>
                      {selectedContact.company && (
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedContact.company}
                        </p>
                      )}
                    </motion.div>

                    {/* เบอร์โทร */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        เบอร์โทรศัพท์
                      </label>
                      <p className="text-lg text-gray-900">
                        {selectedContact.phoneNumber}
                      </p>
                    </motion.div>

                    {/* ผลิตภัณฑ์ที่สนใจ */}
                    {selectedContact.product && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-50 rounded-2xl p-6"
                      >
                        <label className="block text-base font-bold text-gray-800 mb-3">
                          ผลิตภัณฑ์ที่สนใจ
                        </label>
                        <p className="text-lg text-gray-900">
                          {selectedContact.product}
                        </p>
                      </motion.div>
                    )}

                    {/* ผู้ติดต่อ (Agent) - Hidden in screenshot, keep minimal */}

                    {/* สถานะ */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        สถานะ
                      </label>
                      <div>{getStatusBadge(selectedContact.status)}</div>
                    </motion.div>

                    {/* วันที่ติดต่อ */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        วันที่ติดต่อ
                      </label>
                      <p className="text-lg text-gray-900">
                        {formatDate(selectedContact.contactDate)}
                      </p>
                    </motion.div>

                    {/* ติดตามครั้งถัดไป */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        ติดตามครั้งถัดไป
                      </label>
                      <input
                        type="datetime-local"
                        value={editedNextContactDate}
                        onChange={(e) =>
                          setEditedNextContactDate(e.target.value)
                        }
                        className="w-full bg-white rounded-xl px-4 py-3 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900"
                      />
                    </motion.div>

                    {/* หมายเหตุ */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-slate-50 rounded-2xl p-6"
                    >
                      <label className="block text-base font-bold text-gray-800 mb-3">
                        หมายเหตุ
                      </label>
                      <textarea
                        value={editedRemarks}
                        onChange={(e) => setEditedRemarks(e.target.value)}
                        placeholder="กรอกหมายเหตุ..."
                        rows={6}
                        className="w-full bg-white rounded-xl p-4 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 leading-relaxed resize-none"
                      />
                    </motion.div>

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveAll}
                      disabled={
                        isSavingRemarks ||
                        isSavingNextContact ||
                        (editedRemarks === selectedContact.remarks &&
                          editedNextContactDate ===
                            selectedContact.nextContactDate)
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed"
                    >
                      {isSavingRemarks || isSavingNextContact ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          บันทึกข้อมูลทั้งหมด
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseModal}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                    >
                      ปิด
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
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
              } text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-sm`}
            >
              <div className="flex-shrink-0">
                {toastType === "success" ? (
                  <motion.div
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="bg-white/20 p-2 rounded-full"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="bg-white/20 p-2 rounded-full"
                  >
                    <svg
                      className="w-6 h-6"
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
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{toastMessage}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 hover:bg-white/20 p-1 rounded-lg transition-colors"
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
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactDashboard;
