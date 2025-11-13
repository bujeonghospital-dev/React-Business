// src/components/GoogleAds/MetricCard.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "purple" | "orange";
  index: number;
}

const colorClasses = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  green: {
    bg: "from-green-500 to-green-600",
    light: "bg-green-50",
    text: "text-green-600",
    iconBg: "bg-green-100",
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    text: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    light: "bg-orange-50",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
  },
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  index,
}: MetricCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-5`}
      />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <motion.p
              className="text-3xl font-bold text-gray-900"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            >
              {value}
            </motion.p>

            {trend && (
              <div className="flex items-center mt-3">
                <span
                  className={`text-sm font-semibold ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  จากเดือนที่แล้ว
                </span>
              </div>
            )}
          </div>

          <div className={`${colors.iconBg} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className={`h-1 bg-gradient-to-r ${colors.bg}`} />
    </motion.div>
  );
}
