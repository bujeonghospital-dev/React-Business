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
}

type StatusType = "outgoing" | "received" | "waiting" | "sale" | "all";

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

  // Calculate statistics
  const allContacts = agentContacts.length > 0 ? agentContacts : contacts;
  const stats = {
    outgoing: allContacts.filter((c) => c.status === "outgoing").length,
    received: allContacts.filter((c) => c.status === "received").length,
    waiting: allContacts.filter((c) => c.status === "waiting").length,
    sale: allContacts.filter((c) => c.status === "sale").length,
    total: allContacts.length,
  };

  // Auto-fetch on component mount and every 5 seconds
  useEffect(() => {
    fetchContacts();

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      fetchYalecomQueueStatus(undefined, "900");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  // Fetch queue status from Yalecom API (via internal API route)
  const fetchYalecomQueueStatus = async (
    queueUuid?: string,
    queueExtension?: string
  ) => {
    try {
      const params = new URLSearchParams();

      if (queueUuid) {
        params.append("queue_uuid", queueUuid);
      } else if (queueExtension) {
        params.append("queue_extension", queueExtension);
      }

      console.log("🔍 Fetching queue status with params:", params.toString());

      const response = await fetch(
        `/api/yalecom/queue-status?${params.toString()}`
      );
      const result = await response.json();

      console.log("📡 API Response:", result);

      if (!result.success) {
        console.error("❌ API Error:", result.error);
        throw new Error(result.error || "Failed to fetch queue status");
      }

      const data: YalecomQueueStatus = result.data;
      console.log("✅ Queue Data:", data);
      console.log("👥 Agents:", data.agents);

      setQueueData(data);

      // แปลงข้อมูล agents เป็น ContactRecord
      const agentContactsData: ContactRecord[] = data.agents.map((agent) => {
        let status: ContactRecord["status"] = "waiting";
        let customerPhone = "-"; // เบอร์ลูกค้าที่ติดต่อ

        console.log(`👤 Processing Agent: ${agent.agent_name}`, {
          queue_status: agent.agent_queue_status,
          outbound_number: agent.agent_outbound_callee_number,
          caller_number: agent.agent_queue_caller_number,
        });

        // กำหนดสถานะตามการใช้งานจริงของ Agent
        // ตรวจสอบสถานะจาก agent_queue_status ก่อน
        if (
          agent.agent_queue_status === "InCall" ||
          agent.agent_queue_status === "Busy" ||
          agent.agent_queue_status === "Outbound"
        ) {
          // Agent กำลังคุยสาย หรือกำลังโทรออก (SALE ติดต่อ)
          status = "sale";
          // เบอร์จากการโทรออกหรือรับสาย
          customerPhone =
            agent.agent_outbound_callee_number ||
            agent.agent_queue_caller_number ||
            "-";
          console.log(`  ✅ Status: SALE ติดต่อ (${customerPhone})`);
        } else if (agent.agent_queue_caller_number) {
          // Agent รับสายเข้าแต่ยังไม่ได้คุย
          status = "received";
          customerPhone = agent.agent_queue_caller_number;
          console.log(`  📲 Status: รับสาย (${customerPhone})`);
        } else if (agent.agent_queue_status === "Waiting") {
          // Agent ว่าง รอรับสาย
          status = "waiting";
          customerPhone = "-";
          console.log(`  ⏳ Status: รอสาย`);
        } else if (agent.agent_queue_status === "Offline") {
          // Agent ออฟไลน์
          status = "waiting";
          customerPhone = "-";
          console.log(`  💤 Status: Offline (รอสาย)`);
        }

        return {
          id: agent.agent_id,
          name: agent.agent_name, // เบอร์ extension ของบริษัท (101, 102, etc.)
          company: data.queue_name,
          phone: customerPhone, // เบอร์ลูกค้าที่กำลังติดต่ออยู่
          email: "",
          status: status,
          lastContact: new Date().toISOString(),
          notes: `สถานะ: ${agent.agent_queue_status}`,
          createdAt: new Date().toISOString(),
        };
      });

      console.log("📊 Final Agent Contacts:", agentContactsData);
      setAgentContacts(agentContactsData);
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

      // Fetch from Yalecom API (ใช้ queue_extension 900)
      await fetchYalecomQueueStatus(undefined, "900");

      // หรือ fetch จาก internal API
      // const response = await fetch("/api/customer-contacts");
      // const result = await response.json();
      // if (result.success) {
      //   setContacts(result.data);
      // }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchContacts();
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

  // Debug: Log all contacts before rendering
  console.log("🎨 Rendering Dashboard with contacts:", {
    allContacts: allContacts.length,
    agentContacts: agentContacts.length,
    filteredContacts: filteredContacts.length,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Container className="py-8">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ, บริษัท, เบอร์โทร, อีเมล..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatus("all")}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ทั้งหมด ({stats.total})
              </motion.button>
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              ส่งออก Excel
            </motion.button>
          </div>
        </motion.div>

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
                              {contact.phone}
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
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            รายละเอียด Agents ทั้งหมด
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allContacts.map((contact) => {
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

          {allContacts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">ไม่มีข้อมูล Agent</p>
              <p className="text-sm mt-2">กรุณารอสักครู่...</p>
            </div>
          )}
        </motion.div>
      </Container>

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
