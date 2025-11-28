"use client";

import { useEffect, useState } from "react";
import { Visit } from "@/types/visit";

interface VisitListPanelProps {
    cn: string;
    onRowClick?: (visit: Visit) => void;
}

const VisitListPanel: React.FC<VisitListPanelProps> = ({ cn, onRowClick }) => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        setLoading(true);
        setError(null);

        fetch(`/api/customers/${cn}/visits`, { signal: abortController.signal })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลได้");
                }
                return res.json();
            })
            .then((data) => {
                setVisits(Array.isArray(data) ? data : data.visits || []);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message || "เกิดข้อผิดพลาด");
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => abortController.abort();
    }, [cn]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case "open":
                return (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Open
                    </span>
                );
            case "closed":
                return (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                        Closed
                    </span>
                );
            case "cancelled":
                return (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        {status || "-"}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">กำลังโหลด...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (visits.length === 0) {
        return (
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">ไม่พบข้อมูล Visit</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            VN
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            หมอ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            วันเริ่ม
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Chief Complaint
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            สถานะ
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {visits.map((visit) => (
                        <tr
                            key={visit.vn}
                            className={`${onRowClick
                                    ? "cursor-pointer hover:bg-gray-50"
                                    : ""
                                }`}
                            onClick={() => onRowClick?.(visit)}
                        >
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                {visit.vn}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {visit.doctor_name || visit.doctor_code || "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {formatDate(visit.start_date)}
                            </td>
                            <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-700">
                                {visit.cc || "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                {getStatusBadge(visit.status)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VisitListPanel;
