"use client";

import React, { useState } from "react";
import {
    AlertTriangle,
    Bell,
    Package,
    Clock,
    Check,
    ChevronRight,
    Eye,
    CheckCheck,
    Filter,
} from "lucide-react";
import { StockAlert } from "../types";

interface AlertsPanelProps {
    alerts: StockAlert[];
    onAcknowledge: (alertId: string) => void;
    onViewMedication: (medicationId: string) => void;
}

export default function AlertsPanel({
    alerts,
    onAcknowledge,
    onViewMedication,
}: AlertsPanelProps) {
    const [showAcknowledged, setShowAcknowledged] = useState(false);

    const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
    const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

    const displayAlerts = showAcknowledged ? alerts : unacknowledgedAlerts;

    const criticalCount = unacknowledgedAlerts.filter((a) => a.severity === "Critical").length;
    const highCount = unacknowledgedAlerts.filter((a) => a.severity === "High").length;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Critical": return { bg: "bg-red-50", border: "border-l-red-500", badge: "bg-red-100 text-red-700" };
            case "High": return { bg: "bg-amber-50", border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700" };
            case "Medium": return { bg: "bg-blue-50", border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" };
            default: return { bg: "bg-gray-50", border: "border-l-gray-400", badge: "bg-gray-100 text-gray-700" };
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
    };

    // Sort by severity then by time
    const sortedAlerts = [...displayAlerts].sort((a, b) => {
        const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
            (severityOrder[b.severity as keyof typeof severityOrder] || 3);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
            {/* Simplified Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl relative">
                            <Bell className="w-5 h-5 text-red-600" />
                            {unacknowledgedAlerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unacknowledgedAlerts.length}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">การแจ้งเตือน</h2>
                            <p className="text-xs text-gray-500">
                                {unacknowledgedAlerts.length === 0 ? "ไม่มีรายการรอดำเนินการ" : `${unacknowledgedAlerts.length} รายการต้องตรวจสอบ`}
                            </p>
                        </div>
                    </div>

                    {/* Toggle Acknowledged */}
                    {acknowledgedAlerts.length > 0 && (
                        <button
                            onClick={() => setShowAcknowledged(!showAcknowledged)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                                ${showAcknowledged ? "bg-gray-200 text-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            {showAcknowledged ? "เฉพาะรอดำเนินการ" : "แสดงทั้งหมด"}
                        </button>
                    )}
                </div>

                {/* Quick Stats - Only if there are alerts */}
                {unacknowledgedAlerts.length > 0 && (
                    <div className="flex gap-2">
                        {criticalCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">{criticalCount} วิกฤต</span>
                            </div>
                        )}
                        {highCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">{highCount} สูง</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {sortedAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="p-4 bg-emerald-100 rounded-full mb-3">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">ไม่มีการแจ้งเตือน!</h3>
                        <p className="text-sm text-gray-500">ไม่มีรายการที่ต้องดำเนินการในขณะนี้</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {sortedAlerts.map((alert) => {
                            const colors = getSeverityColor(alert.severity);
                            const isAcknowledged = alert.acknowledged;

                            return (
                                <div
                                    key={alert.id}
                                    className={`p-4 border-l-4 transition-all
                                        ${colors.border}
                                        ${isAcknowledged ? "bg-gray-50 opacity-60" : colors.bg}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${isAcknowledged ? "bg-gray-200" : "bg-white shadow-sm"}`}>
                                            {alert.alertType.includes("Stock") ? (
                                                <Package className={`w-4 h-4 ${isAcknowledged ? "text-gray-400" : colors.badge.split(" ")[1]}`} />
                                            ) : (
                                                <Clock className={`w-4 h-4 ${isAcknowledged ? "text-gray-400" : colors.badge.split(" ")[1]}`} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {!isAcknowledged && (
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${colors.badge}`}>
                                                        {alert.severity}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">{getTimeAgo(alert.createdAt)}</span>
                                                {isAcknowledged && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                        <CheckCheck className="w-3 h-3" />
                                                        เสร็จสิ้น
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className={`font-semibold truncate ${isAcknowledged ? "text-gray-500" : "text-gray-900"}`}>
                                                {alert.medicationName}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {alert.alertType === "Low Stock" || alert.alertType === "Critical Stock" ? (
                                                    <>เหลือเพียง {alert.currentQuantity} (ขั้นต่ำ: {alert.threshold})</>
                                                ) : alert.alertType === "Expiring" ? (
                                                    <>หมดอายุ {new Date(alert.expirationDate!).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}</>
                                                ) : alert.alertType === "Expired" ? (
                                                    <>หมดอายุแล้ว!</>
                                                ) : (
                                                    <>ต้องสั่งซื้อ</>
                                                )}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => onViewMedication(alert.medicationId)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="ดูรายละเอียดยา"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!isAcknowledged && (
                                                <button
                                                    onClick={() => onAcknowledge(alert.id)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="ทำเครื่องหมายว่าจัดการแล้ว"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer - Acknowledge All */}
            {unacknowledgedAlerts.length > 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => unacknowledgedAlerts.forEach((a) => onAcknowledge(a.id))}
                        className="w-full py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCheck className="w-4 h-4" />
                        รับทราบทั้งหมด ({unacknowledgedAlerts.length})
                    </button>
                </div>
            )}
        </div>
    );
}
