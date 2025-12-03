"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    Filter,
    AlertTriangle,
    Package,
    Clock,
    TrendingDown,
    X,
    ChevronDown,
    ChevronUp,
    Snowflake,
    Shield,
    SlidersHorizontal,
} from "lucide-react";
import { Medication, FilterOptions, MedicationCategory, MedicationForm, StockStatus } from "../types";
import { getStockStatus, getStatusColor } from "../mockData";

interface InventoryTableProps {
    medications: Medication[];
    onSelectMedication: (medication: Medication) => void;
    selectedMedication: Medication | null;
    compactMode?: boolean;
}

export default function InventoryTable({
    medications,
    onSelectMedication,
    selectedMedication,
    compactMode = false,
}: InventoryTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [quickFilter, setQuickFilter] = useState<"all" | "low" | "critical" | "expiring">("all");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [formFilter, setFormFilter] = useState<string>("All");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Quick stats for filter badges
    const quickStats = useMemo(() => {
        const today = new Date();
        return {
            low: medications.filter((m) => getStockStatus(m) === "Low Stock").length,
            critical: medications.filter((m) => getStockStatus(m) === "Critical" || getStockStatus(m) === "Out of Stock").length,
            expiring: medications.filter((m) => {
                const days = Math.ceil((new Date(m.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return days <= 90 && days > 0;
            }).length,
        };
    }, [medications]);

    const filteredMedications = useMemo(() => {
        let result = [...medications];
        const today = new Date();

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (med) =>
                    med.name.toLowerCase().includes(query) ||
                    med.genericName.toLowerCase().includes(query) ||
                    med.ndcCode.toLowerCase().includes(query) ||
                    med.barcode.includes(query)
            );
        }

        // Quick filter
        switch (quickFilter) {
            case "low":
                result = result.filter((m) => getStockStatus(m) === "Low Stock");
                break;
            case "critical":
                result = result.filter((m) => {
                    const status = getStockStatus(m);
                    return status === "Critical" || status === "Out of Stock";
                });
                break;
            case "expiring":
                result = result.filter((m) => {
                    const days = Math.ceil((new Date(m.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return days <= 90 && days > 0;
                });
                break;
        }

        // Advanced filters
        if (categoryFilter !== "All") {
            result = result.filter((m) => m.category === categoryFilter);
        }
        if (formFilter !== "All") {
            result = result.filter((m) => m.form === formFilter);
        }

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "name": comparison = a.name.localeCompare(b.name); break;
                case "quantity": comparison = a.quantity - b.quantity; break;
                case "expiration": comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime(); break;
                default: comparison = 0;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return result;
    }, [medications, searchQuery, quickFilter, categoryFilter, formFilter, sortBy, sortDirection]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const getDaysUntilExpiry = (dateString: string) => {
        const today = new Date();
        const expDate = new Date(dateString);
        return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Get unique categories and forms for filters
    const categories = useMemo(() => [...new Set(medications.map((m) => m.category))].sort(), [medications]);
    const forms = useMemo(() => [...new Set(medications.map((m) => m.form))].sort(), [medications]);

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return null;
        return sortDirection === "asc" ?
            <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> :
            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Simplified Header */}
            <div className="p-4 border-b border-gray-100">
                {/* Search Bar - Full Width, Always Visible */}
                <div className="relative mb-4">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อยา, ชื่อสามัญ, NDC หรือบาร์โค้ด..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Quick Filters - One Click Access */}
                <div className="flex items-center gap-2 flex-wrap">
                    <QuickFilterButton
                        active={quickFilter === "all"}
                        onClick={() => setQuickFilter("all")}
                        label="ทั้งหมด"
                        count={medications.length}
                    />
                    <QuickFilterButton
                        active={quickFilter === "critical"}
                        onClick={() => setQuickFilter("critical")}
                        label="วิกฤต"
                        count={quickStats.critical}
                        color="red"
                        pulse={quickStats.critical > 0}
                    />
                    <QuickFilterButton
                        active={quickFilter === "low"}
                        onClick={() => setQuickFilter("low")}
                        label="สต็อกต่ำ"
                        count={quickStats.low}
                        color="amber"
                    />
                    <QuickFilterButton
                        active={quickFilter === "expiring"}
                        onClick={() => setQuickFilter("expiring")}
                        label="ใกล้หมดอายุ"
                        count={quickStats.expiring}
                        color="orange"
                    />

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all
                            ${showAdvancedFilters ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">ตัวกรองเพิ่มเติม</span>
                    </button>
                </div>

                {/* Advanced Filters Panel - Collapsible */}
                {showAdvancedFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 animate-fade-in">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="All">หมวดหมู่ทั้งหมด</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={formFilter}
                            onChange={(e) => setFormFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="All">รูปแบบยาทั้งหมด</option>
                            {forms.map((form) => (
                                <option key={form} value={form}>{form}</option>
                            ))}
                        </select>
                        {(categoryFilter !== "All" || formFilter !== "All") && (
                            <button
                                onClick={() => { setCategoryFilter("All"); setFormFilter("All"); }}
                                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Compact Card View for Mobile / Standard Table for Desktop */}
            <div className="overflow-x-auto">
                {/* Results Summary */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                        แสดง <strong className="text-gray-900">{filteredMedications.length}</strong> รายการยา
                    </span>
                    <div className="flex items-center gap-1 text-gray-500">
                        <span>เรียง:</span>
                        <button onClick={() => handleSort("name")} className={`px-2 py-0.5 rounded ${sortBy === "name" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200"}`}>
                            ชื่อ <SortIcon column="name" />
                        </button>
                        <button onClick={() => handleSort("quantity")} className={`px-2 py-0.5 rounded ${sortBy === "quantity" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200"}`}>
                            จำนวน <SortIcon column="quantity" />
                        </button>
                        <button onClick={() => handleSort("expiration")} className={`px-2 py-0.5 rounded ${sortBy === "expiration" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200"}`}>
                            วันหมดอายุ <SortIcon column="expiration" />
                        </button>
                    </div>
                </div>

                {/* Medication List */}
                <div className="divide-y divide-gray-50 max-h-[calc(100vh-280px)] overflow-y-auto">
                    {filteredMedications.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">ไม่พบรายการยา</p>
                            <p className="text-gray-400 text-sm mt-1">ลองปรับคำค้นหาหรือตัวกรอง</p>
                        </div>
                    ) : (
                        filteredMedications.map((med) => {
                            const status = getStockStatus(med);
                            const statusColor = getStatusColor(status);
                            const daysUntilExpiry = getDaysUntilExpiry(med.expirationDate);
                            const isSelected = selectedMedication?.id === med.id;
                            const isLowOrCritical = status === "Low Stock" || status === "Critical" || status === "Out of Stock";
                            const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
                            const isExpired = daysUntilExpiry <= 0;

                            return (
                                <div
                                    key={med.id}
                                    onClick={() => onSelectMedication(med)}
                                    className={`p-4 cursor-pointer transition-all duration-150
                                        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50 border-l-4 border-l-transparent"}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Indicator */}
                                        <div className={`w-1.5 h-12 rounded-full flex-shrink-0 mt-1
                                            ${status === "In Stock" ? "bg-emerald-400" : ""}
                                            ${status === "Low Stock" ? "bg-amber-400" : ""}
                                            ${status === "Critical" || status === "Out of Stock" ? "bg-red-400" : ""}
                                            ${status === "Expired" || status === "Expiring Soon" ? "bg-orange-400" : ""}
                                        `} />

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-gray-900 truncate">{med.name}</h3>
                                                        {/* Quick Badges */}
                                                        {med.controlledSubstance && (
                                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded" title="Controlled Substance">
                                                                <Shield className="w-3 h-3" />
                                                                C-{med.scheduleClass}
                                                            </span>
                                                        )}
                                                        {med.requiresRefrigeration && (
                                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded" title="Requires Refrigeration">
                                                                <Snowflake className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">{med.genericName}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{med.form} · {med.strength} · {med.location}</p>
                                                </div>

                                                {/* Stock & Expiry Info */}
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <span className={`text-lg font-bold ${isLowOrCritical ? "text-red-600" : "text-gray-900"}`}>
                                                            {med.quantity.toLocaleString()}
                                                        </span>
                                                        {isLowOrCritical && <TrendingDown className="w-4 h-4 text-red-500" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500">ขั้นต่ำ {med.minStockLevel}</p>
                                                    <div className={`text-xs mt-1 flex items-center gap-1 justify-end
                                                        ${isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-amber-600" : "text-gray-500"}`}>
                                                        {(isExpiringSoon || isExpired) && <Clock className="w-3 h-3" />}
                                                        {isExpired ? "หมดอายุแล้ว" : `เหลือ ${daysUntilExpiry} วัน`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// Quick Filter Button Component
function QuickFilterButton({
    active, onClick, label, count, color, pulse
}: {
    active: boolean; onClick: () => void; label: string; count: number; color?: string; pulse?: boolean
}) {
    const colorStyles: Record<string, string> = {
        red: "bg-red-100 text-red-700 border-red-200",
        amber: "bg-amber-100 text-amber-700 border-amber-200",
        orange: "bg-orange-100 text-orange-700 border-orange-200",
    };

    return (
        <button
            onClick={onClick}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all
                ${active
                    ? color ? colorStyles[color] : "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
            `}
        >
            {pulse && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
            )}
            {label}
            <span className={`px-1.5 py-0.5 text-xs rounded-md ${active ? "bg-white/60" : "bg-gray-100"}`}>
                {count}
            </span>
        </button>
    );
}
