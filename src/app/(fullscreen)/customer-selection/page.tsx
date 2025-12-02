"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaUsers, FaUserPlus, FaArrowLeft } from "react-icons/fa";

interface CustomerCount {
  existingCount: number;
  newCount: number;
}

export default function CustomerSelectionPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<CustomerCount>({
    existingCount: 0,
    newCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerCounts();
  }, []);

  const fetchCustomerCounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/customer-data");
      const result = await response.json();

      if (result.success && result.data) {
        // Count existing customers (with CN/รหัสลูกค้า) and new customers (without)
        let existingCount = 0;
        let newCount = 0;

        result.data.forEach((row: Record<string, any>) => {
          // Check 'cn' column for existing customers (customers with CN number from OPD)
          const cnValue = row["cn"];
          if (cnValue && cnValue.toString().trim() !== "") {
            existingCount++;
          } else {
            newCount++;
          }
        });

        console.log("Customer counts:", { existingCount, newCount, total: result.data.length });
        setCounts({ existingCount, newCount });
      }
    } catch (error) {
      console.error("Error fetching customer counts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectType = (type: "existing" | "new") => {
    router.push(`/customer-all-data?type=${type}`);
  };

  const handleBack = () => {
    router.push("/home");
  };

  const customerTypes = [
    {
      id: "existing",
      title: "ลูกค้าเก่า",
      description: "ลูกค้าที่มีรหัส CN",
      icon: <FaUsers className="text-5xl" />,
      count: counts.existingCount,
      color: "from-blue-500 to-blue-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
    },
    {
      id: "new",
      title: "ลูกค้าใหม่",
      description: "ลูกค้าที่ยังไม่มีรหัส CN",
      icon: <FaUserPlus className="text-5xl" />,
      count: counts.newCount,
      color: "from-emerald-500 to-emerald-700",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              background: `hsl(${Math.random() * 60 + 280}, 80%, 60%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            ลูกค้าสัมพันธ์
          </motion.h1>

          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main content - positioned higher for mobile */}
      <div className="relative z-10 flex flex-col items-center pt-8 px-4">
        {/* Customer type selection */}
        <div className="w-full max-w-md space-y-4">
          {customerTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectType(type.id as "existing" | "new")}
                className={`w-full bg-gradient-to-r ${type.color} ${type.hoverColor} rounded-2xl p-6 text-white shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {type.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold">{type.title}</h3>
                    <p className="text-white/80 text-sm">{type.description}</p>
                  </div>
                  <div className="text-right">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/30 rounded-lg h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {type.count.toLocaleString()}
                      </div>
                    )}
                    <div className="text-white/80 text-xs">รายการ</div>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 text-center pb-6 text-white"
      >
        <p className="text-sm opacity-75">
          © 2025 ระบบบริหารจัดการคลินิก - All Rights Reserved
        </p>
      </motion.div>
    </div>
  );
}
