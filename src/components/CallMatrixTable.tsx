"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Calendar, Phone, TrendingUp } from "lucide-react";

interface AgentCallData {
  outgoing_calls: number;
  incoming_calls: number;
  successful_calls: number;
  total_duration_seconds: number;
  agent_name?: string;
}

interface CallMatrixRow {
  hour_slot: string;
  [key: string]: AgentCallData | string;
}

const CallMatrixTable = () => {
  const [matrixData, setMatrixData] = useState<CallMatrixRow[]>([]);
  const [totalsData, setTotalsData] = useState<CallMatrixRow | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  const agentIds = ["101", "102", "103", "104", "105", "106", "107", "108"];
  const agentNames: { [key: string]: string } = {
    "101": "สา",
    "102": "พัดชา",
    "103": "ตั้งโอ๋",
    "104": "Test",
    "105": "จีน",
    "106": "มุก",
    "107": "เจ",
    "108": "ว่าน",
  };

  useEffect(() => {
    fetchCallMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchCallMatrix = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/call-matrix?date=${selectedDate}`);
      const result = await response.json();

      if (result.success) {
        setMatrixData(result.tableData);
        setTotalsData(result.totals);
      } else {
        console.error("Failed to fetch call matrix:", result.error);
      }
    } catch (error) {
      console.error("Error fetching call matrix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellValue = (row: CallMatrixRow, agentId: string): number => {
    const data = row[`agent_${agentId}`] as AgentCallData;
    return data?.outgoing_calls || 0;
  };

  const getCellColor = (value: number): string => {
    if (value === 0) return "bg-gray-50";
    if (value <= 2) return "bg-blue-100";
    if (value <= 5) return "bg-green-100";
    if (value <= 10) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Phone className="w-7 h-7" />
            ตารางสรุปการโทรออก (Call Matrix)
          </h2>
          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <Calendar className="w-5 h-5 text-white" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              />
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCallMatrix}
              disabled={isLoading}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </motion.button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <th className="px-4 py-3 text-left font-bold text-sm border border-purple-400">
                  เวลา
                </th>
                {agentIds.map((agentId) => (
                  <th
                    key={agentId}
                    className="px-4 py-3 text-center font-bold text-sm border border-purple-400"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{agentId}</span>
                      <span className="text-xs font-normal opacity-90">
                        {agentNames[agentId]}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-sm border border-purple-400">
                  รวม/ชั่วโมง
                </th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, rowIndex) => {
                const hourTotal = agentIds.reduce(
                  (sum, agentId) => sum + getCellValue(row, agentId),
                  0
                );

                return (
                  <motion.tr
                    key={row.hour_slot}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    {/* Hour Slot */}
                    <td className="px-4 py-3 font-semibold text-gray-800 border border-gray-200 whitespace-nowrap">
                      {row.hour_slot}:00 น.
                    </td>

                    {/* Agent Cells */}
                    {agentIds.map((agentId) => {
                      const value = getCellValue(row, agentId);
                      const cellColor = getCellColor(value);

                      return (
                        <td
                          key={agentId}
                          className={`px-4 py-3 text-center border border-gray-200 ${cellColor} transition-all`}
                        >
                          <span
                            className={`text-lg font-bold ${
                              value > 0 ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {value}
                          </span>
                        </td>
                      );
                    })}

                    {/* Hour Total */}
                    <td className="px-4 py-3 text-center font-bold text-purple-700 bg-purple-100 border border-gray-200">
                      {hourTotal}
                    </td>
                  </motion.tr>
                );
              })}

              {/* Totals Row */}
              {totalsData && (
                <tr className="bg-gradient-to-r from-purple-100 to-pink-100 font-bold">
                  <td className="px-4 py-3 text-purple-800 border border-gray-200">
                    รวมทั้งหมด
                  </td>
                  {agentIds.map((agentId) => {
                    const data = totalsData[
                      `agent_${agentId}`
                    ] as AgentCallData;
                    const value = data?.outgoing_calls || 0;

                    return (
                      <td
                        key={agentId}
                        className="px-4 py-3 text-center text-purple-800 border border-gray-200"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl">{value}</span>
                          <span className="text-xs text-gray-600">สาย</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-purple-800 border border-gray-200">
                    <div className="flex flex-col items-center">
                      <span className="text-xl">
                        {agentIds.reduce((sum, agentId) => {
                          const data = totalsData[
                            `agent_${agentId}`
                          ] as AgentCallData;
                          return sum + (data?.outgoing_calls || 0);
                        }, 0)}
                      </span>
                      <span className="text-xs text-gray-600">สาย</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">สีแสดงความหมาย:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-50 border border-gray-300 rounded"></div>
              <span className="text-gray-600">0 สาย</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-600">1-2 สาย</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">3-5 สาย</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-gray-600">6-10 สาย</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-gray-600">10+ สาย</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>
              วันที่: {new Date(selectedDate).toLocaleDateString("th-TH")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallMatrixTable;
