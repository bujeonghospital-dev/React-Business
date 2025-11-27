"use client";

import { useEffect, useState } from "react";
import { Visit } from "../types/visit";

interface VisitListPanelProps {
    cn: string;
    hideHeader?: boolean;
    onRowClick?: (visit: Visit) => void;
    allowDelete?: boolean;
    onDeleteSuccess?: () => void;
    refreshSignal?: number;
}

const VisitListPanel: React.FC<VisitListPanelProps> = ({
    cn,
    hideHeader,
    onRowClick,
    allowDelete = false,
    onDeleteSuccess,
    refreshSignal,
}) => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVisits = async (signal?: AbortSignal) => {
        if (!cn) {
            setVisits([]);
            setError("cn ไม่ถูกต้อง");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/customers/${cn}/visits`, { signal });
            if (!response.ok) {
                throw new Error("ไม่สามารถโหลด Visit ได้");
            }
            const data: Visit[] = await response.json();
            setVisits(data);
        } catch (err: any) {
            if (err.name === "AbortError") {
                return;
            }
            setError(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchVisits(controller.signal);
        return () => controller.abort();
    }, [cn, refreshSignal]);

    const handleRowClick = (visit: Visit) => {
        onRowClick?.(visit);
    };

    const handleDelete = async (visit: Visit) => {
        if (!allowDelete) {
            return;
        }

        const confirmed = confirm("ยืนยันการลบ Visit นี้หรือไม่?");
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/visits/${visit.vn}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error || "ลบ Visit ไม่สำเร็จ");
            }

            setVisits((prev) => prev.filter((item) => item.vn !== visit.vn));
            onDeleteSuccess?.();
        } catch (err: any) {
            alert(err.message || "เกิดข้อผิดพลาดในการลบ Visit");
        }
    };

    return (
        <div className="space-y-3">
            {!hideHeader && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-600">
                        Visit ที่เกี่ยวข้องกับลูกค้า {cn}
                    </p>
                    <p className="text-sm text-gray-500">
                        {visits.length} รายการ
                    </p>
                </div>
            )}

            {loading && <p className="text-sm text-gray-600">กำลังโหลด Visit...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="w-full min-w-[600px] divide-y divide-gray-200 text-left text-sm">
                        <thead className="bg-gray-50 uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-4 py-3">VN</th>
                                <th className="px-4 py-3">วันที่เริ่ม</th>
                                <th className="px-4 py-3">สถานะ</th>
                                <th className="px-4 py-3">หมอ / ห้อง</th>
                                {allowDelete && <th className="px-4 py-3">จัดการ</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visits.length === 0 && (
                                <tr>
                                    <td colSpan={allowDelete ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                                        ยังไม่มี Visit สำหรับลูกค้านี้
                                    </td>
                                </tr>
                            )}
                            {visits.map((visit) => (
                                <tr
                                    key={visit.vn}
                                    className={`border-t border-gray-100 transition hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
                                    onClick={() => handleRowClick(visit)}
                                >
                                    <td className="px-4 py-3 font-medium text-blue-600">{visit.vn}</td>
                                    <td className="px-4 py-3">{visit.start_date || "-"}</td>
                                    <td className="px-4 py-3">{visit.status || "-"}</td>
                                    <td className="px-4 py-3">
                                        {visit.doctor_code || "-"} / {visit.room_code || "-"}
                                    </td>
                                    {allowDelete && (
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDelete(visit);
                                                }}
                                                className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VisitListPanel;
