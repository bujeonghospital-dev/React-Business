import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type VisitFormMode = "create" | "edit";

interface VisitFormPageProps {
    mode: VisitFormMode;
}

const VisitFormPage: React.FC<VisitFormPageProps> = ({ mode }) => {
    const params = useParams<{ cn: string; vn?: string }>();
    const cn = params.cn;
    const vn = params.vn;
    const router = useRouter();

    const [doctorCode, setDoctorCode] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [cc, setCc] = useState("");
    const [pi, setPi] = useState("");
    const [pe, setPe] = useState("");
    const [dx, setDx] = useState("");
    const [noteResult, setNoteResult] = useState("");
    const [status, setStatus] = useState("open");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (mode !== "edit" || !vn) {
            return;
        }

        const abortController = new AbortController();

        fetch(`/api/visits/${vn}`, { signal: abortController.signal })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลได้");
                }
                return res.json();
            })
            .then((data) => {
                setDoctorCode(data.doctor_code || "");
                setRoomCode(data.room_code || "");
                setStartDate(data.start_date || "");
                setEndDate(data.end_date || "");
                setCc(data.cc || "");
                setPi(data.pi || "");
                setPe(data.pe || "");
                setDx(data.dx || "");
                setNoteResult(data.note_result || "");
                setStatus(data.status || "open");
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message || "เกิดข้อผิดพลาด");
                }
            });

        return () => abortController.abort();
    }, [mode, vn]);

    const handleSave = async () => {
        if (!cn) {
            setError("CN ไม่ถูกต้อง");
            return;
        }

        setSaving(true);
        setError(null);

        const payload = {
            doctor_code: doctorCode,
            room_code: roomCode,
            start_date: startDate,
            end_date: endDate,
            cc,
            pi,
            pe,
            dx,
            note_result: noteResult,
            status,
        };

        try {
            const response = await fetch(
                mode === "create" ? `/api/customers/${cn}/visits` : `/api/visits/${vn}`,
                {
                    method: mode === "create" ? "POST" : "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.error || "ไม่สามารถบันทึกได้");
            }

            await response.json();
            router.push(`/customers/${cn}/visits`);
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {mode === "create" ? "เพิ่ม Visit" : "แก้ไข Visit"}
                </h1>
                <span className="text-sm text-gray-500">CN: {cn || "-"}</span>
            </header>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold">รหัสหมอ</span>
                    <input
                        type="text"
                        value={doctorCode}
                        onChange={(e) => setDoctorCode(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">ห้อง</span>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">เริ่ม</span>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold">จบ</span>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Chief Complaint</span>
                    <textarea
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Present Illness</span>
                    <textarea
                        value={pi}
                        onChange={(e) => setPi(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Physical Exam</span>
                    <textarea
                        value={pe}
                        onChange={(e) => setPe(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">Diagnosis</span>
                    <textarea
                        value={dx}
                        onChange={(e) => setDx(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">สรุปผลการรักษา</span>
                    <textarea
                        value={noteResult}
                        onChange={(e) => setNoteResult(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>
                <label className="block md:col-span-2">
                    <span className="text-sm font-semibold">สถานะ</span>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
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
                    className="rounded border border-gray-300 px-4 py-2"
                    onClick={() => router.back()}
                >
                    ยกเลิก
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                    {saving ? "กำลังบันทึก" : "บันทึก"}
                </button>
            </div>
        </div>
    );
};

export default VisitFormPage;
