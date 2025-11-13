// src/components/GoogleAds/DateRangePicker.tsx
"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { DateRangeFilter } from "@/types/google-ads";

interface DateRangePickerProps {
  onDateChange: (dateRange: DateRangeFilter) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function DateRangePicker({
  onDateChange,
  initialStartDate = "2025-01-01",
  initialEndDate = "2025-04-04",
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleApply = () => {
    onDateChange({ startDate, endDate });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">ช่วงเวลา:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">จาก:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">ถึง:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleApply}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          ใช้งาน
        </button>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date(end);
              start.setDate(end.getDate() - 7);
              setStartDate(start.toISOString().split("T")[0]);
              setEndDate(end.toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date(end);
              start.setDate(end.getDate() - 30);
              setStartDate(start.toISOString().split("T")[0]);
              setEndDate(end.toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            30 วันล่าสุด
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date(end);
              start.setDate(end.getDate() - 90);
              setStartDate(start.toISOString().split("T")[0]);
              setEndDate(end.toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            90 วันล่าสุด
          </button>
        </div>
      </div>
    </div>
  );
}
