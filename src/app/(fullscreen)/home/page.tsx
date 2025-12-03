"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaChartLine,
  FaBoxes,
  FaCalendarCheck,
  FaPhone,
  FaAd,
  FaRobot,
  FaImage,
  FaEnvelope,
  FaSignOutAlt,
  FaUserPlus,
  FaCalendarPlus,
  FaFileAlt,
  FaUpload,
  FaBell,
  FaClock,
} from "react-icons/fa";

interface UserData {
  name: string;
  email: string;
  role?: string;
  phone?: string;
  username?: string;
  department_name?: string;
  position_name?: string;
  role_name?: string;
}

interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  key: string;
  label: string;
  labelTh: string;
  link: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  type: string;
}

interface Notification {
  id: number;
  message: string;
  type: "info" | "warning" | "success";
}

export default function FullscreenHomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  const quickStats: QuickStat[] = [
    { title: "Inbox", value: "12", icon: <FaEnvelope />, color: "from-pink-500 to-rose-600" },
    { title: "Leads", value: "24", icon: <FaUserPlus />, color: "from-blue-500 to-cyan-600" },
    { title: "Booking", value: "8", icon: <FaCalendarCheck />, color: "from-purple-500 to-indigo-600" },
    { title: "Revenue", value: "฿54K", icon: <FaChartLine />, color: "from-emerald-500 to-teal-600" },
  ];

  const quickActions: QuickAction[] = [
    // Marketing
    { key: "branding_dashboard", label: "Branding Dashboard", labelTh: "ภาพรวมการตลาดและแบรนด์", link: "/branding-dashboard", icon: <FaChartLine />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    { key: "ad_performance", label: "Ad Performance", labelTh: "ติดตามประสิทธิภาพโฆษณา", link: "/facebook-ads-manager", icon: <FaAd />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    { key: "inbox_performance", label: "Inbox Performance", labelTh: "วิเคราะห์การตอบกลับข้อความ", link: "/inbox-performance", icon: <FaEnvelope />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    { key: "content_calendar", label: "Content Calendar", labelTh: "ปฏิทินคอนเทนต์และโพสต์", link: "/content-calendar", icon: <FaCalendarCheck />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    { key: "production_calendar", label: "Production Calendar", labelTh: "ตารางการผลิตสื่อและคลิป", link: "/star-case-calendar", icon: <FaCalendarPlus />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    { key: "asset_library", label: "Asset Library", labelTh: "คลังไฟล์รูปภาพและวิดีโอ", link: "/all-files-gallery", icon: <FaImage />, color: "from-pink-500 to-rose-600", category: "Marketing" },
    // Sales & CRM
    { key: "sales_performance", label: "Sales Performance", labelTh: "ติดตามยอดขายและเป้าหมาย", link: "/performance-surgery-schedule", icon: <FaChartLine />, color: "from-purple-500 to-indigo-600", category: "Sales & CRM" },
    { key: "booking_dashboard", label: "Booking Dashboard", labelTh: "ภาพรวมการจองและนัดหมาย", link: "/booking-dashboard", icon: <FaCalendarCheck />, color: "from-purple-500 to-indigo-600", category: "Sales & CRM" },
    { key: "crm_customers", label: "CRM Customers", labelTh: "ข้อมูลลูกค้าและติดตาม", link: "/customer-selection", icon: <FaUsers />, color: "from-purple-500 to-indigo-600", category: "Sales & CRM" },
    // Operations
    { key: "employee_calendar", label: "Employee Calendar", labelTh: "ตารางงานพนักงาน", link: "/employee-calendar", icon: <FaCalendarCheck />, color: "from-emerald-500 to-teal-600", category: "Operations" },
    { key: "stock_management", label: "Stock Management", labelTh: "จัดการสต็อกสินค้า", link: "/stock-management", icon: <FaBoxes />, color: "from-emerald-500 to-teal-600", category: "Operations" },
    // Automation
    { key: "ai_chatbot", label: "AI Chatbot", labelTh: "ตั้งค่าแชทบอทอัตโนมัติ", link: "/ai-chatbot-setup", icon: <FaRobot />, color: "from-orange-500 to-red-600", category: "Automation" },
    { key: "robo_call", label: "Robo Call System", labelTh: "ระบบโทรอัตโนมัติ", link: "/customer-contact-dashboard", icon: <FaPhone />, color: "from-orange-500 to-red-600", category: "Automation" },
  ];

  const schedule: ScheduleItem[] = [
    { time: "09:00", title: "Rhinoplasty - Dr. A", type: "surgery" },
    { time: "11:00", title: "Star Case Shoot", type: "production" },
    { time: "14:30", title: "Consult - Lead 231", type: "consult" },
  ];

  const notifications: Notification[] = [
    { id: 1, message: "Lead 342 assigned to you", type: "info" },
    { id: 2, message: "Low stock: Filler 1 (2 left)", type: "warning" },
    { id: 3, message: "New comment on Star Case 12", type: "success" },
  ];

  const handleActionClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-4 md:py-6 max-w-4xl mx-auto">
        {/* User Info Header - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-3 flex items-center justify-between">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {userData?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h2 className="text-sm md:text-base font-bold text-white">
                  {userData?.name || "Admin"} 👋
                </h2>
                <p className="text-pink-200 text-xs">
                  {userData?.role_name || "Super Admin"}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-2 rounded-xl shadow-lg"
            >
              <FaSignOutAlt className="text-sm" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {quickStats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/10 text-center"
              >
                <div className={`inline-flex p-1.5 md:p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white mb-1 md:mb-2`}>
                  {stat.icon}
                </div>
                <p className="text-pink-200 text-[10px] md:text-sm">{stat.title}</p>
                <p className="text-white text-sm md:text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions by Category */}
        {["Marketing", "Sales & CRM", "Operations", "Automation"].map((category, categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
            className="mb-4"
          >
            <h3 className="text-white font-bold text-lg mb-3">{category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {quickActions
                .filter((action) => action.category === category)
                .map((action) => (
                  <motion.button
                    key={action.key}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleActionClick(action.link)}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all min-h-[100px] md:min-h-[120px]"
                  >
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-r ${action.color} text-white text-base md:text-lg mb-2`}>
                      {action.icon}
                    </div>
                    <p className="text-white font-medium text-xs md:text-sm">{action.label}</p>
                    <p className="text-pink-200 text-[10px] md:text-xs leading-tight mt-0.5">{action.labelTh}</p>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        ))}

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <FaClock className="text-pink-400" /> Today&apos;s Schedule
          </h3>
          <div className="space-y-2">
            {schedule.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01, x: 4 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 flex items-center gap-3"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {item.time}
                </div>
                <p className="text-white flex-1">{item.title}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.type === "surgery" ? "bg-red-500/20 text-red-300" :
                  item.type === "production" ? "bg-blue-500/20 text-blue-300" :
                  "bg-green-500/20 text-green-300"
                }`}>
                  {item.type}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <FaBell className="text-yellow-400" /> Notifications
          </h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-2 text-sm ${
                  notif.type === "warning" ? "text-yellow-300" :
                  notif.type === "success" ? "text-green-300" :
                  "text-pink-200"
                }`}
              >
                <span>•</span>
                <span>{notif.message}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center pb-6 text-white"
        >
          <p className="text-sm opacity-50">
            © 2025 ระบบบริหารจัดการคลินิก - All Rights Reserved
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
