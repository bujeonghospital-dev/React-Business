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
  customerName: string;
  phoneNumber: string;
  remarks: string;
  product?: string; // ผลิตภัณฑ์ที่สนใจ (Column C)
  status: "incoming" | "outgoing" | "pending" | "completed";
  contactDate: string;
  company?: string;
  email?: string;
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

  // Statistics - Ensure contacts is always an array
  const contactsArray = Array.isArray(contacts) ? contacts : [];
  const stats = {
    total: contactsArray.length,
    incoming: contactsArray.filter((c) => c.status === "incoming").length,
    outgoing: contactsArray.filter((c) => c.status === "outgoing").length,
    pending: contactsArray.filter((c) => c.status === "pending").length,
    completed: contactsArray.filter((c) => c.status === "completed").length,
  };

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setIsLoading(true);

      // Fetch from Film API (Google Sheets - Film_dev)
      const response = await fetch("/api/film-contacts");

      if (response.ok) {
        const result = await response.json();
        // Check if result has a data property (API response format)
        const contactsData = Array.isArray(result) ? result : result.data || [];
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

    // Auto-refresh every 30 seconds (background refresh only - no UI disruption)
    const interval = setInterval(() => {
      // Silent refresh without showing loading state
      fetch("/api/film-contacts")
        .then((response) => response.json())
        .then((result) => {
          const contactsData = Array.isArray(result)
            ? result
            : result.data || [];
          setContacts(contactsData);
        })
        .catch((error) => {
          console.error("Background refresh error:", error);
          // Silently fail - don't disrupt user experience
        });
    }, 30000);

    return () => clearInterval(interval);
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

  // Handle row click
  const handleRowClick = (contact: ContactRecord) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedContact(null), 300); // Clear after animation
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
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-4"
              >
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Phone className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                YaleCom ที่สุดคำติดต่อเข้ามา
              </h1>

              <p className="text-white/90 text-lg sm:text-xl font-medium">
                ระบบจัดการข้อมูลการติดต่อลูกค้าแบบ Real-time
              </p>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.total}
                  </div>
                  <div className="text-white/80 text-sm">ทั้งหมด</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.incoming}
                  </div>
                  <div className="text-white/80 text-sm">รับสาย</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.outgoing}
                  </div>
                  <div className="text-white/80 text-sm">โทรออก</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.pending}
                  </div>
                  <div className="text-white/80 text-sm">รอดำเนินการ</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-between items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
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

            {(searchQuery.customerName ||
              searchQuery.phoneNumber ||
              searchQuery.product ||
              searchQuery.remarks) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md"
              >
                <Filter className="w-5 h-5" />
                ล้างตัวกรอง
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              เพิ่มรายการ
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Section - 3 Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200"
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-7 h-7" />
              รายการติดต่อทั้งหมด
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
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
                      <td colSpan={6} className="px-6 py-12 text-center">
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
                      <td colSpan={6} className="px-6 py-12 text-center">
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
                <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-5 left-5 w-20 h-20 bg-white rounded-full blur-2xl"></div>
                    <div className="absolute bottom-5 right-5 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          ข้อมูลผู้ติดต่อ
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                          รายละเอียดทั้งหมด
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseModal}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-xl transition-colors"
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
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="space-y-6">
                    {/* ชื่อลูกค้า */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            ชื่อลูกค้า
                          </label>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {selectedContact.customerName}
                          </p>
                          {selectedContact.company && (
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {selectedContact.company}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* เบอร์โทร */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            เบอร์โทรศัพท์
                          </label>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {selectedContact.phoneNumber}
                          </p>
                          <a
                            href={`tel:${selectedContact.phoneNumber}`}
                            className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                          >
                            <PhoneOutgoing className="w-4 h-4" />
                            โทรออกทันที
                          </a>
                        </div>
                      </div>
                    </motion.div>

                    {/* ผลิตภัณฑ์ที่สนใจ */}
                    {selectedContact.product && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                              ผลิตภัณฑ์ที่สนใจ
                            </label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {selectedContact.product}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* สถานะ */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            สถานะ
                          </label>
                          <div className="mt-2">
                            {getStatusBadge(selectedContact.status)}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* วันที่ติดต่อ */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-xl">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            วันที่ติดต่อ
                          </label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {formatDate(selectedContact.contactDate)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* หมายเหตุ */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-gray-500 to-slate-600 p-3 rounded-xl">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            หมายเหตุ
                          </label>
                          <div className="mt-2 bg-white rounded-xl p-4 border border-gray-200 max-h-60 overflow-y-auto">
                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {selectedContact.remarks || "ไม่มีหมายเหตุ"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
    </div>
  );
};

export default ContactDashboard;
