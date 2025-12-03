"use client";

import React, { useState } from "react";
import {
    X,
    Package,
    Thermometer,
    AlertTriangle,
    Clock,
    MapPin,
    Barcode,
    Building2,
    Shield,
    Pill,
    AlertCircle,
    Zap,
    ChevronDown,
    ChevronUp,
    Snowflake,
    Copy,
    Check,
} from "lucide-react";
import { Medication } from "../types";
import { getStockStatus, getStatusColor } from "../mockData";

interface MedicationDetailProps {
    medication: Medication;
    onClose: () => void;
    onDispense: (medication: Medication) => void;
}

export default function MedicationDetail({
    medication,
    onClose,
    onDispense,
}: MedicationDetailProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["stock"]));
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const status = getStockStatus(medication);
    const statusColor = getStatusColor(status);

    const getDaysUntilExpiry = (dateString: string) => {
        const today = new Date();
        const expDate = new Date(dateString);
        return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const daysUntilExpiry = getDaysUntilExpiry(medication.expirationDate);
    const isLowStock = medication.quantity <= medication.minStockLevel;
    const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry <= 0;

    const toggleSection = (section: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        setExpandedSections(newSet);
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const hasWarnings = medication.contraindications.length > 0 ||
        medication.interactions.length > 0 ||
        isExpiringSoon || isExpired || isLowStock;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
            {/* Compact Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-blue-100 rounded-xl flex-shrink-0">
                            <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 truncate">{medication.name}</h2>
                            <p className="text-sm text-gray-500 truncate">{medication.genericName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Quick Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                        {status === "In Stock" ? "มีสต็อก" : status === "Low Stock" ? "สต็อกต่ำ" : status === "Critical" ? "วิกฤต" : status === "Out of Stock" ? "หมดสต็อก" : status === "Expired" ? "หมดอายุ" : status === "Expiring Soon" ? "ใกล้หมดอายุ" : status}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                        {medication.form}
                    </span>
                    {medication.controlledSubstance && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            <Shield className="w-3 h-3" />
                            ควบคุม-{medication.scheduleClass}
                        </span>
                    )}
                    {medication.requiresRefrigeration && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            <Snowflake className="w-3 h-3" />
                            แช่เย็น
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Stock & Expiry - Always Visible Key Info */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${isLowStock ? "bg-red-50 border border-red-200" : "bg-blue-50"}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${isLowStock ? "text-red-600" : "text-blue-600"}`}>สต็อก</span>
                            <Package className={`w-4 h-4 ${isLowStock ? "text-red-400" : "text-blue-400"}`} />
                        </div>
                        <p className={`text-2xl font-bold ${isLowStock ? "text-red-700" : "text-blue-700"}`}>
                            {medication.quantity.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">ขั้นต่ำ: {medication.minStockLevel}</p>
                    </div>

                    <div className={`p-3 rounded-xl ${isExpired ? "bg-red-50 border border-red-200" : isExpiringSoon ? "bg-amber-50 border border-amber-200" : "bg-emerald-50"}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-600" : "text-emerald-600"}`}>
                                วันหมดอายุ
                            </span>
                            <Clock className={`w-4 h-4 ${isExpired ? "text-red-400" : isExpiringSoon ? "text-amber-400" : "text-emerald-400"}`} />
                        </div>
                        <p className={`text-lg font-bold ${isExpired ? "text-red-700" : isExpiringSoon ? "text-amber-700" : "text-emerald-700"}`}>
                            {isExpired ? "หมดอายุแล้ว" : `${daysUntilExpiry} วัน`}
                        </p>
                        <p className="text-xs text-gray-500">
                            {new Date(medication.expirationDate).toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "2-digit" })}
                        </p>
                    </div>
                </div>

                {/* Warning Section - Prominently displayed if any */}
                {hasWarnings && (
                    <CollapsibleSection
                        title="⚠️ คำเตือนและปฏิกิริยา"
                        isExpanded={expandedSections.has("warnings")}
                        onToggle={() => toggleSection("warnings")}
                        defaultExpanded
                        alertStyle
                    >
                        <div className="space-y-3">
                            {/* Contraindications */}
                            {medication.contraindications.length > 0 && (
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        ข้อห้ามใช้
                                    </p>
                                    <ul className="space-y-1">
                                        {medication.contraindications.map((item, i) => (
                                            <li key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                                                <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Drug Interactions */}
                            {medication.interactions.length > 0 && (
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        ปฏิกิริยาระหว่างยา
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {medication.interactions.map((item, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Side Effects */}
                            {medication.sideEffects.length > 0 && (
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        ผลข้างเคียง
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {medication.sideEffects.map((item, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                )}

                {/* Product Details - Collapsible */}
                <CollapsibleSection
                    title="รายละเอียดผลิตภัณฑ์"
                    isExpanded={expandedSections.has("details")}
                    onToggle={() => toggleSection("details")}
                >
                    <div className="space-y-2">
                        <DetailRow label="ความแรง" value={medication.strength} />
                        <DetailRow label="หมวดหมู่" value={medication.category} />
                        <DetailRow label="ผู้ผลิต" value={medication.manufacturer} icon={<Building2 className="w-3.5 h-3.5" />} />
                        <DetailRow label="ตำแหน่ง" value={medication.location} icon={<MapPin className="w-3.5 h-3.5" />} />
                        <DetailRow
                            label="รหัส NDC"
                            value={medication.ndcCode}
                            icon={<Barcode className="w-3.5 h-3.5" />}
                            copyable
                            onCopy={() => copyToClipboard(medication.ndcCode, "ndc")}
                            copied={copiedField === "ndc"}
                        />
                        <DetailRow
                            label="บาร์โค้ด"
                            value={medication.barcode}
                            copyable
                            onCopy={() => copyToClipboard(medication.barcode, "barcode")}
                            copied={copiedField === "barcode"}
                        />
                        <DetailRow label="เลขแบทช์" value={medication.batchNumber} />
                        <DetailRow label="เลขล็อต" value={medication.lotNumber} />
                    </div>
                </CollapsibleSection>

                {/* Storage Info - Collapsible */}
                <CollapsibleSection
                    title="การเก็บรักษา"
                    isExpanded={expandedSections.has("storage")}
                    onToggle={() => toggleSection("storage")}
                >
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <Thermometer className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-700">{medication.storageConditions}</p>
                    </div>
                </CollapsibleSection>

                {/* Pricing Summary */}
                <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-600">ราคาต่อหน่วย</p>
                            <p className="font-bold text-emerald-700">฿{medication.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-emerald-600">มูลค่าสต็อก</p>
                            <p className="font-bold text-emerald-700">
                                ฿{(medication.quantity * medication.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions - Clear CTA */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <button
                    onClick={() => onDispense(medication)}
                    disabled={medication.quantity === 0 || isExpired}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${medication.quantity === 0 || isExpired
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-[0.98]"
                        }`}
                >
                    <Package className="w-5 h-5" />
                    {medication.quantity === 0 ? "หมดสต็อก" : isExpired ? "หมดอายุ - ไม่สามารถจ่ายได้" : "จ่ายยา"}
                </button>
            </div>
        </div>
    );
}

// Collapsible Section Component
function CollapsibleSection({
    title,
    children,
    isExpanded,
    onToggle,
    defaultExpanded,
    alertStyle,
}: {
    title: string;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    defaultExpanded?: boolean;
    alertStyle?: boolean;
}) {
    const expanded = defaultExpanded || isExpanded;

    return (
        <div className={`border-t border-gray-100 ${alertStyle ? "bg-amber-50/50" : ""}`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <span className="text-sm font-semibold text-gray-700">{title}</span>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>
            {expanded && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}

// Detail Row Component
function DetailRow({
    label,
    value,
    icon,
    copyable,
    onCopy,
    copied,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    copyable?: boolean;
    onCopy?: () => void;
    copied?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 text-gray-500">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{value}</span>
                {copyable && (
                    <button
                        onClick={onCopy}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
