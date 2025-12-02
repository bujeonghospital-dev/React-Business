"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaChartLine,
  FaBullhorn,
  FaFileAlt,
  FaCalculator,
  FaUserMd,
  FaFileSignature,
  FaHistory,
  FaBoxes,
  FaCalendarCheck,
  FaCheckCircle,
  FaPhone,
  FaAd,
  FaChartBar,
  FaRobot,
  FaClipboardList,
  FaComments,
  FaFlask,
  FaImage,
  FaShieldAlt,
  FaBuilding,
  FaHandshake,
  FaCoins,
  FaUserCircle,
  FaEnvelope,
  FaBriefcase,
  FaPhoneAlt,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  subItems: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  icon: React.ReactNode;
  status?: string;
  link?: string;
}

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

export default function FullscreenHomePage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก localStorage
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
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // ลบ cookie
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    // Redirect ไปหน้า login
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    // {
    //   id: "home-system",
    //   title: "ระบบหน้าบ้าน",
    //   icon: <FaHome className="text-4xl" />,
    //   color: "from-blue-500 to-blue-700",
    //   gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
    //   subItems: [
    //     { title: "เปิด OPD", icon: <FaUserMd />, link: "/opd", status: "⚙️" },
    //     {
    //       title: "ทำ Consent Form",
    //       icon: <FaFileSignature />,
    //       status: "⚙️",
    //       link: "/consent-form",
    //     },
    //     {
    //       title: "ดูประวัติบริการทั้งหมด",
    //       icon: <FaHistory />,
    //       status: "⚙️",
    //       link: "/service-history",
    //     },
    //     {
    //       title: "ระบบ Stock คีย์ / ตัดได้",
    //       icon: <FaBoxes />,
    //       status: "⚙️",
    //       link: "/stock-management",
    //     },

    //   ],
    // },
    {
      id: "customer-relations",
      title: "ลูกค้าสัมพันธ์",
      icon: <FaUsers className="text-4xl" />,
      color: "from-pink-500 to-rose-700",
      gradient: "bg-gradient-to-br from-pink-50 to-rose-100",
      subItems: [
        {
          title: "All สนใจ",
          icon: <FaCheckCircle />,
          status: "",
          link: "/customer-selection",
        },
        {
          title: "สรุปนัดลูกผ่าตัด (CRM)",
          icon: <FaCalendarCheck />,
          status: "",
          link: "/crm-advanced",
        },
      ],
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <FaChartLine className="text-4xl" />,
      color: "from-purple-500 to-indigo-700",
      gradient: "bg-gradient-to-br from-purple-50 to-indigo-100",
      subItems: [
        {
          title: "Ad Performance",
          icon: <FaAd />,
          status: "",
          link: "/facebook-ads-manager",
        },
        {
          title: "Sale Performance",
          icon: <FaChartBar />,
          status: "",
          link: "/performance-surgery-schedule",
        },
        {
          title: "Robo Call - Log",
          icon: <FaRobot />,
          status: "",
          link: "/customer-contact-dashboard",
        },

      ],
    },
    {
      id: "marketing",
      title: "Marketing",
      icon: <FaBullhorn className="text-4xl" />,
      color: "from-orange-500 to-red-700",
      gradient: "bg-gradient-to-br from-orange-50 to-red-100",
      subItems: [
        {
          title: "รวม File ทั้งหมด (Clip รูป)",
          icon: <FaImage />,
          status: "",
          link: "/all-files-gallery",
        },
        {
          title: "ตั้ง AI Chatbot",
          icon: <FaRobot />,
          status: "⚙️",
          link: "/ai-chatbot-setup",
        },
      ],
    },


  ];

  const handleMenuClick = (menuId: string) => {
    setSelectedMenu(selectedMenu === menuId ? null : menuId);
  };

  const handleSubItemClick = (link?: string) => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* User Info Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    ยินดีต้อนรับ, คุณ {userData?.name || "ผู้ใช้งาน"}
                    <motion.span
                      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-3xl"
                    >
                      👋
                    </motion.span>
                  </h2>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {userData?.department_name && (
                      <div className="flex items-center gap-1 text-pink-200 text-sm bg-white/10 px-2 py-1 rounded-lg">
                        <span>📍</span>
                        <span>{userData.department_name}</span>
                      </div>
                    )}
                    {userData?.position_name && (
                      <div className="flex items-center gap-1 text-pink-200 text-sm bg-white/10 px-2 py-1 rounded-lg">
                        <span>💼</span>
                        <span>{userData.position_name}</span>
                      </div>
                    )}
                    {userData?.role_name && (
                      <div className="flex items-center gap-1 text-pink-200 text-sm bg-white/10 px-2 py-1 rounded-lg">
                        <span>👤</span>
                        <span>{userData.role_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details & Actions */}
              <div className="flex items-center gap-6">
                {/* User Info Cards */}
                <div className="hidden md:flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <FaEnvelope className="text-pink-300" />
                      <div>
                        <p className="text-xs text-pink-200">อีเมล</p>
                        <p className="text-sm font-medium">
                          {userData?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {userData?.phone && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <FaPhoneAlt className="text-green-300" />
                        <div>
                          <p className="text-xs text-pink-200">เบอร์โทร</p>
                          <p className="text-sm font-medium">
                            {userData.phone}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </motion.button>
              </div>
            </div>

            {/* Mobile User Details */}
            <div className="md:hidden mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-white">
                    <FaEnvelope className="text-pink-300 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-pink-200">อีเมล</p>
                      <p className="text-sm font-medium truncate">
                        {userData?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {userData?.phone && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-white">
                      <FaPhoneAlt className="text-green-300 text-sm" />
                      <div>
                        <p className="text-xs text-pink-200">เบอร์โทร</p>
                        <p className="text-sm font-medium">{userData.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-2xl">
            ระบบบริหารจัดการคลินิก
          </h1>
          <p className="text-lg text-pink-200 drop-shadow-lg">
            เลือกเมนูด้านล่างเพื่อเริ่มต้นใช้งาน
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {menuItems.map((menu, index) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer transform transition-all duration-300 ${selectedMenu === menu.id ? "ring-4 ring-white" : ""
                  }`}
                onClick={() => handleMenuClick(menu.id)}
              >
                {/* Menu Header */}
                <div
                  className={`bg-gradient-to-r ${menu.color} p-6 text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {menu.icon}
                      <h2 className="text-2xl font-bold">{menu.title}</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: selectedMenu === menu.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl"
                    >
                      ▼
                    </motion.div>
                  </div>
                </div>

                {/* Sub Items */}
                <motion.div
                  initial={false}
                  animate={{
                    height: selectedMenu === menu.id ? "auto" : 0,
                    opacity: selectedMenu === menu.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={`${menu.gradient} p-4 space-y-2`}>
                    {menu.subItems.map((subItem, subIndex) => (
                      <motion.div
                        key={subIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: subIndex * 0.05 }}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-white hover:to-gray-50 border-2 border-transparent hover:border-gray-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubItemClick(subItem.link);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 group-hover:scale-105 transition-transform">
                            <motion.div
                              whileHover={{
                                rotate: [0, -10, 10, -10, 0],
                                scale: 1.2,
                              }}
                              transition={{ duration: 0.5 }}
                              className={`text-2xl bg-gradient-to-r ${menu.color} bg-clip-text text-transparent`}
                            >
                              {subItem.icon}
                            </motion.div>
                            <span className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                              {subItem.title}
                            </span>
                          </div>
                          {subItem.status && (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="text-xl inline-block"
                            >
                              {subItem.status}
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Collapsed View - Show count */}
                {selectedMenu !== menu.id && (
                  <div className={`${menu.gradient} p-4 text-center`}>
                    <p className="text-gray-600 font-medium">
                      {menu.subItems.length} รายการ
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-12 text-white"
        >
          <p className="text-sm opacity-75">
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
