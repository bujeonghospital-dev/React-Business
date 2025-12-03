"use client";

import React, { useState, useMemo } from "react";
import {
    ClipboardList,
    Search,
    User,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Pill,
    ChevronRight,
    Zap,
    X,
} from "lucide-react";
import { Prescription, Medication } from "../types";
import { getPriorityColor, getPrescriptionStatusColor } from "../mockData";

interface PrescriptionQueueProps {
    prescriptions: Prescription[];
    medications: Medication[];
    onSelectPrescription: (prescription: Prescription) => void;
    onDispensePrescription: (prescription: Prescription) => void;
    selectedPrescription: Prescription | null;
}

export default function PrescriptionQueue({
    prescriptions,
    medications,
    onSelectPrescription,
    onDispensePrescription,
    selectedPrescription,
}: PrescriptionQueueProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "completed" | "all">("pending");

    // Quick stats
    const stats = useMemo(() => {
        const pending = prescriptions.filter((rx) => rx.status === "Pending" || rx.status === "Verified").length;
        const stat = prescriptions.filter((rx) => rx.priority === "STAT" && rx.status !== "Dispensed").length;
        const completed = prescriptions.filter((rx) => rx.status === "Dispensed").length;
        return { pending, stat, completed };
    }, [prescriptions]);

    const filteredPrescriptions = useMemo(() => {
        let result = [...prescriptions];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (rx) =>
                    rx.patientName.toLowerCase().includes(query) ||
                    rx.patientMRN.toLowerCase().includes(query) ||
                    rx.medicationName.toLowerCase().includes(query)
            );
        }

        // Tab filter
        switch (activeTab) {
            case "pending":
                result = result.filter((rx) => rx.status === "Pending" || rx.status === "Verified" || rx.status === "On Hold");
                break;
            case "completed":
                result = result.filter((rx) => rx.status === "Dispensed");
                break;
        }

        // Sort by priority (STAT first) and date
        result.sort((a, b) => {
            const priorityOrder = { STAT: 0, Urgent: 1, Routine: 2 };
            const priorityDiff =
                priorityOrder[a.priority as keyof typeof priorityOrder] -
                priorityOrder[b.priority as keyof typeof priorityOrder];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime();
        });

        return result;
    }, [prescriptions, searchQuery, activeTab]);

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

    const getMedicationStock = (medicationId: string) => {
        const med = medications.find((m) => m.id === medicationId);
        return med?.quantity || 0;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
            {/* Simplified Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <ClipboardList className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">ใบสั่งยา</h2>
                            <p className="text-xs text-gray-500">{stats.pending} รายการรอจ่ายยา</p>
                        </div>
                    </div>

                    {/* STAT Alert Badge */}
                    {stats.stat > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold">{stats.stat}</span>
                            <span className="text-xs font-medium">ด่วนพิเศษ</span>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาผู้ป่วยหรือยา..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Simplified Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "pending" ? "bg-white text-violet-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        รอดำเนินการ ({stats.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "completed" ? "bg-white text-violet-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        เสร็จสิ้น ({stats.completed})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "all" ? "bg-white text-violet-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        ทั้งหมด
                    </button>
                </div>
            </div>

            {/* Prescription List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                {filteredPrescriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-3">
                            <ClipboardList className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">ไม่พบใบสั่งยา</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {activeTab === "pending" ? "จ่ายยาครบทุกใบสั่งแล้ว!" : "ลองค้นหาใหม่"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredPrescriptions.map((rx) => {
                            const isSelected = selectedPrescription?.id === rx.id;
                            const stock = getMedicationStock(rx.medicationId);
                            const hasStock = stock >= rx.quantity;
                            const isDispensed = rx.status === "Dispensed";
                            const isStat = rx.priority === "STAT";

                            return (
                                <div
                                    key={rx.id}
                                    onClick={() => onSelectPrescription(rx)}
                                    className={`p-4 cursor-pointer transition-all relative
                                        ${isSelected ? "bg-violet-50" : "hover:bg-gray-50"}
                                        ${isStat && !isDispensed ? "border-l-4 border-l-red-500 bg-red-50/30" : ""}
                                    `}
                                >
                                    {/* Top Row - Priority Badge & Time */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {isStat && !isDispensed && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                    <Zap className="w-3 h-3" />
                                                    STAT
                                                </span>
                                            )}
                                            {rx.priority === "Urgent" && !isDispensed && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                                                    ด่วน
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-lg border ${getPrescriptionStatusColor(rx.status)}`}>
                                                {rx.status}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(rx.prescribedDate)}
                                        </span>
                                    </div>

                                    {/* Patient Name - Large & Clear */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900">{rx.patientName}</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {rx.patientMRN}
                                        </span>
                                    </div>

                                    {/* Medication - Compact */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <Pill className="w-4 h-4 text-violet-500" />
                                        <span>{rx.medicationName}</span>
                                        <span className="text-gray-400">×{rx.quantity}</span>
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex items-center justify-between">
                                        {/* Stock Warning */}
                                        {!hasStock && !isDispensed && (
                                            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                                <AlertTriangle className="w-3 h-3" />
                                                สต็อกต่ำ (มี {stock})
                                            </div>
                                        )}

                                        {/* Completed Badge */}
                                        {isDispensed && (
                                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                จ่ายยาแล้ว
                                            </div>
                                        )}

                                        {/* Dispense Button - Clear CTA */}
                                        {!isDispensed && hasStock && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDispensePrescription(rx);
                                                }}
                                                className={`ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all
                                                    ${isStat
                                                        ? "bg-red-500 text-white hover:bg-red-600 shadow-md"
                                                        : "bg-violet-500 text-white hover:bg-violet-600"
                                                    }
                                                `}
                                            >
                                                จ่ายยา
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* On Hold or Other */}
                                        {!isDispensed && !hasStock && (
                                            <span className="ml-auto text-xs text-gray-400">ต้องเติมสต็อก</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
