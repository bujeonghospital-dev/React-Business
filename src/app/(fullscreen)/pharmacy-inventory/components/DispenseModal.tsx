"use client";

import React, { useState } from "react";
import {
    X,
    User,
    Pill,
    AlertTriangle,
    CheckCircle2,
    Package,
    FileText,
    ClipboardCheck,
    Printer,
    Shield,
} from "lucide-react";
import { Prescription, Medication, Patient } from "../types";
import { getPriorityColor } from "../mockData";

interface DispenseModalProps {
    prescription: Prescription;
    medication: Medication;
    patient: Patient | undefined;
    onClose: () => void;
    onConfirmDispense: (prescription: Prescription, notes: string) => void;
}

export default function DispenseModal({
    prescription,
    medication,
    patient,
    onClose,
    onConfirmDispense,
}: DispenseModalProps) {
    const [dispenserNotes, setDispenserNotes] = useState("");
    const [verifyPatient, setVerifyPatient] = useState(false);
    const [verifyDosage, setVerifyDosage] = useState(false);
    const [verifyAllergies, setVerifyAllergies] = useState(false);
    const [verifyInteractions, setVerifyInteractions] = useState(false);
    const [showAllergyWarning, setShowAllergyWarning] = useState(false);

    const allVerified = verifyPatient && verifyDosage && verifyAllergies && verifyInteractions;

    // Check for potential allergy conflicts
    const potentialAllergyConflict = patient?.allergies.some((allergy) =>
        medication.name.toLowerCase().includes(allergy.toLowerCase()) ||
        medication.genericName.toLowerCase().includes(allergy.toLowerCase()) ||
        medication.contraindications.some((c) => c.toLowerCase().includes(allergy.toLowerCase()))
    );

    // Check for drug interactions with current medications
    const potentialInteractions = patient?.currentMedications.filter((currentMed) =>
        medication.interactions.some((interaction) =>
            currentMed.toLowerCase().includes(interaction.toLowerCase())
        )
    );

    const handleConfirm = () => {
        if (potentialAllergyConflict && !showAllergyWarning) {
            setShowAllergyWarning(true);
            return;
        }
        onConfirmDispense(prescription, dispenserNotes);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">จ่ายยา</h2>
                                <p className="text-emerald-100 text-sm">
                                    ใบสั่งยา {prescription.id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    {/* Priority Badge */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-sm font-bold rounded-lg ${getPriorityColor(
                                prescription.priority
                            )}`}
                        >
                            {prescription.priority === "STAT" ? "ด่วนพิเศษ" : prescription.priority === "Urgent" ? "ด่วน" : "ปกติ"}
                        </span>
                        {medication.controlledSubstance && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-lg flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                ควบคุม {medication.scheduleClass}
                            </span>
                        )}
                    </div>

                    {/* Patient Information */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            ข้อมูลผู้ป่วย
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-blue-600">ชื่อ</p>
                                <p className="font-semibold text-blue-900">{prescription.patientName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-600">รหัสผู้ป่วย</p>
                                <p className="font-semibold text-blue-900">{prescription.patientMRN}</p>
                            </div>
                            {patient && (
                                <>
                                    <div>
                                        <p className="text-xs text-blue-600">วันเกิด</p>
                                        <p className="font-medium text-blue-800">
                                            {new Date(patient.dateOfBirth).toLocaleDateString("th-TH")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600">กรุ๊ปเลือด</p>
                                        <p className="font-medium text-blue-800">{patient.bloodType || "N/A"}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Medication Details */}
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-violet-600" />
                            รายละเอียดยา
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-xs text-violet-600">ยา</p>
                                <p className="font-semibold text-violet-900">{medication.name}</p>
                                <p className="text-sm text-violet-700">{medication.genericName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-violet-600">ขนาด</p>
                                <p className="font-medium text-violet-800">{prescription.dosage}</p>
                            </div>
                            <div>
                                <p className="text-xs text-violet-600">จำนวน</p>
                                <p className="font-medium text-violet-800">{prescription.quantity} {medication.unit}s</p>
                            </div>
                            <div>
                                <p className="text-xs text-violet-600">ความถี่</p>
                                <p className="font-medium text-violet-800">{prescription.frequency}</p>
                            </div>
                            <div>
                                <p className="text-xs text-violet-600">ระยะเวลา</p>
                                <p className="font-medium text-violet-800">{prescription.duration}</p>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-lg">
                            <p className="text-xs text-violet-600 mb-1">คำแนะนำ</p>
                            <p className="text-sm text-violet-900">{prescription.instructions}</p>
                        </div>
                    </div>

                    {/* Stock Information */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-emerald-600" />
                            คลังยา
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-emerald-600">สต็อกปัจจุบัน</p>
                                <p className="font-semibold text-emerald-900">
                                    {medication.quantity.toLocaleString()} {medication.unit}s
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600">กำลังจ่าย</p>
                                <p className="font-semibold text-emerald-900">
                                    {prescription.quantity} {medication.unit}s
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600">หลังจ่าย</p>
                                <p className="font-semibold text-emerald-900">
                                    {(medication.quantity - prescription.quantity).toLocaleString()} {medication.unit}s
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 text-sm text-emerald-700">
                            <p>แบทช์: {medication.batchNumber}</p>
                            <p>ล็อต: {medication.lotNumber}</p>
                            <p>ตำแหน่ง: {medication.location}</p>
                        </div>
                    </div>

                    {/* Allergy Warning */}
                    {potentialAllergyConflict && (
                        <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                แจ้งเตือนการแพ้ยา
                            </h3>
                            <p className="text-sm text-red-700">
                                ผู้ป่วยมีประวัติการแพ้ยาที่อาจขัดแย้งกับยานี้
                                กรุณาตรวจสอบก่อนจ่ายยา
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {patient?.allergies.map((allergy, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-lg"
                                    >
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Drug Interactions Warning */}
                    {potentialInteractions && potentialInteractions.length > 0 && (
                        <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                อาจเกิดปฏิกิริยาระหว่างยา
                            </h3>
                            <p className="text-sm text-amber-700 mb-2">
                                ยาปัจจุบันของผู้ป่วยอาจมีปฏิกิริยากับใบสั่งยานี้:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {potentialInteractions.map((med, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg"
                                    >
                                        {med}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verification Checklist */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-gray-600" />
                            รายการตรวจสอบ
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={verifyPatient}
                                    onChange={(e) => setVerifyPatient(e.target.checked)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">
                                    ยืนยันตัวตนผู้ป่วยแล้ว (ชื่อ, วันเกิด, รหัสผู้ป่วย)
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={verifyDosage}
                                    onChange={(e) => setVerifyDosage(e.target.checked)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">
                                    ตรวจสอบขนาดยาและจำนวนถูกต้องแล้ว
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={verifyAllergies}
                                    onChange={(e) => setVerifyAllergies(e.target.checked)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">
                                    ตรวจสอบประวัติแพ้ยาและข้อห้ามใช้แล้ว
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={verifyInteractions}
                                    onChange={(e) => setVerifyInteractions(e.target.checked)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">
                                    ตรวจสอบปฏิกิริยาระหว่างยาแล้ว
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Dispenser Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            บันทึกของเภสัชกร (ไม่บังคับ)
                        </label>
                        <textarea
                            value={dispenserNotes}
                            onChange={(e) => setDispenserNotes(e.target.value)}
                            placeholder="เพิ่มบันทึกเกี่ยวกับการจ่ายยานี้..."
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <Printer className="w-4 h-4" />
                            พิมพ์ฉลาก
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!allVerified}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${allVerified
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            ยืนยันจ่ายยา
                        </button>
                    </div>
                </div>

                {/* Override Warning Modal */}
                {showAllergyWarning && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-2xl p-6 max-w-md animate-scale-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">ต้องการยกเว้นการแพ้ยา</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                ผู้ป่วยมีประวัติแพ้ยาที่อาจขัดแย้งกับยานี้
                                คุณแน่ใจหรือไม่ว่าต้องการดำเนินการจ่ายยา?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAllergyWarning(false)}
                                    className="flex-1 py-3 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAllergyWarning(false);
                                        onConfirmDispense(prescription, dispenserNotes);
                                    }}
                                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    ยกเว้นและจ่ายยา
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
