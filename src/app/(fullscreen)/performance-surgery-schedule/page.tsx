"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import SurgeryDetailsModal from "./SurgeryDetailsModal";
import {
  SurgeryScheduleData,
  CONTACT_PERSON_MAPPING,
} from "@/utils/googleSheets";
import {
  fetchSurgeryScheduleFromPythonAPI,
  countPythonApiSurgeriesByDateAndPerson,
  countPythonApiSurgeriesByActualDateAndPerson,
  calculateRevenueByDateAndPerson,
} from "@/utils/pythonApiFilmData";

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
  const [revenueMap, setRevenueMap] = useState<
    Map<string, Map<number, number>>
  >(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KPI Data State (ข้อมูล KPI ที่กำหนดเอง ไม่ได้เชื่อมกับ Google Sheets)
  // Note: kpiToDate จะถูกคำนวณอัตโนมัติจากจำนวนวันทำงานที่ผ่านมา
  const [kpiData, setKpiData] = useState<{
    [key: string]: {
      kpiMonth: number;
      kpiToDate: number;
      actual: number;
    };
  }>({
    "101-สา": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "102-พิชชา": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "103-ตั้งโอ๋": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "104-Test": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "105-จีน": { kpiMonth: 40, kpiToDate: 0, actual: 5 },
    "106-มุก": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "107-เจ": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "108-ว่าน": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "109-ไม่ระบุ": { kpiMonth: 0, kpiToDate: 0, actual: 0 },
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSurgeries, setSelectedSurgeries] = useState<
    SurgeryScheduleData[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");
  const [selectedTableType, setSelectedTableType] = useState<"P" | "L">("P");

  // Function to load data from Python API
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Fetch data from Python API (Google Sheets)
      const data = await fetchSurgeryScheduleFromPythonAPI();
      setSurgeryData(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data when component mounts
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

  // Get number of days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day is a weekday (Monday-Friday)
  const isWeekday = (day: number): boolean => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  };

  // Calculate number of weekdays (Mon-Fri) from start of month to current date
  const calculateWeekdaysToDate = (): number => {
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // If viewing a different month/year than current, return 0
    if (selectedMonth !== todayMonth || selectedYear !== todayYear) {
      return 0;
    }

    let weekdayCount = 0;
    for (let day = 1; day <= todayDate; day++) {
      if (isWeekday(day)) {
        weekdayCount++;
      }
    }
    return weekdayCount;
  };

  // Update count maps when data or date changes
  useEffect(() => {
    if (surgeryData.length > 0) {
      // P table - วันที่ได้นัดผ่าตัด (Python API)
      const newCountMap = countPythonApiSurgeriesByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      // L table - วันที่ผ่าตัด (Python API)
      const newCountMapL = countPythonApiSurgeriesByActualDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      // Revenue table - ประมาณการรายรับ (Python API)
      const newRevenueMap = calculateRevenueByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      setCountMap(newCountMap);
      setCountMapL(newCountMapL);
      setRevenueMap(newRevenueMap);
    }
  }, [surgeryData, selectedMonth, selectedYear]);

  // Update KPI To Date and Actual based on weekdays passed in current month
  useEffect(() => {
    const weekdaysToDate = calculateWeekdaysToDate();
    const totalWeekdaysInMonth = days.filter((day) => isWeekday(day)).length;

    // Update kpiToDate and actual for all rows
    setKpiData((prevData) => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach((key) => {
        // Calculate actual count - sum of all counts (total performance)
        let actualCount = 0;
        days.forEach((day) => {
          const count = getCellCount(day, key, "P");
          actualCount += count; // Sum up all the counts
        });

        if (updatedData[key].kpiMonth > 0) {
          // Calculate proportional KPI based on weekdays passed
          updatedData[key] = {
            ...updatedData[key],
            kpiToDate: Math.round(
              (updatedData[key].kpiMonth / totalWeekdaysInMonth) *
                weekdaysToDate
            ),
            actual: actualCount,
          };
        } else {
          updatedData[key] = {
            ...updatedData[key],
            actual: actualCount,
          };
        }
      });
      return updatedData;
    });
  }, [selectedMonth, selectedYear, days.length, countMap]);

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

  // Get revenue for a specific cell
  const getCellRevenue = (day: number, rowId: string): number => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return 0;

    const personMap = revenueMap.get(contactPerson);
    if (!personMap) return 0;

    return personMap.get(day) || 0;
  };

  // Calculate KPI Diff (Actual - KPI To Date)
  const calculateDiff = (rowId: string): number => {
    const data = kpiData[rowId];
    if (!data) return 0;
    return data.actual - data.kpiToDate;
  };

  // Format number as Thai currency
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "";
    return amount.toLocaleString("th-TH");
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
          {calculateWeekdaysToDate() > 0 && (
            <span className="weekdays-count">
              {" "}
              | 🗓️ วันทำงานที่ผ่านมา: {calculateWeekdaysToDate()} วัน
            </span>
          )}
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
                📊 ข้อมูลทั้งหมด: {surgeryData.length} รายการ (Python API -
                Google Sheets)
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
                  ตรวจสอบว่า Python API กำลังทำงานอยู่ (port 5000 โดย default)
                </li>
                <li>
                  รัน: <code>cd python-api && python app.py</code>
                </li>
                <li>
                  ตรวจสอบไฟล์ <code>python-api/.env</code> ว่ามี Google Sheets
                  credentials
                </li>
                <li>
                  ตรวจสอบว่า Environment variable <code>PYTHON_API_URL</code>{" "}
                  ถูกต้อง (default: http://localhost:5000)
                </li>
                <li>
                  ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Google Sheet "Film
                  data"
                </li>
                <li>
                  ดูคู่มือเพิ่มเติมได้ที่{" "}
                  <code>PYTHON_API_SURGERY_SCHEDULE_GUIDE.md</code>
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
                <th className="header-cell name-header" rowSpan={2}>
                  จำนวนที่ได้นัดผ่าตัด
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`p-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
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
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth || ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate || ""}
                  </td>
                  <td className="kpi-cell">{kpiData[row.id]?.actual || ""}</td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        const diff = calculateDiff(row.id);
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {diff.toFixed(1)}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
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
                <th className="header-cell name-header" rowSpan={2}>
                  จำนวนผ่าตัด L
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`l-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
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
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth || ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate || ""}
                  </td>
                  <td className="kpi-cell">{kpiData[row.id]?.actual || ""}</td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        const diff = calculateDiff(row.id);
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {diff.toFixed(1)}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
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

      {/* Table - ประมาณการรายรับ */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header" rowSpan={2}>
                  ประมาณการรายรับ
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`revenue-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`revenue-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth
                      ? formatCurrency(kpiData[row.id].kpiMonth * 25000)
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate > 0
                      ? formatCurrency(kpiData[row.id].kpiToDate * 25000)
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {(() => {
                      // Calculate total revenue for this row
                      let totalRevenue = 0;
                      days.forEach((day) => {
                        totalRevenue += getCellRevenue(day, row.id);
                      });
                      return totalRevenue > 0
                        ? formatCurrency(totalRevenue)
                        : "";
                    })()}
                  </td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        // Calculate total revenue for this row
                        let totalRevenue = 0;
                        days.forEach((day) => {
                          totalRevenue += getCellRevenue(day, row.id);
                        });
                        const kpiToDateAmount =
                          kpiData[row.id].kpiToDate * 25000;
                        const diff = totalRevenue - kpiToDateAmount;
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {formatCurrency(diff)}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
                  {days.map((day) => {
                    const revenue = getCellRevenue(day, row.id);
                    const count = getCellCount(day, row.id, "P");
                    return (
                      <td
                        key={`revenue-cell-${row.id}-${day}`}
                        className={`data-cell ${
                          revenue > 0 ? "has-data revenue-cell" : ""
                        }`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "P")
                        }
                        title={
                          revenue > 0
                            ? `คลิกเพื่อดูรายละเอียด\nยอดรวม: ${formatCurrency(
                                revenue
                              )} บาท\nจำนวน: ${count} รายการ`
                            : ""
                        }
                      >
                        {revenue > 0 && (
                          <span className="revenue-badge">
                            {formatCurrency(revenue)}
                          </span>
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
