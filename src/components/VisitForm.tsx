"use client";

import { useEffect, useState } from "react";
import { Visit } from "../types/visit";

export type VisitFormMode = "create" | "edit";

export interface VisitFormProps {
    mode: VisitFormMode;
    cn?: string;
    vn?: string;
    initialData?: Visit;
    onSaved?: (visit: Visit) => void;
    onCancel?: () => void;
}

interface VisitFormState {
    doctorCode: string;
    roomCode: string;
    startDate: string;
    endDate: string;
    cc: string;
    pi: string;
    pe: string;
    dx: string;
    noteResult: string;
    status: string;
}

const emptyState: VisitFormState = {
    doctorCode: "",
    roomCode: "",
    startDate: "",
    endDate: "",
    cc: "",
    pi: "",
    pe: "",
    dx: "",
    noteResult: "",
    status: "open",
};

const VisitForm: React.FC<VisitFormProps> = ({
    mode,
    cn,
    vn,
    initialData,
    onSaved,
    onCancel,
}) => {
    const [formState, setFormState] = useState<VisitFormState>(emptyState);
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resolvedCn, setResolvedCn] = useState<string | undefined>(cn);

    const applyVisit = (visit: Visit | null | undefined) => {
        if (!visit) {
            return;
        }

        setFormState({
            doctorCode: visit.doctor_code || "",
            roomCode: visit.room_code || "",
            startDate: visit.start_date || "",
            endDate: visit.end_date || "",
            cc: visit.cc || "",
            pi: visit.pi || "",
            pe: visit.pe || "",
            dx: visit.dx || "",
            noteResult: visit.note_result || "",
            status: visit.status || "open",
        });

        if (visit.cn) {
            setResolvedCn(visit.cn);
        }
    };

    useEffect(() => {
        if (mode === "edit" && vn && !initialData) {
            const controller = new AbortController();
            setLoading(true);
            setError(null);

            fetch(`/api/visits/${vn}`, { signal: controller.signal })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error("ไม่สามารถโหลดข้อมูล Visit ได้");
                    }
                    return response.json();
                })
                .then((data: Visit) => {
                    applyVisit(data);
                })
                .catch((err: any) => {
                    if (err.name !== "AbortError") {
                        setError(err.message || "เกิดข้อผิดพลาด");
                    }
                })
                .finally(() => {
                    setLoading(false);
                });

            return () => controller.abort();
        }

        if (initialData) {
            applyVisit(initialData);
            setLoading(false);
        } else if (mode === "create") {
            setFormState(emptyState);
            setLoading(false);
            if (cn) {
                setResolvedCn(cn);
            }
        }
    }, [cn, initialData, mode, vn]);

    const handleChange = (field: keyof VisitFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!resolvedCn) {
            setError("CN ไม่ถูกต้อง");
            return;
        }

        setSaving(true);
        setError(null);

        const payload = {
            doctor_code: formState.doctorCode,
            room_code: formState.roomCode,
            start_date: formState.startDate,
            end_date: formState.endDate,
            cc: formState.cc,
            pi: formState.pi,
            pe: formState.pe,
            dx: formState.dx,
            note_result: formState.noteResult,
            status: formState.status,
            cn: resolvedCn,
        };

        try {
            const response = await fetch(
                mode === "create" ? `/api/customers/${resolvedCn}/visits` : `/api/visits/${vn}`,
                {
                    method: mode === "create" ? "POST" : "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error || "ไม่สามารถบันทึก Visit ได้");
            }

            const data: Visit = await response.json();
            onSaved?.(data);
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const title = mode === "create" ? "เพิ่ม Visit" : "แก้ไข Visit";

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{title}</h2>
                <span className="text-sm text-gray-500">CN: {resolvedCn || "-"}</span>
            </header>

            {loading && <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold">รหัสหมอ</span>
                    <input
                        type="text"
                        value={formState.doctorCode}
                        onChange={(e) => handleChange("doctorCode", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">ห้อง</span>
                    <input
                        type="text"
                        value={formState.roomCode}
                        onChange={(e) => handleChange("roomCode", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">เริ่ม</span>
                    <input
                        type="datetime-local"
                        value={formState.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">จบ</span>
                    <input
                        type="datetime-local"
                        value={formState.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Chief Complaint</span>
                    <textarea
                        value={formState.cc}
                        onChange={(e) => handleChange("cc", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Present Illness</span>
                    <textarea
                        value={formState.pi}
                        onChange={(e) => handleChange("pi", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Physical Exam</span>
                    <textarea
                        value={formState.pe}
                        onChange={(e) => handleChange("pe", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Diagnosis</span>
                    <textarea
                        value={formState.dx}
                        onChange={(e) => handleChange("dx", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">สรุปผลการรักษา</span>
                    <textarea
                        value={formState.noteResult}
                        onChange={(e) => handleChange("noteResult", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">สถานะ</span>
                    <select
                        value={formState.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </label>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => onCancel?.()}
                    className="rounded border border-gray-300 px-4 py-2"
                >
                    ยกเลิก
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                    {saving ? "กำลังบันทึก" : "บันทึก"}
                </button>
            </div>
        </div>
    );
};

export default VisitForm;
