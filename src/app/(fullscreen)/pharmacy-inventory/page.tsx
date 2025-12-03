"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
    Pill,
    Package,
    ClipboardList,
    Bell,
    LayoutDashboard,
    Menu,
    X,
    Clock,
    Search,
    Zap,
    TrendingDown,
    AlertTriangle,
} from "lucide-react";
import {
    InventoryTable,
    MedicationDetail,
    PrescriptionQueue,
    DispenseModal,
    AlertsPanel,
    DashboardStats,
} from "./components";
import {
    mockMedications,
    mockPrescriptions,
    mockPatients,
    mockStockAlerts,
} from "./mockData";
import { Medication, Prescription } from "./types";

type ViewMode = "dashboard" | "inventory" | "prescriptions" | "alerts";

export default function PharmacyInventoryPage() {
    // State management
    const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showDispenseModal, setShowDispenseModal] = useState(false);
    const [prescriptionToDispense, setPrescriptionToDispense] = useState<Prescription | null>(null);
    const [medications, setMedications] = useState(mockMedications);
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [alerts, setAlerts] = useState(mockStockAlerts);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate real-time stats
    const dashboardStats = useMemo(() => {
        const lowStock = medications.filter((m) => m.quantity <= m.minStockLevel && m.quantity > m.minStockLevel / 2).length;
        const critical = medications.filter((m) => m.quantity <= m.minStockLevel / 2).length;
        const today = new Date();
        const expiring = medications.filter((m) => {
            const expDate = new Date(m.expirationDate);
            const days = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return days <= 90 && days > 0;
        }).length;
        const expired = medications.filter((m) => new Date(m.expirationDate) < today).length;
        const pending = prescriptions.filter((p) => p.status === "Pending" || p.status === "Verified").length;
        const dispensedToday = prescriptions.filter(
            (p) =>
                p.status === "Dispensed" &&
                p.dispensedDate &&
                new Date(p.dispensedDate).toDateString() === today.toDateString()
        ).length;
        const totalValue = medications.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);

        return {
            totalMedications: medications.length,
            lowStockItems: lowStock,
            criticalStockItems: critical,
            expiringItems: expiring,
            expiredItems: expired,
            pendingPrescriptions: pending,
            dispensedToday,
            totalValue,
        };
    }, [medications, prescriptions]);

    // Handlers
    const handleSelectMedication = useCallback((medication: Medication) => {
        setSelectedMedication(medication);
        setSelectedPrescription(null);
    }, []);

    const handleSelectPrescription = useCallback((prescription: Prescription) => {
        setSelectedPrescription(prescription);
        const med = medications.find((m) => m.id === prescription.medicationId);
        if (med) setSelectedMedication(med);
    }, [medications]);

    const handleDispenseMedication = useCallback((medication: Medication) => {
        const rx = prescriptions.find(
            (p) => p.medicationId === medication.id && (p.status === "Pending" || p.status === "Verified")
        );
        if (rx) {
            setPrescriptionToDispense(rx);
            setShowDispenseModal(true);
        }
    }, [prescriptions]);

    const handleDispensePrescription = useCallback((prescription: Prescription) => {
        setPrescriptionToDispense(prescription);
        setShowDispenseModal(true);
    }, []);

    const handleConfirmDispense = useCallback(
        (prescription: Prescription, notes: string) => {
            setMedications((prev) =>
                prev.map((m) =>
                    m.id === prescription.medicationId
                        ? { ...m, quantity: m.quantity - prescription.quantity }
                        : m
                )
            );
            setPrescriptions((prev) =>
                prev.map((p) =>
                    p.id === prescription.id
                        ? {
                            ...p,
                            status: "Dispensed" as const,
                            dispensedDate: new Date().toISOString(),
                            dispensedBy: "Current Pharmacist",
                            notes: notes || p.notes,
                        }
                        : p
                )
            );
            setShowDispenseModal(false);
            setPrescriptionToDispense(null);
        },
        []
    );

    const handleAcknowledgeAlert = useCallback((alertId: string) => {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id === alertId
                    ? { ...a, acknowledged: true, acknowledgedBy: "Current User", acknowledgedAt: new Date().toISOString() }
                    : a
            )
        );
    }, []);

    const handleViewMedicationFromAlert = useCallback(
        (medicationId: string) => {
            const med = medications.find((m) => m.id === medicationId);
            if (med) {
                setSelectedMedication(med);
                setViewMode("inventory");
            }
        },
        [medications]
    );

    // Handle stat clicks from dashboard
    const handleStatClick = useCallback((statType: string) => {
        switch (statType) {
            case "pending":
            case "prescriptions":
                setViewMode("prescriptions");
                break;
            case "critical":
            case "low-stock":
            case "expiring":
                setViewMode("alerts");
                break;
            case "inventory":
                setViewMode("inventory");
                break;
        }
    }, []);

    const unacknowledgedAlertCount = alerts.filter((a) => !a.acknowledged).length;
    const pendingRxCount = prescriptions.filter((p) => p.status === "Pending" || p.status === "Verified").length;
    const statRxCount = prescriptions.filter((p) => p.priority === "STAT" && p.status !== "Dispensed").length;

    const navItems = [
        { id: "dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: "inventory", label: "คลังยา", icon: <Package className="w-5 h-5" />, badge: dashboardStats.criticalStockItems },
        { id: "prescriptions", label: "ใบสั่งยา", icon: <ClipboardList className="w-5 h-5" />, badge: pendingRxCount, highlight: statRxCount > 0 },
        { id: "alerts", label: "การแจ้งเตือน", icon: <Bell className="w-5 h-5" />, badge: unacknowledgedAlertCount },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sarabun">
            {/* Simplified Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 lg:px-6 h-14">
                    {/* Left Section - Logo & Title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-500 rounded-lg">
                                <Pill className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base font-bold text-gray-900 leading-tight">ระบบเภสัชกรรม</h1>
                                <p className="text-[10px] text-gray-500 leading-tight">โรงพยาบาล BJH</p>
                            </div>
                        </div>
                    </div>

                    {/* Center - Navigation (Desktop) */}
                    <nav className="hidden lg:flex items-center bg-gray-100 rounded-lg p-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setViewMode(item.id as ViewMode)}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                    ${viewMode === item.id
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full
                                        ${item.highlight ? "bg-red-500 text-white animate-pulse" : viewMode === item.id ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}
                                    `}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Right Section - Time & Quick Actions */}
                    <div className="flex items-center gap-3">
                        {/* STAT Prescriptions Alert */}
                        {statRxCount > 0 && (
                            <button
                                onClick={() => setViewMode("prescriptions")}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg animate-pulse"
                            >
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-bold">{statRxCount} STAT</span>
                            </button>
                        )}

                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                                {currentTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>

                        {/* User Avatar */}
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            ภ
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden border-t border-gray-100 p-2 bg-white animate-fade-in">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setViewMode(item.id as ViewMode);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all
                                        ${viewMode === item.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full
                                            ${item.highlight ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}
                                        `}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>
                )}

                {/* Mobile Tab Bar */}
                <nav className="lg:hidden flex items-center justify-around border-t border-gray-100 bg-white">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setViewMode(item.id as ViewMode)}
                            className={`relative flex flex-col items-center gap-0.5 py-2 px-4 transition-all
                                ${viewMode === item.id ? "text-blue-600" : "text-gray-500"}
                            `}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className={`absolute top-1 right-2 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center
                                    ${item.highlight ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}
                                `}>
                                    {item.badge > 9 ? "9+" : item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Main Content - Full Screen */}
            <main className="p-3 lg:p-4 xl:p-5 w-full">
                {/* Dashboard View */}
                {viewMode === "dashboard" && (
                    <div className="space-y-4">
                        <DashboardStats stats={dashboardStats} onStatClick={handleStatClick} />

                        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {/* Main Content Area */}
                            <div className="lg:col-span-3 xl:col-span-4">
                                <InventoryTable
                                    medications={medications}
                                    onSelectMedication={handleSelectMedication}
                                    selectedMedication={selectedMedication}
                                />
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1 space-y-4">
                                {selectedMedication ? (
                                    <MedicationDetail
                                        medication={selectedMedication}
                                        onClose={() => setSelectedMedication(null)}
                                        onDispense={handleDispenseMedication}
                                    />
                                ) : (
                                    <PrescriptionQueue
                                        prescriptions={prescriptions}
                                        medications={medications}
                                        onSelectPrescription={handleSelectPrescription}
                                        onDispensePrescription={handleDispensePrescription}
                                        selectedPrescription={selectedPrescription}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory View */}
                {viewMode === "inventory" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div className="lg:col-span-3 xl:col-span-4">
                            <InventoryTable
                                medications={medications}
                                onSelectMedication={handleSelectMedication}
                                selectedMedication={selectedMedication}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            {selectedMedication ? (
                                <MedicationDetail
                                    medication={selectedMedication}
                                    onClose={() => setSelectedMedication(null)}
                                    onDispense={handleDispenseMedication}
                                />
                            ) : (
                                <EmptyState
                                    icon={<Package className="w-8 h-8" />}
                                    title="เลือกรายการยา"
                                    description="คลิกที่รายการยาเพื่อดูรายละเอียด"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Prescriptions View */}
                {viewMode === "prescriptions" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div className="lg:col-span-3 xl:col-span-4">
                            <PrescriptionQueue
                                prescriptions={prescriptions}
                                medications={medications}
                                onSelectPrescription={handleSelectPrescription}
                                onDispensePrescription={handleDispensePrescription}
                                selectedPrescription={selectedPrescription}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            {selectedMedication ? (
                                <MedicationDetail
                                    medication={selectedMedication}
                                    onClose={() => setSelectedMedication(null)}
                                    onDispense={handleDispenseMedication}
                                />
                            ) : (
                                <EmptyState
                                    icon={<ClipboardList className="w-8 h-8" />}
                                    title="รายละเอียดใบสั่งยา"
                                    description="เลือกใบสั่งยาเพื่อดูข้อมูลยา"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Alerts View */}
                {viewMode === "alerts" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div className="lg:col-span-3 xl:col-span-4">
                            <AlertsPanel
                                alerts={alerts}
                                onAcknowledge={handleAcknowledgeAlert}
                                onViewMedication={handleViewMedicationFromAlert}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            {selectedMedication ? (
                                <MedicationDetail
                                    medication={selectedMedication}
                                    onClose={() => setSelectedMedication(null)}
                                    onDispense={handleDispenseMedication}
                                />
                            ) : (
                                <EmptyState
                                    icon={<Bell className="w-8 h-8" />}
                                    title="รายละเอียดการแจ้งเตือน"
                                    description="คลิก 'ดู' เพื่อดูข้อมูลยา"
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Dispense Modal */}
            {showDispenseModal && prescriptionToDispense && (
                <DispenseModal
                    prescription={prescriptionToDispense}
                    medication={medications.find((m) => m.id === prescriptionToDispense.medicationId)!}
                    patient={mockPatients.find((p) => p.id === prescriptionToDispense.patientId)}
                    onClose={() => {
                        setShowDispenseModal(false);
                        setPrescriptionToDispense(null);
                    }}
                    onConfirmDispense={handleConfirmDispense}
                />
            )}

            {/* Minimal Footer */}
            <footer className="border-t border-gray-200 bg-white py-2 px-4">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <Pill className="w-3 h-3 text-blue-400" />
                        <span>ระบบเภสัชกรรม BJH</span>
                    </div>
                    <span>Open Source • MIT</span>
                </div>
            </footer>
        </div>
    );
}

// Empty State Component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
            <div className="p-4 bg-gray-100 rounded-2xl text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}
