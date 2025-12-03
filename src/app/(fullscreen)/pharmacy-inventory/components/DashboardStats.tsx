"use client";

import React from "react";
import {
    Package,
    AlertTriangle,
    Clock,
    TrendingDown,
    ClipboardCheck,
    Activity,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { DashboardStats } from "../types";

interface DashboardStatsProps {
    stats: DashboardStats;
    onStatClick?: (statType: string) => void;
}

export default function DashboardStatsComponent({ stats, onStatClick }: DashboardStatsProps) {
    const handleClick = (type: string) => {
        if (onStatClick) onStatClick(type);
    };

    // Key metrics for quick scanning (Thai labels)
    const primaryStats = [
        {
            id: "pending",
            label: "ใบสั่งยารอดำเนินการ",
            value: stats.pendingPrescriptions,
            icon: <ClipboardCheck className="w-5 h-5" />,
            color: "violet",
            priority: stats.pendingPrescriptions > 0,
            description: "รอจ่ายยา",
        },
        {
            id: "critical",
            label: "วิกฤต",
            value: stats.criticalStockItems,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "red",
            alert: stats.criticalStockItems > 0,
            description: "ต้องสั่งซื้อทันที",
        },
        {
            id: "low-stock",
            label: "สต็อกต่ำ",
            value: stats.lowStockItems,
            icon: <TrendingDown className="w-5 h-5" />,
            color: "amber",
            alert: stats.lowStockItems > 0,
            description: "ใกล้หมด",
        },
        {
            id: "expiring",
            label: "ใกล้หมดอายุ",
            value: stats.expiringItems,
            icon: <Clock className="w-5 h-5" />,
            color: "orange",
            alert: stats.expiringItems > 0,
            description: "ภายใน 90 วัน",
        },
    ];

    const secondaryStats = [
        {
            id: "inventory",
            label: "รายการทั้งหมด",
            value: stats.totalMedications,
            icon: <Package className="w-5 h-5" />,
            color: "blue",
        },
        {
            id: "dispensed",
            label: "จ่ายยาวันนี้",
            value: stats.dispensedToday,
            icon: <Activity className="w-5 h-5" />,
            color: "emerald",
        },
    ];

    const getColorClasses = (color: string, isAlert?: boolean, isPriority?: boolean) => {
        const colors: Record<string, { bg: string; icon: string; text: string; ring: string }> = {
            violet: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", text: "text-violet-700", ring: "ring-violet-400" },
            red: { bg: "bg-red-50", icon: "bg-red-100 text-red-600", text: "text-red-700", ring: "ring-red-400" },
            amber: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", text: "text-amber-700", ring: "ring-amber-400" },
            orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", text: "text-orange-700", ring: "ring-orange-400" },
            blue: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", text: "text-blue-700", ring: "ring-blue-400" },
            emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700", ring: "ring-emerald-400" },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-4">
            {/* Header with Value Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">มูลค่าคลังยา</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ฿{stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-gray-600">ใช้งานได้: <strong className="text-gray-900">{stats.totalMedications - stats.expiredItems}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-gray-600">หมดอายุ: <strong className="text-gray-900">{stats.expiredItems}</strong></span>
                    </div>
                </div>
            </div>

            {/* Action Cards - Priority Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {primaryStats.map((stat) => {
                    const colors = getColorClasses(stat.color, stat.alert, stat.priority);
                    const isClickable = onStatClick && stat.value > 0;

                    return (
                        <button
                            key={stat.id}
                            onClick={() => isClickable && handleClick(stat.id)}
                            disabled={!isClickable}
                            className={`relative group p-4 rounded-xl border transition-all duration-200 text-left
                                ${colors.bg} border-transparent
                                ${isClickable ? "hover:shadow-md hover:scale-[1.02] cursor-pointer" : "cursor-default"}
                                ${stat.priority && stat.value > 0 ? `ring-2 ${colors.ring} ring-offset-2` : ""}
                            `}
                        >
                            {/* Alert Indicator */}
                            {stat.alert && stat.value > 0 && (
                                <span className="absolute top-3 right-3 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}

                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${colors.icon}`}>
                                    {stat.icon}
                                </div>
                                {isClickable && (
                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>

                            <p className={`text-3xl font-bold ${stat.value > 0 ? colors.text : "text-gray-400"}`}>
                                {stat.value}
                            </p>
                            <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{stat.description}</p>
                        </button>
                    );
                })}
            </div>

            {/* Secondary Stats - Compact Row */}
            <div className="flex items-center gap-3">
                {secondaryStats.map((stat) => {
                    const colors = getColorClasses(stat.color);
                    return (
                        <button
                            key={stat.id}
                            onClick={() => onStatClick && handleClick(stat.id)}
                            className={`flex-1 flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group`}
                        >
                            <div className={`p-2 rounded-lg ${colors.icon}`}>
                                {stat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
