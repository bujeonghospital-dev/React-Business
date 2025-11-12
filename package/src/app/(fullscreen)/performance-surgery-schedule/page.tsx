"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import SurgeryDetailsModal from "./SurgeryDetailsModal";
import {
  SurgeryScheduleData,
  CONTACT_PERSON_MAPPING,
} from "@/utils/googleSheets";
import {
  fetchSurgeryScheduleFromSupabase,
  countSupabaseSurgeriesByDateAndPerson,
  countSupabaseSurgeriesByActualDateAndPerson,
} from "@/utils/supabaseFilmData";

export default function PerformanceSurgerySchedule() {
  // State for selected month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // State for surgery data
  const [surgeryData, setSurgeryData] = useState<SurgeryScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countMap, setCountMap] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  const [countMapL, setCountMapL] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSurgeries, setSelectedSurgeries] = useState<
    SurgeryScheduleData[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");
  const [selectedTableType, setSelectedTableType] = useState<"P" | "L">("P");

  // Function to load data from Supabase
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Fetch data from Supabase
      const data = await fetchSurgeryScheduleFromSupabase();
      setSurgeryData(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Update count maps when data or date changes
  useEffect(() => {
    if (surgeryData.length > 0) {
      // P table - วันที่ได้นัดผ่าตัด
      const newCountMap = countSupabaseSurgeriesByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );
      setCountMap(newCountMap);

      // L table - วันที่ผ่าตัด
      const newCountMapL = countSupabaseSurgeriesByActualDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );
      setCountMapL(newCountMapL);
    }
  }, [surgeryData, selectedMonth, selectedYear]);

  // Get number of days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month names in Thai
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // Generate year options (current year and +/- 2 years)
  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Handle cell click to open modal
  const handleCellClick = (
    day: number,
    rowId: string,
    tableType: "P" | "L"
  ) => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return;

    const personMap =
      tableType === "P"
        ? countMap.get(contactPerson)
        : countMapL.get(contactPerson);
    if (!personMap) return;

    const surgeries = personMap.get(day);
    if (!surgeries || surgeries.length === 0) return;

    setSelectedSurgeries(surgeries);
    setSelectedDate(day);
    setSelectedContactPerson(contactPerson);
    setSelectedTableType(tableType);
    setModalOpen(true);
  };

  // Get count for a specific cell
  const getCellCount = (
    day: number,
    rowId: string,
    tableType: "P" | "L"
  ): number => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return 0;

    const personMap =
      tableType === "P"
        ? countMap.get(contactPerson)
        : countMapL.get(contactPerson);
    if (!personMap) return 0;

    const surgeries = personMap.get(day);
    return surgeries ? surgeries.length : 0;
  };

  // Data for table (วันที่ได้นัดผ่า P)
  const pScheduleRows = [
    { id: "101-สา", name: "101-สา" },
    { id: "102-พิชชา", name: "102-พิชชา" },
    { id: "103-ตั้งโอ๋", name: "103-ตั้งโอ๋" },
    { id: "104-Test", name: "104-Test" },
    { id: "105-จีน", name: "105-จีน" },
    { id: "106-มุก", name: "106-มุก" },
    { id: "107-เจ", name: "107-เจ" },
    { id: "108-ว่าน", name: "108-ว่าน" },
    { id: "109-ไม่ระบุ", name: "109-ไม่ระบุ" }, // สำหรับข้อมูลที่ไม่มีผู้ติดต่อ
  ];

  return (
    <div className="surgery-schedule-container">
      <div className="schedule-header">
        <h1>Performance - นัดผ่าตัด</h1>

        {/* Calendar Controls */}
        <div className="calendar-controls">
          <button onClick={handlePreviousMonth} className="nav-button">
            ◀ เดือนก่อน
          </button>

          <div className="date-selectors">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-select"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="year-select"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year + 543} {/* Convert to Buddhist Era */}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleNextMonth} className="nav-button">
            เดือนถัดไป ▶
          </button>
        </div>

        <div className="selected-month-display">
          <strong>
            เดือน {monthNames[selectedMonth]} {selectedYear + 543}
          </strong>
          <span className="days-count"> ({daysInMonth} วัน)</span>
        </div>

        {/* Data Info and Refresh Button */}
        <div className="data-info">
          <div className="update-time">
            {lastUpdated && (
              <>
                <span className="update-label">อัพเดทล่าสุด:</span>
                <span className="update-value">
                  {lastUpdated.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </>
            )}
            {surgeryData.length > 0 && (
              <span className="data-count">
                📊 ข้อมูลทั้งหมด: {surgeryData.length} รายการ (Supabase)
              </span>
            )}
          </div>
          <button
            onClick={() => loadData(true)}
            className="refresh-button"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="refresh-spinner">⟳</span> กำลังอัพเดท...
              </>
            ) : (
              <>🔄 รีเฟรชข้อมูล</>
            )}
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>เกิดข้อผิดพลาด</h3>
            <p>{error}</p>
            <div className="error-help">
              <strong>แนะนำการแก้ไข:</strong>
              <ol>
                <li>
                  ตรวจสอบไฟล์ <code>.env.local</code> ว่ามี Supabase URL และ
                  Anon Key
                </li>
                <li>
                  ตรวจสอบว่าตาราง <code>film_data</code> มีอยู่ใน Supabase
                </li>
                <li>ตรวจสอบว่ามีข้อมูลในตาราง film_data</li>
                <li>
                  ดูคู่มือเพิ่มเติมได้ที่{" "}
                  <code>SUPABASE_SURGERY_SCHEDULE_INTEGRATION.md</code>
                </li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Table - วันที่ได้นัดผ่า P */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header">วันที่ได้นัดผ่า P</th>
                {days.map((day) => (
                  <th key={`p-day-${day}`} className="header-cell day-header">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`p-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  {days.map((day) => {
                    const count = getCellCount(day, row.id, "P");
                    return (
                      <td
                        key={`p-cell-${row.id}-${day}`}
                        className={`data-cell ${count > 0 ? "has-data" : ""}`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "P")
                        }
                        title={
                          count > 0
                            ? `คลิกเพื่อดูรายละเอียด (${count} รายการ)`
                            : ""
                        }
                      >
                        {count > 0 && (
                          <span className="count-badge">{count}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table - วันที่ผ่าตัด L */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header">วันที่ผ่าตัด L</th>
                {days.map((day) => (
                  <th key={`l-day-${day}`} className="header-cell day-header">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`l-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  {days.map((day) => {
                    const count = getCellCount(day, row.id, "L");
                    return (
                      <td
                        key={`l-cell-${row.id}-${day}`}
                        className={`data-cell ${count > 0 ? "has-data" : ""}`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "L")
                        }
                        title={
                          count > 0
                            ? `คลิกเพื่อดูรายละเอียด (${count} รายการ)`
                            : ""
                        }
                      >
                        {count > 0 && (
                          <span className="count-badge">{count}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surgery Details Modal */}
      <SurgeryDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        surgeries={selectedSurgeries}
        date={selectedDate}
        month={selectedMonth}
        year={selectedYear}
        contactPerson={selectedContactPerson}
        tableType={selectedTableType}
      />
    </div>
  );
}
