"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CRMRecord {
  id: number;
  appointmentTime: string;
  status: string;
  appointmentDate: string;
  interestedProduct: string;
  customer_name: string;
  doctor: string;
  contact_staff: string;
  interested_product: string;
  country: string;
  phone: string;
  name: string;
  phoneNumber: string;
  proposed_amount: number;
  proposedAmount: number;
  star_flag: string;
  note: string;
  surgery_date?: string;
  consult_date?: string;
  displayDate?: string;
}

export default function CRMAdvancedPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // ดึงข้อมูลจาก API - เริ่มต้นด้วยวันนี้
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetchRecords(today, today);
  }, []);

  // โหลดข้อมูลตามเดือนที่เลือกในปฏิทิน
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchRecordsByMonth(currentMonth);
    }
  }, [currentMonth, viewMode]);

  const fetchRecords = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = "/api/crm-advanced";
      const params = new URLSearchParams();

      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch records");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsByMonth = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();

      const url = `/api/crm-advanced?month=${month}&year=${year}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch records");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      fetchRecords(startDate, endDate);
    } else if (startDate) {
      // ถ้ามีแค่วันเริ่มต้น ใช้เป็นวันเดียว
      fetchRecords(startDate, startDate);
    } else {
      // ถ้าไม่กรอกวันที่ ให้ใช้วันนี้
      const today = new Date().toISOString().split("T")[0];
      fetchRecords(today, today);
    }
  };

  const handleResetFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setSelectedDate("");
    if (viewMode === "calendar") {
      // ถ้าอยู่ในโหมดปฏิทิน ให้โหลดข้อมูลของเดือนปัจจุบัน
      fetchRecordsByMonth(currentMonth);
    } else {
      // ถ้าอยู่ในโหมดตาราง ให้โหลดข้อมูลวันนี้
      fetchRecords(today, today);
    }
  };

  const deleteRecord = (id: number) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getRecordsForDate = (dateStr: string) => {
    return records.filter((record) => {
      const surgeryDate = record.surgery_date
        ? new Date(record.surgery_date).toISOString().split("T")[0]
        : null;
      const consultDate = record.consult_date
        ? new Date(record.consult_date).toISOString().split("T")[0]
        : null;
      return surgeryDate === dateStr || consultDate === dateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setStartDate(dateStr);
    setEndDate(dateStr);
    // เรียก API ใหม่เพื่อดึงข้อมูลของวันที่เลือกตาม SQL query ที่กำหนด
    fetchRecords(dateStr, dateStr);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date().toISOString().split("T")[0];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayRecords = getRecordsForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const hasRecords = dayRecords.length > 0;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateStr)}
          className={`
            min-h-[100px] p-2 border border-white/20 cursor-pointer transition-all
            ${isToday ? "bg-blue-400/30 ring-2 ring-yellow-400" : ""}
            ${isSelected ? "bg-blue-500/40 ring-2 ring-white" : ""}
            ${hasRecords ? "bg-green-400/20" : "bg-white/5"}
            hover:bg-white/20 hover:shadow-lg
          `}
        >
          <div className="font-bold text-white text-sm mb-1">{day}</div>
          {hasRecords && (
            <div className="space-y-1">
              <div className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-bold">
                {dayRecords.length} รายการ
              </div>
              {dayRecords.slice(0, 2).map((record) => (
                <div
                  key={record.id}
                  className="text-xs bg-white/90 text-gray-800 px-2 py-1 rounded truncate"
                  title={`${record.customer_name} - ${record.status}`}
                >
                  {record.customer_name}
                </div>
              ))}
              {dayRecords.length > 2 && (
                <div className="text-xs text-white/80 font-medium">
                  +{dayRecords.length - 2} เพิ่มเติม
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-0 m-0">
      {/* Back Button */}
      <div className="px-8 py-4">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium text-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>กลับไปหน้าหลัก</span>
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="px-8 pb-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-6 py-2 rounded-lg transition-all shadow-lg font-medium flex items-center gap-2 ${
              viewMode === "table"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            แสดงแบบตาราง
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-6 py-2 rounded-lg transition-all shadow-lg font-medium flex items-center gap-2 ${
              viewMode === "calendar"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            แสดงแบบปฏิทิน
          </button>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="px-8 pb-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            กรองข้อมูลตามวันที่
          </h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-white text-sm font-medium mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-white text-sm font-medium mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDateFilter}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  ค้นหา
                </span>
              </button>
              <button
                onClick={handleResetFilter}
                className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  รีเซ็ต
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-2xl">
        <div className="max-w-full px-8 py-8">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg">
                สรุปนัดลูกค้าผ่าตัด(CRM)
              </h1>
              <p className="text-center text-blue-100 mt-1 font-medium">
                {new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <svg
                className="animate-spin h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-white font-bold text-lg">
                กำลังโหลดข้อมูล...
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-8 pb-4">
          <div className="bg-red-500/20 backdrop-blur-md border-2 border-red-400 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-white font-bold text-lg">เกิดข้อผิดพลาด</h4>
                <p className="text-red-100">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-0 mb-0 px-6 py-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📅 นัดหมายวันนี้</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.length}
          </p>
          <p className="text-blue-100 font-medium">รายการทั้งหมด</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">✅ สถานะดำเนินการ</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.filter((r) => r.status).length}
          </p>
          <p className="text-emerald-100 font-medium">รายการที่มีสถานะ</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🔔 ต้องติดตาม</h3>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {records.filter((r) => r.star_flag).length}
          </p>
          <p className="text-purple-100 font-medium">รายการที่ต้องติดตาม</p>
        </div>
      </div> */}
      {/* Main Content */}
      <div className="w-full h-full m-0 p-0">
        <div className="w-full overflow-hidden">
          {/* Calendar View */}
          {viewMode === "calendar" && (
            <div className="px-8 pb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg font-medium"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                      {currentMonth.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                      })}
                    </h2>
                    <p className="text-sm text-white/80 mt-1">
                      {records.length} รายการในเดือนนี้
                    </p>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg font-medium"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-white py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <div className="w-4 h-4 bg-green-400/40 rounded"></div>
                    <span className="text-white text-sm font-medium">
                      มีนัดหมาย
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <div className="w-4 h-4 bg-blue-400/40 ring-2 ring-yellow-400 rounded"></div>
                    <span className="text-white text-sm font-medium">
                      วันนี้
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500/40 ring-2 ring-white rounded"></div>
                    <span className="text-white text-sm font-medium">
                      วันที่เลือก
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          {viewMode === "table" && (
            <div className="overflow-x-auto w-full">
              {!loading && records.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
                    <svg
                      className="w-16 h-16 text-white/50 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="text-white font-bold text-xl mb-2">
                      ไม่พบข้อมูล
                    </h3>
                    <p className="text-white/80">
                      ไม่มีรายการนัดหมายในช่วงเวลาที่เลือก
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        เวลาที่นัด
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        สถานะ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ชื่อผู้ติดต่อ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        เบอร์โทร
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ผลิตภัณฑ์ที่สนใจ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        หมอ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ผู้ติดตาม
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ยอดนำเสนอ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ติดดาว
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white border-r border-white/20 tracking-wide">
                        ประเทศ
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-white tracking-wide">
                        หมายเหตุ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`${
                          index % 2 === 0
                            ? "bg-gradient-to-r from-slate-50 to-blue-50"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100"
                        } hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-200 transition-all duration-200`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.appointmentTime}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-bold shadow-lg transform hover:scale-105 transition-transform">
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.interested_product}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300 font-medium">
                          {record.doctor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.contact_staff}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300 text-right">
                          {record.proposed_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300 bg-gradient-to-r from-amber-100 to-yellow-100">
                          <div className="flex items-center justify-center">
                            {record.star_flag ? (
                              <svg
                                className="w-6 h-6 text-yellow-500 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.country}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                          {record.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Footer Summary */}
          {viewMode === "table" && (
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-6 border-t-4 border-indigo-600">
              <div className="flex justify-between items-center">
                <div className="text-base text-white flex items-center gap-2">
                  <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-bold">
                    📊 ทั้งหมด:
                  </span>
                  <span className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-lg">
                    {records.length} รายการ
                  </span>
                </div>
                <div className="text-base text-white flex items-center gap-2">
                  <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-bold">
                    💎 รวมยอดนำเสนอ:
                  </span>
                  <span className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold shadow-lg">
                    {records
                      .reduce((sum, r) => sum + r.proposedAmount, 0)
                      .toLocaleString()}{" "}
                    บาท
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
